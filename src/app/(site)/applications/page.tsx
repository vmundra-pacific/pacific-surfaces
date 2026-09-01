import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { APPLICATIONS } from "@/data/applications";

/**
 * /applications — index of every Pacific Application, and the
 * destination of "See more applications" in the Products mega.
 */

export const metadata: Metadata = {
  title: "Pacific Applications — Pacific Surfaces",
  description:
    "Every surface use Pacific is specified for: countertops, islands, backsplashes, vanities, washbasins, cladding, facades, flooring, staircases, furniture, counters and more.",
  alternates: { canonical: "/applications" },
};

export default function ApplicationsIndexPage() {
  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Applications", url: "/applications" },
        ]}
      />

      <PageHeader
        badge="Pacific Applications"
        title="Wherever stone belongs, Pacific belongs."
        description="Fifteen surface applications, each with the collections, thicknesses and finishes we specify for it."
      />

      <section className="bg-pacific-light px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {APPLICATIONS.map((app) => (
            <Link
              key={app.slug}
              href={`/applications/${app.slug}`}
              className="group overflow-hidden rounded-2xl border border-pacific-dark/10 bg-white transition-colors hover:border-pacific-dark/40"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-pacific-dark/5">
                <Image
                  src={app.sections[0].imageUrl}
                  alt={app.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-6">
                <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-pacific-dark/45">
                  {app.badge.replace("Applications · ", "")}
                </span>
                <h2 className="mt-2 inline-flex items-center gap-2 text-xl font-light tracking-tight text-pacific-dark">
                  {app.name}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </h2>
                <p className="mt-2 text-sm font-light leading-relaxed text-pacific-dark/65">
                  {app.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
