// Service Worker für QHub v2.2 - PUSH-fähig

self.addEventListener('install', event => {
  console.log('Service Worker installiert.');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker aktiviert.');
  return self.clients.claim();
});

/**
 * Dieser Listener wird aufgerufen, wenn eine Push-Nachricht vom Server ankommt.
 */
self.addEventListener('push', event => {
  // Die vom Server gesendeten Daten auslesen (als JSON)
  // Fallback, falls keine Daten gesendet wurden
  const data = event.data ? event.data.json() : { title: 'QHub Info', body: 'Es gibt Neuigkeiten!' };

  const title = data.title || 'Neues von QHub!';
  const options = {
    body: data.body || 'Klicke hier, um die App zu öffnen.',
    icon: data.icon || 'https://quixoticode.github.io/data/qhub/android-chrome-192x192.png',
    badge: 'https://quixoticode.github.io/data/qhub/favicon.svg', // Kleines Icon in der Statusleiste (Android)
    tag: 'qhub-update-notification' // Benachrichtigungen mit demselben Tag ersetzen die alte
  };

  // Dem Browser sagen, dass er die Benachrichtigung anzeigen soll
  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Dieser Listener wird aufgerufen, wenn der Nutzer auf die Benachrichtigung klickt.
 */
self.addEventListener('notificationclick', event => {
  // Zuerst die Benachrichtigung schließen
  event.notification.close();

  // Dann versuchen, ein bereits offenes App-Fenster zu finden und zu fokussieren.
  // Wenn keins offen ist, ein neues öffnen.
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Prüfen, ob ein Fenster bereits die App-URL hat
      for (const client of clientList) {
        // Passe die URL ggf. an deine GitHub Pages URL an
        if (client.url.includes('quixoticode.github.io') && 'focus' in client) {
          return client.focus();
        }
      }
      // Wenn kein Client gefunden wurde, neues Fenster öffnen
      if (clients.openWindow) {
        // Passe die URL ggf. an deine GitHub Pages URL an
        return clients.openWindow('https://quixoticode.github.io/app/'); // Beispiel-URL
      }
    })
  );
});
