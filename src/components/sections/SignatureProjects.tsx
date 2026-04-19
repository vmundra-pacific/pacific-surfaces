"use client";

import { motion } from "framer-motion";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { TextReveal } from "@/components/ui/text-reveal";
import Image from "next/image";
import Link from "next/link";

interface SanityProject {
  _id: string;
  name: string;
  location: string;
  image: string | null;
  link: string | null;
}

const fallbackProjects = [
  {
    loc: "Villa · Mumbai",
    name: "Malabar Hill Residence",
    bg: "from-stone-200 to-stone-100",
  },
  {
    loc: "Hotel · Warsaw",
    name: "Polska Lounge",
    bg: "from-stone-600 to-stone-500",
  },
  {
    loc: "Retail · Dubai",
    name: "Alserkal Flagship",
    bg: "from-stone-700 to-stone-600",
  },
  {
    loc: "Residence · Bengaluru",
    name: "Koramangala House",
    bg: "from-stone-300 to-stone-200",
  },
  {
    loc: "Healthcare · London",
    name: "St. James Clinic",
    bg: "from-stone-400 to-stone-500",
  },
];

const gradientFallbacks = [
  "from-stone-200 to-stone-100",
  "from-stone-600 to-stone-500",
  "from-stone-700 to-stone-600",
  "from-stone-300 to-stone-200",
  "from-stone-400 to-stone-500",
];

export function SignatureProjects({
  projects,
}: {
  projects?: SanityProject[];
}) {
  const hasSanity = projects && projects.length > 0;

  const items = hasSanity
    ? projects.map((p) => ({
        name: p.name,
        loc: p.location,
        image: p.image,
        link: p.link,
      }))
    : fallbackProjects.map((p) => ({
        name: p.name,
        loc: p.loc,
        image: null as string | null,
        link: null as string | null,
        bg: p.bg,
      }));

  const row1 = items.slice(0, 2);
  const row2 = items.slice(2);

  return (
    <section className="py-20 md:py-28 px-6 bg-stone-950">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-16">
          <div className="lg:max-w-lg">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-4"
            >
              05 · Signature Projects
            </motion.div>
            <TextReveal
              as="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-[1.08]"
            >
              Specified by architects on every continent.
            </TextReveal>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:max-w-md lg:pt-12"
          >
            <p className="text-base font-light text-stone-400 leading-relaxed">
              From residential villas in Mumbai to commercial towers in Warsaw
              and quick-service chains across North America — Pacific has
              shipped slabs into more than 30 countries.
            </p>
          </motion.div>
        </div>

        {/* Row 1 */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          {row1.map((p, i) => (
            <StaggerItem
              key={p.name}
              className={i === 0 ? "md:col-span-3" : "md:col-span-2"}
            >
              <ProjectCard
                item={p}
                aspect="aspect-[16/10]"
                fallbackBg={gradientFallbacks[i]}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Row 2 */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {row2.map((p, i) => (
            <StaggerItem key={p.name}>
              <ProjectCard
                item={p}
                aspect="aspect-[4/3]"
                fallbackBg={
                  gradientFallbacks[(i + 2) % gradientFallbacks.length]
                }
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

function ProjectCard({
  item,
  aspect,
  fallbackBg,
}: {
  item: {
    name: string;
    loc: string;
    image: string | null;
    link: string | null;
    bg?: string;
  };
  aspect: string;
  fallbackBg: string;
}) {
  const content = (
    <>
      {item.image ? (
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${item.bg || fallbackBg}`}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <div className="text-[10px] tracking-[0.15em] uppercase text-white/60 mb-1">
          {item.loc}
        </div>
        <div className="text-sm font-medium text-white">{item.name}</div>
      </div>
    </>
  );

  const className = `group relative rounded-2xl overflow-hidden ${aspect} cursor-pointer block`;

  if (item.link) {
    return (
      <Link
        href={item.link}
        target={item.link.startsWith("http") ? "_blank" : undefined}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
