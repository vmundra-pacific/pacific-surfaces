# Track 2: mobile, responsive layout and accessibility

Audit date: 2026-11-20. Branch: `claude/audit-mobile-a11y`. Target: WCAG 2.2 AA.

**State of the branch.** One local commit (`9086dd1`, batch A below) and a second batch of
changes left **uncommitted** in the working tree (batch B), at the owner's request: nothing has
been pushed, and nothing more is to be committed until the owner has reviewed.

## Summary

- **Responsive:** 55 page types were loaded on the live site at 360, 390, 430 and 844x390
  (phone, touch) and 1280, 1024 and 768 px (desktop), plus a 320 px reflow pass. **No page
  scrolls sideways at any width.** Three real layout defects were found: a hero heading cut
  off on 360 px phones, the support dock covering the product page's bottom bar on phones,
  and a heading 6 px too wide at 320 px. All three are fixed.
- **Keyboard:** this was the weakest area. There was no skip link, no dialog kept focus
  inside itself, the phone menu ignored Escape, and the mega menus could not be opened
  without a mouse. All fixed.
- **Screen readers:** axe-core found 7 rule families across the site. Fixed: button names
  that did not contain their visible text, an unlabelled navigation landmark, the support
  dock outside any landmark, nested buttons on Resources cards, two tables that could not be
  scrolled by keyboard, heading levels that jump on product pages, form errors that were not
  announced.
- **Motion:** the site ignored "reduce motion" almost everywhere. Now honoured for entrance
  animations, smooth scrolling, looping background videos and the capacity marquee.
- **Open, needs the owner:** colour contrast of muted grey text under the black-and-white
  skin (F-12). It fails AA in many places and the proper fix changes the look site-wide.

Counts: 0 critical, 6 high, 12 medium, 9 low. 21 fixed, 6 open.

## Findings

| ID   | Sev    | Where                        | Evidence (one line)                                                                                                                    | Status                 |
| ---- | ------ | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| F-01 | high   | every dialog                 | Tab leaves the dialog for the page behind (live: search leaks at stop 4, region at 5, enquiry at 9, sample modal and certificate at 0) | fixed `9086dd1`        |
| F-02 | high   | header, desktop              | Focus on PRODUCTS: `aria-expanded=false`, 0 mega links visible; Spaces is a `<span>`, not focusable                                    | fixed `9086dd1`        |
| F-03 | high   | phone menu                   | Escape leaves it open; focus walks into the page behind at stop 16; no dialog role                                                     | fixed `9086dd1`        |
| F-04 | high   | every page                   | No skip link: first Tab stop is the logo                                                                                               | fixed `9086dd1`        |
| F-05 | high   | product pages, phones        | Support dock drawn over "Order a Sample / Visualize" (`shots/_v1.jpg`, first tile)                                                     | fixed, uncommitted     |
| F-12 | high   | site-wide                    | Muted text fails 4.5:1: `#8f8f8f` on white 3.23 (11 px), `#8c8c8c` 3.36, `#808080` 3.94                                                | needs owner decision   |
| F-06 | medium | site-wide                    | `prefers-reduced-motion` honoured only by the hero slides and dust layer                                                               | fixed `9086dd1`        |
| F-07 | medium | /sustainability, 360 px      | H1 "SUSTAINABILITY," spans x 20 to 383 in a 360 px viewport                                                                            | fixed, uncommitted     |
| F-08 | medium | /learn/\*                    | `text-stone-300` on white: 1.48:1 (`learn/[topic]/page.tsx:904`)                                                                       | fixed, uncommitted     |
| F-09 | medium | blog posts                   | Breadcrumb links `#4c4c4c` on black: 2.44:1                                                                                            | fixed, uncommitted     |
| F-10 | medium | home, product, shop, facades | Accessible name lacks the visible text (WCAG 2.5.3), 67 axe hits                                                                       | fixed, one left (F-25) |
| F-11 | medium | /resources                   | `div[role=button]` containing Read, Share and Download controls                                                                        | fixed, uncommitted     |
| F-13 | medium | flooring, sills              | Scrollable table wrapper not focusable (axe `scrollable-region-focusable`)                                                             | fixed, uncommitted     |
| F-14 | medium | quick enquiry                | Focus dropped to `<body>` on close: Enquire button remounted on every render                                                           | fixed `9086dd1`        |
| F-15 | medium | sample modal                 | Focus stayed on the page button; modal never received focus                                                                            | fixed `9086dd1`        |
| F-16 | medium | forms                        | Error and success messages not announced (no `role=alert` / `status`)                                                                  | fixed, uncommitted     |
| F-17 | medium | cart, granites forms         | Name, email, phone fields without `autocomplete` (WCAG 1.3.5)                                                                          | fixed, uncommitted     |
| F-18 | medium | looping videos               | Muted background videos loop with no pause control (WCAG 2.2.2)                                                                        | partly fixed, proposal |
| F-19 | medium | professionals video grid     | Five videos with sound and no captions or transcript                                                                                   | needs owner decision   |
| F-20 | low    | every page                   | Support dock outside any landmark; header `<nav>` unlabelled                                                                           | fixed `9086dd1`        |
| F-21 | low    | product pages                | `h1` followed directly by `h4` ("Finishes Available", "Format")                                                                        | fixed, uncommitted     |
| F-22 | low    | sills page, 320 px           | H1 "THRESHOLD" 6 px wider than the screen                                                                                              | fixed, uncommitted     |
| F-23 | low    | capacity marquee             | Every stamp read twice by screen readers (duplicate copy)                                                                              | fixed `9086dd1`        |
| F-24 | low    | /privacy, /visualize         | `<main>` nested in the layout's `<main>`                                                                                               | needs owner decision   |
| F-25 | low    | shop product                 | "View the technical drawing" button: name differs from the drawing's text                                                              | proposal               |
| F-26 | low    | cookie banner                | Last in the tab order: reached only after the whole page                                                                               | proposal               |
| F-27 | low    | header, phones               | Region button 48 x 17 px, text 9 px in the dock's "Enquire" label                                                                      | proposal               |

## Details

### F-01 Dialogs do not hold keyboard focus (WCAG 2.1.2, 2.4.3)

Measured on the live site by opening each dialog with Enter and pressing Tab 25 times. None
trapped focus; the sample modal and the certificate viewer lost it on the first Tab; focus was
not returned to the opener on close. Confidence: high (reproduced twice, desktop and phone).
Fix: `src/lib/use-dialog-focus.ts`, one hook that moves focus in, cycles Tab inside and
restores focus on close, applied to the search overlay, region selector, sample modal,
`SillDialog` (quick enquiry, sills dialogs), certificate viewer, both finish lightboxes, the
catalogue reader, the shop colour panels, the vanity tops filter panel (which also gained
Escape) and the Coming Soon notice.
Verified locally: search, region, quick enquiry and phone menu all report "trapped" and return
focus to their opener. **Not verified locally** (their pages need CMS content): sample modal,
certificate viewer, lightboxes, catalogue reader, shop panels. Please check these on the
Vercel preview.

### F-02 Mega menus are mouse-only (WCAG 2.1.1)

Live: focusing a trigger left the panel hidden, and Enter went to a landing page, so the 14
Products cards, and everything under Spaces, could only be reached with a mouse. Fix: the nav
item opens on keyboard focus (`:focus-visible` only, so a mouse click does not reopen it later)
and closes when focus leaves the item; Spaces is focusable. Verified locally: PRODUCTS reports
`aria-expanded=true` on focus, 14 stops inside the panel, then PROFESSIONALS
(`shots/v_mega_kb.jpg`). Confidence: high.

### F-03, F-04 Phone menu and skip link

The phone menu is now `role="dialog"`, labelled "Menu", closes on Escape and returns focus to
the menu button. A "Skip to main content" link is the first stop on every site page
(`shots/v_skiplink.jpg`). Both verified locally. The customer portal layout has no skip link
(left for track 3).

### F-05 Support dock covers the product page's bottom bar on phones

`ProductDetail.tsx` reserves 80 px on the right of its fixed bar "for the WhatsApp FAB"; the
dock that replaced that button on 2026-10-22 is about 260 px wide and sits on both buttons.
Fix: the bar is marked `data-phone-bottom-bar` and a rule in `globals.css` lifts the phone dock
to 5 rem above the bottom on any page that has one. Verified locally with a stand-in bar (gap
goes from 12 px to 80 px); the product page itself does not render locally. Side effect: on a
product page the cookie banner, until answered, covers the lifted dock.

### F-06, F-18 Motion

Added `MotionPrefs` (Framer Motion `reducedMotion="user"`, and looping muted videos held on
their first frame), a Lenis guard, and a still, hand-scrollable marquee, all only when the
visitor has asked for reduced motion. Verified locally on /about: Lenis off, hero video paused.
The scroll-scrubbed hero is driven by the visitor's own scrolling and was left alone.
Still open (proposal): WCAG 2.2.2 wants a visible pause control for visitors who have _not_
set the preference. A small pause button on the looping heroes is a design addition, so it is
not built.

### F-10 Visible text missing from the accessible name (WCAG 2.5.3)

This is the Lighthouse item already known. Fixed by removing the `aria-label` and adding hidden
text around the visible words, as `TrustStrip` already did: region button, product page
certificate badges, facade tiles, shop colour button, and the five identical "Play video"
buttons (now "Click to play video 1 of 5"). Verified locally for the region button; the others
by reading the code.

### F-12 Contrast of muted text under the black-and-white skin (WCAG 1.4.3)

`bw-temp.css` builds every muted tone by alpha: `text-pacific-mid/70` is `#8f8f8f` on white
(3.23:1, used at 11 px), `text-pacific-dark/45` is `#8c8c8c` (3.36:1), `/50` is `#808080`
(3.94:1). axe flagged 32 distinct elements on the pages sampled (product cards, shop labels,
application eyebrows, sills specs, learn section numbers); elements over photographs are not
counted. In the navy palette the base token is worse: `#9aa8b6` on white is 2.4:1.
Not changed, because the fix moves the look of secondary text across the whole site and the
skin is the owner's own experiment. Proposed fix, about ten lines in `bw-temp.css`: give
`text-pacific-mid/40` to `/80` and `text-pacific-dark/45`, `/50` a floor of `#757575`, which
is 4.6:1 on both white and black.

### F-19 Captions

The professionals video grid plays five clips with sound and no captions or transcript
(WCAG 1.2.2). Captions need the spoken content, which only the owner has.

### F-24 Nested `<main>`

/privacy and /visualize render their own `<main>` inside the layout's. Changing the inner one
to a `<div>` would match `html body main div[class*="min-h-screen"]` in `bw-temp.css` and turn
both pages white, so it was left. Safe to fix once the skin is retired.

### Smaller fixes

F-07, F-22: hero headings scale with the screen below 420 px (`ProKit.tsx`, `SillsBlocks.tsx`);
checked at 360 px (`shotsl/_cmp.jpg`). F-08, F-09: brand tokens in place of `stone-300` and of
an alpha variant the skin does not flip. F-13: `role="region"`, a label and `tabIndex=0` on
the table wrappers. F-16: `role="alert"` on the quick enquiry, dealer enquiry, sills quote and
careers errors (contact, sample and newsletter errors use `window.alert`, which is announced).
F-21: `aria-level={2}` on the four `h4`s, because changing the tag would pick up the skin's
`h2`/`h3` weight.

## For other tracks

- **Track 1:** React hydration error #418 on /spaces/kitchens, /applications/kitchen-countertops
  and /privacy (desktop, live, console). `finish-lightbox.tsx` attaches its wheel-zoom listener
  before the portal mounts, so the ref is null and wheel zoom likely never works.
- **Track 3:** contact, sample request and newsletter report failures with `window.alert`.
  The customer portal has no skip link.
- **Track 4:** /products is about 46,000 px tall on a phone and 99,700 px on desktop.
  Unknown URLs redirect to the home page with a 404 status (documented in `not-found.tsx`).

## What could not be tested

- Safari, iOS VoiceOver, Firefox, real devices: only Chromium emulation was available.
- Translated pages (`lang`, layout in other languages): Google Translate is blocked here.
- Anything behind a form submission, by rule. Error states were read from code.
- Fixes on CMS-driven pages (home, products, shop, resources, blog, contact, careers, FAQs):
  these return 500 locally without Sanity, so they were checked by reading the code.
- Text resized to 200 %: covered only indirectly by the 320 px reflow pass.
- A full visual read of every screenshot: about a tenth of the phone screenshots were read
  by eye; the rest were checked by script (overflow, clipped text, tap-target size).
- The 3D showroom, by instruction.

## Evidence

Scratch directory (not committed):
`/tmp/claude-0/-home-user-pacific-surfaces/265e7779-256b-5fe6-ad6e-9428abade345/scratchpad/audit/`
with `out/*.json` (per-page measurements and axe results, live), `shots/` (live screenshots at
every width), `mont/` (phone pages as 4-up strips), `outl2/` and `shotsl/` (local, after the
fixes), `clip.log` (320/360/768 clipped-text pass), and the scripts (`sweep.js`, `clip.js`,
`kb*.js`, `v*.js`).
