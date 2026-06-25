# brand

GCU brand assets — logos, favicons, and the **malleo** (*Computatro et Malleo*) — plus the asset tooling.

## Logos

| File | Description |
|---|---|
| `gcu-logo.svg` | Main logo (screen) |
| `gcu-logo-print.svg` | Bolder strokes for print |
| `gcu-logo-light.svg` | Light background variant |
| `gcu-logo-icon.svg` | Icon with stereonet, 128px (used by the landing) |
| `gcu-logo-square.svg` | Square with full text |
| `gcu-logo-square-print.svg` | Square, print weight |
| `gcu-malleo.svg` | Computatro et Malleo, with border |
| `gcu-malleo-noborder.svg` | Computatro et Malleo, no border |

## Favicons

| File | Size |
|---|---|
| `gcu-favicon-64.svg` | 64px |
| `gcu-favicon-32.svg` | 32px (used by the landing) |
| `gcu-favicon-16.svg` | 16px |
| `gcu-favicon-32-transparent.svg` | 32px, transparent bg |
| `gcu-favicon-16-transparent.svg` | 16px, transparent bg |

## Asset tooling

- `preview.html` — visual preview of all assets, with PNG export + sticker sizing.
- `generate-stereonet.js` — Node script generating stereonet SVG paths *(legacy — stereonets move to
  **bearing.js**; this + `stereonet-paths.txt` retire once the reproducible build lands).*

**Reproducible build (planned):** a `build-assets.mjs` (headless **Playwright**) will render the
generator / bearing.js pages and export SVG + PNG/favicons — so brand assets become *outputs of a
command*, not hand-downloaded files.

## Current palette (landing; pre-switchboard)

| Token | Value |
|---|---|
| Background | `#1a1a1a` |
| Copper | `#b87333` (hover `#d4894a`) |
| Body / muted text | `#ccc` / `#666` |
| Heading font | Latin Modern Roman / CMU Serif / STIX Two Text / Georgia, serif |

*These are the landing's current bespoke tokens — to be reconciled with **switchboard** when the landing
adopts the system.*
