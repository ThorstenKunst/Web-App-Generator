// system/components/button-set.js

class ButtonSet extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
  }

  get name() {
    return this.getAttribute('name') || '';
  }

  get options() {
    const raw = this.getAttribute('options') || '';
    return raw.split(',').map(o => o.trim()).filter(Boolean);
  }

  get value() {
    return Array.from(this.shadowRoot.querySelectorAll('button.selected'))
      .map(btn => btn.dataset.value)
      .join(',');
  }

  set value(val) {
    const values = val.split(',');
    this.shadowRoot.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('selected', values.includes(btn.dataset.value));
    });
  }

  attachEvents() {
    this.shadowRoot.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('selected');
        this.dispatchEvent(new Event('change'));
      });
    });
  }

  render() {
    const label = this.getAttribute('label') || '';
    const name = this.name;
    const options = this.options;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 16px 0;
        }

        .label {
          font-weight: 500;
          margin-bottom: 6px;
          display: block;
        }

        .button-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        button {
          background: #f5f5f5;
          border: none;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        button.selected {
          background: #d0dfff;
          font-weight: bold;
        }
      </style>

      <label class="label">${label}</label>
      <div class="button-wrap">
        ${options.map(opt => `
          <button type="button" data-value="${opt}">${opt}</button>
        `).join('')}
      </div>
    `;
  }
}

customElements.define('button-set', ButtonSet);
