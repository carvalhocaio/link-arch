# Design System (Stitch)

Creative direction: **The Digital Architect**.

## Core palette

- Primary: `#276c00`
- Surface: `#f9f9f9`
- On Surface: `#1a1c1c`
- Surface Container Low: `#f3f3f3`
- Surface Container Highest: `#e2e2e2`
- Outline Variant: `#c0cab5`

## Principles

- No hard divider lines for sectioning; prefer tonal surface shifts.
- Use layered surfaces for hierarchy (`surface`, `surface-container-low`, `surface-container-highest`, `surface-container-lowest`).
- Floating elements can use glass treatment with blur (`backdrop-blur: 12px`).
- Typography uses Geist, with tight tracking in key headlines.
- Keep corners around `0.375rem`; avoid over-rounded pills.

## Component guidance

- Primary buttons: `primary` background and `on-primary` text.
- Inputs: subtle ghost border and stronger primary border on focus.
- URL list rows: no `<hr>` separators; use spacing and hover tonal shifts.
- Keep hover transitions subtle (`~200ms ease-out`).
