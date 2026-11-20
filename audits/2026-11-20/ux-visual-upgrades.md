# Track 4: user experience, visual design and content

Audit date: 2026-11-20. Branch: `claude/audit-ux-upgrades`. Status: **draft, nothing committed** (owner asked to review first).

## Summary

The site looks premium and has more working tools than most Indian competitors (visualizer, compare slider, favourites, sample request, WhatsApp routing). What holds back enquiries is not polish but **distance and doubt**:

- **Distance.** The home page is about 33 screens tall on desktop (29,434 px) and 30 on a phone. The first button appears after roughly six screens of pinned animation. Product pages lead with two paragraphs of mood copy before any fact or action.
- **Doubt.** Headline claims do not agree with the company's own history ("over 25 years", "10M+ homes"). Spec sheets and HD files are e-mail requests, not downloads. The warranty page tells people to register but there is no way to register. Dealers are behind a form. A mistyped address silently shows the home page.
- **Names.** The same things carry several names: Eclipse / Vision / Chromia; Beyond Stone / Facades and Finishes; Integra / Sinks; The Pacific Journal / Field Notes / News & Events.

Two small defects were fixed in code (not committed). Everything else is a proposal.

Screenshots are in the session scratch folder `/tmp/claude-0/-home-user-pacific-surfaces/0c785016-4a09-53b5-9f50-d1ea56f4702c/scratchpad/shots/` (not committed; they do not survive the session). File names are given per finding.

## Findings table

| ID  | Sev.   | Where                           | Evidence                                                                                                                                                                     | Status                                                              |
| --- | ------ | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| U1  | high   | Home `/`                        | 29,434 px tall on desktop; first CTA after ~6 pinned screens (`home.desktop.scroll0.jpg`)                                                                                    | proposal                                                            |
| U2  | high   | Home hero                       | "Installed in 10M+ homes globally" (`HeroScrollCanvas.tsx:106`); no source anywhere on the site                                                                              | needs owner decision                                                |
| U3  | high   | Home, footer                    | "A leading brand for over 25 years" (`page.tsx` StatementSection, `EcosurfacesSection.tsx:76`) vs `/about`: quartz since 2018, plant 2023                                    | needs owner decision                                                |
| U4  | high   | Product page                    | Mood copy first; facts (thickness, format, finishes) below; no silica, warranty or price band                                                                                | proposal (facts pending owner)                                      |
| U5  | high   | Product page                    | "Request Spec Sheet" and "Request HD File" are `mailto:` links, shown twice (`ProductDetail.tsx:1286`)                                                                       | needs CMS (upload PDFs)                                             |
| U6  | high   | `/where-to-buy`                 | Two-step form before any dealer is shown; international visitors see "across India" and "PIN code"                                                                           | needs owner decision (documented gate)                              |
| U7  | medium | Product page                    | "Find A Dealer" went to `/contact`, where the finder is off                                                                                                                  | fixed, uncommitted                                                  |
| U8  | medium | Product page                    | Applications tab printed raw values "island-tops", "vanity-top"                                                                                                              | fixed, uncommitted                                                  |
| U9  | medium | Home                            | Same headline and sub-line in two consecutive sections (StatementSection, EcosurfacesSection) (`home.desktop.scroll1.jpg`)                                                   | proposal                                                            |
| U10 | medium | Any wrong URL                   | Returns 404 status but renders the home page; no message (`not-found.tsx`)                                                                                                   | proposal; overlaps orchestrator's 404 work                          |
| U11 | medium | `/products/translucent`         | "0 designs" and "No designs match those filters"; page is in the sitemap                                                                                                     | fixed in code (owner request, 2026-11-20); backlit photos to follow |
| U12 | medium | `/learn/warranty-quartz`        | "Register your installation within 60 days"; no registration form or link exists (`learn/[topic]/page.tsx:643`)                                                              | needs owner decision                                                |
| U13 | medium | Navigation                      | Eclipse links to `/products/quartz/chromia`; guides are `/learn/what-is-vision`; warranty text says "Vision"                                                                 | proposal + CMS                                                      |
| U14 | medium | Navigation                      | Top-level "Our Story" and "Corporate" side by side; blog sits under Corporate > News; FAQs and Learn only in footer or deep links                                            | proposal                                                            |
| U15 | medium | Blog post                       | Ends with "Back to Field Notes" only; no sample, dealer or enquiry action (`BlogPostContent.tsx:263`)                                                                        | proposal                                                            |
| U16 | medium | Category pages                  | Every category uses "N premium surfaces engineered for beauty… Find the perfect slab", including furniture (Centrepiece Couture) and sinks                                   | proposal                                                            |
| U17 | medium | `/products/centrepiece-couture` | Hero: "gallery-grade slabs"; FAQ: "dining tables, coffee tables, statement furniture"                                                                                        | needs owner decision / CMS                                          |
| U18 | medium | Catalogue                       | Hero says "Pacific Surfaces · Quartz… Premium quartz slabs" above 314 designs that include granite, sinks and stone                                                          | proposal                                                            |
| U19 | low    | Catalogue (CMS)                 | Names in mixed case ("ALASKA YELLOW", "Alpine White"); "Artic White"; "Ashford(3052)"; two "Patagonia"; slugs "calcatta-d-oro", "taitanium-gold", "posidien", "jespar-black" | needs CMS                                                           |
| U20 | low    | Blog                            | Four names: The Pacific Journal, Field Notes, News & Events, Recent Articles                                                                                                 | proposal                                                            |
| U21 | low    | Finishes                        | "Polished, honed or leather" (`/professionals/services`) vs "Polished, Suede, Leathered" (product pages) vs "+ Matte" (`/shop`)                                              | needs owner decision                                                |
| U22 | low    | Counts                          | Home: "Quartz · 133 Products"; `/products/quartz`: "139 designs"; shop: "All 133 colours"                                                                                    | for other track / check                                             |
| U23 | low    | Visual                          | Three hero styles: all-caps display (about, careers, kitchens), sentence case (spaces, FAQs, learn), two-line italic (catalogue, sinks) (`F1.jpg`–`F3.jpg`)                  | proposal                                                            |
| U24 | medium | Phone                           | Floating enquiry dock covers the sticky "Order a sample" bar on product pages and the second hero button on `/about`, `/careers` (`M1.jpg`)                                  | for other track (2)                                                 |
| U25 | low    | `/shop`                         | Sizes in inches only                                                                                                                                                         | needs owner decision                                                |
| U26 | info   | Skin                            | `bw-temp.css`: 1,850 lines, 376 `!important`, referenced from about a dozen components                                                                                       | needs owner decision                                                |

## 1. Top 10 upgrades, ranked by expected effect on enquiries

### 1. Put the facts and the actions at the top of every product page

- **Problem.** `/products/honeydew-3041` opens with two paragraphs of mood copy. Thickness, format and finishes come after. There is no silica content, warranty term, price band or stock indication. Colour pages are the natural landing page for non-brand searches, which are only 11 % of clicks today.
- **Change.** Under the name, a one-line fact row (collection, finishes, thicknesses, slab size, warranty term, silica band). Directly below: two primary buttons (Order a sample, Find a dealer) and WhatsApp as the third. Move the mood copy under a "About this colour" heading lower down. Show a "from ₹X per sq ft" band or a price group (A/B/C) if the owner agrees.
- **Effort.** M (layout) once facts are confirmed.
- **Owner input.** Silica per series, warranty per series, whether to show a price group.
- **Measure.** Clicks on Order a sample and Find a dealer per product-page view; sample requests per week.

### 2. Shorten the home page and bring one action above the fold

- **Problem.** Six pinned screens before "Explore the collection"; 33 screens in total; the collections strip pins for five more.
- **Change.** Keep the opening scene, cut the pinned sequence to two beats, and show two buttons on the first screen (Explore colours, Find a dealer). Merge the two identical "low-silica" blocks. Target under 12 screens. Order: hero, proof (certificates), collections, applications, visualizer, projects, partners, sample.
- **Effort.** M.
- **Owner input.** Which sections to drop.
- **Measure.** Share of home visitors who click anything; scroll depth; time to first click.

### 3. Fix the claims that undermine trust

- **Problem.** "10M+ homes globally" and "over 25 years" as a brand, against "quartz since 2018" on `/about`.
- **Change.** Replace with claims the site can stand behind and already states: "In stone since 2000", "45+ countries", "Up to 12M sq ft of quartz a year", and name the certificates. Remove or source the homes figure.
- **Effort.** S.
- **Owner input.** Confirm the true figures.
- **Measure.** None directly; it removes a reason to leave.

### 4. Make spec sheets, care guides and catalogues real downloads

- **Problem.** Product-page links open an e-mail draft. Leaders offer one-click technical data; Quantra lists catalogues, technical data and CAD/BIM openly.
- **Change.** Upload one spec sheet per series in the CMS and fall back to the series sheet when a colour has none. Remove the duplicate link. Add care guide and warranty PDF.
- **Effort.** S in code, M in content.
- **Owner input.** The PDFs.
- **Measure.** Downloads per product view; drop in "send me the spec" e-mails.

### 5. Reduce the Where to Buy gate to one step, and make it work outside India

- **Problem.** Three fields and a second step before any result. A visitor routed as "International" is asked for an Indian PIN code. Kalinga lists dealers by city with phone numbers, ungated. The gate is a documented decision (marketing, 2026-10-26), so this is a question, not a fix.
- **Change, option A.** Show city and dealer count openly ("12 partners in Bengaluru"), and ask for details only to reveal names and phones. **Option B.** Keep the gate but ask only PIN code first, then the rest. For non-India regions, show the regional partner card first and hide the PIN field.
- **Effort.** M.
- **Owner input.** How much to show before the form.
- **Measure.** Step 1 to step 2 completion; leads per Where to Buy visit.

### 6. One clear sample path, visible everywhere

- **Problem.** Sample ordering exists but is one of four competing buttons on the product page and is absent from blog posts and guides. Caesarstone and Cambria build their funnel on samples.
- **Change.** A persistent "Order a sample" button on product pages (already present on phones), a sample tray that holds up to four colours from the catalogue grid, and a sample block at the end of every guide and article. State delivery area, time and cost.
- **Effort.** M.
- **Owner input.** Sample policy (free or paid, where delivered).
- **Measure.** Sample requests per week; share of product views that add a sample.

### 7. Rename the navigation in plain words

- **Problem.** Eclipse, Beyond Stone, Centrepiece Couture, Integra and Fab Creations mean nothing to a newcomer. "Our Story" and "Corporate" are separate top-level items.
- **Change.** Keep the brand names but add a plain descriptor beside each in the menu, in the pattern "Integra · quartz sinks" and "Fab Creations · cut to size" (both already described that way on the site). The owner supplies the descriptors for Eclipse, Beyond Stone and Centrepiece Couture. Merge Our Story and Corporate into "Company". Add "Guides" (Learn, FAQs, Journal) under Resources.
- **Effort.** S.
- **Owner input.** The descriptors.
- **Measure.** Menu click distribution; exits from category pages.

### 8. A real "not found" page and honest empty states

- **Problem.** A wrong link shows the home page with no explanation. `/products/translucent` shows a filter error for an empty range.
- **Change.** A 404 page with search, the six collections and Contact. For an empty range: "Coming soon; ask us" with an enquiry button, or remove the page from the menu and sitemap until it has products.
- **Effort.** S.
- **Owner input.** Whether Translucent stays public.
- **Measure.** Exits from 404s; coordinate with the orchestrator's redirect work.

### 9. Close every guide and article with a next step

- **Problem.** Articles end with "Back to Field Notes". Guides end with "Talk to us".
- **Change.** A shared closing block: three related colours, Order a sample, Find a dealer. Link the first mention of each collection in the text.
- **Effort.** S.
- **Owner input.** None.
- **Measure.** Clicks from blog and learn pages to product pages and forms.

### 10. Warranty you can act on

- **Problem.** The warranty guide asks owners to register within 60 days; there is no form. Quantra and Cambria offer online registration.
- **Change.** Either add a short registration form (name, dealer, colour, invoice date) or reword to "your fabricator registers it". State the term on every product page.
- **Effort.** S to M.
- **Owner input.** The actual process and terms.
- **Measure.** Registrations per month.

## 2. Backlog by area

**Navigation**

- Eclipse menu item points to `/products/quartz/chromia`; rename the address or redirect (orchestrator owns redirects).
- Two different "Applications" pages: `/applications` and `/professionals/applications`. Rename the second "Testing and suitability" or merge.
- "3D Showroom" menu item links to `#coming-soon` (parked; leave, or hide until ready).
- FAQs are reachable only from the footer.
- Blog naming: pick one of The Pacific Journal / Field Notes / News & Events.

**Home**

- Merge the duplicated low-silica statement (U9).
- Video testimonials have no names or roles under them.
- Partner section copy repeats "Super Jumbo Quartz Slabs" three times in three cards.

**Product discovery**

- Catalogue hero copy is quartz-only on a mixed catalogue (U18).
- Every card reads "· POLISHED"; show the number of finishes instead.
- Filters lack a price group and an "in stock in India" switch.
- Normalise product-name capitals in the CMS (U19).
- Category template copy should vary by type (slabs, sinks, furniture) (U16).

**Product page**

- Facts first (upgrade 1).
- One spec link, not two (U5).
- "Similar styles" on Honeydew shows Caterina, Ashford, Alabaster, Alabaster Noir and Alchemy, which looks like collection order rather than similarity (not confirmed in code); rank by hue and pattern.
- Add room photographs per colour (existing backlog item 10).
- Add "Where it is installed" where project photos exist.

**Conversion**

- Four contact numbers appear across the site (dock, footer, factory, department list). Regional routing is intentional; show one number per region consistently in dock and footer.
- Contact page opens with a "Where to buy" heading above an enquiry form; retitle the page hero "Talk to Pacific".
- Three different e-mail addresses receive requests (info@, marketing@, bindu@).

**Trust**

- Replace unsourced claims (upgrade 3).
- Add a named project list with city and designer.
- Put the certificate PDFs one click from every product page.
- State silica content per series, as Cosentino and Caesarstone now do.

**Content**

- Application pages (120–160 words) and Learn guides (200–350 words) are thin; add sizes, edge options, a care table and three recommended colours each.
- Careers copy is generic ("a culture that inspires"); add benefits, the hiring steps and a named contact.

**Visual polish**

- Settle on one hero style (U23).
- Empty image tiles show the browser's broken-image mark and the alt text (seen here because the image host is blocked; real visitors on a failed load see the same). Add a neutral placeholder.

**Mobile**

- Enquiry dock overlaps page buttons (U24, for track 2).
- Home page section tabs scroll sideways under the header and clip their labels.

## 3. Content inconsistencies and errors

| #   | Item                | Location A                                    | Location B                                                                 | Note                            |
| --- | ------------------- | --------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------- |
| C1  | Brand age           | Home: "leading brand for over 25 years"       | `/about`: founded 2000 in natural stone; quartz from 2018                  | Owner to confirm wording        |
| C2  | Homes               | Home hero: "Installed in 10M+ homes globally" | No other page; capacity "up to 12M sq ft a year"                           | Owner to confirm or remove      |
| C3  | Series name         | Menu: "Eclipse"                               | `/learn/what-is-vision`, warranty text "Vision", address `/quartz/chromia` | One name                        |
| C4  | Centrepiece Couture | Hero: slabs                                   | FAQ: furniture                                                             | CMS                             |
| C5  | Finishes            | `/professionals/services`: "honed or leather" | Product: "Suede, Leathered"; shop adds "Matte"                             | Owner to confirm list           |
| C6  | Quartz count        | Home: 133                                     | `/products/quartz`: 139                                                    | Probably region filter; check   |
| C7  | Blog name           | `/blog`: The Pacific Journal                  | Post breadcrumb: Field Notes; footer: News & Events                        | Code                            |
| C8  | Phone               | Dock: +91 80505 60007                         | Footer: +91 98940 33566; factory: +91 73054 77549                          | Regional routing is intentional |
| C9  | Spelling (CMS)      | "Artic White", "Ashford(3052)"                | slugs `calcatta-d-oro`, `taitanium-gold`, `posidien`, `jespar-black`       | Owner to check each name        |
| C10 | Warranty            | "Register within 60 days"                     | No registration route                                                      | Owner                           |

A wider repository sweep for company facts was started with a helper agent and had not reported when this draft was written; its results will be added here.

## 4. Quick fixes made (uncommitted)

1. `src/components/sections/ProductDetail.tsx`: "Find A Dealer" now links to `/where-to-buy` (was `/contact`, where the finder is switched off).
2. `src/lib/application-rules.ts` and `ProductDetail.tsx`: the Applications tab shows "Island Tops", "Vanity Top" and so on, using the CMS schema titles, instead of raw values.

3. `/products/translucent` (owner request, 2026-11-20, from the "Crafted to Glow" catalogue): the page now lists the five colours of the Translucent Series, which the owner confirmed are the existing Bohemia (3018), Glacial Silver (3059), Latte Luxe (5040), Venice (5041) and Sakura (5077). No product is duplicated. The page has its own title and meta description, and a "The collection" section carrying the catalogue's description of each colour, unedited. `scripts/tag-translucent.mjs` (dry run by default) adds a "Translucent" tag to the five products in the CMS and, with `--seo`, a meta description per colour; it has not been run. Backlit photographs and renders are to come from the owner. Note for the orchestrator: this sets a page title and description, which the brief reserves for the orchestrator's pipeline.

`npm run typecheck` passes; eslint reports nothing on the changed files. Not verified in a browser: product pages need the CMS, which is not available in the sandbox.

## 5. The temporary black-and-white skin

- **What it is.** `src/app/bw-temp.css` (1,850 lines, 376 `!important` rules) overrides the navy palette utility by utility, forces Hubot Sans, and is referenced from about a dozen component files plus `bw-temp-sections.tsx`.
- **What it costs.** The brand guideline palette (`#112732`, `#9AA8B6`, `#DAE1E8`) is no longer what visitors see, so the guideline and the site disagree. Every new component must be checked twice (with and without the skin). About 750 hard-coded hex colours in components bypass both systems. Pure black on white is harsher than the navy and makes the long dark sections heavier.
- **To finish it.** Decide: black and white, or navy. Then move the chosen colours into the theme tokens, replace hard-coded hex values with tokens, delete the override file, and update the brand-guidelines skill to match. Effort: L, mostly mechanical, best done in one pass with before and after screenshots of every page type.

## 6. Benchmark

From search results; competitor sites could not be opened from here, so nothing was seen first-hand.

| Feature                                             | Leaders                                                        | Pacific                               |
| --------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------- |
| Facts on the product page (size, thickness, finish) | Caesarstone                                                    | Yes, below mood copy                  |
| Sample ordering                                     | Caesarstone (free, four per order), Cambria (paid, refundable) | Yes, by request form                  |
| Room visualizer with photo upload                   | Caesarstone, Cambria, Cosentino, MSI                           | Yes                                   |
| Ungated dealer locator                              | Kalinga, MSI, Cambria, AGL                                     | Gated                                 |
| Online warranty registration                        | Quantra, Cambria                                               | No                                    |
| Stated warranty term                                | All four global brands, Quantra                                | Only in a guide                       |
| Silica content per colour                           | Cosentino, Caesarstone                                         | No                                    |
| Downloads hub with technical data and CAD/BIM       | Quantra                                                        | Catalogues yes; spec sheets by e-mail |
| Live stock by location                              | MSI                                                            | No                                    |
| Prices                                              | None of the Indian manufacturers                               | No                                    |

No independent study of conversion for quartz sites was found. Vendor case studies from flooring and tiles report two to five times more sample orders from visitors who use a visualizer.

## 7. Not tested

- Product photographs, collection images and videos: the image host is blocked in the sandbox, so image quality and cropping were not reviewed.
- Menus, the region selector, the enquiry dock, the sample dialog and catalogue filters were not opened on the live site; they were read from code.
- No form was submitted anywhere.
- Safari and Firefox.
- India-region view: the sandbox is routed as "International".
- Each finding was observed once in the crawl; the fresh-load re-check asked for in the brief has not been done.
