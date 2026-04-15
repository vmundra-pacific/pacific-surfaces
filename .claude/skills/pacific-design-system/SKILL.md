---
name: pacific-design-system
description: Pacific Surfaces design system rules. Use this skill any time you are creating or modifying a React component, page, or section in the pacific-surfaces repo. Triggers on any work involving /src/app, /src/components, Tailwind classes, colors, typography, animations, CTAs, forms, or layout in this codebase. Read this BEFORE writing any JSX.
---

# Pacific Surfaces Design System

This repo is the marketing site for Pacific Surfaces (Pacific Engineered Surfaces Pvt. Ltd.). The UI is inspired by Terminal Industries and 21st.dev — restrained, editorial, confident. Every new component must fit this system or it will visually clash.

## Color palette

Use the Tailwind `stone` ramp as the primary neutral palette. **Do not introduce other grays** (slate, zinc, neutral, gray) — they don't match stone's warm tint.

- `stone-950` — darkest backgrounds, dark CTA strips
- `stone-900` — primary text on light surfaces, primary buttons
- `stone-700` — secondary text, body
- `stone-500` — muted text, labels, breadcrumbs
- `stone-400` — placeholder text
- `stone-300` — very muted text on dark surfaces
- `stone-200` — input borders
- `stone-100` — dividers, card borders, very soft fills
- `stone-50` — very light section backgrounds

**Accent color:** `emerald-600` — used sparingly for success states, check icons, confirmation UI. Never use it for primary CTAs.

**Forbidden:** blues, reds, purples, oranges, slate/zinc/neutral/gray. If you need a destructive color, ask first.

## Typography

Two weights only in headlines: `font-light` for display text, `font-medium` for UI labels and buttons.

- **Display / H1–H2:** `text-5xl` → `text-8xl` (responsive), `font-light`, `tracking-tight`, `leading-[1.05]` for very large headlines
- **Section headings:** `text-3xl sm:text-4xl md:text-5xl font-light tracking-tight`
- **Body:** `text-base font-light text-stone-700 leading-relaxed` (or `text-sm` for denser blocks)
- **Eyebrow / kicker label:** `text-xs font-medium tracking-[0.25em] uppercase text-stone-500`
- **Button / CTA label:** `text-xs font-medium tracking-[0.1em] uppercase` (small) or `text-sm` (default)
- **Field labels (forms):** `text-[10px] font-medium tracking-[0.25em] uppercase text-stone-500`

**Never use `font-bold` in headlines** — it breaks the editorial tone. Use `font-medium` at most.

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
- **Parallax:** `useScroll` + `useTransform` (see HeroTerminal.tsx for reference)

**Don't** add bouncy springs, color pulses, or rotation effects — they clash with the editorial tone.

## Forms and CTAs

- Form fields: `border border-stone-200 rounded-md px-3 py-2.5 text-sm font-light text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors`
- Primary submit button: `bg-stone-900 text-white px-7 py-3 text-xs font-medium tracking-[0.25em] uppercase rounded-full hover:bg-stone-800 transition-colors`
- Sample / quote requests go via the `<OrderSampleModal>` (submits to `bindu@thepacific.group` via mailto)
- WhatsApp enquiries use `https://wa.me/917305477549?text=...` with a URL-encoded pre-filled message

## Icons

`lucide-react` only. Size defaults: `w-4 h-4` in buttons, `w-5 h-5` in nav, `w-6 h-6` in hero elements. Use `ArrowRight` for CTAs, `CheckCircle` (emerald-600) for success, `ChevronRight` for breadcrumbs.

**Known gap:** older versions of `lucide-react` don't ship `Instagram`/`Facebook` icons — inline an SVG if you need them.

## Brand content guardrails

- Company legal name: **Pacific Engineered Surfaces Pvt. Ltd.**
- Marketing contact email: **bindu@thepacific.group**
- WhatsApp: **+91 73054 77549**
- Certifications: ISO 9001:2015, NSF, Greenguard, CE Marking
- Never reference competitor product names (MSI Calacatta Miraggio, Caesarstone, etc.) in site copy
- Product categories on the site: Quartz Surfaces, Exotic Collection, Semi-Precious Stones, Kosmic Collection, Nebula Collection, Centrepiece Couture, Integra Sinks, Fab Creations, Ecosurfaces, Granites, Natural Stone Finishes

## Dos and don'ts checklist

Before submitting a new component, verify:

- [ ] Uses only stone palette (+ emerald-600 for success)
- [ ] Typography is `font-light tracking-tight` for headlines, `font-medium tracking-[X]em uppercase` for labels
- [ ] Uses `<MagneticButton>` for CTAs, not a bare `<button>` styled from scratch
- [ ] Uses `<AnimatedSection>` or `StaggerContainer` for scroll reveals — no ad-hoc `motion.div`s for entrance
- [ ] First section clears the fixed header (or uses `<PageHeader>`)
- [ ] Wrapper uses `mx-auto max-w-7xl px-6 lg:px-8`
- [ ] No `font-bold` in headlines
- [ ] No slate / zinc / neutral / gray classes
- [ ] Any form submits to `bindu@thepacific.group` (mailto) or WhatsApp with the correct number

If you break any of these, the component will visibly clash with the rest of the site. Re-check against an existing section like `HeroTerminal.tsx`, `ProductDetail.tsx`, or `PartnerWithUs.tsx` before finalizing.
