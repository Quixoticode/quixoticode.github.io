// === Konstante DOM-Elemente ===
const energyBar = document.getElementById("energy");
const hungerBar = document.getElementById("hunger");
const moodBar = document.getElementById("mood");
const owlImage = document.getElementById("owl-image");
const owlStatus = document.getElementById("owl-status");

const feedBtn = document.getElementById("feed-btn");
const petBtn = document.getElementById("pet-btn");
const sleepBtn = document.getElementById("sleep-btn");

// === Status der Eule ===
let owl = {
  energy: 100,
  hunger: 50,
  mood: 80,
  lastUpdated: Date.now(),
};

// === Lokale Daten laden ===
function loadOwl() {
  const saved = localStorage.getItem("owlData");
  if (saved) {
    owl = JSON.parse(saved);
    applyTimeDecay();
    updateUI();
  }
}

// === Lokale Daten speichern ===
function saveOwl() {
  owl.lastUpdated = Date.now();
  localStorage.setItem("owlData", JSON.stringify(owl));
}

// === Zeitbedingter Verfall der Werte ===
function applyTimeDecay() {
  const now = Date.now();
  const hoursPassed = (now - owl.lastUpdated) / (1000 * 60 * 60);

  // Verfall je Stunde
  owl.energy = Math.max(0, owl.energy - hoursPassed * 5);
  owl.hunger = Math.min(100, owl.hunger + hoursPassed * 7);
  owl.mood = Math.max(0, owl.mood - hoursPassed * 3);
}

// === UI aktualisieren ===
function updateUI() {
  energyBar.value = owl.energy;
  hungerBar.value = owl.hunger;
  moodBar.value = owl.mood;

  // Bild & Status abhängig vom Zustand
  if (owl.hunger > 80) {
    owlImage.src = "img/baby_hungry.png";
    owlStatus.textContent = "Ich hab Hunger!";
  } else if (owl.energy < 30) {
    owlImage.src = "img/baby_sleepy.png";
    owlStatus.textContent = "Ich bin müde...";
  } else if (owl.mood < 30) {
    owlImage.src = "img/baby_sad.png";
    owlStatus.textContent = "Mir ist langweilig.";
  } else {
    owlImage.src = "img/baby_happy.png";
    owlStatus.textContent = "Mir geht's gut!";
  }
}

// === Interaktionen ===
feedBtn.addEventListener("click", () => {
  owl.hunger = Math.max(0, owl.hunger - 30);
  owl.mood += 5;
  saveOwl();
  updateUI();
});

petBtn.addEventListener("click", () => {
  owl.mood = Math.min(100, owl.mood + 10);
  saveOwl();
  updateUI();
});

sleepBtn.addEventListener("click", () => {
  owl.energy = Math.min(100, owl.energy + 50);
  owl.mood -= 5; // langweilig!
  saveOwl();
  updateUI();
});

// === Initialisierung ===
window.addEventListener("load", () => {
  loadOwl();
  updateUI();
});

// === Service Worker registrieren ===
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('[SW] Registriert'))
    .catch((err) => console.error('[SW] Fehler:', err));
}
