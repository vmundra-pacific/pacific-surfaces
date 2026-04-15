# Pacific Surfaces — Next.js Migration Context File

## Project Overview
Migrating **pacific-surfaces.com** from Wix to **Next.js 15 + Sanity CMS + Vercel**.
The goal: replicate all Wix functionality while making it faster, better, and amazingly interactive with Terminal Industries-inspired UI/UX.

**Owner:** Varun Mundra (vmundra@thepacific.group) — The Pacific Group
**Live Wix site:** https://www.pacific-surfaces.com/
**Dev workspace:** `/sessions/magical-determined-newton/pacific-surfaces-app/`
**Production folder:** `/sessions/magical-determined-newton/mnt/Website/pacific-surfaces/`

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.5.14 | App Router, SSG, SSR |
| React | 19.1.0 | UI framework |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | v4 | Styling (via @tailwindcss/postcss) |
| Framer Motion | ^12.38.0 | Animations, scroll-driven effects |
| GSAP | ^3.14.2 | Advanced animations (installed, available) |
| Lenis | ^1.3.21 | Smooth scroll (dynamic import, graceful fallback) |
| Sanity | ^4.22.0 | Headless CMS |
| next-sanity | ^11.6.12 | Sanity + Next.js integration |
| Lucide React | ^1.7.0 | Icons |
| @portabletext/react | ^6.0.3 | Rich text rendering |
| clsx + tailwind-merge | latest | Conditional class merging |
| styled-components | ^6.3.12 | Sanity Studio styling |

---

## Environment Variables (.env.local)

```
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=...
NEXT_PUBLIC_SANITY_API_VERSION=...
SANITY_API_READ_TOKEN=...
NEXT_PUBLIC_SITE_URL=...
```

---

## Build Stats

- **290 static pages** across 20 routes
- Compiles successfully with zero errors
- Homepage JS: 9.54 kB (169 kB first load)
- Shared JS: 102 kB

---

## Design System

**Inspired by:** Terminal Industries (terminal-industries.com) + 21st.dev

### Color Palette
- **Primary dark:** stone-950 (#0c0a09)
- **Primary light:** stone-50 (#fafaf9)
- **Text:** white on dark, stone-900 on light
- **Accent (eco):** emerald-600
- **Stone scale:** 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950

### Typography
- **Headlines:** font-light, tracking-tight, text-6xl to text-[7rem]
- **Labels:** text-xs, font-medium, tracking-[0.25em], uppercase
- **Body:** font-light, leading-relaxed

### Components Pattern
- All components use `"use client"` directive
- Rounded-2xl cards with border-stone-100
- Grain texture overlay on dark sections
- Framer Motion scroll-driven animations (useScroll, useTransform, whileInView)
- MagneticButton for CTAs
- TextReveal for headline animations

---

## File Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx                    # Root layout (fonts, metadata)
│   ├── (site)/
│   │   ├── layout.tsx                # Site layout (Header, Footer, WhatsAppFAB, SmoothScroll)
│   │   ├── page.tsx                  # Homepage
│   │   ├── about/page.tsx
│   │   ├── blog/page.tsx
│   │   ├── blog/[slug]/page.tsx
│   │   ├── careers/page.tsx
│   │   ├── collections/page.tsx
│   │   ├── collections/[slug]/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── ecosurfaces/page.tsx
│   │   ├── granites/page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/[slug]/page.tsx
│   │   ├── resources/page.tsx
│   │   ├── semi-precious/page.tsx
│   │   ├── sinks/page.tsx
│   │   └── sustainability/page.tsx
│   └── studio/
│       ├── layout.tsx
│       └── [[...tool]]/page.tsx      # Sanity Studio
├── components/
│   ├── layout/
│   │   ├── Header.tsx                # Scroll-aware nav, Products dropdown, search, mobile menu
│   │   └── Footer.tsx                # Newsletter, links, social, copyright
│   ├── providers/
│   │   └── SmoothScroll.tsx          # Lenis smooth scroll (dynamic import, fallback)
│   ├── sections/
│   │   ├── HeroTerminal.tsx          # ★ Terminal-style pinned scroll hero (400vh, 4 headlines)
│   │   ├── Hero.tsx                  # Original hero (kept as backup)
│   │   ├── StatementSection.tsx      # ★ Oversized typography interstitial
│   │   ├── HorizontalShowcase.tsx    # ★ Horizontal scroll product carousel (300vh)
│   │   ├── BenefitsSection.tsx       # ★ Scroll-pinned numbered benefits (300vh)
│   │   ├── TestimonialSection.tsx    # ★ Social proof cards
│   │   ├── ClipRevealSection.tsx     # ★ Clip-path scroll reveal wrapper
│   │   ├── CollectionShowcase.tsx    # 3-card collection grid
│   │   ├── FeaturesMarquee.tsx       # Feature cards + brand marquee
│   │   ├── CTASection.tsx            # Parallax CTA
│   │   ├── ProductCategories.tsx     # 6-card product category grid
│   │   ├── FabCreations.tsx          # Fab Creations showcase
│   │   ├── EcosurfacesBanner.tsx     # Ecosurfaces CTA banner
│   │   ├── StorySection.tsx          # "The Way We Do It" section
│   │   ├── ApplicationShowcase.tsx   # 4 application use cases
│   │   ├── PartnerWithUs.tsx         # Distributors/Architects/Fabricators
│   │   ├── ProductGrid.tsx           # Filterable product grid (search, ribbons, collections)
│   │   ├── ProductDetail.tsx         # Product page (gallery, specs, lightbox, share, related)
│   │   ├── CollectionGrid.tsx        # All collections grid
│   │   ├── CollectionProducts.tsx    # Products in a collection
│   │   ├── AboutContent.tsx          # About page (timeline, team, tech, values)
│   │   ├── ContactContent.tsx        # Contact form, departments, offices, dealers
│   │   ├── EcosurfacesContent.tsx    # Ecosurfaces page (products, features)
│   │   ├── SinksContent.tsx          # Integra sinks (products, policies, care)
│   │   ├── GranitesContent.tsx       # Granites page (products, stone finishes, enquiry)
│   │   ├── CareersContent.tsx        # 12 job listings with descriptions
│   │   ├── SustainabilityContent.tsx # SDGs, certifications, energy
│   │   ├── ResourcesContent.tsx      # Download sections
│   │   ├── SemiPreciousContent.tsx   # Semi-precious products
│   │   ├── BlogGrid.tsx              # Blog listing
│   │   └── BlogPostContent.tsx       # Blog post detail
│   └── ui/
│       ├── animated-section.tsx      # AnimatedSection, StaggerContainer, StaggerItem
│       ├── magnetic-button.tsx       # Cursor-following magnetic button
│       ├── page-header.tsx           # Reusable page header (dark/light)
│       ├── product-card.tsx          # Product card with ribbons, hover
│       ├── search-overlay.tsx        # Full-screen search overlay
│       ├── text-reveal.tsx           # TextReveal, LineReveal
│       └── whatsapp-fab.tsx          # Floating WhatsApp button (official logo)
├── lib/
│   └── utils.ts                      # cn() utility (clsx + tailwind-merge)
└── sanity/
    ├── env.ts
    ├── lib/
    │   ├── client.ts
    │   ├── image.ts
    │   └── queries.ts                # All GROQ queries
    └── schemas/
        ├── index.ts
        ├── product.ts
        ├── collection.ts
        ├── blogPost.ts
        ├── category.ts
        ├── page.ts
        └── siteSettings.ts
```

---

## Homepage Section Order

```
HeroTerminal          — 400vh pinned scroll, 4 rotating headlines, parallax bg
BrandMarquee          — Infinite horizontal scroll marquee
StatementSection      — "Imagine surfaces as an intelligent bridge..."
HorizontalShowcase    — 300vh horizontal scroll, 5 product category cards
BenefitsSection       — 300vh scroll-pinned, 3 numbered benefit cards
EcosurfacesBanner     — Emerald CTA banner for Ecosurfaces
FabCreations          — 2-col layout, 6 featured product cards
StatementSection      — "Our journey begins where conventionality ends..."
ApplicationShowcase   — 4 numbered application cards
TestimonialSection    — 3 testimonial quote cards (dark)
FeaturesSection       — 6 feature cards (Why Pacific)
PartnerWithUs         — 3 partner cards (dark)
CTASection            — Parallax CTA with buttons
```

---

## Navigation Structure (Header)

```
About → /about
Products (dropdown):
  ├── Quartz Surfaces → /products
  ├── Exotic Collection → /collections
  ├── Semi-Precious Stones → /semi-precious
  ├── Kosmic Collection → /collections/kosmic-collection
  ├── Nebula Collection → /collections/nebula-collection
  ├── Centrepiece Couture → /collections/centrepiece-couture
  ├── Integra (Sinks) → /sinks
  ├── Fab Creations → /products
  ├── Ecosurfaces → /ecosurfaces
  ├── Granites → /granites
  ├── Natural Stone Finishes → /granites
  └── All Products → /products
Resources → /resources
Blog → /blog
Sustainability → /sustainability
Careers → /careers
Contact → /contact
```

---

## Footer Structure

**Products:** Quartz Surfaces, Kosmic Collection, Nebula Collection, Centrepiece Couture, Integra (Sinks), Ecosurfaces, Granites, Natural Stone Finishes

**Company:** Our Story, Sustainability, Work with Us, News & Events, Contact Us

**Support:** Resources, Semi-Precious, Terms & Conditions, Privacy Policy

**Social Links:**
- Instagram: https://www.instagram.com/pacific_surfaces/
- Facebook: https://www.facebook.com/thepacificstone/
- LinkedIn: https://www.linkedin.com/company/pacific-granites-india-pvt-ltd/
- Pinterest: https://in.pinterest.com/thepacificstone
- YouTube: https://www.youtube.com/channel/UCWeTO3mX6zInSev42K9h5Fw

---

## Key Page Data

### About Page
**Timeline:**
- 2011: Pacific Granites India Pvt. Ltd. — gang saw granite processing, 25% YoY growth
- 2018: Pacific Quartz Surfaces LLP — mineral surface sector, acquired Pacific Mintek (2020)
- 2023: Pacific Engineered Surfaces Pvt. Ltd. — Bretonstone plant, Poland warehouse (late 2024)

**Team (7 members):**
1. Mohanlal Somani — Chairman
2. Varun Somani — Managing Director
3. Varun Mundra — Director
4. Abhijeet Mankotia — VP — Global Sales
5. Anish Datta — VP — Business Development
6. Paulina Poplawska — Director, Pacific Polska
7. Nagesh P K — Commercial Manager, Pacific Granites India

**Manufacturing Technology (3 pillars):**
1. Integrating Technology with Innovation — advanced machinery, creative innovation
2. High-Speed Production Line — accelerated manufacturing, automated systems
3. Sustainable Manufacturing Plant — fully automated, eco-friendly, minimal environmental impact

### Contact Page
**10 Department Contacts:**
1. International Sales: Jal Shetty +91 96773 68666, Manish +91 93242 81801
2. Poland: Paulina +48 517 540 297, Marcin +48 537 819 991
3. Exports & Logistics: +91 88705 81104
4. Finance: +91 89259 19991
5. India: +91 7305477549
6. Middle East: Saral +91 73977 46963
7. Croatia: Marko +385 91 250 4582
8. Marketing: bindu@thepacific.group
9. HR: +91 89259 01419
10. Procurement: +91 89259 13267

**Office Locations:**
- JB Homes: Plot no. 35 & 36, Marble Market, Sector 23, Turbhe, Navi Mumbai, Maharashtra 400703
- Marble City: Bannerghatta Rd, Koppa Gate, Bengaluru, Karnataka 560105

**4 Dealer Locations:**
1. Shree Shantinath Granite World — Hyderabad
2. Swastik Marbles — Bengaluru
3. Shree Shantinath Granite World — Gurugram
4. La Casa Decor — Panchkula

### Careers Page (12 Positions)
Events Manager (North America), Senior Accountant (Bangalore), Digital Marketing Manager (Germany), CFO (India), International Sales (PAN India), A&D Executive (France), BDM (Spain), Purchase Manager (UK), Marketing Head (Hosur), A&D Manager (Mexico), SEO Specialist (Belgium), Senior Graphic Designer (Italy)

### Sinks Page (Integra)
**14 sink products** ranging from Rs 70,000 to Rs 120,000
**6 purchase policies:** Returns (7 days), Shipping (5-12 business days), Payments (Razorpay), Cancellation (12 hours), Warranty (10-year), Privacy
**6 care tips** for quartz sink maintenance

### Granites Page
**Stone Finishes:** ENIGMA and INTERSTELLAR featured finishes
**Hero:** "TIMELESS BEAUTY OF GRANITES" — Premium Natural Granite Collection

### Ecosurfaces Page
**What Are Ecosurfaces:** Hybrid formulation — premium minerals, quartz, recycled glass
**6 Features:** Silica-Free, Low Silica, Sustainable Manufacturing, Durable & Stylish, Health & Safety Compliance, Versatile Applications

### Sustainability Page
**3 Pillars:** Windmill (Siemens Gamesa), Solar (2MW), Water Conservation
**4 Certifications:** ISO 9001:2015, NSF, Greenguard, CE Marking
**6 UN SDGs:** 3, 5, 8, 9, 12, 13

---

## Sanity GROQ Queries

```groq
allProductsQuery      — All products with images, collections, ribbons, SEO
productBySlugQuery    — Single product with related products
productsByCollectionQuery — Products filtered by collection slug
allCollectionsQuery   — All collections with product counts
collectionBySlugQuery — Single collection
allBlogPostsQuery     — All blog posts ordered by date
blogPostBySlugQuery   — Single blog post with body
pageBySlugQuery       — Static pages
siteSettingsQuery     — Site settings
```

---

## WhatsApp Integration
- **Phone:** +91 73054 77549
- **URL:** https://api.whatsapp.com/send/?phone=917305477549&text=Hi%2C+I+am+interested+in+your+quartz+and+granite+surfaces.+Please+share+details+and+pricing&type=phone_number&app_absent=0
- **Icon:** Official WhatsApp SVG logo (viewBox 0 0 175.216 175.552)
- **Position:** Fixed bottom-right, delayed 2s entrance, pulse animation

---

## Pending Tasks
1. **Enrich 136 stub products in Sanity** with full Wix descriptions (API auth blocked)
2. **Upload product images to Sanity** (currently using Wix CDN URLs)
3. **Import 26 blog posts** from Wix into Sanity
4. **Build 301 redirect map** from old Wix URLs to new Next.js routes
5. **Push to GitHub** for Vercel deployment
6. **Add `lenis` package locally** — run `npm install lenis` in local project (smooth scroll gracefully falls back if missing)
7. **Optimize images** — migrate from Wix CDN to Sanity image pipeline or next/image
8. **Add Terms & Conditions and Privacy Policy pages**
