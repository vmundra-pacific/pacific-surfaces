"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TextReveal } from "@/components/ui/text-reveal";
import { MapPin, Phone } from "lucide-react";

interface SanityDealer {
  _id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  description: string;
  phone: string | null;
  mapPin: { left: string; top: string } | null;
}

const filters = ["All", "Showrooms", "Fabricators", "Retail"];

const fallbackDealers = [
  {
    tag: "2.4 km · Showroom",
    name: "Swastik Marbles",
    type: "Showroom",
    desc: "Bannerghatta Rd, Koppa Gate, Bengaluru 560105. Full Pacific slab display with weekend architect walkthroughs.",
  },
  {
    tag: "8.1 km · Fabricator",
    name: "Pacific Certified Works",
    type: "Fabricator",
    desc: "Electronic City · 10-year workmanship warranty. CNC-equipped for quartz & granite.",
  },
  {
    tag: "14.6 km · Retail",
    name: "Marble City",
    type: "Retail",
    desc: "Koppa Gate, Bengaluru. Full catalog with live fabrication estimates.",
  },
];

const fallbackPins = [
  { left: "23%", top: "37%", title: "Los Angeles" },
  { left: "31%", top: "33%", title: "New York" },
  { left: "53%", top: "30%", title: "Warsaw" },
  { left: "47%", top: "28%", title: "London" },
  { left: "60%", top: "45%", title: "Dubai" },
  { left: "72%", top: "43%", title: "Bengaluru" },
  { left: "70%", top: "35%", title: "Mumbai" },
];

export function DealerLocator({ dealers }: { dealers?: SanityDealer[] }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const hasSanity = dealers && dealers.length > 0;

  const displayDealers = hasSanity
    ? dealers.map((d) => ({
        name: d.name,
        type: d.type,
        tag: `${d.city} · ${d.type}`,
        desc: d.description || d.address || "",
        phone: d.phone,
      }))
    : fallbackDealers.map((d) => ({ ...d, phone: null as string | null }));

  const pins = hasSanity
    ? dealers
        .filter((d) => d.mapPin?.left && d.mapPin?.top)
        .map((d) => ({
          left: d.mapPin!.left,
          top: d.mapPin!.top,
          title: d.city,
        }))
    : fallbackPins;

  const filteredDealers =
    activeFilter === "All"
      ? displayDealers
      : displayDealers.filter(
          (d) =>
            d.type.toLowerCase() ===
            activeFilter.toLowerCase().replace(/s$/, "")
        );

  return (
    <section className="py-20 md:py-28 px-6 bg-white" id="dealer">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="lg:col-span-2"
          >
            <div className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-4">
              Where to Buy
            </div>
            <TextReveal
              as="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-stone-900 leading-[1.08] mb-6"
            >
              Find a Pacific dealer near you.
            </TextReveal>
            <p className="text-base font-light text-stone-700 leading-relaxed mb-8">
              Over 140 dealers across India, the USA, Europe, and the Middle
              East. Walk in, see the slabs, and request a sample on the spot.
            </p>

            {/* Search */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Enter ZIP or city"
                defaultValue="Bengaluru"
                className="flex-1 border border-stone-200 rounded-md px-3 py-2.5 text-sm font-light text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
              />
              <button className="px-5 py-2.5 bg-stone-900 text-white text-xs font-medium tracking-[0.15em] uppercase rounded-md hover:bg-stone-800 transition-colors">
                Search
              </button>
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2 mb-8">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-[0.1em] uppercase transition-colors ${
                    activeFilter === f
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-10">
              {[
                { n: "140+", l: "Dealers" },
                { n: "30", l: "Countries" },
                { n: "4", l: "Continents" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-3xl font-light tracking-tight text-stone-900">
                    {s.n}
                  </div>
                  <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-stone-500 mt-1">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — map + cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="lg:col-span-3 relative"
          >
            {/* Map */}
            <div className="relative rounded-2xl overflow-hidden bg-[#eef1f4] aspect-[16/10]">
              <svg
                viewBox="0 0 800 520"
                preserveAspectRatio="xMidYMid slice"
                className="w-full h-full"
              >
                <defs>
                  <pattern
                    id="grid"
                    width="24"
                    height="24"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 24 0 L 0 0 0 24"
                      fill="none"
                      stroke="#d8dee5"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="#eef1f4" />
                <rect width="100%" height="100%" fill="url(#grid)" />
                <g fill="#c4ccd4" opacity="0.7">
                  <path d="M80 140 C 120 110, 200 100, 240 130 C 260 150, 250 200, 220 230 C 180 260, 130 240, 100 220 C 70 200, 60 170, 80 140 Z" />
                  <path d="M200 290 C 220 280, 240 310, 235 360 C 225 410, 200 430, 185 410 C 170 380, 170 320, 200 290 Z" />
                  <path d="M380 120 C 410 110, 450 120, 470 140 C 480 160, 470 185, 450 195 C 420 200, 390 185, 380 160 C 375 145, 375 130, 380 120 Z" />
                  <path d="M400 220 C 430 210, 470 230, 480 280 C 485 340, 460 380, 430 370 C 400 355, 390 300, 395 260 C 398 240, 400 228, 400 220 Z" />
                  <path d="M480 130 C 550 120, 640 130, 680 170 C 720 210, 710 250, 670 270 C 620 290, 560 280, 510 250 C 470 225, 460 170, 480 130 Z" />
                  <path d="M640 340 C 680 330, 720 345, 720 370 C 720 395, 690 410, 655 405 C 625 395, 615 365, 640 340 Z" />
                </g>
                <g
                  stroke="#9aa8b6"
                  strokeWidth="0.8"
                  fill="none"
                  strokeDasharray="3 4"
                  opacity="0.5"
                >
                  <path d="M580 210 Q 400 120, 180 170" />
                  <path d="M580 210 Q 500 150, 440 150" />
                  <path d="M580 210 Q 550 280, 440 300" />
                  <path d="M580 210 Q 650 280, 680 370" />
                </g>
              </svg>

              {/* Pins */}
              {pins.map((pin) => (
                <div
                  key={pin.title}
                  className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: pin.left, top: pin.top }}
                  title={pin.title}
                >
                  <div className="w-full h-full rounded-full bg-[#112732] border-2 border-white shadow-md" />
                </div>
              ))}
            </div>

            {/* Dealer cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {filteredDealers.slice(0, 3).map((d) => (
                <div
                  key={d.name}
                  className="rounded-xl border border-stone-200 p-4 hover:border-stone-400 transition-colors"
                >
                  <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-stone-500 mb-2">
                    {d.tag}
                  </div>
                  <h4 className="text-sm font-medium text-stone-900 mb-1.5">
                    {d.name}
                  </h4>
                  <p className="text-xs font-light text-stone-500 leading-relaxed mb-3">
                    {d.desc}
                  </p>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-1 text-[10px] font-medium tracking-[0.12em] uppercase text-stone-900 hover:text-stone-600 transition-colors">
                      <MapPin className="w-3 h-3" />
                      Directions
                    </button>
                    {d.phone && (
                      <a
                        href={`tel:${d.phone}`}
                        className="flex items-center gap-1 text-[10px] font-medium tracking-[0.12em] uppercase text-stone-500 hover:text-stone-700 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
