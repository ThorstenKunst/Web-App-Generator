/**
 * app.js – Hauptcontroller der Anwendung
 *
 * Strukturübersicht:
 * -------------------
 * - Globale State-Objekte (z.B. Benutzer, Cache)
 * - Initialisierung nach DOM-Ready:
 *     - Authentifizierung prüfen
 *     - Benutzerdaten laden und anzeigen
 *     - Event-Handler registrieren (zentrale Delegation + gezielte Bindung)
 *     - Initialdaten aus Cache/API laden
 *
 * Funktionale Bereiche:
 * ---------------------
 * 1. UI-Initialisierung      → Begrüßung anzeigen
 * 2. Event-Handling          → Button-Klicks, Overlays, Logout, Speichern
 * 3. Daten laden             → Tagesprotokoll + Einstellungen (mit Cache)
 * 4. Daten speichern         → Formulareingaben verarbeiten und speichern
 * 5. Overlay-Steuerung       → Anzeigen/Verstecken von modalen Ansichten
 *
 * Technische Hinweise:
 * ---------------------
 * - Kein Inline-JavaScript im HTML
 * - Alle Dateninteraktionen über System-API
 * - Daten werden zentral über `System.collectForm()` und `System.save()` gehandhabt
 * - View-Updates über gezielte DOM-Manipulation (z.B. `System.fillForm()`)
 * - Cache wird intelligent über `DataCache` verwaltet (RAM + localStorage)
 *
 * Ziel:
 * -----
 * Klare Trennung von Oberfläche, Logik und Daten.
 * Skalierbar, wartbar, verständlich.
 */
 
// ✅ Globale State-Objekte (falls nötig)
const state = {
  user: null,
  cache: new DataCache()
};

// ✅ App-Initialisierung
document.addEventListener('DOMContentLoaded', async () => {
  await initializeApp();
});

async function initializeApp() {
  await System.checkAuth();
  state.user = System.getUserInfo();
  renderUserGreeting(state.user);

  registerGlobalEvents();
  await loadInitialData();
}
// ######################################## 📌 1. UI initialisieren

function renderUserGreeting(user) {
  const welcome = document.getElementById('userWelcome');
  welcome.textContent = `Moin ${user.vorname || '👤'}!`;
}
// ######################################## 📌 2. Zentrales Event-Handling

function registerGlobalEvents() {
  // Delegierte Events (Buttons, Overlays, Navigation)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    switch (action) {
      case 'settings':
        showOverlay('settingsOverlay');
        break;
      case 'close-settings':
        closeOverlay('settingsOverlay');
        break;
      case 'close-subsettings':
        closeOverlay('stammdatenSubpage');
        break;
      case 'logout':
        System.logout();
        break;
    }
  });

  // Direkte Events
  document.getElementById('saveProtokoll')?.addEventListener('click', saveProtokoll);
  document.getElementById('saveStammdaten')?.addEventListener('click', saveStammdaten);
}
// ######################################## 📌 3. Daten laden

async function loadInitialData() {
  const tagebuch = await state.cache.get('tagebuch', async () => {
    const result = await System.load('tagebuch', { orderBy: 'created_at DESC', limit: 1 });
    return result.data;
  });

  if (tagebuch && tagebuch.length) {
    System.fillForm('main', tagebuch[0]);
  }

  const settings = await state.cache.get('settings', async () => {
    const result = await System.load('settings');
    return result.data;
  });

  applySettings(settings[0]);
}

function applySettings(data) {
  document.getElementById('showSexualActivitiesSettings').checked = !!data.show_sexual_activities;
}
// ######################################## 📌 4. Speichern

async function saveProtokoll() {
  const data = System.collectForm('main');
  const result = await System.save('tagebuch', data);

  if (result.success) {
    alert('Tagesprotokoll gespeichert');
    state.cache.clear('tagebuch');
  }
}

async function saveStammdaten() {
  const data = System.collectForm('stammdatenSubpage');
  const result = await System.save('stammdaten', data);

  if (result.success) {
    alert('Stammdaten aktualisiert');
    state.cache.clear('stammdaten');
  }
}
// ######################################## 📌 5. Overlays

function showOverlay(id) {
  document.getElementById(id)?.classList.remove('hidden');
}

function closeOverlay(id) {
  document.getElementById(id)?.classList.add('hidden');
}