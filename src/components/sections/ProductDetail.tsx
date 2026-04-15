"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Heart,
  Download,
  Share2,
  ZoomIn,
  X,
  MapPin,
  Package,
  Check,
  Copy,
  MessageCircle,
} from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { OrderSampleModal } from "@/components/ui/order-sample-modal";
import { cn } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  mainImage?: string;
  gallery?: string[];
  ribbons?: string[];
  price?: number;
  category?: { name: string; slug: { current: string } };
  collection?: { name: string; slug: { current: string } };
  size?: string;
  finishes?: string[];
  thickness?: string[];
  application?: string[];
  careAndMaintenance?: string;
  relatedProducts?: {
    _id: string;
    name: string;
    slug: { current: string };
    mainImage?: string;
    price?: number;
  }[];
}

const ribbonStyles: Record<string, string> = {
  Patented: "bg-stone-900 text-white",
  "New Arrival": "bg-stone-900 text-white",
  "Eco Surface": "bg-emerald-700 text-white",
  "Luxury Drop": "bg-stone-900 text-white",
  "Top Color": "bg-stone-900 text-white",
  New: "bg-stone-900 text-white",
  Popular: "bg-stone-800 text-white",
};

const WHATSAPP_URL_BASE =
  "https://api.whatsapp.com/send/?phone=917305477549&type=phone_number&app_absent=0&text=";

const FAV_STORAGE_KEY = "ps_favorites_v1";

export function ProductDetail({ product }: { product: Product }) {
  const allImages = [product.mainImage, ...(product.gallery || [])].filter(
    Boolean,
  ) as string[];

  const [selectedImage, setSelectedImage] = useState(allImages[0] || "");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sampleOpen, setSampleOpen] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "specs" | "applications" | "care"
  >("overview");

  const finishes =
    product.finishes && product.finishes.length
      ? product.finishes
      : ["Polished", "Honed"];
  const thicknesses =
    product.thickness && product.thickness.length
      ? product.thickness
      : ["2 cm", "3 cm"];
  const applications =
    product.application && product.application.length
      ? product.application
      : [
          "Kitchen Countertops",
          "Bathroom Vanities",
          "Backsplashes",
          "Wall Cladding",
          "Commercial Interiors",
        ];
  const size = product.size || '126" x 63"';
  const categoryLabel =
    product.category?.name || product.collection?.name || "Quartz Surfaces";

  // Favorites: load on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_STORAGE_KEY);
      const favs: string[] = raw ? JSON.parse(raw) : [];
      setIsFav(favs.includes(product._id));
    } catch {
      /* ignore */
    }
  }, [product._id]);

  const toggleFav = () => {
    try {
      const raw = localStorage.getItem(FAV_STORAGE_KEY);
      const favs: string[] = raw ? JSON.parse(raw) : [];
      const next = favs.includes(product._id)
        ? favs.filter((id) => id !== product._id)
        : [...favs, product._id];
      localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(next));
      setIsFav(next.includes(product._id));
    } catch {
      setIsFav((p) => !p);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${product.name} — Pacific Surfaces`,
      text: `Check out ${product.name} from Pacific Surfaces.`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const whatsappHref =
    WHATSAPP_URL_BASE +
    encodeURIComponent(
      `Hi, I'm interested in ${product.name} from Pacific Surfaces. Please share more details and pricing.`,
    );

  return (
    <>
      {/* ===== BREADCRUMB ===== */}
      <nav className="bg-stone-50 border-b border-stone-100 pt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4 flex items-center gap-2 text-xs text-stone-500 tracking-wide font-light">
          <Link href="/" className="hover:text-stone-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-300" />
          <Link
            href="/products"
            className="hover:text-stone-900 transition-colors"
          >
            Products
          </Link>
          {product.collection && (
            <>
              <ChevronRight className="w-3 h-3 text-stone-300" />
              <Link
                href={`/collections/${product.collection.slug.current}`}
                className="hover:text-stone-900 transition-colors"
              >
                {product.collection.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-stone-300" />
          <span className="text-stone-900">{product.name}</span>
        </div>
      </nav>

      {/* ===== HERO: GALLERY + INFO ===== */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Gallery */}
          <AnimatedSection animation="slideInLeft">
            <div
              className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-stone-100 bg-stone-100 cursor-zoom-in"
              onClick={() => selectedImage && setLightboxOpen(true)}
            >
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200" />
              )}
              <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4" />
              </div>
              {product.ribbons && product.ribbons.length > 0 && (
                <div className="absolute top-5 left-5 flex flex-col gap-2">
                  {product.ribbons.map((r) => (
                    <span
                      key={r}
                      className={cn(
                        "text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 rounded-full font-medium",
                        ribbonStyles[r] || "bg-stone-900 text-white",
                      )}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="mt-4 grid grid-cols-5 gap-2">
              {allImages.length > 0
                ? allImages.slice(0, 5).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-xl border-2 transition-all",
                        selectedImage === img
                          ? "border-stone-900"
                          : "border-stone-100 hover:border-stone-400",
                      )}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} view ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    </button>
                  ))
                : [0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl border-2 border-stone-100 bg-stone-100"
                    />
                  ))}
            </div>
          </AnimatedSection>

          {/* Info panel */}
          <AnimatedSection animation="slideInRight">
            <div className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-4">
              {categoryLabel}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-stone-900 mb-5 leading-[1.05]">
              {product.name}
            </h1>
            <p className="text-base text-stone-500 font-light leading-relaxed mb-8 max-w-lg">
              {product.description ||
                `${product.name} is a premium surface from Pacific Surfaces — engineered for beauty, durability, and effortless everyday performance. Ideal for residential kitchens, vanities, and light commercial applications.`}
            </p>

            {/* Quick specs */}
            <div className="grid grid-cols-2 gap-6 py-6 border-y border-stone-100 mb-8">
              <SpecCell label="Size" value={size} />
              <SpecCell label="Thickness" value={thicknesses.join(" · ")} />
              <SpecCell label="Finishes" value={finishes.join(" · ")} />
              <SpecCell label="Edges" value="Straight, Eased, Bevel" />
            </div>

            {/* Primary CTAs */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                onClick={() => setSampleOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide uppercase transition-colors duration-300 cursor-pointer bg-stone-900 text-white hover:bg-stone-800 border border-stone-900 px-7 py-3.5 text-sm"
              >
                <Package className="w-4 h-4" />
                Order Sample
              </button>
              <MagneticButton href="/contact" variant="outline" size="md">
                <MapPin className="w-4 h-4" />
                Find A Dealer
              </MagneticButton>
              <button
                onClick={toggleFav}
                aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                className={cn(
                  "w-12 h-12 rounded-full border flex items-center justify-center transition-colors",
                  isFav
                    ? "bg-stone-900 text-white border-stone-900"
                    : "border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900",
                )}
              >
                <Heart
                  className="w-4 h-4"
                  fill={isFav ? "currentColor" : "none"}
                />
              </button>
              <div className="relative">
                <button
                  onClick={handleShare}
                  aria-label="Share this product"
                  className="w-12 h-12 rounded-full border border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900 flex items-center justify-center transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {copied && (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: -8 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] uppercase text-emerald-700 whitespace-nowrap flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Link copied
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* WhatsApp + Secondary */}
            <div className="flex flex-wrap gap-5 text-xs font-light text-stone-500">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 hover:text-stone-900 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Enquire on WhatsApp
              </a>
              <a
                href="mailto:bindu@thepacific.group?subject=Spec%20Sheet%20Request"
                className="inline-flex items-center gap-1.5 hover:text-stone-900 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Spec Sheet
              </a>
              <Link
                href="/resources"
                className="inline-flex items-center gap-1.5 hover:text-stone-900 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Care Guide
              </Link>
              <Link
                href="/visualize"
                className="hover:text-stone-900 transition-colors underline underline-offset-4 decoration-stone-300"
              >
                Try in Your Space →
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== TABBED CONTENT ===== */}
      <section className="bg-stone-50 border-y border-stone-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex gap-0 border-b border-stone-200 overflow-x-auto no-scrollbar">
            {(
              [
                ["overview", "Overview"],
                ["specs", "Specifications"],
                ["applications", "Applications"],
                ["care", "Care & Maintenance"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "px-6 py-5 text-xs font-medium tracking-[0.25em] uppercase whitespace-nowrap -mb-px border-b-[2px] transition-colors",
                  activeTab === key
                    ? "text-stone-900 border-stone-900"
                    : "text-stone-500 border-transparent hover:text-stone-900",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="py-12 lg:py-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "overview" && (
                  <div className="max-w-3xl text-stone-600 font-light leading-relaxed space-y-5 text-base">
                    <p>
                      {product.description ||
                        `${product.name} brings a distinctive look to any room it's installed in. Engineered from premium raw materials and manufactured to exacting standards, it delivers the natural beauty of stone with performance you can rely on for decades.`}
                    </p>
                    <p>
                      Every Pacific Surfaces slab is inspected for consistency of
                      color, pattern, and finish before leaving our facility.
                      Pair with complementary products from our collection for a
                      fully coordinated installation.
                    </p>
                  </div>
                )}

                {activeTab === "specs" && (
                  <div className="max-w-3xl">
                    <dl className="divide-y divide-stone-200 border-y border-stone-200 text-sm">
                      <SpecRow label="Product Name" value={product.name} />
                      <SpecRow label="Category" value={categoryLabel} />
                      {product.collection && (
                        <SpecRow
                          label="Collection"
                          value={product.collection.name}
                        />
                      )}
                      <SpecRow label="Slab Size" value={size} />
                      <SpecRow
                        label="Available Thickness"
                        value={thicknesses.join(", ")}
                      />
                      <SpecRow label="Finishes" value={finishes.join(", ")} />
                      <SpecRow
                        label="Edge Profiles"
                        value="Straight, Eased, Bevel, Bullnose, Ogee"
                      />
                      <SpecRow label="Water Absorption" value="< 0.5%" />
                      <SpecRow label="Mohs Hardness" value="6 – 7" />
                      <SpecRow
                        label="Certifications"
                        value="NSF, Greenguard, ISO 9001:2015, CE Marking"
                      />
                      <SpecRow
                        label="Manufactured By"
                        value="Pacific Engineered Surfaces Pvt. Ltd."
                      />
                    </dl>
                  </div>
                )}

                {activeTab === "applications" && (
                  <StaggerContainer>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
                      {applications.map((a) => (
                        <StaggerItem key={a}>
                          <div className="flex items-center gap-3 px-5 py-4 bg-white border border-stone-100 rounded-2xl">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-sm text-stone-800 font-light">
                              {a}
                            </span>
                          </div>
                        </StaggerItem>
                      ))}
                    </div>
                  </StaggerContainer>
                )}

                {activeTab === "care" && (
                  <div className="max-w-3xl text-stone-600 font-light leading-relaxed space-y-5 text-base">
                    <p>
                      {product.careAndMaintenance ||
                        `Keep ${product.name} looking new with routine cleaning. For daily care, wipe with a soft cloth and mild dish soap. Avoid abrasive cleaners, scouring pads, and products containing bleach or ammonia on polished finishes.`}
                    </p>
                    <ul className="space-y-3 text-sm">
                      {[
                        "Blot spills immediately — especially acidic liquids like wine, citrus, or vinegar.",
                        "Use cutting boards and trivets under hot cookware to protect the finish.",
                        "Reseal annually if installed outdoors or in high-traffic commercial environments.",
                        "For stubborn marks, use a pH-neutral stone cleaner — avoid bleach and ammonia on polished finishes.",
                      ].map((t) => (
                        <li key={t} className="flex items-start gap-3">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-stone-400 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ===== RELATED PRODUCTS ===== */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-20">
          <AnimatedSection>
            <div className="text-center mb-12">
              <div className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-3">
                You May Also Like
              </div>
              <h2 className="text-3xl lg:text-4xl font-light tracking-tight text-stone-900">
                More From {product.collection?.name || "Our Collection"}
              </h2>
            </div>
          </AnimatedSection>
          <StaggerContainer>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {product.relatedProducts.map((rp) => (
                <StaggerItem key={rp._id}>
                  <Link
                    href={`/products/${rp.slug.current}`}
                    className="group block bg-white border border-stone-100 rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(12,10,9,0.15)]"
                  >
                    <div className="relative aspect-square bg-stone-100">
                      {rp.mainImage ? (
                        <Image
                          src={rp.mainImage}
                          alt={rp.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200" />
                      )}
                    </div>
                    <div className="p-5">
                      <h4 className="text-base font-light tracking-tight text-stone-900 group-hover:text-stone-600 transition-colors">
                        {rp.name}
                      </h4>
                      <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-stone-400 mt-2">
                        View Product
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </section>
      )}

      {/* ===== DARK CTA STRIP ===== */}
      <section className="relative bg-stone-950 text-white overflow-hidden">
        {/* Grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-16 lg:py-20 text-center">
          <AnimatedSection>
            <div className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-4">
              See It In Person
            </div>
            <h3 className="text-3xl lg:text-5xl font-light tracking-tight mb-5">
              Bring {product.name} home.
            </h3>
            <p className="text-base text-stone-400 font-light leading-relaxed max-w-xl mx-auto mb-8">
              Order a sample to feel the texture and see the color in your own
              lighting — or connect with our team to find an authorized dealer
              near you.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSampleOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide uppercase transition-colors duration-300 cursor-pointer bg-white text-stone-900 hover:bg-stone-100 px-7 py-3.5 text-sm"
              >
                <Package className="w-4 h-4" />
                Order Sample
              </button>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide uppercase transition-colors duration-300 bg-transparent text-white border border-white/30 hover:border-white px-7 py-3.5 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Us
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== LIGHTBOX ===== */}
      <AnimatePresence>
        {lightboxOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-950/95 flex items-center justify-center p-6"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              aria-label="Close"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full max-w-5xl aspect-[4/3]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== ORDER SAMPLE MODAL ===== */}
      <OrderSampleModal
        open={sampleOpen}
        onClose={() => setSampleOpen(false)}
        productName={product.name}
        productCategory={categoryLabel}
      />
    </>
  );
}

function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium tracking-[0.25em] uppercase text-stone-400 mb-1.5">
        {label}
      </div>
      <div className="text-sm text-stone-900 font-light">{value}</div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 py-4">
      <dt className="col-span-1 text-[10px] font-medium tracking-[0.25em] uppercase text-stone-400">
        {label}
      </dt>
      <dd className="col-span-2 text-stone-800 font-light">{value}</dd>
    </div>
  );
}

export default ProductDetail;
