"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Award, Cpu, Gem, Leaf, Shield, Users, Zap } from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { MagneticButton } from "@/components/ui/magnetic-button";

const stats = [
  { value: "273+", label: "Unique Designs" },
  { value: "44", label: "Collections" },
  { value: "10+", label: "Years Experience" },
  { value: "500+", label: "Projects Delivered" },
];

const timeline = [
  {
    year: "2011",
    title: "Pacific Granites India Pvt. Ltd.",
    description: "Tapped into the export market with a gang saw granite processing unit. The Pacific Group was established and is now poised to be the largest exporters of natural and engineered stones in the Indian stone industry with a growth rate of 25% year after year.",
  },
  {
    year: "2018",
    title: "Pacific Quartz Surfaces LLP",
    description: "Official entry to the Mineral Surface Sector. With an unyielding commitment to offering solutions that inspire and provide value, PACIFIC introduced Pacific Quartz Surfaces. In 2020, acquired a Quartz grit factory (now Pacific Mintek) for high-quality raw materials.",
  },
  {
    year: "2023",
    title: "Pacific Engineered Surfaces Pvt. Ltd.",
    description: "A new era with the launch of a state-of-the-art Bretonstone plant, marking the beginning of fully automated manufacturing. Late 2024, opened a warehouse in Poland as part of global expansion.",
  },
];

const team = [
  { name: "Mohanlal Somani", role: "Chairman" },
  { name: "Varun Somani", role: "Managing Director" },
  { name: "Varun Mundra", role: "Director" },
  { name: "Abhijeet Mankotia", role: "VP — Global Sales" },
  { name: "Anish Datta", role: "VP — Business Development" },
  { name: "Paulina Popławska", role: "Director, Pacific Polska" },
  { name: "Nagesh P K", role: "Commercial Manager, Pacific Granites India" },
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
    title: "10-Year Warranty",
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
      <section ref={heroRef} className="relative min-h-[70vh] flex items-center bg-stone-950 overflow-hidden">
        {/* Background texture */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-stone-950/80 to-stone-950" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pt-32 pb-20"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-6"
          >
            Our Story
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white max-w-3xl"
          >
            Crafting Surfaces That Tell a Story
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-6 text-lg text-stone-400 max-w-2xl font-light leading-relaxed"
          >
            Pacific Surfaces is India&apos;s premier manufacturer of engineered quartz and granite
            surfaces, dedicated to transforming spaces with materials that harmonize beauty,
            durability, and innovation.
          </motion.p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-stone-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <StaggerItem key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-light text-stone-900 tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-2 text-xs font-medium tracking-[0.2em] uppercase text-stone-400">
                  {stat.label}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Story */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection animation="slideInLeft">
              <span className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-4 block">
                Who We Are
              </span>
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
                From Vision to Surface
              </h2>
              <div className="mt-8 space-y-6 text-stone-500 font-light leading-relaxed">
                <p>
                  With over 273 unique designs across 44 curated collections — from the bold
                  Chromia series to the celestial Kosmic range — we offer the widest selection of
                  premium surfaces in India.
                </p>
                <p>
                  Our patented textures and proprietary finishes are the result of years of
                  research and development. Each slab is engineered to meet the highest
                  international standards, making our surfaces ideal for kitchen countertops,
                  bathroom vanities, wall cladding, flooring, and statement furniture.
                </p>
                <p>
                  We believe every surface should be a work of art — engineered for life,
                  designed for the extraordinary.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slideInRight" delay={0.2}>
              <div className="relative">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100">
                  <img
                    src="https://static.wixstatic.com/media/79abd5_1ef7e4c1e66f4ed49a4bcbbc547d4663~mv2.jpg"
                    alt="Premium surface craftsmanship"
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Floating accent */}
                <div className="absolute -bottom-6 -left-6 bg-stone-900 text-white p-8 rounded-2xl">
                  <div className="text-2xl font-light">10+</div>
                  <div className="text-xs tracking-wider uppercase text-stone-400 mt-1">
                    Years of Excellence
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Disruptive Technology */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-4 block">
              Manufacturing Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
              Disruptive Technology
            </h2>
            <p className="mt-4 text-stone-500 font-light max-w-2xl mx-auto">
              Integrating Technology with Innovation
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Cpu,
                title: "Integrating Technology with Innovation",
                description: "We believe in the power of technology to enhance craftsmanship and redefine industry standards. Our new plant represents a fusion of advanced machinery and creative innovation, resulting in products that surpass expectations. We have invested in the latest manufacturing technologies to streamline processes, minimize waste, and optimize production output.",
              },
              {
                icon: Zap,
                title: "High-Speed Production Line",
                description: "With our high-speed production line, we have significantly accelerated the manufacturing process without compromising on quality. Our plant boasts an impressive capacity to meet the ever-growing demands of our clients, ensuring timely delivery and superior craftsmanship. From cutting to polishing, our automated systems guarantee precision and consistency in every slab.",
              },
              {
                icon: Leaf,
                title: "Sustainable Manufacturing Plant",
                description: "Sustainability is at the core of our operations. Our new fully automated plant incorporates eco-friendly practices throughout the production cycle, ensuring minimal impact on the environment. By choosing our products, you are not only embracing elegance and quality but also contributing to a greener and more sustainable future.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title}>
                  <div className="bg-stone-50 rounded-2xl p-8 h-full">
                    <div className="p-3 bg-white rounded-xl w-fit">
                      <Icon className="w-6 h-6 text-stone-600" />
                    </div>
                    <h3 className="mt-6 text-base font-medium text-stone-900">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm text-stone-600 font-light leading-relaxed">
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
      <section className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-4 block">
              What Drives Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
              Our Commitment
            </h2>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <StaggerItem key={value.title}>
                  <div className="bg-white rounded-2xl p-8 h-full border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all duration-500">
                    <div className="p-3 bg-stone-50 rounded-xl w-fit">
                      <Icon className="w-5 h-5 text-stone-600" />
                    </div>
                    <h3 className="mt-6 text-base font-medium text-stone-900">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-sm text-stone-500 font-light leading-relaxed">
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
      <section className="bg-white border-b border-stone-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900 max-w-xl mx-auto">
              Grow with PACIFIC
            </h2>
            <p className="mt-4 text-stone-600 font-light max-w-2xl mx-auto">
              Join us and become a part of a dynamic team where your talents are valued, and your contributions make a real impact. Explore career opportunities at PACIFIC and discover a workplace where our values shape our culture every day.
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
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white max-w-xl mx-auto">
              Ready to find the perfect surface?
            </h2>
            <p className="mt-4 text-stone-400 font-light max-w-md mx-auto">
              Let our specialists help you choose the ideal material for your project.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/contact" variant="primary" size="lg">
                Get in Touch
              </MagneticButton>
              <MagneticButton href="/products" variant="outline" size="lg">
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
    <section className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
        <AnimatedSection className="text-center mb-16">
          <span className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-4 block">
            Our Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
            Milestones & Growth
          </h2>
        </AnimatedSection>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-0 lg:left-1/2 top-0 bottom-0 w-1 bg-stone-200 lg:-translate-x-1/2" />

          <div className="space-y-12 lg:space-y-16">
            {timeline.map((item, index) => (
              <AnimatedSection
                key={item.year}
                animation="fadeUp"
                delay={index * 0.15}
              >
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative`}>
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-6 w-4 h-4 bg-stone-900 rounded-full -translate-x-1.5 lg:left-1/2 lg:-translate-x-1/2 z-10" />

                  {/* Content positioning */}
                  <div className={`lg:col-span-1 ${index % 2 === 0 ? "lg:text-right" : "lg:col-start-2"} pl-8 lg:pl-0`}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="text-sm font-medium tracking-[0.2em] uppercase text-stone-400 block mb-2">
                        {item.year}
                      </span>
                      <h3 className="text-xl font-light tracking-tight text-stone-900 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-stone-600 font-light leading-relaxed max-w-md">
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
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
        <AnimatedSection className="text-center mb-16">
          <span className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-4 block">
            Leadership
          </span>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
            The Team
          </h2>
          <p className="mt-4 text-stone-500 font-light max-w-2xl mx-auto">
            Meet the passionate and dedicated team driving innovation at PACIFIC, blending creativity and expertise to bring you the finest in Quartz design.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => {
            const initials = member.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <StaggerItem key={`${member.name}-${member.role}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-stone-50 rounded-2xl p-6 text-center border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all duration-500"
                >
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-stone-100 border-2 border-stone-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-stone-600">{initials}</span>
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-base font-light tracking-tight text-stone-900">
                    {member.name}
                  </h3>

                  {/* Role */}
                  <p className="mt-2 text-xs font-medium tracking-[0.15em] uppercase text-stone-400">
                    {member.role}
                  </p>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
