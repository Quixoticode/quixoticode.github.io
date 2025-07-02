// version-loader.js (Definitive, robuste Version)

(function() {
  // Diese Variable speichert die Versionsnummer, nachdem sie einmal geladen wurde,
  // um unnötige, wiederholte Ladevorgänge zu vermeiden.
  let versionString = null;
  let hasFetched = false;

  /**
   * Sucht nach allen noch nicht aktualisierten .app-version Platzhaltern
   * und füllt sie mit der geladenen Versionsnummer.
   */
  function updateVersionPlaceholders() {
    // Führe die Funktion nur aus, wenn die Version bereits geladen (oder fehlgeschlagen) ist.
    if (!hasFetched) {
      return;
    }

    // Wähle nur die Platzhalter aus, die noch nicht bearbeitet wurden.
    const versionDisplays = document.querySelectorAll('.app-version:not(.js-version-loaded)');
    
    versionDisplays.forEach(element => {
      if (versionString) {
        element.textContent = versionString;
      }
      // Markiere das Element als "bearbeitet", damit es nicht erneut durchlaufen wird.
      element.classList.add('js-version-loaded');
    });
  }

  /**
   * Lädt die version.txt Datei vom Server.
   * Dies geschieht nur ein einziges Mal.
   */
  function fetchVersion() {
    // Verhindere mehrfaches Laden
    if (hasFetched) {
      updateVersionPlaceholders();
      return;
    }
    
    hasFetched = true;

    // Sucht nach der version.txt im selben Ordner wie die HTML-Datei
    fetch('version.txt')
      .then(response => {
        if (!response.ok) {
          throw new Error(`version.txt nicht gefunden (Status: ${response.status})`);
        }
        return response.text();
      })
      .then(version => {
        versionString = version.trim();
        // Führe die Aktualisierung sofort aus für alle bereits sichtbaren Elemente.
        updateVersionPlaceholders();
      })
      .catch(error => {
        console.error('Fehler beim Laden der Version:', error);
        versionString = 'n/a';
        // Führe die Aktualisierung auch im Fehlerfall aus.
        updateVersionPlaceholders();
      });
  }

  /**
   * Der "Beobachter", der auf Änderungen an der Webseite wartet.
   * Wenn neue Elemente (wie ein Modal) hinzugefügt werden, wird er aktiv.
   */
  const observer = new MutationObserver((mutations) => {
    // Prüfe, ob neue Elemente hinzugefügt wurden.
    const hasAddedNodes = mutations.some(mutation => mutation.addedNodes.length > 0);
    
    if (hasAddedNodes) {
      // Wenn ja, versuche erneut, die Platzhalter zu füllen.
      // Die Version wird aus dem Speicher genommen, nicht neu geladen.
      updateVersionPlaceholders();
    }
  });

  // --- Start der Ausführung ---

  // 1. Wenn das Dokument bereit ist, lade die Version zum ersten Mal.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchVersion);
  } else {
    // Falls das Event schon vorbei ist, führe es direkt aus.
    fetchVersion();
  }

  // 2. Starte den Beobachter, um auf zukünftige Änderungen zu lauern.
  observer.observe(document.body, {
    childList: true, // Achte auf hinzugefügte/entfernte Kind-Elemente
    subtree: true    // Beziehe alle Unterelemente mit ein
  });

})();
