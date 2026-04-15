"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Wind, Sun, Droplets } from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { MagneticButton } from "@/components/ui/magnetic-button";

const pillars = [
  {
    icon: Wind,
    title: "Windmill Energy",
    description:
      "Powered by Siemens Gamesa technology, our windmill systems significantly reduce our carbon footprint while maintaining premium production standards.",
  },
  {
    icon: Sun,
    title: "Solar Energy",
    description:
      "2 MW solar power capacity makes us one of the largest solar-powered quartz companies in India, leading the industry toward renewable manufacturing.",
  },
  {
    icon: Droplets,
    title: "Water Conservation",
    description:
      "Our advanced water recycling technology ensures we replenish more water than we consume, protecting this precious natural resource.",
  },
];

const sdgGoals = [
  {
    number: 3,
    title: "Good Health & Well-Being",
    description: "Creating surfaces with low crystalline silica content that promote safer indoor environments for homeowners, fabricators, and installers.",
  },
  {
    number: 5,
    title: "Gender Equality",
    description: "Building an inclusive workforce where women lead innovation and operations at Pacific Surfaces, championing equal opportunities at every level.",
  },
  {
    number: 8,
    title: "Decent Work & Economic Growth",
    description: "Providing fair employment practices, career growth opportunities, and safe working conditions across our manufacturing facilities in India and Poland.",
  },
  {
    number: 9,
    title: "Industry, Innovation & Infrastructure",
    description: "Investing in patented technologies, Bretonstone manufacturing, and innovations that transform the surface industry with state-of-the-art production.",
  },
  {
    number: 12,
    title: "Responsible Consumption & Production",
    description: "Designing products with lifecycle sustainability in mind, minimizing waste at every production stage, and using recycled materials in our ecosurfaces.",
  },
  {
    number: 13,
    title: "Climate Action",
    description: "Committing to net-zero emissions through 2MW solar power, Siemens Gamesa windmill technology, and continuous environmental improvement initiatives.",
  },
];

export function SustainabilityContent() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    country: "",
    email: "",
    subscribe: false,
  });

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", formData);
    setFormData({
      firstName: "",
      lastName: "",
      company: "",
      country: "",
      email: "",
      subscribe: false,
    });
  };

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-[70vh] flex items-center bg-stone-950 overflow-hidden">
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
            Environmental Commitment
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white max-w-3xl"
          >
            Building a Sustainable Tomorrow
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-6 text-lg text-stone-400 max-w-2xl font-light leading-relaxed"
          >
            At Pacific Surfaces, sustainability isn&apos;t a commitment — it&apos;s the harmony between
            exceptional business practices and environmental responsibility.
          </motion.p>
        </motion.div>
      </section>

      {/* Intro Section */}
      <section className="bg-white border-b border-stone-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection animation="fadeUp" className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900 mb-8">
              Sustainability as a Way of Life
            </h2>
            <div className="space-y-6 text-stone-600 font-light leading-relaxed text-lg">
              <p>
                At Pacific Surfaces, environmental responsibility is woven into every aspect of our operations. We believe that creating premium, durable surfaces and protecting our planet aren&apos;t competing goals — they&apos;re complementary values that define who we are.
              </p>
              <p>
                From eco-friendly manufacturing practices and renewable energy integration to advanced water conservation technologies and low crystalline silica ecosurfaces, we&apos;re committed to leaving a positive environmental legacy while delivering the exceptional surfaces our customers deserve.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
              Our Three Pillars of Sustainability
            </h2>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <StaggerItem key={pillar.title}>
                  <div className="bg-white rounded-2xl p-8 h-full border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all duration-500">
                    <div className="p-3 bg-stone-50 rounded-xl w-fit">
                      <Icon className="w-6 h-6 text-stone-600" />
                    </div>
                    <h3 className="mt-6 text-xl font-light text-stone-900">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 text-sm text-stone-500 font-light leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-white border-b border-stone-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
          <AnimatedSection className="text-center">
            <h3 className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-8">
              Certified Excellence
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="px-6 py-3 bg-stone-50 rounded-full border border-stone-100">
                <span className="text-sm font-light text-stone-700">ISO 9001:2015</span>
              </div>
              <div className="px-6 py-3 bg-stone-50 rounded-full border border-stone-100">
                <span className="text-sm font-light text-stone-700">NSF Certification</span>
              </div>
              <div className="px-6 py-3 bg-stone-50 rounded-full border border-stone-100">
                <span className="text-sm font-light text-stone-700">Greenguard Certified</span>
              </div>
              <div className="px-6 py-3 bg-stone-50 rounded-full border border-stone-100">
                <span className="text-sm font-light text-stone-700">CE Marking</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Ecosurfaces CTA Banner */}
      <section className="bg-stone-900 overflow-hidden relative">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="slideInLeft">
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white mb-6">
                Ecosurfaces
              </h2>
              <p className="text-lg text-stone-300 font-light leading-relaxed mb-8">
                Safe, Sustainable &amp; Stunning — Revolutionary low and zero silica surfaces that prove
                environmental responsibility and premium aesthetics can coexist beautifully.
              </p>
              <MagneticButton href="/ecosurfaces" variant="primary">
                Learn More
              </MagneticButton>
            </AnimatedSection>

            <AnimatedSection animation="slideInRight" delay={0.2}>
              <div className="bg-stone-800 rounded-2xl p-8 border border-stone-700">
                <div className="text-sm font-medium tracking-[0.2em] uppercase text-stone-400 mb-4">
                  Why Choose Ecosurfaces
                </div>
                <ul className="space-y-4 text-stone-300 font-light text-sm">
                  <li className="flex items-start gap-3">
                    <span className="text-stone-400 mt-1">•</span>
                    <span>Reduced silica dust exposure for safer workplaces</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-stone-400 mt-1">•</span>
                    <span>Manufactured with renewable energy sources</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-stone-400 mt-1">•</span>
                    <span>Advanced water recycling integration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-stone-400 mt-1">•</span>
                    <span>Certified for health and environmental standards</span>
                  </li>
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* UN SDGs Section */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
              Sustainable Development Goals
            </h2>
            <p className="mt-4 text-stone-500 font-light max-w-2xl mx-auto">
              Our commitment aligns with the United Nations&apos; Sustainable Development Goals, creating impact across
              multiple dimensions of human and environmental wellbeing.
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sdgGoals.map((goal) => (
              <StaggerItem key={goal.number}>
                <div className="bg-stone-50 rounded-2xl p-8 h-full border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all duration-500">
                  <div className="text-3xl font-light text-stone-900 mb-3">
                    SDG {goal.number}
                  </div>
                  <h3 className="text-lg font-light text-stone-900 mb-4">
                    {goal.title}
                  </h3>
                  <p className="text-sm text-stone-600 font-light leading-relaxed">
                    {goal.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-stone-950">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
              Join Us in Shaping the Future of Stones
            </h2>
            <p className="mt-4 text-stone-400 font-light">
              Stay updated on our sustainability initiatives and new ecosystem products.
            </p>
          </AnimatedSection>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-6 py-3 bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-stone-500 transition-colors font-light"
              />
              <input
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-6 py-3 bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-stone-500 transition-colors font-light"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-6 py-3 bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-stone-500 transition-colors font-light"
              />
              <input
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-6 py-3 bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-stone-500 transition-colors font-light"
              />
            </div>

            <input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-6 py-3 bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-stone-500 transition-colors font-light"
            />

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.subscribe}
                onChange={(e) => setFormData({ ...formData, subscribe: e.target.checked })}
                className="w-5 h-5 rounded accent-stone-500"
              />
              <span className="text-sm text-stone-400 font-light">
                I&apos;d like to receive updates about Pacific Surfaces&apos; sustainability initiatives
              </span>
            </label>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-8 py-3 bg-white text-stone-950 rounded-xl font-light tracking-wide hover:bg-stone-100 transition-colors duration-300"
              >
                Subscribe
              </button>
            </div>
          </motion.form>
        </div>
      </section>
    </>
  );
}
