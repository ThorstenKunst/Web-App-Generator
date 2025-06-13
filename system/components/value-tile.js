// system/components/value-tile.js

class ValueTile extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const label = this.getAttribute('label') || '';
    const value = this.getAttribute('value') || '';
    const trend = this.getAttribute('trend') || 'flat'; // up, down, flat
    const color = this.getAttribute('color') || 'neutral'; // positive, neutral, negative
    const chart = JSON.parse(this.getAttribute('chart') || '[]'); // e.g. [5,6,4,7]

    const trendSymbol = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '→';
    const cssClass = color;

    const barsHTML = chart.map((val, i) => {
      const percent = Math.max(5, Math.min(100, Math.round((val / Math.max(...chart)) * 100)));
      const today = i === chart.length - 1 ? 'today' : '';
      return `<div class="chart-bar ${today}" style="--bar-value:${percent}%" title="${val}"></div>`;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 160px;
          border-radius: 14px;
          padding: 14px;
          background: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
          font-family: sans-serif;
        }
        .stat-card {
          background-size: contain;
          border-radius: 12px;
        }
        .stat-header {
          display: flex;
          justify-content: space-between;
          font-size: 1.4em;
          font-weight: bold;
        }
        .stat-label {
          font-size: 0.8em;
          font-weight: 500;
          color: #555;
          margin-top: 6px;
          text-transform: uppercase;
        }
        .mini-chart {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          margin-top: 8px;
          height: 32px;
        }
        .chart-bar {
          flex: 1;
          background: #ccc;
          border-radius: 4px 4px 0 0;
          height: var(--bar-value, 20%);
          transition: height 0.2s;
        }
        .chart-bar.today {
          background: #5c7cfa;
        }
        :host(.positive) .chart-bar.today {
          background: #4caf50;
        }
        :host(.negative) .chart-bar.today {
          background: #f44336;
        }
      </style>
      <div class="stat-card ${cssClass}">
        <div class="stat-header">
          <div class="stat-value">${value}</div>
          <div class="stat-trend">${trendSymbol}</div>
        </div>
        <div class="stat-label">${label}</div>
        <div class="mini-chart">
          ${barsHTML}
        </div>
      </div>
    `;
  }
}

customElements.define('value-tile', ValueTile);
