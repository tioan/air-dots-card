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
