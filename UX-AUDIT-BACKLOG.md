# Pacific Surfaces — UX Audit Backlog

Source: "UX Audit Deck PS.pdf" (20 slides) + Inventry.xlsx (missing quartz samples)
Compiled and grouped by theme. Slide numbers cited for traceability.

## Favorites & Comparison

1. DONE — Built a dedicated `/favorites` page. Nav entry points: heart icon in the desktop header (2xl+) and a "View Favorites" link in the mobile menu. (Slide 1)
2. DONE — `/favorites` now has a Grid/Compare toggle. Compare mode lets you pick any 2 favorited products and see them side by side (image, collection, pattern, finishes, thicknesses). Built as a new lightweight component rather than reusing the complex per-product CompareSliderSection, to avoid destabilizing that working piece of UI. (Slide 1)
3. PARTIAL — Added a "Try in Visualizer" link from `/favorites`. Full deep-linking (opening the visualizer with a specific favorited slab pre-loaded) wasn't done — the visualizer assigns slabs per-detected-surface only after the user taps a photo, so there's no single "current slab" slot to pre-fill before that happens without a deeper change to that flow, which wasn't worth risking without being able to visually test the interactive canvas. (Slide 3)
4. DONE — "Compare Colors" now appears in the product page's sticky section nav (was previously unreachable from anywhere). (Slide 6)

## Catalogue & Product Detail

5. DONE (merged from Downloads folder) — Double-clicking a catalogue grid tile now opens the product detail page, matching the "View Slab" button. (Slide 2)
6. NOT STARTED — Show all finish variants as images, both in the catalogue grid and the visualizer, so customers can see a product across every finish. (Slide 4)
7. DONE (partial — content gap remains) — Investigated: the code was already correct (mailto fallback when no file is uploaded in Sanity). Fixed the honest-labeling bug: links now say "Request HD File" / "Request Spec Sheet" instead of looking like a broken download. The underlying content gap (no actual files uploaded for most products) still needs Sanity asset uploads. (Slide 5)
8. INVESTIGATED — RE-TESTED, NO BUG FOUND — Traced the catalogue's search box and filter pills end to end (both currently and in the original pre-audit codebase): they already share one state object (`useFilterState`) and are combined in a single filter pass, so typing a search term and clicking a filter pill do narrow the list together correctly. Could not reproduce the described disconnect anywhere in the code. If you can still reproduce it live, send the exact steps (page, search term, which filter) and it'll get a real fix instead of a guess. (Slide 7)
9. DONE — Added a "Browsing: [Category]" badge to the catalogue's sticky filter bar, so it stays visible even while scrolled well past the page's hero. Derived from content each category page already had — no new content needed. (Slides 7-8)
10. NOT STARTED (content work) — Increase product gallery image count. Benchmarked against 8 competitors: most competitors ship 6+ images per product; Pacific caps around 1-3. Requires uploading more photos in Sanity, not code. (Slide 13)
11. NOT STARTED (content work) — Catalogue isn't kept in sync with physical inventory — newly added collections or renamed products aren't reflected on the site. Directly evidenced by the Excel list: Classic Gray shows with a mismatched texture/photo; Wakanda, Poseidon, Artemis Grey, Cappuccino, Maple Gaze, Astral Mist have physical samples but no website listing at all. Requires Sanity content updates. (Slide 13 + Inventory.xlsx)

## Visualizer

12. DONE — Granite, semi-precious stones, and Beyond Finish are now selectable in the visualizer's general-surface picker (was an arbitrary code restriction, not a technical limitation — confirmed all three have the same image data as quartz). (Slide 14)

## Content Gaps

13. NOT STARTED (content work) — Spaces > Outdoor and Interiors still show placeholder images, not real photography. The Downloads-folder merge already made these pages fetch fresh Sanity data on every request, so this is purely a content/asset task now, not a code bug. (Slide 9)
14. NOT STARTED (content work) — Some PDPs are missing spec sheets and care guides. (Slide 14)
15. DONE — Both real office locations now have an embedded, real Google Map (no API key required — plain iframe embed). Dealer locations still text-only (could extend the same pattern if wanted). (Slide 14)
16. ALREADY EXISTS (content gap only) — Investigated before building anything new: /resources already has 11 category sections (Quartz, Granite, Semi-Precious/Exotic, Sinks, Ecosurfaces, Cut-to-Size, Technical Details, Care & Maintenance, Sustainability, Brand & Marketing, Fabrication Guides) and is already in the main nav. This structurally is the centralized PDF library the audit asks for — it just renders fallback placeholder cards where no real Sanity resource has been uploaded yet. No code work needed; needs real PDFs uploaded in Sanity Studio. (Slide 13 diagram)
17. DONE — Catalogue filters (hue, collection, product type, pattern, finish, thickness, sort, search) now sync to the URL live. Copy the URL after filtering and it reproduces the exact same filtered view for whoever opens it. Applies everywhere useFilterState is used (catalogue, category pages, collection pages) since it's one shared hook. (Slide 13 diagram)
18. NOT STARTED — BIM/CAD object library for architects. Zero competitors in the audited set offer this — flagged as a first-to-market opportunity. See "Scoping notes" below — this needs a content/asset and hosting decision before any code, not just a build. (Slide 13 diagram)

## Sitewide / Navigation

19. DONE (partial) — Search now also matches blog posts, plus a client-side index of 11 key site pages (About, Sustainability, Careers, Resources, etc.) so non-product content is reachable. True full-site search (every static page) isn't possible via a single Sanity query since most static pages are singleton documents without slugs — the page index is a manually-maintained list instead. (Slide 15)
20. DONE — Marquee slowed from 8s to 20s per cycle. (Slide 14)
21. BLOCKED — Cross-browser rendering bugs: logo renders differently or disappears in some browsers (Edge specifically named) at default 100% zoom; the "Get a Quote" button gets clipped at 100% zoom across Chrome, Firefox, DuckDuckGo, Yandex, and Bing. The Downloads-folder Header merge already reduced nav gap/padding, which may be a partial fix. Can't verify further without a real rendered browser — need a screenshot from you showing it still clipping, with the browser + zoom level, so the exact cause can be pinned down. (Slides 16-17)
22. DONE — Eclipse restored as its own nav category (reconciled with an independent fix that arrived via your GitHub pull, which had a more complete version — correct 6-column grid math and a click-behavior fix). Stray "Vision" labels in the footer, mobile menu, and Learn page CTA all updated to "Eclipse." (Slide 19)
23. DONE (partial) — "Cut to Size" renamed to display as "Fab Creations" per the audit's explicit instruction. "Translucent Series" — the other new category requested — has no page, route, or content anywhere in the codebase or Sanity, so no nav card was added for it; needs real content first. (Slide 20)

## Bigger initiative (not a quick fix)

24. NOT STARTED — Customer Project Tracking Dashboard — order status timeline, project details, products used, sample-request tracking, quotes/invoices, a downloads library, communication log, and reordering. See "Scoping notes" below. (Slide 18)

## Low priority

25. DONE — Built a self-made accessibility widget (bottom-left floating button): text size (3 levels), high contrast, and reduce-motion toggles, all persisted in localStorage. Reduce-motion also disables the Lenis smooth-scroll library, not just CSS animations. This is an honest, in-house set of controls — not a claim of WCAG/ADA compliance the way a paid overlay service like accessiBe (which Caesarstone uses) markets itself. (Slide 10)

---

## Scoping notes — items needing a decision before code (18, 24)

Item 18 - BIM/CAD object library. This isn't a UI problem, it's a content/hosting problem: BIM (.rvt/.ifc) and CAD (.dwg/.skp) files for every product would need to be created or exported by someone with the source design files (likely whoever manufactures/engineers the slabs), then hosted somewhere (Sanity's file storage works fine for this — same pattern as the existing spec-sheet PDFs). The code side is genuinely simple once files exist: a schema field per product plus a download link, mirroring the HD file/spec sheet pattern already fixed this session. Recommend confirming whether these files exist anywhere internally before scoping the build.

Item 24 - Project Tracking Dashboard. This is a real product, not a page — it needs user accounts (there's no auth system anywhere in this codebase today), a data model linking orders/samples/quotes to a specific logged-in customer, and either a new backend or a significant extension of the Sanity schema to support customer-scoped records. It's also the only item that touches money/order data, which raises real questions about who owns that data and how it syncs with whatever system actually processes orders and payments today (Razorpay is mentioned elsewhere in this codebase for sink purchases). This needs a proper requirements conversation — who are the target users (all customers, or just architects/trade accounts?), what data already exists to pull from, and what the minimum useful first version looks like — before any code gets written.
