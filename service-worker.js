const CACHE_NAME="nyvera-app-shell-v1.10.3-mobile-delivery-refresh";
const APP_SHELL=["./","./index.html","./manifest.webmanifest","./assets/icons/nyvera-mark.svg","./assets/icons/radio.svg","./assets/icons/studio-icons.svg","./assets/artwork/studio-character-ai.jpg","./assets/artwork/studio-kids-ai.jpg","./assets/artwork/studio-sticker-ai.jpg","./assets/illustrations/character-loading.svg","./assets/illustrations/kids-loading.svg","./assets/illustrations/sticker-loading.svg","./css/nyvera.css?v=1.10.2","./css/radio.css?v=1.10.0","./js/app.js?v=1.10.3","./js/nyvera-content.js","./js/nyvera-data.js","./js/nyvera-storage.js","./js/nyvera-prompts.js","./js/nyvera-mockups.js","./js/nyvera-kids-products.js","./js/nyvera-workflows.js","./js/radio.js?v=1.10.3","./js/radio-explorer.js","./js/radio-service.js","./js/radio-storage.js"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET"||new URL(event.request.url).origin!==self.location.origin)return;
  if(event.request.mode==="navigate"){
    event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put("./index.html",copy));return response;}).catch(()=>caches.match("./index.html")));
    return;
  }
  if(["style","script"].includes(event.request.destination)){
    event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}return response;})));
});
