// system/components/input-field.js

class InputField extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        const input = this.shadowRoot.querySelector('input');

        // Leitet das 'input'-Event nach außen weiter, damit die app.js darauf reagieren kann
        input.addEventListener('input', () => {
            this.dispatchEvent(new Event('input'));
        });
        
        // REFINEMENT: Event-Listener für die neuen Stepper-Buttons hinzufügen
        this.shadowRoot.querySelector('.input-wrapper').addEventListener('click', (e) => {
            if (e.target.matches('.stepper-up')) {
                this.step(1);
            }
            if (e.target.matches('.stepper-down')) {
                this.step(-1);
            }
        });
    }

    // Erhöht oder verringert den Wert des Inputs
    step(direction) {
        const input = this.shadowRoot.querySelector('input');
        const step = parseFloat(this.getAttribute('step')) || 1;
        let currentValue = parseFloat(input.value) || 0;
        
        // Formatiert das Ergebnis, um Rundungsfehler bei Kommazahlen zu vermeiden
        const decimalPlaces = (step.toString().split('.')[1] || '').length;
        input.value = (currentValue + direction * step).toFixed(decimalPlaces);

        // Löst ein Event aus, um die Änderung bekannt zu geben
        this.dispatchEvent(new Event('input'));
    }

    get value() {
        return this.shadowRoot.querySelector('input')?.value || '';
    }

    set value(val) {
        if(this.shadowRoot.querySelector('input')) {
            this.shadowRoot.querySelector('input').value = val;
        }
    }

    render() {
        const label = this.getAttribute('label') || '';
        const name = this.getAttribute('name') || '';
        const value = this.getAttribute('value') || '';
        const suffix = this.getAttribute('suffix') || '';
        // REFINEMENT: Neues 'type'-Attribut, standardmäßig 'text'
        const type = this.getAttribute('type') || 'text';
        // REFINEMENT: Neues 'step'-Attribut für die Schrittweite
        const step = this.getAttribute('step') || '1';

        // Die Stepper-Buttons werden nur angezeigt, wenn der Typ 'number' ist
        const stepperHTML = type === 'number' 
            ? `<div class="steppers">
                 <button type="button" class="stepper-up">▲</button>
                 <button type="button" class="stepper-down">▼</button>
               </div>`
            : '';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin: 12px 0;
                }
                label {
                    display: block;
                    font-size: 0.9em;
                    margin-bottom: 6px;
                    color: #333;
                }
                .input-wrapper {
                    display: flex;
                    align-items: center;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    padding: 0 12px; /* Padding links und rechts für Suffix/Stepper */
                    background: #fff;
                }
                input {
                    flex: 1;
                    border: none;
                    font-size: 1em;
                    background: transparent;
                    outline: none;
                    padding: 8px 0; /* Padding innen für Höhe */
                    width: 100%; /* Wichtig für Flexbox */
                }
                .suffix {
                    font-size: 0.9em;
                    color: #666;
                    margin-left: 8px;
                }
                .steppers {
                    display: flex;
                    flex-direction: column;
                    margin-left: 8px;
                }
                .steppers button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #999;
                    font-size: 0.6em;
                    line-height: 1;
                    padding: 2px 4px;
                }
            </style>
            <label>${label}</label>
            <div class="input-wrapper">
                <input type="${type}" name="${name}" value="${value}" step="${step}">
                ${stepperHTML}
                ${suffix ? `<span class="suffix">${suffix}</span>` : ''}
            </div>
        `;
    }
}

customElements.define('input-field', InputField);
