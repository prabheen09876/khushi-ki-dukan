/* Studio Khushi — service worker.
   Network-first so admin edits and code changes show immediately when
   online; the cache is only an offline fallback. Cross-origin requests
   (Supabase, Google Fonts, the Supabase CDN) are never intercepted, so
   your live data is always current. */
const CACHE = 'khushi-v2';
const ASSETS = [
  './', './index.html', './project.html', './admin.html',
  './assets/css/style.css',
  './assets/js/patterns.js', './assets/js/main.js',
  './assets/js/store.js', './assets/js/supabase-config.js',
  './assets/img/favicon.svg', './site.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                    // never intercept writes
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;     // Supabase / fonts / CDN → straight to network
  // network-first: fresh when online, cached fallback when offline
  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
  );
});
