// system/components/button-set.js

class ButtonSet extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.querySelector('.button-container').addEventListener('click', (e) => {
            const clickedButton = e.target.closest('button');
            if (!clickedButton) return;

            const type = this.getAttribute('type') || 'multi';

            if (type === 'single') {
                this.shadowRoot.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                clickedButton.classList.add('active');
            } else {
                clickedButton.classList.toggle('active');
            }

            this.dispatchEvent(new Event('change'));
        });
    }

    get value() {
        const activeButtons = this.shadowRoot.querySelectorAll('button.active');
        const values = Array.from(activeButtons).map(btn => btn.dataset.value);
        return this.getAttribute('type') === 'single' ? values[0] || '' : values;
    }

    set value(values) {
        const type = this.getAttribute('type') || 'multi';
        const valuesArray = Array.isArray(values) ? values : [values];

        this.shadowRoot.querySelectorAll('button').forEach(btn => {
            if (valuesArray.includes(btn.dataset.value)) {
                btn.classList.add('active');
            } else if (type === 'single') {
                btn.classList.remove('active');
            }
        });
    }

    render() {
        const label = this.getAttribute('label') || '';
        const options = (this.getAttribute('options') || '').split(',');
        const initialValue = (this.getAttribute('value') || '').split(',');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin: 12px 0;
                }
                .label {
                    display: block;
                    font-size: 0.9em;
                    margin-bottom: 6px;
                    color: var(--text-color-dark);
                }
                .button-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                button {
                    padding: 8px 16px;
                    border: 1px solid var(--color-neutral);
                    border-radius: var(--border-radius);
                    background-color: var(--background-box-header);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                button.active {
                    background-color: var(--primary-color);
                    color: var(--text-color-light);
                    border-color: var(--primary-color);
                }
            </style>
            <label class="label">${label}</label>
            <div class="button-container">
                ${options.map(opt => `
                    <button data-value="${opt}" class="${initialValue.includes(opt) ? 'active' : ''}">
                        ${opt}
                    </button>`).join('')}
            </div>
        `;
    }
}

customElements.define('button-set', ButtonSet);
