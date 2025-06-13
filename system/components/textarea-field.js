// system/components/textarea-field.js

class TextareaField extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  get value() {
    return this.shadowRoot.querySelector('textarea')?.value || '';
  }

  set value(val) {
    this.shadowRoot.querySelector('textarea').value = val;
  }

  render() {
    const label = this.getAttribute('label') || '';
    const name = this.getAttribute('name') || '';
    const value = this.getAttribute('value') || '';
    const placeholder = this.getAttribute('placeholder') || '';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 16px 0;
        }

        label {
          display: block;
          font-size: 0.9em;
          margin-bottom: 6px;
        }

        textarea {
          width: 100%;
          min-height: 80px;
          font-size: 1em;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #ccc;
          resize: vertical;
          font-family: inherit;
          box-sizing: border-box;
        }
      </style>

      <label for="${name}">${label}</label>
      <textarea id="${name}" name="${name}" placeholder="${placeholder}">${value}</textarea>
    `;
  }
}

customElements.define('textarea-field', TextareaField);
