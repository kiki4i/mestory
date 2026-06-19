// 휴먼다큐 Service Worker
const CACHE_NAME = 'tupil-v1';
const ASSETS = [
  '/today-form.html',
  '/today.html',
  '/today-manifest.json',
  '/today-icon-192.png',
  '/today-icon-512.png'
];

// 설치 — 핵심 파일 캐시
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화 — 오래된 캐시 삭제
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 요청 처리 — 네트워크 우선, 실패 시 캐시
self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith('http')) return;
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
