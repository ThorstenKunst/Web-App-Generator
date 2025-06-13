// system/components/date-selector.js

class DateSelector extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._date = new Date(); // Interner Zustand für das Datum
    }

    connectedCallback() {
        // Wenn ein 'value' Attribut gesetzt ist (z.B. YYYY-MM-DD), wird es verwendet
        if (this.hasAttribute('value')) {
            // Zeitzonenprobleme vermeiden, indem wir die Zeit auf Mittag setzen
            this._date = new Date(this.getAttribute('value') + 'T12:00:00');
        }
        this.render();

        // Event-Listener für die Pfeil-Buttons
        this.shadowRoot.querySelector('.prev-btn').addEventListener('click', () => this.changeDate(-1));
        this.shadowRoot.querySelector('.next-btn').addEventListener('click', () => this.changeDate(1));
    }
    
    // Ändert das Datum um eine bestimmte Anzahl von Tagen
    changeDate(days) {
        this._date.setDate(this._date.getDate() + days);
        // Attribut aktualisieren, um den Zustand im DOM widerzuspiegeln
        this.setAttribute('value', this.formattedDate);
        this.render();
        // Event auslösen, um die app.js über die Datumsänderung zu informieren
        this.dispatchEvent(new CustomEvent('date-change', {
            detail: {
                date: this.formattedDate
            }
        }));
    }

    // Getter für den aktuellen Wert im YYYY-MM-DD Format
    get value() {
        return this.formattedDate;
    }

    // Gibt das Datum im YYYY-MM-DD Format zurück
    get formattedDate() {
        return this._date.toISOString().split('T')[0];
    }
    
    // Gibt das Datum formatiert für die Anzeige zurück (z.B. "Heute", "Gestern", "12.06.2025")
    get displayDate() {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        // Zeitanteile für den Vergleich entfernen
        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        this._date.setHours(0, 0, 0, 0);

        if (this._date.getTime() === today.getTime()) {
            return 'Heute';
        }
        if (this._date.getTime() === yesterday.getTime()) {
            return 'Gestern';
        }
        // Deutsches Datumsformat
        return this._date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    background: rgba(240, 240, 245, 0.6); /* Leichter, transparenter Hintergrund */
                    border-radius: 12px;
                    padding: 8px 16px;
                    margin: 16px 0;
                }
                .selector-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .date-display {
                    font-weight: bold;
                    font-size: 1.1em;
                    color: #333;
                }
                .nav-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.8em;
                    color: #86a8e7; /* Passend zum Header-Farbverlauf */
                    padding: 0 10px;
                }
            </style>
            <div class="selector-container">
                <button class="nav-btn prev-btn">‹</button>
                <span class="date-display">${this.displayDate}</span>
                <button class="nav-btn next-btn">›</button>
            </div>
        `;
    }
}

customElements.define('date-selector', DateSelector);
