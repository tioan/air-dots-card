/**
 * Air Dots Card for Home Assistant
 * Awair-inspired air quality card with dot indicators and score ring
 *
 * Themes:          default | mushroom | bubble
 * Score positions: center | left | right | inline_left | inline_right
 * Languages:       en | de (auto-detected from browser, or set via `language:` config)
 *
 * Installation:
 *   1. Copy this file to /config/www/air-dots-card.js
 *   2. Add resource: /local/air-dots-card.js  (JavaScript Module)
 *   3. Add card via UI editor or YAML
 */

// ─── i18n ─────────────────────────────────────────────────────────────────────

const TRANSLATIONS = {
  en: {
    score_labels:    ["Excellent", "Good", "Fair", "Poor", "Bad"],
    score_col_name:  "Score",
    // Editor — sections
    sect_appearance: "Appearance",
    sect_general:    "General",
    sect_sensors:    "Sensors",
    // Editor — appearance
    lbl_theme:       "Theme",
    lbl_position:    "Score position",
    theme_default:   "🌑 Default",
    theme_mushroom:  "🍄 Mushroom",
    theme_bubble:    "🫧 Bubble",
    pos_center:      "⬆ Center",
    pos_left:        "◀ Left",
    pos_right:       "Right ▶",
    pos_inline_left: "↔ Inline L",
    pos_inline_right:"Inline R ↔",
    // Editor — general
    lbl_title:       "Card title (optional)",
    lbl_title_ph:    "e.g. Living Room",
    lbl_score_entity:"Score entity",
    hint_score:      "Numeric sensor 0–100 (e.g. sensor.awair_score)",
    // Editor — sensors
    lbl_entity:      "Entity",
    lbl_label:       "Label",
    lbl_label_ph:    "e.g. CO₂",
    lbl_unit:        "Unit",
    lbl_unit_ph:     "e.g. ppm",
    lbl_thresholds:  "Thresholds",
    hint_thresholds:     "(🟢→🟡 / 🟡→🟠 / 🟠→🔴 / 🔴→🟣)",
    hint_thresholds_sym: "(🔴→🟡 / 🟡→🟢 / 🟢→🟡 / 🟡→🔴)",
    lbl_level:           "Level",
    lbl_level_sym:       ["🔴→🟡 low", "🟡→🟢 low", "🟢→🟡 high", "🟡→🔴 high"],
    lbl_symmetric:       "Symmetric scale",
    hint_symmetric:      "Optimal in center range (e.g. temp, humidity)",
    btn_add:             "+ Add sensor",
    btn_up:          "↑",
    btn_down:        "↓",
    btn_remove:      "✕",
    tip_up:          "Move up",
    tip_down:        "Move down",
    tip_remove:      "Remove sensor",
  },
  de: {
    score_labels:    ["Ausgezeichnet", "Gut", "Mäßig", "Schlecht", "Kritisch"],
    score_col_name:  "Score",
    // Editor — sections
    sect_appearance: "Darstellung",
    sect_general:    "Allgemein",
    sect_sensors:    "Sensoren",
    // Editor — appearance
    lbl_theme:       "Design",
    lbl_position:    "Score-Position",
    theme_default:   "🌑 Standard",
    theme_mushroom:  "🍄 Mushroom",
    theme_bubble:    "🫧 Bubble",
    pos_center:      "⬆ Mitte",
    pos_left:        "◀ Links",
    pos_right:       "Rechts ▶",
    pos_inline_left: "↔ Inline L",
    pos_inline_right:"Inline R ↔",
    // Editor — general
    lbl_title:       "Kartentitel (optional)",
    lbl_title_ph:    "z. B. Wohnzimmer",
    lbl_score_entity:"Score-Entität",
    hint_score:      "Numerischer Sensor 0–100 (z. B. sensor.awair_score)",
    // Editor — sensors
    lbl_entity:      "Entität",
    lbl_label:       "Bezeichnung",
    lbl_label_ph:    "z. B. CO₂",
    lbl_unit:        "Einheit",
    lbl_unit_ph:     "z. B. ppm",
    lbl_thresholds:  "Schwellenwerte",
    hint_thresholds:     "(🟢→🟡 / 🟡→🟠 / 🟠→🔴 / 🔴→🟣)",
    hint_thresholds_sym: "(🔴→🟡 / 🟡→🟢 / 🟢→🟡 / 🟡→🔴)",
    lbl_level:           "Level",
    lbl_level_sym:       ["🔴→🟡 unten", "🟡→🟢 unten", "🟢→🟡 oben", "🟡→🔴 oben"],
    lbl_symmetric:       "Symmetrische Skala",
    hint_symmetric:      "Optimal im Mittelbereich (z. B. Temp, Luftfeuchtigkeit)",
    btn_add:             "+ Sensor hinzufügen",
    btn_up:          "↑",
    btn_down:        "↓",
    btn_remove:      "✕",
    tip_up:          "Nach oben",
    tip_down:        "Nach unten",
    tip_remove:      "Sensor entfernen",
  },
};

/**
 * Resolve translation strings for a given language config value.
 * Falls back to English if the language is not supported.
 * When set to "auto", reads the language from the Home Assistant user profile
 * (hass.locale.language) rather than the browser locale.
 * The hass object must be passed in so the card and editor can share this logic.
 */
function getT(langConfig, hass) {
  const raw = langConfig || "auto";
  let lang;
  if (raw === "auto") {
    // Prefer the HA profile language; fall back to browser locale as last resort
    const haLang = hass?.locale?.language || hass?.language || "";
    lang = haLang.toLowerCase().startsWith("de") ? "de" : "en";
  } else {
    lang = raw;
  }
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}

// ─── Awair sensor defaults ─────────────────────────────────────────────────────

const AWAIR_DEFAULTS = [
  { label: "Temp",      unit: "°C",              thresholds: [18, 20, 25, 27],        symmetric: true },
  { label: "Humidity",  unit: "%",               thresholds: [30, 40, 60, 65],        symmetric: true },
  { label: "CO\u2082",  unit: "ppm",             thresholds: [600, 1000, 2000, 4500]                  },
  { label: "Chemicals", unit: "ppb",             thresholds: [300, 500, 3000, 25000]                  },
  { label: "PM2.5",     unit: "\u00b5g/m\u00b3", thresholds: [12, 35, 55, 150]                        },
];

// ─── Shared helpers ────────────────────────────────────────────────────────────

/**
 * Map a numeric sensor value to severity level 1–5.
 * Linear mode (default): higher value = worse (CO₂, VOCs, PM2.5).
 * Symmetric mode: optimal range is in the center; both extremes are bad (temp, humidity).
 *   thresholds = [low_bad, low_ok, high_ok, high_bad]
 *   level 1 (green):  low_ok  ≤ value ≤ high_ok
 *   level 2 (yellow): low_bad ≤ value <  low_ok  or  high_ok < value ≤ high_bad
 *   level 3 (orange): value < low_bad or value > high_bad
 */
function getLevel(value, thresholds, symmetric = false) {
  if (symmetric && thresholds.length >= 4) {
    if (value >= thresholds[1] && value <= thresholds[2]) return 1;
    if (value >= thresholds[0] && value <= thresholds[3]) return 2;
    return 3;
  }
  let level = 1;
  for (const t of thresholds) { if (value > t) level++; else break; }
  return Math.min(level, 5);
}

/** Return the dot/ring color for a given severity level and theme. */
function levelColor(level, theme) {
  const colors = {
    default:  ["#6abf69","#f4c842","#f4923a","#e05252","#9b6ddf"],
    mushroom: ["#43a047","#f9a825","#ef6c00","#e53935","#8e24aa"],
    bubble:   ["#4caf50","#ffeb3b","#ff9800","#f44336","#9c27b0"],
  };
  return (colors[theme] || colors.default)[level - 1];
}

/** Return the translated score label for a given score value. */
function scoreLabel(score, t) {
  const labels = t.score_labels;
  if (score >= 90) return labels[0];
  if (score >= 75) return labels[1];
  if (score >= 55) return labels[2];
  if (score >= 35) return labels[3];
  return labels[4];
}

/** Return the ring/label color for a given score value. */
function scoreLabelColor(score, theme) {
  const level = score >= 75 ? 1 : score >= 55 ? 2 : score >= 35 ? 3 : 4;
  return levelColor(level, theme);
}

// ─── Theme CSS blocks ──────────────────────────────────────────────────────────

const THEME_CSS = {

  default: `
    :host {
      --aq-bg:      #1c1f23; --aq-surface: #252930;
      --aq-inactive:#3a3f47; --aq-divider: #333840;
      --aq-text:    #e8eaed; --aq-muted:   #8b9199;
      display: block;
    }
    ha-card { background:var(--aq-bg) !important; border-radius:18px !important; padding:24px 20px 22px; box-shadow:none !important; }
    .card-title { font-size:13px; font-weight:500; color:var(--aq-muted); text-align:center; margin-bottom:18px; letter-spacing:.06em; text-transform:uppercase; }
    .layout-center .ring-wrap { display:flex; justify-content:center; margin-bottom:28px; }
    .layout-center .ring-container { position:relative; width:140px; height:140px; }
    .layout-left, .layout-right { display:flex; align-items:center; gap:20px; }
    .layout-left .ring-wrap, .layout-right .ring-wrap { flex-shrink:0; }
    .layout-left .ring-container, .layout-right .ring-container { position:relative; width:110px; height:110px; }
    .layout-left .sensors-row, .layout-right .sensors-row { flex:1; }
    .layout-inline .score-inline-col { display:flex; flex-direction:column; align-items:center; flex:1.2; }
    .score-inline-val { font-size:26px; font-weight:500; color:var(--aq-text); line-height:1; }
    .score-inline-lbl { font-size:10px; margin-top:3px; }
    .score-inline-name { font-size:11px; color:var(--aq-muted); margin-bottom:4px; }
    .ring-svg { width:100%; height:100%; transform:rotate(-90deg); }
    .ring-track { fill:none; stroke:var(--aq-surface); stroke-width:10; }
    .ring-progress { fill:none; stroke-width:10; stroke-linecap:round; stroke-dasharray:376.99; stroke-dashoffset:377; transition:stroke-dashoffset .8s ease,stroke .5s ease; }
    .ring-inner { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .ring-score { font-size:44px; font-weight:500; color:var(--aq-text); line-height:1; }
    .ring-score.small { font-size:32px; }
    .ring-label { font-size:13px; margin-top:4px; transition:color .5s; }
    .ring-label.small { font-size:11px; }
    .sensors-row { display:flex; justify-content:space-between; align-items:flex-end; gap:4px; }
    .sensor-col { display:flex; flex-direction:column; align-items:center; flex:1; cursor:pointer; }
    .sensor-col:hover .sensor-value { opacity:.75; }
    .dots-col { display:flex; flex-direction:column; align-items:center; gap:7px; margin-bottom:10px; }
    .dot { width:10px; height:10px; border-radius:50%; background:var(--aq-inactive); transition:background .4s; }
    .sensor-name { font-size:11px; color:var(--aq-muted); margin-bottom:4px; text-align:center; }
    .sensor-value { font-size:18px; font-weight:500; color:var(--aq-text); line-height:1; transition:opacity .3s; }
    .sensor-unit { font-size:9px; color:var(--aq-muted); margin-top:2px; text-align:center; }
    .col-divider { width:.5px; height:60px; background:var(--aq-divider); align-self:center; margin-bottom:52px; flex-shrink:0; }
    .layout-inline .col-divider { height:40px; margin-bottom:36px; }
  `,

  mushroom: `
    :host {
      --aq-bg:      var(--ha-card-background, var(--card-background-color,#fff));
      --aq-surface: rgba(var(--rgb-primary-color,33,150,243),.08);
      --aq-inactive:rgba(var(--rgb-primary-text-color,0,0,0),.12);
      --aq-divider: rgba(var(--rgb-primary-text-color,0,0,0),.08);
      --aq-text:    var(--primary-text-color,#212121);
      --aq-muted:   var(--secondary-text-color,#727272);
      display: block;
    }
    ha-card { background:var(--aq-bg) !important; border-radius:var(--ha-card-border-radius,12px) !important; padding:16px; box-shadow:var(--ha-card-box-shadow,none) !important; border:1px solid var(--ha-card-border-color,var(--divider-color,rgba(0,0,0,.12))) !important; }
    .card-title { font-size:12px; font-weight:500; color:var(--aq-muted); margin-bottom:12px; letter-spacing:.04em; text-transform:uppercase; }
    .layout-center .ring-wrap { display:flex; justify-content:center; margin-bottom:16px; }
    .layout-center .ring-container { position:relative; width:110px; height:110px; }
    .layout-left, .layout-right { display:flex; align-items:center; gap:16px; }
    .layout-left .ring-wrap, .layout-right .ring-wrap { flex-shrink:0; }
    .layout-left .ring-container, .layout-right .ring-container { position:relative; width:90px; height:90px; }
    .layout-left .sensors-row, .layout-right .sensors-row { flex:1; }
    .layout-inline .score-inline-col { display:flex; flex-direction:column; align-items:center; flex:1.2; border-radius:8px; padding:6px 2px; }
    .score-inline-val { font-size:22px; font-weight:500; color:var(--aq-text); line-height:1; }
    .score-inline-lbl { font-size:10px; margin-top:2px; }
    .score-inline-name { font-size:10px; color:var(--aq-muted); margin-bottom:3px; }
    .ring-svg { width:100%; height:100%; transform:rotate(-90deg); }
    .ring-track { fill:none; stroke:var(--aq-surface); stroke-width:8; }
    .ring-progress { fill:none; stroke-width:8; stroke-linecap:round; stroke-dasharray:376.99; stroke-dashoffset:377; transition:stroke-dashoffset .8s ease,stroke .5s ease; }
    .ring-inner { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .ring-score { font-size:32px; font-weight:500; color:var(--aq-text); line-height:1; }
    .ring-score.small { font-size:24px; }
    .ring-label { font-size:11px; margin-top:3px; transition:color .5s; }
    .ring-label.small { font-size:10px; }
    .sensors-row { display:flex; justify-content:space-between; align-items:flex-end; gap:4px; }
    .sensor-col { display:flex; flex-direction:column; align-items:center; flex:1; cursor:pointer; border-radius:8px; padding:6px 2px; transition:background .15s; }
    .sensor-col:hover { background:var(--aq-surface); }
    .dots-col { display:flex; flex-direction:column; align-items:center; gap:5px; margin-bottom:8px; }
    .dot { width:8px; height:8px; border-radius:50%; background:var(--aq-inactive); transition:background .4s; }
    .sensor-name { font-size:10px; color:var(--aq-muted); margin-bottom:3px; text-align:center; }
    .sensor-value { font-size:15px; font-weight:500; color:var(--aq-text); line-height:1; }
    .sensor-unit { font-size:9px; color:var(--aq-muted); margin-top:1px; text-align:center; }
    .col-divider { width:.5px; height:48px; background:var(--aq-divider); align-self:center; margin-bottom:40px; flex-shrink:0; }
    .layout-inline .col-divider { height:34px; margin-bottom:28px; }
  `,

  bubble: `
    :host {
      --aq-bg:      var(--ha-card-background, var(--card-background-color,#fff));
      --aq-surface: rgba(var(--rgb-primary-color,99,102,241),.10);
      --aq-inactive:rgba(var(--rgb-primary-text-color,0,0,0),.10);
      --aq-divider: transparent;
      --aq-text:    var(--primary-text-color,#111);
      --aq-muted:   var(--secondary-text-color,#888);
      display: block;
    }
    ha-card { background:var(--aq-bg) !important; border-radius:32px !important; padding:20px 18px 18px; box-shadow:none !important; border:none !important; }
    .card-title { font-size:11px; font-weight:600; color:var(--aq-muted); text-align:center; margin-bottom:14px; letter-spacing:.08em; text-transform:uppercase; }
    .layout-center .ring-wrap { display:flex; justify-content:center; margin-bottom:16px; }
    .layout-center .ring-container { position:relative; width:100px; height:100px; }
    .layout-left, .layout-right { display:flex; align-items:center; gap:14px; }
    .layout-left .ring-wrap, .layout-right .ring-wrap { flex-shrink:0; }
    .layout-left .ring-container, .layout-right .ring-container { position:relative; width:84px; height:84px; }
    .layout-left .sensors-row, .layout-right .sensors-row { flex:1; }
    .layout-inline .score-inline-col { display:flex; flex-direction:column; align-items:center; flex:1.2; background:var(--aq-surface); border-radius:18px; padding:10px 4px 8px; }
    .score-inline-val { font-size:20px; font-weight:600; color:var(--aq-text); line-height:1; }
    .score-inline-lbl { font-size:9px; margin-top:2px; font-weight:500; letter-spacing:.04em; }
    .score-inline-name { font-size:9px; color:var(--aq-muted); margin-bottom:3px; font-weight:500; text-transform:uppercase; letter-spacing:.03em; }
    .ring-svg { width:100%; height:100%; transform:rotate(-90deg); }
    .ring-track { fill:none; stroke:var(--aq-surface); stroke-width:10; }
    .ring-progress { fill:none; stroke-width:10; stroke-linecap:round; stroke-dasharray:376.99; stroke-dashoffset:377; transition:stroke-dashoffset .8s ease,stroke .5s ease; }
    .ring-inner { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .ring-score { font-size:28px; font-weight:600; color:var(--aq-text); line-height:1; }
    .ring-score.small { font-size:22px; }
    .ring-label { font-size:10px; margin-top:2px; transition:color .5s; font-weight:500; letter-spacing:.04em; }
    .ring-label.small { font-size:9px; }
    .sensors-row { display:flex; justify-content:space-between; align-items:flex-end; gap:6px; }
    .sensor-col { display:flex; flex-direction:column; align-items:center; flex:1; cursor:pointer; background:var(--aq-surface); border-radius:18px; padding:10px 4px 8px; transition:opacity .15s; }
    .sensor-col:hover { opacity:.8; }
    .dots-col { display:flex; flex-direction:column; align-items:center; gap:5px; margin-bottom:6px; }
    .dot { width:7px; height:7px; border-radius:50%; background:var(--aq-inactive); transition:background .4s; }
    .sensor-name { font-size:9px; color:var(--aq-muted); margin-bottom:3px; text-align:center; font-weight:500; letter-spacing:.03em; text-transform:uppercase; }
    .sensor-value { font-size:14px; font-weight:600; color:var(--aq-text); line-height:1; }
    .sensor-unit { font-size:8px; color:var(--aq-muted); margin-top:2px; text-align:center; }
    .col-divider { display:none; }
  `,
};

// ─── CARD ──────────────────────────────────────────────────────────────────────

class AirDotsCard extends HTMLElement {
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

  _theme()    { return this._config.theme          || "default"; }
  _position() { return this._config.score_position || "center"; }
  _t()        { return getT(this._config.language, this._hass); }

  /** Build the score ring SVG + inner number/label. */
  _ringHTML(small = false) {
    const sz = small ? "small" : "";
    return `
      <div class="ring-container">
        <svg class="ring-svg" viewBox="0 0 140 140">
          <circle class="ring-track"    cx="70" cy="70" r="60"/>
          <circle class="ring-progress" cx="70" cy="70" r="60" id="ring"/>
        </svg>
        <div class="ring-inner">
          <span class="ring-score ${sz}" id="score-val">--</span>
          <span class="ring-label ${sz}" id="score-lbl">--</span>
        </div>
      </div>`;
  }

  /** Build the inline score column (no ring, just dots + number). */
  _inlineScoreHTML() {
    const t = this._t();
    return `
      <div class="score-inline-col" id="score-inline-col">
        <div class="score-inline-name">${t.score_col_name}</div>
        <div class="dots-col">
          ${[4,3,2,1,0].map(d => `<div class="dot" data-scorepos="${d}"></div>`).join("")}
        </div>
        <div class="score-inline-val" id="score-val">--</div>
        <div class="score-inline-lbl" id="score-lbl">--</div>
      </div>`;
  }

  render() {
    const theme    = this._theme();
    const position = this._position();
    const title    = this._config.title || "";
    const isInline = position === "inline_left" || position === "inline_right";

    let inner = "";
    if (position === "center") {
      inner = `<div class="layout-center"><div class="ring-wrap">${this._ringHTML(false)}</div><div class="sensors-row" id="sensors-row"></div></div>`;
    } else if (position === "left") {
      inner = `<div class="layout-left"><div class="ring-wrap">${this._ringHTML(true)}</div><div class="sensors-row" id="sensors-row"></div></div>`;
    } else if (position === "right") {
      inner = `<div class="layout-right"><div class="sensors-row" id="sensors-row"></div><div class="ring-wrap">${this._ringHTML(true)}</div></div>`;
    } else {
      // inline_left and inline_right both start with the score col; sensors are inserted around it in _buildSensorColumns
      inner = `<div class="layout-inline"><div class="sensors-row" id="sensors-row">${this._inlineScoreHTML()}</div></div>`;
    }

    this.shadowRoot.innerHTML = `
      <style>${THEME_CSS[theme] || THEME_CSS.default}</style>
      <ha-card>
        ${title ? `<div class="card-title">${title}</div>` : ""}
        ${inner}
      </ha-card>`;

    this._buildSensorColumns();
  }

  _buildSensorColumns() {
    const row      = this.shadowRoot.getElementById("sensors-row");
    if (!row) return;
    const position = this._position();
    const isInline = position === "inline_left" || position === "inline_right";

    if (isInline) {
      // Remove previously added sensor cols; keep the score-inline-col
      row.querySelectorAll(".sensor-col, .col-divider").forEach(el => el.remove());
    } else {
      row.innerHTML = "";
    }

    const makeDivider = () => { const d = document.createElement("div"); d.className = "col-divider"; return d; };

    const makeCol = (s, i) => {
      const dotsDiv = document.createElement("div");
      dotsDiv.className = "dots-col";
      for (let d = 4; d >= 0; d--) {
        const dot = document.createElement("div");
        dot.className = "dot";
        dot.dataset.sensor = i;
        dot.dataset.pos    = d;
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
      return col;
    };

    if (position === "inline_left") {
      // Score col is already first — append sensors after it
      this._config.sensors.forEach((s, i) => {
        row.appendChild(makeDivider());
        row.appendChild(makeCol(s, i));
      });
    } else if (position === "inline_right") {
      // Prepend sensors before the score col
      const scoreCol = row.querySelector("#score-inline-col");
      this._config.sensors.forEach((s, i) => {
        row.insertBefore(makeCol(s, i), scoreCol);
        row.insertBefore(makeDivider(), scoreCol);
      });
    } else {
      // center / left / right — sensors with dividers between them
      this._config.sensors.forEach((s, i) => {
        if (i > 0) row.appendChild(makeDivider());
        row.appendChild(makeCol(s, i));
      });
    }
  }

  updateValues() {
    if (!this._hass || !this._config) return;
    const theme    = this._theme();
    const position = this._position();
    const t        = this._t();
    const isInline = position === "inline_left" || position === "inline_right";

    // Update each sensor column
    this._config.sensors.forEach((s, i) => {
      const raw   = s.entity && this._hass.states[s.entity] ? parseFloat(this._hass.states[s.entity].state) : null;
      const valEl = this.shadowRoot.getElementById(`val-${i}`);
      if (valEl) valEl.textContent = raw !== null ? (Number.isInteger(raw) ? raw : raw.toFixed(1)) : "--";
      const level = raw !== null ? getLevel(raw, s.thresholds || [], !!s.symmetric) : 0;
      this.shadowRoot.querySelectorAll(`.dot[data-sensor="${i}"]`).forEach(dot => {
        const pos = parseInt(dot.dataset.pos);
        dot.style.background = pos < level ? levelColor(pos + 1, theme) : "";
      });
    });

    // Resolve score from entity
    const scoreEntity = this._config.score_entity;
    let score = 0;
    if (scoreEntity && this._hass.states[scoreEntity])
      score = Math.round(parseFloat(this._hass.states[scoreEntity].state)) || 0;

    const color  = scoreLabelColor(score, theme);
    const label  = scoreLabel(score, t);
    const offset = 376.99 - (score / 100) * 376.99;

    const scoreEl = this.shadowRoot.getElementById("score-val");
    const lblEl   = this.shadowRoot.getElementById("score-lbl");
    if (scoreEl) scoreEl.textContent = score;
    if (lblEl)   { lblEl.textContent = label; lblEl.style.color = color; }

    if (!isInline) {
      // Animate ring
      const ringEl = this.shadowRoot.getElementById("ring");
      if (ringEl) { ringEl.style.strokeDashoffset = offset; ringEl.style.stroke = color; }
    } else {
      // Color inline score dots
      const level = score >= 75 ? 1 : score >= 55 ? 2 : score >= 35 ? 3 : 4;
      this.shadowRoot.querySelectorAll(".dot[data-scorepos]").forEach(dot => {
        const pos = parseInt(dot.dataset.scorepos);
        dot.style.background = pos < level ? levelColor(pos + 1, theme) : "";
      });
    }
  }

  static getConfigElement() { return document.createElement("air-dots-card-editor"); }

  static getStubConfig() {
    return {
      title: "",
      theme: "default",
      score_position: "center",
      language: "auto",
      score_entity: "",
      sensors: AWAIR_DEFAULTS.map(d => ({ entity: "", ...d, thresholds: [...d.thresholds] })),
    };
  }
}

customElements.define("air-dots-card", AirDotsCard);

// ─── EDITOR ────────────────────────────────────────────────────────────────────

class AirDotsCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass   = null;
  }

  setConfig(config) {
    this._config = JSON.parse(JSON.stringify(config));
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this.shadowRoot.querySelectorAll("ha-entity-picker").forEach(el => { el.hass = hass; });
  }

  _t() { return getT(this._config.language, this._hass); }

  _fire(cfg) {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: cfg }, bubbles: true, composed: true,
    }));
  }

  _set(path, value) {
    const cfg   = JSON.parse(JSON.stringify(this._config));
    const parts = path.split(".");
    let obj = cfg;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    obj[parts[parts.length - 1]] = value;
    this._config = cfg; this._fire(cfg); this._render();
  }

  _addSensor() {
    const cfg = JSON.parse(JSON.stringify(this._config));
    const def = AWAIR_DEFAULTS[cfg.sensors.length] || { label: "Sensor", unit: "", thresholds: [10,20,30,40] };
    cfg.sensors.push({ entity: "", label: def.label, unit: def.unit, thresholds: [...def.thresholds] });
    this._config = cfg; this._fire(cfg); this._render();
  }

  _removeSensor(idx) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    cfg.sensors.splice(idx, 1);
    this._config = cfg; this._fire(cfg); this._render();
  }

  _moveSensor(idx, dir) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    const to  = idx + dir;
    if (to < 0 || to >= cfg.sensors.length) return;
    [cfg.sensors[idx], cfg.sensors[to]] = [cfg.sensors[to], cfg.sensors[idx]];
    this._config = cfg; this._fire(cfg); this._render();
  }

  _render() {
    const c        = this._config;
    const sensors  = c.sensors || [];
    const theme    = c.theme          || "default";
    const position = c.score_position || "center";
    const lang     = c.language       || "auto";
    const t        = this._t();

    const pill = (val, label, active) =>
      `<button class="pill ${active ? "active" : ""}" data-val="${val}">${label}</button>`;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; }
        .section { margin-bottom:20px; }
        .section-title { font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:.08em; color:var(--secondary-text-color); margin-bottom:10px; padding-bottom:4px; border-bottom:1px solid var(--divider-color,#e0e0e0); }
        .field { margin-bottom:12px; }
        label { display:block; font-size:12px; color:var(--secondary-text-color); margin-bottom:4px; }
        input[type="text"], input[type="number"], select { width:100%; padding:8px 10px; box-sizing:border-box; border-radius:6px; border:1px solid var(--divider-color,#ccc); background:var(--card-background-color,#fff); color:var(--primary-text-color); font-size:14px; }
        input:focus, select:focus { outline:none; border-color:var(--primary-color); }
        .pills { display:flex; gap:6px; flex-wrap:wrap; }
        .pill { padding:7px 10px; border-radius:8px; border:1.5px solid var(--divider-color,#ddd); background:none; cursor:pointer; font-size:12px; color:var(--secondary-text-color); transition:all .15s; text-align:center; }
        .pill.active { border-color:var(--primary-color,#03a9f4); background:var(--primary-color-light,#e3f2fd); color:var(--primary-color,#03a9f4); font-weight:500; }
        .sensor-card { border:1px solid var(--divider-color,#e0e0e0); border-radius:10px; padding:14px 14px 10px; margin-bottom:12px; background:var(--secondary-background-color,#f5f5f5); }
        .sensor-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .sensor-title { font-size:13px; font-weight:500; color:var(--primary-text-color); }
        .actions { display:flex; gap:4px; }
        .btn { background:none; border:none; cursor:pointer; padding:4px 7px; border-radius:6px; font-size:15px; line-height:1; color:var(--secondary-text-color); transition:background .15s; }
        .btn:hover { background:var(--divider-color,#e0e0e0); }
        .btn.del:hover { background:#ffebee; color:#c62828; }
        .two-col { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .four-col { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; }
        .add-btn { width:100%; padding:10px; border-radius:8px; border:1.5px dashed var(--divider-color,#bbb); background:none; cursor:pointer; font-size:14px; color:var(--primary-color); transition:background .15s; }
        .add-btn:hover { background:var(--primary-color-light,#e8f4fd); }
        ha-entity-picker { display:block; }
        .hint { font-size:11px; color:var(--secondary-text-color); margin-top:3px; }
      </style>

      <div class="section">
        <div class="section-title">${t.sect_appearance}</div>
        <div class="field">
          <label>${t.lbl_theme}</label>
          <div class="pills" id="theme-pills">
            ${pill("default",  t.theme_default,  theme==="default")}
            ${pill("mushroom", t.theme_mushroom, theme==="mushroom")}
            ${pill("bubble",   t.theme_bubble,   theme==="bubble")}
          </div>
        </div>
        <div class="field">
          <label>${t.lbl_position}</label>
          <div class="pills" id="pos-pills">
            ${pill("center",       t.pos_center,       position==="center")}
            ${pill("left",         t.pos_left,         position==="left")}
            ${pill("right",        t.pos_right,        position==="right")}
            ${pill("inline_left",  t.pos_inline_left,  position==="inline_left")}
            ${pill("inline_right", t.pos_inline_right, position==="inline_right")}
          </div>
        </div>
        <div class="field">
          <label>Language</label>
          <select id="sel-lang">
            <option value="auto" ${lang==="auto"?"selected":""}>Auto (HA: ${this._hass?.locale?.language || this._hass?.language || "?"})</option>
            <option value="en"   ${lang==="en"  ?"selected":""}>English</option>
            <option value="de"   ${lang==="de"  ?"selected":""}>Deutsch</option>
          </select>
        </div>
      </div>

      <div class="section">
        <div class="section-title">${t.sect_general}</div>
        <div class="field">
          <label>${t.lbl_title}</label>
          <input id="inp-title" type="text" value="${c.title || ""}" placeholder="${t.lbl_title_ph}">
        </div>
        <div class="field">
          <label>${t.lbl_score_entity}</label>
          <ha-entity-picker id="picker-score" allow-custom-entity .value="${c.score_entity || ""}"></ha-entity-picker>
          <div class="hint">${t.hint_score}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">${t.sect_sensors} (${sensors.length})</div>
        <div id="sensor-list"></div>
        <button class="add-btn" id="btn-add">${t.btn_add}</button>
      </div>`;

    // Theme pills
    this.shadowRoot.getElementById("theme-pills").querySelectorAll(".pill").forEach(btn => {
      btn.addEventListener("click", () => { this._set("theme", btn.dataset.val); });
    });

    // Position pills
    this.shadowRoot.getElementById("pos-pills").querySelectorAll(".pill").forEach(btn => {
      btn.addEventListener("click", () => { this._set("score_position", btn.dataset.val); });
    });

    // Language selector
    this.shadowRoot.getElementById("sel-lang").addEventListener("change", e => {
      this._set("language", e.target.value);
    });

    // Card title
    this.shadowRoot.getElementById("inp-title").addEventListener("change", e => {
      this._set("title", e.target.value);
    });

    // Score entity picker
    const scorePicker = this.shadowRoot.getElementById("picker-score");
    if (this._hass) scorePicker.hass = this._hass;
    scorePicker.addEventListener("value-changed", e => { this._set("score_entity", e.detail.value); });

    // Build sensor cards
    const list = this.shadowRoot.getElementById("sensor-list");
    sensors.forEach((s, i) => {
      const card = document.createElement("div");
      card.className = "sensor-card";
      card.innerHTML = `
        <div class="sensor-header">
          <span class="sensor-title">${i + 1}. ${s.label || "Sensor"}</span>
          <div class="actions">
            <button class="btn"     data-mv="-1" title="${t.tip_up}">${t.btn_up}</button>
            <button class="btn"     data-mv="1"  title="${t.tip_down}">${t.btn_down}</button>
            <button class="btn del" data-del="1" title="${t.tip_remove}">${t.btn_remove}</button>
          </div>
        </div>
        <div class="field">
          <label>${t.lbl_entity}</label>
          <ha-entity-picker allow-custom-entity .value="${s.entity || ""}"></ha-entity-picker>
        </div>
        <div class="two-col">
          <div class="field">
            <label>${t.lbl_label}</label>
            <input type="text" data-key="label" value="${s.label || ""}" placeholder="${t.lbl_label_ph}">
          </div>
          <div class="field">
            <label>${t.lbl_unit}</label>
            <input type="text" data-key="unit" value="${s.unit || ""}" placeholder="${t.lbl_unit_ph}">
          </div>
        </div>
        <div class="field">
          <label>
            <input type="checkbox" data-bool-key="symmetric" ${s.symmetric ? "checked" : ""} style="margin-right:4px">
            ${t.lbl_symmetric}
          </label>
          <div class="hint">${t.hint_symmetric}</div>
        </div>
        <div class="field">
          <label>${t.lbl_thresholds} <span style="font-weight:400">${s.symmetric ? t.hint_thresholds_sym : t.hint_thresholds}</span></label>
          <div class="four-col">
            ${[0,1,2,3].map(ti => `
              <div>
                <label style="font-size:11px">${s.symmetric ? t.lbl_level_sym[ti] : `${t.lbl_level} ${ti+1}→${ti+2}`}</label>
                <input type="number" data-ti="${ti}" value="${(s.thresholds||[])[ti] ?? ""}">
              </div>`).join("")}
          </div>
        </div>`;

      const picker = card.querySelector("ha-entity-picker");
      if (this._hass) picker.hass = this._hass;
      picker.addEventListener("value-changed", e => { this._set(`sensors.${i}.entity`, e.detail.value); });

      card.querySelectorAll("input[data-key]").forEach(inp => {
        inp.addEventListener("change", e => { this._set(`sensors.${i}.${e.target.dataset.key}`, e.target.value); });
      });

      card.querySelectorAll("input[data-bool-key]").forEach(inp => {
        inp.addEventListener("change", e => { this._set(`sensors.${i}.${e.target.dataset.boolKey}`, e.target.checked); });
      });

      card.querySelectorAll("input[data-ti]").forEach(inp => {
        inp.addEventListener("change", e => {
          const cfg = JSON.parse(JSON.stringify(this._config));
          cfg.sensors[i].thresholds[parseInt(e.target.dataset.ti)] = parseFloat(e.target.value);
          this._config = cfg; this._fire(cfg);
        });
      });

      card.querySelector("[data-mv='-1']").addEventListener("click", () => { this._moveSensor(i, -1); });
      card.querySelector("[data-mv='1']").addEventListener("click",  () => { this._moveSensor(i, +1); });
      card.querySelector("[data-del]").addEventListener("click",     () => { this._removeSensor(i); });

      list.appendChild(card);
    });

    this.shadowRoot.getElementById("btn-add").addEventListener("click", () => { this._addSensor(); });
  }
}

customElements.define("air-dots-card-editor", AirDotsCardEditor);

// ─── HACS / Lovelace registration ─────────────────────────────────────────────

window.customCards = window.customCards || [];
window.customCards.push({
  type: "air-dots-card",
  name: "Air Dots Card",
  description: "Awair-inspired air quality card — 3 themes × 5 score positions · en/de",
  preview: true,
});
