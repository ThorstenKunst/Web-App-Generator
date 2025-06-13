// system/components/form-button.js

class FormButton extends HTMLElement {
    // REFINEMENT 1: Macht die Komponente für Formulare erkennbar.
    static formAssociated = true;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        // REFINEMENT 2: Erstellt eine Verbindung zum Formular-Kontext.
        this.internals_ = this.attachInternals();
    }
    
    // REFINEMENT 3: Definiert, welche Attribute beobachtet werden sollen.
    static get observedAttributes() {
        return ['disabled'];
    }

    // Wird aufgerufen, wenn die Komponente zum DOM hinzugefügt wird.
    connectedCallback() {
        this.render();

        // REFINEMENT 4: Leitet Klicks vom internen Button an die Komponente selbst weiter.
        // Das erlaubt <form-button>.addEventListener('click', ...).
        this.shadowRoot.querySelector('button').addEventListener('click', (e) => {
            // Verhindert doppelte Events, falls der Klick durchs Shadow DOM "blubbert"
            e.stopPropagation(); 
            // Wenn der Button nicht deaktiviert ist, simuliere einen Klick auf dem Host-Element
            if (!this.disabled) {
                this.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
                // Wenn es ein Submit-Button ist, versuche das Formular abzuschicken.
                if (this.getAttribute('type') === 'submit') {
                    this.internals_.form.requestSubmit();
                }
            }
        });
    }

    // Wird aufgerufen, wenn ein beobachtetes Attribut sich ändert.
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'disabled') {
            this.shadowRoot.querySelector('button').disabled = this.disabled;
        }
    }

    // Getter für den 'disabled'-Zustand
    get disabled() {
        return this.hasAttribute('disabled');
    }

    // Setter für den 'disabled'-Zustand
    set disabled(val) {
        if (val) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }

    render() {
        const label = this.getAttribute('label') || 'Speichern';
        // Der 'type' wird für die interne Logik verwendet, aber der Button selbst ist immer 'button',
        // um das Standard-Formularverhalten zu verhindern, das wir manuell steuern.
        const type = this.getAttribute('type') || 'submit'; 
        const isDisabled = this.hasAttribute('disabled');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                button {
                    width: 100%;
                    padding: 12px 20px;
                    background: linear-gradient(90deg, #7f7fd5, #86a8e7, #91eae4);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-weight: bold;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                button:hover {
                    filter: brightness(1.1);
                }
                /* REFINEMENT 5: Styling für den deaktivierten Zustand */
                button:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                    filter: none;
                }
            </style>
            <button type="button" ${isDisabled ? 'disabled' : ''}>${label}</button>
        `;
    }
}

customElements.define('form-button', FormButton);

