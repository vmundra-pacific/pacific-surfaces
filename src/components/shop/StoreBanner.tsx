import Image from "next/image";
import { ArrowRight } from "lucide-react";

/**
 * The store's photographic banner (owner, 2026-10-13: "this hero section is
 * perfect"): a wide room photograph, washed light on the left under an
 * eyebrow, a headline, a line and one way in. Used on /shop and on the
 * vanity tops aisle. The photographs are Kling's, a plain white quartz top,
 * served through the loader as the ready-made copy that fits the screen
 * (lib/image-variants), not as the 6 MB original.
 */
export function StoreBanner({
  image,
  alt,
  eyebrow,
  title,
  body,
  cta,
  as: Heading = "p",
  className,
}: {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  /** h1 where the banner carries the page's title. */
  as?: "h1" | "p";
  className?: string;
}) {
  return (
    <section className={`relative overflow-hidden rounded-xl bg-[#f3f1ec] ${className ?? ""}`}>
      <div className="relative aspect-[21/9] w-full lg:aspect-[16/5]">
        <Image
          src={image}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1440px) 1380px, 100vw"
          className="object-cover object-[50%_70%]"
        />
        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-white/90 via-white/60 to-transparent sm:w-2/3" />
      </div>
      <div className="absolute inset-y-0 left-0 flex max-w-[540px] flex-col justify-center px-6 text-[#14140f] sm:px-10 lg:px-14">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] opacity-60">{eyebrow}</p>
        <Heading
          className="mt-3 text-[26px] leading-[1.05] sm:text-[40px] lg:text-[48px]"
          style={{ fontVariationSettings: "'wght' 300, 'wdth' 100", letterSpacing: "-0.02em" }}
        >
          {title}
        </Heading>
        <p className="mt-3 hidden max-w-[440px] text-[14px] font-light leading-relaxed sm:block">{body}</p>
        <a
          href={cta.href}
          data-over-media
          className="mt-5 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-[#14140f] px-6 text-[12px] uppercase tracking-[0.14em] text-white hover:opacity-85"
        >
          {cta.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
