/**
 * beispiel.app.js
 *
 * Dies ist die "Gehirn"-Logik für die in index.php deklarierte UI.
 * Sie demonstriert die Architektur des Systems perfekt.
 */

// #################################################################
// BEST PRACTICE: DATENLOGIK IN EINEM HELFER ZENTRALISIEREN
// Diese Klasse kümmert sich ausschließlich um das Laden, Speichern
// und Cachen von Anwendungsdaten.
// #################################################################
const DataHelper = {
    todayDataCache: null,

    async getTodayData() {
        if (this.todayDataCache === null) {
            console.log('Lade Tagesdaten vom Server...');
            const result = await System.load('dailyForm', { datum: new Date().toISOString().split('T')[0] });
            this.todayDataCache = (result.success && result.data.length > 0) ? result.data[0] : {};
        }
        return this.todayDataCache;
    },

    async saveTodayData(data) {
        if (this.todayDataCache && this.todayDataCache.id) {
            data.id = this.todayDataCache.id;
        }
        const result = await System.save('dailyForm', data);
        if (result.success) {
            this.todayDataCache = { ...this.todayDataCache, ...data, id: result.id };
            console.log('Daten erfolgreich gespeichert und Cache aktualisiert.');
            return true;
        }
        return false;
    }
};

// #################################################################
// BUSINESS-LOGIK: DER "DIRIGENT" DER ANWENDUNG
// Dieser Teil startet, wenn die Seite geladen ist. Er verbindet die
// UI-Komponenten mit der Datenlogik des DataHelpers.
// #################################################################
document.addEventListener('DOMContentLoaded', () => {

    // 1. Referenzen auf die UI-Komponenten aus dem DOM holen
    const gewichtTile = document.getElementById('tile-gewicht');
    const schlafTile = document.getElementById('tile-schlaf');
    const stressSlider = document.querySelector('range-slider[name="stress_level"]');
    const notizenArea = document.querySelector('textarea-field[name="notizen"]');
    const saveButton = document.getElementById('save-button');

    /**
     * Füllt die UI-Komponenten mit den Daten aus dem DataHelper.
     * Trennt die Datenlogik (getTodayData) von der UI-Logik (setAttribute/value).
     */
    async function populateUI() {
        const data = await DataHelper.getTodayData();

        // Visualisierungs-Komponenten aktualisieren
        gewichtTile.setAttribute('value', data.gewicht || '--');
        schlafTile.setAttribute('value', data.schlafqualitaet || '--');

        // Formular-Komponenten füllen
        stressSlider.value = data.stress_level || 3;
        notizenArea.value = data.notizen || '';
    }

    /**
     * Sammelt die aktuellen Werte aus den Formular-Komponenten und
     * übergibt sie an den DataHelper zum Speichern.
     */
    async function handleSave() {
        const dataToSave = {
            stress_level: stressSlider.value,
            notizen: notizenArea.value,
            // Das Feld 'gewicht' wird hier nicht gespeichert, da es kein Eingabefeld ist.
        };

        saveButton.disabled = true; // Button deaktivieren
        const success = await DataHelper.saveTodayData(dataToSave);
        if (success) {
            alert('Gespeichert!');
            await populateUI(); // UI mit den frisch gespeicherten Daten aktualisieren
        } else {
            alert('Fehler beim Speichern.');
        }
        saveButton.disabled = false; // Button wieder aktivieren
    }

    // Event Listener für den Speicher-Button mit der Logik verbinden
    saveButton.addEventListener('click', handleSave);

    // Die App initial mit Daten befüllen, wenn sie startet
    populateUI();
});
