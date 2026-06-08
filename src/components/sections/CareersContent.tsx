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
  experience?: string | null;
  responsibilities?: string[] | null;
}

/**
 * RoleGroup is the unit rendered as one result card on /careers.
 * Many roles live as multiple Sanity documents — one per city they're
 * open in — so we collapse same-title documents into a single group
 * and surface every city it's available in as a location tag.
 */
interface RoleGroup {
  _id: string;
  title: string;
  department?: string | null;
  description: string;
  experience?: string | null;
  responsibilities?: string[] | null;
  locations: string[];
}

/**
 * Map a Sanity jobOpening.department value (free-form list from the
 * Sanity schema) to the value of the corresponding <option> in the
 * apply-form's Department <select>. Used by handleApply() so that
 * clicking "Apply" on a role card pre-selects the right department.
 */
const SANITY_DEPT_TO_FORM_DEPT: Record<string, string> = {
  Sales: "sales",
  Marketing: "marketing",
  "Digital Marketing": "marketing",
  "Events/Marketing": "marketing",
  Finance: "finance",
  Operations: "operations",
  Procurement: "operations",
  "Architecture & Design": "design",
  "Design/Creative": "design",
  "Business Development": "sales",
  "Human Resources": "hr",
  Other: "other",
};

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

  // Location dropdown options derived from the published openings —
  // adding a new opening in Studio automatically extends the
  // dropdown. Sorted, deduped. (The Job Title dropdown has been
  // replaced with a free-text search field — the openings array
  // itself is the search index now, no precomputed option list
  // needed.)
  const locationOptions = useMemo(
    () => Array.from(new Set(openings.map((o) => o.location))).sort(),
    [openings]
  );

  // `titleQuery` is now a free-text search instead of an exact-
  // match dropdown — candidates type any keyword (role, department,
  // experience, words from the description) and we surface the
  // best-matching open positions.
  const [titleQuery, setTitleQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  // The results list is ALWAYS rendered now — when no filters are
  // applied the candidate sees every open position by default, and
  // typing in the search box or picking a location narrows it
  // live. Previously the list was gated behind a "GO!" click; that
  // hid the available roles on first paint and a framer-motion
  // whileInView animation was leaving cards stuck at opacity:0 for
  // anyone who didn't scroll to the results before the viewport
  // observer ran.

  // Group openings by role title — many roles (City Sales Manager,
  // Management Trainee – Business Development, the four Regional
  // Sales Director variants) live as one Sanity document per city.
  // Without grouping, City Sales Manager would render as 7 separate
  // cards, which reads as "the same role duplicated everywhere"
  // instead of "one role with multiple openings". The card UI shows
  // every city in the group as its own location tag so the
  // candidate can still see exactly where the role is open.
  const filteredOpenings = useMemo(() => {
    const q = titleQuery.trim().toLowerCase();

    // 1. Build groups keyed by title from the full openings list.
    type Group = {
      _id: string;
      title: string;
      department?: string | null;
      description: string;
      experience?: string | null;
      responsibilities?: string[] | null;
      locations: string[];
    };
    const groups = new Map<string, Group>();
    for (const o of openings) {
      const existing = groups.get(o.title);
      if (existing) {
        if (!existing.locations.includes(o.location))
          existing.locations.push(o.location);
      } else {
        groups.set(o.title, {
          _id: o._id,
          title: o.title,
          department: o.department,
          description: o.description,
          experience: o.experience,
          responsibilities: o.responsibilities,
          locations: [o.location],
        });
      }
    }
    for (const g of groups.values()) g.locations.sort();

    // 2. Apply the search + location filters at the GROUP level.
    //    Search index is intentionally narrow — title + department
    //    only, with department-acronym aliases. Including
    //    description / responsibilities text caused over-matching
    //    (e.g. "hr" matched the substring inside "through" and
    //    dragged in unrelated roles like Management Trainee – BD).
    return Array.from(groups.values()).filter((g) => {
      if (q) {
        const titleL = g.title.toLowerCase();
        const dept = (g.department ?? "").toLowerCase();
        const aliases: string[] = [];
        if (dept === "human resources") aliases.push("hr");
        if (dept === "business development") aliases.push("bd");
        if (dept === "digital marketing") aliases.push("marketing");
        const hay = [titleL, dept, ...aliases].join(" | ");
        if (!hay.includes(q)) return false;
      }
      // Location filter passes if ANY of the role's open cities
      // matches the selection — multi-city roles surface for every
      // city they're open in.
      if (locationFilter && !g.locations.includes(locationFilter))
        return false;
      return true;
    });
  }, [openings, titleQuery, locationFilter]);

  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function handleGo() {
    // GO! now just smooth-scrolls to the results — the list itself
    // is always live, so clicking GO is purely a "take me there"
    // gesture rather than a "run the search" trigger.
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

  function handleApply(job: RoleGroup) {
    setAppliedRole(job.title);
    // Pre-fill the form's Department select from the job's department
    // so the candidate doesn't have to pick it again. Falls back to
    // empty (showing the placeholder) if the job has no department
    // or the department doesn't map to a known form value.
    const mappedDept =
      (job.department && SANITY_DEPT_TO_FORM_DEPT[job.department]) || "";
    setFormData((prev) => ({ ...prev, department: mappedDept }));
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
    // Newly captured per the careers brief:
    currentLocation: "",
    age: "",
    totalExperience: "",
    comments: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Mirror of the server-side cap in /api/careers/apply (8 MB).
  // Keeping it in sync here lets us reject oversize files instantly
  // instead of waiting for an HTTP round-trip + generic 400.
  const MAX_RESUME_BYTES = 8 * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_RESUME_BYTES) {
      setResumeFile(null);
      setSubmitError(
        `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. Resume must be under 8 MB — try compressing the PDF or saving it without embedded images.`
      );
      setSubmitStatus("error");
      // Clear the native input so the same oversized file can't sit
      // there masquerading as a valid selection.
      e.target.value = "";
      return;
    }
    setSubmitError("");
    setSubmitStatus("idle");
    setResumeFile(file);
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
        currentLocation: "",
        age: "",
        totalExperience: "",
        comments: "",
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
              poster={
                heroVideoUrl.startsWith("/videos/")
                  ? heroVideoUrl.replace(/\.mp4$/, "-poster.jpg")
                  : undefined
              }
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
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
            {/* Job-title search is now a free-text input instead of
                a Job-Title dropdown — candidates can type any
                keyword (role, department, words from the
                description, experience phrase) and we'll surface
                the best matches. */}
            <div className="md:col-span-5">
              <label className="block text-xs font-medium tracking-[0.15em] uppercase text-pacific-mid mb-3">
                Search Role
              </label>
              <input
                type="search"
                value={titleQuery}
                onChange={(e) => setTitleQuery(e.target.value)}
                placeholder="e.g. Sales, HR Manager, Marketing"
                className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 font-light text-white placeholder:text-pacific-mid/60 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
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

          {/* Results — always rendered. With no filters the
              candidate sees every open position by default; typing
              in the search box or picking a location narrows the
              list live without needing to click GO!. */}
          <>
            <div className="mb-6 text-sm text-pacific-mid font-light tracking-wide">
              <span className="text-white font-medium">
                {filteredOpenings.length}
              </span>{" "}
              {filteredOpenings.length === 1
                ? "position"
                : "positions"}
              {(titleQuery || locationFilter) && (
                <>
                  {" "}
                  matching your search
                  <button
                    type="button"
                    onClick={() => {
                      setTitleQuery("");
                      setLocationFilter("");
                    }}
                    className="ml-3 underline underline-offset-4 hover:text-white"
                  >
                    Clear filters
                  </button>
                </>
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
              // Plain grid + per-card motion.div. The shared
              // StaggerContainer/StaggerItem wrappers use whileInView
              // with viewport.once=true, which leaves newly-mounted
              // children stuck on the "hidden" variant after a
              // search → clear cycle. Each card now drives its own
              // fade-in on mount instead.
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {filteredOpenings.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors duration-300 flex flex-col h-full"
                  >
                        <div className="flex-1">
                          <h3 className="text-lg font-light tracking-tight text-white">
                            {job.title}
                          </h3>
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {job.locations.map((loc) => (
                              <span
                                key={loc}
                                className="px-3 py-1 rounded-full bg-white/5 text-xs font-medium tracking-wide text-pacific-mid"
                              >
                                {loc}
                              </span>
                            ))}
                            {job.department && (
                              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium tracking-wide text-pacific-light">
                                {job.department}
                              </span>
                            )}
                            {job.experience && (
                              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium tracking-wide text-white/90 border border-white/20">
                                {job.experience}
                              </span>
                            )}
                          </div>
                          <p className="mt-4 text-sm text-pacific-mid font-light leading-relaxed">
                            {job.description}
                          </p>
                          {job.responsibilities &&
                            job.responsibilities.length > 0 && (
                              <div className="mt-4">
                                <p className="text-xs font-medium tracking-[0.15em] uppercase text-pacific-light mb-2">
                                  Key Responsibilities
                                </p>
                                <ul className="space-y-1.5">
                                  {job.responsibilities.map((r, i) => (
                                    <li
                                      key={i}
                                      className="text-sm text-pacific-mid font-light leading-relaxed flex gap-2"
                                    >
                                      <span
                                        aria-hidden="true"
                                        className="text-white/40 flex-shrink-0 mt-0.5"
                                      >
                                        •
                                      </span>
                                      <span>{r}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApply(job)}
                          className="mt-6 self-start text-sm font-medium tracking-wide text-white border-b border-white/40 pb-1 hover:border-white transition-colors"
                        >
                          Apply for this role →
                        </button>
                  </div>
                ))}
              </div>
            )}
          </>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormInput
                label="Current Location"
                name="currentLocation"
                value={formData.currentLocation}
                onChange={handleInputChange}
                placeholder="e.g. Bangalore, Karnataka"
                required
              />
              <FormInput
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="e.g. 28"
                required
              />
            </div>

            <FormInput
              label="Total Experience"
              name="totalExperience"
              value={formData.totalExperience}
              onChange={handleInputChange}
              placeholder='e.g. "5 years", "Fresher", "8+ years in sales"'
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
              {/* Explicit hint about accepted file formats + the 8 MB
                  cap enforced server-side in /api/careers/apply.
                  Surfaces the constraint to the candidate BEFORE
                  they hit Submit so an oversize PDF doesn't fail
                  silently with a generic error. */}
              <p className="mt-2 text-xs text-pacific-mid">
                PDF, DOC, or DOCX — up to 8 MB.
              </p>
              {resumeFile && (
                <p className="mt-1 text-xs text-pacific-mid">
                  Selected: {resumeFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium tracking-[0.15em] uppercase text-pacific-mid mb-3">
                Comments / Remarks
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                rows={4}
                placeholder="Anything else you'd like us to know — notice period, preferred locations, links to portfolio, etc."
                className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 font-light text-white placeholder-pacific-mid/70 focus:outline-none focus:border-white/30 transition-colors resize-y"
              />
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
