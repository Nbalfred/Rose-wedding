/* =============================================================================
   HOME COMING — sw.js
   Makes the page readable with no signal, which matters a lot at a venue.
   The blessing form and the admin panel are deliberately never cached.
   ========================================================================== */

var CACHE = 'homecoming-v2';

/* Only these. Do not add the admin page or the Supabase calls. */
var SHELL = [
  './',
  './Index.html',
  './Style.css',
  './script.js',
  './config.js',
  './manifest.json',
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
      .catch(function () { /* one file missing is not worth failing the install */ })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;

  /* Never touch the database, the admin page, or anything that is not a GET. */
  if (req.method !== 'GET') return;
  if (/\/admin(\.html|\.js)?$/.test(new URL(req.url).pathname)) return;
  if (/supabase|jsdelivr|googleapis|gstatic/.test(req.url)) return;

  /* Images: cache first, they never change. */
  if (/\.(png|jpe?g|webp|avif|svg|woff2?)$/i.test(new URL(req.url).pathname)) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
          return res;
        });
      })
    );
    return;
  }

  /* Pages and code: network first so you always get the newest, cache as a
     fallback so a dropped signal does not leave somebody staring at nothing. */
  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match('./Index.html');
      });
    })
  );
});
