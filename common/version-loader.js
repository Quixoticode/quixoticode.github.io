// version-loader.js (Einfache Version)

(function() {
  // Pfad zur version.txt. Sucht im selben Ordner wie die HTML-Datei.
  const versionFilePath = 'version.txt';

  // Funktion, die die Version lädt und einsetzt.
  function loadAndDisplayVersion() {
    fetch(versionFilePath)
      .then(response => {
        // Prüfe, ob die Datei gefunden wurde.
        if (!response.ok) {
          throw new Error(`version.txt nicht gefunden (Status: ${response.status})`);
        }
        return response.text();
      })
      .then(version => {
        // Finde alle Platzhalter und setze den Text.
        const versionDisplays = document.querySelectorAll('.app-version');
        if (versionDisplays.length === 0) {
            // Dies ist keine Fehlermeldung, nur ein Hinweis für die Entwicklung.
            console.log('Kein .app-version Platzhalter auf dieser Seite gefunden.');
            return;
        }
        versionDisplays.forEach(element => {
          element.textContent = version.trim();
        });
      })
      .catch(error => {
        // Zeige eine klare Fehlermeldung in der Konsole an.
        console.error('Fehler beim Laden der Version:', error);
        const versionDisplays = document.querySelectorAll('.app-version');
        versionDisplays.forEach(element => {
          element.textContent = 'n/a';
        });
      });
  }

  // Führe die Funktion aus, sobald das Grundgerüst der Seite geladen ist.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAndDisplayVersion);
  } else {
    // Falls das Event schon vorbei ist, führe es direkt aus.
    loadAndDisplayVersion();
  }
})();
