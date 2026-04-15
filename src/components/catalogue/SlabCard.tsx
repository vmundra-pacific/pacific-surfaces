"use client";

/**
 * SlabCard — a single slab tile in the catalogue grid.
 *
 * Layered render order (bottom → top):
 *   1. Solid base swatch gradient
 *   2. Overlay gradient (simulates veining)
 *   3. Ribbon (New / Featured) in top-left
 *   4. Metadata gradient + name + collection (bottom)
 *   5. Hover overlay with View / + Sample CTAs
 *
 * Replace the two gradient layers with <Image> elements when real
 * slab photography is wired in.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import type { Slab } from "@/data/slabs";

interface Props {
  slab: Slab;
  index: number;
}

export function SlabCard({ slab, index }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        duration: 0.45,
        ease: [0.2, 0.9, 0.3, 1],
        delay: Math.min(index * 0.03, 0.3),
      }}
      className={[
        "group relative aspect-[4/5] overflow-hidden rounded-xl",
        "border border-white/10 bg-pacific-dark",
        "cursor-pointer transition-colors duration-300 hover:border-pacific-mid/50",
      ].join(" ")}
    >
      {/* Base swatch */}
      <div
        className="absolute inset-0 transition-transform duration-[800ms] ease-[cubic-bezier(.2,.9,.3,1)] group-hover:scale-[1.04]"
        style={{ background: slab.swatch }}
      />
      {/* Overlay veining */}
      {slab.overlay && (
        <div
          className="absolute inset-0 transition-transform duration-[800ms] ease-[cubic-bezier(.2,.9,.3,1)] group-hover:scale-[1.04]"
          style={{ background: slab.overlay, mixBlendMode: "normal" }}
        />
      )}

      {/* Ribbon */}
      {slab.ribbon === "new" && (
        <span className="absolute left-3.5 top-3.5 z-20 rounded bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-pacific-dark">
          New
        </span>
      )}
      {slab.ribbon === "featured" && (
        <span className="absolute left-3.5 top-3.5 z-20 rounded border border-white/40 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
          Featured
        </span>
      )}

      {/* Metadata footer */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 pt-12"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(10,22,32,0.9) 60%, rgba(10,22,32,1) 100%)",
        }}
      >
        <div className="text-lg font-medium leading-tight tracking-tight text-white">
          {slab.name}
        </div>
        <div className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-pacific-mid">
          {slab.collection} · {slab.finishes[0]}
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 z-30 flex items-center justify-center gap-2.5 bg-pacific-dark/60 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
        <Link
          href={`/products/${slab.slug}`}
          className="rounded-full bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-pacific-dark transition-transform hover:scale-[1.04]"
        >
          View slab
        </Link>
        <button
          onClick={(e) => {
            // In a real impl this adds to the sample-kit state — for now
            // just a no-op; we stop propagation so clicking doesn't open
            // the slab detail page underneath.
            e.preventDefault();
            e.stopPropagation();
          }}
          className="rounded-full border border-white/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-white/10"
        >
          + Sample
        </button>
      </div>
    </motion.div>
  );
}
