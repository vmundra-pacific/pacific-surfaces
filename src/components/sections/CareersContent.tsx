"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Send } from "lucide-react";
import {
  CompanyNav,
  LABEL,
  LIGHT,
  ProClose,
  ProHero,
  ProSteps,
} from "@/components/sections/professionals/ProKit";

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
  requiresPortfolio?: boolean | null;
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
  requiresPortfolio?: boolean | null;
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

  // Hero media is fixed to careers-hero.mp4 (plant and people) since
  // 2026-10-08; the careersPage heroVideoUrl / heroImage fields are no
  // longer read.

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
      requiresPortfolio?: boolean | null;
    };
    const groups = new Map<string, Group>();
    for (const o of openings) {
      const existing = groups.get(o.title);
      if (existing) {
        if (!existing.locations.includes(o.location))
          existing.locations.push(o.location);
        // OR across cities for the same role — if any one location's
        // document has it turned on, treat the whole role as requiring
        // a portfolio rather than depending on which city doc happened
        // to be grouped first.
        if (o.requiresPortfolio) existing.requiresPortfolio = true;
      } else {
        groups.set(o.title, {
          _id: o._id,
          title: o.title,
          department: o.department,
          description: o.description,
          experience: o.experience,
          responsibilities: o.responsibilities,
          locations: [o.location],
          requiresPortfolio: o.requiresPortfolio,
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
      if (locationFilter && !g.locations.includes(locationFilter)) return false;
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
  // Whether the role the candidate clicked Apply on has
  // `requiresPortfolio: true` set in Sanity (e.g. Senior Graphic
  // Designer) — drives whether the Portfolio field below is enforced
  // as required before submit.
  const [appliedRoleRequiresPortfolio, setAppliedRoleRequiresPortfolio] =
    useState(false);

  function handleApply(job: RoleGroup) {
    setAppliedRole(job.title);
    setAppliedRoleRequiresPortfolio(!!job.requiresPortfolio);
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
    // Optional portfolio link — required (alongside/instead of the
    // file upload below) only when appliedRoleRequiresPortfolio is true.
    portfolioUrl: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  // Ref to the native file input so we can clear its value after a
  // successful submit — clearing the React state alone leaves the old
  // file name visible in the input and breaks a second application.
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const portfolioInputRef = useRef<HTMLInputElement | null>(null);
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

  // Mirror of the server-side caps in /api/careers/apply. Keeping
  // them in sync here lets us reject oversize files instantly instead
  // of waiting for an HTTP round-trip + generic 400.
  const MAX_RESUME_BYTES = 8 * 1024 * 1024;
  const MAX_PORTFOLIO_BYTES = 20 * 1024 * 1024;

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

  const handlePortfolioFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PORTFOLIO_BYTES) {
      setPortfolioFile(null);
      setSubmitError(
        `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. Portfolio must be under 20 MB.`
      );
      setSubmitStatus("error");
      e.target.value = "";
      return;
    }
    setSubmitError("");
    setSubmitStatus("idle");
    setPortfolioFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      setSubmitError("Please attach your resume.");
      setSubmitStatus("error");
      return;
    }
    if (
      appliedRoleRequiresPortfolio &&
      !formData.portfolioUrl.trim() &&
      !portfolioFile
    ) {
      setSubmitError(
        "This role requires a portfolio — add a link or upload a file below."
      );
      setSubmitStatus("error");
      return;
    }
    setSubmitStatus("submitting");
    setSubmitError("");

    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
    payload.append("resume", resumeFile);
    if (portfolioFile) payload.append("portfolio", portfolioFile);
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
        portfolioUrl: "",
      });
      setResumeFile(null);
      setPortfolioFile(null);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
      if (portfolioInputRef.current) portfolioInputRef.current.value = "";
      setAppliedRole("");
      setAppliedRoleRequiresPortfolio(false);
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

  // One role may be open in several cities; count roles, not documents.
  const roleCount = new Set(openings.map((o) => o.title)).size;

  return (
    <div data-light-page className="bg-white text-[#14140f]">
      {/* Rebuilt 2026-10-08 in the Professionals pages' language (owner:
          the Corporate section to get the same upgrade). The team film
          opens the page; roles are collapsed rows that open to the full
          description; the form sits on a light ground. The search, the
          filters, apply-to-role and submission are unchanged. */}
      <ProHero
        eyebrow="Company · Work with us"
        title="Careers at Pacific Surfaces"
        lead={hero.description}
        image="/videos/careers-hero-poster.jpg"
        video="/videos/careers-hero.mp4"
        alt="The Pacific Surfaces plant from the air"
        ctas={[
          { label: "See open roles", href: "#roles" },
          { label: "Send your CV", href: "#apply" },
        ]}
        facts={[
          {
            value: String(roleCount),
            label: roleCount === 1 ? "Open role" : "Open roles",
          },
          {
            value: String(locationOptions.length),
            label: locationOptions.length === 1 ? "City" : "Cities",
          },
          { value: "45+", label: "Countries supplied" },
          { value: "Since 2000", label: "Working in stone" },
        ]}
      />
      <CompanyNav current="careers" />

      <ProSteps
        eyebrow="Why Pacific Surfaces"
        title={hero.headline}
        steps={values.map((v) => ({ title: v.title, body: v.description }))}
        tone="white"
      />

      {/* Open roles: search, then one row per role. */}
      <section id="roles" className="scroll-mt-24 bg-[#EFEDE9]">
        <div
          ref={resultsRef}
          className="mx-auto w-full max-w-[1760px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
            <div>
              <p className={LABEL}>Open roles</p>
              <h2
                style={LIGHT}
                className="mt-4 text-[30px] uppercase leading-[1.05] tracking-[-0.02em] sm:text-4xl lg:text-[48px]"
              >
                {openPositionsHeading}
              </h2>
            </div>
            <p className="max-w-xl text-[17px] font-light leading-relaxed">
              {openPositionsDescription}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 items-end gap-4 border border-[#14140f]/15 bg-white p-5 sm:p-6 md:grid-cols-12">
            <div className="md:col-span-6">
              <label htmlFor="role-search" className={FIELD_LABEL}>
                Search roles
              </label>
              <input
                id="role-search"
                type="search"
                value={titleQuery}
                onChange={(e) => setTitleQuery(e.target.value)}
                placeholder="e.g. Sales, HR, Marketing"
                className={FIELD}
              />
            </div>
            <DropdownField
              label="Location"
              value={locationFilter}
              onChange={setLocationFilter}
              placeholder="All locations"
              options={locationOptions}
              className="md:col-span-4"
            />
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleGo}
                data-over-media
                className="inline-flex h-[50px] w-full items-center justify-center bg-[#1D1D1C] px-6 text-[13px] uppercase tracking-[0.12em] text-white hover:opacity-85"
              >
                <span>Search</span>
              </button>
            </div>
          </div>

          <p className="mt-8 text-[15px] font-light">
            <span className="tabular-nums">{filteredOpenings.length}</span>{" "}
            {filteredOpenings.length === 1 ? "role" : "roles"}
            {(titleQuery || locationFilter) && (
              <>
                {" "}
                match your search
                <button
                  type="button"
                  onClick={() => {
                    setTitleQuery("");
                    setLocationFilter("");
                  }}
                  className="ml-3 underline underline-offset-4"
                >
                  Clear filters
                </button>
              </>
            )}
          </p>

          {filteredOpenings.length === 0 ? (
            <p className="mt-6 max-w-2xl border border-[#14140f]/15 bg-white p-8 text-[16px] font-light leading-relaxed">
              No roles match these filters right now. Try a wider search, or
              send your CV with the form below and we will keep it for future
              openings.
            </p>
          ) : (
            <ul className="mt-6 border-t border-[#14140f]">
              {filteredOpenings.map((job) => (
                <li key={job._id} className="border-b border-[#14140f]/20">
                  <details className="group">
                    <summary className="grid cursor-pointer list-none gap-2 py-6 md:grid-cols-[minmax(0,5fr)_minmax(0,3fr)_minmax(0,3fr)_auto] md:items-center md:gap-6 [&::-webkit-details-marker]:hidden">
                      <span className="text-[19px] leading-snug">
                        {job.title}
                      </span>
                      <span className="text-[14px] font-light opacity-80">
                        {job.locations.join(" · ")}
                      </span>
                      <span className="text-[14px] font-light opacity-80">
                        {[job.department, job.experience]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                      <span
                        aria-hidden="true"
                        className="hidden text-2xl leading-none transition-transform group-open:rotate-45 md:block"
                      >
                        +
                      </span>
                    </summary>
                    <div className="grid gap-8 pb-10 md:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
                      <div>
                        <p className="max-w-3xl text-[16px] font-light leading-relaxed">
                          {job.description}
                        </p>
                        {job.responsibilities &&
                          job.responsibilities.length > 0 && (
                            <>
                              <p className={`mt-7 ${LABEL}`}>
                                Key responsibilities
                              </p>
                              <ul className="mt-3 max-w-3xl border-t border-[#14140f]/15">
                                {job.responsibilities.map((r, i) => (
                                  <li
                                    key={i}
                                    className="flex gap-4 border-b border-[#14140f]/15 py-3 text-[15px] font-light leading-relaxed"
                                  >
                                    <span
                                      aria-hidden="true"
                                      className="mt-[11px] h-px w-4 shrink-0 bg-[#14140f]"
                                    />
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleApply(job)}
                          data-over-media
                          className="inline-flex h-12 items-center gap-2 bg-[#1D1D1C] px-7 text-[13px] uppercase tracking-[0.12em] text-white hover:opacity-85"
                        >
                          <span>Apply for this role</span>
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="scroll-mt-24 bg-white">
        <div
          ref={formRef}
          className="mx-auto grid w-full max-w-[1760px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 lg:px-12 lg:py-24"
        >
          <div>
            <p className={LABEL}>Apply</p>
            <h2
              style={LIGHT}
              className="mt-4 text-[30px] uppercase leading-[1.05] tracking-[-0.02em] sm:text-4xl lg:text-[48px]"
            >
              {applyHeading}
            </h2>
            <p className="mt-6 max-w-md text-[17px] font-light leading-relaxed">
              {applyDescription}
            </p>
            {appliedRole && (
              <p className="mt-6 text-[15px] font-light">
                Applying for:{" "}
                <strong className="font-normal">{appliedRole}</strong>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedRole("");
                    setAppliedRoleRequiresPortfolio(false);
                  }}
                  className="ml-2 text-[13px] underline underline-offset-4"
                >
                  clear
                </button>
              </p>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 border border-[#14140f]/15 bg-white p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormInput
                label="First name"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              <FormInput
                label="Last name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormInput
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <FormInput
                label="Phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <FormInput
              label="Address"
              name="address"
              autoComplete="street-address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormInput
                label="Current location"
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
                required
              />
            </div>
            <FormInput
              label="Total experience"
              name="totalExperience"
              value={formData.totalExperience}
              onChange={handleInputChange}
              placeholder='e.g. "5 years", "Fresher"'
              required
            />

            <div>
              <label htmlFor="department" className={FIELD_LABEL}>
                Department
              </label>
              <div className="relative">
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className={`${FIELD} appearance-none pr-10`}
                >
                  <option value="">Select a department...</option>
                  <option value="sales">Sales & Business Development</option>
                  <option value="marketing">Marketing & Communications</option>
                  <option value="operations">Operations & Supply Chain</option>
                  <option value="finance">Finance & Accounting</option>
                  <option value="design">Design & Architecture</option>
                  <option value="hr">Human Resources</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div>
              <label htmlFor="resume" className={FIELD_LABEL}>
                CV
              </label>
              <input
                id="resume"
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
                className={`${FIELD} file:mr-4 file:border-0 file:bg-[#EFEDE9] file:px-4 file:py-2 file:font-light`}
              />
              {/* The 8 MB cap is enforced in /api/careers/apply. */}
              <p className="mt-2 text-[13px] font-light opacity-70">
                PDF, DOC or DOCX, up to 8 MB.
              </p>
              {resumeFile && (
                <p className="mt-1 text-[13px] font-light">
                  Selected: {resumeFile.name}
                </p>
              )}
            </div>

            {/* Only for roles with requiresPortfolio set in Sanity; a link
                or a file satisfies it. */}
            {appliedRoleRequiresPortfolio && (
              <div>
                <label htmlFor="portfolioUrl" className={FIELD_LABEL}>
                  Portfolio link, required for this role
                </label>
                <input
                  id="portfolioUrl"
                  type="url"
                  name="portfolioUrl"
                  autoComplete="url"
                  value={formData.portfolioUrl}
                  onChange={handleInputChange}
                  placeholder="https://behance.net/yourname or a Drive or Dropbox link"
                  className={FIELD}
                />
                <p className="mt-2 text-[13px] font-light opacity-70">
                  Or upload a file instead: PDF, PPT/PPTX, JPG or PNG, up to 20
                  MB.
                </p>
                <input
                  id="portfolio"
                  ref={portfolioInputRef}
                  type="file"
                  accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png"
                  onChange={handlePortfolioFileChange}
                  className={`mt-2 ${FIELD} file:mr-4 file:border-0 file:bg-[#EFEDE9] file:px-4 file:py-2 file:font-light`}
                />
                {portfolioFile && (
                  <p className="mt-1 text-[13px] font-light">
                    Selected: {portfolioFile.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="comments" className={FIELD_LABEL}>
                Comments
              </label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                rows={4}
                placeholder="Notice period, preferred locations, links to your work"
                className={`${FIELD} resize-y`}
              />
            </div>

            <button
              type="submit"
              disabled={submitStatus === "submitting"}
              data-over-media
              className="group inline-flex h-[52px] w-full items-center justify-center gap-2 bg-[#1D1D1C] px-6 text-[13px] uppercase tracking-[0.14em] text-white hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>
                {submitStatus === "submitting"
                  ? "Submitting..."
                  : submitStatus === "success"
                    ? "Application sent"
                    : "Submit application"}
              </span>
              {submitStatus !== "submitting" && (
                <Send
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              )}
            </button>

            {submitStatus === "success" && (
              <p className="border border-[#14140f]/20 bg-[#EFEDE9] p-4 text-[15px] font-light">
                Thank you for your application. We will review it and get back
                to you.
              </p>
            )}
            {submitStatus === "error" && (
              <p className="border border-[#14140f]/40 p-4 text-[15px] font-light">
                {submitError ||
                  "There was an error submitting your application. Please try again."}
              </p>
            )}
          </form>
        </div>
      </section>

      <ProClose
        title={ctaHeading}
        body={ctaDescription}
        ctas={[
          { label: "Get in touch", href: "/contact#enquiry" },
          { label: "Our story", href: "/about" },
        ]}
        image="/videos/origin-poster.jpg"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Small reusable form bits                                            *
 * ------------------------------------------------------------------ */

const FIELD_LABEL =
  "mb-2 block text-[11px] uppercase tracking-[0.14em] opacity-70";
const FIELD =
  "w-full border border-[#14140f]/25 bg-white px-4 py-3 text-[15px] font-light text-[#14140f] placeholder:text-[#14140f]/40 focus:border-[#14140f] focus:outline-none";

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  /** WCAG 1.3.5: an HTML autofill token where the field has one. */
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={FIELD_LABEL}>
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={FIELD}
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
      <label htmlFor={`dropdown-${label}`} className={FIELD_LABEL}>
        {label}
      </label>
      <div className="relative">
        <select
          id={`dropdown-${label}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${FIELD} appearance-none pr-10`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
