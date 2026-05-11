"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface LearnLink {
  label: string;
  href: string;
  description: string;
}

interface LearnAboutCategoryProps {
  /** Visible category name — used in the eyebrow + section heading. */
  categoryName: string;
  /** 2 or 3 cards depending on whether Warranty is available for the category. */
  links: LearnLink[];
}

/**
 * "About <Category>" — three info cards rendered on each product
 * category landing (e.g. /products/quartz). Hosts the same links
 * that used to live in the Products mega-menu's expanded sub-panel:
 *   - What is <Category>     → /learn/what-is-<slug>
 *   - Maintenance            → /learn/maintenance-<slug>
 *   - Warranty               → /learn/warranty-<slug>  (Quartz only)
 *
 * Sits BETWEEN the catalogue and the FAQ on the category page, so
 * the visitor sees: hero → catalogue → Learn → FAQ.
 */
export function LearnAboutCategory({
  categoryName,
  links,
}: LearnAboutCategoryProps) {
  return (
    <section className="py-20 md:py-28 px-6 bg-[#0d1f29]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 md:mb-12 max-w-2xl"
        >
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-stone-400 mb-3">
            About {categoryName}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.15] text-white">
            Learn more about {categoryName}.
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {links.map((l, i) => (
            <motion.div
              key={l.href}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: 0.05 + i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={l.href}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 lg:p-7 hover:bg-white/[0.05] hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-xl lg:text-2xl font-light text-white tracking-tight leading-snug">
                    {l.label}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-stone-400 mt-1.5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" />
                </div>
                <p className="text-sm font-light text-stone-400 leading-relaxed">
                  {l.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
