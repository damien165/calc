// Cache "app shell" : la page marche hors ligne une fois ouverte une premiere fois.
// Change CACHE a chaque mise a jour du fichier index.html.
var CACHE = "position-v1";
var FILES = ["./", "./index.html", "./manifest.json", "./icon-180.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Reseau d'abord, cache en secours : on recupere la derniere version si la connexion repond.
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(r){ return r || caches.match("./index.html"); });
    })
  );
});
