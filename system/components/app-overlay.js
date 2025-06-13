// system/components/app-overlay.js

class AppOverlay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        
        // Listener für den dunklen Hintergrund
        this.shadowRoot.querySelector('.backdrop').addEventListener('click', () => this.close());
        
        // Listener für den expliziten Schließen-Button (falls vorhanden)
        const closeBtn = this.shadowRoot.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
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
            const panel = this.shadowRoot.querySelector('.panel');
            if (this.hasAttribute('open')) {
                panel.classList.add('visible');
            } else {
                panel.classList.remove('visible');
            }
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    top: 0; right: 0; bottom: 0; left: 0;
                    z-index: 1000;
                    /* Standardmäßig unsichtbar und nicht klickbar */
                    pointer-events: none;
                    visibility: hidden;
                }
                :host([open]) {
                    /* Wird sichtbar und klickbar, wenn das 'open'-Attribut gesetzt ist */
                    pointer-events: auto;
                    visibility: visible;
                }

                .backdrop {
                    position: absolute;
                    width: 100%; height: 100%;
                    background: rgba(0, 0, 0, 0.4);
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
                    max-width: 480px; /* Typische Breite für eine Seitenleiste */
                    background: #f4f7fa; /* Heller Hintergrund für den Inhalt */
                    box-shadow: -4px 0 15px rgba(0, 0, 0, 0.2);
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }
                .panel.visible {
                    transform: translateX(0);
                }

                /* REFINEMENT: Der Header wird jetzt vollständig durch einen Slot gesteuert */
                ::slotted([slot="header"]) {
                    flex-shrink: 0; /* Verhindert, dass der Header schrumpft */
                }

                .body {
                    padding: 16px;
                    overflow-y: auto;
                    flex-grow: 1; /* Nimmt den restlichen Platz ein */
                }
            </style>

            <div class="backdrop"></div>
            <div class="panel">
                <!-- REFINEMENT: Der Header ist jetzt ein Slot. Wir übergeben die Kontrolle nach außen. -->
                <slot name="header"></slot>

                <div class="body">
                    <slot name="body"></slot>
                </div>
            </div>
        `;
    }
}

customElements.define('app-overlay', AppOverlay);
