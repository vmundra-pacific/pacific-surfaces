---
name: pacific-design-system
description: Pacific Surfaces design system rules. Use this skill any time you are creating or modifying a React component, page, or section in the pacific-surfaces repo. Triggers on any work involving /src/app, /src/components, Tailwind classes, colors, typography, animations, CTAs, forms, or layout in this codebase. Read this BEFORE writing any JSX.
---

# Pacific Surfaces Design System

This repo is the marketing site for Pacific Surfaces (Pacific Engineered Surfaces Pvt. Ltd.). The UI is inspired by Terminal Industries and 21st.dev — restrained, editorial, confident. Every new component must fit this system or it will visually clash.

## Color palette

Use the Pacific brand tokens defined in `globals.css`. **Do not use `stone-*`, `slate-*`, `zinc-*`, `neutral-*`, or `gray-*`** Tailwind palettes — they don't match the Pacific brand.

### Brand tokens (Tailwind v4)

```css
@theme inline {
  --color-pacific-dark: #112732; /* Deep teal-black */
  --color-pacific-mid: #9aa8b6; /* Cool grey-blue */
  --color-pacific-light: #dae1e8; /* Soft cool grey */
}
```

### Usage mapping

| Context                   | Class                                                                                             | Notes                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Dark backgrounds          | `bg-pacific-dark`                                                                                 | Hero, testimonials, footer, partner sections |
| Light backgrounds         | `bg-pacific-light` or `bg-white`                                                                  | Features, application showcase, cards        |
| Primary text (light bg)   | `text-pacific-dark`                                                                               | Headings, body on white/light                |
| Primary text (dark bg)    | `text-white`                                                                                      | Headings on dark backgrounds                 |
| Secondary text (light bg) | `text-pacific-mid`                                                                                | Descriptions, labels, muted text             |
| Secondary text (dark bg)  | `text-pacific-mid` or `text-pacific-light`                                                        | Descriptions on dark backgrounds             |
| Labels / eyebrows         | `text-pacific-mid`                                                                                | Uppercase tracking labels                    |
| Card fills on dark        | `bg-white/5`                                                                                      | Subtle glass effect                          |
| Borders on dark           | `border-pacific-mid/15` or `border-pacific-mid/20`                                                | Subtle dividers                              |
| Borders on light          | `border-pacific-mid/20` or `border-pacific-mid/30`                                                | Card borders                                 |
| Gradients                 | `from-pacific-dark/85 via-pacific-dark/75 to-pacific-dark/90`                                     | Overlay gradients                            |
| CTA primary               | `bg-white text-pacific-dark` (on dark) or `bg-pacific-dark text-white` (on light)                 |                                              |
| CTA outline               | `border-pacific-mid/40 text-white` (on dark) or `border-pacific-mid text-pacific-dark` (on light) |                                              |
| Image placeholders        | `bg-pacific-light`                                                                                | Empty state fills                            |

### Forbidden colors

- `emerald-*`, `green-*` — never use green in any context
- `amber-*`, `orange-*`, `red-*`, `rose-*` — no warm accent colors
- `violet-*`, `purple-*` — no saturated accents
- `stone-*` — replaced by pacific tokens (legacy, being migrated)
- `slate-*`, `zinc-*`, `neutral-*`, `gray-*` — wrong gray family

## Typography

Two weights only in headlines: `font-light` for display text, `font-medium` for UI labels and buttons.

- **Display / H1–H2:** `text-5xl` → `text-8xl` (responsive), `font-light`, `tracking-tight`, `leading-[1.05]` for very large headlines
- **Section headings:** `text-3xl sm:text-4xl md:text-5xl font-light tracking-tight`
- **Body:** `text-base font-light text-pacific-mid leading-relaxed` (light bg: `text-pacific-dark/70`)
- **Eyebrow / kicker label:** `text-xs font-medium tracking-[0.25em] uppercase text-pacific-mid`
- **Button / CTA label:** `text-xs font-medium tracking-[0.1em] uppercase` (small) or `text-sm` (default)
- **Field labels (forms):** `text-[10px] font-medium tracking-[0.25em] uppercase text-pacific-mid`

**Never use `font-bold` in headlines** — it breaks the editorial tone. Use `font-medium` at most.

### Fonts

- Current: Inter (system fallback)
- Planned: Hubot Sans (body) / Hubot Sans Wide (display) — migration deferred

## Spacing and layout

- Page max-width wrapper: `mx-auto max-w-7xl px-6 lg:px-8`
- Section vertical padding: `py-20 md:py-28` (standard), `py-32 md:py-40` (hero / major)
- Inter-element rhythm: use `gap-*` and `space-y-*` utilities, never margin hacks
- Grid defaults: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8` for cards
- First section on any route MUST clear the fixed header. The `<Header />` is `fixed top-0 h-20 z-40`, transparent until `scrollY > 50`. Either:
  - Use `<PageHeader>` (already handles the offset), or
  - Add `pt-20` to the first section's wrapper, or
  - Use a hero that intentionally sits under a transparent header (full-bleed image heroes only)

## Component library (use these, don't reinvent)

Prefer existing components from `@/components/ui/` and `@/components/sections/`:

- **`<MagneticButton>`** (`@/components/ui/magnetic-button`) — the primary CTA. Variants: `primary`, `outline`, `ghost`. Sizes: `sm`, `md`, `lg`. Accepts `href` for links. **Never** build a new `<button>` for a CTA — use this.
- **`<AnimatedSection>`** (`@/components/ui/animated-section`) — wraps content in a scroll-triggered Framer Motion animation. Variants: `fadeUp` (default), `fadeIn`, `scaleIn`, `slideInLeft`, `slideInRight`. Supports `delay` prop.
- **`<StaggerContainer>` / `<StaggerItem>`** — for staggered reveal of lists. Wrap the parent in StaggerContainer, each child in StaggerItem.
- **`<PageHeader>`** (`@/components/ui/page-header`) — standard page hero. Use for /about, /careers, /contact, etc. Already handles header offset.
- **`<Header>` / `<Footer>`** — already in the (site) layout. Do not re-add.

## Animations

Use Framer Motion with these defaults for consistency:

- **Ease curve:** `[0.25, 0.4, 0.25, 1]` — Apple-style ease-out. Use this for almost everything.
- **Durations:** `0.3s` (micro / hover), `0.6s` (entrance), `0.7–0.8s` (hero reveals)
- **Scroll-triggered reveals:** always `viewport={{ once: true, margin: "-60px" }}` so it doesn't replay on re-entry
- **Parallax:** `useScroll` + `useTransform` (see HeroTerminalIndustries.tsx for reference)
- **CSS keyframe animations:** Use for infinite loops (marquee, bounce-slow) — defined in globals.css

**Don't** add bouncy springs, color pulses, or rotation effects — they clash with the editorial tone.

## Performance

- Use `will-change: transform` on parallax and scroll-driven elements
- Use `contain: layout style` on heavy scroll sections (300vh+)
- CSS keyframe animations for infinite loops (not Framer Motion)
- Batch RAF updates for canvas/WebGL (see HeroTerminalIndustries.tsx)
- Dynamic imports for heavy libraries (Lenis, Three.js)

## Forms and CTAs

- Form fields: `border border-pacific-mid/25 rounded-md px-3 py-2.5 text-sm font-light text-pacific-dark placeholder-pacific-mid/60 focus:outline-none focus:border-pacific-dark transition-colors`
- Primary submit button: `bg-pacific-dark text-white px-7 py-3 text-xs font-medium tracking-[0.25em] uppercase rounded-full hover:bg-pacific-dark/90 transition-colors`
- Sample / quote requests go via the `<OrderSampleModal>` (submits to `bindu@thepacific.group` via mailto)
- WhatsApp enquiries use `https://wa.me/917305477549?text=...` with a URL-encoded pre-filled message

## Icons

`lucide-react` only. Size defaults: `w-4 h-4` in buttons, `w-5 h-5` in nav, `w-6 h-6` in hero elements. Use `ArrowRight` for CTAs, `CheckCircle` (`text-pacific-mid`) for success, `ChevronRight` for breadcrumbs.

**Known gap:** older versions of `lucide-react` don't ship `Instagram`/`Facebook` icons — inline an SVG if you need them.

## Brand content guardrails

- Company legal name: **Pacific Engineered Surfaces Pvt. Ltd.**
- Marketing contact email: **bindu@thepacific.group**
- WhatsApp: **+91 73054 77549**
- Certifications: ISO 9001:2015, NSF, Greenguard, CE Marking
- Never reference competitor product names (MSI Calacatta Miraggio, Caesarstone, etc.) in site copy
- Product categories on the site: Quartz Surfaces, Exotic Collection, Semi-Precious Stones, Kosmic Collection, Nebula Collection, Centrepiece Couture, Integra Sinks, Fab Creations, Ecosurfaces, Granites, Natural Stone Finishes

## Grain texture overlay

Dark sections use a subtle SVG noise overlay for depth:

```tsx
<div
  className="absolute inset-0 opacity-[0.03] pointer-events-none"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
  }}
/>
```

## Dos and don'ts checklist

Before submitting a new component, verify:

- [ ] Uses only Pacific brand tokens (`pacific-dark`, `pacific-mid`, `pacific-light`, `white`) — no `stone-*`, `emerald-*`, or other palettes
- [ ] Typography is `font-light tracking-tight` for headlines, `font-medium tracking-[X]em uppercase` for labels
- [ ] Uses `<MagneticButton>` for CTAs, not a bare `<button>` styled from scratch
- [ ] Uses `<AnimatedSection>` or `StaggerContainer` for scroll reveals — no ad-hoc `motion.div`s for entrance
- [ ] First section clears the fixed header (or uses `<PageHeader>`)
- [ ] Wrapper uses `mx-auto max-w-7xl px-6 lg:px-8`
- [ ] No `font-bold` in headlines
- [ ] No `stone-*`, `slate-*`, `zinc-*`, `neutral-*`, `gray-*`, or `emerald-*` classes
- [ ] Any form submits to `bindu@thepacific.group` (mailto) or WhatsApp with the correct number
- [ ] Dark sections include grain texture overlay
- [ ] Scroll-heavy sections use `contain: layout style` and `will-change` hints

If you break any of these, the component will visibly clash with the rest of the site. Re-check against an existing section like `HeroTerminalIndustries.tsx`, `OriginSection.tsx`, or `PartnerWithUs.tsx` before finalizing.
