// system/components/value-tile.js

class ValueTile extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    // Beobachtet Änderungen an den Attributen, um die Komponente bei Bedarf neu zu rendern.
    static get observedAttributes() {
        return ['label', 'value', 'trend', 'color', 'chart'];
    }

    connectedCallback() {
        this.render();
    }
    
    // Rendert neu, wenn sich eines der beobachteten Attribute ändert.
    attributeChangedCallback() {
        // Stellt sicher, dass die Komponente nur neu gerendert wird, wenn sie bereits im DOM ist.
        if (this.shadowRoot.innerHTML) {
            this.render();
        }
    }

    render() {
        const label = this.getAttribute('label') || '';
        const value = this.getAttribute('value') || '';
        const trend = this.getAttribute('trend') || 'flat';
        const color = this.getAttribute('color') || 'neutral';
        
        // REFINEMENT: Setzt die Klasse direkt auf dem Host-Element (`<value-tile>`),
        // damit die `:host(.positive)`-Selektoren im CSS funktionieren.
        this.classList.remove('positive', 'negative', 'neutral'); // Entfernt alte Klassen
        this.classList.add(color); // Fügt die neue Klasse hinzu

        let chart = [];
        try {
            chart = JSON.parse(this.getAttribute('chart') || '[]');
        } catch (e) {
            console.error('Ungültiges JSON für das chart-Attribut in value-tile:', e);
        }

        const trendSymbol = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '→';

        // Findet den Maximalwert im Chart für die Skalierung der Balken.
        const maxValue = chart.length > 0 ? Math.max(...chart) : 1;
        const safeMaxValue = maxValue === 0 ? 1 : maxValue; // Verhindert eine Division durch Null.

        const barsHTML = chart.map((val, i) => {
            const percent = Math.max(5, Math.min(100, (val / safeMaxValue) * 100));
            const isToday = i === chart.length - 1 ? 'today' : '';
            return `<div class="chart-bar ${isToday}" style="height: ${percent}%;" title="${val}"></div>`;
        }).join('');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    flex-grow: 1;
                    min-width: 140px;
                    border-radius: var(--border-radius, 12px);
                    padding: 14px;
                    background: var(--background-box, white);
                    box-shadow: var(--box-shadow, 0 2px 8px rgba(0,0,0,0.08));
                }
                .stat-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 1.4em;
                    font-weight: bold;
                    color: var(--text-color-dark, #333);
                }
                /* Die Farbe des Trend-Pfeils wird durch die Klasse des Hosts bestimmt */
                :host(.positive) .stat-trend { color: var(--color-positive, #28a745); }
                :host(.negative) .stat-trend { color: var(--color-negative, #dc3545); }
                :host(.neutral) .stat-trend { color: var(--color-neutral, #6c757d); }

                .stat-label {
                    font-size: 0.8em;
                    font-weight: 500;
                    color: var(--text-color-dark, #333);
                    margin-top: 6px;
                    text-transform: uppercase;
                }
                .mini-chart {
                    display: flex;
                    align-items: flex-end;
                    gap: 4px;
                    margin-top: 8px;
                    height: 32px;
                }
                .chart-bar {
                    flex: 1;
                    background: var(--color-neutral, #ccc);
                    border-radius: 4px 4px 0 0;
                    transition: height 0.3s ease-out;
                }
                .chart-bar.today {
                    background: var(--primary-color, #86a8e7);
                }
                /* Überschreibt die Farbe des "heutigen" Balkens basierend auf dem Trend */
                :host(.positive) .chart-bar.today {
                    background: var(--color-positive, #28a745);
                }
                :host(.negative) .chart-bar.today {
                    background: var(--color-negative, #dc3545);
                }
            </style>
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-value">${value}</div>
                    <div class="stat-trend">${trendSymbol}</div>
                </div>
                <div class="stat-label">${label}</div>
                <div class="mini-chart">
                    ${barsHTML}
                </div>
            </div>
        `;
    }
}

customElements.define('value-tile', ValueTile);
