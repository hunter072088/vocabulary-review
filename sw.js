/**
 * VocabBuddy - Service Worker (v3)
 * 策略：同網域檔案「網路優先、離線才用快取」，避免畫面停在舊版（舊版 cache-first 會讓
 * 新舊檔案混搭，造成按鈕沒反應）。啟用後會清掉舊快取並重新載入已開啟的分頁。
 */

const CACHE_NAME = "vocabbuddy-v3";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./qrcode.js",
  "./data.js",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-64.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS_TO_CACHE) {
        try {
          await cache.add(new Request(asset, { cache: "reload" }));
        } catch (err) {
          console.warn("[SW] Asset caching notice:", asset, err);
        }
      }
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => {
        // 讓已開啟（可能是舊版畫面）的分頁立即換成新版
        clients.forEach((c) => {
          try {
            c.navigate(c.url);
          } catch (e) {}
        });
      })
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 字型等外部資源交給瀏覽器

  event.respondWith(
    fetch(req, { cache: "no-cache" })
      .then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then(
          (hit) => hit || (req.mode === "navigate" ? caches.match("./index.html") : undefined)
        )
      )
  );
});
