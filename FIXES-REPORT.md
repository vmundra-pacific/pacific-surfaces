# Pacific Surfaces — UX Audit Fixes Report

All items below are committed and synced to your project folder. Verified via `npm run typecheck` and `npm run eslint` after every change (no test suite exists in this repo).

---

## 1. Compare Colors — unreachable feature (Slide 6)

**Steps to reproduce (before fix):** Open any quartz product page (e.g. `/products/adonis-5060`). Scroll all the way down past the gallery, specs, and "You May Also Like" — the "Compare Colors" slider is there, but nothing in the page's own sticky tab bar, the header, or anywhere else links to it.

**Problem:** `ProductDetail.tsx`'s sticky section nav (`SECTION_IDS`) only listed Gallery / About / Product Info / Similar Styles. The Compare Colors section existed and worked but had zero navigational entry point — a user would only find it by accident while scrolling.

**Fix:** Added a "Compare Colors" tab to `SECTION_IDS`, gated by the same `hideCompareSlider` condition the section itself uses (so it doesn't show on products where Compare doesn't render, e.g. vanity/sinks/facades).

**How to check:** Open any quartz/granite product page. The sticky tab bar under the header should now show "Compare Colors" as a 5th tab. Clicking it jumps straight to that section.

---

## 2. HD File / Spec Sheet — looked broken (Slide 5)

**Steps to reproduce:** Open a product page, scroll to "Professional Resources," click "HD file" or "Download Spec Sheet."

**Problem:** Investigated the code first — it was already correct. When Sanity has no uploaded HD image/spec PDF for a product, the link falls back to opening an email draft (`mailto:marketing@thepacific.group`) instead of a real download. The link text didn't change, so from a user's perspective clicking "Download Spec Sheet" and having an email client pop up (or silently do nothing if no mail client is configured) looks exactly like a broken feature. This is a **content gap** (missing files in Sanity), not a code bug.

**Fix:** The link text is now honest about what will happen — it reads "Request HD File" / "Request Spec Sheet" whenever no real file exists, and only says "HD file" / "Download Spec Sheet" when a real file is attached.

**How to check:** Open any product without an uploaded HD file/spec sheet in Sanity — the buttons should read "Request HD File" and "Request Spec Sheet." Uploading the actual files in Sanity Studio will make the labels switch back automatically (no code change needed) and turn them into real downloads.

---

## 3. Marquee/ticker too fast (Slide 14)

**Steps to reproduce:** Scroll to the stats strip ("12 Million sq ft Quartz Produced Annually...") on the homepage.

**Problem:** `HeritageSection.tsx` scrolled one full set of stats in 8 seconds — too fast to actually read any of the six stats before they scroll past.

**Fix:** Slowed the cycle from 8s to 20s (`SECONDS_PER_SET`).

**How to check:** Reload the homepage, scroll to the stats strip, and read along — you should now be able to comfortably read each stat before it scrolls off.

---

## 4. Eclipse category removed, then restored + reconciled with GitHub (Slides 19–20)

**Steps to reproduce (before fix):** Open the Products mega-menu in the header — no "Eclipse" card existed (it had been folded into Quartz in a prior change); the footer and mobile menu still said "Vision" (the old name).

**Problem:** Two things tangled together: (1) the audit wants Eclipse to exist as its own nav category with the footer's stale "Vision" label unified to "Eclipse," and (2) a prior local change had actually removed Eclipse as a category. Partway through fixing this, you pulled a fresh copy from GitHub that turned out to contain an independently-made (and better) version of the same Eclipse restoration — it correctly resized the mega-menu grid to 6 columns and reverted a click-behavior change that my version hadn't touched.

**Fix:** Adopted GitHub's Eclipse restoration as the base (it's more complete), then layered my remaining pieces on top: renamed "Cut to Size" to "Fab Creations" per the audit's explicit label, and fixed the last two stale "Vision" references (mobile menu, footer, and the Learn page's "Browse Vision" CTA) to say "Eclipse."

**How to check:** Products mega-menu should show 6 cards including "Eclipse" and "Fab Creations" (not "Cut to Size"). Footer's Products column and the mobile menu should say "Eclipse," not "Vision."

**Still open:** "Translucent Series" (the other new category the audit asked for) has no page or content anywhere in the codebase or Sanity — needs real content before a nav card can point anywhere meaningful.

---

## 5. Visualizer missing granite/semi-precious/Beyond Finish (Slide 14)

**Steps to reproduce:** Open `/visualize`, upload or pick a demo room, tap a surface — the slab picker only ever shows quartz products.

**Problem:** `VisualizeClient.tsx` explicitly filtered the picker to `productType === "quartz-slab"` only. Checked the Sanity schema and data layer — granite, semi-precious, and Beyond Finish (`granite-finish`) products have the exact same image fields as quartz. This was a scope decision, not a technical limitation.

**Fix:** Extended the filter to include `quartz-slab`, `granite-slab`, `semi-precious`, and `granite-finish`. Sinks and Centrepiece Couture pieces keep their own dedicated logic untouched.

**How to check:** Open `/visualize`, tap a general surface (not a sink or small table), and confirm granite and semi-precious products now appear in the slab picker alongside quartz.

---

## 6. Contact page — no real map (Slide 14)

**Steps to reproduce:** Open `/contact`, scroll to "Office Locations" — addresses are listed but there's no way to see them on a map.

**Problem:** The only "map" asset was a decorative looping background video, not an actual interactive map. No Google Maps integration existed anywhere, and no Maps API key is configured.

**Fix:** Added a real, embedded Google Map under each of the two real office addresses (Navi Mumbai and Bengaluru), using a plain `maps.google.com/maps?q=<address>&output=embed` iframe — this requires no API key or billing setup, unlike the full JS Maps SDK.

**How to check:** Open `/contact`, scroll to Office Locations — each of the two office cards should now show a real, interactive embedded map matching its address.

**Not yet done:** The 4 dealer listings are still text-only; same pattern could be extended to them if wanted.

---

## 7. Search only searches products (Slide 15)

**Steps to reproduce:** Open the search overlay (magnifying glass icon), search for "sustainability" or a blog post title — nothing comes up.

**Problem:** `/api/search` only queried Sanity's `product` document type. Static pages (About, Sustainability, Careers, etc.) are Sanity singletons without slugs, so they can't be added to a document-based search query at all.

**Fix:** Extended the search API to also match blog post titles, tagged results with `_type` so they route correctly (`/blog/<slug>` vs `/products/<slug>`). Added a small, manually-maintained client-side index of 11 key site pages (About, Visualizer, Catalogue, Sustainability, Careers, Resources, Professionals, Spaces, Inspirations, Blog, Contact) that's filtered locally against whatever you type, so those pages are reachable from search even though they have no backing Sanity document.

**How to check:** Open search and type "sustainability" — you should see a "Pages" section with a link to the Sustainability page. Type a blog post title — it should appear labeled "Blog Post" and link to `/blog/<slug>`.

**Known limit:** This isn't a literal universal search of every page's content — it's product + blog (real search) plus a fixed list of major sections (lookup, not full-text). True full-site search would need either a search index service or converting static pages into real Sanity documents.

---

## 8. No way to view favorited items (Slide 1)

**Steps to reproduce:** Favorite a few products via the heart icon on product pages, then look for anywhere to see just your favorites — there isn't one.

**Problem:** Favoriting was fully wired up (stored in `localStorage` under `ps_favorites_v1`) but there was no page to view them, and no nav link pointing anywhere.

**Fix:** Built a new `/favorites` page — reads your favorited IDs from localStorage, fetches the full product data via a new `/api/favorites` route + Sanity query, and renders them in the same grid used by the catalogue. Added two entry points: a heart icon in the desktop header (visible at ≥1536px screens) and a "View Favorites" link in the mobile menu — kept off the header at medium screen widths intentionally, since that range already has a known crowding issue (see below).

**How to check:** Favorite 2-3 products, then visit `/favorites` directly, or use the heart icon (wide desktop) / mobile menu link. You should see exactly the products you favorited. With nothing favorited, it shows an empty state with a link back to the catalogue.

---

## Not fixed — needs your input

- **Get-a-Quote button clipping cross-browser (Slide 16-17):** Can't reproduce browser rendering in this sandbox to find the exact breakpoint/browser at fault. If you can screenshot it still clipping at 100% zoom, I can make a precise fix instead of guessing.
- **Translucent Series category:** no page or content exists — needs real content before I can add it.
- **Increase product image counts, sync catalogue with the Excel inventory list, populate Spaces placeholder images, upload missing spec sheets/care guides:** all pure content work in Sanity, not code.
- **Favorites-scoped Compare/Visualizer, Resources Hub, shareable filter URLs, "you are here" nav indicator, BIM/CAD library, Project Tracking Dashboard, accessibility widget:** bigger features not yet started — happy to scope and build any of these next.
