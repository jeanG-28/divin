// Divin - service worker : permet l'installation et l'usage hors-ligne.
// Strategie : "stale-while-revalidate" pour tout ce qui vient du site lui-meme.

var CACHE = 'divin-v2';

var COQUILLE = [
  '/',
  '/styles.css',
  '/app.js',
  '/manifest.webmanifest',
  '/favicon.png',
  '/icone.svg',
  '/icone-180.png',
  '/icone.png',
  '/badge.png',
  '/badge-petit.png',
  '/decouvrir',
  '/inscription',
  '/messages',
  '/conversation',
  '/lives',
  '/live',
  '/soirees',
  '/soiree',
  '/club',
  '/logos',
  '/physique',
  '/disponibilites',
  '/notifications',
  '/moi',
  '/profil',
  '/verification'
];

self.addEventListener('install', function (evenement) {
  self.skipWaiting();
  evenement.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(COQUILLE).catch(function () {});
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
          if (requete.mode === 'navigate') return cache.match('/');
        });
        return reponseCache || recuperation;
      });
    })
    );
});
