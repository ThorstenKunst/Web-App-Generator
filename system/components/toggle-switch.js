// system/components/toggle-switch.js

class ToggleSwitch extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.querySelector('input').addEventListener('change', (e) => {
            this.toggleAttribute('checked', e.target.checked);
            this.dispatchEvent(new Event('change'));
        });
    }

    get checked() {
        return this.hasAttribute('checked');
    }

    set checked(val) {
        const isChecked = Boolean(val);
        this.shadowRoot.querySelector('input').checked = isChecked;
        this.toggleAttribute('checked', isChecked);
    }

    get value() {
        return this.checked ? 'on' : '';
    }

    render() {
        const label = this.getAttribute('label') || '';
        const name = this.getAttribute('name') || '';
        const isChecked = this.hasAttribute('checked');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    margin: 8px 0;
                    cursor: pointer;
                    user-select: none;
                }
                .label-text {
                    font-family: inherit;
                }
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 40px;
                    height: 22px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: var(--color-neutral);
                    border-radius: 34px;
                    transition: 0.2s;
                }
                .slider::before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 3px;
                    bottom: 3px;
                    background-color: var(--text-color-light);
                    border-radius: 50%;
                    transition: 0.2s;
                }
                input:checked + .slider {
                    background-color: var(--color-positive);
                }
                input:checked + .slider::before {
                    transform: translateX(18px);
                }
            </style>

            <label class="label-text">
                <span class="switch">
                    <input type="checkbox" name="${name}" ${isChecked ? 'checked' : ''}>
                    <span class="slider"></span>
                </span>
                ${label}
            </label>
        `;
    }
}

customElements.define('toggle-switch', ToggleSwitch);
