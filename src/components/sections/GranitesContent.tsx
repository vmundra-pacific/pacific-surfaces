"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Send, CheckCircle } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ProductCard } from "@/components/ui/product-card";

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  mainImage: string;
  ribbons?: string[];
  collection?: { name: string; slug: { current: string } };
  finishes?: string[];
}

interface GranitesContentProps {
  products: Product[];
}

type FormState = "idle" | "sending" | "sent";

interface FormData {
  name: string;
  phone: string;
  email: string;
  city: string;
  profession: string;
  application: string;
  message: string;
}

const professionOptions = [
  "Architect",
  "Designer",
  "Homeowner",
  "Builder",
  "Fabricator",
  "Other",
];

const applicationOptions = [
  "Kitchen Countertops",
  "Flooring",
  "Staircases",
  "Exterior Cladding",
  "Commercial",
  "Other",
];

export function GranitesContent({ products }: GranitesContentProps) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    city: "",
    profession: "",
    application: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");
    // Simulate send
    setTimeout(() => setFormState("sent"), 1500);
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
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block text-xs font-medium tracking-[0.25em] uppercase text-amber-400 mb-6"
          >
            Timeless Beauty of Granites
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white max-w-3xl"
          >
            Premium Natural Granite Collection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-6 text-lg text-stone-400 max-w-2xl font-light leading-relaxed"
          >
            Each slab of our collections is crafted with the artistry of nature at its best. Each slab displays the legendary stories of the quarry it comes from, polished and cut by the finest Italian equipment.
          </motion.p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection className="mb-16">
            <span className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-4 block">
              Our Collection
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
              Premium Natural Granite Selection
            </h2>
          </AnimatedSection>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center"
            >
              <p className="text-stone-400 text-lg font-light">
                Granite collection coming soon.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Stone Finishes */}
      <section className="bg-stone-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection animation="fadeUp" className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs font-medium tracking-[0.25em] uppercase text-amber-400 mb-4 block">Fusion of Aesthetics, Functionality, and Innovation</span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white mb-8">Stone Beyond Imagination</h2>
            <p className="text-stone-300 font-light leading-relaxed text-lg">
              Explore a world of special textures and modern finishing that will transform your space into a realm of contemporary luxury. Each piece is carefully crafted to elevate your living experience.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-stone-900 rounded-2xl p-8 border border-stone-800"
            >
              <div className="mb-6">
                <span className="inline-block text-xs font-medium tracking-[0.25em] uppercase text-amber-400">ENIGMA Finish</span>
              </div>
              <h3 className="text-xl font-light tracking-tight text-white mb-4">
                ENIGMA
              </h3>
              <p className="text-stone-400 font-light leading-relaxed">
                A sophisticated and mysterious finish that brings depth and character to any space. Perfect for those seeking a modern, understated elegance.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-stone-900 rounded-2xl p-8 border border-stone-800"
            >
              <div className="mb-6">
                <span className="inline-block text-xs font-medium tracking-[0.25em] uppercase text-amber-400">INTERSTELLAR Finish</span>
              </div>
              <h3 className="text-xl font-light tracking-tight text-white mb-4">
                INTERSTELLAR
              </h3>
              <p className="text-stone-400 font-light leading-relaxed">
                An innovative finish that captures the essence of cosmic wonder. Featuring unique patterns and textures that inspire awe and create remarkable visual impact.
              </p>
            </motion.div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/granites"
              className="inline-flex items-center gap-3 bg-amber-400 text-stone-950 px-8 py-4 rounded-full text-sm font-medium tracking-wider uppercase hover:bg-amber-300 transition-colors"
            >
              Explore All Finishes
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
        </div>
      </section>

      {/* Granite Enquiry Form */}
      <section className="bg-stone-50">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-4 block">
              Get a Quote
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
              Find Your Perfect Granite Slab
            </h2>
            <p className="mt-4 text-stone-500 font-light max-w-xl mx-auto">
              Tell us about your project and our specialists will help you
              select the ideal granite for your needs.
            </p>
          </AnimatedSection>

          {formState === "sent" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-12 text-center border border-stone-100"
            >
              <div className="p-4 bg-emerald-50 rounded-full w-fit mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-medium text-stone-900">
                Enquiry Submitted
              </h3>
              <p className="mt-3 text-stone-500 font-light max-w-sm mx-auto">
                Thank you for your interest. Our granite specialists will
                contact you within 24 hours with curated recommendations.
              </p>
              <button
                onClick={() => {
                  setFormState("idle");
                  setFormData({
                    name: "",
                    phone: "",
                    email: "",
                    city: "",
                    profession: "",
                    application: "",
                    message: "",
                  });
                }}
                className="mt-6 text-sm text-stone-600 underline hover:text-stone-900 transition-colors"
              >
                Submit another enquiry
              </button>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-8 lg:p-12 border border-stone-100 space-y-6"
            >
              {/* Name and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-medium tracking-wider uppercase text-stone-400 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-300"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-medium tracking-wider uppercase text-stone-400 mb-2"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-300"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Email and City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium tracking-wider uppercase text-stone-400 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-300"
                    placeholder="you@email.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-xs font-medium tracking-wider uppercase text-stone-400 mb-2"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-300"
                    placeholder="Your city"
                  />
                </div>
              </div>

              {/* Profession and Application */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="profession"
                    className="block text-xs font-medium tracking-wider uppercase text-stone-400 mb-2"
                  >
                    I am
                  </label>
                  <select
                    id="profession"
                    required
                    value={formData.profession}
                    onChange={(e) =>
                      setFormData({ ...formData, profession: e.target.value })
                    }
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                  >
                    <option value="">Select profession</option>
                    {professionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="application"
                    className="block text-xs font-medium tracking-wider uppercase text-stone-400 mb-2"
                  >
                    Application
                  </label>
                  <select
                    id="application"
                    required
                    value={formData.application}
                    onChange={(e) =>
                      setFormData({ ...formData, application: e.target.value })
                    }
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                  >
                    <option value="">Select application</option>
                    {applicationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-xs font-medium tracking-wider uppercase text-stone-400 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors resize-none placeholder:text-stone-300"
                  placeholder="Tell us about your project and requirements..."
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={formState === "sending"}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 bg-stone-900 text-white px-8 py-4 rounded-full text-sm font-medium tracking-wider uppercase hover:bg-stone-800 transition-colors disabled:opacity-60 mt-4"
              >
                {formState === "sending" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Get Granite Quote
                  </>
                )}
              </motion.button>
              <p className="mt-6 text-center text-sm text-stone-500 font-light">
                We respond within 24 hours
              </p>
            </motion.form>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white max-w-xl mx-auto">
              Discover the Perfect Granite for Your Vision
            </h2>
            <p className="mt-4 text-stone-400 font-light max-w-md mx-auto">
              Explore our complete collection and work with our experts to bring
              your project to life.
            </p>
            <div className="mt-10">
              <Link
                href="/products"
                className="inline-flex items-center gap-3 bg-white text-stone-900 px-8 py-4 rounded-full text-sm font-medium tracking-wider uppercase hover:bg-stone-100 transition-colors"
              >
                View All Granites
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
