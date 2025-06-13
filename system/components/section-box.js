class SectionBox extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Initialer Zustand wird im connectedCallback basierend auf Attributen gesetzt.
        this.expanded = true; 
    }

    connectedCallback() {
        // Zustand basierend auf dem 'collapsed'-Attribut beim ersten Laden setzen
        this.expanded = !this.hasAttribute('collapsed');
        
        // Die UI einmalig initial rendern
        this.render();

        // REFINEMENT: Den Event-Listener nur *einmal* beim Erstellen der Komponente binden.
        // Wir binden ihn an ein stabiles Elternelement (den Header), anstatt an den Button.
        // Das ist performanter, da wir nicht nach jedem `render` den Listener neu hinzufügen müssen.
        const header = this.shadowRoot.querySelector('.header');
        if (header) {
            header.addEventListener('click', () => this.toggle());
        }
    }

    /**
     * Schaltet den "expanded"-Zustand um und rendert die Komponente neu.
     */
    toggle() {
        this.expanded = !this.expanded;
        // Da der Listener am Header hängt, müssen wir ihn nach dem Rendern nicht neu hinzufügen.
        this.render();
    }

    /**
     * Rendert das gesamte HTML der Komponente basierend auf dem aktuellen Zustand.
     */
    render() {
        const title = this.getAttribute('title') || '';
        const toggleSymbol = this.expanded ? '▾' : '▸';
        const contentStyle = this.expanded ? 'block' : 'none';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    margin: 16px 0;
                    background: #fff;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    overflow: hidden; /* Verhindert, dass Inhalt bei geschlossener Box überlappt */
                }

                .header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: #f8f8f8;
                    cursor: pointer;
                    border-bottom: 1px solid #eee;
                    user-select: none; /* Verhindert das Markieren von Text beim Klicken */
                }

                .header h2 {
                    margin: 0;
                    font-size: 1em;
                    font-weight: 600;
                }
                
                .toggle-btn {
                    font-size: 1.2em;
                }

                /* REFINEMENT: Wir verwenden eine Klasse, um die Sichtbarkeit zu steuern,
                   anstatt Inline-Styles. Das ist sauberer. */
                .content, .footer {
                    padding: 16px;
                }

                .footer {
                    border-top: 1px solid #eee;
                    background: #fafafa;
                }
                
                .hidden {
                    display: none;
                }
            </style>

            <div class="header">
                <h2>${title}</h2>
                <span class="toggle-btn">${toggleSymbol}</span>
            </div>

            <!-- Die 'hidden'-Klasse wird dynamisch hinzugefügt oder entfernt -->
            <div class="content ${this.expanded ? '' : 'hidden'}">
                <slot></slot> <!-- Hier wird der Hauptinhalt eingefügt -->
            </div>

            <div class="footer ${this.expanded ? '' : 'hidden'}">
                <slot name="footer"></slot> <!-- Hier wird der Footer-Inhalt eingefügt -->
            </div>
        `;
    }
}

customElements.define('section-box', SectionBox);
