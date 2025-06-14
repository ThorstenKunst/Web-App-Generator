// system/components/date-selector.js

class DateSelector extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._date = new Date();
    }

    connectedCallback() {
        if (this.hasAttribute('value')) {
            this._date = new Date(this.getAttribute('value') + 'T12:00:00');
        }
        this.render();

        this.shadowRoot.querySelector('.prev-btn').addEventListener('click', () => this.changeDate(-1));
        this.shadowRoot.querySelector('.next-btn').addEventListener('click', () => this.changeDate(1));
    }

    changeDate(days) {
        this._date.setDate(this._date.getDate() + days);
        this.setAttribute('value', this.formattedDate);
        this.render();
        this.dispatchEvent(new CustomEvent('date-change', {
            detail: { date: this.formattedDate }
        }));
    }

    get value() {
        return this.formattedDate;
    }

    get formattedDate() {
        return this._date.toISOString().split('T')[0];
    }

    get displayDate() {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        this._date.setHours(0, 0, 0, 0);

        if (this._date.getTime() === today.getTime()) return 'Heute';
        if (this._date.getTime() === yesterday.getTime()) return 'Gestern';

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
                    background: var(--background-footer);
                    border-radius: var(--border-radius);
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
                    color: var(--text-color-dark);
                }
                .nav-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.8em;
                    color: var(--primary-color);
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
