// system/components/app-overlay.js

class AppOverlay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        // Listener für den dunklen Hintergrund, um das Overlay zu schließen
        this.shadowRoot.querySelector('.backdrop').addEventListener('click', () => this.close());
    }

    // Öffnet das Overlay
    open() {
        this.setAttribute('open', '');
    }

    // Schließt das Overlay
    close() {
        this.removeAttribute('open');
    }

    // Beobachtet das 'open'-Attribut, um die CSS-Klassen zu steuern
    static get observedAttributes() {
        return ['open'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'open') {
            // Die .visible-Klasse steuert die Animation
            this.shadowRoot.querySelector('.panel').classList.toggle('visible', this.hasAttribute('open'));
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    top: 0; right: 0; bottom: 0; left: 0;
                    z-index: 1000;
                    pointer-events: none;
                    visibility: hidden;
                }
                :host([open]) {
                    pointer-events: auto;
                    visibility: visible;
                }

                .backdrop {
                    position: absolute;
                    width: 100%; height: 100%;
                    /* Greift auf die neue Variable aus theme.css zu */
                    background: var(--overlay-backdrop, rgba(0, 0, 0, 0.4));
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                :host([open]) .backdrop {
                    opacity: 1;
                }

                .panel {
                    position: absolute;
                    top: 0; right: 0;
                    height: 100%;
                    width: 100%;
                    max-width: 480px;
                    /* Greift auf die Variablen für Hintergrund und Schatten zu */
                    background: var(--background-main, #f4f7fa);
                    box-shadow: var(--box-shadow, -4px 0 8px rgba(0,0,0,0.2));
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }
                .panel.visible {
                    transform: translateX(0);
                }

                /* Der Header und Body werden jetzt vollständig über Slots gesteuert */
                ::slotted([slot="header"]) {
                    flex-shrink: 0;
                }
                .body-slot-wrapper {
                    padding: 16px;
                    overflow-y: auto;
                    flex-grow: 1;
                }
            </style>

            <div class="backdrop"></div>
            <div class="panel">
                <slot name="header"></slot>
                <div class="body-slot-wrapper">
                    <slot name="body"></slot>
                </div>
            </div>
        `;
    }
}

customElements.define('app-overlay', AppOverlay);
