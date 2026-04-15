"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Maximize2,
  X,
  Ruler,
  Layers,
  Paintbrush,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";
import { MagneticButton } from "@/components/ui/magnetic-button";

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  mainImage?: string;
  gallery?: string[];
  ribbons?: string[];
  collection?: { name: string; slug: { current: string } };
  size?: string;
  finishes?: string[];
  thickness?: string[];
  application?: string[];
  relatedProducts?: {
    _id: string;
    name: string;
    slug: { current: string };
    mainImage: string;
  }[];
}

const ribbonColors: Record<string, string> = {
  Patented: "bg-stone-900 text-white",
  "New Arrival": "bg-amber-600 text-white",
  "Eco Surface": "bg-emerald-700 text-white",
  "Luxury Drop": "bg-violet-800 text-white",
  "Top Color": "bg-rose-700 text-white",
};

export function ProductDetail({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(product.mainImage || "");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const allImages = [
    product.mainImage,
    ...(product.gallery || []),
  ].filter(Boolean) as string[];

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-stone-50 border-b border-stone-100">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8 py-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-xs tracking-wide"
          >
            <Link
              href="/"
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-stone-300" />
            <Link
              href="/products"
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              Products
            </Link>
            {product.collection && (
              <>
                <ChevronRight className="w-3 h-3 text-stone-300" />
                <Link
                  href={`/collections/${product.collection.slug.current}`}
                  className="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {product.collection.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3 text-stone-300" />
            <span className="text-stone-900 font-medium">{product.name}</span>
          </motion.div>
        </nav>
      </div>

      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          >
            {/* Main Image */}
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 cursor-zoom-in group"
              onClick={() => setLightboxOpen(true)}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-stone-300 text-lg font-light">
                  No image available
                </div>
              )}
              <div className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Maximize2 className="w-4 h-4 text-stone-600" />
              </div>
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === img
                        ? "border-stone-900 opacity-100"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.4, 0.25, 1] }}
          >
            {/* Ribbons */}
            {product.ribbons && product.ribbons.length > 0 && (
              <div className="flex gap-2 mb-5">
                {product.ribbons.map((ribbon) => (
                  <span
                    key={ribbon}
                    className={`inline-flex items-center px-3 py-1 text-[10px] font-medium tracking-wider uppercase rounded-full ${
                      ribbonColors[ribbon] || "bg-stone-800 text-white"
                    }`}
                  >
                    {ribbon}
                  </span>
                ))}
              </div>
            )}

            {/* Name */}
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
              {product.name}
            </h1>
            {product.collection && (
              <Link
                href={`/collections/${product.collection.slug.current}`}
                className="inline-block mt-2 text-sm text-stone-500 hover:text-stone-700 transition-colors tracking-wide"
              >
                {product.collection.name} Collection
              </Link>
            )}

            {/* Specs */}
            <div className="mt-10 space-y-6 border-t border-stone-100 pt-8">
              {product.size && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-stone-50 rounded-lg">
                    <Ruler className="w-4 h-4 text-stone-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium tracking-wider uppercase text-stone-400">
                      Slab Size
                    </dt>
                    <dd className="mt-1 text-sm text-stone-900">
                      {product.size}
                    </dd>
                  </div>
                </div>
              )}

              {product.finishes && product.finishes.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-stone-50 rounded-lg">
                    <Paintbrush className="w-4 h-4 text-stone-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium tracking-wider uppercase text-stone-400">
                      Available Finishes
                    </dt>
                    <dd className="mt-2 flex gap-2 flex-wrap">
                      {product.finishes.map((f) => (
                        <span
                          key={f}
                          className="rounded-full border border-stone-200 px-3 py-1 text-xs text-stone-700 capitalize hover:bg-stone-50 transition-colors"
                        >
                          {f}
                        </span>
                      ))}
                    </dd>
                  </div>
                </div>
              )}

              {product.thickness && product.thickness.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-stone-50 rounded-lg">
                    <Layers className="w-4 h-4 text-stone-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium tracking-wider uppercase text-stone-400">
                      Thickness
                    </dt>
                    <dd className="mt-1 text-sm text-stone-900">
                      {product.thickness.join(" / ")}
                    </dd>
                  </div>
                </div>
              )}

              {product.application && product.application.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-stone-50 rounded-lg">
                    <LayoutGrid className="w-4 h-4 text-stone-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium tracking-wider uppercase text-stone-400">
                      Applications
                    </dt>
                    <dd className="mt-2 flex gap-2 flex-wrap">
                      {product.application.map((a) => (
                        <span
                          key={a}
                          className="rounded-full bg-stone-50 border border-stone-100 px-3 py-1 text-xs text-stone-700 capitalize"
                        >
                          {a.replace("-", " ")}
                        </span>
                      ))}
                    </dd>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <MagneticButton href="/contact" variant="primary" size="lg">
                Request a Quote
              </MagneticButton>
              <MagneticButton href="#" variant="outline" size="lg">
                Order Sample
              </MagneticButton>
            </div>

            {/* Share */}
            <div className="mt-10 pt-10 border-t border-stone-100">
              <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-4">
                Share This Product
              </p>
              <div className="flex gap-3">
                <SocialShareButton
                  label="Facebook"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? window.location.href : ''}`}
                  svgPath="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"
                />
                <SocialShareButton
                  label="WhatsApp"
                  href={`https://wa.me/?text=Check out ${product.name} on Pacific Surfaces: ${typeof window !== 'undefined' ? window.location.href : ''}`}
                  svgPath="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                />
                <SocialShareButton
                  label="Twitter"
                  href={`https://twitter.com/intent/tweet?text=Check out ${product.name} on Pacific Surfaces&url=${typeof window !== 'undefined' ? window.location.href : ''}`}
                  svgPath="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7"
                />
                <SocialShareButton
                  label="Pinterest"
                  href={`https://pinterest.com/pin/create/button/?url=${typeof window !== 'undefined' ? window.location.href : ''}&description=${product.name}`}
                  svgPath="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 19c-3.859 0-7-3.141-7-7s3.141-7 7-7 7 3.141 7 7-3.141 7-7 7zm3.5-9.5c-.274 0-.5.225-.5.5s.226.5.5.5.5-.225.5-.5-.226-.5-.5-.5z"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="border-t border-stone-100 bg-stone-50/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-light tracking-tight text-stone-900 mb-10"
            >
              You may also like
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {product.relatedProducts.map((rp, i) => (
                <ProductCard key={rp._id} product={rp} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Discover More Cross-sell */}
      <section className="border-t border-stone-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-light tracking-tight text-stone-900 mb-10"
          >
            Discover More
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Ecosurfaces",
                description: "Safe, Sustainable & Stunning",
                link: "/ecosurfaces",
                delay: 0,
              },
              {
                title: "Fab Creations",
                description: "Cut-to-Size Quartz Surfaces",
                link: "/products",
                delay: 0.1,
              },
              {
                title: "Resources",
                description: "Download Catalogs & Technical Sheets",
                link: "/resources",
                delay: 0.2,
              },
            ].map((item) => (
              <motion.a
                key={item.title}
                href={item.link}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: item.delay }}
                className="group relative bg-stone-50 rounded-xl p-6 border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all duration-500 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-light tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-stone-600 font-light">
                    {item.description}
                  </p>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 text-stone-400 group-hover:text-stone-600 transition-colors">
                  <span className="text-xs font-medium tracking-wide uppercase">Explore</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-8"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              className="absolute top-6 right-6 p-2 text-white/60 hover:text-white transition-colors"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={selectedImage}
              alt={product.name}
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface SocialShareButtonProps {
  label: string;
  href: string;
  svgPath: string;
}

function SocialShareButton({ label, href, svgPath }: SocialShareButtonProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="p-3 bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-600 hover:text-stone-900 transition-all duration-300 border border-stone-100 hover:border-stone-200 group"
      title={label}
    >
      <svg
        className="w-5 h-5 group-hover:text-stone-900 transition-colors fill-current"
        viewBox="0 0 24 24"
      >
        <path d={svgPath} />
      </svg>
    </motion.a>
  );
}
