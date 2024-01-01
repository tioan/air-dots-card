# Air Quality Card for Home Assistant

A custom Lovelace card inspired by the Awair Element air quality monitor UI.

## Installation

1. Copy `air-quality-card.js` to `/config/www/air-quality-card.js`
2. Add resource in Lovelace: URL `/local/air-quality-card.js`, type `JavaScript Module`
3. Add the card via YAML

## Configuration

```yaml
type: custom:air-quality-card
title: Living Room
sensors:
  - entity: sensor.temperature
    label: Temp
    unit: "°C"
    thresholds: [17, 20, 25, 28]
```
