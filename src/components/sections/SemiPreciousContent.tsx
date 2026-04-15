"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { AnimatedSection } from "@/components/ui/animated-section";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ProductCard } from "@/components/ui/product-card";

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  mainImage: string;
  ribbons?: string[];
  collection?: { name: string; slug: { current: string } };
}

export function SemiPreciousContent({ products }: { products: Product[] }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-[70vh] flex items-center bg-stone-950 overflow-hidden">
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-stone-950/80 to-stone-950" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pt-32 pb-20 text-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-6"
          >
            Nature&apos;s Rarest Treasures
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white max-w-3xl mx-auto"
          >
            True Jewels of Nature
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-6 text-lg text-stone-400 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Discover semi-precious stone surfaces that transform interiors into extraordinary showcases of natural beauty and elegance.
          </motion.p>
        </motion.div>
      </section>

      {/* Products Grid */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
          {products.length > 0 ? (
            <>
              <AnimatedSection className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
                  Our Collection
                </h2>
                <p className="mt-3 text-stone-600 font-light">
                  Explore our curated selection of premium semi-precious stone surfaces.
                </p>
              </AnimatedSection>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                {products.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </motion.div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-stone-600 font-light text-lg">
                No semi-precious stone surfaces available at this time.
              </p>
              <p className="mt-2 text-stone-400 font-light">
                Please check back soon for new additions to our collection.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white max-w-xl mx-auto">
              Ready to elevate your space?
            </h2>
            <p className="mt-4 text-stone-400 font-light max-w-md mx-auto">
              Let our specialists help you select the perfect semi-precious surface for your project.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/contact" variant="primary" size="lg">
                Get a Free Consultation
              </MagneticButton>
              <MagneticButton href="/products" variant="outline" size="lg">
                Browse All Products
              </MagneticButton>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
