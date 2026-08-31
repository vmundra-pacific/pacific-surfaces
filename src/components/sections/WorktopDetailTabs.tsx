"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { finishDescription } from "@/lib/finish-copy";

/**
 * Formats & thicknesses / Finishes / Edges — the three decisions a
 * customer still has to make once they have settled on a colour.
 * Rendered under the specs strip on every product page.
 *
 * Text-only for now. `TabBody` ends with the slot where the render
 * row goes once the imagery exists; nothing else about the layout
 * needs to change to drop it in.
 */

const EDGE_PROFILES: { name: string; body: string }[] = [
  {
    name: "Straight (Eased)",
    body: "A square edge with the arris just taken off. The quietest profile, and the one that suits a minimal, modern kitchen best.",
  },
  {
    name: "Bevelled",
    body: "A flat chamfer cut along the top arris, usually at 45 degrees. Catches a highlight along its length and reads crisper than a square edge.",
  },
  {
    name: "Rounded (Bullnose)",
    body: "The full edge turned to a single radius. Soft to lean against and the most forgiving profile in a family kitchen.",
  },
  {
    name: "Half-round (Demi-bullnose)",
    body: "Only the top arris rounded, leaving the underside square. Softer than eased without losing the slab's visual thickness.",
  },
  {
    name: "Ogee",
    body: "An S-curve cut into the face. The most decorative profile we cut, and the natural partner to a traditional or classical kitchen.",
  },
  {
    name: "Mitred",
    body: "Two pieces joined at 45 degrees to fake a thicker slab. How a 20 mm top is made to read as 40, 60 or 100 mm at the edge.",
  },
];

type TabKey = "formats" | "finishes" | "edges";

const TABS: { key: TabKey; label: string }[] = [
  { key: "formats", label: "Formats and thicknesses" },
  { key: "finishes", label: "Finishes" },
  { key: "edges", label: "Edges" },
];

export default function WorktopDetailTabs({
  productName,
  thicknesses,
  finishes,
  size,
}: {
  productName: string;
  thicknesses: string[];
  finishes: string[];
  size: string;
}) {
  const [active, setActive] = useState<TabKey>("formats");

  // Read the thickness list back as prose ("12, 20 and 30 mm") so the
  // copy stays true to whatever the editor set in Sanity rather than
  // hardcoding a range that may not apply to this product.
  const thicknessProse =
    thicknesses.length > 1
      ? `${thicknesses.slice(0, -1).join(", ")} and ${thicknesses[thicknesses.length - 1]}`
      : (thicknesses[0] ?? "");

  return (
    <section className="bg-white border-b border-pacific-mid/15">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
        {/* Tab bar — three pills, the active one inverted. */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 lg:mb-16">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              aria-pressed={active === tab.key}
              className={cn(
                "px-6 py-2.5 text-xs font-medium tracking-[0.15em] uppercase rounded-sm transition-colors",
                active === tab.key
                  ? "bg-pacific-dark text-white"
                  : "bg-pacific-light/60 text-pacific-dark hover:bg-pacific-light"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {active === "formats" && (
              <TabBody
                headline={
                  <>
                    Available thicknesses
                    <br />
                    for countertops
                  </>
                }
                left={`${productName} is supplied in the standard slab format of ${size}, which covers the great majority of kitchen and vanity runs without a joint. Larger or non-standard layouts are cut to your template.`}
                right={
                  thicknessProse
                    ? `Available in ${thicknessProse}. Thinner slabs keep a lighter line on furniture, cladding and fronts; thicker ones carry an island or a long unsupported run. A mitred edge can make any of them read heavier.`
                    : "Thickness options are confirmed at quotation for this product. Thinner slabs keep a lighter line on furniture and cladding; thicker ones carry an island or a long unsupported run."
                }
              />
            )}

            {active === "finishes" && (
              <TabBody
                headline={
                  <>
                    Countertops designed
                    <br />
                    for tactile enjoyment
                  </>
                }
                left={`Every finish we offer on ${productName} keeps the same technical performance — stain, scratch and heat resistance are a property of the material, not the surface treatment. What changes is how the colour reads and how the slab feels underhand.`}
                right="Choose a polish for depth and reflection, a honed or matte surface for calm and no glare, or a textured finish where touch matters as much as looks."
              >
                {finishes.length > 0 && (
                  <dl className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    {finishes.map((f) => (
                      <div key={f}>
                        <dt className="text-sm font-medium uppercase tracking-wide text-pacific-dark">
                          {f}
                        </dt>
                        <dd className="mt-1.5 text-sm font-light leading-relaxed text-pacific-dark/65">
                          {finishDescription(f) ?? "Premium surface finish."}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </TabBody>
            )}

            {active === "edges" && (
              <TabBody
                headline={
                  <>
                    The versatility
                    <br />
                    of detail
                  </>
                }
                left={`${productName} carries its pattern through the full thickness of the slab, so an edge profile cuts into continuous material rather than breaking a printed surface. Any profile can be worked without losing the pattern.`}
                right="Rounded, half-round, ogee, bevelled and mitred are the profiles we cut most often. Edge work is done by the fabricator against your template — talk to a certified installer before committing."
              >
                <dl className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                  {EDGE_PROFILES.map((edge) => (
                    <div key={edge.name}>
                      <dt className="text-sm font-medium uppercase tracking-wide text-pacific-dark">
                        {edge.name}
                      </dt>
                      <dd className="mt-1.5 text-sm font-light leading-relaxed text-pacific-dark/65">
                        {edge.body}
                      </dd>
                    </div>
                  ))}
                </dl>
              </TabBody>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/**
 * Shared head for each tab: oversized headline on the left, two
 * columns of body copy beside it. `children` renders full-width
 * beneath — the profile/finish lists today, and the image row once
 * the renders land.
 */
function TabBody({
  headline,
  left,
  right,
  children,
}: {
  headline: React.ReactNode;
  left: string;
  right: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <h2 className="lg:col-span-4 text-2xl lg:text-3xl font-light tracking-tight text-pacific-dark leading-tight uppercase">
          {headline}
        </h2>
        <p className="lg:col-span-4 text-sm font-light leading-relaxed text-pacific-dark/70">
          {left}
        </p>
        <p className="lg:col-span-4 text-sm font-light leading-relaxed text-pacific-dark/70">
          {right}
        </p>
      </div>
      {children}
      {/* Image row goes here — one visual per profile / finish /
          thickness, sitting full-width under the copy. */}
    </div>
  );
}
