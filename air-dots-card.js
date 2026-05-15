/**
 * Air Dots Card for Home Assistant
 * Awair-inspired air quality card with dot indicators and score ring
 *
 * Requires Home Assistant 2026.5 or newer.
 *
 * Themes:          default | mushroom | bubble
 * Score positions: center | left | right | inline_left | inline_right
 * Languages:       en | de (auto-detected from HA profile, or set via `language:` config)
 *
 * Installation:
 *   1. Copy this file to /config/www/air-dots-card.js
 *   2. Add resource: /local/air-dots-card.js  (JavaScript Module)
 *   3. Add card via UI editor or YAML
 */

// ─── Lit (borrowed from HA frontend) ──────────────────────────────────────────

const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace") || customElements.get("hui-view")
);
const html = LitElement.prototype.html;
const css  = LitElement.prototype.css;

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

const fireEvent = (node, type, detail = {}) => {
  const event = new Event(type, { bubbles: true, composed: true });
  event.detail = detail;
  node.dispatchEvent(event);
};

// ─── i18n ─────────────────────────────────────────────────────────────────────

const TRANSLATIONS = {
  en: {
    score_labels:    ["Excellent", "Good", "Fair", "Poor", "Bad"],
    score_col_name:  "Score",
    sect_appearance: "Appearance",
    sect_general:    "General",
    sect_sensors:    "Sensors",
    lbl_theme:       "Theme",
    lbl_position:    "Score position",
    lbl_language:    "Language",
    theme_default:   "🌑 Default",
    theme_mushroom:  "🍄 Mushroom",
    theme_bubble:    "🫧 Bubble",
    pos_center:      "⬆ Center",
    pos_left:        "◀ Left",
    pos_right:       "Right ▶",
    pos_inline_left: "↔ Inline L",
    pos_inline_right:"Inline R ↔",
    lbl_title:       "Card title (optional)",
    lbl_score_entity:"Score entity",
    hint_score:      "Numeric sensor 0–100 (e.g. sensor.awair_score)",
    lbl_entity:      "Entity",
    lbl_label:       "Label",
    lbl_unit:        "Unit",
    lbl_thresholds:  "Thresholds",
    hint_thresholds:     "🟢→🟡 / 🟡→🟠 / 🟠→🔴 / 🔴→🟣",
    hint_thresholds_sym: "🔴→🟡 / 🟡→🟢 / 🟢→🟡 / 🟡→🔴",
    lbl_level:           ["Level 1→2", "Level 2→3", "Level 3→4", "Level 4→5"],
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
    auto_lang:       "Auto",
  },
  de: {
    score_labels:    ["Ausgezeichnet", "Gut", "Mäßig", "Schlecht", "Kritisch"],
    score_col_name:  "Score",
    sect_appearance: "Darstellung",
    sect_general:    "Allgemein",
    sect_sensors:    "Sensoren",
    lbl_theme:       "Design",
    lbl_position:    "Score-Position",
    lbl_language:    "Sprache",
    theme_default:   "🌑 Standard",
    theme_mushroom:  "🍄 Mushroom",
    theme_bubble:    "🫧 Bubble",
    pos_center:      "⬆ Mitte",
    pos_left:        "◀ Links",
    pos_right:       "Rechts ▶",
    pos_inline_left: "↔ Inline L",
    pos_inline_right:"Inline R ↔",
    lbl_title:       "Kartentitel (optional)",
    lbl_score_entity:"Score-Entität",
    hint_score:      "Numerischer Sensor 0–100 (z. B. sensor.awair_score)",
    lbl_entity:      "Entität",
    lbl_label:       "Bezeichnung",
    lbl_unit:        "Einheit",
    lbl_thresholds:  "Schwellenwerte",
    hint_thresholds:     "🟢→🟡 / 🟡→🟠 / 🟠→🔴 / 🔴→🟣",
    hint_thresholds_sym: "🔴→🟡 / 🟡→🟢 / 🟢→🟡 / 🟡→🔴",
    lbl_level:           ["Level 1→2", "Level 2→3", "Level 3→4", "Level 4→5"],
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
    auto_lang:       "Auto",
  },
};

function getT(langConfig, hass) {
  const raw = langConfig || "auto";
  let lang;
  if (raw === "auto") {
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

// ─── Color logic ──────────────────────────────────────────────────────────────

const THEME_COLORS = {
  default:  ["#6abf69","#f4c842","#f4923a","#e05252","#9b6ddf"],
  mushroom: ["#43a047","#f9a825","#ef6c00","#e53935","#8e24aa"],
  bubble:   ["#4caf50","#ffeb3b","#ff9800","#f44336","#9c27b0"],
};

/**
 * Map a numeric sensor value to severity level 1–5.
 * Linear (default): higher = worse.
 * Symmetric: optimal range in the center, both extremes are bad.
 *   thresholds = [low_bad, low_ok, high_ok, high_bad]
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

const levelColor = (level, theme) =>
  (THEME_COLORS[theme] || THEME_COLORS.default)[level - 1];

const scoreLevel = score =>
  score >= 90 ? 1 : score >= 75 ? 2 : score >= 55 ? 3 : score >= 35 ? 4 : 5;

const scoreLabel = (score, t) => t.score_labels[scoreLevel(score) - 1];

const scoreLabelColor = (score, theme) => {
  // Label color uses 1–4 mapping (75/55/35) for backward visual parity.
  const lvl = score >= 75 ? 1 : score >= 55 ? 2 : score >= 35 ? 3 : 4;
  return levelColor(lvl, theme);
};

// ─── Action handler (tap_action) ──────────────────────────────────────────────

function handleAction(node, hass, actionConfig, entityId) {
  const cfg = actionConfig || { action: "more-info" };
  switch (cfg.action) {
    case "none": return;
    case "more-info":
      if (entityId) fireEvent(node, "hass-more-info", { entityId });
      return;
    case "navigate":
      if (cfg.navigation_path) {
        history.pushState(null, "", cfg.navigation_path);
        fireEvent(window, "location-changed", { replace: false });
      }
      return;
    case "url":
      if (cfg.url_path) window.open(cfg.url_path);
      return;
    case "perform-action":
    case "call-service": {
      const target = cfg.perform_action || cfg.service;
      if (!target || !hass) return;
      const [domain, service] = target.split(".");
      hass.callService(domain, service, cfg.data || cfg.service_data || {}, cfg.target);
      return;
    }
  }
}

// ─── Value formatting ─────────────────────────────────────────────────────────

function formatValue(hass, stateObj) {
  if (!stateObj) return "--";
  const raw = parseFloat(stateObj.state);
  if (!Number.isFinite(raw)) return "--";
  const lang = hass?.locale?.language || "en";
  const fmt = new Intl.NumberFormat(lang, {
    maximumFractionDigits: Number.isInteger(raw) ? 0 : 1,
  });
  return fmt.format(raw);
}

// ─── CARD ──────────────────────────────────────────────────────────────────────

class AirDotsCard extends LitElement {
  static properties = {
    hass:     { attribute: false },
    _config:  { state: true },
  };

  setConfig(config) {
    if (!config?.sensors?.length)
      throw new Error("Please define at least one sensor.");
    this._config = config;
    this.setAttribute("theme",    config.theme          || "default");
    this.setAttribute("position", config.score_position || "center");
  }

  getCardSize() { return 4; }

  // Sections-view sizing (HA 2024.10+).
  getGridOptions() {
    const sensors = this._config?.sensors?.length || 5;
    const isInline = ["inline_left", "inline_right"].includes(this._config?.score_position);
    return {
      columns: 12,
      rows:    isInline ? 3 : 4,
      min_columns: Math.max(6, sensors + 1),
      min_rows: 2,
    };
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

  // ── Render helpers ──

  _ringSvg(score, color) {
    return html`
      <svg class="ring-svg" viewBox="0 0 140 140">
        <circle class="ring-track"    cx="70" cy="70" r="60" />
        <circle class="ring-progress" cx="70" cy="70" r="60"
                pathLength="100"
                style=${`stroke-dashoffset:${100 - score};stroke:${color}`} />
      </svg>`;
  }

  _ringBlock(score, color, label, small) {
    return html`
      <div class="ring-container ${small ? "small" : ""}">
        ${this._ringSvg(score, color)}
        <div class="ring-inner">
          <span class="ring-score ${small ? "small" : ""}">${score}</span>
          <span class="ring-label ${small ? "small" : ""}" style=${`color:${color}`}>${label}</span>
        </div>
      </div>`;
  }

  _inlineScore(score, color, label, theme, t) {
    // Score semantics are inverted vs. sensors: HIGH score = GOOD.
    // scoreLevel returns 1 (best) … 5 (worst), so the number of lit
    // dots is `6 - lvl` → score 100 lights all 5 dots, score 0 lights 1.
    // All lit dots share the current score's severity color so the bar
    // reads like a quality / battery meter rather than a danger meter.
    const lvl      = scoreLevel(score);
    const litCount = 6 - lvl;
    const dotColor = levelColor(lvl, theme);
    return html`
      <div class="score-inline-col"
           @click=${() => handleAction(this, this.hass, this._config.score_tap_action, this._config.score_entity)}>
        <div class="dots-col">
          ${[4,3,2,1,0].map(d => html`
            <div class="dot"
                 style=${d < litCount ? `background:${dotColor}` : ""}></div>
          `)}
        </div>
        <div class="score-inline-name">${t.score_col_name}</div>
        <div class="score-inline-val">${score}</div>
        <div class="score-inline-lbl" style=${`color:${color}`}>${label}</div>
      </div>`;
  }

  _sensorCol(s, idx, theme) {
    const stateObj = s.entity ? this.hass?.states?.[s.entity] : null;
    const raw      = stateObj ? parseFloat(stateObj.state) : NaN;
    const level    = Number.isFinite(raw) ? getLevel(raw, s.thresholds || [], !!s.symmetric) : 0;
    const value    = formatValue(this.hass, stateObj);
    const label    = s.label || stateObj?.attributes?.friendly_name || s.entity || "Sensor";
    const unit     = s.unit ?? stateObj?.attributes?.unit_of_measurement ?? "";

    // Quality-meter semantic (matches the score column since v0.9.1):
    // level 1 (best) → 5 dots, level 5 (worst) → 1 dot. All lit dots share
    // the current level's severity color so an optimal reading visually
    // reads as a full green bar, not as a single lonely dot.
    const litCount = level > 0 ? 6 - level : 0;
    const dotColor = level > 0 ? levelColor(level, theme) : "";

    return html`
      <div class="sensor-col"
           @click=${() => handleAction(this, this.hass, s.tap_action, s.entity)}>
        <div class="dots-col">
          ${[4,3,2,1,0].map(d => html`
            <div class="dot"
                 style=${d < litCount ? `background:${dotColor}` : ""}></div>
          `)}
        </div>
        <div class="sensor-name">${label}</div>
        <div class="sensor-value">${value}</div>
        <div class="sensor-unit">${unit}</div>
      </div>`;
  }

  render() {
    if (!this._config || !this.hass) return html``;
    const c        = this._config;
    const theme    = c.theme || "default";
    const position = c.score_position || "center";
    const t        = getT(c.language, this.hass);
    const isInline = position === "inline_left" || position === "inline_right";

    const scoreState = c.score_entity ? this.hass.states[c.score_entity] : null;
    const score = scoreState ? Math.round(parseFloat(scoreState.state)) || 0 : 0;
    const color = scoreLabelColor(score, theme);
    const label = scoreLabel(score, t);

    const sensorCols = c.sensors.map((s, i) => this._sensorCol(s, i, theme));
    const dividers   = (cols) => cols.flatMap((c, i) =>
      i === 0 ? [c] : [html`<div class="col-divider"></div>`, c]
    );

    let body;
    if (position === "center") {
      body = html`
        <div class="layout-center">
          <div class="ring-wrap">${this._ringBlock(score, color, label, false)}</div>
          <div class="sensors-row">${dividers(sensorCols)}</div>
        </div>`;
    } else if (position === "left") {
      body = html`
        <div class="layout-left">
          <div class="ring-wrap">${this._ringBlock(score, color, label, true)}</div>
          <div class="sensors-row">${dividers(sensorCols)}</div>
        </div>`;
    } else if (position === "right") {
      body = html`
        <div class="layout-right">
          <div class="sensors-row">${dividers(sensorCols)}</div>
          <div class="ring-wrap">${this._ringBlock(score, color, label, true)}</div>
        </div>`;
    } else {
      // inline_left / inline_right
      const score$ = this._inlineScore(score, color, label, theme, t);
      const items  = position === "inline_left"
        ? [score$, ...sensorCols]
        : [...sensorCols, score$];
      body = html`
        <div class="layout-inline">
          <div class="sensors-row">${dividers(items)}</div>
        </div>`;
    }

    return html`
      <ha-card>
        ${c.title ? html`<div class="card-title">${c.title}</div>` : ""}
        ${body}
      </ha-card>`;
  }

  static styles = css`
    :host { display: block; color-scheme: light dark; }

    /* ─── Common structure ─────────────────────────────────────────────── */
    .ring-svg     { width:100%; height:100%; transform:rotate(-90deg); }
    .ring-track   { fill:none; }
    .ring-progress{ fill:none; stroke-linecap:round;
                    stroke-dasharray:100; stroke-dashoffset:100;
                    transition:stroke-dashoffset .8s ease, stroke .5s ease; }
    .ring-inner   { position:absolute; inset:0; display:flex; flex-direction:column;
                    align-items:center; justify-content:center; }
    .ring-label   { transition:color .5s; }
    .sensors-row  { display:flex; justify-content:space-between; align-items:flex-end; gap:4px; }
    .sensor-col, .score-inline-col {
      display:flex; flex-direction:column; align-items:center; flex:1; cursor:pointer;
    }
    .dots-col     { display:flex; flex-direction:column; align-items:center; }
    .dot          { border-radius:50%; transition:background .4s; }
    .col-divider  { align-self:center; flex-shrink:0; }

    /* ─── DEFAULT theme ────────────────────────────────────────────────── */
    :host([theme="default"]) {
      --aq-bg:      #1c1f23; --aq-surface: #252930;
      --aq-inactive:#3a3f47; --aq-divider: #333840;
      --aq-text:    #e8eaed; --aq-muted:   #8b9199;
    }
    :host([theme="default"]) ha-card {
      background:var(--aq-bg) !important; border-radius:18px !important;
      padding:24px 20px 22px; box-shadow:none !important;
    }
    :host([theme="default"]) .card-title {
      font-size:13px; font-weight:500; color:var(--aq-muted); text-align:center;
      margin-bottom:18px; letter-spacing:.06em; text-transform:uppercase;
    }
    :host([theme="default"]) .layout-center .ring-wrap { display:flex; justify-content:center; margin-bottom:28px; }
    :host([theme="default"]) .ring-container        { position:relative; width:140px; height:140px; }
    :host([theme="default"]) .ring-container.small  { width:110px; height:110px; }
    :host([theme="default"]) .layout-left, :host([theme="default"]) .layout-right { display:flex; align-items:center; gap:20px; }
    :host([theme="default"]) .layout-left .ring-wrap, :host([theme="default"]) .layout-right .ring-wrap { flex-shrink:0; }
    :host([theme="default"]) .layout-left .sensors-row, :host([theme="default"]) .layout-right .sensors-row { flex:1; }
    :host([theme="default"]) .score-inline-val  { font-size:18px; font-weight:500; color:var(--aq-text); line-height:1; }
    :host([theme="default"]) .score-inline-lbl  { font-size:9px; margin-top:2px; transition:color .5s; text-align:center; }
    :host([theme="default"]) .score-inline-name { font-size:11px; color:var(--aq-muted); margin-bottom:4px; text-align:center; }
    :host([theme="default"]) .ring-track    { stroke:var(--aq-surface); stroke-width:10; }
    :host([theme="default"]) .ring-progress { stroke-width:10; }
    :host([theme="default"]) .ring-score       { font-size:44px; font-weight:500; color:var(--aq-text); line-height:1; }
    :host([theme="default"]) .ring-score.small { font-size:32px; }
    :host([theme="default"]) .ring-label       { font-size:13px; margin-top:4px; }
    :host([theme="default"]) .ring-label.small { font-size:11px; }
    :host([theme="default"]) .sensor-col:hover .sensor-value { opacity:.75; }
    :host([theme="default"]) .dots-col     { gap:7px; margin-bottom:10px; }
    :host([theme="default"]) .dot          { width:10px; height:10px; background:var(--aq-inactive); }
    :host([theme="default"]) .sensor-name  { font-size:11px; color:var(--aq-muted); margin-bottom:4px; text-align:center; }
    :host([theme="default"]) .sensor-value { font-size:18px; font-weight:500; color:var(--aq-text); line-height:1; transition:opacity .3s; }
    :host([theme="default"]) .sensor-unit  { font-size:9px; color:var(--aq-muted); margin-top:2px; text-align:center; }
    :host([theme="default"]) .col-divider  { width:.5px; height:60px; background:var(--aq-divider); margin-bottom:52px; }
    :host([theme="default"]) .layout-inline .col-divider { height:40px; margin-bottom:36px; }

    /* ─── MUSHROOM theme ──────────────────────────────────────────────── */
    :host([theme="mushroom"]) {
      --aq-bg:      var(--ha-card-background, var(--card-background-color,#fff));
      --aq-surface: light-dark(rgba(0,0,0,.05), rgba(255,255,255,.07));
      --aq-inactive:light-dark(rgba(0,0,0,.12), rgba(255,255,255,.14));
      --aq-divider: light-dark(rgba(0,0,0,.08), rgba(255,255,255,.10));
      --aq-text:    var(--primary-text-color,#212121);
      --aq-muted:   var(--secondary-text-color,#727272);
    }
    :host([theme="mushroom"]) ha-card {
      background:var(--aq-bg) !important;
      border-radius:var(--ha-card-border-radius,12px) !important;
      padding:16px;
      box-shadow:var(--ha-card-box-shadow,none) !important;
      border:1px solid var(--ha-card-border-color,var(--divider-color,rgba(0,0,0,.12))) !important;
    }
    :host([theme="mushroom"]) .card-title {
      font-size:12px; font-weight:500; color:var(--aq-muted); margin-bottom:12px;
      letter-spacing:.04em; text-transform:uppercase;
    }
    :host([theme="mushroom"]) .layout-center .ring-wrap { display:flex; justify-content:center; margin-bottom:16px; }
    :host([theme="mushroom"]) .ring-container       { position:relative; width:110px; height:110px; }
    :host([theme="mushroom"]) .ring-container.small { width:90px; height:90px; }
    :host([theme="mushroom"]) .layout-left, :host([theme="mushroom"]) .layout-right { display:flex; align-items:center; gap:16px; }
    :host([theme="mushroom"]) .layout-left .ring-wrap, :host([theme="mushroom"]) .layout-right .ring-wrap { flex-shrink:0; }
    :host([theme="mushroom"]) .layout-left .sensors-row, :host([theme="mushroom"]) .layout-right .sensors-row { flex:1; }
    :host([theme="mushroom"]) .score-inline-col { border-radius:8px; padding:6px 2px; }
    :host([theme="mushroom"]) .score-inline-val { font-size:15px; font-weight:500; color:var(--aq-text); line-height:1; }
    :host([theme="mushroom"]) .score-inline-lbl { font-size:9px;  margin-top:1px; transition:color .5s; text-align:center; }
    :host([theme="mushroom"]) .score-inline-name{ font-size:10px; color:var(--aq-muted); margin-bottom:3px; text-align:center; }
    :host([theme="mushroom"]) .ring-track    { stroke:var(--aq-surface); stroke-width:8; }
    :host([theme="mushroom"]) .ring-progress { stroke-width:8; }
    :host([theme="mushroom"]) .ring-score       { font-size:32px; font-weight:500; color:var(--aq-text); line-height:1; }
    :host([theme="mushroom"]) .ring-score.small { font-size:24px; }
    :host([theme="mushroom"]) .ring-label       { font-size:11px; margin-top:3px; }
    :host([theme="mushroom"]) .ring-label.small { font-size:10px; }
    :host([theme="mushroom"]) .sensor-col { border-radius:8px; padding:6px 2px; transition:background .15s; }
    :host([theme="mushroom"]) .sensor-col:hover { background:var(--aq-surface); }
    :host([theme="mushroom"]) .dots-col { gap:5px; margin-bottom:8px; }
    :host([theme="mushroom"]) .dot      { width:8px; height:8px; background:var(--aq-inactive); }
    :host([theme="mushroom"]) .sensor-name  { font-size:10px; color:var(--aq-muted); margin-bottom:3px; text-align:center; }
    :host([theme="mushroom"]) .sensor-value { font-size:15px; font-weight:500; color:var(--aq-text); line-height:1; }
    :host([theme="mushroom"]) .sensor-unit  { font-size:9px; color:var(--aq-muted); margin-top:1px; text-align:center; }
    :host([theme="mushroom"]) .col-divider  { width:.5px; height:48px; background:var(--aq-divider); margin-bottom:40px; }
    :host([theme="mushroom"]) .layout-inline .col-divider { height:34px; margin-bottom:28px; }

    /* ─── BUBBLE theme ────────────────────────────────────────────────── */
    :host([theme="bubble"]) {
      --aq-bg:      var(--ha-card-background, var(--card-background-color,#fff));
      --aq-surface: light-dark(rgba(0,0,0,.05), rgba(255,255,255,.07));
      --aq-inactive:light-dark(rgba(0,0,0,.10), rgba(255,255,255,.12));
      --aq-text:    var(--primary-text-color,#111);
      --aq-muted:   var(--secondary-text-color,#888);
    }
    :host([theme="bubble"]) ha-card {
      background:var(--aq-bg) !important; border-radius:32px !important;
      padding:20px 18px 18px; box-shadow:none !important; border:none !important;
    }
    :host([theme="bubble"]) .card-title {
      font-size:11px; font-weight:600; color:var(--aq-muted); text-align:center;
      margin-bottom:14px; letter-spacing:.08em; text-transform:uppercase;
    }
    :host([theme="bubble"]) .layout-center .ring-wrap { display:flex; justify-content:center; margin-bottom:16px; }
    :host([theme="bubble"]) .ring-container       { position:relative; width:100px; height:100px; }
    :host([theme="bubble"]) .ring-container.small { width:84px; height:84px; }
    :host([theme="bubble"]) .layout-left, :host([theme="bubble"]) .layout-right { display:flex; align-items:center; gap:14px; }
    :host([theme="bubble"]) .layout-left .ring-wrap, :host([theme="bubble"]) .layout-right .ring-wrap { flex-shrink:0; }
    :host([theme="bubble"]) .layout-left .sensors-row, :host([theme="bubble"]) .layout-right .sensors-row { flex:1; }
    :host([theme="bubble"]) .score-inline-col { background:var(--aq-surface); border-radius:18px; padding:10px 4px 8px; }
    :host([theme="bubble"]) .score-inline-val { font-size:14px; font-weight:600; color:var(--aq-text); line-height:1; }
    :host([theme="bubble"]) .score-inline-lbl { font-size:8px; margin-top:2px; font-weight:500; letter-spacing:.04em; transition:color .5s; text-align:center; }
    :host([theme="bubble"]) .score-inline-name{ font-size:9px; color:var(--aq-muted); margin-bottom:3px; font-weight:500; text-transform:uppercase; letter-spacing:.03em; text-align:center; }
    :host([theme="bubble"]) .ring-track    { stroke:var(--aq-surface); stroke-width:10; }
    :host([theme="bubble"]) .ring-progress { stroke-width:10; }
    :host([theme="bubble"]) .ring-score       { font-size:28px; font-weight:600; color:var(--aq-text); line-height:1; }
    :host([theme="bubble"]) .ring-score.small { font-size:22px; }
    :host([theme="bubble"]) .ring-label       { font-size:10px; margin-top:2px; font-weight:500; letter-spacing:.04em; }
    :host([theme="bubble"]) .ring-label.small { font-size:9px; }
    :host([theme="bubble"]) .sensors-row { gap:6px; }
    :host([theme="bubble"]) .sensor-col { background:var(--aq-surface); border-radius:18px; padding:10px 4px 8px; transition:opacity .15s; }
    :host([theme="bubble"]) .sensor-col:hover { opacity:.8; }
    :host([theme="bubble"]) .dots-col { gap:5px; margin-bottom:6px; }
    :host([theme="bubble"]) .dot      { width:7px; height:7px; background:var(--aq-inactive); }
    :host([theme="bubble"]) .sensor-name  { font-size:9px; color:var(--aq-muted); margin-bottom:3px; text-align:center; font-weight:500; letter-spacing:.03em; text-transform:uppercase; }
    :host([theme="bubble"]) .sensor-value { font-size:14px; font-weight:600; color:var(--aq-text); line-height:1; }
    :host([theme="bubble"]) .sensor-unit  { font-size:8px; color:var(--aq-muted); margin-top:2px; text-align:center; }
    :host([theme="bubble"]) .col-divider  { display:none; }
  `;
}

customElements.define("air-dots-card", AirDotsCard);

// ─── EDITOR ────────────────────────────────────────────────────────────────────

class AirDotsCardEditor extends LitElement {
  static properties = {
    hass:    { attribute: false },
    _config: { state: true },
  };

  setConfig(config) {
    this._config = structuredClone(config);
  }

  _t() { return getT(this._config?.language, this.hass); }

  _emit(cfg) {
    this._config = cfg;
    fireEvent(this, "config-changed", { config: cfg });
  }

  // ── Schemas for ha-form ──

  _topSchema(t) {
    return [
      {
        name: "title",
        selector: { text: {} },
      },
      {
        name: "score_entity",
        selector: { entity: { domain: ["sensor", "input_number"] } },
      },
      {
        name: "_appearance",
        type: "grid",
        schema: [
          {
            name: "theme",
            selector: { select: { mode: "dropdown", options: [
              { value: "default",  label: t.theme_default  },
              { value: "mushroom", label: t.theme_mushroom },
              { value: "bubble",   label: t.theme_bubble   },
            ]}},
          },
          {
            name: "score_position",
            selector: { select: { mode: "dropdown", options: [
              { value: "center",       label: t.pos_center       },
              { value: "left",         label: t.pos_left         },
              { value: "right",        label: t.pos_right        },
              { value: "inline_left",  label: t.pos_inline_left  },
              { value: "inline_right", label: t.pos_inline_right },
            ]}},
          },
        ],
      },
      {
        name: "language",
        selector: { select: { mode: "dropdown", options: [
          { value: "auto", label: `${t.auto_lang} (${this.hass?.locale?.language || "?"})` },
          { value: "en",   label: "English" },
          { value: "de",   label: "Deutsch" },
        ]}},
      },
    ];
  }

  _sensorSchema() {
    return [
      {
        name: "entity",
        selector: { entity: { domain: ["sensor", "input_number"] } },
      },
      {
        name: "_meta",
        type: "grid",
        schema: [
          { name: "label", selector: { text: {} } },
          { name: "unit",  selector: { text: {} } },
        ],
      },
      {
        name: "symmetric",
        selector: { boolean: {} },
      },
      {
        name: "_thresholds",
        type: "grid",
        schema: [
          { name: "t0", selector: { number: { mode: "box", step: "any" } } },
          { name: "t1", selector: { number: { mode: "box", step: "any" } } },
          { name: "t2", selector: { number: { mode: "box", step: "any" } } },
          { name: "t3", selector: { number: { mode: "box", step: "any" } } },
        ],
      },
    ];
  }

  _topLabel = (t) => (schema) => ({
    title:          t.lbl_title,
    score_entity:   t.lbl_score_entity,
    theme:          t.lbl_theme,
    score_position: t.lbl_position,
    language:       t.lbl_language,
  })[schema.name] ?? "";

  _topHelper = (t) => (schema) => ({
    score_entity: t.hint_score,
  })[schema.name] ?? "";

  _sensorLabel = (t, symmetric) => (schema) => {
    if (schema.name === "entity")    return t.lbl_entity;
    if (schema.name === "label")     return t.lbl_label;
    if (schema.name === "unit")      return t.lbl_unit;
    if (schema.name === "symmetric") return t.lbl_symmetric;
    if (/^t[0-3]$/.test(schema.name)) {
      const i = +schema.name[1];
      return symmetric ? t.lbl_level_sym[i] : t.lbl_level[i];
    }
    return "";
  };

  _sensorHelper = (t) => (schema) => ({
    symmetric: t.hint_symmetric,
  })[schema.name] ?? "";

  // ── Event handlers ──

  _onTopChanged(e) {
    const v   = e.detail.value;
    const cfg = { ...this._config, ...v };
    delete cfg._appearance;
    this._emit(cfg);
  }

  _onSensorChanged(idx, e) {
    const v   = e.detail.value;
    const cfg = structuredClone(this._config);
    const s   = cfg.sensors[idx];
    s.entity    = v.entity;
    s.label     = v.label;
    s.unit      = v.unit;
    s.symmetric = !!v.symmetric;
    s.thresholds = [v.t0, v.t1, v.t2, v.t3].map(x =>
      x === "" || x === null || x === undefined ? null : Number(x)
    );
    this._emit(cfg);
  }

  _addSensor() {
    const cfg = structuredClone(this._config);
    const def = AWAIR_DEFAULTS[cfg.sensors.length] || { label: "Sensor", unit: "", thresholds: [10,20,30,40] };
    cfg.sensors.push({ entity: "", label: def.label, unit: def.unit, thresholds: [...def.thresholds], symmetric: !!def.symmetric });
    this._emit(cfg);
  }

  _removeSensor(idx) {
    const cfg = structuredClone(this._config);
    cfg.sensors.splice(idx, 1);
    this._emit(cfg);
  }

  _moveSensor(idx, dir) {
    const cfg = structuredClone(this._config);
    const to  = idx + dir;
    if (to < 0 || to >= cfg.sensors.length) return;
    [cfg.sensors[idx], cfg.sensors[to]] = [cfg.sensors[to], cfg.sensors[idx]];
    this._emit(cfg);
  }

  render() {
    if (!this._config || !this.hass) return html``;
    const c       = this._config;
    const sensors = c.sensors || [];
    const t       = this._t();

    const topData = {
      title:          c.title || "",
      score_entity:   c.score_entity || "",
      theme:          c.theme || "default",
      score_position: c.score_position || "center",
      language:       c.language || "auto",
    };

    return html`
      <div class="section">
        <div class="section-title">${t.sect_general} · ${t.sect_appearance}</div>
        <ha-form
          .hass=${this.hass}
          .data=${topData}
          .schema=${this._topSchema(t)}
          .computeLabel=${this._topLabel(t)}
          .computeHelper=${this._topHelper(t)}
          @value-changed=${this._onTopChanged}
        ></ha-form>
      </div>

      <div class="section">
        <div class="section-title">${t.sect_sensors} (${sensors.length})</div>
        ${sensors.map((s, i) => {
          const data = {
            entity:    s.entity || "",
            label:     s.label  || "",
            unit:      s.unit   || "",
            symmetric: !!s.symmetric,
            t0: s.thresholds?.[0] ?? null,
            t1: s.thresholds?.[1] ?? null,
            t2: s.thresholds?.[2] ?? null,
            t3: s.thresholds?.[3] ?? null,
          };
          return html`
            <div class="sensor-card">
              <div class="sensor-header">
                <span class="sensor-title">${i + 1}. ${s.label || "Sensor"}</span>
                <div class="actions">
                  <ha-icon-button
                    .label=${t.tip_up}
                    .path=${"M7,15L12,10L17,15H7Z"}
                    @click=${() => this._moveSensor(i, -1)}
                  ></ha-icon-button>
                  <ha-icon-button
                    .label=${t.tip_down}
                    .path=${"M7,10L12,15L17,10H7Z"}
                    @click=${() => this._moveSensor(i, +1)}
                  ></ha-icon-button>
                  <ha-icon-button
                    class="del"
                    .label=${t.tip_remove}
                    .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}
                    @click=${() => this._removeSensor(i)}
                  ></ha-icon-button>
                </div>
              </div>
              <div class="thresholds-hint">
                ${s.symmetric ? t.hint_thresholds_sym : t.hint_thresholds}
              </div>
              <ha-form
                .hass=${this.hass}
                .data=${data}
                .schema=${this._sensorSchema()}
                .computeLabel=${this._sensorLabel(t, !!s.symmetric)}
                .computeHelper=${this._sensorHelper(t)}
                @value-changed=${(e) => this._onSensorChanged(i, e)}
              ></ha-form>
            </div>
          `;
        })}
        <button class="add-btn" @click=${this._addSensor}>${t.btn_add}</button>
      </div>
    `;
  }

  static styles = css`
    :host { display:block; }
    .section { margin-bottom:20px; }
    .section-title {
      font-size:11px; font-weight:500; text-transform:uppercase;
      letter-spacing:.08em; color:var(--secondary-text-color);
      margin-bottom:10px; padding-bottom:4px;
      border-bottom:1px solid var(--divider-color,#e0e0e0);
    }
    .sensor-card {
      border:1px solid var(--divider-color,#e0e0e0);
      border-radius:10px; padding:12px; margin-bottom:12px;
      background:var(--secondary-background-color,#f5f5f5);
    }
    .sensor-header {
      display:flex; align-items:center; justify-content:space-between;
      margin-bottom:8px;
    }
    .sensor-title { font-size:13px; font-weight:500; color:var(--primary-text-color); }
    .actions { display:flex; gap:2px; }
    .actions ha-icon-button { --mdc-icon-button-size:32px; --mdc-icon-size:18px; color:var(--secondary-text-color); }
    .actions ha-icon-button.del { color:var(--error-color, #c62828); }
    .thresholds-hint {
      font-size:11px; color:var(--secondary-text-color);
      margin-bottom:6px; padding:0 4px;
    }
    .add-btn {
      width:100%; padding:10px; border-radius:8px;
      border:1.5px dashed var(--divider-color,#bbb);
      background:none; cursor:pointer; font-size:14px;
      color:var(--primary-color); transition:background .15s;
    }
    .add-btn:hover { background:var(--primary-color-light, rgba(3,169,244,.08)); }
    ha-form { display:block; }
  `;
}

customElements.define("air-dots-card-editor", AirDotsCardEditor);

// ─── HACS / Lovelace registration ─────────────────────────────────────────────

window.customCards = window.customCards || [];
window.customCards.push({
  type: "air-dots-card",
  name: "Air Dots Card",
  description: "Awair-inspired air quality card — 3 themes × 5 score positions · en/de",
  preview: true,
  documentationURL: "https://github.com/tioan/air-dots-card",
});
