// system/components/section-box.js

class SectionBox extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.expanded = true;
    }

    connectedCallback() {
        this.expanded = !this.hasAttribute('collapsed');
        this.render();
        const header = this.shadowRoot.querySelector('.header');
        if (header) {
            header.addEventListener('click', () => this.toggle());
        }
    }

    toggle() {
        this.expanded = !this.expanded;
        this.render();
    }

    render() {
        const title = this.getAttribute('title') || '';
        const toggleSymbol = this.expanded ? '▾' : '▸';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    border: 1px solid var(--color-neutral);
                    border-radius: var(--border-radius);
                    margin: 16px 0;
                    background: var(--background-box);
                    box-shadow: var(--box-shadow);
                    overflow: hidden;
                }
                .header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: var(--background-box-header);
                    cursor: pointer;
                    border-bottom: 1px solid var(--background-box-header);
                    user-select: none;
                }
                .header h2 {
                    margin: 0;
                    font-size: 1em;
                    font-weight: 600;
                    color: var(--text-color-dark);
                }
                .toggle-btn {
                    font-size: 1.2em;
                }
                .content, .footer {
                    padding: 16px;
                }
                .footer {
                    border-top: 1px solid var(--background-box-header);
                    background: var(--background-footer);
                }
                .hidden {
                    display: none;
                }
            </style>

            <div class="header">
                <h2>${title}</h2>
                <span class="toggle-btn">${toggleSymbol}</span>
            </div>

            <div class="content ${this.expanded ? '' : 'hidden'}">
                <slot></slot>
            </div>

            <div class="footer ${this.expanded ? '' : 'hidden'}">
                <slot name="footer"></slot>
            </div>
        `;
    }
}

customElements.define('section-box', SectionBox);
