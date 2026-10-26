import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * A photograph filling its positioned parent, behind the content, as on
 * /contact and /where-to-buy.
 *
 * One wrapper deep on purpose: the black-on-white skin (app/bw-temp.css)
 * turns copy white when an image sits directly under its container, and
 * this keeps a white card laid over the photograph in dark ink. Copy that
 * does sit on the photograph declares `data-over-media`.
 *
 * `fetchPriority` is for a hero only: Next 15's `priority` preloads the
 * image but leaves it at the browser's default (low) fetch priority.
 */
export function Photo({
  src,
  alt,
  priority,
  fetchPriority,
  sizes = "100vw",
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden={alt ? undefined : true}
      className="absolute inset-0 -z-10"
    >
      <div className="relative h-full w-full">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          fetchPriority={fetchPriority}
          sizes={sizes}
          className={cn("object-cover", className)}
        />
      </div>
    </div>
  );
}
