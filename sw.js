// Divin — service worker : permet l'installation et l'usage hors-ligne.
// Stratégie : "stale-while-revalidate" pour tout ce qui vient du site lui-même.

var CACHE = 'divin-v1';

var COQUILLE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.webmanifest',
  '/favicon.png',
  '/icone.svg',
  '/icone-180.png',
  '/icone.png',
  '/badge.png',
  '/badge-petit.png',
  '/decouvrir.html',
  '/inscription.html',
  '/messages.html',
  '/conversation.html',
  '/lives.html',
  '/live.html',
  '/soirees.html',
  '/soiree.html',
  '/club.html',
  '/logos.html',
  '/physique.html',
  '/disponibilites.html',
  '/notifications.html',
  '/moi.html',
  '/profil.html',
  '/verification.html',
  '/404.html'
];

self.addEventListener('install', function (evenement) {
  self.skipWaiting();
  evenement.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(COQUILLE).catch(function () {
        // certains fichiers peuvent manquer selon le déploiement : on ignore, pas bloquant
      });
    })
  );
});

self.addEventListener('activate', function (evenement) {
  evenement.waitUntil(
    caches.keys().then(function (noms) {
      return Promise.all(
        noms.filter(function (nom) { return nom !== CACHE; })
            .map(function (nom) { return caches.delete(nom); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (evenement) {
  var requete = evenement.request;

  // seulement les requêtes GET, même origine (pas les polices Google, pas les POST)
  if (requete.method !== 'GET' || new URL(requete.url).origin !== self.location.origin) return;

  evenement.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(requete).then(function (reponseCache) {
        var recuperation = fetch(requete).then(function (reponseReseau) {
          if (reponseReseau && reponseReseau.status === 200) {
            cache.put(requete, reponseReseau.clone());
          }
          return reponseReseau;
        }).catch(function () {
          // hors-ligne et rien en cache pour une navigation : on retombe sur l'accueil
          if (requete.mode === 'navigate') return cache.match('/index.html');
        });
        return reponseCache || recuperation;
      });
    })
  );
});
