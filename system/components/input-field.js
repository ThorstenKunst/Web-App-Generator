// system/components/input-field.js

class InputField extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        const input = this.shadowRoot.querySelector('input');

        input.addEventListener('input', () => {
            this.dispatchEvent(new Event('input'));
        });

        this.shadowRoot.querySelector('.input-wrapper').addEventListener('click', (e) => {
            if (e.target.matches('.stepper-up')) this.step(1);
            if (e.target.matches('.stepper-down')) this.step(-1);
        });
    }

    step(direction) {
        const input = this.shadowRoot.querySelector('input');
        const step = parseFloat(this.getAttribute('step')) || 1;
        let currentValue = parseFloat(input.value) || 0;
        const decimalPlaces = (step.toString().split('.')[1] || '').length;
        input.value = (currentValue + direction * step).toFixed(decimalPlaces);
        this.dispatchEvent(new Event('input'));
    }

    get value() {
        return this.shadowRoot.querySelector('input')?.value || '';
    }

    set value(val) {
        if (this.shadowRoot.querySelector('input')) {
            this.shadowRoot.querySelector('input').value = val;
        }
    }

    render() {
        const label = this.getAttribute('label') || '';
        const name = this.getAttribute('name') || '';
        const value = this.getAttribute('value') || '';
        const suffix = this.getAttribute('suffix') || '';
        const type = this.getAttribute('type') || 'text';
        const step = this.getAttribute('step') || '1';

        const stepperHTML = type === 'number'
            ? `<div class="steppers">
                   <button type="button" class="stepper-up">▲</button>
                   <button type="button" class="stepper-down">▼</button>
               </div>`
            : '';

        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; margin: 12px 0; }
                label {
                    display: block;
                    font-size: 0.9em;
                    margin-bottom: 6px;
                    color: var(--text-color-dark);
                }
                .input-wrapper {
                    display: flex;
                    align-items: center;
                    border: 1px solid var(--color-neutral);
                    border-radius: var(--border-radius);
                    padding: 0 12px;
                    background: var(--background-box);
                }
                input {
                    flex: 1;
                    border: none;
                    font-size: 1em;
                    background: transparent;
                    outline: none;
                    padding: 8px 0;
                    width: 100%;
                }
                .suffix {
                    font-size: 0.9em;
                    color: var(--color-neutral);
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
                    color: var(--color-neutral);
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
