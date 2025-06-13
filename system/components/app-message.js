// system/components/app-message.js

class AppMessage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const type = this.getAttribute('type') || 'info'; // 'info', 'alert', etc.
    const background = type === 'info'
      ? 'linear-gradient(90deg, #7f7fd5, #86a8e7)'
      : type === 'alert'
      ? 'linear-gradient(90deg, #ff6a6a, #ffb86c)'
      : '#eee';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 16px 0;
        }
        .message {
          padding: 16px;
          border-radius: 12px;
          background: ${background};
          color: white;
          font-weight: 500;
          font-size: 0.95rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
      </style>
      <div class="message">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('app-message', AppMessage);
