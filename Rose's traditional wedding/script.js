/* =============================================================================
   HOME COMING — script.js
   Reads everything from config.js. If you are only changing names, dates,
   times and photos, you never need to open this file.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.WEDDING;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Look up "bride.full" inside the config object. */
  function cfg(path) {
    return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, C);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* A value the family has not filled in yet.
     Returns null for anything still holding a {{PLACEHOLDER}}, so that raw
     markup can never be shown to a guest. Every renderer routes text through
     this, and bails or falls back when it gets null. */
  function filled(v) {
    return (typeof v === 'string' && v.indexOf('{{') !== -1) ? null : v;
  }

  /* ==================================================== SETUP BAR ======= */
  function findPlaceholders() {
    var found = [];
    (function walk(o, path) {
      if (typeof o === 'string') {
        if (o.indexOf('{{') !== -1) found.push(path);
      } else if (o && typeof o === 'object') {
        Object.keys(o).forEach(function (k) { walk(o[k], path ? path + '.' + k : k); });
      }
    })(C, '');
    return found;
  }

  /* Is this path one the site can happily do without? */
  function isOptional(path) {
    return (C.optional || []).some(function (p) {
      return path === p || path.indexOf(p + '.') === 0 || path.indexOf(p + '[') === 0;
    });
  }

  function setupBar() {
    var bar = $('#setupBar');
    if (!bar) return;
    var all = findPlaceholders();
    var need = all.filter(function (p) { return !isOptional(p); });
    var nice = all.filter(isOptional);

    if (!C.needsSetup && !all.length) { bar.hidden = true; return; }

    var t = $('#setupText');
    var route = delivery();
    var headline;

    if (route === 'local') {
      headline = '<b>Blessings are not being sent anywhere yet.</b> ' +
        '<a href="setup.html">Finish the setup</a> &mdash; about two minutes.';
    } else if (route === 'inbox') {
      headline = 'Blessings are being emailed to you.' +
        (need.length ? ' The private panel is not connected yet.' : '');
    } else {
      headline = need.length ? '' : '<b>Everything is connected.</b>';
    }

    if (need.length) {
      t.innerHTML = headline + ' <b>' + need.length + '</b> detail' +
        (need.length === 1 ? '' : 's') + ' still to fill in &mdash; open <b>config.js</b> ' +
        'and search for <b>{{</b>' +
        (nice.length ? ' <i style="opacity:.7">(' + nice.length + ' optional too)</i>' : '') +
        ' <a href="setup.html" data-setup>finish setup</a> <a href="#" data-list>see them</a>';
      bar.classList.remove('setup--clear');
    } else {
      t.innerHTML = (headline || '<b>Everything the page needs is filled in.</b>') +
        (nice.length ? ' <i style="opacity:.7">' + nice.length +
          ' optional detail' + (nice.length === 1 ? '' : 's') +
          ' still blank &mdash; those lines simply stay hidden.</i>' : '') +
        ' Set <b>needsSetup: false</b> to remove this bar.';
      bar.classList.add('setup--clear');
    }

    bar.hidden = false;
    $('#setupHide').addEventListener('click', function () { bar.hidden = true; });

    /* one delegated listener, so nothing here can break the rest of boot() */
    bar.addEventListener('click', function (e) {
      if (e.target.closest('[data-list]')) {
        e.preventDefault();
        alert('Still to fill in, in config.js:\n\n' +
          'NEEDED:\n  ' + (need.join('\n  ') || '— none —') +
          '\n\nOPTIONAL (blank = line is just hidden):\n  ' + (nice.join('\n  ') || '— none —'));
        return;
      }
      var s = e.target.closest('[data-setup]');
      if (s) { e.preventDefault(); location.href = 'setup.html'; }
    });
  }

  /* ==================================================== HERO ========== */
  function renderHero() {
    var host = $('#heroSlides');
    if (!host) return;
    var slides = cfg('hero.slides') || [];
    host.innerHTML = '';
    slides.forEach(function (s) {
      var d = el('div', 'hero__slide' + (s.src ? '' : ' is-placeholder'));
      if (s.src) d.style.backgroundImage = 'url("' + esc(s.src) + '")';
      host.appendChild(d);
    });
    /* no photographs configured: keep the gradient so the opening never
       becomes an empty green box */
    if (!slides.length) {
      for (var i = 0; i < 3; i++) host.appendChild(el('div', 'hero__slide is-placeholder'));
    }
  }

  /* ==================================================== BIND TEXT ======= */
  function bindText() {
    $$('[data-bind]').forEach(function (n) {
      var v = filled(cfg(n.getAttribute('data-bind')));
      /* If it is not filled in, leave the sensible fallback already in the HTML. */
      if (typeof v === 'string' && v) n.innerHTML = esc(v).replace(/&amp;([a-z]+);/g, '&$1;');
    });
    var gf = filled(cfg('groom.full'));
    document.title = 'Homecoming — ' + (cfg('bride.full') || 'Rose') +
                     (gf ? ' & ' + gf : '') + ' · ' + (cfg('date.day') + ' ' + cfg('date.month') + ' ' + cfg('date.year'));
  }

  /* The document title, description and share image cannot be updated by
     JavaScript in any way a crawler or WhatsApp would notice — they are read
     from the file before the page runs. So they are patched here and written
     back as a comment you can copy over, which is the only way to keep them
     honest after a name or date change. */
  function reportMeta() {
    var m = [
      '<title>Homecoming — ' + cfg('bride.full') +
        (cfg('groom.full') ? ' &amp; ' + cfg('groom.full') : '') +
        ' · ' + cfg('date.day') + ' ' + cfg('date.month') + ' ' + cfg('date.year') + '</title>',
      '<meta name="description" content="The traditional wedding of ' + cfg('bride.full') +
        ' and ' + cfg('groom.full') + ' — ' + cfg('place.village') + ', ' + cfg('place.heritage') +
        ', ' + cfg('place.state') + ', ' + cfg('place.country') + '. ' + cfg('date.day') + ' ' +
        cfg('date.month') + ' ' + cfg('date.year') + '. Leave them a sealed blessing.">',
      '<meta property="og:title" content="Homecoming — ' + cfg('bride.full') +
        (cfg('groom.full') ? ' &amp; ' + cfg('groom.full') : '') + '">',
      '<meta property="og:description" content="' + cfg('date.day') + ' ' + cfg('date.month') + ' ' +
        cfg('date.year') + ' · ' + cfg('place.village') + ', ' + cfg('place.heritage') + '. Leave them a sealed blessing.">',
    ];
    console.log('%cMETA — copy these four lines into the <head> of Index.html:',
      'color:#C9A227;font-weight:bold', '\n' + m.join('\n'));
  }

  /* ================================================ DAYS MARRIED ======= */
  function startCounter() {
    var start = new Date(C.date.iso);
    var daysEl = $('#daysMarried');
    var cells = { d: $('[data-tick="d"]'), h: $('[data-tick="h"]'), m: $('[data-tick="m"]'), s: $('[data-tick="s"]') };
    if (isNaN(start)) return;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function tick() {
      var diff = Date.now() - start.getTime();
      if (diff < 0) diff = 0;
      var secs = Math.floor(diff / 1000);
      var d = Math.floor(secs / 86400);
      var h = Math.floor(secs % 86400 / 3600);
      var m = Math.floor(secs % 3600 / 60);
      var s = secs % 60;

      if (daysEl) daysEl.textContent = d.toLocaleString();
      if (cells.d) cells.d.textContent = d.toLocaleString();
      if (cells.h) cells.h.textContent = pad(h);
      if (cells.m) cells.m.textContent = pad(m);
      if (cells.s) cells.s.textContent = pad(s);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ==================================================== JOURNEY ======== */
  function renderJourney() {
    var box = $('#journeyText');
    if (!box) return;
    box.innerHTML = '';
    (cfg('journey.story') || []).forEach(function (p) {
      var n = el('p', null, esc(p));
      box.appendChild(n);
    });
  }

  /* ==================================================== NAMES ========= */
  function renderNames() {
    var box = $('#namesPair');
    if (!box) return;

    function card(who) {
      var n = el('article', 'name-card');
      /* Only show a line if it is actually filled in — never leak "{{ }}" to a guest. */
      var note = (who.note && who.note.indexOf('{{') === -1)
        ? '<p class="name-card__note">' + esc(who.note) + '</p>' : '';
      n.innerHTML =
        '<span class="name-card__given">' + (who.given || 'The bride') + '</span>' +
        '<h3 class="name-card__name">' + esc(who.name) + '</h3>' +
        '<p class="name-card__full">' + esc(who.full) + '</p>' +
        '<p class="name-card__meaning">' + esc(who.meaning) + '</p>' + note;
      return n;
    }

    box.appendChild(card({ given: 'The bride', name: cfg('bride.first'), full: cfg('bride.full'), meaning: cfg('bride.meaning') }));
    box.appendChild(el('span', 'names__join', '&amp;'));
    box.appendChild(card({ given: 'The groom', name: cfg('groom.first'), full: cfg('groom.full'),
                           meaning: cfg('groom.meaning'), note: cfg('groom.familyNote') }));
  }

  /* ==================================================== TIMELINE ====== */
  function renderTimeline() {
    var box = $('#timeline');
    if (!box) return;
    (cfg('programme') || []).forEach(function (p) {
      var li = el('li', 'tl-item reveal');
      li.innerHTML =
        '<span class="tl-time">' + esc(p.time) + '</span>' +
        '<h3 class="tl-title">' + esc(p.title) + '</h3>' +
        '<p class="tl-text">' + esc(p.text) + '</p>';
      box.appendChild(li);
    });
  }

  /* ==================================================== CUSTOMS ====== */
  function renderCustoms() {
    var box = $('#customs');
    if (!box) return;
    (cfg('customs') || []).forEach(function (c, i) {
      var n = el('article', 'custom');
      n.innerHTML =
        '<span class="custom__n">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<h3>' + esc(c.title) + '</h3>' +
        '<p>' + esc(c.text) + '</p>';
      box.appendChild(n);
    });
  }

  /* ==================================================== PALETTE ======= */
  function renderPalette() {
    var box = $('#palette');
    if (!box) return;
    (cfg('palette') || []).forEach(function (p) {
      var n = el('article', 'swatch');
      n.innerHTML =
        '<div class="swatch__chip" style="background:' + esc(p.hex) + '"></div>' +
        '<div class="swatch__body">' +
          '<p class="swatch__name">' + esc(p.name) + '</p>' +
          '<span class="swatch__hex">' + esc(p.hex.toUpperCase()) + '</span>' +
          '<p class="swatch__note">' + esc(p.note) + '</p>' +
        '</div>';
      box.appendChild(n);
    });
  }

  /* ==================================================== GALLERY ======= */
  var slides = [];

  function renderGallery() {
    var box = $('#gallery');
    if (!box) return;
    slides = cfg('gallery') || [];

    slides.forEach(function (g, i) {
      var fig = el('figure', 'shot reveal');
      var alt = filled(g.alt) || ('Photograph ' + (i + 1) + ' from the day');
      var cap = filled(g.caption) || alt;
      var inner;

      if (g.src) {
        inner = '<img src="' + esc(g.src) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async" ' +
                'width="800" height="1000">';
      } else {
        inner = '<div class="shot__ph"><strong>Photo ' + (i + 1) + '</strong>' +
                '<span>' + esc(alt) + '</span></div>';
      }
      fig.innerHTML = inner + '<figcaption>' + esc(cap) + '</figcaption>';
      fig.setAttribute('data-i', i);
      fig.tabIndex = 0;
      fig.setAttribute('role', 'button');
      fig.setAttribute('aria-label', 'Open photograph: ' + cap);
      box.appendChild(fig);
    });

    box.addEventListener('click', function (e) {
      var f = e.target.closest('.shot');
      if (f) openLightbox(+f.getAttribute('data-i'));
    });
    box.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var f = e.target.closest('.shot');
      if (f) { e.preventDefault(); openLightbox(+f.getAttribute('data-i')); }
    });
  }

  var lightboxIndex = 0;

  function openLightbox(i) {
    var lb = $('#lightbox'), stage = $('#lbStage'), cap = $('#lbCap');
    var g = slides[i];
    if (!lb || !g) return;
    lightboxIndex = i;
    var alt = filled(g.alt) || ('Photograph ' + (i + 1) + ' from the day');
    var capText = filled(g.caption) || alt;
    stage.innerHTML = g.src
      ? '<img src="' + esc(g.src) + '" alt="' + esc(alt) + '">'
      : '<div class="lightbox__ph"><strong>Photo ' + (i + 1) + ' of ' + slides.length + '</strong>' +
        '<span>' + esc(alt) + '</span>' +
        '<span style="font-size:0.72rem;opacity:0.6;margin-top:0.6rem">' +
        'Put the file in <b>images/</b> and set src in config.js</span></div>';
    cap.textContent = capText;
    lb.classList.add('is-open');
    document.body.classList.add('is-locked');
    $('#lbClose').focus();
  }

  function closeLightbox() {
    var lb = $('#lightbox');
    if (!lb) return;
    lb.classList.remove('is-open');
    document.body.classList.remove('is-locked');
  }

  function stepLightbox(d) {
    if (!slides.length) return;
    var i = (lightboxIndex + d + slides.length) % slides.length;
    openLightbox(i);
  }

  function wireLightbox() {
    var lb = $('#lightbox');
    if (!lb) return;
    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLightbox();
      if (e.target.closest('#lbClose')) closeLightbox();
      if (e.target.closest('#lbPrev')) stepLightbox(-1);
      if (e.target.closest('#lbNext')) stepLightbox(1);
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') { e.preventDefault(); stepLightbox(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); stepLightbox(1); }
    });
  }

  /* ==================================================== FAMILIES ====== */
  function renderPeople() {
    var box = $('#people');
    if (!box) return;

    function side(label, family, role, names, photo, alt) {
      var n = el('article', 'person reveal');
      var who = filled(family);
      var pic = filled(photo);
      /* a blank <li> looks broken, so drop unfilled rows entirely */
      var rows = (names || []).map(filled).filter(Boolean)
        .map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
      var frame = pic
        ? '<img src="' + esc(pic) + '" alt="' + esc(alt || label) + '" loading="lazy" decoding="async">'
        : '<span>' + esc(who || (role === 'The bride' ? 'The bride' : 'The groom')) + '</span>';
      n.innerHTML =
        '<div class="person__frame">' + frame + '</div>' +
        '<h3 class="person__name">' + esc(label) + '</h3>' +
        '<p class="person__role">' + esc(role) + '</p>' +
        (rows ? '<ul class="person__list">' + rows + '</ul>' : '');
      return n;
    }

    box.appendChild(side(cfg('bride.full') || 'Rose Ndaanee', cfg('families.brideSide'),
                         'The bride', cfg('families.bride'),
                         'images/the-bride.jpg', 'Rose Ndaanee in full traditional regalia'));

    box.appendChild(side(cfg('groom.full') || 'The groom', cfg('families.groomSide'),
                         'The groom', cfg('families.groom'),
                         'images/the-groom.jpg', 'Daniel BARIDOO in full traditional regalia'));
  }

  /* ============================================ IS IT ACTUALLY LOCKED? ==
     This is the whole security of the site in one question: can a stranger
     create an account and read the blessings? If signup is still on, yes.
     We ask Supabase directly and shout about it in the red bar. */
  function checkPrivacy() {
    var danger = $('#dangerBar'), locked = $('#lockedBar');
    if (!isConnected() || !danger) return;
    var url = cfg('supabase.url').replace(/\/+$/, '') + '/auth/v1/settings';
    fetch(url, { headers: { apikey: cfg('supabase.anonKey') } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (s) {
        if (!s) return;
        if (s.disable_signup === true) { locked.hidden = false; }
        else { danger.hidden = false; }
      })
      .catch(function () { /* offline or blocked — do not accuse them falsely */ });
  }

  /* ==================================================== REVEAL ======== */
  function wireReveal() {
    if (!('IntersectionObserver' in window)) {
      $$('.reveal, .journey__text p, .journey__map').forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    function watch() {
      $$('.reveal, .journey__text p, .journey__map').forEach(function (n) { io.observe(n); });
    }
    watch();
    setTimeout(watch, 400);
  }

  /* ==================================================== PETALS ======== */
  var PETAL_COLOURS = ['#C4483A', '#EBD89A', '#C9A227', '#F6F1E7', '#8C4A2F', '#B23A2E'];

  function burstPetals(count) {
    var host = $('#petals');
    if (!host) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var n = count || 60;
    for (var i = 0; i < n; i++) {
      (function (i) {
        var p = document.createElement('span');
        p.className = 'petal';
        var size = 8 + Math.random() * 12;
        p.style.cssText =
          'left:' + (Math.random() * 100) + 'vw;' +
          'width:' + size + 'px;height:' + (size * 0.82) + 'px;' +
          'background:' + PETAL_COLOURS[Math.floor(Math.random() * PETAL_COLOURS.length)] + ';' +
          '--dx:' + (Math.random() * 180 - 90) + 'px;' +
          '--rot:' + (Math.random() * 1080 - 360) + 'deg;' +
          '--dur:' + (3.4 + Math.random() * 3.6) + 's;' +
          'animation-delay:' + (Math.random() * 1.1) + 's;';
        host.appendChild(p);
        setTimeout(function () { p.remove(); }, 9000);
      })(i);
    }
  }

  /* ============================================ WHERE BLESSINGS GO ===== */
  var dbReady = null;

  function isConnected() {
    var s = cfg('supabase');
    if (!s || !s.url || !s.anonKey) return false;
    /* Both must be real values. "{{SUPABASE_ANON_KEY}}" is a truthy string, so
       checking only the URL would report "connected" with a placeholder key —
       which then fails at insert time and loses the blessing. */
    return s.url.indexOf('{{') === -1 && s.anonKey.indexOf('{{') === -1;
  }

  function isInboxReady() {
    var i = cfg('inbox.accessKey');
    return !!(i && i.indexOf('{{') === -1);
  }

  /* Which route is actually live right now? */
  function delivery() {
    if (isConnected()) return 'supabase';
    if (isInboxReady()) return 'inbox';
    return 'local';
  }

  /* Loaded on demand so the page stays fast and works offline. */
  function getClient() {
    if (dbReady) return dbReady;
    dbReady = (async function () {
      if (!isConnected()) return null;
      var mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      return mod.createClient(cfg('supabase.url'), cfg('supabase.anonKey'), {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    })().catch(function (err) {
      console.warn('Supabase could not be loaded.', err);
      return null;
    });
    return dbReady;
  }

  /* An email copy, so a blessing can never be lost to a half-finished setup.
     Runs alongside the database rather than instead of it. */
  function sendToInbox(row) {
    if (!isInboxReady()) return Promise.resolve(false);
    var sideLabel = function (v) {
      var s = (cfg('sides') || []).find(function (x) { return x.value === v; });
      return s ? s.label : (v || '');
    };
    var body = [
      'Reference: ' + row.reference,
      '',
      'FROM',
      'Name:      ' + row.full_name,
      'Side:      ' + sideLabel(row.side) + (row.side_other ? ' (' + row.side_other + ')' : ''),
      'Location:  ' + [row.town, row.country].filter(Boolean).join(', '),
      'Phone:     ' + (row.phone || '—'),
      'Email:     ' + (row.email || '—'),
      'Guest of:  ' + (row.guest_of || '—'),
      '',
      'THEIR MESSAGE',
      '----------------------------------------',
      row.message,
      '----------------------------------------',
    ].join('\n');

    return fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: cfg('inbox.accessKey'),
        from_name: cfg('inbox.fromName'),
        subject: cfg('inbox.subject') + ' — ' + row.full_name,
        /* replyto lets them hit reply and answer the guest directly */
        replyto: row.email || '',
        message: body,
      }),
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }

  function localSave(row) {
    try {
      var all = JSON.parse(localStorage.getItem('hc.blessings') || '[]');
      all.push(row);
      localStorage.setItem('hc.blessings', JSON.stringify(all));
    } catch (e) { /* private mode, quota — nothing we can do */ }
  }

  function makeReference() {
    var L = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var s = '';
    for (var i = 0; i < 6; i++) s += L[Math.floor(Math.random() * L.length)];
    return 'RNE-' + s;
  }

  function updateTally() {
    var nEl = $('#tallyN'), lEl = $('#tallyL');
    if (!nEl) return;
    var tally = nEl.closest ? nEl.closest('.tally') : null;
    getClient().then(function (sb) {
      if (!sb) {
        /* No database, so there is no honest number to show. Hide it rather
           than display a count that means nothing. */
        if (tally) tally.hidden = true;
        return;
      }
      if (tally) tally.hidden = false;
      sb.rpc('blessing_count').then(function (r) {
        var n = r.data == null ? null : Number(r.data);
        nEl.textContent = n == null ? '—' : n.toLocaleString();
        lEl.textContent = n === 1 ? 'blessing received' : 'blessings received';
      }).catch(function () { nEl.textContent = '—'; });
    });
  }

  /* ==================================================== THE FORM ====== */
  function wireForm() {
    var env = $('#envelope'), seal = $('#envSeal');
    var form = $('#blessingForm');
    if (!env || !form) return;

    /* --- pop open the envelope --- */
    if (seal) {
      seal.addEventListener('click', function () {
        env.classList.add('is-open');
        burstPetals(26);
        setTimeout(function () {
          var f = $('#full_name');
          if (f && !env.dataset.touched) f.focus({ preventScroll: true });
        }, 900);
      });
    }

    /* --- fill the drop-downs --- */
    var sideSel = $('#side');
    (cfg('sides') || []).forEach(function (s) {
      var o = document.createElement('option');
      o.value = s.value; o.textContent = s.label;
      sideSel.appendChild(o);
    });
    var cSel = $('#country');
    (cfg('countries') || []).forEach(function (c) {
      var o = document.createElement('option');
      o.value = c; o.textContent = c;
      cSel.appendChild(o);
    });

    /* --- step 1 -> 2 --- */
    var s1 = $('#step1'), s2 = $('#step2');

    function toStep2() {
      var ok = true;
      ok = check($('#full_name'), 'full_name', 'Please tell us your name.') && ok;
      ok = check($('#side'), 'side', 'Please choose which side of the family.') && ok;
      if (!ok) return;
      env.dataset.touched = '1';
      s1.classList.remove('is-on');
      s2.classList.add('is-on');
      s2.disabled = false;
      paintSteps(2);
      $('#asWhom').textContent = $('#full_name').value.trim();
      $('#message').focus();
      $('#live').textContent = 'Step two. Please write your blessing.';
    }

    $('#toStep2').addEventListener('click', toStep2);
    $('#editWho').addEventListener('click', function () {
      s2.classList.remove('is-on'); s1.classList.add('is-on');
      paintSteps(1);
      $('#full_name').focus();
    });
    $('#backStep1').addEventListener('click', function () { $('#editWho').click(); });

    function paintSteps(n) {
      $$('.steps i').forEach(function (d, i) { d.classList.toggle('is-on', i < n); });
    }

    /* --- "other" reveals its own field --- */
    sideSel.addEventListener('change', function () {
      var f = $('#f-side_other');
      f.hidden = sideSel.value !== 'other';
      if (sideSel.value !== 'other') $('#side_other').value = '';
    });

    /* --- live validation --- */
    ['full_name', 'side', 'email'].forEach(function (id) {
      var n = $('#' + id);
      if (n) n.addEventListener('blur', function () {
        if (id === 'email' && !n.value) return;
        check(n, id, '');
      });
      if (n) n.addEventListener('input', function () {
        var f = $('#f-' + id);
        if (f) f.classList.remove('has-err');
      });
    });

    function check(node, id, msg) {
      var wrap = $('#f-' + id), out = $('#e-' + id);
      if (!node) return true;
      var v = (node.value || '').trim();
      var bad = !v;
      if (id === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        bad = true; msg = 'That email address does not look complete.';
      }
      wrap.classList.toggle('has-err', bad);
      if (out) out.textContent = bad ? msg : '';
      return !bad;
    }

    /* --- character counter --- */
    var ta = $('#message'), cc = $('#charCount');
    ta.addEventListener('input', function () {
      cc.textContent = ta.value.length.toLocaleString();
      if (ta.value.length > 1500) {
        ta.setCustomValidity('');
      }
    });

    /* --- submit --- */
    /* Starts at wire time, not 0, so a bot that never fires a focus event is
       still held to the same minimum as a person. */
    var opened = Date.now();
    form.addEventListener('focusin', function () { opened = Date.now(); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = $('#formError');
      err.className = 'a-msg a-msg--bad';
      err.textContent = '';

      if (!check(ta, 'message', 'Please write a few words. They are expecting it.')) {
        err.textContent = 'Almost there — the message box is still empty.';
        err.classList.add('is-on');
        ta.focus();
        return;
      }

      /* bot traps: a hidden field, and a form filled in impossibly fast */
      if ($('#company').value) return;                       /* silently do nothing */
      if (Date.now() - opened < 2500) {
        err.textContent = 'That was quick. Could you take a moment and press send again?';
        err.classList.add('is-on');
        return;
      }

      var btn = $('#sealBtn');
      btn.disabled = true;
      btn.textContent = 'Sealing…';
      env.classList.add('is-sending');

      var row = {
        full_name:  $('#full_name').value.trim(),
        side:       $('#side').value,
        side_other: $('#side_other').value.trim() || null,
        town:       $('#town').value.trim() || null,
        country:    $('#country').value || null,
        phone:      $('#phone').value.trim() || null,
        email:      $('#email').value.trim() || null,
        guest_of:   $('#guest_of').value.trim() || null,
        message:    ta.value.trim(),
        reference:  makeReference(),
      };

      submit(row).then(function (res) {
        showReceipt(res, row);
        burstPetals(80);
        updateTally();
      }).catch(function (e2) {
        err.textContent = 'It did not go through. Please check your connection and try once more.';
        err.classList.add('is-on');
        btn.disabled = false;
        btn.textContent = 'Seal & send';
        env.classList.remove('is-sending');
        console.error(e2);
      });
    });

    function submit(row) {
      /* Always try the inbox copy — it is the thing that cannot be lost. */
      var mailed = sendToInbox(row);

      var sb = getClient();
      return sb.then(function (client) {
        if (!client) {
          /* no database: the email is the delivery, provided one is configured */
          return mailed.then(function (sent) {
            if (sent) return { via: 'inbox' };
            localSave({ ...row, created_at: new Date().toISOString(), is_read: false, is_hidden: false });
            return { via: 'local' };
          });
        }
        return client.from('blessings').insert(row).then(function (r) {
          if (r.error) throw r.error;
          return mailed.then(function () { return { via: 'supabase' }; });
        }).catch(function (err) {
          /* The database said no. If the inbox copy went out, the blessing is
             still safely received — say so rather than losing it. If nothing is
             configured either, keep it locally and tell the guest the truth. */
          console.warn('Database insert failed:', err);
          return mailed.then(function (sent) {
            if (sent) return { via: 'inbox' };
            localSave({ ...row, created_at: new Date().toISOString(), is_read: false, is_hidden: false });
            return { via: 'local' };
          });
        });
      });
    }

    function showReceipt(res, row) {
      $('#receiptName').textContent = row.full_name.split(' ')[0];
      $('#receiptCode').textContent = row.reference;
      var note = $('#receiptNote');
      if (res.via === 'local') {
        note.innerHTML = '<b>Not sent yet.</b> The site owner has not finished connecting the ' +
          'blessings, so this did not reach them. Nothing is wrong at your end — ' +
          'please try again later, or message them directly if this was important.';
      } else if (res.via === 'inbox') {
        note.innerHTML = 'It is in Rose and Daniel\'s inbox now. If it feels like it was not ' +
          'received, quote that code and they will find it.';
      } else {
        note.innerHTML = 'It is safely stored. If it feels like it was not received, ' +
          'quote that code and they will find it.';
      }
      $('#formWrap').style.display = 'none';
      var r = $('#receipt');
      r.classList.add('is-on');
      $('#live').textContent = 'Your blessing has been sealed. Reference ' + row.reference;
    }

    /* --- write another --- */
    $('#writeAnother').addEventListener('click', function () {
      form.reset();
      $('#f-side_other').hidden = true;
      $('#charCount').textContent = '0';
      $('#receipt').classList.remove('is-on');
      $('#formWrap').style.display = '';
      s2.classList.remove('is-on'); s1.classList.add('is-on');
      s2.disabled = true;
      paintSteps(1);
      env.classList.remove('is-sending');
      var b = $('#sealBtn'); b.disabled = false; b.textContent = 'Seal & send';
      env.classList.remove('is-open');
      document.getElementById('blessing').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ==================================================== SHARING ======= */
  function wireShare() {
    var url = location.href.split('#')[0];

    var wa = $('#shareWA');
    if (wa) wa.href = 'https://wa.me/?text=' + encodeURIComponent('Rose Ndaanee got married. ' + url);

    var copy = $('#shareCopy');
    if (copy) copy.addEventListener('click', function () {
      var done = function () {
        copy.textContent = 'Copied';
        setTimeout(function () { copy.textContent = 'Copy link'; }, 2000);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () {});
      else done();
    });

    var nat = $('#shareNative');
    if (nat) {
      if (navigator.share) {
        nat.addEventListener('click', function () {
          navigator.share({ title: document.title, text: 'Rose Ndaanee got married.', url: url })
            .catch(function () {});
        });
      } else {
        nat.hidden = true;
      }
    }

    /* the quiet Igbo greeting — only if you go looking for the door */
    var door = $('#adminDoor');
    if (door) {
      door.addEventListener('focus', function () { $('#igboEgg').classList.add('is-in'); });
      door.addEventListener('click', function () { location.href = 'admin.html'; });
    }
  }

  /* ==================================================== SERVICE WORKER */
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol === 'file:') return;  /* not needed when previewing from a folder */
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }

  /* ==================================================== BOOT ========== */
  function boot() {
    if (!C) { console.error('config.js did not load.'); return; }

    setupBar();
    checkPrivacy();
    renderHero();
    bindText();
    reportMeta();
    startCounter();
    renderJourney();
    renderNames();
    renderTimeline();
    renderCustoms();
    renderPalette();
    renderGallery();
    renderPeople();
    wireLightbox();
    wireReveal();
    wireForm();
    wireShare();
    updateTally();
    registerSW();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
