import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Pacific Surfaces",
  description:
    "Learn about Pacific Surfaces, India's premium quartz and granite surface manufacturer. Quality, innovation, and craftsmanship.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        About Pacific Surfaces
      </h1>
      <div className="mt-8 space-y-6 text-gray-600 leading-relaxed">
        <p>
          Pacific Surfaces is a premium manufacturer of engineered quartz and
          granite surfaces, dedicated to transforming spaces with surfaces that
          combine beauty, durability, and innovation.
        </p>
        <p>
          With over 273 unique designs across multiple collections — from the
          bold Chromia series to the celestial Kosmic range — we offer the widest
          selection of premium surfaces in India. Our patented textures and
          finishes set us apart in the industry.
        </p>
        <p>
          Every slab is engineered to meet the highest standards of quality,
          making our surfaces ideal for kitchen countertops, bathroom vanities,
          wall cladding, flooring, and statement furniture pieces.
        </p>
      </div>
    </div>
  );
}
