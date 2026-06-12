"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Award, Cpu, Gem, Leaf, Shield, Users, Zap } from "lucide-react";

// Lucide-react 1.7 ships without a LinkedIn glyph, so inline the
// official mark as SVG. 24×24 viewBox matches every other icon used
// on this page; size/color come from parent classes via `currentColor`.
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { MagneticButton } from "@/components/ui/magnetic-button";

const stats = [
  { value: "273+", label: "Unique Designs" },
  { value: "44", label: "Collections" },
  { value: "25+", label: "Years Experience" },
  { value: "500+", label: "Projects Delivered" },
];

const timeline = [
  {
    year: "2000",
    title: "Pacific Granites — Founded",
    description:
      "Inception of Pacific Granites as a regional natural stone supplier, laying the foundation for what would become one of India's leading engineered surface manufacturers.",
  },
  {
    year: "2011",
    title: "Pacific Granites India Pvt. Ltd.",
    description:
      "Tapped into the export market with a gang saw granite processing unit. Now poised to be the largest exporters of natural and engineered stones in the Indian stone industry with a growth rate of 25% year after year.",
  },
  {
    year: "2018",
    title: "Pacific Quartz Surfaces LLP",
    description:
      "Official entry to the Mineral Surface Sector. With an unyielding commitment to offering solutions that inspire and provide value, PACIFIC introduced Pacific Quartz Surfaces. In 2020, acquired a Quartz grit factory (now Pacific Mintek) for high-quality raw materials.",
  },
  {
    year: "2023",
    title: "Pacific Engineered Surfaces Pvt. Ltd.",
    description:
      "A new era with the launch of a state-of-the-art Bretonstone plant, marking the beginning of fully automated manufacturing. Late 2024, opened a warehouse in Poland as part of global expansion.",
  },
];

// Team list — `linkedin` is optional. When set, the card becomes a
// clickable link to that member's profile (opens in a new tab). Cards
// with no URL stay non-interactive. Paste each member's LinkedIn URL
// into the `linkedin` field below as they get confirmed.
const team: {
  name: string;
  role: string;
  photo?: string;
  linkedin?: string;
}[] = [
  {
    name: "Mohanlal Somani",
    role: "Chairman",
    photo: "/team/mohanlal-somani.jpg",
    linkedin: "",
  },
  {
    name: "Varun Somani",
    role: "Managing Director",
    photo: "/team/varun-somani.jpg",
    linkedin: "https://www.linkedin.com/in/varunsomani-pacific/",
  },
  {
    name: "Varun Mundra",
    role: "Director",
    photo: "/team/varun-mundra.jpg",
    linkedin: "https://www.linkedin.com/in/varun-mundra-ba4b9589/",
  },
  {
    name: "Abhijeet Mankotia",
    role: "VP — Global Sales",
    photo: "/team/abhijeet-mankotia.jpg",
    linkedin: "https://www.linkedin.com/in/abhijeet-mankotia-a7b849172/",
  },
  {
    name: "Anish Datta",
    role: "VP — Business Development",
    photo: "/team/anish-datta.jpg",
    linkedin: "https://www.linkedin.com/in/anish-datta-690161159/",
  },
  {
    name: "Paulina Popławska",
    role: "Director, Pacific Polska",
    photo: "/team/paulina-poplawska.jpg",
    linkedin: "",
  },
  {
    name: "Nagesh P K",
    role: "Commercial Manager, Pacific Granites India",
    photo: "/team/nagesh-pk.jpg",
    linkedin: "",
  },
  {
    name: "Anumuthan",
    role: "General Manager",
    photo: "/team/anumuthan.png",
    linkedin: "https://www.linkedin.com/in/anumuthan-anu-429951313/",
  },
  {
    name: "Marcin",
    role: "Business Development Consultant (Central & Eastern Europe)",
    photo: "/team/marcin.png",
    linkedin: "https://www.linkedin.com/in/marcin-kołczynski-313b4114b",
  },
];

const values = [
  {
    icon: Gem,
    title: "Uncompromising Quality",
    description:
      "Every slab undergoes rigorous quality testing to meet international standards of beauty and durability.",
  },
  {
    icon: Award,
    title: "Patented Innovation",
    description:
      "Our exclusive textures and finishes are the result of years of R&D — surfaces you won't find anywhere else.",
  },
  {
    icon: Leaf,
    title: "Sustainable Practices",
    description:
      "Our eco-surface line proves that premium quality and environmental responsibility can coexist beautifully.",
  },
  {
    icon: Shield,
    title: "Lifetime Warranty",
    description:
      "We stand behind every surface we create with comprehensive coverage that gives you complete peace of mind.",
  },
  {
    icon: Users,
    title: "Expert Guidance",
    description:
      "From material selection to installation, our team of surface specialists is with you at every step.",
  },
  {
    icon: Zap,
    title: "Rapid Delivery",
    description:
      "With a vast inventory and efficient logistics, we ensure your project stays on schedule.",
  },
];

export function AboutContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      {/* Hero */}
      <section
        ref={heroRef}
        // Full viewport height so the video occupies the entire
        // first screen — the user lands on it before any other
        // content is visible. items-end keeps the text container
        // pinned to the bottom-left corner over the video,
        // leaving the upper area of the frame open to show the
        // playing footage.
        className="relative min-h-screen flex items-end bg-stone-950 overflow-hidden"
      >
        {/* Background layers — video, scrim, and noise texture, all
            inside the same parallax wrapper so they translate together
            with scroll. Order top-to-bottom = bottom-to-top in z-stack:
              1. <video>           — actual content (deepest layer)
              2. gradient scrim    — darkens lower half so text reads
              3. noise SVG         — faint stone-like grain on top
            The headline + paragraph sit in the foreground motion.div
            below this block. */}
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          {/* Background video — autoplays muted-looped behind the text.
              Drop the file at /public/videos/about-hero.mp4 (see the
              PowerShell instruction in the assistant message that
              shipped this change). */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/videos/about-hero.mp4"
            poster="/videos/about-hero-poster.jpg"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          {/* Gradient scrim — lighter at the top so the video reads
              through, ramping to fully opaque at the bottom so the
              section transitions seamlessly into the next block.
              Tuned so the headline copy in the lower-middle of the
              hero stays comfortably legible against any frame. */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/30 via-stone-950/60 to-stone-950" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          // Bottom-left positioning: mx-auto removed so the block
          // hugs the section's left edge (still inset by the
          // px-6/px-8 gutter so it lines up with page content
          // below). pt-32 dropped since items-end on the section
          // already pulls us to the bottom — the old pt was
          // padding for a vertically-centred hero.
          className="relative z-10 max-w-3xl px-6 lg:px-8 pb-12"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block text-[10px] md:text-xs font-medium tracking-[0.25em] uppercase text-pacific-mid/70 mb-4"
          >
            Our Story
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.25, 0.4, 0.25, 1],
            }}
            className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white max-w-xl"
          >
            Crafting Surfaces That Tell a Story
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-4 text-sm md:text-base text-pacific-mid/70 max-w-md font-light leading-relaxed"
          >
            Pacific Surfaces is India&apos;s premier manufacturer of engineered
            quartz and granite surfaces, dedicated to transforming spaces with
            materials that harmonize beauty, durability, and innovation.
          </motion.p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-[#112732] border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <StaggerItem key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-light text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-2 text-xs font-medium tracking-[0.2em] uppercase text-pacific-mid/70">
                  {stat.label}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Story — full-bleed team video as background, centered copy
          on top. Replaces the previous side-by-side layout where a
          family portrait sat next to the text; the video gives the
          section more atmosphere and frees the copy to occupy the
          frame on its own. The "10+ Years of Excellence" stat that
          floated off the old portrait is now a small inline caption
          beneath the headline so the brand stamp survives. */}
      <section className="relative overflow-hidden bg-[#112732]">
        {/* Background video. Muted/looped/playsInline so iOS Safari
            autoplays without user gesture. Poster is the first
            beautifully-lit frame, served via the file ffmpeg pulled
            at t=1.5s. Falls back to the poster if the network can't
            keep up — the dark scrim above means readability never
            depends on the video frame underneath. */}
        <video
          src="/videos/team-section.mp4"
          poster="/videos/team-section-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Dark scrim — keeps the body copy at full WCAG contrast
            regardless of which frame is on screen behind it. */}
        <div aria-hidden="true" className="absolute inset-0 bg-[#112732]/75" />

        <div className="relative mx-auto max-w-3xl px-6 lg:px-8 py-20 sm:py-28 lg:py-36 text-center">
          <AnimatedSection animation="fadeIn">
            <span className="text-xs font-medium tracking-[0.25em] uppercase text-pacific-mid/80 mb-5 block">
              Who We Are
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-tight">
              From Vision to Surface
            </h2>

            {/* "25+ Years of Excellence" — preserved from the
                previous floating accent, now as a small inline
                colophon under the headline. */}
            <div className="mt-5 inline-flex items-center gap-3 text-pacific-mid/80">
              <span className="block w-6 h-px bg-pacific-mid/40" />
              <span className="text-[11px] tracking-[0.3em] uppercase font-medium">
                25+ Years of Excellence
              </span>
              <span className="block w-6 h-px bg-pacific-mid/40" />
            </div>

            <div className="mt-10 space-y-6 text-pacific-mid font-light leading-relaxed text-base sm:text-lg">
              <p>
                With over 273 unique designs across 44 curated collections —
                from the bold Eclipse series to the celestial Kosmic range — we
                offer the widest selection of premium surfaces in India.
              </p>
              <p>
                Our patented textures and proprietary finishes are the result of
                years of research and development. Each slab is engineered to
                meet the highest international standards, making our surfaces
                ideal for kitchen countertops, bathroom vanities, wall cladding,
                flooring, and statement furniture.
              </p>
              <p>
                We believe every surface should be a work of art — engineered
                for life, designed for the extraordinary.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Disruptive Technology */}
      <section className="bg-[#0e2030]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20 lg:py-32">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-medium tracking-[0.25em] uppercase text-pacific-mid/70 mb-4 block">
              Manufacturing Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
              Disruptive Technology
            </h2>
            <p className="mt-4 text-pacific-mid font-light max-w-2xl mx-auto">
              Integrating Technology with Innovation
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {[
              {
                icon: Cpu,
                title: "Integrating Technology with Innovation",
                description:
                  "Our new plant fuses advanced machinery with creative innovation. We've invested in the latest manufacturing tech to streamline processes, minimize waste, and optimize output — surpassing expectations on every slab.",
              },
              {
                icon: Zap,
                title: "High-Speed Production Line",
                description:
                  "Our automated production line accelerates manufacturing without compromising quality. From cutting to polishing, automated systems guarantee precision and consistency — delivering at the capacity our clients demand.",
              },
              {
                icon: Leaf,
                title: "Sustainable Manufacturing Plant",
                description:
                  "Sustainability is core to our operations. Our fully-automated plant builds eco-friendly practices into every step of the production cycle — elegance and quality, with a measurably lighter footprint.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title} className="h-full">
                  <div className="bg-white/5 rounded-2xl p-6 sm:p-8 h-full border border-white/10 flex flex-col">
                    <div className="p-3 bg-white/10 rounded-xl w-fit">
                      <Icon className="w-6 h-6 text-pacific-mid" />
                    </div>
                    <h3 className="mt-6 text-base font-medium text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm text-pacific-mid font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Timeline */}
      <TimelineSection />

      {/* Team */}
      <TeamSection />

      {/* Values */}
      <section className="bg-[#0e2030]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20 lg:py-32">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-medium tracking-[0.25em] uppercase text-pacific-mid/70 mb-4 block">
              What Drives Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
              Our Commitment
            </h2>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <StaggerItem key={value.title} className="h-full">
                  <div className="bg-white/5 rounded-2xl p-8 h-full border border-white/10 hover:border-white/15 transition-all duration-500 flex flex-col">
                    <div className="p-3 bg-white/5 rounded-xl w-fit">
                      <Icon className="w-5 h-5 text-pacific-mid" />
                    </div>
                    <h3 className="mt-6 text-base font-medium text-white">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-sm text-pacific-mid font-light leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Grow with PACIFIC */}
      <section className="bg-[#112732] border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20 lg:py-32 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white max-w-xl mx-auto">
              Grow with PACIFIC
            </h2>
            <p className="mt-4 text-pacific-mid font-light max-w-2xl mx-auto">
              Join us and become a part of a dynamic team where your talents are
              valued, and your contributions make a real impact. Explore career
              opportunities at PACIFIC and discover a workplace where our values
              shape our culture every day.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/careers" variant="primary" size="lg">
                View Careers
              </MagneticButton>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20 lg:py-32 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white max-w-xl mx-auto">
              Ready to find the perfect surface?
            </h2>
            <p className="mt-4 text-stone-400 font-light max-w-md mx-auto">
              Let our specialists help you choose the ideal material for your
              project.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/contact" variant="primary" size="lg">
                Get in Touch
              </MagneticButton>
              <MagneticButton href="/products" variant="outline-dark" size="lg">
                Explore Surfaces
              </MagneticButton>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}

function TimelineSection() {
  return (
    // relative + isolate so the looping background video can sit
    // behind the content without bleeding into neighbouring sections.
    // The video is muted/looped/playsInline so iOS autoplays it; an
    // overlay tints it down so white text stays legible.
    <section className="relative isolate overflow-hidden bg-[#112732]">
      {/* Background video — silent, looping, full-bleed cover */}
      <video
        className="absolute inset-0 w-full h-full object-cover -z-10"
        src="/videos/milestones-growth.mp4"
        poster="/videos/milestones-growth-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      {/* Tint overlay — deep navy at ~70% opacity preserves the brand
          mood and keeps the timeline text readable over the video. */}
      <div className="absolute inset-0 bg-[#112732]/72 -z-10" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 sm:py-20 lg:py-32">
        <AnimatedSection className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-medium tracking-[0.25em] uppercase text-pacific-mid/70 mb-4 block">
            Our Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
            Milestones & Growth
          </h2>
        </AnimatedSection>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-0 lg:left-1/2 top-0 bottom-0 w-1 bg-white/10 lg:-translate-x-1/2" />

          <div className="space-y-12 lg:space-y-16">
            {timeline.map((item, index) => (
              <AnimatedSection
                key={item.year}
                animation="fadeUp"
                delay={index * 0.15}
              >
                <div
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-6 w-4 h-4 bg-white rounded-full -translate-x-1.5 lg:left-1/2 lg:-translate-x-1/2 z-10" />

                  {/* Content positioning */}
                  <div
                    className={`lg:col-span-1 ${index % 2 === 0 ? "lg:text-right" : "lg:col-start-2"} pl-8 lg:pl-0`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="text-sm font-medium tracking-[0.2em] uppercase text-pacific-mid/70 block mb-2">
                        {item.year}
                      </span>
                      <h3 className="text-xl font-light tracking-tight text-white mb-3">
                        {item.title}
                      </h3>
                      <p className="text-pacific-mid font-light leading-relaxed max-w-md">
                        {item.description}
                      </p>
                    </motion.div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section className="bg-[#0e2030]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 sm:py-20 lg:py-32">
        <AnimatedSection className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-medium tracking-[0.25em] uppercase text-pacific-mid/70 mb-4 block">
            Leadership
          </span>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
            The Team
          </h2>
          <p className="mt-4 text-pacific-mid font-light max-w-2xl mx-auto">
            Meet the passionate and dedicated team driving innovation at
            PACIFIC, blending creativity and expertise to bring you the finest
            in Quartz design.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {team.map((member) => {
            const initials = member.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            const hasLinkedIn = Boolean(member.linkedin);
            const cardInner = (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 transition-all duration-500 h-full ${
                  hasLinkedIn
                    ? "hover:border-[#0a66c2]/60 cursor-pointer"
                    : "hover:border-white/20"
                }`}
              >
                {/* Full-bleed photo. Photos are square / portrait
                    headshots; object-cover fills the 3:4 card
                    regardless of source aspect. Falls back to a
                    gradient + initials when no photo is set. */}
                {member.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.photo}
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    // object-top anchors the crop to the top of the
                    // photo so the head and hair stay in frame when
                    // the 3:4 card is taller than the source. The
                    // default 50/50 anchor was clipping foreheads.
                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center">
                    <span className="text-3xl font-light text-white/30 tracking-wider">
                      {initials}
                    </span>
                  </div>
                )}

                {/* Gradient scrim at the bottom — keeps the name
                    and role legible against any photo. */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* LinkedIn badge — top-right corner, only when the
                    member has a profile URL set. Fades in on card
                    hover so it doesn't clutter the photo at rest. */}
                {hasLinkedIn && (
                  <div
                    className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#0a66c2] text-white opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
                    aria-hidden="true"
                  >
                    <LinkedInIcon className="h-4 w-4" />
                  </div>
                )}

                {/* Text — pinned to the bottom of the card. */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-base font-medium text-white tracking-tight">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-[10px] font-medium tracking-[0.2em] uppercase text-white/75">
                    {member.role}
                  </p>
                </div>
              </motion.div>
            );

            return (
              <StaggerItem
                key={`${member.name}-${member.role}`}
                className="h-full"
              >
                {hasLinkedIn ? (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on LinkedIn`}
                    className="block h-full focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/60 focus:ring-offset-2 focus:ring-offset-stone-950 rounded-2xl"
                  >
                    {cardInner}
                  </a>
                ) : (
                  cardInner
                )}
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
