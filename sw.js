// Offline support for the home page (and the unlisted pages under it): cache everything, serve from cache,
// refresh in the background when online. Each game has its own sw.js with a narrower scope, which takes over
// inside that game's folder; the home page registers all of them, so one visit online makes every game work offline.
// All the games share one site, so only clear out the home page's own old caches.
const CACHE = 'home-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png',
  './shared/KidsRounded.woff2', './shared/grownup.js', './shared/grownup.css',
  './bubble-pop/cover.svg', './bubble-pop/icon-192.png', './magic-paint/cover.svg', './magic-paint/icon-192.png',
  './little-band/cover.svg', './little-band/icon-192.png', './web-hero/cover.svg', './web-hero/icon-192.png',
  './verses/', './verses/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k.startsWith('home-')).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request).then(res => { if (res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => null);
    return cached || (await fresh) || cache.match('./index.html');
  }));
});
