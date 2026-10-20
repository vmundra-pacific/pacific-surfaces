import Image from "next/image";

/**
 * A vanity top's application frames for its store page gallery (owner,
 * 2026-10-13: "product application images with texts on them"): a
 * photograph beside an eyebrow, a headline and a line in a white column at
 * its left (the owner kept this text over Home Depot's callout tags, and
 * then moved it off the image so it hides nothing).
 *
 * The rooms and product views are Pacific's own renders of each layout
 * (owner, 2026-10-13, "vanity renders"), served as they are; two
 * photographs of a single basin top follow on the single's page. Every
 * image shows a plain white quartz top, and the frame says so.
 */

export interface AppFrame {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  /** A product view on white: shown whole, to the right of the text. */
  onWhite?: boolean;
}

const BASINS = "/store-basins";
const A = `${BASINS}/aisle`;

/** One layout's six renders, with the words for each. */
function renders(dir: string, word: "Single" | "Double", widths: string): AppFrame[] {
  const r = `${BASINS}/${dir}`;
  const basin = word === "Single" ? "the undermount basin" : "both undermount basins";
  const a = word === "Single" ? "a single basin" : "a double basin";
  return [
    {
      src: `${r}/04-residential.png`,
      alt: `A white quartz ${word.toLowerCase()} basin vanity top on a wall-hung vanity in a home bathroom`,
      eyebrow: "Residential",
      title: `${word} basin vanity top for the home`,
      body: `One piece of white quartz with ${basin} cut in, on a wall-hung vanity.`,
    },
    {
      src: `${r}/05-hotel.png`,
      alt: `A white quartz ${word.toLowerCase()} basin vanity top in a hotel bathroom with a backlit mirror`,
      eyebrow: "Hospitality",
      title: "Made for hotel bathrooms",
      body: "Quartz takes daily housekeeping in its stride, with the basin and faucet holes cut to your room layout.",
    },
    {
      src: `${r}/06-office.png`,
      alt: `A white quartz ${word.toLowerCase()} basin vanity top in an office washroom`,
      eyebrow: "Commercial",
      title: "Offices and washrooms",
      body: "A seamless top that wipes clean between uses, cut to each vanity in the building.",
    },
    {
      src: `${r}/01-angled.png`,
      alt: `A white quartz ${word.toLowerCase()} basin vanity top on white`,
      eyebrow: "Sizes",
      title: `${widths} in wide`,
      body: "20, 22 or 24 in deep, with a 4, 5 or 6 in front edge, or cut to your cabinet.",
      onWhite: true,
    },
    {
      src: `${r}/02-top.png`,
      alt: `A white quartz ${word.toLowerCase()} basin vanity top seen from above, with its basin cut-outs and faucet holes`,
      eyebrow: "From above",
      title: "Basin cut-out and faucet hole",
      body: `Cut for ${a}, with faucet holes drilled to your faucet: 4 in centerset, 8 in widespread, a single hole or your own spacing.`,
      onWhite: true,
    },
    {
      src: `${r}/03-side.png`,
      alt: `A white quartz ${word.toLowerCase()} basin vanity top seen from the side`,
      eyebrow: "Profile",
      title: "A clean, square edge",
      body: "In the finish you choose: polished, suede, leathered or matte.",
      onWhite: true,
    },
  ];
}

export const APP_FRAMES: Record<number, AppFrame[]> = {
  1: [
    ...renders("single-basin-renders", "Single", "30, 36, 42, 48, 60 or 72"),
    {
      src: `${A}/quartz-top-front.jpg`,
      alt: "A white quartz vanity top with an undermount basin on a wall-hung vanity",
      eyebrow: "Undermount basin",
      title: "Quartz vanity top, basin cut in",
      body: "One piece of quartz with the undermount basin cut in and its edge finished, sized to your vanity cabinet.",
    },
    {
      src: `${A}/quartz-top-above.jpg`,
      alt: "A white quartz vanity top seen from above, with its undermount basin and single faucet",
      eyebrow: "Easy care",
      title: "Wipes clean in seconds",
      body: "Pacific quartz absorbs just 0.04% water by mass (ASTM C 97), so splashes and soap wipe away with a damp cloth.",
    },
  ],
  2: renders("double-basin-renders", "Double", "60 or 72"),
};

/** The first product view of each layout, for the basin-count tiles. */
export const BASIN_TILE: Record<string, string> = {
  Single: `${BASINS}/single-basin-renders/01-angled.png`,
  Double: `${BASINS}/double-basin-renders/01-angled.png`,
};

export function AppPanel({ frame }: { frame: AppFrame }) {
  // Text and image side by side, never one over the other (owner,
  // 2026-10-13: the words were hiding the product).
  return (
    <div className="absolute inset-0 flex bg-white">
      <div className="flex w-[38%] shrink-0 flex-col justify-center px-5 sm:px-7">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-pacific-dark/55">{frame.eyebrow}</p>
        <p
          className="mt-2 text-[18px] leading-[1.1] text-pacific-dark sm:text-[24px]"
          style={{ fontVariationSettings: "'wght' 300, 'wdth' 100", letterSpacing: "-0.01em" }}
        >
          {frame.title}
        </p>
        <p className="mt-2 hidden text-[12.5px] font-light leading-relaxed text-pacific-dark/75 sm:block">{frame.body}</p>
        <p className="mt-3 text-[10px] font-light text-pacific-dark/50">Shown in plain white quartz</p>
      </div>
      <div className={`relative flex-1 overflow-hidden ${frame.onWhite ? "" : "rounded-l-md"}`}>
        {/* Through the loader, which serves the ready-made copy that fits
            (lib/image-variants), not the full-size original. */}
        <Image
          src={frame.src}
          alt={frame.alt}
          fill
          sizes="(max-width: 1024px) 62vw, 31vw"
          className={frame.onWhite ? "object-contain p-3" : "object-cover"}
        />
      </div>
    </div>
  );
}
