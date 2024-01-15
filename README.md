# Air Quality Card for Home Assistant

A custom Lovelace card inspired by the Awair Element air quality monitor UI.

## Installation

1. Copy `air-quality-card.js` to `/config/www/air-quality-card.js`
2. Add resource: `/local/air-quality-card.js` — type `JavaScript Module`
3. Add the card via YAML

## Configuration

```yaml
type: custom:air-quality-card
title: Living Room
score_entity: sensor.awair_element_score
sensors:
  - entity: sensor.temperature
    label: Temp
    unit: "°C"
    thresholds: [17, 20, 25, 28]
```

| Option | Description |
|--------|-------------|
| `score_entity` | HA sensor providing score 0–100 |
| `sensors` | List of sensor definitions |

## Awair threshold reference

Thresholds match the official Awair app color scale.

| Sensor | Unit | L1 🟢 | L2 🟡 | L3 🟠 | L4 🔴 | L5 🟣 | `thresholds` |
|--------|------|--------|--------|--------|--------|--------|--------------|
| Temperature | °C | 20–25 | 18–20/25–27 | 16–18/27–29 | <16/>34 | extremes | `[18,20,25,27]` |
| Humidity | % | 40–60 | 30–40/60–65 | 23–30/65–80 | <23/>80 | extremes | `[30,40,60,65]` |
| CO₂ | ppm | 0–600 | 600–1000 | 1000–2000 | 2000–4500 | >4500 | `[600,1000,2000,4500]` |
| TVOCs | ppb | 0–300 | 300–500 | 500–3000 | 3000–25000 | >25000 | `[300,500,3000,25000]` |
| PM2.5 | µg/m³ | 0–12 | 12–35 | 35–55 | 55–150 | >150 | `[12,35,55,150]` |
