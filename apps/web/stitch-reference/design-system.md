# Design System

Source of truth: the shadcn preset `--preset b6G4G2OHI`, with one deliberate deviation (see Palette).

| Field | Value |
| --- | --- |
| Style | Lyra |
| Base UI library | Base UI (`@base-ui/react`) |
| Base color | Zinc |
| Theme / chart | Yellow → retuned to Trench yellow |
| Heading + body font | JetBrains Mono |
| Radius | None (`0`) |
| Icon library | Lucide |
| Menu / accent | Default (solid) / Subtle |

Re-apply the preset with:

```bash
bunx shadcn@latest add <item>
```

`components.json` already pins `"style": "base-lyra"` and `"baseColor": "zinc"`, so added components arrive in this style.

## Palette

`--primary` is Trench yellow, `#FCE300` = `oklch(0.908 0.190 101.3)`. It contrasts **13.6:1** against zinc-900 and only **1.3:1** against white, so `--primary-foreground` is always the dark zinc (`oklch(0.21 0.006 285.885)`), never white.

**`--primary` is a fill colour, never ink.** On white it is 1.3:1 — invisible as text. Anything that draws the brand as *text or an icon* uses **`--primary-ink`** instead: a dark ochre `oklch(0.55 0.12 95)` in light mode (4.84:1 on white) and the full Trench yellow in dark mode (14.2:1 on the near-black background). Use `text-primary-ink`, never `text-primary`.

**Deviation from the preset:** in light mode the preset pairs `--sidebar-primary: oklch(0.681 0.162 75.834)` with a near-white foreground (~2.5:1, fails AA). We use Trench yellow with the dark zinc foreground instead. Neutrals are the preset's Zinc scale, unchanged.

Chart ramp runs yellow → rust: `--chart-1` acid, `--chart-2` Trench, `--chart-3` gold, `--chart-4` ochre, `--chart-5` rust.

All tokens live in `app/globals.css`. Nothing else in the app should hardcode a color.

## Principles

- **Flat, not airy.** Hairline `border-border` and `ring-1` carry hierarchy — no drop shadows, no gradients, no glass/blur. The former `surface-*`, `frosted`, `ghost-border` and `air-shadow` utilities are retired; use `bg-card` / `bg-muted` / `border-border`.
- **Square.** `--radius: 0`. Every `--radius-*` step resolves to `0`, so `rounded-*` utilities are inert by design.
- **Dense.** Controls default to `h-8`, body copy to `text-xs`, secondary copy to `text-[11px]`, labels and metadata to `text-[10px]`.
- **Monospace throughout.** JetBrains Mono feeds both `--font-sans` and `--font-mono`; there is no separate body face.
- Sectioning uses `divide-y` and tonal shifts (`hover:bg-muted/30`) rather than heavy rules.
- Keep hover transitions subtle (`~200ms ease-out`).

## Component guidance

- Primary buttons: `bg-primary` with `text-primary-foreground` (dark on yellow).
- Brand-coloured text, links and icons: `text-primary-ink` (see Palette). A yellow *fill* with dark text is always preferable to yellow text.
- Base UI's `Button` renders a native `<button>`; when rendering it as a link you must pass `nativeButton={false}` alongside `render={<Link … />}`, or Base UI warns at runtime.
- Inputs: `border-input`, `focus-within:border-ring`. Every input needs a real `<label>` — use `CustomKeyField` as the reference.
- Base UI replaces Radix's `asChild` with a `render` prop: `<Button render={<Link href="/x" />}>Label</Button>`. Children stay on the outer component.
- Open state is `data-open` / `data-closed`, not `data-[state=open]`. Anchored popups size off `--anchor-width`, not `--radix-*-trigger-width`.
- Link rows: no `<hr>`; use `divide-y divide-border` and hover tonal shifts.
- Tables are `md:` and up only; below that, render stacked cards (see `my-links-view.tsx`).
