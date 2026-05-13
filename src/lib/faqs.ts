import type { FAQItem } from "@/components/sections/FAQ";

/**
 * Hardcoded FAQ defaults per page key. Editors can override these
 * through Sanity's `faqPage` documents (see schema). The fetch
 * helper in this file prefers the Sanity doc when one exists, and
 * falls back to these defaults when it doesn't — so every page
 * always has FAQ content even before editors touch the CMS.
 */
export type FaqPageKey =
  | "quartz"
  | "granites"
  | "semi-precious"
  | "exotic"
  | "integra"
  | "centrepiece-couture"
  | "facades-and-finishes"
  | "vanity"
  | "sustainability"
  | "about";

export const FAQ_DEFAULTS: Record<FaqPageKey, FAQItem[]> = {
  quartz: [
    {
      q: "What is engineered quartz?",
      a: "Engineered quartz is a man-made surface composed of approximately 93% natural quartz crystals bound with high-grade polymer resins and pigments. Pacific manufactures every slab in-house under Italian-engineered presses, giving you consistent colour, density, and pattern from one slab to the next — something natural stone can never guarantee.",
    },
    {
      q: "Is quartz heat-resistant?",
      a: "Quartz handles everyday cooking heat — hot pans straight off the stove, baking trays out of the oven — but extreme thermal shock from a flame or red-hot cookware can cause discolouration. We recommend using a trivet or heat pad for sustained high heat, just as you would with any premium surface.",
    },
    {
      q: "How is quartz different from granite?",
      a: "Granite is 100% natural stone, quarried as-is, with unique veining and colour variation across every slab. Quartz is engineered, so colours and patterns are repeatable across hundreds of slabs — ideal for large or matched installations. Granite has a more organic look; quartz offers consistency, lower porosity, and easier maintenance.",
    },
    {
      q: "What sizes do Pacific quartz slabs come in?",
      a: 'Standard slabs are 137" x 65" (≈3480 x 1650 mm), with thicknesses of 12 mm, 20 mm, and 30 mm. The 137" jumbo format reduces the number of joints needed on long countertops and feature walls. Custom dimensions are available on indent orders.',
    },
    {
      q: "How do I clean and maintain quartz?",
      a: "Daily cleaning is warm water and mild soap. For stubborn marks, use a non-abrasive cleaner and a soft cloth. Avoid harsh alkaline or acidic chemicals (paint thinners, oven cleaners), and don't use abrasive scouring pads. Quartz is non-porous so it never needs sealing.",
    },
    {
      q: "Where is your quartz manufactured?",
      a: "Every Pacific quartz slab is engineered at our 378,000 sq ft facility in Hosur, India, using Italian production technology. We produce up to 12 million sq ft of quartz annually and ship to more than 45 countries.",
    },
  ],
  granites: [
    {
      q: "How is your granite sourced?",
      a: "We source granite blocks directly from quarries across India and select international sources, then process the blocks at our own facility. Slabs are cut, polished, and finished in-house — meaning tighter quality control and direct traceability from quarry to install.",
    },
    {
      q: "Is granite heat-resistant?",
      a: "Yes — granite handles direct contact with hot cookware better than almost any other countertop material, since it formed under enormous heat geologically. That said, sustained extreme heat or sudden thermal shock can cause hairline fractures over time, so a trivet is still good practice for cast iron straight off the burner.",
    },
    {
      q: "Do I need to seal granite?",
      a: "Granite is naturally porous and benefits from sealing. We pre-seal every slab before shipping, and recommend re-sealing every 1-2 years depending on use. A well-sealed granite countertop resists stains from oil, wine, and citrus.",
    },
    {
      q: "What thicknesses are available?",
      a: "Standard granite slabs ship in 18 mm and 30 mm. The thicker 30 mm option gives a more substantial visual edge profile and is preferred for islands and bar tops. Custom thicknesses are available on indent.",
    },
    {
      q: "How is granite different from quartz?",
      a: "Granite is 100% natural stone with one-of-a-kind veining; quartz is engineered for colour consistency and lower porosity. Granite has more visual movement and warmth; quartz offers repeatable patterns and easier maintenance. Both perform similarly under daily kitchen use — the choice usually comes down to aesthetic preference.",
    },
    {
      q: "How should I clean granite?",
      a: "Wipe with warm water and pH-neutral soap or a stone-safe cleaner. Avoid acidic cleaners (vinegar, lemon, bleach) which can degrade the sealer over time. Reseal every 1-2 years.",
    },
  ],
  "semi-precious": [
    {
      q: "What are semi-precious surfaces?",
      a: "Semi-Precious Stones surfaces are slabs cast from cut and polished pieces of stones like agate, amethyst, tiger's eye, and rose quartz, bound in clear resin and finished to a mirror polish. Each slab is one-of-a-kind — no two arrangements of stone fragments are the same.",
    },
    {
      q: "Are semi-precious surfaces durable?",
      a: "Yes, when used appropriately. They handle daily use well as feature walls, vanity tops, table tops, and reception desks. They're slightly more delicate than engineered quartz under heavy abuse, so we recommend them for accent applications rather than heavy-prep kitchen counters.",
    },
    {
      q: "How are semi-precious slabs made?",
      a: "Hand-laid by artisans, slab by slab. Stone fragments are sorted by colour and size, arranged by hand for visual flow, then cast in clear UV-stable resin. Once cured, the slab is calibrated, polished, and quality-checked. Each slab takes 7-10 days to produce.",
    },
    {
      q: "Where can semi-precious slabs be used?",
      a: "Best uses: feature walls, bar tops, reception desks, vanity counters, table tops, headboards, and lit display panels (the resin allows light to glow through translucent stones like agate and rose quartz).",
    },
    {
      q: "What stones are available?",
      a: "Common selections include white quartz, rose quartz, smoky quartz, amethyst, tiger's eye, agate (multiple colours), petrified wood, jasper, and various marble blends. Custom blends and bespoke slabs can be commissioned.",
    },
  ],
  exotic: [
    {
      q: 'What makes a slab "exotic"?',
      a: "The Exotic Collection is our curated range of dramatic engineered quartz designs that push beyond conventional marble looks — bold veining, unusual base tones (deep blacks, warm taupes, blush pinks), and patterns that feel sculpted rather than printed.",
    },
    {
      q: "Is each Exotic slab unique?",
      a: "Within a single design, slabs are highly consistent (that's the strength of engineered quartz). Between designs, every Exotic style is its own distinct pattern. We recommend pairing the design name to your spec to guarantee match across multiple slabs.",
    },
    {
      q: "Are Exotic designs heat- and stain-resistant?",
      a: "Yes — they share the same engineered-quartz body as our standard line, with the same daily-use durability profile. Use a trivet for sustained high heat; daily care is warm water and mild soap.",
    },
    {
      q: "What's the price difference vs standard quartz?",
      a: "Exotic designs sit slightly above the standard quartz range due to more complex pattern engineering and pigment formulations. Talk to your dealer or contact us for current pricing in your region.",
    },
  ],
  integra: [
    {
      q: "What are Integra sinks made of?",
      a: "Integra sinks are cast from the same engineered quartz body as our countertops, in matching or contrasting colours. They're designed to integrate seamlessly with the surrounding countertop — when matched, they look like a single continuous surface.",
    },
    {
      q: "Are Integra sinks fully integrated with the countertop?",
      a: "Yes. The sink is bonded directly into the countertop opening with a colour-matched seam that all but disappears once polished. There's no rim, no drop-in lip, no metal — just a clean continuous surface from worktop to bowl.",
    },
    {
      q: "What sizes are available?",
      a: "Single-bowl, double-bowl, and butler/farmhouse formats in standard kitchen and vanity sizes. Custom sizes are possible on indent for bespoke projects.",
    },
    {
      q: "How are Integra sinks installed?",
      a: "Installation should be done by a qualified fabricator. The sink slots into a cutout in the countertop and is bonded with structural adhesive plus a colour-matched seam. Allow ~24 hours of cure time before connecting plumbing.",
    },
    {
      q: "How do I clean an Integra sink?",
      a: "Daily warm water and mild soap. For mineral build-up, use a stone-safe limescale remover. Avoid abrasive scouring pads, harsh acid cleaners, and bleach left to soak — the same care rules as your countertop.",
    },
  ],
  vanity: [
    {
      q: "Why a quartz vanity over natural stone?",
      a: "Engineered quartz is non-porous, so it shrugs off water marks, toothpaste spills, cosmetic stains, and the daily abuse a bathroom counter takes. Natural stone in the bath looks beautiful but needs sealing and periodic re-sealing; an Integra vanity in quartz is essentially zero-maintenance for the same finished look.",
    },
    {
      q: "Can the vanity top be made as a single piece?",
      a: "Yes — Pacific slabs are 79 inches wide and 137 inches long, which covers single- and double-bowl vanities up to that size in one continuous piece with no joints. Larger or unusually shaped vanities use a colour-matched seam at the basin centre, which all but disappears once polished.",
    },
    {
      q: "Are integrated sinks available with the vanity tops?",
      a: "Yes. Pacific Integra sinks are cast from the same engineered quartz body as the vanity top and bonded directly into the cutout. The result is a single seamless surface from worktop to bowl — no rim, no joint, no metal. Perfect for a clean, contemporary bath.",
    },
    {
      q: "What thicknesses are available?",
      a: "Standard 18 mm and 30 mm tops, with the 30 mm option offering a more substantial visual presence (especially for vanities with no apron or backsplash). Mitered edges to simulate even thicker profiles are available on request.",
    },
    {
      q: "How is the vanity cared for day-to-day?",
      a: "Warm water and mild soap for daily wipe-downs. For build-up around taps, use a pH-neutral stone cleaner. Avoid bleach, oven cleaners, and abrasive scouring pads. Pacific quartz tolerates the everyday products in a bathroom — toothpaste, shampoo, perfume, lotions — without staining or etching.",
    },
  ],
  "centrepiece-couture": [
    {
      q: "What is the Centrepiece Couture collection?",
      a: "Centrepiece Couture is our bespoke line of dining tables, coffee tables, and statement furniture pieces in semi-precious surfaces, exotic quartz, and rare natural stones. Each piece is designed and made-to-order, with options for base finishes, sizes, and stone selection.",
    },
    {
      q: "Can I commission a custom design?",
      a: "Yes. Send us your dimensions, intended use, and aesthetic direction, and our design team will propose 2-3 stone + base configurations. Custom commissions typically take 8-12 weeks from approval to delivery.",
    },
    {
      q: "What's the lead time?",
      a: "Stock pieces ship within 2-3 weeks. Custom commissions take 8-12 weeks depending on stone availability and base fabrication.",
    },
    {
      q: "How do I care for a Centrepiece table?",
      a: "Use coasters under hot or wet items as a precaution, even though most stones are highly heat- and moisture-resistant. Daily cleaning is warm water and mild soap. Avoid acidic cleaners which can dull the polish over time.",
    },
  ],
  "facades-and-finishes": [
    {
      q: "What finishes are available?",
      a: "We offer Polished (mirror-bright reflection), Honed (matte velvet smooth), Leathered (textured natural touch), Brushed (subtle directional grain), and Flamed (rough, slip-resistant — outdoor use). Each finish is applied at our facility under controlled conditions.",
    },
    {
      q: "How do polished, honed, and leathered finishes differ visually?",
      a: "Polished is the most reflective and shows the stone's full colour saturation — best for indoor use where you want maximum visual impact. Honed is matte and softens the colour, hiding fingerprints and water marks well — popular for bathrooms. Leathered adds a tactile texture, hides smudges entirely, and gives a more organic feel — popular for kitchen islands and outdoor.",
    },
    {
      q: "Does the finish affect maintenance?",
      a: "Slightly. Polished surfaces show watermarks and fingerprints faster but wipe clean instantly. Honed and leathered hide marks longer but require slightly more care to clean deep into the texture. All finishes use the same cleaning routine: warm water + pH-neutral soap.",
    },
    {
      q: "Can the same stone be ordered in different finishes?",
      a: "Yes — most stones in our catalogue can be supplied in any of our standard finishes. Specify the finish at order time. Mixing finishes within a single project (e.g. polished countertop, honed splashback) is a popular design move.",
    },
  ],
  sustainability: [
    {
      q: "Are Pacific Surfaces eco-friendly?",
      a: "We've built sustainability into the manufacturing process from the ground up. Our facility recycles 100% of process water, runs partly on solar power, and uses post-industrial recycled glass and stone in our Ecosurfaces line. We're working toward zero-waste-to-landfill across the operation.",
    },
    {
      q: "What sustainability certifications do you hold?",
      a: "Pacific Surfaces is Greenguard Gold certified for low-emission indoor air quality, and our facility is ISO 14001 certified for environmental management. Specific product lines hold additional certifications — ask for the certificate pack relevant to your project.",
    },
    {
      q: "Is your manufacturing water-recycled?",
      a: "Yes — 100% of process water is captured, treated, and reused in a closed-loop system. We discharge zero industrial water to municipal systems.",
    },
    {
      q: "Can Pacific products be recycled at end of life?",
      a: "Engineered quartz is difficult to recycle in domestic municipal systems but can be returned to industrial recyclers as construction aggregate. Granite is fully reusable and recyclable. Our Ecosurfaces line is itself made from up to 80% recycled content.",
    },
    {
      q: "How do you source raw materials sustainably?",
      a: "We source quartz crystals from suppliers audited for responsible mining practices, prioritise India-quarried granite to minimise shipping miles, and partner with glass recyclers to feed our Ecosurfaces line. Annual supplier audits cover labour, environmental, and traceability standards.",
    },
  ],
  about: [
    {
      q: "Where are Pacific Surfaces manufactured?",
      a: "All Pacific products are engineered at our 378,000 sq ft facility in Hosur, Tamil Nadu, India. The facility uses Italian-engineered presses and runs end-to-end manufacturing — from raw quartz processing to slab finishing — under one roof.",
    },
    {
      q: "How long has Pacific been operating?",
      a: "Pacific Surfaces was established in 2011. Over the past 13+ years we've grown from a regional Indian supplier into a global brand shipping to more than 45 countries with 273+ unique designs across 44 collections.",
    },
    {
      q: "What's your annual production capacity?",
      a: "12 million sq ft of engineered quartz and 4.8 million sq ft of granite per year, alongside our specialty lines (Integra sinks, semi-precious surfaces, Centrepiece Couture).",
    },
    {
      q: "How many countries do you ship to?",
      a: "45+ and growing. Major markets include the Middle East, Europe, North America, Australia, and Southeast Asia, in addition to our home market in India.",
    },
    {
      q: "Where can I see Pacific products in person?",
      a: "Through our authorised dealer network across India, the US, Europe, and the Middle East. Use the contact form to request your nearest dealer, or book a visit to our Hosur facility for spec-room walkthroughs.",
    },
  ],
};

/**
 * Fetch FAQs for a page. Prefers a Sanity `faqPage` document with
 * matching `pageKey`; falls back to the hardcoded defaults above.
 *
 * Server-only — call from RSC `page.tsx` files.
 */
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";

const faqByKeyQuery = groq`*[_type == "faqPage" && pageKey == $key][0]{
  questions[]{ q, a }
}`;

export async function getFaqs(key: FaqPageKey): Promise<FAQItem[]> {
  try {
    const doc = await client.fetch<{ questions: FAQItem[] | null } | null>(
      faqByKeyQuery,
      { key }
    );
    if (doc?.questions && doc.questions.length > 0) return doc.questions;
  } catch {
    /* network or schema error — fall through to defaults */
  }
  return FAQ_DEFAULTS[key] ?? [];
}
