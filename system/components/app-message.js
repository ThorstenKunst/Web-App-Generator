// system/components/app-message.js

class AppMessage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    // Rendert neu, wenn sich das 'type'-Attribut ändert
    static get observedAttributes() {
        return ['type'];
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const type = this.getAttribute('type') || 'info';

        // Wählt die passende CSS-Variable basierend auf dem Typ
        let backgroundVar = 'var(--background-box)'; // Standard-Fallback
        let colorVar = 'var(--text-color-dark)';

        if (type === 'info') {
            backgroundVar = 'var(--gradient-info, linear-gradient(to right, #8e9eab, #eef2f3))';
            colorVar = 'var(--text-color-dark, #333)';
        } else if (type === 'alert') {
            backgroundVar = 'var(--gradient-alert, linear-gradient(to right, #ff6a6a, #ffb86c))';
            colorVar = 'var(--text-color-light, white)';
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin: 16px 0;
                }
                .message {
                    padding: 16px;
                    border-radius: var(--border-radius, 12px);
                    background: ${backgroundVar};
                    color: ${colorVar};
                    font-weight: 500;
                    font-size: 0.95rem;
                    box-shadow: var(--box-shadow, 0 2px 6px rgba(0,0,0,0.05));
                }
            </style>
            <div class="message">
                <slot></slot>
            </div>
        `;
    }
}

customElements.define('app-message', AppMessage);
