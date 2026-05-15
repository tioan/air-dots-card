# Changelog — Air Dots Card

All notable changes to this project are documented here.  
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

Repository: [github.com/tioan/air-dots-card](https://github.com/tioan/air-dots-card)  
Created with [Claude Sonnet 4.6](https://claude.ai) by Anthropic.

Types of changes:
- **Added** — new features
- **Changed** — changes to existing functionality
- **Deprecated** — features that will be removed in a future release
- **Removed** — features removed in this release
- **Fixed** — bug fixes
- **Security** — vulnerability fixes

---

## [Unreleased]

---

## [0.9.3] — Unify sensor + score dots as quality meters

### Fixed
- Symmetric sensors (e.g. humidity at 54%, temperature at 22°C) showed
  only **one** dot for an optimal reading because the previous
  visualization treated the dot bar as a "danger meter" (more dots =
  worse, level 1 = 1 dot). For a symmetric sensor that *peaks* at
  level 1, this made the perfect value look like the bar was nearly
  empty. Optimal readings now fill the entire bar (5 dots).

### Changed
- **All dot bars (sensors *and* score) now share a single semantic:**
  more lit dots = better. The number of lit dots is `6 − level`
  (level 1 → 5 dots, level 5 → 1 dot). All lit dots share the same
  color, matching the current level's severity tier (green / yellow /
  orange / red / purple). The score column already worked this way
  since v0.9.1; sensor columns are now consistent with it.
- This replaces the v0.8.1 "graduated colors per dot position" design
  for sensor columns. That design conflicted with the new score
  semantic introduced in v0.9.1 and made symmetric sensors confusing.

### Visual reference (sensor + score, all themes)

| Level | Lit dots | Color   | Meaning              |
|-------|---------:|---------|----------------------|
| 1     | 5        | green   | Excellent / optimal  |
| 2     | 4        | yellow  | Good                 |
| 3     | 3        | orange  | Fair                 |
| 4     | 2        | red     | Poor                 |
| 5     | 1        | purple  | Critical             |

For linear sensors (CO₂, VOCs, PM2.5) low values map to level 1
(5 green dots) and high values to level 5 (1 purple dot). For
symmetric sensors (temperature, humidity) the optimal centre maps to
level 1 (5 green dots) and both extremes to level 3 (3 orange dots).

---

## [0.9.2] — Align inline score column size with sensor columns

### Fixed
- Inline score column was visually larger than the surrounding sensor
  columns: `.score-inline-val` font size was 6–8 px larger than
  `.sensor-value` across all themes (default 26 vs 18 px, mushroom 22
  vs 15 px, bubble 20 vs 14 px). All score-column font sizes are now
  matched 1:1 to the corresponding sensor-column rules so the score
  column has the exact same height and visual weight as the other
  five columns.

---

## [0.9.1] — Fix inline score dot direction

### Fixed
- Inline score column dot count was inverted: score 0 lit all 5 dots and
  score 100 lit only 1, mirroring the sensor semantics (more dots = worse).
  For the score, higher = better, so the count is now flipped: **score 100
  lights all 5 dots, score 0 lights 1 dot**.

### Changed
- All lit score dots now share the current score's severity color (green
  for excellent, purple for critical) instead of the per-position graduated
  green→purple stack used by sensor columns. The score column now reads
  like a quality / battery meter, while sensor columns keep the existing
  graduated "danger meter" look.

  Tier mapping (unchanged):
  | Score   | Lit dots | Color   |
  |---------|----------|---------|
  | 90–100  | 5        | green   |
  | 75–89   | 4        | yellow  |
  | 55–74   | 3        | orange  |
  | 35–54   | 2        | red     |
  | 0–34    | 1        | purple  |

---

## [0.9.0] — Lit + ha-form refactor (HA 2026.5 baseline)

> **Breaking:** Minimum Home Assistant version is now **2026.5.0**
> (previously 2023.9.0). The card uses APIs that are guaranteed to be
> available in modern HA cores (`ha-form`, `ha-icon-button`, `light-dark()`
> CSS, `structuredClone`, `Intl.NumberFormat` with `hass.locale`).
> Existing YAML configurations remain fully compatible.

### Changed
- **Card rewritten on top of LitElement** (borrowed from the HA frontend
  via the `ha-panel-lovelace` prototype). Replaces the previous manual
  `HTMLElement` + `innerHTML` + `getElementById` rendering — the card is
  now fully reactive: changes to `hass` or `_config` automatically
  re-render only what changed.
- **Editor rewritten on top of `<ha-form>` + HA Selectors.** The custom
  pill buttons, manual `<input>` / `<select>` / checkbox markup and the
  `_set(path, value)` path-walker are gone. Top section uses one form
  with `entity` / `select` / `text` selectors; each sensor uses one form
  with `entity` / `text` / `boolean` / `number` selectors. Result: native
  HA look-and-feel, automatic theming, free validation.
- **CSS architecture:** themes are now scoped via `:host([theme="…"])`
  attribute selectors in a single `static styles` block instead of three
  string-injected `<style>` elements per render.
- **Score ring math:** SVG `pathLength="100"` removes the magic constant
  `376.99` (= 2π·60). The score (0–100) now maps directly to
  `stroke-dashoffset`.
- Reorder / delete buttons in the editor use `<ha-icon-button>` with MDI
  paths instead of unicode glyphs in plain `<button>` elements.
- Mushroom and Bubble themes use the CSS `light-dark()` function for
  surface and inactive-dot colors instead of `var(--rgb-…)` with rgba
  alpha workarounds.

### Added
- **`tap_action` per sensor and `score_tap_action` for the score column.**
  Supports `more-info` (default), `navigate`, `url`, `perform-action`
  / `call-service`, and `none`. Backward compatible — without
  configuration the card behaves exactly like before (opens the
  entity's more-info dialog).
- **`getGridOptions()`** for the Sections dashboard (HA 2024.10+) — the
  card now declares sensible default and minimum sizes based on the
  number of sensors and whether the score is inline.
- **Locale-aware value formatting** via `Intl.NumberFormat(hass.locale.language)`
  — sensor values respect the user's decimal separator (`23,5` vs
  `23.5`) instead of the JS default `toFixed(1)`.
- **Auto-derivation of `label` and `unit`** from entity attributes
  (`friendly_name`, `unit_of_measurement`) when not explicitly set in
  the config. Configured values still take precedence.
- `documentationURL` field in the `customCards` registration so the HA
  card picker links straight to the GitHub README.

### Removed
- Manual DOM building helpers (`_buildSensorColumns`, `_ringHTML`,
  `_inlineScoreHTML`, `updateValues`, `render` as innerHTML setter) —
  replaced by Lit `render()` returning `html\`…\``.
- Editor helpers `_render`, `_set`, manual pill rendering, manual entity
  picker connection ordering — replaced by `<ha-form>` schemas.
- Five occurrences of `JSON.parse(JSON.stringify(...))` — replaced by
  `structuredClone()`.
- Hard-coded SVG circumference `376.99` — replaced by `pathLength="100"`.

### Migration
- **No config changes required.** All existing YAML configurations work
  unchanged.
- HA users on versions < 2026.5 must stay on `0.8.8`.
- HACS will refuse to install 0.9.0 on older HA cores (enforced via
  `hacs.json` `homeassistant: 2026.5.0`).

---

## [0.8.8] — Restore entity picker visibility

### Fixed
- Entity picker invisible after v0.8.6/v0.8.7: setting `includeDomains` or
  `includeDeviceClasses` on `ha-entity-picker` triggers an internal Lit re-render
  that leaves the component with zero visible height; both properties removed
- Entity-type filtering (introduced in v0.8.6) reverted — all entity pickers
  now show the full entity list (no domain or device-class restriction)

---

## [0.8.7] — Fix entity picker regression

### Fixed
- Entity pickers broken by v0.8.6: replaced unstable `entityFilter` function
  property with the official `includeDeviceClasses` API; `entityFilter` is not
  a stable public property of `ha-entity-picker` across all HA versions and
  caused the picker to malfunction

### Changed
- Sensor entity pickers now use `includeDeviceClasses` (HA standard API) for
  device-class filtering instead of `entityFilter`; all pickers additionally
  restrict to the `sensor` domain via `includeDomains`

---

## [0.8.6] — Smart entity picker filtering

### Changed
- Sensor entity pickers in the editor now filter entities by type based on the
  sensor's configured unit: `°C`/`°F` → temperature, `%` → humidity,
  `ppm` → CO₂, `ppb` → VOCs, `µg/m³` → PM2.5
- Score entity picker is now restricted to the `sensor` domain
- Custom sensors with an unknown unit fall back to showing all `sensor`-domain
  entities

---

## [0.8.5] — Entity picker fix

### Fixed
- Entity pickers in the card editor now correctly display the currently selected
  entity and save new selections: `value` property is now set imperatively instead
  of via the `.value` Lit-syntax attribute (which is invalid in plain `innerHTML`)
- Sensor entity pickers are now connected to the DOM **before** `hass` and `value`
  are assigned, ensuring the element is fully initialised when properties are set

---

## [0.8.4] — Inline score clickable

### Fixed
- Inline score column (`inline_left` / `inline_right`) is now clickable and opens
  the score entity detail dialog, consistent with all sensor columns

---

## [0.8.3] — Inline score column width

### Fixed
- Inline score column width normalized to `flex:1` (was `flex:1.2`),
  so it matches the width of all sensor columns in all three themes

---

## [0.8.2] — Inline score column layout & level alignment

### Fixed
- Score label ("Score") moved below the dot bar in inline positions,
  consistent with sensor columns (dots → label → value)
- Inline score dot levels now use 5 tiers matching `scoreLabel` thresholds
  (`>=90 / >=75 / >=55 / >=35 / <35`) instead of the previous 4-tier scale —
  score 87 = "Gut" now correctly shows 2 dots instead of 1

---

## [0.8.1] — Graduated dot colors

### Changed
- Each dot now always shows its own fixed color based on its position:
  bottom → green · yellow · orange · red · purple (top).
  Previously all lit dots showed the same color (the level color of the current reading).
  Applies to both sensor columns and inline score column.

---

## [0.8.0] — Symmetric scale for temperature & humidity

### Added
- `symmetric: true` sensor option — for sensors where the optimal range is in the
  center (e.g. temp, humidity). Thresholds define `[low_bad, low_ok, high_ok, high_bad]`:
  level 1 (green) if value is between `low_ok` and `high_ok`;
  level 2 (yellow) if between `low_bad`–`low_ok` or `high_ok`–`high_bad`;
  level 3 (orange) outside the outer bounds.
- Symmetric checkbox in the UI editor per sensor with adapted threshold labels and hints
- Translations for `symmetric` option in English and German

### Fixed
- Temperature and humidity sensors showed wrong (orange) dots for optimal values
  because `getLevel()` treated all sensors as linear scales.
  `AWAIR_DEFAULTS` now sets `symmetric: true` for temperature and humidity.

### Changed
- `air-dots-card.yaml` example: `symmetric: true` added to temperature and humidity sensors
- README: `symmetric` option documented in sensor options table and YAML example

---

## [0.7.0] — GitHub mirror & HACS fix

### Added
- GitHub mirror at [github.com/tioan/air-dots-card](https://github.com/tioan/air-dots-card)
  for HACS compatibility (HACS requires GitHub)
- GitHub badge in README header

### Changed
- HACS installation URL in README changed from Codeberg to GitHub
- Credits section updated to reference both Codeberg (primary) and GitHub (mirror)

### Removed
- `repository` field from `hacs.json` — field is not valid for HACS custom repositories

---

## [0.6.0] — Internationalization (i18n)

### Added
- Full English / German translation for card UI and editor
- Language auto-detection from **Home Assistant user profile** (`hass.locale.language`)
- Manual language override via `language: en | de | auto` config option
- Language dropdown in UI editor showing active HA profile language (e.g. `Auto (HA: de)`)
- Translated strings: score labels, inline score column name, all editor section titles,
  field labels, button texts, tooltips, and placeholder texts
- `getT(langConfig, hass)` translation helper — centralized string lookup with language resolution

### Changed
- Language source switched from browser `navigator.language` to `hass.locale.language`
  so the card respects the user's HA profile setting rather than the OS locale
- Editor language dropdown label changed from `Auto (de-DE)` to `Auto (HA: de)`
  to make the source of auto-detection explicit

### Removed
- `navigator.language` as language source — replaced by `hass.locale.language`

---

## [0.5.0] — HACS support & project rename

### Added
- `hacs.json` with full HACS metadata: `content_in_root`, `render_readme`, `filename`,
  `homeassistant` minimum version `2023.9.0`, and `categories: ["lovelace"]`
- HACS installation section in README (Option A: HACS via custom repo, Option B: manual)
- HACS badge and minimum HA version badge in README header

### Changed
- Project renamed from **Air Quality Card** to **Air Dots Card**
- File names: `air-quality-card.js` → `air-dots-card.js`, `air-quality-card.yaml` → `air-dots-card.yaml`
- Class names: `AirQualityCard` → `AirDotsCard`, `AirQualityCardEditor` → `AirDotsCardEditor`
- Custom element type: `custom:air-quality-card` → `custom:air-dots-card`
- All source code comments changed to English only

### Removed
- Old `air-quality-card.*` file names from the release package

---

## [0.4.0] — Score positions expanded

### Added
- Score position `right` — score ring on the right side, sensors fill the remaining width
- Score position `inline_right` — score as last column (right) with dot indicator, no ring

### Changed
- Score position `inline` renamed to `inline_left` for symmetry with the new `inline_right`
- Score position option set is now: `center` | `left` | `right` | `inline_left` | `inline_right`
- Editor position pills updated to show all 5 options
- README preview tables restructured: 3-column table for ring-based positions,
  2-column table for inline positions, repeated per theme

### Removed
- Score position value `inline` — replaced by `inline_left` (breaking change for existing configs using `inline`)

---

## [0.3.0] — Score positions & editor improvements

### Added
- Three `score_position` modes:
  - `center` — score ring centered above sensor row (default, original layout)
  - `left` — score ring left-aligned, sensors fill remaining width
  - `inline` — no ring; score rendered as first sensor column with dot indicator
- Score position pill selector in UI editor (alongside existing theme pills)
- Inline score column: dots colored by score level using same color logic as sensor dots
- `score_position: "center"` included in `getStubConfig()` default config

### Fixed
- Reference table screenshot: tick labels at `0%` and `100%` positions were clipped
  at the left and right edges — resolved with `.first { transform: translateX(0) }`
  and `.last { transform: translateX(-100%) }` alignment classes
- README screenshots: removed grey `#f0f0f0` page background and `box-shadow`
  from editor and file-structure images so they render without visible border on GitHub

---

## [0.2.0] — Themes & UI editor

### Added
- Three visual themes via `theme` config option or UI pill selector:
  - `default` — fixed dark Awair-style background with hardcoded dark colors
  - `mushroom` — light card inheriting HA CSS variables; Mushroom-style rounded hover areas
  - `bubble` — large `border-radius: 32px`, pill-shaped sensor chips, no column dividers
- Per-theme dot and ring color palettes (distinct green/yellow/orange/red/purple hex values per theme)
- Level 5 severity color: purple (`#9b6ddf` default / `#8e24aa` mushroom / `#9c27b0` bubble)
- `getConfigElement()` static method — registers the card with the HA visual editor
- `getStubConfig()` static method — pre-fills new cards with Awair sensor defaults
- Full UI editor (`AirDotsCardEditor`) with sections:
  - **Appearance**: theme pill selector
  - **General**: card title input, score entity picker
  - **Sensors**: per-sensor cards with entity picker, label, unit, threshold inputs, ↑/↓/✕ actions
- `+ Add sensor` button with automatic fill from `AWAIR_DEFAULTS` by index
- Card registered in `window.customCards` with `preview: true` for HACS/HA card picker
- README: theme preview screenshot grid (3 themes), UI editor section, full config options table

### Changed
- `dotColor()` refactored: no longer returns CSS class names — now returns raw hex color strings
  via `levelColor(level, theme)` to support per-theme color customization
- `scoreLabelColor()` delegates to `levelColor()` for consistent theme-aware ring color
- README restructured with theme tables, UI editor section, and expanded options reference

---

## [0.1.2] — Official Awair thresholds

### Added
- Awair threshold reference section in README with color-scale bar visualizations for all 6 metrics
- Documentation of the inverted score ring scale (0 = critical, 100 = excellent)
- Explanation of symmetric vs. linear threshold scales:
  temperature and humidity are symmetric (extremes bad, middle optimal);
  CO₂, TVOCs, PM2.5 are linear (higher is always worse)

### Changed
- All sensor thresholds updated to official Awair app values extracted from app screenshots:
  - Temperature: `[18, 20, 25, 27]` °C
  - Humidity: `[30, 40, 60, 65]` %
  - CO₂: `[600, 1000, 2000, 4500]` ppm
  - TVOCs: `[300, 500, 3000, 25000]` ppb
  - PM2.5: `[12, 35, 55, 150]` µg/m³
- YAML example updated with official thresholds and inline comments per sensor

### Removed
- Internal `computeScore()` method — score is now always read from a HA sensor entity

---

## [0.1.1] — Score from entity & README cleanup

### Added
- `score_entity` config option — reads the air quality score (0–100) from any HA sensor entity

### Changed
- Score source changed from internal calculation (derived from sensor levels) to `score_entity` HA state

### Removed
- `computeScore()` internal method — score computation from sensor level averages removed

### Fixed
- README images were embedded as Base64 strings (~213 KB) — replaced with relative
  file paths pointing to `readme-assets/` folder, reducing README to ~6 KB

---

## [0.1.0] — Initial release

### Added
- Custom Lovelace card inspired by the Awair Element air quality monitor UI
- Animated SVG score ring with color-coded severity label (Excellent / Good / Fair / Poor / Bad)
- Up to 5 sensor columns, each with a 5-dot vertical bar indicator
- Dot colors reflect severity level: 🟢 green → 🟡 yellow → 🟠 orange → 🔴 red
- Sensor value and unit displayed below each dot column
- Tap on any sensor column dispatches `hass-more-info` event to open entity detail dialog
- `getCardSize()` returning 4 for correct dashboard grid sizing
- `thresholds` config per sensor: 4 values defining 5 severity levels
- Dark fixed-color default theme matching the Awair Element aesthetic
- `AWAIR_DEFAULTS` constant with pre-filled sensor labels, units, and thresholds
- YAML example configuration with all 5 Awair Element sensors
- README with installation guide, configuration reference, and compatible sensor list
- `hacs.json` initial file
- Manual installation path: copy JS to `/config/www/`, register as `JavaScript Module` resource
