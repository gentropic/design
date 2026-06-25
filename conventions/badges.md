# GCU badges

A GCU badge is a one-glance, self-declared **promise about a tool's offline behaviour**, shown as a
shields.io badge that links to a `## GCU Classification` section spelling the promise out. It classifies a
tool by *the geography of the working day* — where you can use it, ordered by connectivity.

## The codes

| Badge | Reads as | The promise |
|---|---|---|
| **`WU`** | Works Underground | **Fully offline.** Zero network at runtime — the mine, the field, the air-gapped laptop, the USB stick. The creed-pure tier. |
| **`WA`** | Works in an Airplane | **Offline core + declared web-API caveats** — runs offline, but some features need a web API (e.g. an external LLM) and degrade honestly. |
| **`WO`** | Works in the Office | **Needs the network to function** — the honest, connected tier. |

`WU` is the proudest badge, and most GCU tools are `WU` or `WA`. A tool that *could* be offline but isn't
yet simply wears no badge — absence is a signal too.

## The contract (a badge is a promise, not a vibe)

- **`WU`** — nothing breaks offline; no runtime network of any kind. The moment a feature needs the
  network, it isn't `WU` — it's `WA`.
- **`WA`** — the core works fully offline, and the `## GCU Classification` section **must list which
  features need a web API and what happens without it.** Offline, those features are disabled with a clear
  message — never a silent failure, a hang, or a crash.
- **`WO`** — be upfront that it needs the network, and say what it talks to.

## The design principle (when a badge earns its place)

A GCU badge is **a real, one-glance, checkable property wearing an absurd literal costume — the joke is
the delivery vehicle, never the payload.** `WU` works because "fully offline" genuinely matters; "Works
Underground" just makes a dull spec memorable (and native to a geology collective).

A badge tips into *try-hard* when: the joke outruns the property · the puns stack · they proliferate
(one-glance value dies past ~3–4 badges) · or it excludes the reader. **Keep the wit concentrated in the
`W_` family; keep any other axis sober.**

## The markup (shields.io)

```
[![GCU: WU](https://img.shields.io/badge/GCU-WU-brightgreen.svg)](#gcu-classification)
[![GCU: WA](https://img.shields.io/badge/GCU-WA-green.svg)](#gcu-classification)
[![GCU: WO](https://img.shields.io/badge/GCU-WO-lightgrey.svg)](#gcu-classification)
```

Colours: `WU` **brightgreen** (creed-pure) · `WA` **green** (creed with a declared edge) · `WO`
**lightgrey** (the connected tier). Link the badge to the repo's `#gcu-classification` anchor.

## The `## GCU Classification` section (paste-ready)

Every badged repo carries one:

> **WU** — Works Underground. Fully offline, single HTML file, zero network calls at runtime. Deployable
> on air-gapped mine-site laptops, field-camp tablets, or opened from a USB stick.

> **WA** — Works in an Airplane. Fully offline for its core workflow; some features use a web API and are
> unavailable offline: **[list them — e.g. "AI-assisted explanations (external LLM)"]**. Offline, these
> are disabled with a clear notice; nothing else is affected.

> **WO** — Works in the Office. Requires a network connection; it talks to **[what, and why]**. Not
> designed for offline / field use.

(`WA` repos **must** fill the bracketed list — that declaration *is* the contract.)

## Assigning

Self-declared; the default aspiration is **`WU`**. Any runtime feature that touches the network → **`WA`**
plus the declaration above. Can't run at all without the network → **`WO`**, stated plainly. Under-claim
rather than over-claim — it's a promise, not a marketing tier.

## Future axes (proposed, sober)

The `W_` family classifies *connectivity*. Other real axes may earn their own (plain, pun-free) badge
later — e.g. **data sovereignty** (where your data lives: on-device / your-own-cloud / needs-an-account)
and **agent-reachable** (does it speak `numen`). Add an axis only when it's a real, checkable property.

## Adoption notes

- `bearing.js`, `arborist` — currently badged `WA` meaning "fully offline" → re-badge **`WU`** (the old
  `WA` definition is now `WU`).
- The `etc/patchbay` courses — badged `WA-BOB` (an earlier scheme) → **`WA`**, and add the §classification
  block declaring each course's external-LLM dependency.
