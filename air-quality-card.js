/**
 * Air Quality Card for Home Assistant
 * Inspired by Awair Element air quality monitor UI
 *
 * Installation:
 *   1. Copy this file to /config/www/air-quality-card.js
 *   2. Add resource: /local/air-quality-card.js  (JavaScript Module)
 *   3. Add card via YAML
 */

const AWAIR_DEFAULTS = [
  { label: "Temp",      unit: "°C",             thresholds: [17, 20, 25, 28]  },
  { label: "Humidity",  unit: "%",              thresholds: [30, 40, 60, 70]  },
  { label: "CO\u2082",  unit: "ppm",            thresholds: [700, 1000, 1500, 2000] },
  { label: "Chemicals", unit: "ppb",            thresholds: [300, 500, 700, 1000]   },
  { label: "PM2.5",     unit: "\u00b5g/m\u00b3",thresholds: [5, 12, 35, 55]         },
];

class AirQualityCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    if (!config.sensors || config.sensors.length === 0)
      throw new Error("Please define at least one sensor.");
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateValues();
  }

  getCardSize() { return 4; }

  getLevel(value, thresholds) {
    let level = 1;
    for (const t of thresholds) { if (value > t) level++; else break; }
    return Math.min(level, 5);
  }

  dotColor(pos, level) {
    if (pos >= level) return null;
    if (level === 1) return "green";
    if (level === 2) return "yellow";
    if (level === 3) return "orange";
    return "red";
  }

  scoreLabel(score) {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 55) return "Fair";
    if (score >= 35) return "Poor";
    return "Bad";
  }

  scoreLabelColor(score) {
    if (score >= 75) return "var(--aq-green)";
    if (score >= 55) return "var(--aq-yellow)";
    if (score >= 35) return "var(--aq-orange)";
    return "var(--aq-red)";
  }

  computeScore(sensorLevels) {
    const penalty = { 1: 0, 2: 8, 3: 20, 4: 40, 5: 70 };
    const total = sensorLevels.reduce((s, l) => s + (penalty[l] || 0), 0);
    return Math.max(0, Math.round(100 - total / sensorLevels.length));
  }

  ringOffset(score) {
    return 376.99 - (score / 100) * 376.99;
  }

  render() {
    const title = this._config.title || "";
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --aq-bg:      #1c1f23; --aq-surface: #252930;
          --aq-inactive:#3a3f47; --aq-divider: #333840;
          --aq-text:    #e8eaed; --aq-muted:   #8b9199;
          --aq-green:   #6abf69; --aq-yellow:  #f4c842;
          --aq-orange:  #f4923a; --aq-red:     #e05252;
          display: block;
        }
        ha-card { background:var(--aq-bg) !important; border-radius:18px !important; padding:28px 20px 24px; overflow:hidden; }
        .card-title { font-size:13px; font-weight:500; color:var(--aq-muted); text-align:center; margin-bottom:20px; letter-spacing:.06em; text-transform:uppercase; }
        .ring-wrap { display:flex; justify-content:center; margin-bottom:32px; }
        .ring-container { position:relative; width:140px; height:140px; }
        .ring-svg { width:100%; height:100%; transform:rotate(-90deg); }
        .ring-track { fill:none; stroke:var(--aq-surface); stroke-width:10; }
        .ring-progress { fill:none; stroke:var(--aq-green); stroke-width:10; stroke-linecap:round; stroke-dasharray:376.99; stroke-dashoffset:377; transition:stroke-dashoffset .8s ease,stroke .5s ease; }
        .ring-inner { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .ring-score { font-size:44px; font-weight:500; color:var(--aq-text); line-height:1; }
        .ring-label { font-size:13px; margin-top:4px; transition:color .5s; }
        .sensors-row { display:flex; justify-content:space-between; align-items:flex-end; gap:4px; }
        .sensor-col { display:flex; flex-direction:column; align-items:center; flex:1; cursor:pointer; }
        .sensor-col:hover .sensor-value { opacity:.75; }
        .dots-col { display:flex; flex-direction:column; align-items:center; gap:7px; margin-bottom:10px; }
        .dot { width:10px; height:10px; border-radius:50%; background:var(--aq-inactive); transition:background .4s; }
        .dot.green  { background:var(--aq-green); }
        .dot.yellow { background:var(--aq-yellow); }
        .dot.orange { background:var(--aq-orange); }
        .dot.red    { background:var(--aq-red); }
        .sensor-name  { font-size:11px; color:var(--aq-muted); margin-bottom:4px; text-align:center; }
        .sensor-value { font-size:18px; font-weight:500; color:var(--aq-text); line-height:1; transition:opacity .3s; }
        .sensor-unit  { font-size:9px; color:var(--aq-muted); margin-top:2px; text-align:center; }
        .col-divider  { width:.5px; height:60px; background:var(--aq-divider); align-self:center; margin-bottom:52px; flex-shrink:0; }
      </style>
      <ha-card>
        ${title ? `<div class="card-title">${title}</div>` : ""}
        <div class="ring-wrap">
          <div class="ring-container">
            <svg class="ring-svg" viewBox="0 0 140 140">
              <circle class="ring-track"    cx="70" cy="70" r="60"/>
              <circle class="ring-progress" cx="70" cy="70" r="60" id="ring"/>
            </svg>
            <div class="ring-inner">
              <span class="ring-score" id="score-val">--</span>
              <span class="ring-label" id="score-lbl">--</span>
            </div>
          </div>
        </div>
        <div class="sensors-row" id="sensors-row"></div>
      </ha-card>`;
    this._buildSensorColumns();
  }

  _buildSensorColumns() {
    const row = this.shadowRoot.getElementById("sensors-row");
    if (!row) return;
    row.innerHTML = "";
    this._config.sensors.forEach((s, i) => {
      const dotsDiv = document.createElement("div");
      dotsDiv.className = "dots-col";
      for (let d = 4; d >= 0; d--) {
        const dot = document.createElement("div");
        dot.className = "dot";
        dot.dataset.sensor = i;
        dot.dataset.pos = d;
        dotsDiv.appendChild(dot);
      }
      const col = document.createElement("div");
      col.className = "sensor-col";
      col.innerHTML = `
        <div class="sensor-name">${s.label || s.entity}</div>
        <div class="sensor-value" id="val-${i}">--</div>
        <div class="sensor-unit">${s.unit || ""}</div>`;
      col.insertBefore(dotsDiv, col.firstChild);
      col.addEventListener("click", () => {
        if (this._hass && s.entity)
          this.dispatchEvent(new CustomEvent("hass-more-info", {
            bubbles: true, composed: true, detail: { entityId: s.entity },
          }));
      });
      row.appendChild(col);
      if (i < this._config.sensors.length - 1) {
        const div = document.createElement("div");
        div.className = "col-divider";
        row.appendChild(div);
      }
    });
  }

  updateValues() {
    if (!this._hass || !this._config) return;
    const levels = [];
    this._config.sensors.forEach((s, i) => {
      const raw = s.entity && this._hass.states[s.entity] ? parseFloat(this._hass.states[s.entity].state) : null;
      const valEl = this.shadowRoot.getElementById(`val-${i}`);
      if (valEl) valEl.textContent = raw !== null ? (Number.isInteger(raw) ? raw : raw.toFixed(1)) : "--";
      const level = raw !== null ? this.getLevel(raw, s.thresholds || []) : 0;
      levels.push(level);
      this.shadowRoot.querySelectorAll(`.dot[data-sensor="${i}"]`).forEach(dot => {
        const pos = parseInt(dot.dataset.pos);
        dot.className = "dot";
        const c = this.dotColor(pos, level);
        if (c) dot.classList.add(c);
      });
    });

    const score  = this.computeScore(levels);
    const color  = this.scoreLabelColor(score);
    const scoreEl = this.shadowRoot.getElementById("score-val");
    const lblEl   = this.shadowRoot.getElementById("score-lbl");
    const ringEl  = this.shadowRoot.getElementById("ring");
    if (scoreEl) scoreEl.textContent = score;
    if (lblEl)   { lblEl.textContent = this.scoreLabel(score); lblEl.style.color = color; }
    if (ringEl)  { ringEl.style.strokeDashoffset = this.ringOffset(score); ringEl.style.stroke = color; }
  }
}

customElements.define("air-quality-card", AirQualityCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "air-quality-card",
  name: "Air Quality Card",
  description: "Awair-inspired air quality card with dot indicators and score ring",
  preview: false,
});
