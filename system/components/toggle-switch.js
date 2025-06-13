// system/components/toggle-switch.js

class ToggleSwitch extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        // Der interne Zustand wird durch das <input>-Element selbst verwaltet.
    }

    connectedCallback() {
        // Initiales Rendern der Komponente
        this.render();

        // Event-Listener für das interne <input>-Element.
        // Wenn es sich ändert, leiten wir das Event nach außen weiter.
        this.shadowRoot.querySelector('input').addEventListener('change', (e) => {
            // REFINEMENT: Den 'checked'-Zustand als Attribut auf dem Host-Element widerspiegeln.
            // Das macht den Zustand im DOM sichtbar (z.B. für CSS-Selektoren wie `toggle-switch[checked]`)
            this.toggleAttribute('checked', e.target.checked);
            
            // Ein 'change'-Event von unserer Komponente auslösen, damit die Außenwelt darauf reagieren kann.
            this.dispatchEvent(new Event('change'));
        });
    }

    /**
     * Getter für den `checked`-Zustand.
     * @returns {boolean}
     */
    get checked() {
        return this.hasAttribute('checked');
    }

    /**
     * Setter für den `checked`-Zustand.
     * @param {boolean} val
     */
    set checked(val) {
        const isChecked = Boolean(val);
        this.shadowRoot.querySelector('input').checked = isChecked;
        this.toggleAttribute('checked', isChecked);
    }
    
    /**
     * Getter für den `value` der Komponente, analog zu einem echten Formular-Element.
     * @returns {string} - Gibt 'on' zurück wenn checked, sonst leer.
     */
    get value() {
        return this.checked ? 'on' : '';
    }

    /**
     * Rendert das HTML und CSS der Komponente.
     */
    render() {
        const label = this.getAttribute('label') || '';
        const name = this.getAttribute('name') || '';
        // Der initiale 'checked'-Status wird direkt vom Attribut gelesen.
        const isChecked = this.hasAttribute('checked');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    margin: 8px 0;
                    cursor: pointer;
                    user-select: none;
                }
                .label-text {
                    font-family: inherit; /* Stellt sicher, dass die Schriftart der Seite übernommen wird */
                }
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 40px;
                    height: 22px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    border-radius: 34px;
                    transition: 0.2s;
                }
                .slider::before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    border-radius: 50%;
                    transition: 0.2s;
                }
                input:checked + .slider {
                    background-color: #4caf50; /* Grün, wenn aktiv */
                }
                input:checked + .slider::before {
                    transform: translateX(18px);
                }
            </style>

            <label class="label-text">
                <span class="switch">
                    <input type="checkbox" name="${name}" ${isChecked ? 'checked' : ''}>
                    <span class="slider"></span>
                </span>
                ${label}
            </label>
        `;
    }
}

customElements.define('toggle-switch', ToggleSwitch);
