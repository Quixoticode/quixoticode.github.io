// sw.js - Service Worker

const CACHE_NAME = 'pets-life-cache-v1';
// Dateien, die für die Offline-Nutzung gecached werden sollen.
// Da alles in index.html ist, reicht diese.
// Bei separaten CSS, JS oder Bilddateien müssten diese hier auch rein.
const urlsToCache = [
    '/', // Die Startseite (index.html)
    'index.html', // explizit auch
    // Wenn du später separate CSS/JS-Dateien hast, füge sie hier hinzu:
    // 'style.css',
    // 'app.js',
    // 'manifest.json' // Falls du ein Manifest verwendest
];

// Installation des Service Workers: Öffnet den Cache und fügt die Kern-Assets hinzu.
self.addEventListener('install', event => {
    console.log('Service Worker: Installiere...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cache geöffnet. Cache folgende Dateien:', urlsToCache);
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Alle Dateien erfolgreich gecached.');
                return self.skipWaiting(); // Erzwingt, dass der neue SW sofort aktiv wird
            })
            .catch(error => {
                console.error('Service Worker: Caching fehlgeschlagen:', error);
            })
    );
});

// Aktivierung des Service Workers: Hier können alte Caches bereinigt werden.
self.addEventListener('activate', event => {
    console.log('Service Worker: Aktiviere...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Lösche alten Cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Aktiv und bereit, Anfragen zu behandeln!');
            return self.clients.claim(); // Übernimmt Kontrolle über offene Clients
        })
    );
});

// Fetch-Ereignis: Abfangen von Netzwerkanfragen.
// Strategie: Cache first, then network.
self.addEventListener('fetch', event => {
    console.log('Service Worker: Verarbeite Fetch-Event für:', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('Service Worker: Antwort aus Cache gefunden für:', event.request.url);
                    return response; // Aus dem Cache bedienen
                }
                console.log('Service Worker: Keine Antwort im Cache, gehe zum Netzwerk für:', event.request.url);
                // Wenn nicht im Cache, Anfrage normal über das Netzwerk senden
                // und optional die Antwort für zukünftige Offline-Nutzung cachen.
                return fetch(event.request).then(
                    networkResponse => {
                        // Überprüfen, ob wir eine valide Antwort vom Netzwerk bekommen haben
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // WICHTIG: Die Antwort muss geklont werden.
                        // Eine Antwort ist ein Stream und kann nur einmal konsumiert werden.
                        // Wir brauchen eine für den Browser und eine für den Cache.
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                console.log('Service Worker: Cache neue Antwort von Netzwerk für:', event.request.url);
                                cache.put(event.request, responseToCache);
                            });
                        
                        return networkResponse;
                    }
                ).catch(error => {
                    console.error('Service Worker: Netzwerk-Fetch fehlgeschlagen für:', event.request.url, error);
                    // Hier könnte man eine generische Offline-Fallback-Seite anzeigen,
                    // wenn sowohl Cache als auch Netzwerk fehlschlagen.
                    // return caches.match('offline.html'); // Beispiel
                });
            })
    );
});
