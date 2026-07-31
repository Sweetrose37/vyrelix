const CACHE_NAME = "vyrelix-v10-luminous-creator";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/icons/vyrelix-mark.svg",
  "./css/variables.css",
  "./css/layout.css",
  "./css/style.css",
  "./css/core/creation.css",
  "./js/app.js",
  "./js/creation/creationExperience.js",
  "./js/creation/guidedExperience.js",
  "./js/creation/creativeIntelligence.js",
  "./js/creation/creationSchemas.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (!response.ok) return response;
      return caches.open(CACHE_NAME)
        .then((cache) => cache.put(event.request, response.clone()))
        .then(() => response);
    }).catch(() => event.request.mode === "navigate" ? caches.match("./index.html") : Response.error()))
  );
});
