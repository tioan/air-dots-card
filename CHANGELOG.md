# Changelog — Air Dots Card

All notable changes to this project are documented here.  
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

Repository: [codeberg.org/tioan/air-dots-card](https://codeberg.org/tioan/air-dots-card)  
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
