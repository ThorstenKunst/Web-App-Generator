// system/components/form-button.js

class FormButton extends HTMLElement {
    static formAssociated = true;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.internals_ = this.attachInternals();
    }

    static get observedAttributes() {
        return ['disabled'];
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.querySelector('button').addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.disabled) {
                this.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
                if (this.getAttribute('type') === 'submit') {
                    this.internals_.form.requestSubmit();
                }
            }
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'disabled') {
            this.shadowRoot.querySelector('button').disabled = this.disabled;
        }
    }

    get disabled() {
        return this.hasAttribute('disabled');
    }

    set disabled(val) {
        if (val) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }

    render() {
        const label = this.getAttribute('label') || 'Speichern';
        const type = this.getAttribute('type') || 'submit';
        const isDisabled = this.hasAttribute('disabled');

        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; }
                button {
                    width: 100%;
                    padding: 12px 20px;
                    background: var(--primary-gradient);
                    border: none;
                    border-radius: var(--border-radius);
                    color: var(--text-color-light);
                    font-weight: bold;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                button:hover {
                    filter: brightness(1.1);
                }
                button:disabled {
                    background: var(--color-neutral);
                    cursor: not-allowed;
                    filter: none;
                }
            </style>
            <button type="button" ${isDisabled ? 'disabled' : ''}>${label}</button>
        `;
    }
}

customElements.define('form-button', FormButton);
