"use client";

import { motion } from "framer-motion";

/**
 * IndiaDealerMap — a real, recognizable India outline (mainland
 * coastline + land borders, sampled from a free-for-commercial-use
 * cartographic source — simplemaps.com's blank India SVG, Mercator
 * projection, license: free for commercial/personal use, attribution
 * appreciated: https://simplemaps.com/resources/svg-license) with
 * numbered pin markers for each dealer, paired with a legend showing
 * ONLY city + dealer name.
 *
 * Deliberately excludes street addresses, phone numbers, and anything
 * else that would let someone pin down a dealer's exact location —
 * per request, this is a public "we have presence here" overview, not
 * a directory. Anyone who needs a specific dealer's address uses the
 * "Find A Dealer" pincode search elsewhere on this page, which only
 * discloses details for the one pincode a visitor searches.
 *
 * The outline is the actual mainland coastline/border (Andaman &
 * Nicobar islands and the simplified source's map-seam artifact were
 * cropped out — they're not relevant to any of these dealers and
 * would just add visual clutter in a small card). Pins are plotted by
 * converting each city's real latitude/longitude into this outline's
 * own coordinate space, so they land in their true relative position
 * — not hand-guessed percentages.
 *
 * Labels are a numbered legend below the map (not inline text next to
 * each pin) because two of these cities — Gurugram and Panchkula —
 * sit close enough together on India's map that inline labels would
 * overlap. Numbers also work on touch devices with no hover state,
 * unlike a hover-to-reveal tooltip would.
 */

interface DealerPin {
  name: string;
  city: string;
  /** Position in the outline's own SVG coordinate space (see MAP_VIEWBOX). */
  x: number;
  y: number;
}

const DEALER_PINS: DealerPin[] = [
  { name: "La Casa Decor", city: "Panchkula", x: 319.9, y: 246.9 },
  {
    name: "Shree Shantinath Granite World",
    city: "Gurugram",
    x: 325.2,
    y: 312.1,
  },
  {
    name: "Shree Shantinath Granite World",
    city: "Hyderabad",
    x: 368.4,
    y: 635.6,
  },
  { name: "Swastik Marbles", city: "Bengaluru", x: 341.7, y: 764.8 },
];

// Cropped to just the mainland's own bounding box (with a small pad)
// out of the source's 0-1000 / 0-1000 canvas.
const MAP_VIEWBOX = "70 35 860 885";

// Real mainland India coastline/border, sampled at 220 points along the
// traced path and cropped to drop the Andaman & Nicobar seam. Source:
// simplemaps.com free blank India SVG (Mercator projection).
const INDIA_MAINLAND_POINTS =
  "355.9,45.5 365.9,63.6 383.5,81.7 384,102.4 396.6,123.1 406.8,139.8 " +
  "393.4,154.6 373.3,148.7 382.5,172.1 387.2,192.1 402.3,200.7 425.3,209.9 " +
  "441.8,223.9 436.2,238.4 427.9,260.4 428.3,279.3 446.8,287.8 465.3,301.2 " +
  "488.5,311.5 510.6,320.5 532.5,323.3 553.1,324.2 568.6,339.4 587.5,347.6 " +
  "611.4,352.1 631.5,355.9 654,354.2 652.3,328.7 656.4,303.8 677.5,307.1 " +
  "674.1,330.2 693,340.6 715.8,341 741.8,341.4 765.3,341.4 770.3,322 " +
  "757.1,307.1 778.7,307.7 792.4,296.3 811.3,280 834.3,271.3 849.4,262.8 " +
  "871.5,262.1 892,261 898.5,269.9 897.8,289.2 922.6,294.2 913.3,312.4 " +
  "914.2,331.1 892,326.2 870.4,341.3 858.1,360.6 851,381.9 846.1,403.6 " +
  "833.9,427.2 815.1,432.2 810.3,445.6 803.2,466.3 800.1,488.5 787.3,494.5 " +
  "782,471 776.6,444.7 766.3,449.2 754.2,460.7 746.7,449.5 751.4,428.4 " +
  "766.1,421.1 777.1,403.1 767.5,394.3 741.6,393.9 714.4,392.8 704.8,372.3 " +
  "698.8,366.1 683.3,355.4 671.5,358.7 664.7,352.3 655,371.6 674.4,383.3 " +
  "669.5,393.9 655.2,406.5 671.1,422.3 668.7,441.2 680.1,456.9 681.6,480.4 " +
  "680.2,497.6 675.9,506.2 674.5,491.1 670.1,496.5 667.3,503 662.5,505 " +
  "658.6,500.9 650.7,483.3 648.4,503 623.3,513.6 623.6,534.6 616.8,546.6 " +
  "600.7,555.2 591.2,563.3 580.7,560.7 571.1,570.4 579.7,568.1 557.9,583.6 " +
  "544,602.7 528.4,615.3 513.9,630.6 490.9,644.4 487.2,661 465.6,668.5 " +
  "450.2,682.9 443.3,684.7 424.8,696.7 424.2,722.6 425.8,742.5 423.9,750.9 " +
  "428.9,765.8 420.3,791.7 413.2,814.2 415.4,830.2 408.8,849.6 397.7,854 " +
  "390.2,877.5 394.8,880.7 369.4,888.8 360.2,908.5 336.5,909.9 321.2,890.8 " +
  "316,881.2 310.5,860.7 314.5,869.7 311.4,857.8 306.5,847.4 297,822.2 " +
  "284.7,801.6 276.8,790.3 268.5,771.1 266.3,750.3 258.6,731.7 253.1,719.5 " +
  "243.4,707.6 240.5,694.7 232.9,682.1 225.8,664.9 223.8,649 219.8,630.2 " +
  "215.6,611.3 213.7,601.6 215.2,589.2 210.2,588.7 217.6,581.4 208.1,570.8 " +
  "209,550.5 211.8,530.8 205.1,522.8 205.8,512.4 214.7,504.6 206.6,495.9 " +
  "213.4,486.4 194.8,486.1 190,495.7 189.9,501.8 187.8,521.4 164.8,532.2 " +
  "140,528.9 120.4,509.3 101.8,490.6 107.5,486.1 124.9,480.3 144,463.5 " +
  "130.8,466 105.2,467.7 88,453.2 84.7,442.5 82,442.2 78.2,434.2 92.4,421.6 " +
  "114.9,422.9 139,420 158.3,420 154.7,398.5 143.2,377.9 133.2,358.1 " +
  "115.4,343.9 125.1,320.7 143.1,301 164.2,307.5 185.9,295.8 202.2,274.3 " +
  "221.1,255 236.5,234.3 247.3,215.2 263.3,198 261.1,174.5 281.2,162.8 " +
  "266.1,151.8 254.3,140 249.2,119 252.9,98.6 238.8,85.5 258.5,71.9 " +
  "284.9,78.9 310,74.6 331.9,64.5 352.6,47.5";

export function IndiaDealerMap() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-6 items-start">
      <div className="relative aspect-[860/885] w-full max-w-sm mx-auto sm:mx-0 rounded-2xl overflow-hidden border border-white/10 bg-[#0e2030]">
        <svg
          viewBox={MAP_VIEWBOX}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="india-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect
            x="70"
            y="35"
            width="860"
            height="885"
            fill="url(#india-grid)"
          />
          <polygon
            points={INDIA_MAINLAND_POINTS}
            fill="rgba(154,168,182,0.18)"
            stroke="rgba(154,168,182,0.55)"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Numbered pins — plotted directly in the map's own
              coordinate space so they stay perfectly aligned with the
              outline at any card size. Number matches the legend list. */}
          {DEALER_PINS.map((pin, idx) => (
            <motion.g
              key={`${pin.city}-${idx}`}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              style={{ transformOrigin: `${pin.x}px ${pin.y}px` }}
            >
              <circle
                cx={pin.x}
                cy={pin.y}
                r="16"
                fill="#ffffff"
                stroke="#0e2030"
                strokeWidth="3"
              />
              <text
                x={pin.x}
                y={pin.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="15"
                fontWeight="600"
                fill="#112732"
              >
                {idx + 1}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Legend — city + dealer name only, nothing more specific. */}
      <ul className="grid grid-cols-1 gap-3 sm:w-64">
        {DEALER_PINS.map((pin, idx) => (
          <li
            key={`${pin.city}-legend-${idx}`}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-[#112732]">
              {idx + 1}
            </span>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.1em] text-white">
                {pin.city}
              </div>
              <div className="text-sm font-light text-pacific-mid">
                {pin.name}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
