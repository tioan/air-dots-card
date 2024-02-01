/**
 * Air Quality Card for Home Assistant
 * Themes: default | mushroom | bubble
 *
 * Installation:
 *   1. Copy this file to /config/www/air-quality-card.js
 *   2. Add resource: /local/air-quality-card.js  (JavaScript Module)
 *   3. Add card via UI editor or YAML
 */

const AWAIR_DEFAULTS = [
  { label: "Temp",      unit: "°C",             thresholds: [18, 20, 25, 27]        },
  { label: "Humidity",  unit: "%",              thresholds: [30, 40, 60, 65]        },
  { label: "CO\u2082",  unit: "ppm",            thresholds: [600, 1000, 2000, 4500] },
  { label: "Chemicals", unit: "ppb",            thresholds: [300, 500, 3000, 25000] },
  { label: "PM2.5",     unit: "\u00b5g/m\u00b3",thresholds: [12, 35, 55, 150]       },
];

function getLevel(value, thresholds) {
  let level = 1;
  for (const t of thresholds) { if (value > t) level++; else break; }
  return Math.min(level, 5);
}

function levelColor(level, theme) {
  const colors = {
    default:  ["#6abf69","#f4c842","#f4923a","#e05252","#9b6ddf"],
    mushroom: ["#43a047","#f9a825","#ef6c00","#e53935","#8e24aa"],
    bubble:   ["#4caf50","#ffeb3b","#ff9800","#f44336","#9c27b0"],
  };
  return (colors[theme] || colors.default)[level - 1];
}

function scoreLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 55) return "Fair";
  if (score >= 35) return "Poor";
  return "Bad";
}

function scoreLabelColor(score, theme) {
  const level = score >= 75 ? 1 : score >= 55 ? 2 : score >= 35 ? 3 : 4;
  return levelColor(level, theme);
}

const THEME_CSS = {
  default: `
    :host { --aq-bg:#1c1f23; --aq-surface:#252930; --aq-inactive:#3a3f47; --aq-divider:#333840; --aq-text:#e8eaed; --aq-muted:#8b9199; display:block; }
    ha-card { background:var(--aq-bg) !important; border-radius:18px !important; padding:24px 20px 22px; box-shadow:none !important; }
    .card-title { font-size:13px; font-weight:500; color:var(--aq-muted); text-align:center; margin-bottom:18px; letter-spacing:.06em; text-transform:uppercase; }
    .ring-wrap { display:flex; justify-content:center; margin-bottom:28px; }
    .ring-container { position:relative; width:140px; height:140px; }
    .ring-svg { width:100%; height:100%; transform:rotate(-90deg); }
    .ring-track { fill:none; stroke:var(--aq-surface); stroke-width:10; }
    .ring-progress { fill:none; stroke-width:10; stroke-linecap:round; stroke-dasharray:376.99; stroke-dashoffset:377; transition:stroke-dashoffset .8s ease,stroke .5s ease; }
    .ring-inner { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .ring-score { font-size:44px; font-weight:500; color:var(--aq-text); line-height:1; }
    .ring-label { font-size:13px; margin-top:4px; transition:color .5s; }
    .sensors-row { display:flex; justify-content:space-between; align-items:flex-end; gap:4px; }
    .sensor-col { display:flex; flex-direction:column; align-items:center; flex:1; cursor:pointer; }
    .sensor-col:hover .sensor-value { opacity:.75; }
    .dots-col { display:flex; flex-direction:column; align-items:center; gap:7px; margin-bottom:10px; }
    .dot { width:10px; height:10px; border-radius:50%; background:var(--aq-inactive); transition:background .4s; }
    .sensor-name { font-size:11px; color:var(--aq-muted); margin-bottom:4px; text-align:center; }
    .sensor-value { font-size:18px; font-weight:500; color:var(--aq-text); line-height:1; transition:opacity .3s; }
    .sensor-unit { font-size:9px; color:var(--aq-muted); margin-top:2px; text-align:center; }
    .col-divider { width:.5px; height:60px; background:var(--aq-divider); align-self:center; margin-bottom:52px; flex-shrink:0; }
  `,
  mushroom: `
    :host { --aq-bg:var(--ha-card-background,var(--card-background-color,#fff)); --aq-surface:rgba(var(--rgb-primary-color,33,150,243),.08); --aq-inactive:rgba(var(--rgb-primary-text-color,0,0,0),.12); --aq-divider:rgba(var(--rgb-primary-text-color,0,0,0),.08); --aq-text:var(--primary-text-color,#212121); --aq-muted:var(--secondary-text-color,#727272); display:block; }
    ha-card { background:var(--aq-bg) !important; border-radius:var(--ha-card-border-radius,12px) !important; padding:16px; border:1px solid var(--divider-color,rgba(0,0,0,.12)) !important; }
    .card-title { font-size:12px; font-weight:500; color:var(--aq-muted); margin-bottom:12px; letter-spacing:.04em; text-transform:uppercase; }
    .ring-wrap { display:flex; justify-content:center; margin-bottom:16px; }
    .ring-container { position:relative; width:110px; height:110px; }
    .ring-svg { width:100%; height:100%; transform:rotate(-90deg); }
    .ring-track { fill:none; stroke:var(--aq-surface); stroke-width:8; }
    .ring-progress { fill:none; stroke-width:8; stroke-linecap:round; stroke-dasharray:376.99; stroke-dashoffset:377; transition:stroke-dashoffset .8s ease,stroke .5s ease; }
    .ring-inner { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .ring-score { font-size:32px; font-weight:500; color:var(--aq-text); line-height:1; }
    .ring-label { font-size:11px; margin-top:3px; transition:color .5s; }
    .sensors-row { display:flex; justify-content:space-between; align-items:flex-end; gap:4px; }
    .sensor-col { display:flex; flex-direction:column; align-items:center; flex:1; cursor:pointer; border-radius:8px; padding:6px 2px; transition:background .15s; }
    .sensor-col:hover { background:var(--aq-surface); }
    .dots-col { display:flex; flex-direction:column; align-items:center; gap:5px; margin-bottom:8px; }
    .dot { width:8px; height:8px; border-radius:50%; background:var(--aq-inactive); transition:background .4s; }
    .sensor-name { font-size:10px; color:var(--aq-muted); margin-bottom:3px; text-align:center; }
    .sensor-value { font-size:15px; font-weight:500; color:var(--aq-text); line-height:1; }
    .sensor-unit { font-size:9px; color:var(--aq-muted); margin-top:1px; text-align:center; }
    .col-divider { width:.5px; height:48px; background:var(--aq-divider); align-self:center; margin-bottom:40px; flex-shrink:0; }
  `,
  bubble: `
    :host { --aq-bg:var(--ha-card-background,var(--card-background-color,#fff)); --aq-surface:rgba(var(--rgb-primary-color,99,102,241),.10); --aq-inactive:rgba(var(--rgb-primary-text-color,0,0,0),.10); --aq-divider:transparent; --aq-text:var(--primary-text-color,#111); --aq-muted:var(--secondary-text-color,#888); display:block; }
    ha-card { background:var(--aq-bg) !important; border-radius:32px !important; padding:20px 18px 18px; box-shadow:none !important; border:none !important; }
    .card-title { font-size:11px; font-weight:600; color:var(--aq-muted); text-align:center; margin-bottom:14px; letter-spacing:.08em; text-transform:uppercase; }
    .ring-wrap { display:flex; justify-content:center; margin-bottom:16px; }
    .ring-container { position:relative; width:100px; height:100px; }
    .ring-svg { width:100%; height:100%; transform:rotate(-90deg); }
    .ring-track { fill:none; stroke:var(--aq-surface); stroke-width:10; }
    .ring-progress { fill:none; stroke-width:10; stroke-linecap:round; stroke-dasharray:376.99; stroke-dashoffset:377; transition:stroke-dashoffset .8s ease,stroke .5s ease; }
    .ring-inner { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .ring-score { font-size:28px; font-weight:600; color:var(--aq-text); line-height:1; }
    .ring-label { font-size:10px; margin-top:2px; transition:color .5s; font-weight:500; }
    .sensors-row { display:flex; justify-content:space-between; align-items:flex-end; gap:6px; }
    .sensor-col { display:flex; flex-direction:column; align-items:center; flex:1; cursor:pointer; background:var(--aq-surface); border-radius:18px; padding:10px 4px 8px; transition:opacity .15s; }
    .sensor-col:hover { opacity:.8; }
    .dots-col { display:flex; flex-direction:column; align-items:center; gap:5px; margin-bottom:6px; }
    .dot { width:7px; height:7px; border-radius:50%; background:var(--aq-inactive); transition:background .4s; }
    .sensor-name { font-size:9px; color:var(--aq-muted); margin-bottom:3px; text-align:center; font-weight:500; text-transform:uppercase; }
    .sensor-value { font-size:14px; font-weight:600; color:var(--aq-text); line-height:1; }
    .sensor-unit { font-size:8px; color:var(--aq-muted); margin-top:2px; text-align:center; }
    .col-divider { display:none; }
  `,
};

class AirQualityCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }); }

  setConfig(config) {
    if (!config.sensors || config.sensors.length === 0) throw new Error("Please define at least one sensor.");
    this._config = config; this.render();
  }

  set hass(hass) { this._hass = hass; this.updateValues(); }
  getCardSize() { return 4; }
  _theme() { return this._config.theme || "default"; }

  render() {
    const theme = this._theme();
    const title = this._config.title || "";
    this.shadowRoot.innerHTML = `
      <style>${THEME_CSS[theme] || THEME_CSS.default}</style>
      <ha-card>
        ${title ? `<div class="card-title">${title}</div>` : ""}
        <div class="ring-wrap"><div class="ring-container">
          <svg class="ring-svg" viewBox="0 0 140 140">
            <circle class="ring-track" cx="70" cy="70" r="60"/>
            <circle class="ring-progress" cx="70" cy="70" r="60" id="ring"/>
          </svg>
          <div class="ring-inner">
            <span class="ring-score" id="score-val">--</span>
            <span class="ring-label" id="score-lbl">--</span>
          </div>
        </div></div>
        <div class="sensors-row" id="sensors-row"></div>
      </ha-card>`;
    this._buildSensorColumns();
  }

  _buildSensorColumns() {
    const row = this.shadowRoot.getElementById("sensors-row");
    if (!row) return;
    row.innerHTML = "";
    const theme = this._theme();
    this._config.sensors.forEach((s, i) => {
      const dotsDiv = document.createElement("div");
      dotsDiv.className = "dots-col";
      for (let d = 4; d >= 0; d--) {
        const dot = document.createElement("div");
        dot.className = "dot"; dot.dataset.sensor = i; dot.dataset.pos = d;
        dotsDiv.appendChild(dot);
      }
      const col = document.createElement("div");
      col.className = "sensor-col";
      col.innerHTML = `<div class="sensor-name">${s.label || s.entity}</div><div class="sensor-value" id="val-${i}">--</div><div class="sensor-unit">${s.unit || ""}</div>`;
      col.insertBefore(dotsDiv, col.firstChild);
      col.addEventListener("click", () => {
        if (this._hass && s.entity)
          this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles:true, composed:true, detail:{ entityId:s.entity } }));
      });
      row.appendChild(col);
      if (i < this._config.sensors.length - 1) { const div = document.createElement("div"); div.className = "col-divider"; row.appendChild(div); }
    });
  }

  updateValues() {
    if (!this._hass || !this._config) return;
    const theme = this._theme();
    this._config.sensors.forEach((s, i) => {
      const raw = s.entity && this._hass.states[s.entity] ? parseFloat(this._hass.states[s.entity].state) : null;
      const valEl = this.shadowRoot.getElementById(`val-${i}`);
      if (valEl) valEl.textContent = raw !== null ? (Number.isInteger(raw) ? raw : raw.toFixed(1)) : "--";
      const level = raw !== null ? getLevel(raw, s.thresholds || []) : 0;
      this.shadowRoot.querySelectorAll(`.dot[data-sensor="${i}"]`).forEach(dot => {
        const pos = parseInt(dot.dataset.pos);
        dot.style.background = pos < level ? levelColor(level, theme) : "";
      });
    });
    const scoreEntity = this._config.score_entity;
    let score = 0;
    if (scoreEntity && this._hass.states[scoreEntity])
      score = Math.round(parseFloat(this._hass.states[scoreEntity].state)) || 0;
    const color = scoreLabelColor(score, theme);
    const scoreEl = this.shadowRoot.getElementById("score-val");
    const lblEl   = this.shadowRoot.getElementById("score-lbl");
    const ringEl  = this.shadowRoot.getElementById("ring");
    if (scoreEl) scoreEl.textContent = score;
    if (lblEl)   { lblEl.textContent = scoreLabel(score); lblEl.style.color = color; }
    if (ringEl)  { ringEl.style.strokeDashoffset = 376.99 - (score/100)*376.99; ringEl.style.stroke = color; }
  }

  static getConfigElement() { return document.createElement("air-quality-card-editor"); }
  static getStubConfig() {
    return { title:"Air Quality", theme:"default", score_entity:"", sensors:AWAIR_DEFAULTS.map(d=>({entity:"",...d,thresholds:[...d.thresholds]})) };
  }
}

customElements.define("air-quality-card", AirQualityCard);

class AirQualityCardEditor extends HTMLElement {
  constructor() { super(); this.attachShadow({mode:"open"}); this._config={}; this._hass=null; }
  setConfig(config) { this._config=JSON.parse(JSON.stringify(config)); this._render(); }
  set hass(hass) { this._hass=hass; this.shadowRoot.querySelectorAll("ha-entity-picker").forEach(el=>{el.hass=hass;}); }
  _fire(cfg) { this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:cfg},bubbles:true,composed:true})); }
  _set(path,value) {
    const cfg=JSON.parse(JSON.stringify(this._config));
    const parts=path.split(".");let obj=cfg;
    for(let i=0;i<parts.length-1;i++) obj=obj[parts[i]];
    obj[parts[parts.length-1]]=value;
    this._config=cfg;this._fire(cfg);this._render();
  }
  _addSensor() {
    const cfg=JSON.parse(JSON.stringify(this._config));
    const def=AWAIR_DEFAULTS[cfg.sensors.length]||{label:"Sensor",unit:"",thresholds:[10,20,30,40]};
    cfg.sensors.push({entity:"",label:def.label,unit:def.unit,thresholds:[...def.thresholds]});
    this._config=cfg;this._fire(cfg);this._render();
  }
  _removeSensor(idx) { const cfg=JSON.parse(JSON.stringify(this._config));cfg.sensors.splice(idx,1);this._config=cfg;this._fire(cfg);this._render(); }
  _moveSensor(idx,dir) {
    const cfg=JSON.parse(JSON.stringify(this._config));const to=idx+dir;
    if(to<0||to>=cfg.sensors.length)return;
    [cfg.sensors[idx],cfg.sensors[to]]=[cfg.sensors[to],cfg.sensors[idx]];
    this._config=cfg;this._fire(cfg);this._render();
  }
  _render() {
    const c=this._config,sensors=c.sensors||[],theme=c.theme||"default";
    const pill=(val,label,active)=>`<button class="pill ${active?"active":""}" data-val="${val}">${label}</button>`;
    this.shadowRoot.innerHTML=`
      <style>
        :host{display:block;}.section{margin-bottom:20px;}.section-title{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.08em;color:var(--secondary-text-color);margin-bottom:10px;padding-bottom:4px;border-bottom:1px solid var(--divider-color,#e0e0e0);}
        .field{margin-bottom:12px;}label{display:block;font-size:12px;color:var(--secondary-text-color);margin-bottom:4px;}
        input[type="text"],input[type="number"]{width:100%;padding:8px 10px;box-sizing:border-box;border-radius:6px;border:1px solid var(--divider-color,#ccc);background:var(--card-background-color,#fff);color:var(--primary-text-color);font-size:14px;}
        .pills{display:flex;gap:8px;}.pill{flex:1;padding:8px 4px;border-radius:8px;border:1.5px solid var(--divider-color,#ddd);background:none;cursor:pointer;font-size:12px;color:var(--secondary-text-color);text-align:center;}
        .pill.active{border-color:var(--primary-color,#03a9f4);background:var(--primary-color-light,#e3f2fd);color:var(--primary-color,#03a9f4);font-weight:500;}
        .sensor-card{border:1px solid var(--divider-color,#e0e0e0);border-radius:10px;padding:14px 14px 10px;margin-bottom:12px;background:var(--secondary-background-color,#f5f5f5);}
        .sensor-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}.sensor-title{font-size:13px;font-weight:500;color:var(--primary-text-color);}
        .actions{display:flex;gap:4px;}.btn{background:none;border:none;cursor:pointer;padding:4px 7px;border-radius:6px;font-size:15px;line-height:1;color:var(--secondary-text-color);}
        .btn:hover{background:var(--divider-color,#e0e0e0);}.btn.del:hover{background:#ffebee;color:#c62828;}
        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:10px;}.four-col{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
        .add-btn{width:100%;padding:10px;border-radius:8px;border:1.5px dashed var(--divider-color,#bbb);background:none;cursor:pointer;font-size:14px;color:var(--primary-color);}
        ha-entity-picker{display:block;}.hint{font-size:11px;color:var(--secondary-text-color);margin-top:3px;}
      </style>
      <div class="section">
        <div class="section-title">Appearance</div>
        <div class="field"><label>Theme</label>
          <div class="pills" id="theme-pills">
            ${pill("default","🌑 Default",theme==="default")}
            ${pill("mushroom","🍄 Mushroom",theme==="mushroom")}
            ${pill("bubble","🫧 Bubble",theme==="bubble")}
          </div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">General</div>
        <div class="field"><label>Card title (optional)</label><input id="inp-title" type="text" value="${c.title||""}" placeholder="e.g. Living Room"></div>
        <div class="field"><label>Score entity</label><ha-entity-picker id="picker-score" allow-custom-entity .value="${c.score_entity||""}"></ha-entity-picker><div class="hint">Numeric sensor 0–100</div></div>
      </div>
      <div class="section">
        <div class="section-title">Sensors (${sensors.length})</div>
        <div id="sensor-list"></div>
        <button class="add-btn" id="btn-add">+ Add sensor</button>
      </div>`;
    this.shadowRoot.getElementById("theme-pills").querySelectorAll(".pill").forEach(btn=>{btn.addEventListener("click",()=>{this._set("theme",btn.dataset.val);});});
    this.shadowRoot.getElementById("inp-title").addEventListener("change",e=>{this._set("title",e.target.value);});
    const sp=this.shadowRoot.getElementById("picker-score");
    if(this._hass)sp.hass=this._hass;
    sp.addEventListener("value-changed",e=>{this._set("score_entity",e.detail.value);});
    const list=this.shadowRoot.getElementById("sensor-list");
    sensors.forEach((s,i)=>{
      const card=document.createElement("div");card.className="sensor-card";
      card.innerHTML=`<div class="sensor-header"><span class="sensor-title">${i+1}. ${s.label||"Sensor"}</span><div class="actions"><button class="btn" data-mv="-1">↑</button><button class="btn" data-mv="1">↓</button><button class="btn del" data-del="1">✕</button></div></div>
        <div class="field"><label>Entity</label><ha-entity-picker allow-custom-entity .value="${s.entity||""}"></ha-entity-picker></div>
        <div class="two-col"><div class="field"><label>Label</label><input type="text" data-key="label" value="${s.label||""}"></div><div class="field"><label>Unit</label><input type="text" data-key="unit" value="${s.unit||""}"></div></div>
        <div class="field"><label>Thresholds (🟢→🟡/🟡→🟠/🟠→🔴/🔴→🟣)</label><div class="four-col">${[0,1,2,3].map(ti=>`<div><label style="font-size:11px">Level ${ti+1}→${ti+2}</label><input type="number" data-ti="${ti}" value="${(s.thresholds||[])[ti]??""}"></div>`).join("")}</div></div>`;
      const picker=card.querySelector("ha-entity-picker");
      if(this._hass)picker.hass=this._hass;
      picker.addEventListener("value-changed",e=>{this._set(`sensors.${i}.entity`,e.detail.value);});
      card.querySelectorAll("input[data-key]").forEach(inp=>{inp.addEventListener("change",e=>{this._set(`sensors.${i}.${e.target.dataset.key}`,e.target.value);});});
      card.querySelectorAll("input[data-ti]").forEach(inp=>{inp.addEventListener("change",e=>{const cfg=JSON.parse(JSON.stringify(this._config));cfg.sensors[i].thresholds[parseInt(e.target.dataset.ti)]=parseFloat(e.target.value);this._config=cfg;this._fire(cfg);});});
      card.querySelector("[data-mv='-1']").addEventListener("click",()=>{this._moveSensor(i,-1);});
      card.querySelector("[data-mv='1']").addEventListener("click",()=>{this._moveSensor(i,+1);});
      card.querySelector("[data-del]").addEventListener("click",()=>{this._removeSensor(i);});
      list.appendChild(card);
    });
    this.shadowRoot.getElementById("btn-add").addEventListener("click",()=>{this._addSensor();});
  }
}

customElements.define("air-quality-card-editor", AirQualityCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({ type:"air-quality-card", name:"Air Quality Card", description:"Awair-inspired air quality card — 3 themes", preview:true });
