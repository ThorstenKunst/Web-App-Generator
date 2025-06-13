// system/components/settings-item.js

class SettingsItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        // Beobachtet Änderungen an diesen Attributen, um die Komponente neu zu rendern.
        return ['icon', 'label', 'description'];
    }

    connectedCallback() {
        this.render();

        // REFINEMENT: Macht das gesamte Element klickbar und löst ein Event aus.
        // Das ist nützlich für Items, die als Links fungieren (z.B. "Stammdaten >").
        this.addEventListener('click', (e) => {
            // Verhindern, dass der Klick ein Event auslöst, wenn der Benutzer
            // direkt auf ein interaktives Element im Slot klickt (z.B. den Toggle-Switch).
            if (e.target.closest('toggle-switch')) {
                return;
            }
            
            this.dispatchEvent(new CustomEvent('item-click', {
                bubbles: true,
                composed: true
            }));
        });
    }

    // Rendert die Komponente neu, wenn sich ein Attribut ändert.
    attributeChangedCallback() {
        this.render();
    }

    render() {
        const icon = this.getAttribute('icon') || '';
        const label = this.getAttribute('label') || '';
        const description = this.getAttribute('description') || '';

        // REFINEMENT: Fügt ein 'action'-Attribut hinzu. Wenn es gesetzt ist, wird ein ">"-Pfeil angezeigt.
        const hasAction = this.hasAttribute('action');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    padding: 12px 16px;
                    border-bottom: 1px solid #eee;
                    background: white;
                    /* Ändert den Cursor, wenn das Item eine Aktion hat (klickbar ist) */
                    cursor: ${hasAction ? 'pointer' : 'default'};
                    transition: background-color 0.2s;
                }
                :host([action]:hover) {
                    background-color: #f9f9f9;
                }
                .row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .info {
                    display: flex;
                    align-items: center;
                    gap: 16px; /* Etwas mehr Abstand */
                }
                .icon {
                    font-size: 1.4rem;
                    opacity: 0.6;
                    width: 24px; /* Feste Breite für Ausrichtung */
                    text-align: center;
                }
                .text {
                    display: flex;
                    flex-direction: column;
                }
                .label {
                    font-weight: 600;
                }
                .description {
                    font-size: 0.9rem;
                    color: #666;
                }
                .action-slot {
                    margin-left: auto; /* Sorgt dafür, dass der Slot immer rechts ist */
                }
                .chevron {
                    color: #ccc;
                    font-weight: bold;
                }
            </style>
            <div class="row">
                <div class="info">
                    <span class="icon">${icon}</span>
                    <div class="text">
                        <span class="label">${label}</span>
                        <span class="description">${description}</span>
                    </div>
                </div>
                <div class="action-slot">
                    <slot></slot>
                    <!-- Zeigt den Pfeil nur an, wenn das 'action'-Attribut gesetzt ist und kein Element im Slot ist -->
                    ${hasAction && this.children.length === 0 ? `<span class="chevron">›</span>` : ''}
                </div>
            </div>
        `;
    }
}

customElements.define('settings-item', SettingsItem);
