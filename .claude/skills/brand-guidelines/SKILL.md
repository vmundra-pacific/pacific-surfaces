---
name: brand-guidelines
description: Applies Pacific Surfaces' official brand colors and typography to any sort of artifact that may benefit from having Pacific's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.
---

# Pacific Surfaces — Brand Guidelines

## Overview

Use this skill to access Pacific Surfaces' official brand identity and style resources. Pacific Surfaces is a sub-brand of The Pacific Group, manufacturing engineered quartz, granite, semi-precious stone, and eco-friendly surfaces.

**Keywords**: branding, corporate identity, visual identity, post-processing, styling, brand colors, typography, Pacific brand, visual formatting, visual design

## Brand Name

Pacific Surfaces (sub-brand of The Pacific Group)

## Color Palette (STRICT — no green, no emerald, no warm tones)

| Role         | Hex     | RGB               | Tailwind Token  | Description                                              |
| ------------ | ------- | ----------------- | --------------- | -------------------------------------------------------- |
| Primary Dark | #112732 | R:17 G:39 B:50    | `pacific-dark`  | Deep teal-black. Main background color.                  |
| Mid Tone     | #9AA8B6 | R:154 G:168 B:182 | `pacific-mid`   | Cool grey-blue. Secondary text, borders, subtle accents. |
| Light        | #DAE1E8 | R:218 G:225 B:232 | `pacific-light` | Soft cool grey. Light backgrounds, cards.                |
| White        | #FFFFFF | R:255 G:255 B:255 | `white`         | Headlines on dark, clean backgrounds.                    |

### Color Usage Rules

- Dark sections (`bg-pacific-dark`) with white text and `text-pacific-mid` accents
- Light sections (`bg-pacific-light` or `bg-white`) with `text-pacific-dark` text
- CTA buttons: white fill with `text-pacific-dark`, OR outlined in `border-pacific-mid`
- NEVER use green, emerald, orange, red, or any saturated accent colors
- The brand palette is deliberately cool, muted, and professional
- On dark backgrounds, use `bg-white/5` for subtle card fills, `border-pacific-mid/15` for borders
- Gradients use only pacific-dark with varying opacity

### CSS Variables (Tailwind v4)

```css
@theme inline {
  --color-pacific-dark: #112732;
  --color-pacific-mid: #9aa8b6;
  --color-pacific-light: #dae1e8;
}
```

## Typography

### Primary Font: Hubot Sans

- Used for body text, UI elements, navigation, subtitles
- Weights: Light, Regular, Medium, SemiBold, Bold, ExtraBold
- Character: Modern geometric sans-serif, clean and technical

### Display Font: Hubot Sans Wide

- Used for large headlines, hero text, section titles, logo wordmark
- Weights: Light, Regular, Medium, SemiBold, Bold, ExtraBold
- Character: Wide-set, architectural, commanding

### Typography Rules

- Headlines: Hubot Sans Wide, Light or Regular weight, large size, tight tracking
- Body: Hubot Sans, Regular or Light weight, relaxed line height
- Labels/Tags: Hubot Sans, Medium weight, uppercase, wide letter-spacing
- Numbers/Stats: Hubot Sans Wide, Light weight, oversized
- Never use `font-bold` in headlines — it breaks the editorial tone

### Current Implementation

- The site currently uses Inter as a fallback while Hubot Sans is being set up
- Font migration to Hubot Sans is planned but deferred

## Logo

- Wordmark: "PACIFIC" in custom geometric uppercase type
- Monogram: Diamond-shaped icon with stylized "P" and arrow/wave motif
- Logo appears in `text-pacific-dark` on light backgrounds, white on dark backgrounds
- Never place logo on colored backgrounds other than #112732, #9AA8B6, #DAE1E8, white, or black
- Minimum clear space: 1x monogram width on all sides

## Brand Personality

- Premium, engineered, precise
- Industrial meets luxury
- Cool and confident, not flashy
- Cinematic and editorial
- Inspired by: terminal-industries.com aesthetic

## Sub-brands

- Granites India
- Quartz Surfaces
- Engineered Surfaces
- Surfaces
- Mintek

## Do NOT

- Use green or emerald as accent colors
- Use warm color palettes (orange, red, amber, rose)
- Use rounded/playful fonts
- Use gradients with saturated colors
- Use slate, zinc, neutral, or gray Tailwind palettes (use pacific tokens instead)
- Make it look like a generic SaaS or tech startup
- Use `font-bold` in headlines

## Technical Details

### Color Application

- Uses Tailwind CSS v4 custom color tokens (`pacific-dark`, `pacific-mid`, `pacific-light`)
- Opacity modifiers: `pacific-mid/30`, `pacific-dark/85`, etc.
- For presentations/documents: use RGB values for precise brand matching
- Maintains color fidelity across different systems
