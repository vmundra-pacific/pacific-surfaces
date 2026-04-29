"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Send } from "lucide-react";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { MagneticButton } from "@/components/ui/magnetic-button";

/* ------------------------------------------------------------------ *
 * Sanity data shapes                                                  *
 * ------------------------------------------------------------------ */
interface JobOpening {
  _id: string;
  title: string;
  location: string;
  department?: string | null;
  description: string;
}

interface ValueCard {
  title: string;
  description: string;
}

interface CareersPageData {
  heroEyebrow?: string | null;
  heroHeadline?: string | null;
  heroDescription?: string | null;
  heroImage?: string | null;
  heroVideoUrl?: string | null;
  values?: ValueCard[] | null;
  openPositionsHeading?: string | null;
  openPositionsDescription?: string | null;
  applyHeading?: string | null;
  applyDescription?: string | null;
  ctaHeading?: string | null;
  ctaDescription?: string | null;
}

interface Props {
  pageData: CareersPageData | null;
  openings: JobOpening[];
}

/* ------------------------------------------------------------------ *
 * Fallbacks — used when the careersPage singleton is empty            *
 * ------------------------------------------------------------------ */
const FALLBACK_HERO = {
  eyebrow: "Careers",
  headline: "An Environment That Supports Your Progress",
  description:
    "Pacific is built on the belief that great environments help people thrive. Our products are designed to elevate spaces across the globe, creating settings that are functional, expressive, and welcoming. For our team and partners, we nurture a culture of openness and growth.",
};

const FALLBACK_VALUES: ValueCard[] = [
  {
    title: "A Place to Grow",
    description:
      "At Pacific, we invest in people. We offer an environment where talent is recognized, skills evolve, and every individual is encouraged to reach their highest potential.",
  },
  {
    title: "A Culture That Inspires",
    description:
      "We believe in teamwork, open communication, and positive energy. Our workspace is built on enthusiasm, ambition, and a mindset that welcomes new ideas.",
  },
  {
    title: "A Future We Build Together",
    description:
      "Join a company committed to integrity, innovation, and responsible growth. At Pacific, you become part of a team shaping meaningful, global impact.",
  },
];

export function CareersContent({ pageData, openings }: Props) {
  // Resolve copy with fallbacks so the page never breaks even if
  // the careersPage singleton hasn't been published yet.
  const hero = {
    eyebrow: pageData?.heroEyebrow || FALLBACK_HERO.eyebrow,
    headline: pageData?.heroHeadline || FALLBACK_HERO.headline,
    description: pageData?.heroDescription || FALLBACK_HERO.description,
  };
  const values =
    pageData?.values && pageData.values.length > 0
      ? pageData.values
      : FALLBACK_VALUES;
  const openPositionsHeading =
    pageData?.openPositionsHeading || "Open Positions";
  const openPositionsDescription =
    pageData?.openPositionsDescription ||
    "Explore career opportunities across our global offices.";
  const applyHeading = pageData?.applyHeading || "Apply Now";
  const applyDescription =
    pageData?.applyDescription ||
    "Send us your information and resume. We'll review your application and get back to you soon.";
  const ctaHeading = pageData?.ctaHeading || "Don't see the right position?";
  const ctaDescription =
    pageData?.ctaDescription ||
    "Send us your resume and let us know your interest. We'd love to consider you for future opportunities.";

  // Hero media — defaults to /videos/careers-hero.mp4 if the
  // editor hasn't overridden it in Sanity. Drop the file into
  // pacific-surfaces/public/videos/ for it to play.
  const heroVideoUrl = pageData?.heroVideoUrl ?? "/videos/careers-hero.mp4";
  const heroImage = pageData?.heroImage ?? null;

  /* --- Dropdown search -------------------------------------------- */

  // Title and Location dropdown options derived from the published
  // openings — adding a new opening in Studio automatically extends
  // both dropdowns. Sorted, deduped.
  const titleOptions = useMemo(
    () => Array.from(new Set(openings.map((o) => o.title))).sort(),
    [openings]
  );
  const locationOptions = useMemo(
    () => Array.from(new Set(openings.map((o) => o.location))).sort(),
    [openings]
  );

  const [titleFilter, setTitleFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  // searchActive flips to true after the user clicks GO. Until
  // then, the result list stays hidden — matches the Wix-style
  // "search-on-demand" UX rather than auto-displaying the full
  // catalogue.
  const [searchActive, setSearchActive] = useState(false);

  const filteredOpenings = useMemo(() => {
    return openings.filter((o) => {
      if (titleFilter && o.title !== titleFilter) return false;
      if (locationFilter && o.location !== locationFilter) return false;
      return true;
    });
  }, [openings, titleFilter, locationFilter]);

  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function handleGo() {
    setSearchActive(true);
    // Defer the scroll until after the results render so the
    // anchor is in the DOM at scroll time.
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  /* --- Apply state ------------------------------------------------- */

  // The role title the candidate clicked Apply on, propagated to
  // the API as `appliedFor` so the jobApplication doc records
  // which role they're targeting. Empty when the candidate uses
  // the closing CTA / form without picking a specific role.
  const [appliedRole, setAppliedRole] = useState<string>("");

  function handleApply(roleTitle: string) {
    setAppliedRole(roleTitle);
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  /* --- Form -------------------------------------------------------- */

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    department: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      setSubmitError("Please attach your resume.");
      setSubmitStatus("error");
      return;
    }
    setSubmitStatus("submitting");
    setSubmitError("");

    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
    payload.append("resume", resumeFile);
    if (appliedRole) payload.append("appliedFor", appliedRole);

    try {
      const res = await fetch("/api/careers/apply", {
        method: "POST",
        body: payload,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Submission failed");
      }
      setSubmitStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        department: "",
      });
      setResumeFile(null);
      setAppliedRole("");
      setTimeout(() => setSubmitStatus("idle"), 4000);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 4000);
    }
  };

  /* --- Render ------------------------------------------------------ */

  return (
    <>
      {/* Hero — full-screen, optional looped video background.
          Layer order (bottom → top):
            1. <video> (or <img> fallback / dark fallback)
            2. dark gradient scrim so headline reads against any frame
            3. text content (eyebrow + headline + paragraph) */}
      <section className="relative min-h-screen flex items-center bg-stone-950 overflow-hidden">
        {/* Background media */}
        <div className="absolute inset-0 z-0">
          {heroVideoUrl ? (
            <video
              key={heroVideoUrl}
              src={heroVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : null}
          {/* Scrim — keeps the corner caption readable regardless of
              which frame the video is on, ramps to fully opaque
              dark at the bottom so the section transitions cleanly
              into the Values block below. */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/30 via-stone-950/55 to-stone-950" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-24 text-center"
        >
          <span className="inline-block text-xs font-medium tracking-[0.25em] uppercase text-pacific-light/80 mb-6">
            {hero.eyebrow}
          </span>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white max-w-3xl mx-auto"
            style={{
              textShadow: "0 2px 6px rgba(0,0,0,.6), 0 6px 32px rgba(0,0,0,.5)",
            }}
          >
            {hero.headline}
          </h1>
          <p
            className="mt-6 text-lg text-pacific-light/85 max-w-2xl mx-auto font-light leading-relaxed"
            style={{
              textShadow: "0 1px 3px rgba(0,0,0,.6)",
            }}
          >
            {hero.description}
          </p>
        </motion.div>
      </section>

      {/* Values */}
      <section className="bg-[#112732]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {values.map((value) => (
              <StaggerItem key={value.title} className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/15 transition-all duration-500 h-full flex flex-col"
                >
                  <h3 className="text-xl font-light tracking-tight text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-pacific-mid font-light leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Open Positions — search bar + results */}
      <section className="bg-[#0e2030]" ref={resultsRef}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
          <AnimatedSection className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
              {openPositionsHeading}
            </h2>
            <p className="mt-3 text-pacific-mid font-light">
              {openPositionsDescription}
            </p>
          </AnimatedSection>

          {/* Search bar — Job Title + Location dropdowns + GO. The
              dropdowns are populated from `openings` so adding a new
              role in Studio extends them automatically. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-12 bg-white/5 rounded-2xl p-5 sm:p-6 lg:p-8 border border-white/10"
          >
            <DropdownField
              label="Job Title"
              value={titleFilter}
              onChange={setTitleFilter}
              placeholder="Select Job Title"
              options={titleOptions}
              className="md:col-span-5"
            />
            <DropdownField
              label="Location"
              value={locationFilter}
              onChange={setLocationFilter}
              placeholder="Select Location"
              options={locationOptions}
              className="md:col-span-5"
            />
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleGo}
                className="w-full bg-white text-[#112732] px-6 py-3 rounded-lg font-medium tracking-wide hover:bg-white/90 transition-colors"
              >
                GO!
              </button>
            </div>
          </motion.div>

          {/* Reset / clear when filters are set but search not yet
              run. Subtle hint to the user. */}
          {!searchActive && (titleFilter || locationFilter) && (
            <p className="text-sm text-pacific-mid/70 font-light mb-8">
              Click GO! to search.
            </p>
          )}

          {/* Results — only visible after the user hits GO. */}
          {searchActive && (
            <>
              <div className="mb-6 text-sm text-pacific-mid font-light tracking-wide">
                <span className="text-white font-medium">
                  {filteredOpenings.length}
                </span>{" "}
                {filteredOpenings.length === 1
                  ? "position matches"
                  : "positions match"}
                {(titleFilter || locationFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setTitleFilter("");
                      setLocationFilter("");
                    }}
                    className="ml-3 underline underline-offset-4 hover:text-white"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {filteredOpenings.length === 0 ? (
                <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/10">
                  <p className="text-pacific-mid font-light">
                    No positions match these filters right now. Try widening the
                    search, or send your resume via the application form below —
                    we&apos;d love to consider you for future opportunities.
                  </p>
                </div>
              ) : (
                <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  {filteredOpenings.map((job, index) => (
                    <StaggerItem key={job._id} className="h-full">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500 flex flex-col h-full"
                      >
                        <div className="flex-1">
                          <h3 className="text-lg font-light tracking-tight text-white">
                            {job.title}
                          </h3>
                          <div className="mt-2 flex gap-2 flex-wrap">
                            <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-medium tracking-wide text-pacific-mid">
                              {job.location}
                            </span>
                            {job.department && (
                              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium tracking-wide text-pacific-light">
                                {job.department}
                              </span>
                            )}
                          </div>
                          <p className="mt-4 text-sm text-pacific-mid font-light leading-relaxed">
                            {job.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApply(job.title)}
                          className="mt-6 self-start text-sm font-medium tracking-wide text-white border-b border-white/40 pb-1 hover:border-white transition-colors"
                        >
                          Apply for this role →
                        </button>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </>
          )}
        </div>
      </section>

      {/* Application Form */}
      <section className="bg-[#112732]" ref={formRef}>
        <div className="mx-auto max-w-2xl px-6 lg:px-8 py-16 lg:py-24">
          <AnimatedSection className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
              {applyHeading}
            </h2>
            <p className="mt-3 text-pacific-mid font-light">
              {applyDescription}
            </p>
            {appliedRole && (
              <p className="mt-3 text-sm text-pacific-light">
                Applying for: <strong>{appliedRole}</strong>
                <button
                  type="button"
                  onClick={() => setAppliedRole("")}
                  className="ml-2 text-pacific-mid hover:text-white transition-colors text-xs"
                >
                  (clear)
                </button>
              </p>
            )}
          </AnimatedSection>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-6 bg-white/5 rounded-2xl p-6 sm:p-8 border border-white/10"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormInput
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
                required
              />
              <FormInput
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                required
              />
              <FormInput
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>

            <FormInput
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="123 Main Street, City, State"
              required
            />

            <div>
              <label className="block text-xs font-medium tracking-[0.15em] uppercase text-pacific-mid mb-3">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 font-light text-white focus:outline-none focus:border-white/30 transition-colors"
              >
                <option value="" className="bg-[#112732]">
                  Select a department...
                </option>
                <option value="sales" className="bg-[#112732]">
                  Sales & Business Development
                </option>
                <option value="marketing" className="bg-[#112732]">
                  Marketing & Communications
                </option>
                <option value="operations" className="bg-[#112732]">
                  Operations & Supply Chain
                </option>
                <option value="finance" className="bg-[#112732]">
                  Finance & Accounting
                </option>
                <option value="design" className="bg-[#112732]">
                  Design & Architecture
                </option>
                <option value="hr" className="bg-[#112732]">
                  Human Resources
                </option>
                <option value="other" className="bg-[#112732]">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium tracking-[0.15em] uppercase text-pacific-mid mb-3">
                Upload Resume
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 font-light text-white focus:outline-none focus:border-white/30 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white/10 file:font-light file:text-pacific-light hover:file:bg-white/15"
              />
              {resumeFile && (
                <p className="mt-2 text-xs text-pacific-mid">
                  Selected: {resumeFile.name}
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitStatus === "submitting"}
                className="w-full bg-white text-[#112732] px-6 py-3 rounded-lg font-light tracking-wide hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 group"
              >
                <span>
                  {submitStatus === "submitting"
                    ? "Submitting..."
                    : submitStatus === "success"
                      ? "Application Sent!"
                      : "Submit Application"}
                </span>
                {submitStatus !== "submitting" && (
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </div>

            {submitStatus === "success" && (
              <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-4">
                <p className="text-sm text-emerald-400 font-light">
                  Thank you for your application! We&apos;ll review it and get
                  back to you soon.
                </p>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-red-400 font-light">
                  {submitError ||
                    "There was an error submitting your application. Please try again."}
                </p>
              </div>
            )}
          </motion.form>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-20 text-center">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
              {ctaHeading}
            </h2>
            <p className="mt-3 text-stone-400 font-light max-w-md mx-auto">
              {ctaDescription}
            </p>
            <div className="mt-8">
              <MagneticButton href="/contact" variant="primary" size="lg">
                Get in Touch
              </MagneticButton>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Small reusable form bits                                            *
 * ------------------------------------------------------------------ */

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium tracking-[0.15em] uppercase text-pacific-mid mb-3">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 font-light text-white placeholder-pacific-mid/70 focus:outline-none focus:border-white/30 transition-colors"
      />
    </div>
  );
}

function DropdownField({
  label,
  value,
  onChange,
  placeholder,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium tracking-[0.15em] uppercase text-pacific-mid mb-3">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-4 py-3 pr-10 rounded-lg border border-white/15 bg-white/5 font-light text-white focus:outline-none focus:border-white/30 transition-colors"
        >
          <option value="" className="bg-[#112732]">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-[#112732]">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pacific-mid" />
      </div>
    </div>
  );
}
