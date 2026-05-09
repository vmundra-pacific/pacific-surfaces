import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

/**
 * /learn/[topic] — placeholder topic stub.
 *
 * Fanned-out from each category's /products/[slug]/about page. Six
 * topic shapes the mega-menu touches today:
 *   - what-is-<slug>          (e.g. what-is-quartz)
 *   - maintenance
 *   - warranty
 *   - kitchen-countertops
 *   - kitchen-sinks
 *
 * Anything not in TOPIC_COPY falls through to a generic placeholder so
 * unknown URLs never 404 (editorial team is going to add new topics
 * faster than we can wire dedicated pages — keep the door open).
 */

interface Params {
  topic: string;
}

const TOPIC_COPY: Record<
  string,
  { title: string; eyebrow: string; description: string }
> = {
  "what-is-quartz": {
    title: "What is Quartz?",
    eyebrow: "Material 101 · Quartz",
    description:
      "Engineered quartz combines roughly 90% natural quartz minerals with high-performance polymer resin and pigments. The result is a non-porous, low-maintenance, durable surface that ships in larger formats than natural stone allows.",
  },
  "what-is-granites": {
    title: "What is Granite?",
    eyebrow: "Material 101 · Granite",
    description:
      "Granite is an igneous stone formed deep underground over millions of years. Each slab is one-of-a-kind, with naturally occurring patterns of feldspar, mica, and quartz. Granite is heat-, scratch- and stain-resistant when properly sealed.",
  },
  "what-is-semi-precious": {
    title: "What is Semi-Precious Stone?",
    eyebrow: "Material 101 · Semi-Precious",
    description:
      "Semi-precious surfaces are composed of carefully selected gemstone fragments — agate, amethyst, malachite, tiger's eye — bound into translucent slabs that backlight beautifully and behave like a featured gallery piece.",
  },
  "what-is-natural-stone-finishes": {
    title: "What are Natural Stone Finishes?",
    eyebrow: "Material 101 · Natural Stone Finishes",
    description:
      "Natural Stone Finishes are large-format surface panels that bring authentic stone character to walls, facades, and feature areas without the weight or thickness penalty of full slabs.",
  },
  "what-is-centrepiece-couture": {
    title: "What is Centrepiece Couture?",
    eyebrow: "Material 101 · Centrepiece Couture",
    description:
      "Centrepiece Couture is Pacific's gallery-grade slab line — singular, dramatically veined surfaces specified by designers when the slab itself is the brief.",
  },
  "what-is-vision": {
    title: "What is Vision?",
    eyebrow: "Material 101 · Vision",
    description:
      "Vision is Pacific's inlayered design quartz line — patterns and motifs engineered into the surface itself, so the design lives all the way through the slab rather than sitting only on top. Available within the Chromia collection.",
  },
  "what-is-exotic": {
    title: "What is the Exotic Collection?",
    eyebrow: "Material 101 · Exotic",
    description:
      "The Exotic Collection brings together our rarest surfaces — limited-run slabs hand-picked for unusual veining, tone, or movement that catalogue product can't match.",
  },
  "what-is-vanity": {
    title: "What is Pacific Vanity?",
    eyebrow: "Material 101 · Vanity",
    description:
      "Pacific Vanity is a dedicated bathroom product line — vanity tops fabricated to integrate directly with our quartz sinks, with hand-finished edges and stain resistance built for daily use.",
  },
  maintenance: {
    title: "Maintenance",
    eyebrow: "Care & Cleaning",
    description:
      "Pacific surfaces are engineered to be low-maintenance. Day-to-day cleaning is mild soap and water; avoid abrasive pads, harsh solvents, and high-pH cleaners. Hot pans should always go on a trivet — quartz is heat-resistant, not heatproof.",
  },
  warranty: {
    title: "Warranty",
    eyebrow: "Coverage",
    description:
      "Every Pacific Surfaces installation is covered by a 25-year residential limited warranty against manufacturing defects. Register your installation within 60 days to activate full coverage. Commercial coverage available on request.",
  },
  "kitchen-countertops": {
    title: "Kitchen Countertops",
    eyebrow: "Application · Kitchen",
    description:
      "Specifying Pacific surfaces for kitchen worktops — slab thickness options, edge profiles, mitre options, and how to coordinate fabrication with your installer.",
  },
  "kitchen-sinks": {
    title: "Kitchen Sinks",
    eyebrow: "Application · Integra Sinks",
    description:
      "Integra quartz sinks fabricate seamlessly into Pacific worktops — single material from countertop into the basin, no metal joint, no silicone seam to discolour over time.",
  },

  // ────────────────────────────────────────────────────────────────
  // Spaces mega-menu — "Explore <Space>" column links.
  // Inspiration / Project Gallery per room type, plus the shared
  // Design Notes link. Pattern matches the Products mega: each link
  // resolves to a stub here so the dropdown nav always lands on a
  // properly-titled page rather than the generic FALLBACK.
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
      "Super-jumbo slabs on facades, cladding wrapping curved volumes, large-format panels reading as a single uninterrupted plane. Architectural surfaces beyond the kitchen.",
  },
  "architecture-projects": {
    title: "Architecture Project Gallery",
    eyebrow: "Projects · Architecture",
    description:
      "Pacific Natural Stone Finishes and large-format Quartz on real architectural projects — facades, feature walls, lobbies, and exterior cladding installations.",
  },
  "commercial-inspiration": {
    title: "Commercial Inspiration",
    eyebrow: "Inspiration · Commercial",
    description:
      "Hospitality, retail, and workspace projects where surfaces have to last a decade of high-traffic use. Reception desks, bar tops, restaurant countertops, and feature walls.",
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
  // Spaces mega-menu — "Inside <Space>" applications column.
  // Per-room slugs that don't already exist in the Products column
  // above. Each is a stub page like the rest of /learn/[topic].
  // ────────────────────────────────────────────────────────────────
  "kitchen-islands": {
    title: "Kitchen Islands",
    eyebrow: "Application · Kitchen",
    description:
      "Mitred-edge waterfall islands, cantilevered breakfast bars, and oversized worktops cut from a single slab. How to specify and fabricate Pacific surfaces for the kitchen island.",
  },
  splashbacks: {
    title: "Splashbacks",
    eyebrow: "Application · Kitchen",
    description:
      "Continuous stone splashbacks from worktop to underside-of-cabinet — bookmatched veining, no grout lines, no seams. Heat- and stain-resistant by material.",
  },
  "bath-surrounds": {
    title: "Bath Surrounds",
    eyebrow: "Application · Bathroom",
    description:
      "Pacific surfaces wrapping freestanding tubs and built-in baths — drop-in panels, full-height side cladding, and integrated ledges. Detailed for water and humidity exposure.",
  },
  "exterior-cladding": {
    title: "Exterior Cladding",
    eyebrow: "Application · Architecture",
    description:
      "Large-format panels engineered for facade use — UV stable, thermally tolerant, and rated for exterior weathering. Ventilated rainscreen and direct-fix systems supported.",
  },
  "feature-walls": {
    title: "Feature Walls",
    eyebrow: "Application · Architecture",
    description:
      "Statement walls cut from rare and exotic slabs — feature surfaces for lobbies, fireplace walls, and entry vestibules. Bookmatched options on request.",
  },
  "floor-panels": {
    title: "Floor Panels",
    eyebrow: "Application · Architecture",
    description:
      "Large-format Pacific surface panels for flooring in lobbies, retail, and high-traffic interior environments. Slip-rated finishes available.",
  },
  "reception-desks": {
    title: "Reception Desks",
    eyebrow: "Application · Commercial",
    description:
      "Sculpted reception and front-desk surfaces in Pacific quartz, granite, and Centrepiece Couture slabs. Custom fabrication for hospitality and corporate environments.",
  },
  "bar-tops": {
    title: "Bar Tops",
    eyebrow: "Application · Commercial",
    description:
      "Bar and back-bar surfaces engineered to take spills, ice, citric acid, and high-traffic use without staining or etching. Specified by hospitality designers worldwide.",
  },
  tabletops: {
    title: "Tabletops",
    eyebrow: "Application · Commercial",
    description:
      "Restaurant, café, and conference tabletops — Pacific surfaces specified for the durability of stone with the consistency of engineered material.",
  },
  "commercial-cladding": {
    title: "Commercial Wall Cladding",
    eyebrow: "Application · Commercial",
    description:
      "Wall cladding for retail, hospitality, and workspace interiors — feature walls, accent strips, and full-height panels engineered for high-traffic environments.",
  },
  "commercial-flooring": {
    title: "Commercial Flooring",
    eyebrow: "Application · Commercial",
    description:
      "Floor tiles and large-format panels for commercial interiors. Slip-rated finishes and durability ratings appropriate for hospitality, retail, and office environments.",
  },

  // ────────────────────────────────────────────────────────────────
  // Spaces mega-menu — "Browse <Space>" bubble CTA stubs.
  // Per-room landing pages eventually live at /spaces/<slug>; until
  // those are designed, the CTAs route here so users land on a
  // properly-titled stub rather than a generic product catalogue
  // page that doesn't reflect the room they were browsing.
  // ────────────────────────────────────────────────────────────────
  "browse-kitchens": {
    title: "Browse Kitchens",
    eyebrow: "Browse · Kitchens",
    description:
      "Surfaces, sinks, and design ideas for the kitchen. The full Kitchens browser — filterable by surface type, finish, and project — is being built. In the meantime, this stub keeps the link target live.",
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

const FALLBACK = {
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
  const copy = TOPIC_COPY[topic] ?? FALLBACK;
  return {
    title: `${copy.title} — Pacific Surfaces`,
    description: copy.description,
    alternates: { canonical: `/learn/${topic}` },
  };
}

export default async function LearnTopicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { topic } = await params;
  const copy = TOPIC_COPY[topic] ?? FALLBACK;

  return (
    <>
      <PageHeader
        badge={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <section className="py-16 md:py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8 sm:p-10">
            <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-stone-500 mb-4">
              [ placeholder content ]
            </p>
            <p className="text-base font-light text-stone-700 leading-relaxed">
              Long-form editorial copy for this section is being written. In the
              meantime, this stub keeps the link target live so the navigation
              and mega-menu paths all resolve.
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
                href="/products"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 border border-stone-300 text-stone-900 text-xs font-medium tracking-[0.2em] uppercase hover:bg-stone-100 transition-colors"
              >
                Browse all products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
