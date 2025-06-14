// system/components/modal-dialog.js

class ModalDialog extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.querySelector('.backdrop').addEventListener('click', () => this.cancel());
        this.shadowRoot.querySelector('.close-btn').addEventListener('click', () => this.cancel());
        this.shadowRoot.querySelector('.footer').addEventListener('click', (e) => {
            if (e.target.matches('.confirm-btn')) this.confirm();
            if (e.target.matches('.cancel-btn')) this.cancel();
        });
    }

    open() { this.setAttribute('open', ''); }
    close() { this.removeAttribute('open'); }

    confirm() {
        this.dispatchEvent(new Event('confirm'));
        this.close();
    }

    cancel() {
        this.dispatchEvent(new Event('cancel'));
        this.close();
    }

    static get observedAttributes() {
        return ['open', 'title', 'type', 'confirm-label', 'cancel-label'];
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const title = this.getAttribute('title') || 'Hinweis';
        const type = this.getAttribute('type') || 'alert';
        const confirmLabel = this.getAttribute('confirm-label') || 'OK';
        const cancelLabel = this.getAttribute('cancel-label') || 'Abbrechen';

        const confirmButton = `<button class="confirm-btn">${confirmLabel}</button>`;
        const cancelButton = type === 'confirm'
            ? `<button class="cancel-btn secondary">${cancelLabel}</button>`
            : '';

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
                    background: var(--overlay-backdrop);
                    opacity: 0;
                    transition: opacity 0.2s ease-in-out;
                }
                :host([open]) .backdrop {
                    opacity: 1;
                }
                .modal {
                    position: relative;
                    background: var(--background-box);
                    border-radius: var(--border-radius);
                    box-shadow: var(--box-shadow);
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
                    border-bottom: 1px solid var(--background-box-header);
                }
                .close-btn {
                    font-size: 1.5rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--color-neutral);
                }
                .body {
                    padding: 24px 16px;
                }
                .footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 16px;
                    background: var(--background-box-header);
                    border-top: 1px solid var(--background-box-header);
                    border-radius: 0 0 var(--border-radius) var(--border-radius);
                }
                button {
                    padding: 10px 20px;
                    border-radius: var(--border-radius);
                    border: none;
                    font-weight: bold;
                    cursor: pointer;
                }
                .confirm-btn {
                    background: var(--primary-color);
                    color: var(--text-color-light);
                }
                .secondary {
                    background: var(--background-box-header);
                    color: var(--text-color-dark);
                }
            </style>
            <div class="backdrop"></div>
            <div class="modal">
                <div class="header">
                    <span class="title">${title}</span>
                    <button class="close-btn">×</button>
                </div>
                <div class="body">
                    <slot></slot>
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
