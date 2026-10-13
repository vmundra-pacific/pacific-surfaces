import Image from "next/image";
import { ArrowRight } from "lucide-react";

/**
 * The store's hero (owner, 2026-10-13): the owner's photograph of vanity
 * tops, a basin and a vanity, across the full width of the screen, with
 * the words on the left over the plain wall. The photograph runs up under
 * the fixed header; the words sit below it. Served as it is.
 */
export function StoreHero({
  image,
  alt,
  eyebrow,
  title,
  body,
  cta,
}: {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
}) {
  return (
    <section className="relative h-[clamp(520px,78vh,780px)] w-full overflow-hidden bg-[#e9e0d4]">
      <Image src={image} alt={alt} fill priority unoptimized sizes="100vw" className="object-cover object-[72%_60%]" />
      {/* A light wash behind the words, fading out before the products. */}
      <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#f4efe8]/80 via-[#f4efe8]/30 to-transparent md:w-[40%]" />
      {/* Pinned to the left edge of the screen, inside the plain wall (the
          products begin about a third of the way across the photograph). */}
      <div className="relative flex h-full flex-col justify-center px-6 pt-20 text-[#14140f] sm:px-10 lg:px-14 xl:px-20">
        <div className="max-w-[min(380px,21vw)] max-md:max-w-[440px]">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] opacity-60">{eyebrow}</p>
          <h1
            className="mt-4 text-[38px] leading-[1.02] sm:text-[48px] xl:text-[60px]"
            style={{ fontVariationSettings: "'wght' 300, 'wdth' 100", letterSpacing: "-0.025em" }}
          >
            {title}
          </h1>
          <p className="mt-5 text-[14px] font-light leading-relaxed opacity-80 xl:text-[15px]">{body}</p>
          <a
            href={cta.href}
            data-over-media
            className="mt-7 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-[#14140f] px-7 text-[12px] uppercase tracking-[0.14em] text-white hover:opacity-85"
          >
            {cta.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
