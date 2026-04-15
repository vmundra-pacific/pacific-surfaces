"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  mainImage: string;
  price?: { amount: number; currency: string };
  ribbons?: string[];
  collection?: { name: string; slug: { current: string } };
}

interface SinksContentProps {
  products: Product[];
}

const careTips = [
  "Clean the basin regularly with mild soap and warm water to preserve its natural quartz finish.",
  "Avoid harsh chemicals, bleach, acidic cleaners, or abrasive pads that may damage the surface.",
  "Use a soft sponge or microfiber cloth for daily cleaning to maintain its smooth, refined texture.",
  "Wipe the basin dry after use to prevent water spots and mineral deposits, keeping it looking pristine.",
  "For tougher residues, let warm soapy water sit for a few minutes before gently wiping clean.",
  "Avoid placing extremely hot items directly inside the basin to protect the quartz-resin blend.",
];

const policies = [
  {
    title: "Return & Refunds",
    content:
      "Returns are accepted only for defective, damaged, or incorrect products. Requests must be made within 7 days of delivery.",
  },
  {
    title: "Shipping & Delivery",
    content:
      "Orders are processed in 1–3 business days and delivered within 5–12 business days depending on location.",
  },
  {
    title: "Payments",
    content:
      "We accept secure online payments exclusively via Razorpay using credit cards, debit cards, and other payment methods supported by Razorpay.",
  },
  {
    title: "Cancellation",
    content:
      "Orders may be cancelled within 12 hours of placement if they have not been dispatched. Cancellation requests after dispatch cannot be processed.",
  },
  {
    title: "Warranty",
    content:
      "Our sinks come with a 10-year manufacturer warranty covering structural or manufacturing defects. Normal wear and tear or misuse are not covered.",
  },
  {
    title: "Privacy",
    content:
      "Customer information is used solely for order processing, delivery, communication, and legal compliance. We do not share or sell your data to third parties.",
  },
];

export function SinksContent({ products }: SinksContentProps) {
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  const formatPrice = (priceObj?: { amount: number; currency: string }) => {
    if (!priceObj) return "Contact for Price";
    const amount = Math.round(priceObj.amount).toLocaleString("en-IN");
    return `₹${amount}`;
  };

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center bg-stone-950 overflow-hidden">
        {/* Background texture */}
        <motion.div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-stone-950/80 to-stone-950" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <div className="inline-block">
              <p className="text-xs font-medium tracking-[0.25em] uppercase text-blue-400 mb-2">
                Integra
              </p>
              <p className="text-xs font-light tracking-wider text-stone-500">
                Integrated at its best
              </p>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white max-w-3xl"
          >
            Seamless Integrated Sink Designs
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-6 text-lg text-stone-400 max-w-2xl font-light leading-relaxed"
          >
            The Pacific Quartz Sink Series represents the next evolution in surface integration — where sink and countertop unite in a single, continuous form. Crafted using high-density quartz composite technology, these sinks combine the timeless appeal of natural stone with the precision and consistency of engineered material science.
          </motion.p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection className="mb-16">
            <span className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-4 block">
              Integra Collection
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
              Premium Quartz Sink Selection
            </h2>
          </AnimatedSection>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: (index % 4) * 0.1,
                    ease: [0.25, 0.4, 0.25, 1],
                  }}
                  className="group"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-100 mb-4">
                    {product.mainImage ? (
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-stone-400">
                        <svg
                          className="w-12 h-12"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  </div>

                  {/* Text */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-stone-900 group-hover:text-stone-600 transition-colors duration-300">
                      {product.name}
                    </h3>
                    {product.collection && (
                      <p className="text-xs text-stone-500 tracking-wide">
                        {product.collection.name}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-stone-900">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-stone-600 hover:text-stone-900 transition-colors mt-2"
                    >
                      Request Quote
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center"
            >
              <p className="text-stone-400 text-lg font-light">
                Integra sink collection coming soon.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Care & Maintenance */}
      <section className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-4 block">
              Care Guide
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
              Keep Your Sink Looking Beautiful
            </h2>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {careTips.map((tip, idx) => (
              <StaggerItem key={idx}>
                <div className="bg-white rounded-2xl p-6 h-full border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all duration-500">
                  <p className="text-sm text-stone-600 font-light leading-relaxed">
                    {tip}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Purchase Policies */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-4 block">
              Policies
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
              Purchase & Support Information
            </h2>
          </AnimatedSection>

          <div className="max-w-3xl mx-auto space-y-3">
            {policies.map((policy, index) => (
              <motion.div
                key={policy.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() =>
                    setExpandedPolicy(
                      expandedPolicy === policy.title ? null : policy.title
                    )
                  }
                  className="w-full flex items-center justify-between p-6 bg-stone-50 hover:bg-stone-100 transition-colors rounded-xl text-left border border-stone-100 hover:border-stone-200 transition-all"
                >
                  <h3 className="text-base font-medium text-stone-900">
                    {policy.title}
                  </h3>
                  <motion.div
                    animate={{
                      rotate: expandedPolicy === policy.title ? 180 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-stone-400" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedPolicy === policy.title && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                      className="overflow-hidden border-x border-b border-stone-100 bg-white"
                    >
                      <div className="p-6">
                        <p className="text-sm text-stone-600 font-light leading-relaxed">
                          {policy.content}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white max-w-xl mx-auto">
              Find the Perfect Sink for Your Kitchen
            </h2>
            <p className="mt-4 text-stone-400 font-light max-w-md mx-auto">
              Our specialists are ready to help you select and customize your
              ideal integrated sink.
            </p>
            <div className="mt-10">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 bg-white text-stone-900 px-8 py-4 rounded-full text-sm font-medium tracking-wider uppercase hover:bg-stone-100 transition-colors"
              >
                Request a Quote
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
