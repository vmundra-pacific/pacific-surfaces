import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { LearnTextSection } from "@/components/sections/LearnTextSection";

// Per-product CTA destinations. Used by deriveCta() to resolve where
// a what-is / maintenance / warranty page's "Browse" button routes.
const PRODUCT_CTA: Record<string, { href: string; label: string }> = {
  quartz: { href: "/products/quartz", label: "Browse Quartz" },
  granites: { href: "/products/granites", label: "Browse Granites" },
  "semi-precious": {
    href: "/products/semi-precious",
    label: "Browse Semi-Precious Stones",
  },
  vision: { href: "/products/quartz/chromia", label: "Browse Vision" },
  "facades-and-finishes": {
    href: "/products/facades-and-finishes",
    label: "Browse Beyond Finish",
  },
  "centrepiece-couture": {
    href: "/products/centrepiece-couture",
    label: "Browse Centrepiece Couture",
  },
  exotic: { href: "/products/exotic", label: "Browse Exotic" },
  vanity: { href: "/products/vanity", label: "Browse Vanity" },
};

// Per-space CTA destinations for inspiration / projects / browse stubs.
const SPACE_CTA: Record<string, { href: string; label: string }> = {
  kitchens: { href: "/spaces/kitchens", label: "Explore Kitchens" },
  bathrooms: { href: "/spaces/bathrooms", label: "Explore Bathrooms" },
  architecture: {
    href: "/spaces/architecture",
    label: "Explore Architecture",
  },
  commercial: { href: "/spaces/commercial", label: "Explore Commercial" },
};

/**
 * Resolve the bottom-CTA destination + label for a given topic slug.
 * Pages drive users back to the product or space they were reading
 * about rather than to the generic /products catalogue.
 */
function deriveCta(topic: string): { href: string; label: string } {
  for (const prefix of ["what-is-", "maintenance-", "warranty-"]) {
    if (topic.startsWith(prefix)) {
      const slug = topic.slice(prefix.length);
      if (PRODUCT_CTA[slug]) return PRODUCT_CTA[slug];
    }
  }
  for (const space of ["kitchens", "bathrooms", "architecture", "commercial"]) {
    if (
      topic === `${space}-inspiration` ||
      topic === `${space}-projects` ||
      topic === `browse-${space}`
    ) {
      return SPACE_CTA[space];
    }
  }
  return { href: "/products", label: "Browse all products" };
}

/**
 * /learn/[topic] — long-form topic content.
 *
 * Topics covered:
 *   - what-is-<slug>          (8 — one per product line)
 *   - maintenance-<slug>      (8 — care guide per product line)
 *   - warranty-quartz         (only Pacific Quartz has the lifetime warranty)
 *   - kitchens/bathrooms/architecture/commercial-inspiration/-projects
 *   - design-notes
 *   - browse-<space>
 *
 * Each entry can carry an optional `body` array of content sections;
 * the page renders those as alternating left/right blocks with image
 * placeholders. Topics without `body` fall back to the short
 * placeholder card so unknown URLs never 404.
 */

interface Params {
  topic: string;
}

interface TopicSection {
  heading: string;
  content: string;
  imageLabel: string;
}

interface TopicCopy {
  title: string;
  eyebrow: string;
  description: string;
  body?: TopicSection[];
}

const TOPIC_COPY: Record<string, TopicCopy> = {
  // ────────────────────────────────────────────────────────────────
  // Material 101 — "What is <Product>?" pages
  // ────────────────────────────────────────────────────────────────
  "what-is-quartz": {
    title: "What is Mineral infused low silica surface?",
    eyebrow: "Material 101 · Mineral infused low silica surface",
    description:
      "Mineral infused low silica surface combines roughly 90% natural quartz minerals with high-performance polymer resin and pigments. The result is a non-porous, low-maintenance, durable surface that ships in larger formats than natural stone allows.",
    body: [
      {
        heading: "Material composition",
        content:
          "Pacific quartz starts with crushed natural quartz crystals — among the hardest minerals on earth, second only to diamond on the Mohs scale. The crystals are bound with high-performance polymer resins and tinted with mineral pigments to produce slabs of consistent colour, density, and pattern. Roughly 90% of the slab by weight is natural quartz; the remaining 10% is the binding system that gives engineered quartz its non-porous, low-maintenance character.",
        imageLabel: "Quartz aggregate",
      },
      {
        heading: "Manufacturing",
        content:
          "Every Pacific slab is engineered in-house at our 378,000 sq ft facility in Hosur, India, using Italian production technology. Raw quartz is mixed with resin and pigment, vibro-compacted under vacuum to remove air pockets, cured at high temperature, then calibrated and polished to a mirror finish. The result is dimensional consistency natural stone can never guarantee — slabs that match across an entire run, ideal for kitchens with long worktops or installations spanning multiple slabs.",
        imageLabel: "Pacific manufacturing line",
      },
      {
        heading: "Performance",
        content:
          "Engineered quartz is non-porous, so it doesn't absorb stains, doesn't need sealing, and resists the bacterial growth natural stone is occasionally vulnerable to. Daily cleaning is mild soap and water. Quartz handles everyday cooking heat well, but extreme thermal shock — a red-hot pan straight off the stove — can cause discolouration; a trivet remains good practice. The surface is highly scratch-resistant and holds its polish indefinitely.",
        imageLabel: "Performance surface",
      },
      {
        heading: "Where Pacific quartz lives",
        content:
          "Specified for kitchen worktops and islands, vanity tops, feature walls, reception desks, bar tops, and any high-traffic surface where consistency, durability, and ease of maintenance matter. Pacific's super-jumbo formats (137″ × 65″) reduce joints on long runs, making quartz the engineered surface of choice for galley kitchens, hospitality counters, and continuous wall cladding.",
        imageLabel: "Quartz kitchen install",
      },
    ],
  },

  "what-is-granites": {
    title: "What is Granite?",
    eyebrow: "Material 101 · Granite",
    description:
      "Granite is an igneous stone formed deep underground over millions of years. Each slab is one-of-a-kind, with naturally occurring patterns of feldspar, mica, and quartz. Granite is heat-, scratch- and stain-resistant when properly sealed.",
    body: [
      {
        heading: "Geological origin",
        content:
          "Granite forms deep within the earth's crust as molten magma cools slowly over millions of years. Mineral crystals — feldspar, mica, quartz, and trace amphibole — interlock as the rock solidifies, producing the speckled and veined patterns that make every slab unique. No two granite slabs are alike; pattern and colour vary across a single quarry block.",
        imageLabel: "Granite quarry block",
      },
      {
        heading: "Quarrying and finishing",
        content:
          "Pacific sources granite blocks directly from quarries across India and selected international sources. Blocks are cut into slabs at our own facility, then polished, honed, leathered, or flame-finished depending on the surface treatment specified. Finishing in-house gives us tighter quality control and direct traceability from quarry to install.",
        imageLabel: "Slab cutting & finishing",
      },
      {
        heading: "Performance",
        content:
          "Granite handles direct contact with hot cookware better than almost any other countertop material — it formed under enormous heat geologically. It's naturally porous, so we pre-seal every slab before shipping; resealing every 1–2 years preserves stain resistance against oil, wine, and citrus. With proper care, granite outlasts the room it's installed in.",
        imageLabel: "Performance test",
      },
      {
        heading: "Where granite shines",
        content:
          "The kitchen island where its one-of-one veining anchors the room. Bar tops and reception desks where the visual movement is the design moment. Exterior cladding where its geological durability outlasts engineered alternatives. Pacific granite is specified for residential, hospitality, and commercial projects where natural character matters.",
        imageLabel: "Granite island",
      },
    ],
  },

  "what-is-semi-precious": {
    title: "What is Semi-Precious Stones?",
    eyebrow: "Material 101 · Semi-Precious Stones",
    description:
      "Semi-Precious Stones surfaces are composed of carefully selected gemstone fragments — agate, amethyst, malachite, tiger's eye — bound into translucent slabs that backlight beautifully and behave like a featured gallery piece.",
    body: [
      {
        heading: "Composition",
        content:
          "Slabs are cast from cut and polished pieces of semi-precious stones — agate, amethyst, tiger's eye, rose quartz, jasper, malachite — bound in clear UV-stable resin and finished to a mirror polish. Each slab is one-of-a-kind because no two arrangements of stone fragments are ever identical. The translucent stones (rose quartz, agate) glow when backlit.",
        imageLabel: "Gemstone fragments",
      },
      {
        heading: "Hand-laid craft",
        content:
          "Every slab is laid by hand. Stone fragments are sorted by colour and size, arranged for visual flow and bookmatched continuity across the slab, then cast in clear resin. Once cured, the slab is calibrated, polished, and quality-checked. A single slab takes 7–10 days to produce — closer to studio art than industrial fabrication.",
        imageLabel: "Hand-laying process",
      },
      {
        heading: "Where to use it",
        content:
          "Best as feature surfaces rather than heavy-prep counters: feature walls, bar tops, reception desks, vanity counters, table tops, headboards, and lit display panels. The translucent stones in particular allow light to glow through, making semi-precious surfaces a popular choice for back-lit feature walls in hospitality and high-end residential.",
        imageLabel: "Lit feature wall",
      },
    ],
  },

  "what-is-vision": {
    title: "What is Eclipse?",
    eyebrow: "Material 101 · Eclipse",
    description:
      "Eclipse is Pacific's inlayered design quartz line — patterns and motifs engineered into the surface itself, so the design lives all the way through the slab rather than sitting only on top. Available within the Chromia collection.",
    body: [
      {
        heading: "Inlayered design",
        content:
          "Eclipse slabs are built up in layers during the engineered quartz manufacturing process. Pigments and aggregates are placed in specific patterns through the slab's depth — so when the slab is cut, profiled, or mitred, the design continues across the cut face.",
        imageLabel: "Inlayered cross-section",
      },
      {
        heading: "Pattern engineering",
        content:
          "Each Eclipse design is engineered as a repeating motif at a specific scale. Linear flow, geometric accents, painted-edge gradients — patterns inspired by textile, terrazzo, and brutalist architecture, executed in quartz. The design holds across the entire slab and bookmatches predictably for long runs.",
        imageLabel: "Eclipse pattern detail",
      },
      {
        heading: "Where Eclipse lives",
        content:
          "Specified by designers when the surface should be the visual focus rather than a quiet background. Feature walls, statement islands, bookmatched panels, bar tops, and oversized vanities where the pattern can be seen at scale. Eclipse sits within the Chromia collection — Pacific's design-forward quartz line.",
        imageLabel: "Eclipse install",
      },
    ],
  },

  "what-is-facades-and-finishes": {
    title: "What are Beyond Finish?",
    eyebrow: "Material 101 · Beyond Finish",
    description:
      "Beyond Finish are large-format surface panels that bring authentic stone character to walls, facades, and feature areas without the weight or thickness penalty of full slabs.",
    body: [
      {
        heading: "The product range",
        content:
          "Pacific Beyond Finish covers a portfolio of surface treatments — polished, honed, leathered, brushed, flamed, sandblasted — across our quartz and granite collections. Each finish changes the way light reads on the surface, the way it feels under the hand, and how it weathers. The catalogue is designed to give specifiers a single library to draw from.",
        imageLabel: "Finish samples",
      },
      {
        heading: "Architectural use",
        content:
          "Engineered for facade cladding, large-format wall panels, lobbies, and feature surfaces where the visual expectation is monolithic. Panels arrive in dimensions large enough to read as a single uninterrupted plane, with joint detailing minimised through bookmatching and continuous-fall installation patterns.",
        imageLabel: "Facade install",
      },
      {
        heading: "Specification",
        content:
          "Available in standard exterior thicknesses with substrate-matched fixings, or as adhered cladding for interior wall applications. UV-stable, thermally tolerant, and rated for exterior weathering across the climates Pacific ships to. Specification samples and project-grade detailing are available through the Pacific specification team.",
        imageLabel: "Spec detailing",
      },
    ],
  },

  "what-is-centrepiece-couture": {
    title: "What is Centrepiece Couture?",
    eyebrow: "Material 101 · Centrepiece Couture",
    description:
      "Centrepiece Couture is Pacific's gallery-grade slab line — singular, dramatically veined surfaces specified by designers when the slab itself is the brief.",
    body: [
      {
        heading: "Gallery-grade slabs",
        content:
          "Centrepiece Couture is Pacific's most ambitious quartz line — slabs engineered with the character of natural stone but the consistency and scale of engineered surface. Each design pushes vein structure, base tone, and movement to the edge of what engineered quartz can do, intended for surfaces where the slab is the room's design centrepiece.",
        imageLabel: "Couture slab",
      },
      {
        heading: "Specifying a centrepiece",
        content:
          "Each Centrepiece design is highly consistent within itself — slabs match for long-run installations and bookmatch reliably. Between designs, every Centrepiece style is its own distinct pattern. Pair the design name to your specification to guarantee match across multiple slabs and across replenishment orders.",
        imageLabel: "Bookmatched pair",
      },
      {
        heading: "Where it lives",
        content:
          "Hotel lobbies, high-end residential islands, restaurant feature walls, statement bathroom vanities, lit dining surfaces. Centrepiece is specified when a quiet quartz tone won't do — when the surface needs to anchor the room's narrative.",
        imageLabel: "Couture in situ",
      },
    ],
  },

  "what-is-exotic": {
    title: "What is the Exotic Collection?",
    eyebrow: "Material 101 · Exotic",
    description:
      "The Exotic Collection brings together our rarest surfaces — limited-run slabs hand-picked for unusual veining, tone, or movement that catalogue product can't match.",
    body: [
      {
        heading: "What makes a slab exotic",
        content:
          "The Exotic Collection is our curated range of dramatic quartz designs that push beyond conventional marble looks — bold veining, unusual base tones (deep blacks, warm taupes, blush pinks), and patterns that feel sculpted rather than printed. Limited-run, hand-picked, and specified for projects where standard catalogue product doesn't go far enough.",
        imageLabel: "Exotic slab detail",
      },
      {
        heading: "Performance",
        content:
          "Exotic designs share the same engineered-quartz body as Pacific's standard line — same daily-use durability profile, same heat and stain resistance, same care regime. Use a trivet for sustained high heat; daily care is warm water and mild soap. The aesthetic is the differentiator, not the performance.",
        imageLabel: "Exotic surface test",
      },
      {
        heading: "Specifying exotic",
        content:
          "Within a single design, slabs match consistently — pair the design name to your specification to guarantee match across slabs. Exotic designs sit slightly above the standard quartz range due to more complex pattern engineering and pigment formulations. Talk to your dealer or contact us for current pricing in your region.",
        imageLabel: "Exotic install",
      },
    ],
  },

  "what-is-vanity": {
    title: "What is Pacific Vanity?",
    eyebrow: "Material 101 · Vanity",
    description:
      "Pacific Vanity is a dedicated bathroom product line — vanity tops fabricated to integrate directly with our quartz sinks, with hand-finished edges and stain resistance built for daily use.",
    body: [
      {
        heading: "Bath-specific design",
        content:
          "Pacific Vanity tops are engineered specifically for the bath — sized to standard and bespoke vanity widths, edge-profiled to detail neatly against wall claddings, and finished to integrate with our Integra quartz sink line. Where standard quartz worktops are cut to kitchen rules, Vanity tops are designed around bathroom geometry.",
        imageLabel: "Vanity top detail",
      },
      {
        heading: "Integra integration",
        content:
          "Vanity tops can be specified with an Integra quartz basin fabricated into the same slab — single material from counter into the bowl, no metal joint, no silicone seam to discolour over time. The result reads as one continuous piece, the standard Pacific approach to bath surfaces.",
        imageLabel: "Integra vanity",
      },
      {
        heading: "Where it lives",
        content:
          "Single and double vanities, powder rooms, hotel bathrooms, spa environments. Pacific Vanity is specified by interior designers when the bath should read as composed and architectural rather than assembled from disparate parts.",
        imageLabel: "Bathroom install",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // Maintenance — one per product line
  // ────────────────────────────────────────────────────────────────
  "maintenance-quartz": {
    title: "Maintenance · Mineral infused low silica surface",
    eyebrow: "Care & Cleaning · Mineral infused low silica surface",
    description:
      "Pacific Mineral infused low silica surface is engineered to be low-maintenance. Day-to-day cleaning is mild soap and water; the surface never needs sealing.",
    body: [
      {
        heading: "Daily care",
        content:
          "Wipe down with warm water and mild dish soap, or any pH-neutral spray cleaner. A soft cloth or non-abrasive sponge is all you need — the polished quartz surface lifts food residue easily. For dried-on marks, let warm soapy water sit for 30–60 seconds before wiping. Quartz never needs sealing or polishing; the finish you see at install is the finish for life.",
        imageLabel: "Daily wipe-down",
      },
      {
        heading: "What to avoid",
        content:
          "Avoid abrasive scouring pads (steel wool, scotch-brite), strong alkaline cleaners (oven cleaner, drain unblocker), and acidic chemicals (paint thinners, bleach concentrate). These can dull the polish over time. Hot pans straight from the stove or oven should always sit on a trivet — quartz is heat-resistant up to about 150°C, but extreme thermal shock can cause discolouration.",
        imageLabel: "Cleaners to avoid",
      },
      {
        heading: "Spills and stains",
        content:
          "Clean spills as soon as you see them, especially turmeric, coffee, red wine, and ink. Quartz is non-porous so spills sit on the surface rather than soaking in, but extended contact with strongly pigmented liquids can leave a tint behind. A soft cloth and warm soapy water clears most marks; a non-abrasive cream cleanser handles stubborn ones.",
        imageLabel: "Spill cleanup",
      },
      {
        heading: "Long-term",
        content:
          "Pacific quartz holds its polish indefinitely under normal residential and commercial use. The surface doesn't need re-polishing or refinishing. If a slab is damaged (chipped or cracked), the affected section can be cut out and replaced or repaired by a Pacific-certified fabricator.",
        imageLabel: "Polished worktop",
      },
    ],
  },

  "maintenance-granites": {
    title: "Maintenance · Granite",
    eyebrow: "Care & Cleaning · Granite",
    description:
      "Granite is naturally porous and benefits from sealing. With proper care it outlasts the room it's installed in.",
    body: [
      {
        heading: "Daily care",
        content:
          "Wipe with warm water and a pH-neutral soap or stone-safe cleaner. Avoid acidic cleaners (vinegar, lemon, bleach) which degrade the sealer over time. A soft cloth or microfibre is fine; a soft sponge handles textured finishes without scuffing. Dry the surface after wiping to prevent water spots on darker granites.",
        imageLabel: "Granite cleaning",
      },
      {
        heading: "Sealing",
        content:
          "Pacific pre-seals every granite slab before shipping. We recommend re-sealing every 1–2 years depending on use and finish — heavy-use kitchen islands need more frequent attention than rarely-touched feature walls. A penetrating stone sealer (sold by Pacific dealers) is applied with a soft cloth, left to absorb for 5–10 minutes, then buffed dry.",
        imageLabel: "Sealing application",
      },
      {
        heading: "Heat and impact",
        content:
          "Granite handles direct hot cookware better than almost any countertop material. That said, sustained extreme heat or sudden thermal shock can cause hairline fractures over time, so a trivet is good practice for cast iron straight off the burner. Granite is hard but not unbreakable — heavy impact at the edge can chip the surface.",
        imageLabel: "Heat test",
      },
      {
        heading: "Spills",
        content:
          "Wipe spills promptly, especially oil, citrus, wine, and coffee. With the sealer intact, granite resists most kitchen spills for the time it takes to clean them. If a stain develops, a poultice (baking soda + water paste, left overnight) draws most pigment back out of the stone. Persistent stains may indicate the sealer needs refreshing.",
        imageLabel: "Stain treatment",
      },
    ],
  },

  "maintenance-semi-precious": {
    title: "Maintenance · Semi-Precious Stones",
    eyebrow: "Care & Cleaning · Semi-Precious Stones",
    description:
      "Semi-Precious Stones surfaces are best treated as gallery pieces — handle with care, clean gently, and they'll keep their gem-like character for decades.",
    body: [
      {
        heading: "Gentle daily care",
        content:
          "Wipe with a soft microfibre and warm water; pH-neutral soap is fine for occasional deeper cleaning. Avoid abrasive cloths or pads — the resin matrix is harder than expected but still scratches under steel wool. The mirror polish is easy to maintain with light cleaning; heavy scouring is unnecessary and counterproductive.",
        imageLabel: "Cleaning a feature surface",
      },
      {
        heading: "What to avoid",
        content:
          "Acidic cleaners (vinegar, citrus-based products), strong solvents (acetone, MEK, paint thinner), and high-pH cleaners (oven cleaner, drain unblocker) can dull the resin over time. Sustained UV exposure for outdoor or south-facing windows is also worth avoiding — UV can yellow some resin systems over years. For backlit installations, choose LED lighting (low UV) over halogen.",
        imageLabel: "What to avoid",
      },
      {
        heading: "Where it works",
        content:
          "Semi-Precious Stones surfaces are best as feature walls, bar tops, vanity counters, and reception desks rather than heavy-prep kitchen counters. They handle daily use well in those applications but are slightly more delicate than engineered quartz under heavy abuse. Specify them where the visual impact matters most.",
        imageLabel: "Feature install",
      },
    ],
  },

  "maintenance-vision": {
    title: "Maintenance · Eclipse",
    eyebrow: "Care & Cleaning · Eclipse",
    description:
      "Eclipse is engineered quartz with a structural pattern — care is identical to standard quartz, with a couple of pattern-specific notes.",
    body: [
      {
        heading: "Daily care",
        content:
          "Same as standard Pacific quartz: wipe with warm water and mild soap, soft cloth, no sealing required. Eclipse's pattern doesn't change the surface chemistry — the same non-porous resin system protects against stains and bacteria, and the same scratch resistance applies. Daily upkeep is intentionally low-effort.",
        imageLabel: "Daily wipe",
      },
      {
        heading: "Pattern integrity",
        content:
          "Eclipse's design lives through the slab's depth — surface scratches that would damage a printed pattern still show the design underneath. That said, abrasive scouring will dull the polish even where the pattern continues, so soft cloths and non-abrasive cleansers remain the rule. Hot pans on a trivet, no exceptions for any quartz.",
        imageLabel: "Pattern detail",
      },
      {
        heading: "Long-term",
        content:
          "Eclipse holds its visual character indefinitely. The pattern is engineered, not printed — there's no top-coat to wear off and no adhered film to peel. The surface looks the same in year ten as it did at install with normal use.",
        imageLabel: "Aged Eclipse install",
      },
    ],
  },

  "maintenance-facades-and-finishes": {
    title: "Maintenance · Beyond Finish",
    eyebrow: "Care & Cleaning · Beyond Finish",
    description:
      "Pacific Beyond Finish covers polished, honed, leathered, brushed, and flamed surfaces — care varies slightly per finish, with shared fundamentals.",
    body: [
      {
        heading: "Polished and honed",
        content:
          "Polished and honed surfaces care the same as standard Pacific quartz or granite. Daily cleaning is warm water and mild soap with a soft cloth. Avoid abrasive pads on polished finishes — they'll dull the mirror reflection. Honed surfaces are slightly more forgiving of micro-marks since the matte finish hides them, but the same gentle cleaning regime applies.",
        imageLabel: "Polished panel",
      },
      {
        heading: "Leathered, brushed, and flamed",
        content:
          "Textured finishes hide fingerprints and minor marks better than polished but trap a little more cleaning residue in the surface texture. A soft natural-bristle brush helps with periodic deep cleans. Avoid coloured cleaning sponges that can leave fibres in the texture. Sealing applies to natural-stone-based panels (granite); engineered-quartz finishes don't need it.",
        imageLabel: "Leathered detail",
      },
      {
        heading: "Exterior considerations",
        content:
          "Facade-installed panels weather predictably under UV and freeze-thaw, but accumulate atmospheric dust like any exterior surface. A pressure wash with plain water on the lowest setting clears most build-up; a stone-safe exterior cleaner handles industrial pollution staining. Don't use acidic cleaners — they degrade the surface and the substrate fixings.",
        imageLabel: "Facade cleaning",
      },
    ],
  },

  "maintenance-centrepiece-couture": {
    title: "Maintenance · Centrepiece Couture",
    eyebrow: "Care & Cleaning · Centrepiece Couture",
    description:
      "Centrepiece Couture is Pacific quartz at its most expressive — care is identical to standard quartz, with extra attention to keeping the polished character intact.",
    body: [
      {
        heading: "Treat the polish carefully",
        content:
          "Centrepiece designs lean on dramatic veining and pigment depth that read best at full polish. Daily care follows standard Pacific quartz rules — warm water, mild soap, soft cloth — but the polish is what carries the visual drama, so avoid abrasive scouring more strictly than you would on a quieter quartz colour. No steel wool, no scotch-brite, no abrasive cream cleansers.",
        imageLabel: "Polished centrepiece",
      },
      {
        heading: "Hot pans on a trivet",
        content:
          "Like all Pacific quartz, Centrepiece is heat-resistant but not heatproof. Sustained extreme heat can cause discolouration that's particularly visible on pale Centrepiece designs. A trivet for cast iron and oven trays preserves the slab's appearance over decades.",
        imageLabel: "Trivet practice",
      },
      {
        heading: "Long-term character",
        content:
          "With standard care Centrepiece retains its full visual impact indefinitely. The surface doesn't need re-polishing or sealing. If a feature slab is damaged in shipping or installation, replacement slabs can be specified back to the original design name and pattern.",
        imageLabel: "Centrepiece in situ",
      },
    ],
  },

  "maintenance-exotic": {
    title: "Maintenance · Exotic",
    eyebrow: "Care & Cleaning · Exotic",
    description:
      "Exotic Collection slabs share Pacific's engineered-quartz body — care is identical to our standard line, with an emphasis on preserving the dramatic pattern.",
    body: [
      {
        heading: "Standard quartz care",
        content:
          "Daily cleaning is warm water and mild soap with a soft cloth. The surface is non-porous and never needs sealing. Avoid abrasive scouring, strong alkaline cleaners, and acidic chemicals. Hot pans on a trivet preserves both the polish and the pigment depth that makes Exotic designs distinctive.",
        imageLabel: "Daily care",
      },
      {
        heading: "Pattern preservation",
        content:
          "Exotic designs use complex pigment formulations to push beyond standard quartz appearance — bold veining, unusual base tones, dramatic movement. The pigments are engineered into the slab's full body so surface wear doesn't reveal a different colour underneath, but the polished finish carries the visual character and benefits from consistent gentle care.",
        imageLabel: "Exotic pattern",
      },
      {
        heading: "Replacement and repair",
        content:
          "Within a single design, Exotic slabs match consistently — pair the design name to your specification to guarantee match across slabs and across replenishment orders. If a slab is damaged, a Pacific-certified fabricator can cut out and replace the affected section, sourcing from the same design name to maintain continuity.",
        imageLabel: "Slab replacement",
      },
    ],
  },

  "maintenance-vanity": {
    title: "Maintenance · Vanity",
    eyebrow: "Care & Cleaning · Vanity",
    description:
      "Pacific Vanity tops are engineered quartz — care is the same as standard quartz, with a couple of bath-specific notes around water and personal-care products.",
    body: [
      {
        heading: "Daily care",
        content:
          "Wipe with warm water and mild soap or any pH-neutral spray cleaner. The non-porous surface lifts splashed soap, toothpaste, and water marks with a soft cloth. Microfibre handles the polished finish well; a soft sponge is fine for textured finishes. No sealing required.",
        imageLabel: "Bath wipe-down",
      },
      {
        heading: "Personal-care products",
        content:
          "Modern personal-care products contain ingredients that are harder on stone surfaces than kitchen spills — toothpaste with whitening agents, hair dye, perfume, nail polish, and acetone-based removers. Wipe these off the vanity surface as soon as you spot them; extended contact with strongly pigmented liquids can leave a tint behind. Acetone splashes specifically should be cleared in seconds, not minutes.",
        imageLabel: "Products to manage",
      },
      {
        heading: "Integra sink upkeep",
        content:
          "If your Pacific Vanity has an integrated Integra quartz sink, the basin cares the same as the surrounding top — non-porous, gentle cleaning, no sealing. The seamless joint between counter and basin means there's no silicone bead to discolour or replace; the whole surface is one continuous piece of stone.",
        imageLabel: "Integra basin",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // Warranty — only Pacific Quartz carries a lifetime warranty
  // ────────────────────────────────────────────────────────────────
  "warranty-quartz": {
    title: "Warranty · Mineral infused low silica surface",
    eyebrow: "Coverage · Mineral infused low silica surface",
    description:
      "Every Pacific Mineral infused low silica surface residential installation is covered by a lifetime limited warranty against manufacturing defects.",
    body: [
      {
        heading: "What's covered",
        content:
          "The Pacific Quartz lifetime warranty covers manufacturing defects in the slab — material flaws, structural inconsistencies, or finish issues that originate at production. Coverage applies for the full lifetime of the original residential installation, transferable to subsequent owners of the property at the time of resale. Commercial installations carry their own bespoke coverage — contact your Pacific dealer for details.",
        imageLabel: "Quartz slab inspection",
      },
      {
        heading: "What's not covered",
        content:
          "Damage from impact, abrasion, extreme heat, acidic or alkaline chemicals, or improper installation falls outside the warranty. Care that ignores Pacific's published maintenance guidance — abrasive cleaners, no trivet for cast iron, prolonged contact with paint stripper — will void coverage on the affected area. Normal wear on edge profiles or finishes used in commercial settings beyond their specified application also falls outside.",
        imageLabel: "Excluded damage",
      },
      {
        heading: "Registering your installation",
        content:
          "Register your installation within 60 days of fabrication completion to activate full lifetime coverage. Registration links the slab's batch number to the property's owner of record, simplifying any future claim process. Registration is free; your Pacific-certified fabricator handles the paperwork on your behalf or you can register directly through the Pacific dealer network.",
        imageLabel: "Registration handover",
      },
      {
        heading: "Claims process",
        content:
          "If you suspect a manufacturing defect, contact your installing fabricator first — most issues are resolved on-site with minor adjustment. If a claim escalates, the fabricator coordinates with Pacific's quality team for inspection. Approved claims result in slab replacement, refinishing, or refund depending on severity, at Pacific's discretion.",
        imageLabel: "Inspection process",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // Spaces mega-menu — Explore <Space> column links
  // ────────────────────────────────────────────────────────────────
  "kitchens-inspiration": {
    title: "Kitchens Inspiration",
    eyebrow: "Inspiration · Kitchens",
    description:
      "Kitchens designed around Pacific surfaces — from heritage homes to contemporary lofts. Worktops, islands, splashbacks, and the way they hold up to daily life.",
  },
  "kitchens-projects": {
    title: "Kitchens Project Gallery",
    eyebrow: "Projects · Kitchens",
    description:
      "Selected kitchen projects featuring Pacific quartz, granite, and semi-precious surfaces. Real installations, real fabricators, real homeowners.",
  },
  "bathrooms-inspiration": {
    title: "Bathrooms Inspiration",
    eyebrow: "Inspiration · Bathrooms",
    description:
      "Bath spaces that read as a single piece — vanity tops fused to sinks, shower trays cut from the same slab, stone wall cladding wrapping the whole room.",
  },
  "bathrooms-projects": {
    title: "Bathrooms Project Gallery",
    eyebrow: "Projects · Bathrooms",
    description:
      "Bathroom installations using Pacific Vanity, Integra sinks, and shower-tray fabrication. Hospitality, residential, and spa projects worldwide.",
  },
  "architecture-inspiration": {
    title: "Architecture Inspiration",
    eyebrow: "Inspiration · Architecture",
    description:
      "Super-jumbo slabs on facades, cladding wrapping curved volumes, large-format panels reading as a single uninterrupted plane.",
  },
  "architecture-projects": {
    title: "Architecture Project Gallery",
    eyebrow: "Projects · Architecture",
    description:
      "Pacific Beyond Finish and large-format Quartz on real architectural projects — facades, feature walls, lobbies, and exterior cladding installations.",
  },
  "commercial-inspiration": {
    title: "Commercial Inspiration",
    eyebrow: "Inspiration · Commercial",
    description:
      "Hospitality, retail, and workspace projects where surfaces have to last a decade of high-traffic use.",
  },
  "commercial-projects": {
    title: "Commercial Project Gallery",
    eyebrow: "Projects · Commercial",
    description:
      "Hotels, restaurants, offices, and retail interiors finished with Pacific surfaces. Specified for durability, finished for design.",
  },
  "design-notes": {
    title: "Design Notes",
    eyebrow: "Specification & Detailing",
    description:
      "Notes from the Pacific design and fabrication teams — edge profiles, joint detailing, slab matching, lighting considerations, and what to flag with your installer before fabrication starts.",
  },

  // ────────────────────────────────────────────────────────────────
  // Browse <Space> bubble CTA stubs (mostly orphaned now since
  // Spaces mega cards link directly to /spaces/<slug>, but kept
  // alive in case external links land here).
  // ────────────────────────────────────────────────────────────────
  "browse-kitchens": {
    title: "Browse Kitchens",
    eyebrow: "Browse · Kitchens",
    description:
      "Surfaces, sinks, and design ideas for the kitchen. The full Kitchens browser is being built. In the meantime, this stub keeps the link target live.",
  },
  "browse-bathrooms": {
    title: "Browse Bathrooms",
    eyebrow: "Browse · Bathrooms",
    description:
      "Vanities, sinks, shower trays, and wall cladding for the bath. The full Bathrooms browser is being built — until it goes live, our team can talk you through specifics.",
  },
  "browse-architecture": {
    title: "Browse Architecture",
    eyebrow: "Browse · Architecture",
    description:
      "Facades, large-format cladding, feature walls, and floor panels. The full Architecture browser is being built — talk to our specifications team for project-grade detailing in the meantime.",
  },
  "browse-commercial": {
    title: "Browse Commercial",
    eyebrow: "Browse · Commercial",
    description:
      "Hospitality, retail, and workspace surfaces specified for high-traffic environments. The full Commercial browser is being built — our team can pull samples and project references on request.",
  },
};

const FALLBACK: TopicCopy = {
  title: "Coming soon",
  eyebrow: "Pacific Surfaces",
  description:
    "We're working on this section. Reach out to our team if you'd like specifics ahead of the page going live.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { topic } = await params;
  const known = topic in TOPIC_COPY;
  const copy = TOPIC_COPY[topic] ?? FALLBACK;
  return {
    title: `${copy.title} — Pacific Surfaces`,
    description: copy.description,
    alternates: { canonical: `/learn/${topic}` },
    // Unknown topics render the "Coming soon" fallback — a soft-404.
    // Without noindex, any arbitrary /learn/<garbage> URL gets a
    // self-canonical and ends up in Google's index.
    ...(known ? {} : { robots: { index: false, follow: false } }),
  };
}

export default async function LearnTopicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { topic } = await params;
  const copy = TOPIC_COPY[topic] ?? FALLBACK;
  const cta = deriveCta(topic);

  return (
    <>
      <PageHeader
        badge={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      {copy.body && copy.body.length > 0 ? (
        // All topics render text-only with Framer Motion scroll-triggered
        // entrances — what-is, maintenance, and warranty share the same
        // editorial cadence, no image column on any of them.
        copy.body.map((section, i) => (
          <LearnTextSection
            key={i}
            heading={section.heading}
            content={section.content}
            index={i}
          />
        ))
      ) : (
        // Short topics + fallback — original placeholder card
        <section className="py-16 md:py-24 px-6">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8 sm:p-10">
              <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-stone-500 mb-4">
                [ placeholder content ]
              </p>
              <p className="text-base font-light text-stone-700 leading-relaxed">
                Long-form editorial copy for this section is being written. In
                the meantime, this stub keeps the link target live so the
                navigation and mega-menu paths all resolve.
              </p>
              <p className="mt-4 text-base font-light text-stone-700 leading-relaxed">
                Need answers right now? The Pacific team can talk you through
                specifics over a call or WhatsApp.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3 bg-stone-900 text-white text-xs font-medium tracking-[0.2em] uppercase hover:bg-stone-800 transition-colors"
                >
                  Talk to us
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={cta.href}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3 border border-stone-300 text-stone-900 text-xs font-medium tracking-[0.2em] uppercase hover:bg-stone-100 transition-colors"
                >
                  {cta.label}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Closing CTA — always shown after body or placeholder */}
      <section className="py-16 md:py-20 px-6 bg-[#0d1f29]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-base sm:text-lg font-light text-stone-300 leading-relaxed mb-8 max-w-xl mx-auto">
            Need specifics for your project, or want a sample? The Pacific team
            can talk you through everything over a call or WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 bg-white text-stone-900 text-xs font-medium tracking-[0.2em] uppercase hover:bg-stone-100 transition-colors"
            >
              Talk to us
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href={cta.href}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 border border-white/30 text-white text-xs font-medium tracking-[0.2em] uppercase hover:bg-white/10 transition-colors"
            >
              {cta.label}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
