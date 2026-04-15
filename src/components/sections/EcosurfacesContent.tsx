"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Shield,
  Leaf,
  Gem,
  Heart,
  LayoutGrid,
} from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { ProductCard } from "@/components/ui/product-card";
import { MagneticButton } from "@/components/ui/magnetic-button";

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  mainImage: string;
  ribbons?: string[];
  collection?: { name: string; slug: { current: string } };
}

interface EcosurfacesContentProps {
  products: Product[];
}

const features = [
  {
    icon: ShieldCheck,
    title: "Silica-Free Solutions",
    description:
      "Our zero silica surfaces are crafted with cutting-edge technology, eliminating the risks associated with crystalline silica exposure.",
  },
  {
    icon: Shield,
    title: "Low Silica Alternatives",
    description:
      "For projects where some silica is acceptable but needs to be minimized, we offer low silica surfaces that are well below industry safety thresholds.",
  },
  {
    icon: Leaf,
    title: "Sustainable Manufacturing",
    description:
      "Made with eco-friendly practices, our surfaces prioritize environmental protection without compromising on quality or style.",
  },
  {
    icon: Gem,
    title: "Durable & Stylish",
    description:
      "Available in a variety of designs and finishes, Ecosurfaces are perfect for both residential and commercial applications.",
  },
  {
    icon: Heart,
    title: "Health & Safety Compliance",
    description:
      "We meet or exceed all safety standards for low and zero silica content, ensuring peace of mind for installers, fabricators, and end-users alike.",
  },
  {
    icon: LayoutGrid,
    title: "Versatile Applications",
    description:
      "Whether it's countertops, vanities, flooring, or wall cladding, Ecosurfaces offers ideal solutions for diverse environments.",
  },
];

export function EcosurfacesContent({ products }: EcosurfacesContentProps) {
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
            className="inline-block text-xs font-medium tracking-[0.25em] uppercase text-emerald-400 mb-6"
          >
            Ecosurfaces
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white max-w-3xl"
          >
            The Future of Safe & Sustainable Surfaces
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-6 text-lg text-stone-400 max-w-2xl font-light leading-relaxed"
          >
            Revolutionary low and zero silica surfaces designed to meet the growing demand for healthier, safer, and more environmentally-friendly materials. Our advanced surface solutions are engineered to provide aesthetic beauty and unmatched durability while ensuring maximum safety for those who work with and around them.
          </motion.p>
        </div>
      </section>

      {/* What are Ecosurfaces */}
      <section className="bg-white border-b border-stone-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection animation="fadeUp" className="max-w-3xl mx-auto text-center">
            <span className="text-xs font-medium tracking-[0.25em] uppercase text-emerald-600 mb-4 block">What Are Ecosurfaces</span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900 mb-8">Safe, Stylish & Sustainable</h2>
            <p className="text-stone-600 font-light leading-relaxed text-lg">
              A revolutionary generation of surfaces crafted with a hybrid formulation that blends premium minerals, quartz, and recycled glass. This innovative approach results in a product that not only offers stunning aesthetics but also prioritizes health, safety, and sustainability.
            </p>
          </AnimatedSection>
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
              Eco-Conscious Surface Collection
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
                Eco surface collection coming soon.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-4 block">
              Why Choose Ecosurfaces
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
              Premium Performance, Pure Responsibility
            </h2>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={feature.title}>
                  <div className="bg-white rounded-2xl p-8 h-full border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all duration-500">
                    <div className="p-3 bg-emerald-50 rounded-xl w-fit">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="mt-6 text-base font-medium text-stone-900">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm text-stone-500 font-light leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white max-w-xl mx-auto">
              Ready to experience eco-conscious luxury?
            </h2>
            <p className="mt-4 text-stone-400 font-light max-w-md mx-auto">
              Order a sample or speak with our specialists about the perfect
              eco-surface for your project.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/contact" variant="primary" size="lg">
                Order a Sample
              </MagneticButton>
              <MagneticButton href="/products" variant="outline" size="lg">
                View All Surfaces
              </MagneticButton>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
