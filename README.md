# GCU Design

Design assets and landing page for the Geoscientifical Chaos Union.

Live at [gentropic.org](https://gentropic.org).

## Landing page

`index.html` — single-page site with a bearing.js stereonet background rotating in real time with Earth's rotation (tilted by solar declination, referenced to São Paulo). Loads `@gcu/bearing` from unpkg.

Deploy by copying to [gentropic.github.io](https://github.com/gentropic/gentropic.github.io):
- `index.html`
- `gcu-favicon-32.svg`
- `gcu-logo-icon.svg`

## Logos

| File | Description |
|---|---|
| `gcu-logo.svg` | Main logo (screen) |
| `gcu-logo-print.svg` | Bolder strokes for print |
| `gcu-logo-light.svg` | Light background variant |
| `gcu-logo-icon.svg` | Icon with stereonet, 128px |
| `gcu-logo-square.svg` | Square with full text |
| `gcu-logo-square-print.svg` | Square, print weight |
| `gcu-malleo.svg` | Computatro et Malleo, with border |
| `gcu-malleo-noborder.svg` | Computatro et Malleo, no border |

## Favicons

| File | Size |
|---|---|
| `gcu-favicon-64.svg` | 64px |
| `gcu-favicon-32.svg` | 32px |
| `gcu-favicon-16.svg` | 16px |
| `gcu-favicon-32-transparent.svg` | 32px, transparent bg |
| `gcu-favicon-16-transparent.svg` | 16px, transparent bg |

## Tools

- `generate-stereonet.js` — Node script to generate stereonet SVG paths
- `preview.html` — visual preview of all assets with PNG export and sticker sizing
- `index-mock.html` — earlier landing page prototype with hand-rolled stereonet

## Design tokens

| Token | Value |
|---|---|
| Background | `#1a1a1a` |
| Card | `#2d2d2d` |
| Copper | `#b87333` |
| Copper hover | `#d4894a` |
| Body text | `#ccc` |
| Muted text | `#666` |
| Heading font | `'Latin Modern Roman', 'CMU Serif', 'STIX Two Text', Georgia, serif` |
| Body font | `system-ui, -apple-system, sans-serif` |
