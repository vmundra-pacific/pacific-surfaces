# Pacific Surfaces — Project Instructions

## Skill Auto-Routing

This project has skills installed in `.claude/skills/`. Before starting work on any prompt, read `.claude/skills/skills_index.md` and load the matching skill(s) based on the routing table. Always read the full SKILL.md of every matched skill before writing any code or output.

### Keeping the index up to date

When you add, remove, or rename a skill in `.claude/skills/`, run:

```bash
bash .claude/skills/rebuild-index.sh
```

This scans every `*/SKILL.md`, extracts the frontmatter, and regenerates `skills_index.md` automatically. The index is auto-generated — never edit it by hand.

### Always-on skills (load on EVERY prompt that touches code)

- **pacific-design-system** — Read `.claude/skills/pacific-design-system/SKILL.md` before creating or modifying any React component, page, section, or Tailwind class in this repo. This is the single source of truth for colors, typography, spacing, components, and animation patterns.
- **brand-guidelines** — Read `.claude/skills/brand-guidelines/SKILL.md` whenever brand colors, visual identity, or styling decisions are involved. The Pacific palette is: `#112732` (dark), `#9AA8B6` (mid), `#DAE1E8` (light), `#FFFFFF` (white). No green, emerald, or warm tones ever.

### On-demand skills (load when the prompt matches)

Consult the routing table in `.claude/skills/skills_index.md` to find additional skills. Key routes:

- Building new UI → also load `frontend-design`
- Using AIDesigner → load `aidesigner-frontend`
- Before creative work → load `brainstorming`
- Writing a PRD → load `write-a-prd`
- PRD to plan → load `prd-to-plan`
- PRD to issues → load `prd-to-issues`
- Planning before coding → load `writing-plans`
- Debugging → load `systematic-debugging`
- Triaging a bug → load `triage-issue`
- QA session → load `qa`
- TDD workflow → load `tdd`
- Before claiming done → load `verification-before-completion`

### Multiple skills

Many tasks need 2-3 skills loaded together. Common combos:

- New page/section: `pacific-design-system` + `brand-guidelines` + `frontend-design`
- Bug fix: `systematic-debugging` + `tdd` + `verification-before-completion`
- Feature planning: `brainstorming` + `write-a-prd` + `prd-to-plan`

## Project Overview

- **Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, GSAP, React Three Fiber, Sanity CMS
- **Repo:** `pacific-surfaces-app` — marketing site for Pacific Engineered Surfaces Pvt. Ltd.
- **Branch:** `experiment/aidesigner`
- **Design aesthetic:** Terminal Industries / 21st.dev inspired — restrained, editorial, cinematic

## Critical Rules

1. Never use `stone-*`, `slate-*`, `zinc-*`, `neutral-*`, `gray-*`, or `emerald-*` Tailwind classes — use `pacific-dark`, `pacific-mid`, `pacific-light` tokens only
2. Never use `font-bold` in headlines — `font-light` for display, `font-medium` for labels
3. Always use `<MagneticButton>` for CTAs, never bare `<button>` elements
4. Dark sections must include the grain texture overlay
5. Scroll-heavy sections (300vh+) must use `contain: layout style` and `will-change` hints
6. Forms submit to `bindu@thepacific.group` (mailto) or WhatsApp `+91 73054 77549`
