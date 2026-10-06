/* HOME COMING — setup page logic. External on purpose: the Content-Security-Policy
   in _headers forbids inline scripts, so this cannot live inside setup.html. */

(function () {
  'use strict';
  var C = window.WEDDING;
  var cfg = function (p) { return p.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, C); };
  var set = function (v) { return typeof v === 'string' && v.indexOf('{{') !== -1 ? null : v; };

  var key  = set(cfg('supabase.anonKey'));
  var inbx = set(cfg('inbox.accessKey'));

  var states = [
    { on: !!inbx, label: inbx ? 'Inbox on' : 'Inbox off' },
    { on: !!key,  label: key  ? 'Database on' : 'Database off' },
  ];
  document.getElementById('stState').innerHTML = states.map(function (s) {
    return '<li class="' + (s.on ? 'is-on' : 'is-off') + '">' + s.label + '</li>';
  }).join('');

  if (!inbx && !key) {
    document.getElementById('d1').classList.add('warn');
    document.getElementById('d1').open = true;
  }
  if (key && !inbx) {
    document.getElementById('stIntro').textContent =
      'The private panel is connected. Step 1 is optional — it is just a safety copy in your inbox.';
  } else if (inbx && !key) {
    document.getElementById('stIntro').textContent =
      'Blessings are arriving in your inbox. Step 2 is optional — it adds the private panel.';
  }

  var foot = document.getElementById('stFoot');
  if (inbx && key) {
    foot.innerHTML = 'Everything is on. <a href="index.html" style="color:var(--gold-400)">Go and check the page</a> &mdash; and remember to set <b>needsSetup: false</b> in config.js to hide the amber bar.';
  } else {
    foot.innerHTML = 'Nothing to undo at any point. Do step 1 and you are done.';
  }

  /* --------------------------------------------------------------------
     Live checks against the real project, so this page tells you what is
     actually wrong rather than listing everything at once.
     ------------------------------------------------------------------ */
  var checks = document.getElementById('stChecks');
  if (!key) {
    checks.innerHTML = '<li class="wait"><span class="b">—</span><span>Add the anon key in config.js and these three checks will run by themselves.</span></li>';
    return;
  }

  var base = String(cfg('supabase.url')).replace(/\/+$/, '');
  var H = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  var done = 0;
  function paint() {
    var total = 3;
    if (done < total) return;
    var items = checks.children;
    var bad = 0;
    for (var i = 0; i < items.length; i++) if (items[i].className === 'fail') bad++;
    if (bad === 0) {
      foot.innerHTML = 'Everything is checked and working. ' +
        '<a href="index.html" style="color:var(--gold-400)">Go and look at the page</a>, ' +
        'then set <b>needsSetup: false</b> in config.js.';
    }
  }
  function row(state, label, detail) {
    var li = document.createElement('li');
    li.className = state;
    li.innerHTML = '<span class="b">' + (state === 'pass' ? 'Done' : state === 'fail' ? 'To do' : '&#8212;') +
      '</span><span><b>' + label + '</b><span class="fix">' + detail + '</span></span>';
    checks.appendChild(li);
  }

  /* 1 — is the table there? */
  fetch(base + '/rest/v1/blessings?select=id&limit=1', { headers: H })
    .then(function (r) { return { s: r.status, b: r.text() }; })
    .then(function (r) {
      if (r.s === 200) {
        row('pass', 'The blessings table exists',
            'Supabase will store every message. Nothing to do.');
      } else if (r.s === 401 || r.s === 403) {
        row('pass', 'The blessings table exists',
            'It is sealed — the public key cannot read it. That is correct.');
      } else if (/PGRST205|Could not find the table/i.test(r.b)) {
        row('fail', 'The blessings table does not exist yet',
            'Open <b>supabase-schema.sql</b>, paste it into Supabase &rarr; SQL Editor &rarr; New query, press Run.');
      } else {
        row('wait', 'Could not check the table', 'Status ' + r.s + '. Try again in a moment.');
      }
      done++; paint();
    })
    .catch(function () { row('wait', 'Could not reach the project', 'Check your internet and reload.'); done++; paint(); });

  /* 2 — is signup still open? This is the one that matters. */
  fetch(base + '/auth/v1/settings', { headers: { apikey: key } })
    .then(function (r) { return r.json(); })
    .then(function (s) {
      if (s.disable_signup === true) {
        row('pass', 'Public signups are turned off',
            'Nobody can make themselves an account, so the blessings really are private.');
      } else {
        row('fail', 'Public signups are still ON — the blessings are readable by anyone',
            'Supabase &rarr; Authentication &rarr; Providers &rarr; Email, then untick ' +
            '<b>Enable email signup</b>. One tick. This is the step that makes it private.');
      }
      done++; paint();
    })
    .catch(function () { row('wait', 'Could not read the auth settings', 'Reload to try again.'); done++; paint(); });

  /* 3 — the public counter */
  fetch(base + '/rest/v1/rpc/blessing_count', { method: 'POST', headers: H, body: '{}' })
    .then(function (r) { return { s: r.status, b: r.text() }; })
    .then(function (r) {
      if (r.s === 200) {
        row('pass', 'The blessing counter works', 'The number on the page is real: ' + r.b + ' so far.');
      } else {
        row('fail', 'The counter function is missing',
            'It comes with the same SQL script as the table. Run supabase-schema.sql.');
      }
      done++; paint();
    })
    .catch(function () { row('wait', 'Could not check the counter', ''); done++; paint(); });
})();