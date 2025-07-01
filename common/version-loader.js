// Diese Funktion wird automatisch ausgeführt, wenn das Dokument geladen ist.
(function() {
  // Pfad zur version.txt. Passt für jede Unterseite,
  // da es im selben Ordner wie die HTML-Datei sucht.
  const versionFilePath = 'version.txt';

  // Finde alle Elemente auf der Seite, die für die Version vorgesehen sind.
  const versionDisplays = document.querySelectorAll('.app-version');

  // Wenn keine Platzhalter-Elemente gefunden wurden, tue nichts.
  if (versionDisplays.length === 0) {
    return;
  }

  // Lade die Versionsdatei vom Server.
  fetch(versionFilePath)
    .then(response => {
      // Prüfe, ob die Datei gefunden wurde.
      if (!response.ok) {
        throw new Error('version.txt nicht gefunden');
      }
      return response.text();
    })
    .then(version => {
      // Setze den Text für alle gefundenen Platzhalter-Elemente.
      versionDisplays.forEach(element => {
        element.textContent = version.trim();
      });
    })
    .catch(error => {
      // Falls ein Fehler auftritt (z.B. offline), zeige eine Meldung an.
      console.error('Fehler beim Laden der Version:', error);
      versionDisplays.forEach(element => {
        element.textContent = 'n/a';
      });
    });
})();