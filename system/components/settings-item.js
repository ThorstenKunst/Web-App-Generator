// system/components/settings-item.js

class SettingsItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['icon', 'label', 'description'];
    }

    connectedCallback() {
        this.render();
        this.addEventListener('click', (e) => {
            if (e.target.closest('toggle-switch')) return;
            this.dispatchEvent(new CustomEvent('item-click', {
                bubbles: true,
                composed: true
            }));
        });
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const icon = this.getAttribute('icon') || '';
        const label = this.getAttribute('label') || '';
        const description = this.getAttribute('description') || '';
        const hasAction = this.hasAttribute('action');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--background-box-header);
                    background: var(--background-box);
                    cursor: ${hasAction ? 'pointer' : 'default'};
                    transition: background-color 0.2s;
                }
                :host([action]:hover) {
                    background-color: var(--background-box-header);
                }
                .row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .icon {
                    font-size: 1.4rem;
                    opacity: 0.6;
                    width: 24px;
                    text-align: center;
                }
                .text {
                    display: flex;
                    flex-direction: column;
                }
                .label {
                    font-weight: 600;
                }
                .description {
                    font-size: 0.9rem;
                    color: var(--color-neutral);
                }
                .action-slot {
                    margin-left: auto;
                }
                .chevron {
                    color: var(--color-neutral);
                    font-weight: bold;
                }
            </style>
            <div class="row">
                <div class="info">
                    <span class="icon">${icon}</span>
                    <div class="text">
                        <span class="label">${label}</span>
                        <span class="description">${description}</span>
                    </div>
                </div>
                <div class="action-slot">
                    <slot></slot>
                    ${hasAction && this.children.length === 0 ? `<span class="chevron">›</span>` : ''}
                </div>
            </div>
        `;
    }
}

customElements.define('settings-item', SettingsItem);
