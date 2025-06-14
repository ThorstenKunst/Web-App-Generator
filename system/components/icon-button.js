// system/components/icon-button.js

class IconButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    const button = this.shadowRoot.querySelector('button');
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    });
  }

  static get observedAttributes() {
    return ['disabled'];
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
    const icon = this.getAttribute('icon') || '⚙️';
    const tooltip = this.getAttribute('tooltip') || '';
    const isDisabled = this.hasAttribute('disabled');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; }
        button {
          all: unset;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--background-box);
          color: var(--text-color-dark);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          font-size: 1.2em;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        button:hover {
          background: var(--background-box-header);
        }
        button:disabled {
          background: var(--background-footer);
          color: var(--color-neutral);
          cursor: not-allowed;
        }
      </style>
      <button title="${tooltip}" ${isDisabled ? 'disabled' : ''}>${icon}</button>
    `;
  }
}

customElements.define('icon-button', IconButton);
