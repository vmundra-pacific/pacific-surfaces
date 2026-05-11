/**
 * /font-test — internal comparison page for the PACIFIC SURFACES
 * wordmark. Renders the wordmark in every candidate display font
 * side by side so we can pick a winner without round-tripping a
 * deploy. Loaded with next/font/google so the fonts are properly
 * preloaded and the rendering matches what we'd ship.
 *
 * Not linked from anywhere; the URL itself is the entry point.
 * Delete this file once a font is picked.
 */
import {
  Audiowide,
  Bungee,
  Black_Ops_One,
  Krona_One,
  Saira_Stencil_One,
  Iceberg,
  Russo_One,
  Bagel_Fat_One,
  Unbounded,
  Major_Mono_Display,
  Space_Grotesk,
} from "next/font/google";

const audiowide = Audiowide({ subsets: ["latin"], weight: "400" });
const bungee = Bungee({ subsets: ["latin"], weight: "400" });
const blackOpsOne = Black_Ops_One({ subsets: ["latin"], weight: "400" });
const kronaOne = Krona_One({ subsets: ["latin"], weight: "400" });
const sairaStencil = Saira_Stencil_One({ subsets: ["latin"], weight: "400" });
const iceberg = Iceberg({ subsets: ["latin"], weight: "400" });
const russoOne = Russo_One({ subsets: ["latin"], weight: "400" });
const bagelFatOne = Bagel_Fat_One({ subsets: ["latin"], weight: "400" });
const unbounded = Unbounded({ subsets: ["latin"], weight: "800" });
const majorMono = Major_Mono_Display({ subsets: ["latin"], weight: "400" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: "700" });

interface Candidate {
  name: string;
  fontClass: string;
  note: string;
}

const candidates: Candidate[] = [
  {
    name: "Audiowide",
    fontClass: audiowide.className,
    note: "Closed C, no-crossbar A, futuristic. (Current)",
  },
  {
    name: "Bungee",
    fontClass: bungee.className,
    note: "Chunky urban block, slab-style I.",
  },
  {
    name: "Black Ops One",
    fontClass: blackOpsOne.className,
    note: "Military slab serif, very bold.",
  },
  {
    name: "Krona One",
    fontClass: kronaOne.className,
    note: "Geometric monoline sans, clean brand feel.",
  },
  {
    name: "Saira Stencil One",
    fontClass: sairaStencil.className,
    note: "Bold display with stencil cuts.",
  },
  {
    name: "Iceberg",
    fontClass: iceberg.className,
    note: "Closed-aperture geometric, very on-brief.",
  },
  {
    name: "Russo One",
    fontClass: russoOne.className,
    note: "Heavy geometric modernist.",
  },
  {
    name: "Bagel Fat One",
    fontClass: bagelFatOne.className,
    note: "Ultra-heavy, all-closed apertures. Overkill?",
  },
  {
    name: "Unbounded (800)",
    fontClass: unbounded.className,
    note: "Modern geometric display, premium brand vibe.",
  },
  {
    name: "Major Mono Display",
    fontClass: majorMono.className,
    note: "Monospaced, distinct slab I. Very architectural.",
  },
  {
    name: "Space Grotesk (700)",
    fontClass: spaceGrotesk.className,
    note: "Modern geometric, less 'logo-y'.",
  },
];

export default function FontTestPage() {
  return (
    <div className="min-h-screen bg-[#112732] py-16 px-8 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-light mb-2">Wordmark font test</h1>
        <p className="text-stone-400 mb-12 text-sm font-light">
          {candidates.length} candidates rendered at the actual header size
          (text-xl, tracking-0.12em) on both navy and cream backgrounds. Pick a
          winner.
        </p>

        <div className="space-y-12">
          {candidates.map((c) => (
            <div
              key={c.name}
              className="border border-white/10 rounded-lg overflow-hidden"
            >
              <div className="px-6 py-3 bg-white/5 flex items-baseline justify-between">
                <h2 className="text-base font-medium tracking-wide">
                  {c.name}
                </h2>
                <p className="text-xs text-stone-400 font-light">{c.note}</p>
              </div>

              {/* Navy bg (matches scrolled header state) */}
              <div className="bg-[#112732] px-8 py-10">
                <div className="text-[10px] text-stone-500 uppercase tracking-[0.3em] mb-3">
                  Header / scrolled
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`${c.fontClass} text-xl tracking-[0.12em] text-white`}
                  >
                    PACIFIC
                  </span>
                  <span
                    className={`${c.fontClass} text-xl tracking-[0.12em] text-stone-300`}
                  >
                    SURFACES
                  </span>
                </div>

                {/* Bigger so the letterform details are easy to see */}
                <div className="text-[10px] text-stone-500 uppercase tracking-[0.3em] mt-8 mb-3">
                  Zoomed
                </div>
                <div
                  className={`${c.fontClass} text-5xl tracking-[0.08em] text-white`}
                >
                  PACIFIC
                </div>
              </div>

              {/* Cream bg for contrast check */}
              <div className="bg-stone-50 px-8 py-8 text-stone-900">
                <div className="text-[10px] text-stone-500 uppercase tracking-[0.3em] mb-3">
                  On cream (about-page treatment)
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`${c.fontClass} text-xl tracking-[0.12em] text-stone-900`}
                  >
                    PACIFIC
                  </span>
                  <span
                    className={`${c.fontClass} text-xl tracking-[0.12em] text-stone-600`}
                  >
                    SURFACES
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
