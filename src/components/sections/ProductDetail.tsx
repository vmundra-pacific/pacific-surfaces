"use client";

import { useEffect, useState, useRef } from "react";
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
  ShieldCheck,
  Play,
} from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { OrderSampleModal } from "@/components/ui/order-sample-modal";
import { PortableText } from "@portabletext/react";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PortableTextBlock = any;

type ImageView = "slab" | "closeup" | "vignette" | "roomScene" | "video";

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string | PortableTextBlock[];
  mainImage?: string;
  gallery?: string[];
  roomScenes?: string[];
  ribbons?: string[];
  price?: number;
  category?: { name: string; slug: { current: string } };
  collection?: { name: string; slug: { current: string } };
  size?: string;
  finishes?: string[];
  thickness?: string[];
  application?: string[];
  careAndMaintenance?: string | PortableTextBlock[];
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

const SECTION_IDS = [
  { id: "sec-gallery", label: "Gallery" },
  { id: "sec-about", label: "About" },
  { id: "sec-product-info", label: "Product Info" },
  { id: "sec-similar-colors", label: "Similar Styles" },
];

export function ProductDetail({ product }: { product: Product }) {
  // ---- Image sets ----
  const slabImage = product.mainImage || "";
  const galleryImages = product.gallery?.length ? product.gallery : [];
  const sceneImages = product.roomScenes?.length ? product.roomScenes : [];

  // Build thumbnail list (MSI-style: Slab → Close Up → Vignettes → Room Scenes)
  const thumbnails: { src: string; label: string; type: ImageView }[] = [];
  if (slabImage)
    thumbnails.push({ src: slabImage, label: "Slab", type: "slab" });
  if (galleryImages[0])
    thumbnails.push({
      src: galleryImages[0],
      label: "Close Up",
      type: "closeup",
    });
  galleryImages.slice(1).forEach((img, i) => {
    thumbnails.push({
      src: img,
      label: `Vignette${i > 0 ? ` ${i + 1}` : ""}`,
      type: "vignette",
    });
  });
  sceneImages.forEach((img, i) => {
    thumbnails.push({
      src: img,
      label: `Room Scene${i > 0 ? ` ${i + 1}` : ""}`,
      type: "roomScene",
    });
  });

  // ---- Derived data ----
  const finishes = product.finishes?.length
    ? product.finishes
    : ["Polished", "Honed"];
  const thicknesses = product.thickness?.length
    ? product.thickness
    : ["2 cm", "3 cm"];
  const applications = product.application?.length
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

  // ---- State ----
  const [selectedImage, setSelectedImage] = useState(slabImage);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sampleOpen, setSampleOpen] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [copied, setCopied] = useState(false);
  const [roomScenesOpen, setRoomScenesOpen] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<
    "specs" | "sizes" | "applications"
  >("specs");

  // Sticky section nav: active section tracking
  const [activeSection, setActiveSection] = useState("sec-gallery");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );

    SECTION_IDS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Favorites
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
        /* fall through */
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
      `Hi, I'm interested in ${product.name} from Pacific Surfaces. Please share more details and pricing.`
    );

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ===== HERO IMAGE — FULL WIDTH (MSI-style) ===== */}
      <section
        id="sec-gallery"
        ref={(el) => {
          sectionRefs.current["sec-gallery"] = el;
        }}
        className="relative bg-stone-100 pt-20"
      >
        {/* Main image — full-width, tall */}
        <div
          className="relative w-full aspect-[16/9] max-h-[80vh] overflow-hidden cursor-zoom-in group"
          onClick={() => selectedImage && setLightboxOpen(true)}
        >
          {selectedImage ? (
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.01]"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200" />
          )}

          {/* Ribbons */}
          {product.ribbons && product.ribbons.length > 0 && (
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              {product.ribbons.map((r) => (
                <span
                  key={r}
                  className={cn(
                    "text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 rounded-full font-medium",
                    ribbonStyles[r] || "bg-stone-900 text-white"
                  )}
                >
                  {r}
                </span>
              ))}
            </div>
          )}

          {/* Overlay buttons — Room Scenes + Zoom */}
          <div className="absolute top-6 right-6 flex items-center gap-3">
            {sceneImages.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRoomScenesOpen(true);
                }}
                className="flex items-center gap-2 bg-white/95 backdrop-blur-sm text-stone-900 px-4 py-2.5 rounded-full text-xs font-medium tracking-[0.15em] uppercase hover:bg-white transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                Room Scenes
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(true);
              }}
              className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-stone-900 hover:bg-white transition-colors shadow-sm"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Click to expand label */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] tracking-[0.3em] uppercase text-white bg-stone-900/70 backdrop-blur-sm px-4 py-2 rounded-full">
              Click to expand
            </span>
          </div>
        </div>

        {/* Thumbnail strip — horizontal scroll */}
        {thumbnails.length > 1 && (
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex gap-2 py-4 overflow-x-auto no-scrollbar">
              {thumbnails.map((thumb, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(thumb.src)}
                  className={cn(
                    "relative shrink-0 w-20 h-20 md:w-24 md:h-24 overflow-hidden rounded-xl border-2 transition-all group/thumb",
                    selectedImage === thumb.src
                      ? "border-stone-900"
                      : "border-stone-200 hover:border-stone-500"
                  )}
                >
                  <Image
                    src={thumb.src}
                    alt={thumb.label}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-900/80 to-transparent pt-4 pb-1 px-1">
                    <span className="text-[8px] font-medium tracking-[0.15em] uppercase text-white/90 block text-center truncate">
                      {thumb.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ===== ROOM SCENES OVERLAY (MSI-style horizontal gallery) ===== */}
      <AnimatePresence>
        {roomScenesOpen && sceneImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4">
              <h3 className="text-white text-sm font-medium tracking-[0.2em] uppercase">
                Room Scenes — {product.name}
              </h3>
              <button
                onClick={() => setRoomScenesOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-8">
              <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4">
                {sceneImages.map((img, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group"
                    onClick={() => {
                      setSelectedImage(img);
                      setRoomScenesOpen(false);
                      setLightboxOpen(true);
                    }}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} Room Scene ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== BREADCRUMB ===== */}
      <nav className="bg-white border-b border-stone-100">
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

      {/* ===== STICKY PAGE SECTION NAV (MSI-style) ===== */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
            {SECTION_IDS.filter(({ id }) => {
              if (id === "sec-similar-colors")
                return (
                  product.relatedProducts && product.relatedProducts.length > 0
                );
              return true;
            }).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={cn(
                  "px-5 py-4 text-xs font-medium tracking-[0.2em] uppercase whitespace-nowrap border-b-[2px] -mb-px transition-colors",
                  activeSection === id
                    ? "text-stone-900 border-stone-900"
                    : "text-stone-400 border-transparent hover:text-stone-700"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== ABOUT SECTION — Product Name + Description + CTAs (MSI-style) ===== */}
      <section
        id="sec-about"
        ref={(el) => {
          sectionRefs.current["sec-about"] = el;
        }}
        className="scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-20">
            {/* Left — name + description */}
            <AnimatedSection animation="fadeUp">
              {/* Category tag */}
              <div className="text-xs font-medium tracking-[0.3em] uppercase text-stone-500 mb-4">
                {categoryLabel}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-stone-900 mb-8 leading-[1.05]">
                {product.name}
              </h1>

              {/* Description */}
              <div className="text-base text-stone-600 font-light leading-relaxed max-w-2xl mb-8">
                {product.description ? (
                  typeof product.description === "string" ? (
                    <p>{product.description}</p>
                  ) : (
                    <PortableText value={product.description} />
                  )
                ) : (
                  <p>
                    Inspired by natural stone, {product.name} is a premium
                    surface from Pacific Surfaces — engineered for beauty,
                    durability, and effortless everyday performance. Ideal for
                    creating beautiful countertops, waterfall islands, and
                    accent walls in both residential and commercial
                    environments.
                  </p>
                )}
              </div>

              {/* Inline quick specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-stone-100 mb-8">
                <SpecCell label="Slab Size" value={size} />
                <SpecCell label="Finishes" value={finishes.join(", ")} />
                <SpecCell label="Thickness" value={thicknesses.join(", ")} />
                <SpecCell label="Edges" value="Straight, Eased, Bevel" />
              </div>

              {/* Secondary links */}
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
                  href="/visualize"
                  className="hover:text-stone-900 transition-colors underline underline-offset-4 decoration-stone-300"
                >
                  Try in Your Space →
                </Link>
              </div>
            </AnimatedSection>

            {/* Right — CTAs panel (MSI-style sidebar) */}
            <AnimatedSection animation="slideInRight">
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100">
                {/* Primary CTAs */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setSampleOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide uppercase transition-colors duration-300 cursor-pointer bg-stone-900 text-white hover:bg-stone-800 border border-stone-900 px-7 py-3.5 text-sm"
                  >
                    <Package className="w-4 h-4" />
                    Order Sample
                  </button>
                  <MagneticButton
                    href="/contact"
                    variant="outline"
                    size="md"
                    className="w-full justify-center"
                  >
                    <MapPin className="w-4 h-4" />
                    Find A Dealer
                  </MagneticButton>
                </div>

                {/* Divider */}
                <div className="border-t border-stone-200 my-6" />

                {/* Action row */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={toggleFav}
                    aria-label={
                      isFav ? "Remove from favorites" : "Add to favorites"
                    }
                    className={cn(
                      "w-11 h-11 rounded-full border flex items-center justify-center transition-colors",
                      isFav
                        ? "bg-stone-900 text-white border-stone-900"
                        : "border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900"
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
                      className="w-11 h-11 rounded-full border border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900 flex items-center justify-center transition-colors"
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
                          <Copy className="w-3 h-3" /> Copied
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== PRODUCT INFO — Tabbed (MSI-style: Specs | Sizes & Finishes | Applications) ===== */}
      <section
        id="sec-product-info"
        ref={(el) => {
          sectionRefs.current["sec-product-info"] = el;
        }}
        className="bg-stone-50 border-y border-stone-100 scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Tab bar */}
          <div className="flex gap-0 border-b border-stone-200 overflow-x-auto no-scrollbar">
            {(
              [
                ["specs", "Specs"],
                ["sizes", "Sizes & Finishes"],
                ["applications", "Applications"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveInfoTab(key)}
                className={cn(
                  "px-6 py-5 text-xs font-medium tracking-[0.25em] uppercase whitespace-nowrap -mb-px border-b-[2px] transition-colors",
                  activeInfoTab === key
                    ? "text-stone-900 border-stone-900"
                    : "text-stone-500 border-transparent hover:text-stone-900"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="py-12 lg:py-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeInfoTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {activeInfoTab === "specs" && (
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
                        label="Available Finishes"
                        value={finishes.join(", ")}
                      />
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

                {activeInfoTab === "sizes" && (
                  <div className="max-w-3xl space-y-8">
                    {/* Slabs */}
                    <div>
                      <h3 className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-4">
                        Slabs
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {thicknesses.map((t) => (
                          <div
                            key={t}
                            className="flex items-center justify-between px-5 py-4 bg-white border border-stone-100 rounded-2xl"
                          >
                            <div>
                              <div className="text-sm font-medium text-stone-900">
                                {t}
                              </div>
                              <div className="text-xs text-stone-500 font-light">
                                {size}
                              </div>
                            </div>
                            <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400 font-medium">
                              Slab
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Finishes */}
                    <div>
                      <h3 className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-4">
                        Available Finishes
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {finishes.map((f) => (
                          <span
                            key={f}
                            className="px-4 py-2 rounded-full text-xs font-medium tracking-[0.15em] uppercase border border-stone-200 text-stone-700"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeInfoTab === "applications" && (
                  <StaggerContainer>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
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
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ===== CARE & MAINTENANCE (collapsed below product info, like MSI additional resources) ===== */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-20">
        <AnimatedSection animation="fadeUp">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Care info */}
            <div>
              <div className="text-xs font-medium tracking-[0.3em] uppercase text-stone-500 mb-3">
                Care & Maintenance
              </div>
              <div className="text-base text-stone-600 font-light leading-relaxed space-y-4">
                {product.careAndMaintenance ? (
                  typeof product.careAndMaintenance === "string" ? (
                    <p>{product.careAndMaintenance}</p>
                  ) : (
                    <PortableText value={product.careAndMaintenance} />
                  )
                ) : (
                  <p>
                    Keep {product.name} looking new with routine cleaning. For
                    daily care, wipe with a soft cloth and mild dish soap. Avoid
                    abrasive cleaners, scouring pads, and products containing
                    bleach or ammonia on polished finishes.
                  </p>
                )}
                <ul className="space-y-3 text-sm">
                  {[
                    "Blot spills immediately — especially acidic liquids like wine, citrus, or vinegar.",
                    "Use cutting boards and trivets under hot cookware to protect the finish.",
                    "Reseal annually if installed outdoors or in high-traffic commercial environments.",
                    "For stubborn marks, use a pH-neutral stone cleaner.",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-stone-400 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Downloads (MSI-style resource cards) */}
            <div>
              <div className="text-xs font-medium tracking-[0.3em] uppercase text-stone-500 mb-3">
                Downloads & Resources
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    title: "Technical Spec Sheet",
                    desc: "Dimensions, tolerances & certifications",
                    subject: "Spec Sheet Request",
                  },
                  {
                    title: "Care Guide",
                    desc: "Daily care, stain removal & sealing",
                    subject: "Care Guide Request",
                  },
                  {
                    title: "Installation Guide",
                    desc: "Fabrication & installation tips",
                    subject: "Installation Guide Request",
                  },
                  {
                    title: "Safety Data Sheet",
                    desc: "Material composition & handling",
                    subject: "Safety Data Sheet Request",
                  },
                ].map(({ title, desc, subject }) => (
                  <a
                    key={title}
                    href={`mailto:bindu@thepacific.group?subject=${encodeURIComponent(
                      `${subject} — ${product.name}`
                    )}`}
                    className="group flex items-start gap-3 p-4 bg-stone-50 border border-stone-100 rounded-2xl hover:border-stone-300 hover:shadow-sm transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 group-hover:bg-stone-900 transition-colors">
                      <Download className="w-3.5 h-3.5 text-stone-500 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-stone-900 mb-0.5">
                        {title}
                      </div>
                      <div className="text-xs font-light text-stone-500 leading-relaxed">
                        {desc}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ===== SIMILAR STYLES (MSI-style) ===== */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section
          id="sec-similar-colors"
          ref={(el) => {
            sectionRefs.current["sec-similar-colors"] = el;
          }}
          className="bg-stone-50 border-y border-stone-100 scroll-mt-16"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
            <AnimatedSection animation="fadeUp">
              <div className="text-xs font-medium tracking-[0.3em] uppercase text-stone-500 mb-3">
                Similar Styles
              </div>
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900 mb-10">
                You May Also Like
              </h2>
            </AnimatedSection>
            <StaggerContainer>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                {product.relatedProducts.map((rp) => (
                  <StaggerItem key={rp._id}>
                    <Link
                      href={`/products/${rp.slug.current}`}
                      className="group block"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-2xl border border-stone-100 bg-stone-100 mb-3">
                        {rp.mainImage ? (
                          <Image
                            src={rp.mainImage}
                            alt={rp.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200" />
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-stone-900 group-hover:text-stone-600 transition-colors tracking-tight">
                        {rp.name}
                      </h3>
                    </Link>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ===== CERTIFICATIONS STRIP (MSI-style badges) ===== */}
      <section className="bg-stone-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <AnimatedSection animation="fadeIn">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { name: "NSF Certified", desc: "Food Equipment Materials" },
                { name: "Greenguard Gold", desc: "Indoor Air Quality" },
                { name: "ISO 9001:2015", desc: "Quality Management" },
                { name: "CE Marking", desc: "European Conformity" },
              ].map((cert) => (
                <div
                  key={cert.name}
                  className="flex flex-col items-center gap-2"
                >
                  <ShieldCheck className="w-8 h-8 text-white/60" />
                  <div className="text-xs font-medium tracking-[0.2em] uppercase text-white/90">
                    {cert.name}
                  </div>
                  <div className="text-[10px] text-white/40 font-light">
                    {cert.desc}
                  </div>
                </div>
              ))}
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
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
              className="relative w-full max-w-6xl aspect-[16/10]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </motion.div>

            {/* Lightbox thumbnails */}
            {thumbnails.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {thumbnails.slice(0, 8).map((thumb, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(thumb.src);
                    }}
                    className={cn(
                      "relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                      selectedImage === thumb.src
                        ? "border-white"
                        : "border-white/20 hover:border-white/60"
                    )}
                  >
                    <Image
                      src={thumb.src}
                      alt={thumb.label}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </button>
                ))}
              </div>
            )}
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

/* ── Helper components ── */

function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium tracking-[0.25em] uppercase text-stone-400 mb-1">
        {label}
      </div>
      <div className="text-sm text-stone-800 font-light">{value}</div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 py-3.5">
      <dt className="text-stone-500 font-light">{label}</dt>
      <dd className="text-stone-900 font-medium text-right">{value}</dd>
    </div>
  );
}
