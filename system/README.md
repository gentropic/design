# system

The GCU design system is **switchboard** (`@gcu/switchboard`) — its canonical source lives with the code
in the **auditable** repo (`ext/switchboard`): two-layer tokens (`--sw-*` → `--au-*`), a frozen six-accent
role map (action / info / go / caution / fault / selected), **Barlow** + **Space Mono**, light
"equipment gray" + dark "basalt".

This limb **uses** switchboard (vendored CSS/JS) and **publishes** its styleguide; it does *not* fork the
docs — the canonical SPEC + styleguide stay with the code.

- `switchboard.css` — **vendored copy** of the canonical tokens (re-sync from `auditable/ext/switchboard`
  on update). The landing (`../landing/index.html`) links it and overrides one token (`--brand-copper`).
  *(Tokens reference Barlow + Space Mono but don't bundle them — pages load the fonts; the landing uses
  Google Fonts, a `WA` web dependency alongside the unpkg bearing.js.)*
