// system/components/range-slider.js

class RangeSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
  }

  get value() {
    return this.shadowRoot.querySelector('input')?.value || 0;
  }

  set value(val) {
    this.shadowRoot.querySelector('input').value = val;
    this.updateValueDisplay(val);
  }

  attachEvents() {
    const slider = this.shadowRoot.querySelector('input');
    slider.addEventListener('input', (e) => {
      this.updateValueDisplay(e.target.value);
    });
  }

  updateValueDisplay(val) {
    const valueDisplay = this.shadowRoot.querySelector('.value-display');
    valueDisplay.textContent = val;
    const percent = ((val - this.min) / (this.max - this.min)) * 100;
    valueDisplay.style.left = `calc(${percent}% - 12px)`;
  }

  get min() {
    return parseInt(this.getAttribute('min') || 1);
  }

  get max() {
    return parseInt(this.getAttribute('max') || 5);
  }

  render() {
    const label = this.getAttribute('label') || '';
    const name = this.getAttribute('name') || '';
    const value = parseInt(this.getAttribute('value') || 3);
    const emojis = (this.getAttribute('emoji') || '😴,😊').split(',');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; margin: 16px 0; }
        label {
          display: block;
          font-size: 0.9em;
          margin-bottom: 6px;
          color: var(--text-color-dark);
        }
        .slider-container {
          position: relative;
          width: 100%;
        }
        .value-display {
          position: absolute;
          top: -28px;
          background: var(--text-color-dark);
          color: var(--text-color-light);
          padding: 2px 8px;
          border-radius: var(--border-radius);
          font-size: 0.9em;
          transform: translateX(-50%);
        }
        input[type="range"] {
          width: 100%;
          margin: 0;
        }
        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 1.2rem;
          margin-top: 4px;
        }
      </style>
      <label>${label}</label>
      <div class="slider-container">
        <div class="value-display">${value}</div>
        <input type="range" name="${name}" min="${this.min}" max="${this.max}" value="${value}">
        <div class="slider-labels">
          <span>${emojis[0] || ''}</span>
          <span>${emojis[1] || ''}</span>
        </div>
      </div>
    `;
  }
}

customElements.define('range-slider', RangeSlider);
