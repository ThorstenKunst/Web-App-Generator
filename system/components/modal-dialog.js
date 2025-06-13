// system/components/modal-dialog.js

class ModalDialog extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        // Event-Listener, um das Modal zu schließen
        this.shadowRoot.querySelector('.backdrop').addEventListener('click', () => this.cancel());
        this.shadowRoot.querySelector('.close-btn').addEventListener('click', () => this.cancel());
        this.shadowRoot.querySelector('.footer').addEventListener('click', (e) => {
            if (e.target.matches('.confirm-btn')) {
                this.confirm();
            }
            if (e.target.matches('.cancel-btn')) {
                this.cancel();
            }
        });
    }

    // Öffnet das Modal
    open() { this.setAttribute('open', ''); }
    // Schließt das Modal
    close() { this.removeAttribute('open'); }

    // Löst das 'confirm'-Event aus und schließt sich
    confirm() {
        this.dispatchEvent(new Event('confirm'));
        this.close();
    }
    
    // Löst das 'cancel'-Event aus und schließt sich
    cancel() {
        this.dispatchEvent(new Event('cancel'));
        this.close();
    }

    static get observedAttributes() {
        // Rendert neu, wenn sich diese Attribute ändern
        return ['open', 'title', 'type', 'confirm-label', 'cancel-label'];
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        // Attribute auslesen
        const title = this.getAttribute('title') || 'Hinweis';
        const type = this.getAttribute('type') || 'alert'; // 'alert' oder 'confirm'
        const confirmLabel = this.getAttribute('confirm-label') || 'OK';
        const cancelLabel = this.getAttribute('cancel-label') || 'Abbrechen';

        // Entscheiden, welche Buttons angezeigt werden
        const confirmButton = `<button class="confirm-btn">${confirmLabel}</button>`;
        const cancelButton = type === 'confirm' ? `<button class="cancel-btn secondary">${cancelLabel}</button>` : '';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    z-index: 2000;
                    display: flex; justify-content: center; align-items: center;
                    visibility: hidden; pointer-events: none;
                }
                :host([open]) {
                    visibility: visible; pointer-events: auto;
                }
                .backdrop {
                    position: absolute; width: 100%; height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    opacity: 0;
                    transition: opacity 0.2s ease-in-out;
                }
                :host([open]) .backdrop {
                    opacity: 1;
                }
                .modal {
                    position: relative;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                    width: 90%;
                    max-width: 450px;
                    z-index: 2001;
                    transform: scale(0.95);
                    opacity: 0;
                    transition: all 0.2s ease-in-out;
                }
                :host([open]) .modal {
                    transform: scale(1);
                    opacity: 1;
                }
                .header {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 16px;
                    font-weight: bold;
                    border-bottom: 1px solid #eee;
                }
                .close-btn { font-size: 1.5rem; background: none; border: none; cursor: pointer; color: #aaa; }
                .body { padding: 24px 16px; }
                .footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px; background: #f9f9f9; border-top: 1px solid #eee; border-radius: 0 0 12px 12px; }
                button { padding: 10px 20px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; }
                .confirm-btn { background: #7f7fd5; color: white; }
                .secondary { background: #eee; color: #333; }
            </style>
            <div class="backdrop"></div>
            <div class="modal">
                <div class="header">
                    <span class="title">${title}</span>
                    <button class="close-btn">×</button>
                </div>
                <div class="body">
                    <slot></slot> <!-- Hier kommt die Nachricht rein -->
                </div>
                <div class="footer">
                    ${cancelButton}
                    ${confirmButton}
                </div>
            </div>
        `;
    }
}

customElements.define('modal-dialog', ModalDialog);
