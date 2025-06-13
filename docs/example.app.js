/**
 * BEISPIEL: Web Component für einen "Mood-Tracker"
 * Diese Klasse demonstriert Best Practices für den BaaS-Generator.
 *
 * 1.  Daten werden über System.load() geladen.
 * 2.  Daten werden über System.save() gespeichert.
 * 3.  Die gesamte UI und Logik ist in der Komponente gekapselt.
 * 4.  Shadow DOM wird verwendet, um Styling-Konflikte zu vermeiden.
 */
class MoodTracker extends HTMLElement {
    constructor() {
        super();
        // Shadow DOM für Kapselung erstellen
        this.attachShadow({ mode: 'open' });

        // Initialen Zustand setzen
        this.today = new Date().toISOString().split('T')[0];
        this.moodData = null; // Hier speichern wir die geladenen Daten
    }

    // Wird aufgerufen, wenn die Komponente zum DOM hinzugefügt wird
    connectedCallback() {
        this.loadMoodForToday();
    }

    /**
     * Lädt die Daten für den heutigen Tag mit System.load()
     */
    async loadMoodForToday() {
        // 'moodForm' ist der mappingName aus der app-config.json
        const result = await System.load('moodForm', { datum: this.today });
        if (result.success && result.data.length > 0) {
            this.moodData = result.data[0];
        }
        this.render(); // UI nach dem Laden (neu) zeichnen
    }

    /**
     * Speichert die Formulardaten mit System.save()
     * @param {Event} e Das Formular-Submit-Event
     */
    async saveMood(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.datum = this.today; // Sicherstellen, dass das Datum gesetzt ist

        // Wenn bereits ein Eintrag existiert, dessen ID für den UPDATE mitgeben
        if (this.moodData && this.moodData.id) {
            data.id = this.moodData.id;
        }

        const result = await System.save('moodForm', data);
        if (result.success) {
            // Lokalen Zustand aktualisieren und UI neu zeichnen
            this.moodData = { ...this.moodData, ...data, id: result.id };
            this.render();
            alert('Stimmung gespeichert!');
        } else {
            console.error("Fehler beim Speichern der Stimmung:", result.message);
            alert("Es gab einen Fehler beim Speichern.");
        }
    }

    /**
     * Zeichnet das komplette HTML der Komponente
     */
    render() {
        // Aktuelle Werte aus dem Zustand oder Standardwerte verwenden
        const currentMood = this.moodData ? parseInt(this.moodData.stimmung) : 3;
        const currentNotiz = this.moodData ? this.moodData.notiz : '';

        this.shadowRoot.innerHTML = `
            <style>
                /* Minimales internes Styling für die Komponente */
                div { border: 1px solid #ccc; padding: 15px; border-radius: 5px; margin-top: 20px; }
                form { display: flex; flex-direction: column; gap: 10px; }
                button { cursor: pointer; padding: 5px 10px; }
            </style>
            <div>
                <h3>Heutige Stimmung</h3>
                <form>
                    <label>Stimmung (1=schlecht, 5=super): <span>${currentMood}</span></label>
                    <input type="range" name="stimmung" min="1" max="5" value="${currentMood}">
                    
                    <label>Notiz:</label>
                    <textarea name="notiz">${currentNotiz}</textarea>
                    
                    <button type="submit">Speichern</button>
                </form>
            </div>
        `;

        // Event Listeners nach dem Rendern binden
        this.shadowRoot.querySelector('form').addEventListener('submit', (e) => this.saveMood(e));
        
        const rangeInput = this.shadowRoot.querySelector('input[type="range"]');
        const rangeValueSpan = this.shadowRoot.querySelector('span');
        rangeInput.addEventListener('input', () => {
            rangeValueSpan.textContent = rangeInput.value;
        });
    }
}

// Die Web Component für den Browser registrieren
customElements.define('mood-tracker', MoodTracker);

