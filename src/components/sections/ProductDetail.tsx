"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { preload } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronUp,
  ChevronDown,
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
  Home,
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
import { pickSimilar } from "@/lib/product-similarity";
import { zoomImageUrl } from "@/lib/zoom-image";

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
  /** High-res image asset URL for download (optional, from Sanity hdFile field). */
  hdFileUrl?: string;
  /** Spec sheet PDF asset URL (optional, from Sanity specSheet field). */
  specSheetUrl?: string;
  ribbons?: string[];
  price?: number;
  category?: { name: string; slug: { current: string } };
  collection?: { name: string; slug: { current: string } };
  size?: string;
  finishes?: string[];
  thickness?: string[];
  application?: string[];
  careAndMaintenance?: string | PortableTextBlock[];
  manualHues?: string[];
  relatedProducts?: {
    _id: string;
    name: string;
    slug: { current: string };
    mainImage?: string;
    price?: number;
    collectionName?: string;
    categoryName?: string;
    manualHues?: string[];
  }[];
  allOtherProducts?: {
    _id: string;
    name: string;
    slug: { current: string };
    mainImage?: string;
    price?: number;
    categoryName?: string;
    collectionName?: string;
    manualHues?: string[];
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
  // ---- Similar-product ranking — single source of truth ----
  // Computed once here and reused by:
  //   - the "You May Also Like" rail below, AND
  //   - the Compare Colors picker (shows the same 5 picks as initial
  //     visible chips, then a popup for searching all products)
  // Both touchpoints now share the same ranked candidate list, so the
  // colours offered for comparison match the ones we're recommending.
  // Ranking lives in src/lib/product-similarity.ts:
  //   Tier 1 = same collection, Tier 2 = same hue, Tier 3 = anything else.
  const picks = pickSimilar(
    product,
    product.relatedProducts ?? [],
    product.allOtherProducts ?? [],
    5
  );

  // ---- Image sets ----
  const slabImage = product.mainImage || "";
  const galleryImages = product.gallery?.length ? product.gallery : [];
  const sceneImages = product.roomScenes?.length ? product.roomScenes : [];

  // No more aggressive eager preloading. The magnifier <img> below
  // mounts on page render with `loading="eager"` so it loads in the
  // background while the user reads the page — by the time they
  // hover the slab, it's already there. If the image hasn't quite
  // finished loading yet, the magnifier still appears immediately
  // (the <img> just paints whatever pixels it has).

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
  // Finishes / applications now come ONLY from Sanity. No hardcoded
  // fallbacks — if an editor leaves these blank on a product, the
  // corresponding sections hide entirely (handled in the render
  // code below) instead of misleadingly showing "Polished / Honed"
  // or a generic 5-item Applications grid.
  const finishes = product.finishes ?? [];
  const thicknesses = product.thickness?.length
    ? product.thickness
    : ["2 cm", "3 cm"];
  const applications = product.application ?? [];
  const size = product.size || '126" x 63"';
  const categoryLabel =
    product.category?.name || product.collection?.name || "Quartz Surfaces";

  // Specialty products (Semi-Precious / Exotic / Centrepiece Couture
  // / Integra / Natural Stone Finishes) are NOT standard quartz slabs.
  // Several quartz-only UI bits are hidden for them:
  //   - "Specs" tab in Product Info (water absorption, Mohs, etc.)
  //   - Thicknesses listing in Sizes & Finishes
  //   - "Slab" / "Close Up" thumbnail labels (the items are pieces,
  //     not slab-stock — those labels read wrong on a sink or a
  //     gallery centrepiece)
  //   - "View in a Room" Visualizer thumbnail (visualizer is built
  //     around standard slab compositing)
  //   - Compare Colors section (slab-on-slab comparison is moot for
  //     specialty pieces)
  // Match by category slug or collection name, case-insensitive
  // prefix so editor renames don't break the gating.
  const isSpecialtyProduct = (() => {
    const cat = (
      product.category?.slug?.current ||
      product.category?.name ||
      ""
    ).toLowerCase();
    const col = (product.collection?.name || "").toLowerCase();
    const haystacks = `${cat} ${col}`;
    return (
      haystacks.includes("semi") ||
      haystacks.includes("exotic") ||
      haystacks.includes("centrepiece") ||
      haystacks.includes("integra") ||
      haystacks.includes("sink") ||
      haystacks.includes("sinks") ||
      haystacks.includes("natural stone") ||
      haystacks.includes("natural-stone") ||
      haystacks.includes("stone finish") ||
      haystacks.includes("stone-finish")
    );
  })();

  // ---- State ----
  const [selectedImage, setSelectedImage] = useState(slabImage);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sampleOpen, setSampleOpen] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [copied, setCopied] = useState(false);
  const [roomScenesOpen, setRoomScenesOpen] = useState(false);
  // The Sizes & Finishes tab has two possible blocks:
  //   - Thicknesses (hidden for specialty products)
  //   - Available Finishes (only when finishes are set in Sanity)
  // If neither will render, the tab body is empty and the tab itself
  // should be suppressed.
  const hasSizesContent =
    (!isSpecialtyProduct && thicknesses.length > 0) || finishes.length > 0;

  // Default active tab — pick the first tab that will actually render
  // content. Specs first (when not specialty), then Sizes (when it has
  // content), then Applications as the always-on fallback.
  const defaultTab: "specs" | "sizes" | "applications" = isSpecialtyProduct
    ? hasSizesContent
      ? "sizes"
      : "applications"
    : "specs";
  const [activeInfoTab, setActiveInfoTab] = useState<
    "specs" | "sizes" | "applications"
  >(defaultTab);

  // Zoom-on-hover state (only for slab/main image)
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const zoomImgRef = useRef<HTMLImageElement>(null);
  const ZOOM_LEVEL = 3;
  const isSlabSelected = selectedImage === slabImage;
  const zoomSrc = zoomImageUrl(selectedImage);

  // INSTANT ZOOM: force-decode the magnifier image into GPU memory as
  // soon as we know the URL. The browser already started downloading
  // it (SSR preload + react-dom preload + hidden <img>) — `decode()`
  // pushes the bytes through the decoder so they're ready for paint
  // before the user hovers. The decode result is fire-and-forget; the
  // hover renders a real <img> element regardless of decode status,
  // and the decode call simply warms the cache so first paint after
  // hover is instant. (Previously gated a `zoomReady` flag that
  // nothing rendered against — removed in the cleanup pass.)
  useEffect(() => {
    if (!zoomSrc) return;
    const img = new window.Image();
    img.src = zoomSrc;
    img.decode().catch(() => {});
  }, [zoomSrc]);

  // Compare mode — handled by CompareSliderSection at bottom of page

  // Auto-scroll carousel: cycles both thumbnails AND the main image
  const [carouselPaused, setCarouselPaused] = useState(false);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const carouselIndexRef = useRef(0);

  useEffect(() => {
    if (!thumbnails.length || thumbnails.length <= 1) return;
    if (carouselPaused) {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      return;
    }
    autoScrollRef.current = setInterval(() => {
      const nextIdx = (carouselIndexRef.current + 1) % thumbnails.length;
      carouselIndexRef.current = nextIdx;
      // Update main image
      setSelectedImage(thumbnails[nextIdx].src);
      // Scroll thumbnail strip to show the active thumbnail (scoped to strip only)
      const strip = thumbStripRef.current;
      if (strip) {
        const thumbEl = strip.children[nextIdx] as HTMLElement | undefined;
        if (thumbEl) {
          const thumbTop = thumbEl.offsetTop - strip.offsetTop;
          const thumbBottom = thumbTop + thumbEl.offsetHeight;
          const visibleTop = strip.scrollTop;
          const visibleBottom = visibleTop + strip.clientHeight;
          if (thumbTop < visibleTop) {
            strip.scrollTo({ top: thumbTop, behavior: "smooth" });
          } else if (thumbBottom > visibleBottom) {
            strip.scrollTo({
              top: thumbBottom - strip.clientHeight,
              behavior: "smooth",
            });
          }
        }
      }
    }, 5000);
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carouselPaused, thumbnails.length]);

  // Prevent page scroll when cursor is over the main hero image
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const blockScroll = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", blockScroll, { passive: false });
    return () => el.removeEventListener("wheel", blockScroll);
  }, []);

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
      {/* ===== HERO — LEFT THUMBNAILS + MAIN IMAGE =====
          The main slab image fills the FULL width of the hero. The
          thumbnail rail floats on top of it (no black gutter column),
          so the slab is visible across the whole stage including
          behind/around the cards — just like the ss reference. */}
      <section
        id="sec-gallery"
        ref={(el) => {
          sectionRefs.current["sec-gallery"] = el;
        }}
        className="relative bg-stone-950 pt-20"
      >
        <div className="relative h-[calc(100vh-80px)]">
          {/* LEFT vertical thumbnail rail — floats over the slab.
              Background of the column itself is transparent so the
              slab image bleeds through; only the cards have their
              own backgrounds. Roomvo-style: image card + label band,
              teal accent ring on the active card (ss2). */}
          {thumbnails.length > 1 && (
            <div
              className="hidden md:flex flex-col absolute left-0 top-0 bottom-0 z-20 w-[120px] lg:w-[140px] px-2 py-2"
              onMouseEnter={() => setCarouselPaused(true)}
              onMouseLeave={() => setCarouselPaused(false)}
            >
              {/* Scroll-up button at the top, mirroring the
                  scroll-down at the bottom. Only shown when there's
                  enough content to overflow the rail. */}
              {thumbnails.length > 4 && (
                <button
                  onClick={() =>
                    thumbStripRef.current?.scrollBy({
                      top: -160,
                      behavior: "smooth",
                    })
                  }
                  className="mb-2 w-full py-2 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
                  aria-label="Scroll thumbnails up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              )}

              {/* Thumbnails */}
              <div
                ref={thumbStripRef}
                className="flex-1 flex flex-col gap-2.5 overflow-y-auto no-scrollbar"
              >
                {thumbnails.map((thumb, i) => {
                  const isActive = selectedImage === thumb.src;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedImage(thumb.src);
                        carouselIndexRef.current = i;
                      }}
                      className={cn(
                        "relative shrink-0 w-full overflow-hidden rounded-[2px] transition-all",
                        // Soft drop shadow gives each card lift over the
                        // slab (matches the ss). Slightly heavier shadow
                        // on the active card for emphasis.
                        isActive
                          ? "ring-2 ring-[#5b9b9b] shadow-[0_8px_22px_-4px_rgba(0,0,0,.55)]"
                          : "opacity-95 hover:opacity-100 shadow-[0_6px_18px_-6px_rgba(0,0,0,.5)] hover:shadow-[0_8px_22px_-4px_rgba(0,0,0,.55)]"
                      )}
                    >
                      {/* Thumbnail image */}
                      <div className="relative w-full aspect-[4/3] bg-stone-900">
                        <Image
                          src={thumb.src}
                          alt={thumb.label}
                          fill
                          className="object-cover"
                          sizes="140px"
                        />
                      </div>
                      {/* Label band under the image — hidden for
                          specialty products (Semi-Precious, Exotic,
                          Centrepiece Couture, Integra, Natural Stone
                          Finishes) where labels like "Slab" /
                          "Close Up" misrepresent the piece. */}
                      {!isSpecialtyProduct && (
                        <div className="bg-stone-700/80 py-1.5 px-2">
                          <span className="text-[10px] font-medium tracking-[0.05em] text-white/95 block text-center truncate">
                            {thumb.label}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* "View in a Room" Visualizer card — hidden for
                    specialty products (visualizer is built around
                    slab-on-countertop compositing, doesn't apply to
                    sinks / centrepieces / semi-precious / etc.). */}
                {!isSpecialtyProduct && (
                <Link
                  href="/visualize"
                  className="relative shrink-0 w-full overflow-hidden rounded-[2px] hover:opacity-100 opacity-95 transition-all shadow-[0_6px_18px_-6px_rgba(0,0,0,.5)] hover:shadow-[0_8px_22px_-4px_rgba(0,0,0,.55)] group/room"
                >
                  <div className="relative w-full aspect-[4/3] bg-stone-800">
                    {sceneImages[0] ? (
                      <Image
                        src={sceneImages[0]}
                        alt="View in a Room"
                        fill
                        className="object-cover"
                        sizes="140px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-stone-700 to-stone-900" />
                    )}
                    <div className="absolute inset-0 bg-stone-950/55 flex items-center justify-center">
                      <div className="text-center leading-tight">
                        <div className="text-[12px] font-bold tracking-[0.06em] text-white">
                          VIEW IN
                          <br />A ROOM
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-stone-700/80 py-1.5 px-2">
                    <span className="text-[10px] font-medium tracking-[0.05em] text-white/95 block text-center truncate">
                      Visualizer
                    </span>
                  </div>
                </Link>
                )}
              </div>

              {/* Single down-arrow at the bottom (matches ss2). Only
                  shown when there's something to scroll to. */}
              {thumbnails.length > 4 && (
                <button
                  onClick={() =>
                    thumbStripRef.current?.scrollBy({
                      top: 160,
                      behavior: "smooth",
                    })
                  }
                  className="mt-2 w-full py-2 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
                  aria-label="Scroll thumbnails down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Main image area — absolutely fills the entire hero so the
              slab bleeds under the floating thumbnail rail. */}
          <div className="absolute inset-0 z-0">
            <div
              ref={heroRef}
              className={cn(
                "relative w-full h-full overflow-hidden group",
                isSlabSelected ? "cursor-crosshair" : "cursor-pointer"
              )}
              onClick={() => {
                if (!isSlabSelected && selectedImage) setLightboxOpen(true);
              }}
              onMouseEnter={() => {
                // Pause the auto-carousel while the user engages, so
                // their selection stays put.
                setCarouselPaused(true);
                // Only enable zoom when the slab is the image actually
                // on screen. We never auto-swap to the slab — if the
                // user explicitly chose Close Up or a Room Scene, that
                // choice is respected; hovering just gives the
                // click-to-expand affordance.
                if (isSlabSelected) setZoomActive(true);
              }}
              onMouseLeave={() => {
                setZoomActive(false);
                setCarouselPaused(false);
              }}
              onMouseMove={(e) => {
                if (!heroRef.current || !isSlabSelected) return;
                // Defensive activation. `mouseenter` only fires when
                // the cursor crosses into the element — if the cursor
                // is ALREADY inside the canvas at page load (no
                // crossing event), `mouseenter` never fires and
                // zoomActive would stay false until the next entry.
                // Activating on the first mousemove while we're over
                // the slab guarantees the magnifier opens on initial
                // load too, not just after the user clicks something
                // that triggers a re-render.
                if (!zoomActive) {
                  setZoomActive(true);
                  setCarouselPaused(true);
                }
                const rect = heroRef.current.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoomPos({ x, y });
              }}
            >
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200" />
              )}

              {/* MSI-style zoom: crosshair box on image + magnified panel */}
              {zoomActive && isSlabSelected && selectedImage && (
                <>
                  {/* Crosshair indicator box on main image */}
                  <div
                    className="pointer-events-none absolute z-20 border border-white/60 bg-white/10"
                    style={{
                      width: "200px",
                      height: "200px",
                      left: `calc(${zoomPos.x}% - 100px)`,
                      top: `calc(${zoomPos.y}% - 100px)`,
                    }}
                  />
                  {/* Label inside crosshair */}
                  <div
                    className="pointer-events-none absolute z-20 flex items-end justify-end"
                    style={{
                      width: "200px",
                      height: "200px",
                      left: `calc(${zoomPos.x}% - 100px)`,
                      top: `calc(${zoomPos.y}% - 100px)`,
                    }}
                  >
                    <span className="text-[9px] tracking-[0.2em] uppercase text-white/80 bg-stone-900/50 px-2 py-1 m-1">
                      Slab
                    </span>
                  </div>
                </>
              )}

              {/* Ribbons — moved from top-left to top-right because
                  the left-aligned vertical thumbnail rail floats over
                  the same area at md+, hiding the ribbon (Luxury
                  Drop, Patented, New Arrival, etc.) behind the rail.
                  Right-edge anchor keeps the ribbon visible across
                  every breakpoint. */}
              {product.ribbons && product.ribbons.length > 0 && (
                <div className="absolute top-6 right-6 flex flex-col gap-2 z-10 items-end">
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

              {/* Click to Expand label — only on non-slab images
                  (slab uses hover-zoom instead). */}
              {!isSlabSelected && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  <span className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-white/80 bg-stone-900/50 backdrop-blur-sm px-4 py-2.5 rounded-full">
                    <ZoomIn className="w-3.5 h-3.5" /> Click to Expand
                  </span>
                </div>
              )}

              {/* ===== BOTTOM TOOLBAR (Silestone-style) =====
                  - Zoom button: icon only (the action is universally
                    legible)
                  - Hairline separator between the two controls so
                    they read as distinct affordances rather than a
                    single cluster
                  - Visualizer button: icon + "Visualizer" text label
                    so users know what the home glyph leads to */}
              <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-stone-900/70 backdrop-blur-md rounded-full pl-2 pr-3 py-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxOpen(true);
                  }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  title="Zoom / Expand"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {/* Vertical hairline separator between zoom + viz */}
                <span
                  aria-hidden="true"
                  className="w-px h-5 bg-white/20 mx-1"
                />
                <Link
                  href="/visualize"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-3 py-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  title="View in a Room"
                >
                  <Home className="w-4 h-4" />
                  <span className="text-[11px] font-medium tracking-[0.18em] uppercase">
                    Visualizer
                  </span>
                </Link>
              </div>
            </div>

            {/* INSTANT-ZOOM MAGNIFIER PANEL.
                The whole panel is mounted from page load — never
                conditionally on hover — with the real <img> inside.
                The image lazy-loads in the background as soon as the
                page renders (`loading="eager"` so the request starts
                immediately, but the image isn't visible yet so it
                doesn't compete with the hero paint). On hover we
                just toggle opacity. No mount/unmount, no
                `backgroundImage` (which forces a fresh decode on
                every hover), no AnimatePresence delay — just an
                already-decoded <img> coming into view. Panning is
                also smoother because we use a CSS `transform` on the
                <img> rather than animating `backgroundPosition`.
                Slab-only — snap-back in onMouseEnter ensures the
                slab is selected the instant the user hovers. */}
            {isSlabSelected && selectedImage && (
              <div
                aria-hidden={!zoomActive}
                className={cn(
                  "absolute top-4 left-4 md:left-[136px] lg:left-[156px] z-30 w-[40%] aspect-square max-w-[500px] border border-white/30 shadow-2xl overflow-hidden pointer-events-none transition-opacity duration-150",
                  zoomActive ? "opacity-100" : "opacity-0"
                )}
              >
                {/* The actual zoom image. Mounted from the start so
                    it loads + decodes in the browser's normal pipeline.
                    Sized to the canvas × zoom factor; positioned via
                    GPU-friendly transform translated by the cursor
                    position. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={zoomImgRef}
                  src={zoomSrc}
                  alt=""
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="absolute top-0 left-0 max-w-none"
                  style={{
                    width: heroRef.current
                      ? `${heroRef.current.getBoundingClientRect().width * ZOOM_LEVEL}px`
                      : "300%",
                    height: heroRef.current
                      ? `${heroRef.current.getBoundingClientRect().height * ZOOM_LEVEL}px`
                      : "300%",
                    transform: heroRef.current
                      ? `translate3d(${-(zoomPos.x / 100) * heroRef.current.getBoundingClientRect().width * ZOOM_LEVEL + 250}px, ${-(zoomPos.y / 100) * heroRef.current.getBoundingClientRect().height * ZOOM_LEVEL + 250}px, 0)`
                      : undefined,
                    transformOrigin: "0 0",
                    objectFit: "cover",
                    willChange: "transform",
                  }}
                />
                {/* Label */}
                <div className="absolute top-0 left-0 right-0 bg-stone-900/50 backdrop-blur-sm px-3 py-1.5 z-10">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-white font-medium">
                    Slab
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Mobile thumbnail strip — sibling of the fixed-height
            slab container so it stacks below it instead of being
            clipped by the next section. Hidden on desktop, where
            the vertical rail inside the slab area handles thumbs. */}
        {thumbnails.length > 1 && (
          <div className="md:hidden flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar bg-stone-950">
            {thumbnails.map((thumb, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(thumb.src)}
                className={cn(
                  "relative shrink-0 w-16 h-16 overflow-hidden rounded-lg border-2 transition-all",
                  selectedImage === thumb.src
                    ? "border-white"
                    : "border-stone-700"
                )}
              >
                <Image
                  src={thumb.src}
                  alt={thumb.label}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
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

      {/* ===== STICKY PAGE SECTION NAV (below main navbar) ===== */}
      <div className="sticky top-[72px] z-30 bg-[#112732]/95 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
            {SECTION_IDS.filter(({ id }) => {
              if (id === "sec-similar-colors")
                return (
                  (product.relatedProducts &&
                    product.relatedProducts.length > 0) ||
                  (product.allOtherProducts &&
                    product.allOtherProducts.length > 0)
                );
              return true;
            }).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={cn(
                  "px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase whitespace-nowrap border-b-[2px] -mb-px transition-colors",
                  activeSection === id
                    ? "text-white border-white"
                    : "text-pacific-mid/70 border-transparent hover:text-pacific-light"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== BREADCRUMB ===== */}
      <nav className="bg-[#112732] border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4 flex items-center gap-2 text-xs text-pacific-mid tracking-wide font-light">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-white/15" />
          <Link href="/products" className="hover:text-white transition-colors">
            Products
          </Link>
          {product.collection && (
            <>
              <ChevronRight className="w-3 h-3 text-white/15" />
              <Link
                href={`/collections/${product.collection.slug.current}`}
                className="hover:text-white transition-colors"
              >
                {product.collection.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-white/15" />
          <span className="text-white">{product.name}</span>
        </div>
      </nav>

      {/* ===== ABOUT SECTION — Product Name + Description + CTAs ===== */}
      <section
        id="sec-about"
        ref={(el) => {
          sectionRefs.current["sec-about"] = el;
        }}
        className="bg-[#112732] scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-20">
            {/* Left — name + description */}
            <AnimatedSection animation="fadeUp">
              {/* Category tag */}
              <div className="text-sm font-medium tracking-[0.3em] uppercase text-pacific-mid mb-5">
                {categoryLabel}
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-10 leading-[1.05]">
                {product.name}
              </h1>

              {/* Description */}
              <div className="text-lg text-pacific-mid font-light leading-relaxed max-w-2xl mb-10">
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

              {/* Secondary links */}
              <div className="flex flex-wrap gap-6 text-sm font-light text-pacific-mid">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> Enquire on WhatsApp
                </a>
                {/* Spec Sheet link: prefer the Sanity-uploaded PDF when
                    present, fall back to a mailto request when blank. */}
                <a
                  href={
                    product.specSheetUrl ||
                    `mailto:bindu@thepacific.group?subject=${encodeURIComponent(`Spec Sheet Request — ${product.name}`)}`
                  }
                  {...(product.specSheetUrl
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                  className="inline-flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Download className="w-4 h-4" /> Spec Sheet
                </a>
              </div>
            </AnimatedSection>

            {/* Right — CTAs panel (MSI-style sidebar) */}
            <AnimatedSection animation="slideInRight">
              <div className="bg-[#0e2030] rounded-2xl p-6 sm:p-8 border border-white/10">
                {/* Primary CTAs */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setSampleOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide uppercase transition-colors duration-300 cursor-pointer bg-white text-[#112732] hover:bg-pacific-light border border-white px-7 py-3.5 text-sm"
                  >
                    <Package className="w-4 h-4" />
                    Order Sample
                  </button>
                  <MagneticButton
                    href="/contact"
                    /* Dark CTA panel — use the dark-bg variant so the
                       label is visible without hovering. */
                    variant="outline-dark"
                    size="md"
                    className="w-full justify-center"
                  >
                    <MapPin className="w-4 h-4" />
                    Find A Dealer
                  </MagneticButton>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 my-6" />

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
                        ? "bg-white text-[#112732] border-white"
                        : "border-white/10 text-pacific-mid hover:border-white hover:text-white"
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
                      className="w-11 h-11 rounded-full border border-white/10 text-pacific-mid hover:border-white hover:text-white flex items-center justify-center transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {copied && (
                        <motion.span
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: -8 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] uppercase text-pacific-light whitespace-nowrap flex items-center gap-1"
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

      {/* ===== SPECS STRIP (Finishes | Thicknesses | Format | Resources) ===== */}
      <div className="border-y border-white/10 bg-[#112732]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Column count adapts to whether Finishes Available has
              data — 4-col when finishes exist, 3-col when not, so
              the row stays balanced and there's no empty column. */}
          <div
            className={`grid grid-cols-2 ${finishes.length > 0 ? "lg:grid-cols-4" : "lg:grid-cols-3"} divide-x divide-white/10`}
          >
            {/* Finishes Available — hidden entirely when no finishes
                are set on the product in Sanity. */}
            {finishes.length > 0 && (
              <div className="py-6 lg:py-8 px-4 lg:px-6 first:pl-0">
                <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-white mb-4 pb-2 border-b-2 border-white">
                  Finishes Available
                </h4>
                <div className="space-y-1.5">
                  {finishes.map((f) => (
                    <div key={f}>
                      <div className="text-base font-medium text-white uppercase tracking-wide">
                        {f}
                      </div>
                      <div className="text-xs text-pacific-mid font-light">
                        {f === "Polished"
                          ? "More vibrant and intense colors and reflections"
                          : f === "Honed"
                            ? "Smooth matte surface with soft texture"
                            : f === "Leathered"
                              ? "Textured finish with natural tactile feel"
                              : "Premium surface finish"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Thicknesses */}
            <div className="py-6 lg:py-8 px-4 lg:px-6">
              <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-white mb-4 pb-2 border-b-2 border-white">
                Thicknesses
              </h4>
              <div className="space-y-2.5">
                {thicknesses.map((t) => (
                  <div key={t} className="flex items-center gap-3">
                    <span className="w-8 h-[3px] bg-white rounded-full" />
                    <span className="text-base text-pacific-light">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Format / Slab Size */}
            <div className="py-6 lg:py-8 px-4 lg:px-6">
              <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-white mb-4 pb-2 border-b-2 border-white">
                Format
              </h4>
              <div className="text-base text-pacific-light">{size}</div>
            </div>

            {/* Professional Resources */}
            <div className="py-6 lg:py-8 px-4 lg:px-6">
              <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-white mb-4 pb-2 border-b-2 border-white">
                Professional Resources
              </h4>
              <div className="space-y-2">
                {/* HD file: prefer the Sanity-uploaded image asset when
                    set; fall back to a mailto request to bindu@. */}
                <a
                  href={
                    product.hdFileUrl ||
                    `mailto:bindu@thepacific.group?subject=${encodeURIComponent(`HD File Request — ${product.name}`)}`
                  }
                  {...(product.hdFileUrl
                    ? {
                        target: "_blank",
                        rel: "noreferrer noopener",
                        download: `${product.name}-HD`,
                      }
                    : {})}
                  className="flex items-center gap-2 text-base text-pacific-light hover:text-white transition-colors group/link"
                >
                  HD file
                  <ChevronRight className="w-3.5 h-3.5 text-pacific-mid/70 group-hover/link:text-white transition-colors" />
                </a>
                {/* Spec Sheet: same pattern — Sanity PDF when uploaded,
                    mailto fallback otherwise. */}
                <a
                  href={
                    product.specSheetUrl ||
                    `mailto:bindu@thepacific.group?subject=${encodeURIComponent(`Spec Sheet Request — ${product.name}`)}`
                  }
                  {...(product.specSheetUrl
                    ? {
                        target: "_blank",
                        rel: "noreferrer noopener",
                        download: `${product.name}-Spec-Sheet.pdf`,
                      }
                    : {})}
                  className="flex items-center gap-2 text-base text-pacific-light hover:text-white transition-colors group/link"
                >
                  Download Spec Sheet
                  <ChevronRight className="w-3.5 h-3.5 text-pacific-mid/70 group-hover/link:text-white transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky section nav moved to top — see above */}

      {/* ===== PRODUCT INFO — Tabbed (Specs | Sizes & Finishes | Applications) ===== */}
      <section
        id="sec-product-info"
        ref={(el) => {
          sectionRefs.current["sec-product-info"] = el;
        }}
        className="bg-[#0e2030] border-y border-white/10 scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Tab bar.
                - Specs tab hidden for specialty products (the spec
                  rows below are quartz-slab specific: edge profiles,
                  water absorption, Mohs hardness — none of which
                  apply to a sink or a semi-precious piece).
                - Sizes & Finishes tab hidden whenever the body would
                  be empty: specialty product without finishes set
                  (thicknesses are also suppressed for specialty
                  products), or any product with no thicknesses AND
                  no finishes.
                - Applications tab is always shown — it has a
                  fallback empty-state message ("No specific
                  applications listed…") so users always have a
                  contact prompt. */}
          <div className="flex gap-0 border-b border-white/10 overflow-x-auto no-scrollbar">
            {(
              [
                ...(isSpecialtyProduct
                  ? []
                  : [["specs", "Specs"] as const]),
                ...(hasSizesContent
                  ? [["sizes", "Sizes & Finishes"] as const]
                  : []),
                ["applications", "Applications"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveInfoTab(key)}
                className={cn(
                  "px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase whitespace-nowrap -mb-px border-b-[2px] transition-colors",
                  activeInfoTab === key
                    ? "text-white border-white"
                    : "text-pacific-mid border-transparent hover:text-white"
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
                    <dl className="divide-y divide-white/10 border-y border-white/10 text-base">
                      <SpecRow label="Product Name" value={product.name} />
                      {/* Category row removed per editorial direction —
                          collection alone is the meaningful tag, the
                          category was redundant given how Pacific names
                          its collections. */}
                      {product.collection && (
                        <SpecRow
                          label="Collection"
                          value={product.collection.name}
                        />
                      )}
                      <SpecRow
                        label="Edge Profiles"
                        value="Straight, Eased, Bevel, Bullnose, Ogee"
                      />
                      {/* Water absorption + Mohs hardness vary by
                          category — quartz is engineered and far
                          tighter on both metrics than natural granite.
                          Detect granite via category slug or name and
                          swap the values; everything else keeps the
                          original quartz-spec defaults. */}
                      {(() => {
                        const cat = (
                          product.category?.slug?.current ||
                          product.category?.name ||
                          ""
                        ).toLowerCase();
                        const isGranite = cat.includes("granite");
                        return (
                          <>
                            <SpecRow
                              label="Water Absorption"
                              value={isGranite ? "Avg. 0.1 – 0.6%" : "< 0.03%"}
                            />
                            <SpecRow
                              label="Mohs Hardness"
                              value={isGranite ? "6" : "7"}
                            />
                          </>
                        );
                      })()}
                      <SpecRow
                        label="Manufactured By"
                        value="Pacific Engineered Surfaces Pvt. Ltd."
                      />
                    </dl>
                  </div>
                )}

                {activeInfoTab === "sizes" && (
                  <div className="max-w-3xl space-y-8">
                    {/* Slabs / thicknesses — hidden for specialty
                        products (sinks, semi-precious, centrepieces,
                        natural stone finishes don't carry the same
                        slab thickness options as quartz). */}
                    {!isSpecialtyProduct && (
                      <div>
                        <h3 className="text-sm font-medium tracking-[0.2em] uppercase text-pacific-mid mb-5">
                          Slabs
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {thicknesses.map((t) => (
                            <div
                              key={t}
                              className="flex items-center justify-between px-6 py-5 bg-white/5 border border-white/10 rounded-2xl"
                            >
                              <div>
                                <div className="text-base font-medium text-white">
                                  {t}
                                </div>
                                <div className="text-sm text-pacific-mid font-light">
                                  {size}
                                </div>
                              </div>
                              <span className="text-xs tracking-[0.2em] uppercase text-pacific-mid/70 font-medium">
                                Slab
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Finishes — hidden when no finishes set in Sanity. */}
                    {finishes.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium tracking-[0.2em] uppercase text-pacific-mid mb-5">
                          Available Finishes
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {finishes.map((f) => (
                            <span
                              key={f}
                              className="px-5 py-2.5 rounded-full text-sm font-medium tracking-[0.1em] uppercase border border-white/10 text-pacific-light"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeInfoTab === "applications" &&
                  (applications.length > 0 ? (
                    <StaggerContainer>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
                        {applications.map((a) => (
                          <StaggerItem key={a}>
                            <div className="flex items-center gap-3 px-6 py-5 bg-white/5 border border-white/10 rounded-2xl">
                              <Check className="w-5 h-5 text-white shrink-0" />
                              <span className="text-base text-pacific-light font-light">
                                {a}
                              </span>
                            </div>
                          </StaggerItem>
                        ))}
                      </div>
                    </StaggerContainer>
                  ) : (
                    <p className="text-pacific-mid font-light max-w-2xl">
                      No specific applications listed. Get in touch for
                      application guidance on your project.
                    </p>
                  ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Care & Maintenance section removed — redundant with specs strip resources */}

      {/* Benefits section moved to the very bottom of the page —
          see the "BENEFITS SECTION" block after the compare slider. */}

      {/* ===== SIMILAR STYLES — single row of 5, ranked by collection
              first, then by matching hue. The `picks` array is computed
              once at the top of this component and reused by the
              Compare Colors strip below, so both surfaces show the
              same candidate set. See src/lib/product-similarity.ts. */}
      {picks.length > 0 && (
        <section
            id="sec-similar-colors"
            ref={(el) => {
              sectionRefs.current["sec-similar-colors"] = el;
            }}
            className="bg-[#0e2030] border-y border-white/10 scroll-mt-16"
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
              <AnimatedSection animation="fadeUp">
                <div className="text-sm font-medium tracking-[0.3em] uppercase text-pacific-mid mb-4">
                  Similar Styles
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white mb-10 sm:mb-12">
                  You May Also Like
                </h2>
              </AnimatedSection>
              <StaggerContainer>
                {/* Single row of up to 5. Mobile collapses to 2 cols
                    so cards stay legible. */}
                <div className="flex overflow-x-auto snap-x snap-mandatory -mx-6 px-6 sm:mx-0 sm:px-0 sm:overflow-visible sm:grid sm:grid-cols-3 md:grid-cols-5 gap-4 lg:gap-6 [&>*]:shrink-0 [&>*]:w-[60%] sm:[&>*]:w-auto [&>*]:snap-start">
                  {picks.map((rp) => (
                    <StaggerItem key={rp._id}>
                      <Link
                        href={`/products/${rp.slug.current}`}
                        className="group block"
                        // Pre-warm the next product's magnifier URL on
                        // hover/touch (same Sanity-resized URL the
                        // server preload uses) so navigating into it
                        // is instant.
                        onMouseEnter={() => {
                          if (rp.mainImage)
                            preload(zoomImageUrl(rp.mainImage), {
                              as: "image",
                              fetchPriority: "high",
                            });
                        }}
                        onTouchStart={() => {
                          if (rp.mainImage)
                            preload(zoomImageUrl(rp.mainImage), {
                              as: "image",
                              fetchPriority: "high",
                            });
                        }}
                      >
                        <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5 mb-3">
                          {rp.mainImage ? (
                            <Image
                              src={rp.mainImage}
                              alt={rp.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              sizes="(max-width: 768px) 50vw, 20vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-white/10 via-white/5 to-white/10" />
                          )}
                        </div>
                        <h3 className="text-sm font-medium text-white group-hover:text-pacific-mid transition-colors tracking-tight">
                          {rp.name}
                        </h3>
                        {rp.collectionName && (
                          <div className="text-[11px] text-pacific-mid/70 mt-0.5 tracking-wide">
                            {rp.collectionName}
                          </div>
                        )}
                      </Link>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            </div>
          </section>
      )}

      {/* ===== CERTIFICATIONS STRIP — inline-SVG mark renditions on
              white tiles so they read against the dark backdrop. We
              avoid external CDN/Wikimedia URLs because they 404 / get
              hot-link blocked, leaving broken images. Inline SVG is
              bulletproof: no network, no CORS. ===== */}
      <section className="bg-stone-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <AnimatedSection animation="fadeIn">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <CertBadge
                name="NSF Certified"
                desc="Food Equipment Materials"
                mark={<NSFMark />}
              />
              <CertBadge
                name="Greenguard Gold"
                desc="Indoor Air Quality"
                mark={<GreenguardMark />}
              />
              <CertBadge
                name="ISO 9001:2015"
                desc="Quality Management"
                mark={<ISOMark />}
              />
              <CertBadge
                name="CE Marking"
                desc="European Conformity"
                mark={<CEMark />}
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== COMPARE SLIDER SECTION =====
              `picks` is the same ranked similar-products array used by
              the "You May Also Like" rail above — Compare Colors
              shows the same five as the initial visible chips, so
              comparison candidates match the recommendations.
              Hidden for specialty products: side-by-side slab
              comparison doesn't make sense for sinks, centrepieces,
              semi-precious or natural-stone-finishes pieces. */}
      {!isSpecialtyProduct && (
        <CompareSliderSection
          product={product}
          picks={picks}
          relatedProducts={product.relatedProducts || []}
          allOtherProducts={product.allOtherProducts || []}
        />
      )}

      {/* ===== BENEFITS SECTION — moved to the very bottom of the
              product page so it acts as the closing pitch before the
              modals. ===== */}
      <section className="bg-[#112732] border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
          <AnimatedSection animation="fadeUp">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white mb-4">
              Why you should choose {product.name}
            </h2>
            <p className="text-lg text-pacific-mid font-light max-w-3xl mb-14">
              Pacific Surfaces quartz is engineered with cutting-edge
              technology, delivering lasting beauty and unmatched performance
              for every space.
            </p>
          </AnimatedSection>

          <div className="text-xs font-semibold tracking-[0.25em] uppercase text-white mb-8">
            The Benefits of Pacific Surfaces
          </div>

          <StaggerContainer>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              {[
                {
                  title: "High Scratch Resistance",
                  desc: "Daily use and wear will not scratch your Pacific surface.",
                  img: "/benefits/scratch-resistance.png",
                },
                {
                  title: "Stain-Resistant",
                  desc: "Its low porosity makes it highly resistant to stains.",
                  img: "/benefits/stain-resistance.png",
                },
                {
                  title: "High Impact Resistance",
                  desc: "Highly resistant to daily impacts and heavy use.",
                  img: "/benefits/impact.png",
                },
                {
                  title: "Acid-Resistant",
                  desc: "Low porosity prevents damage from harsh stains and acids.",
                  img: "/benefits/acid.png",
                },
              ].map((benefit) => (
                <StaggerItem key={benefit.title}>
                  <div className="group">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-5 bg-white/5">
                      <Image
                        src={benefit.img}
                        alt={benefit.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold tracking-[0.1em] uppercase text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-pacific-mid font-light leading-relaxed">
                      {benefit.desc}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
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
              <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
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

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 py-3.5">
      <dt className="text-pacific-mid font-light">{label}</dt>
      <dd className="text-white font-medium text-right">{value}</dd>
    </div>
  );
}

/**
 * Certification badge tile.
 *
 * Renders an inline-SVG cert mark on a white pill so brand colours
 * read properly against the dark `bg-stone-950` strip. We use inline
 * SVG (rather than external image URLs) because:
 *   - external CDNs 404 / hot-link block / change paths, leaving
 *     broken images;
 *   - inline SVG has zero network cost and renders instantly;
 *   - the marks are simple enough to faithfully recreate.
 */
function CertBadge({
  name,
  desc,
  mark,
}: {
  name: string;
  desc: string;
  mark: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center p-3 shadow-[0_2px_12px_rgba(0,0,0,.25)]">
        {mark}
      </div>
      <div className="text-xs font-medium tracking-[0.2em] uppercase text-white/90">
        {name}
      </div>
      <div className="text-[10px] text-white/40 font-light">{desc}</div>
    </div>
  );
}

/* ─── Inline-SVG certification marks ───
 *
 * Clean, professional renditions of common certification badges.
 * They're not pixel-identical to the official trademarks (those are
 * usage-restricted) but they communicate the cert clearly and look
 * deliberate on the page. Replace with the official asset by dropping
 * the file into /public/certs/ and switching to an <img> if/when the
 * brand team supplies the trademarked artwork.
 */

function NSFMark() {
  // NSF mark: dark "NSF" wordmark stacked over "CERTIFIED" caption,
  // wrapped in a green ring (NSF brand green).
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" aria-hidden="true">
      <circle
        cx="32"
        cy="32"
        r="29"
        fill="none"
        stroke="#0f7a3d"
        strokeWidth="3"
      />
      <text
        x="32"
        y="32"
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="800"
        fontSize="20"
        fill="#0f7a3d"
        letterSpacing="-0.5"
      >
        NSF
      </text>
      <text
        x="32"
        y="46"
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="700"
        fontSize="6"
        fill="#0f7a3d"
        letterSpacing="0.6"
      >
        CERTIFIED
      </text>
    </svg>
  );
}

function GreenguardMark() {
  // Greenguard Gold: stylised leaf in brand green over a gold "GOLD"
  // ribbon — communicates the eco/indoor-air-quality cert at a glance.
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" aria-hidden="true">
      {/* Leaf */}
      <path
        d="M32 10 C 18 14, 14 28, 16 40 C 28 40, 40 32, 44 18 C 40 14, 36 11, 32 10 Z"
        fill="#1f9a4f"
      />
      {/* Stem */}
      <path
        d="M16 40 Q 22 32, 32 26"
        stroke="#0f7a3d"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* GOLD ribbon */}
      <rect x="10" y="46" width="44" height="11" rx="2" fill="#c9a227" />
      <text
        x="32"
        y="54.5"
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="800"
        fontSize="8"
        fill="#fff"
        letterSpacing="1.5"
      >
        GOLD
      </text>
    </svg>
  );
}

function ISOMark() {
  // ISO 9001:2015: red square with "ISO" + the standard number
  // stacked beneath. Mirrors the look of accreditation-body badges.
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="4" fill="#c8102e" />
      <text
        x="32"
        y="28"
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="800"
        fontSize="16"
        fill="#fff"
        letterSpacing="0.5"
      >
        ISO
      </text>
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="700"
        fontSize="9"
        fill="#fff"
        letterSpacing="0.5"
      >
        9001
      </text>
      <text
        x="32"
        y="52"
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="600"
        fontSize="6"
        fill="#fff"
        letterSpacing="1"
      >
        2015
      </text>
    </svg>
  );
}

function CEMark() {
  // CE marking: the well-known interlocking "CE" letterforms drawn
  // from circular arcs (the official mark is constructed from two
  // circles of equal radius). Black-on-white for maximum legibility.
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" aria-hidden="true">
      {/* C — left arc with a horizontal opening */}
      <path
        d="M28 14 A 18 18 0 1 0 28 50"
        stroke="#0a0a0a"
        strokeWidth="6"
        fill="none"
        strokeLinecap="butt"
      />
      {/* E — right arc with a stub crossbar opening to the right */}
      <path
        d="M58 14 A 18 18 0 1 0 58 50"
        stroke="#0a0a0a"
        strokeWidth="6"
        fill="none"
        strokeLinecap="butt"
      />
      {/* E crossbar */}
      <rect x="44" y="29" width="14" height="6" fill="#0a0a0a" />
    </svg>
  );
}

/* ── Compare Slider Section ── */

// Removed `shuffleArray` — Compare Colors now seeds its visible chips
// from the ranked `picks` array (same as "You May Also Like"). The
// pick ranking is deliberately ordered (Tier 1 same collection, Tier
// 2 same hue), so shuffling would scramble the recommendation logic.

type CompareProduct = {
  _id: string;
  name: string;
  slug: { current: string };
  mainImage?: string;
  price?: number;
  categoryName?: string;
  collectionName?: string;
};

function CompareSliderSection({
  product,
  picks,
  relatedProducts,
  allOtherProducts,
}: {
  product: Product;
  picks: CompareProduct[];
  relatedProducts: NonNullable<Product["relatedProducts"]>;
  allOtherProducts: NonNullable<Product["allOtherProducts"]>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const MAX_VISIBLE = 5;

  // All available products for the popup picker (search the entire
  // catalogue, not just the picks).
  const allProducts: CompareProduct[] = [
    ...relatedProducts,
    ...allOtherProducts.filter(
      (p) => !relatedProducts.find((rp) => rp._id === p._id)
    ),
  ];

  // Visible compare strip — initialised with the same `picks` array
  // used by the "You May Also Like" rail. Order is meaningful (Tier 1
  // = same collection, Tier 2 = same hue), so we DO NOT shuffle —
  // shuffling would scramble that ranking. Falls back to the first
  // few products from the full pool only if picks is empty (which
  // shouldn't happen except on a brand-new catalogue).
  const initialVisible: CompareProduct[] =
    picks.length > 0 ? picks.slice(0, MAX_VISIBLE) : allProducts.slice(0, MAX_VISIBLE);

  const [visibleColors, setVisibleColors] =
    useState<CompareProduct[]>(initialVisible);

  // Currently selected right-side product — first pick is the most
  // similar option per the ranking.
  const [rightProduct, setRightProduct] = useState<CompareProduct | undefined>(
    initialVisible[0]
  );

  // Color picker popup
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerFilter, setPickerFilter] = useState("all");

  // Lock body scroll when picker is open
  useEffect(() => {
    if (pickerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [pickerOpen]);

  const leftImage = product.mainImage || "";
  const rightImage = rightProduct?.mainImage || leftImage;

  // Get unique categories/collections for filter
  const filterOptions = Array.from(
    new Set(
      allProducts
        .map((p) => p.collectionName || p.categoryName || "")
        .filter(Boolean)
    )
  );

  // Filtered products for picker popup
  const filteredProducts = allProducts.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(pickerSearch.toLowerCase());
    const matchesFilter =
      pickerFilter === "all" ||
      p.collectionName === pickerFilter ||
      p.categoryName === pickerFilter;
    return matchesSearch && matchesFilter;
  });

  // Select a color from the popup — drops first, shifts left, new goes to end (pos 5)
  const selectFromPicker = (p: CompareProduct) => {
    setVisibleColors((prev) => {
      const exists = prev.find((c) => c._id === p._id);
      if (exists) {
        // Already in strip, just select it
        setRightProduct(p);
        setPickerOpen(false);
        return prev;
      }
      let updated: CompareProduct[];
      if (prev.length >= MAX_VISIBLE) {
        // Drop first item, shift everything left, add new at end
        updated = [...prev.slice(1), p];
      } else {
        updated = [...prev, p];
      }
      setRightProduct(p);
      setPickerOpen(false);
      return updated;
    });
  };

  const updateSlider = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(2, Math.min(98, x)));
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      e.preventDefault();
      updateSlider(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      updateSlider(e.touches[0].clientX);
    };
    const onUp = () => setIsDragging(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDragging]);

  if (!leftImage) return null;

  return (
    <section
      id="sec-compare"
      className="bg-[#112732] border-y border-white/10 scroll-mt-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
        <AnimatedSection animation="fadeUp">
          <div className="text-sm font-medium tracking-[0.3em] uppercase text-pacific-mid mb-4">
            Compare Colors
          </div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-white mb-4">
            See Them Side by Side
          </h2>
          <p className="text-lg text-pacific-mid font-light mb-12 max-w-2xl">
            Drag the slider to compare {product.name} with other colors from our
            collection.
          </p>
        </AnimatedSection>

        {/* Slider container */}
        <div
          ref={containerRef}
          className="relative w-full aspect-[16/7] max-h-[520px] overflow-hidden rounded-2xl cursor-col-resize select-none border border-white/10"
          onMouseDown={(e) => {
            setIsDragging(true);
            updateSlider(e.clientX);
          }}
          onTouchStart={(e) => {
            setIsDragging(true);
            updateSlider(e.touches[0].clientX);
          }}
        >
          {/* Right image (full, behind) */}
          <div className="absolute inset-0">
            <Image
              src={rightImage}
              alt={rightProduct?.name || "Compare"}
              fill
              className="object-cover"
              sizes="100vw"
              draggable={false}
            />
          </div>

          {/* Left image (clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <div
              className="absolute inset-0"
              style={{ width: `${100 / (sliderPos / 100)}%` }}
            >
              <Image
                src={leftImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="100vw"
                draggable={false}
              />
            </div>
          </div>

          {/* Slider handle */}
          <div
            className="absolute top-0 bottom-0 z-10"
            style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
          >
            <div className="w-[2px] h-full bg-white shadow-lg" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center cursor-col-resize">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7 4L3 10L7 16"
                  stroke="#374151"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 4L17 10L13 16"
                  stroke="#374151"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute bottom-4 left-4 z-10 bg-stone-900/70 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="text-xs tracking-[0.15em] uppercase text-white font-medium">
              {product.name}
            </span>
          </div>
          <div className="absolute bottom-4 right-4 z-10 bg-stone-900/70 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="text-xs tracking-[0.15em] uppercase text-white font-medium">
              {rightProduct?.name}
            </span>
          </div>
        </div>

        {/* Color picker strip — max 5 + Add Color button */}
        <div className="mt-8">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-pacific-mid mb-4">
            Compare with
          </p>
          <div className="flex gap-3 items-center">
            {visibleColors.map((rp) => (
              <button
                key={rp._id}
                onClick={() => setRightProduct(rp)}
                className={cn(
                  "relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all group",
                  rightProduct?._id === rp._id
                    ? "border-white ring-2 ring-white/20"
                    : "border-white/10 hover:border-white/30"
                )}
                title={rp.name}
              >
                {rp.mainImage ? (
                  <Image
                    src={rp.mainImage}
                    alt={rp.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10" />
                )}
                {/* Name tooltip on hover */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-900/80 to-transparent pt-4 pb-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[7px] tracking-wider uppercase text-white block text-center truncate">
                    {rp.name}
                  </span>
                </div>
              </button>
            ))}

            {/* Add Color button */}
            <button
              onClick={() => setPickerOpen(true)}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-white/15 hover:border-white/40 flex flex-col items-center justify-center gap-1 transition-colors group shrink-0"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-pacific-mid/70 group-hover:text-pacific-mid transition-colors"
              >
                <path
                  d="M10 4V16M4 10H16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[9px] tracking-[0.1em] uppercase text-pacific-mid/70 group-hover:text-pacific-mid font-medium transition-colors">
                Add Color
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== COLOR PICKER POPUP ===== */}
      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4 overscroll-contain"
            onClick={() => setPickerOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
                <h3 className="text-lg font-medium text-stone-900">
                  Choose a Color to Compare
                </h3>
                <button
                  onClick={() => setPickerOpen(false)}
                  className="w-9 h-9 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>

              {/* Search + Filter */}
              <div className="px-6 py-4 border-b border-stone-100 space-y-3">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search colors..."
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200"
                  />
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  </svg>
                </div>
                {/* Filter pills */}
                {filterOptions.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setPickerFilter("all")}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase transition-colors",
                        pickerFilter === "all"
                          ? "bg-stone-900 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      )}
                    >
                      All
                    </button>
                    {filterOptions.map((f) => (
                      <button
                        key={f}
                        onClick={() => setPickerFilter(f)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase transition-colors",
                          pickerFilter === f
                            ? "bg-stone-900 text-white"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product grid */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {filteredProducts.length === 0 ? (
                  <p className="text-sm text-stone-400 text-center py-8">
                    No colors found
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {filteredProducts.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => selectFromPicker(p)}
                        className={cn(
                          "relative rounded-xl overflow-hidden border-2 transition-all group text-left",
                          visibleColors.find((c) => c._id === p._id)
                            ? "border-stone-900"
                            : "border-stone-100 hover:border-stone-400"
                        )}
                      >
                        <div className="relative aspect-square bg-stone-100">
                          {p.mainImage ? (
                            <Image
                              src={p.mainImage}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="150px"
                            />
                          ) : (
                            <div className="w-full h-full bg-stone-200" />
                          )}
                        </div>
                        <div className="px-2 py-2">
                          <span className="text-[10px] tracking-wide uppercase font-medium text-stone-800 block truncate">
                            {p.name}
                          </span>
                          {(p.collectionName || p.categoryName) && (
                            <span className="text-[9px] text-stone-400 block truncate">
                              {p.collectionName || p.categoryName}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
