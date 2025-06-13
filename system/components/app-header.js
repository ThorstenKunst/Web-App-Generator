// system/components/app-header.js

class AppHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();

        // Event-Listener für den linken Navigations-Button
        const navButton = this.shadowRoot.querySelector('.nav-container icon-button');
        if (navButton) {
            navButton.addEventListener('click', (e) => {
                this.dispatchEvent(new CustomEvent('nav-click', {
                    bubbles: true,
                    composed: true
                }));
            });
        }

        // Event-Listener für die rechten Action-Buttons
        const actionsContainer = this.shadowRoot.querySelector('.actions-container');
        if (actionsContainer) {
            actionsContainer.addEventListener('click', (e) => {
                const clickedButton = e.target.closest('icon-button');
                if (clickedButton) {
                    const actionId = clickedButton.dataset.actionId;
                    if (actionId) {
                        this.dispatchEvent(new CustomEvent('action-click', {
                            detail: { actionId: actionId },
                            bubbles: true,
                            composed: true
                        }));
                    }
                }
            });
        }
    }

    render() {
        const title = this.getAttribute('title') || '';
        
        // REFINEMENT 1: Ein neues 'nav-action' Attribut für den linken Button
        const navActionAttr = this.getAttribute('nav-action');
        let navActionHTML = '';
        if (navActionAttr) {
            try {
                const action = JSON.parse(navActionAttr);
                navActionHTML = `<icon-button 
                                    icon="${action.icon || ''}" 
                                    tooltip="${action.tooltip || ''}">
                                 </icon-button>`;
            } catch (e) { console.error('Ungültiges JSON im nav-action-Attribut.'); }
        }

        // REFINEMENT 2: Das bestehende 'actions'-Attribut für die rechten Buttons bleibt
        const actionsAttr = this.getAttribute('actions');
        let actionsHTML = '';
        if (actionsAttr) {
            try {
                const actions = JSON.parse(actionsAttr);
                if (Array.isArray(actions)) {
                    actionsHTML = actions.map(action => 
                        `<icon-button 
                            icon="${action.icon || ''}" 
                            tooltip="${action.tooltip || ''}"
                            data-action-id="${action.id || ''}">
                         </icon-button>`
                    ).join('');
                }
            } catch (e) { console.error('Ungültiges JSON im actions-Attribut.'); }
        }

        this.shadowRoot.innerHTML = `
            <style>
                .header-container {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    background: linear-gradient(to right, #7f7fd5, #86a8e7, #91eae4);
                    color: white;
                    font-size: 1.2rem;
                    font-weight: bold;
                }
                .nav-container {
                    flex-shrink: 0; /* Verhindert, dass der Button schrumpft */
                    margin-right: 12px;
                }
                .title {
                    flex-grow: 1; /* Nimmt den verfügbaren Platz ein */
                    text-align: left; /* Standard-Ausrichtung */
                }
                .actions-container {
                    flex-shrink: 0;
                    display: flex;
                    gap: 8px;
                }
                /* REFINEMENT 3: Wenn es einen Nav-Button gibt, zentriert sich der Titel */
                :host([nav-action]) .title {
                    text-align: center;
                }
                /* Wenn es keine rechten Actions gibt, wird der Platz für den Nav-Button ausgeglichen */
                :host([nav-action]:not([actions])) .actions-container {
                    width: 40px; /* Ca. die Breite eines icon-buttons, für die Symmetrie */
                }
            </style>
            <div class="header-container">
                <div class="nav-container">${navActionHTML}</div>
                <div class="title">${title}</div>
                <div class="actions-container">${actionsHTML}</div>
            </div>
        `;
    }
}

customElements.define('app-header', AppHeader);
