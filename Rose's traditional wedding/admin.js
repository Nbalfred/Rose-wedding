/* =============================================================================
   HOME COMING — admin.js
   The private side. Sign in with the email address the family set up in
   Supabase. Reads, searches, marks, hides, deletes and exports every blessing.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.WEDDING;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function cfg(path) {
    return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, C);
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function el(t, c, h) { var n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; }

  var sb = null, ROWS = [], USER = null, LOADING = false;

  /* ------------------------------------------------------------- setup */
  function connected() {
    var s = cfg('supabase');
    if (!s || !s.url || !s.anonKey) return false;
    /* Both must be real values — a "{{...}}" placeholder is a truthy string. */
    return s.url.indexOf('{{') === -1 && s.anonKey.indexOf('{{') === -1;
  }

  function showNotConnected() {
    $('#loginView').hidden = false;
    var m = $('#loginMsg');
    m.className = 'a-msg a-msg--warn is-on';
    m.innerHTML = 'The database is not connected yet, so there is nothing to sign in to.<br><br>' +
      'Open <b>config.js</b> and replace the two values marked <b>{{SUPABASE_URL}}</b> and ' +
      '<b>{{SUPABASE_ANON_KEY}}</b>. The steps are in <b>README.md</b>, section 2.<br><br>' +
      '<span style="opacity:0.7">While you wait, you can still write blessings from the ' +
      'front page — they will be saved in this browser so you can see how it looks.</span>';
  }

  async function getClient() {
    if (sb) return sb;
    if (!connected()) return null;
    var mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    sb = mod.createClient(cfg('supabase.url'), cfg('supabase.anonKey'), {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'hc.admin.session' },
    });
    return sb;
  }

  /* ------------------------------------------------------------- login */
  function wireLogin() {
    var form = $('#loginForm'), msg = $('#loginMsg'), btn = $('#loginBtn');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var em = $('#email').value.trim(), pw = $('#password').value;
      if (!em || !pw) return;

      btn.disabled = true; btn.textContent = 'Signing in…';
      msg.className = 'a-msg';

      var client;
      try {
        client = await getClient();
      } catch (err) {
        msg.className = 'a-msg a-msg--bad is-on';
        msg.textContent = 'Could not reach the server. Check your connection.';
        btn.disabled = false; btn.textContent = 'Sign in';
        return;
      }

      if (!client) {
        btn.disabled = false; btn.textContent = 'Sign in';
        showNotConnected();
        return;
      }

      var r = await client.auth.signInWithPassword({ email: em, password: pw });
      btn.disabled = false; btn.textContent = 'Sign in';

      if (r.error) {
        msg.className = 'a-msg a-msg--bad is-on';
        msg.textContent = r.error.message === 'Invalid login credentials'
          ? 'That email and password do not match.'
          : r.error.message;
        return;
      }
      msg.className = 'a-msg';
      enterApp(r.data.user);
    });
  }

  function enterApp(user) {
    USER = user;
    $('#loginView').hidden = true;
    $('#dashView').hidden = false;
    $('#whoAmI').textContent = 'Signed in as ' + (user.email || '');
    $('#dashNames').textContent = (cfg('bride.full') || 'Rose') + ' & ' + (cfg('groom.first') || '');
    load();
  }

  /* -------------------------------------------------------------- load */
  async function load() {
    if (LOADING) return;
    LOADING = true;
    var client = await getClient();
    if (!client) { showNotConnected(); LOADING = false; return; }

    var r = await client.from('blessings').select('*').order('created_at', { ascending: false });
    LOADING = false;
    if (r.error) {
      var list = $('#list');
      list.innerHTML = '<div class="a-empty">Could not read the blessings.<br><span style="font-size:0.8rem">' +
        esc(r.error.message) + '</span></div>';
      return;
    }
    ROWS = r.data || [];
    fillSideFilter();
    paint();
  }

  function fillSideFilter() {
    var sel = $('#filterSide'), keep = sel.value;
    var used = {};
    ROWS.forEach(function (r) { if (r.side) used[r.side] = true; });
    sel.innerHTML = '<option value="">Every side</option>';
    (cfg('sides') || []).forEach(function (s) {
      if (!used[s.value]) return;
      var o = document.createElement('option');
      o.value = s.value;
      o.textContent = s.label + ' (' + ROWS.filter(function (r) { return r.side === s.value; }).length + ')';
      sel.appendChild(o);
    });
    sel.value = keep;
  }

  function sideLabel(v) {
    var s = (cfg('sides') || []).find(function (x) { return x.value === v; });
    return s ? s.label : (v || '');
  }

  /* ------------------------------------------------------------- paint */
  function paint() {
    var q = ($('#search').value || '').trim().toLowerCase();
    var side = $('#filterSide').value;
    var status = $('#filterStatus').value;

    var rows = ROWS.filter(function (r) {
      if (side && r.side !== side) return false;
      if (status === 'unread' && r.is_read) return false;
      if (status === 'read' && !r.is_read) return false;
      if (status === 'hidden' && !r.is_hidden) return false;
      if (!q) return true;
      return [r.full_name, r.message, r.town, r.country, r.phone, r.email, r.guest_of, r.reference, sideLabel(r.side)]
        .join(' ').toLowerCase().indexOf(q) !== -1;
    });

    paintStats();

    var list = $('#list');
    list.innerHTML = '';

    if (!rows.length) {
      list.appendChild(el('div', 'a-empty',
        ROWS.length
          ? 'Nothing matches that.'
          : 'No blessings yet. Share the page and they will start arriving here.'));
      return;
    }

    rows.forEach(function (r) { list.appendChild(row(r)); });
  }

  function paintStats() {
    var total = ROWS.length;
    var unread = ROWS.filter(function (r) { return !r.is_read; }).length;
    var week = ROWS.filter(function (r) {
      return (Date.now() - new Date(r.created_at).getTime()) < 7 * 864e5;
    }).length;
    var abroad = ROWS.filter(function (r) {
      return r.country && r.country !== 'Nigeria';
    }).length;
    var hidden = ROWS.filter(function (r) { return r.is_hidden; }).length;

    var cells = [
      { n: total, l: 'Blessings in total', gold: true },
      { n: unread, l: 'Not yet read' },
      { n: week, l: 'In the last 7 days' },
      { n: abroad, l: 'From outside Nigeria' },
      { n: hidden, l: 'Hidden' },
    ];

    $('#stats').innerHTML = cells.map(function (c) {
      return '<div class="a-stat' + (c.gold ? ' a-stat--gold' : '') + '"><b>' + (c.n || 0) + '</b><span>' + c.l + '</span></div>';
    }).join('');
  }

  function row(r) {
    var n = el('article', 'a-row' + (r.is_read ? '' : ' is-unread') + (r.is_hidden ? ' is-hidden' : ''));
    n.id = 'row-' + r.id;

    var when = new Date(r.created_at);
    var place = [r.town, r.country].filter(Boolean).join(', ');

    var head = el('button', 'a-row__head');
    head.type = 'button';
    head.setAttribute('aria-expanded', 'false');
    head.innerHTML =
      '<span>' +
        '<span class="a-row__name">' + esc(r.full_name) + '</span>' +
        '<span class="a-row__meta">' + esc(sideLabel(r.side)) +
          (r.side === 'other' && r.side_other ? ' &middot; ' + esc(r.side_other) : '') +
          (place ? ' &middot; ' + esc(place) : '') +
          (r.reference ? ' &middot; ' + esc(r.reference) : '') +
          (r.is_hidden ? ' &middot; hidden' : '') +
        '</span>' +
      '</span>' +
      '<span class="a-row__when">' + esc(when.toLocaleDateString()) + '<br>' + esc(when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) + '</span>';

    var body = el('div', 'a-row__body');
    body.innerHTML =
      '<div class="a-row__msg">' + esc(r.message) + '</div>' +
      '<div class="a-contact">' +
        row1('Phone', r.phone) +
        row1('Email', r.email) +
        row1('Guest of', r.guest_of) +
        row1('Reference', r.reference) +
      '</div>' +
      '<div class="a-row__acts">' +
        '<button class="a-btn" data-act="read">' + (r.is_read ? 'Mark unread' : 'Mark read') + '</button>' +
        '<button class="a-btn" data-act="hide">' + (r.is_hidden ? 'Unhide' : 'Hide') + '</button>' +
        '<button class="a-btn a-btn--danger" data-act="del">Delete</button>' +
      '</div>';

    head.addEventListener('click', function () {
      var open = n.classList.toggle('is-open');
      head.setAttribute('aria-expanded', String(open));
      if (open && !r.is_read) patch(r.id, { is_read: true });
    });

    body.addEventListener('click', async function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var act = b.getAttribute('data-act');

      if (act === 'read') {
        var v = !r.is_read;
        r.is_read = v;
        patch(r.id, { is_read: v });
        paint();
        n.classList.toggle('is-open', true);
        head.setAttribute('aria-expanded', 'true');
      }

      if (act === 'hide') {
        var h = !r.is_hidden;
        r.is_hidden = h;
        patch(r.id, { is_hidden: h });
        paint();
      }

      if (act === 'del') {
        if (!confirm('Delete the blessing from ' + r.full_name + '?\n\nThis cannot be undone.')) return;
        b.disabled = true; b.textContent = 'Deleting…';
        await remove(r.id);
        ROWS = ROWS.filter(function (x) { return x.id !== r.id; });
        fillSideFilter();
        paint();
      }
    });

    n.appendChild(head);
    n.appendChild(body);
    return n;
  }

  function row1(label, val) {
    return '<div><b>' + esc(label) + ':</b> <span>' + (val ? esc(val) : '&mdash;') + '</span></div>';
  }

  /* -------------------------------------------------------- mutations */
  async function patch(id, data) {
    var client = await getClient();
    if (!client) return;
    var r = await client.from('blessings').update(data).eq('id', id);
    if (r.error) alert('Could not save that change:\n\n' + r.error.message);
  }

  async function remove(id) {
    var client = await getClient();
    if (!client) return;
    var r = await client.from('blessings').delete().eq('id', id);
    if (r.error) alert('Could not delete that:\n\n' + r.error.message);
  }

  /* ----------------------------------------------------------- export */
  function exportCSV() {
    if (!ROWS.length) { alert('There is nothing to export yet.'); return; }

    var head = ['Name', 'Side', 'Town', 'Country', 'Phone', 'Email', 'Guest of', 'Message', 'Reference', 'Date', 'Read', 'Hidden'];
    var lines = [head.join(',')];

    ROWS.forEach(function (r) {
      lines.push([
        r.full_name, sideLabel(r.side), r.town, r.country, r.phone, r.email, r.guest_of,
        r.message, r.reference,
        new Date(r.created_at).toLocaleString(),
        r.is_read ? 'yes' : 'no', r.is_hidden ? 'yes' : 'no',
      ].map(function (v) {
        return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
      }).join(','));
    });

    /* BOM so Excel opens the accents properly */
    var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'rose-blessings-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* ------------------------------------------------------------- wire */
  function wireDash() {
    $('#search').addEventListener('input', paint);
    $('#filterSide').addEventListener('change', paint);
    $('#filterStatus').addEventListener('change', paint);
    $('#exportBtn').addEventListener('click', exportCSV);

    $('#markAll').addEventListener('click', async function () {
      if (!ROWS.length) return;
      var un = ROWS.filter(function (r) { return !r.is_read; });
      if (!un.length) { alert('Everything is already marked as read.'); return; }
      if (!confirm('Mark all ' + un.length + ' blessings as read?')) return;

      var client = await getClient();
      if (!client) return;
      this.disabled = true; this.textContent = 'Marking…';
      var r = await client.from('blessings').update({ is_read: true }).eq('is_read', false);
      this.disabled = false; this.textContent = 'Mark all read';
      if (r.error) { alert('Could not mark them read:\n\n' + r.error.message); return; }
      un.forEach(function (x) { x.is_read = true; });
      paint();
    });

    $('#signOut').addEventListener('click', async function () {
      var client = await getClient();
      if (client) await client.auth.signOut();
      location.reload();
    });
  }

  /* -------------------------------------------------------------- boot */
  async function boot() {
    if (!C) { document.body.innerHTML = '<p style="padding:2rem;color:#E8E4DA">config.js did not load.</p>'; return; }

    wireLogin();
    wireDash();

    if (!connected()) { showNotConnected(); return; }

    var client;
    try {
      client = await getClient();
    } catch (err) {
      showNotConnected();
      return;
    }

    var r = await client.auth.getSession();
    if (r.data && r.data.session) {
      enterApp(r.data.user);
    } else {
      $('#loginView').hidden = false;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
