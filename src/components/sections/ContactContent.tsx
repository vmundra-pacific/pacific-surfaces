"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowUpRight,
  CheckCircle,
  Clock,
  ExternalLink,
  Search,
} from "lucide-react";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";

/**
 * Dealer record shape, matching `allDealersQuery` in
 * src/sanity/lib/queries.ts. Every field except `_id` and `name`
 * is optional because the Sanity dealer schema only requires
 * `name`, `type`, and `city`.
 */
export interface Dealer {
  _id: string;
  name: string;
  type?: string;
  address?: string;
  city?: string;
  pincode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
}

const departmentContacts: {
  name: string;
  contacts: { name?: string; phone?: string; email: string }[];
}[] = [
  {
    name: "International Sales",
    contacts: [
      {
        name: "Thejal Shetty",
        phone: "+91 96773 68666",
        email: "thejal.shetty@thepacific.group",
      },
      {
        name: "Manish",
        phone: "+91 93242 81801",
        email: "manish@thepacific.group",
      },
    ],
  },
  {
    name: "Inquiries for Poland",
    contacts: [
      {
        name: "Paulina",
        phone: "+48 517 540 297",
        email: "paulina@thepacific.group",
      },
      {
        name: "Marcin",
        phone: "+48 537 819 991",
        email: "marcin@pacificsurfaces.pl",
      },
    ],
  },
  {
    name: "Exports & Logistics",
    contacts: [
      { phone: "+91 88705 81104", email: "customs@pacific-surfaces.com" },
    ],
  },
  {
    name: "Finance",
    contacts: [
      { phone: "+91 89259 19991", email: "finance@pacific-surfaces.com" },
    ],
  },
  {
    name: "Inquiries for India",
    contacts: [{ phone: "+91 9894033566", email: "info@thepacific.group" }],
  },
  {
    name: "Inquiries for Middle East",
    contacts: [
      {
        name: "Saral",
        phone: "+91 73977 46963",
        email: "saral@thepacific.group",
      },
    ],
  },
  {
    name: "Inquiries for Croatia",
    contacts: [
      {
        name: "Marko",
        phone: "+385 91 250 4582",
        email: "marko@thepacific.group",
      },
    ],
  },
  {
    name: "Marketing",
    contacts: [{ email: "marketing@thepacific.group" }],
  },
  {
    name: "Human Resources",
    contacts: [{ phone: "+91 89259 01419", email: "hr@pacific-surfaces.com" }],
  },
  {
    name: "Procurement",
    contacts: [
      { phone: "+91 89259 13267", email: "procurement@pacific-surfaces.com" },
    ],
  },
];

const officeLocations = [
  {
    name: "Navi Mumbai Office",
    address:
      "JB Homes, Plot no. 35 & 36, Marble Market, Sector 23, Turbhe, Navi Mumbai, Maharashtra 400703",
  },
  {
    name: "Bengaluru Office",
    address:
      "Marble City, Bannerghatta Rd, Koppa Gate, Bengaluru, Karnataka 560105",
  },
];

const dealerLocations = [
  {
    name: "Shree Shantinath Granite World",
    city: "Hyderabad",
    address:
      "Plot No 8, Inner Ring Rd, beside Indian Oil Petrol Pump, Samathapuri, Nagole, Hyderabad, Telangana",
  },
  {
    name: "Swastik Marbles",
    city: "Bengaluru",
    address:
      "17/4, Bannerghatta Rd, Lakkasandra, Lakkasandra Extension, Adugodi, Bengaluru, Karnataka 560030",
  },
  {
    name: "Shree Shantinath Granite World",
    city: "Gurugram",
    address:
      "SY NO 52, Plot no 250 & 253, opposite Police Commissioner Office, Janardhan Hills, Lumbini Avenue, Gurugram",
  },
  {
    name: "La Casa Decor",
    city: "Panchkula",
    address: "Plot No. 271, Industrial Area Phase 2, Panchkula, Haryana 134113",
  },
];

// Map ?type=<x> URL params to the contact form's "I am" select values.
// PartnerWithUs section on the homepage links into this page with
// these short slugs; the select values are slightly different
// strings, so this map keeps the wiring explicit.
const TYPE_PARAM_TO_ROLE: Record<string, string> = {
  distributor: "distributor",
  architect: "architect",
  "interior-designer": "interior-designer",
  fabricator: "fabricator",
  homeowner: "homeowner",
  builder: "builder",
};

export function ContactContent({ dealers = [] }: { dealers?: Dealer[] }) {
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState<"idle" | "sending" | "sent">(
    "idle"
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    role: "",
    application: "",
    message: "",
  });

  // Find-A-Dealer postal-code lookup. On submit we filter the
  // dealer list (loaded server-side from Sanity via
  // allDealersQuery) for dealers whose `pincode` field matches the
  // entered value, normalised for whitespace + casing so a UK
  // visitor typing "sw1a1aa" still finds a dealer stored as
  // "SW1A 1AA". `dealerResults === null` means "no search has run
  // yet"; an empty array means "search ran, nothing matched"; an
  // array with `isApproximate: true` means "no exact match — these
  // are nearest dealers by prefix". The UI distinguishes all three
  // so we don't flash a "no dealers found" empty state on first
  // page load.
  const normalisePostal = (s: string) =>
    s.replace(/[\s-]/g, "").toLowerCase();
  const [dealerPincode, setDealerPincode] = useState("");
  const [dealerResults, setDealerResults] = useState<Dealer[] | null>(null);
  const [dealerResultsApproximate, setDealerResultsApproximate] =
    useState(false);
  const handleDealerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const needle = normalisePostal(dealerPincode);
    if (needle.length < 3) return;

    // 1) Exact match first.
    const exact = dealers.filter(
      (d) => d.pincode && normalisePostal(d.pincode) === needle
    );
    if (exact.length > 0) {
      setDealerResults(exact);
      setDealerResultsApproximate(false);
      return;
    }

    // 2) No exact match — fall back to "nearest" by progressively
    // shorter prefix. For Indian PIN codes the first 3 digits
    // identify a circle / region (e.g. 560xxx = Bengaluru area);
    // the first 2 narrow to a state; the first 1 to a postal
    // circle. We mirror the same idea generically for any postal
    // code by walking the prefix down from length-1 to length-1
    // until something matches. This works equally well for
    // alphanumeric codes (UK / Canada): "SW1A1AA" prefix-matches
    // "SW1A1AB", "SW1A1A...", etc.
    let approxMatches: Dealer[] = [];
    for (let prefixLen = needle.length; prefixLen >= 1; prefixLen--) {
      const prefix = needle.slice(0, prefixLen);
      approxMatches = dealers.filter(
        (d) => d.pincode && normalisePostal(d.pincode).startsWith(prefix)
      );
      if (approxMatches.length > 0) break;
    }
    setDealerResults(approxMatches);
    setDealerResultsApproximate(approxMatches.length > 0);
  };
  // WhatsApp escape hatch we offer when no dealer matches — the
  // sales team can recommend the nearest fit manually.
  const dealerWhatsAppFallback = `https://api.whatsapp.com/send/?phone=919894033566&text=${encodeURIComponent(
    `Hi, I'm looking for a Pacific Surfaces dealer near postal code ${dealerPincode}. Please share details.`
  )}&type=phone_number&app_absent=0`;

  // Pre-fill the "I am" select from ?type=<x> if PartnerWithUs (or any
  // other inbound link) passed one. Runs once when the URL param
  // changes — subsequent user edits aren't clobbered because this only
  // fires when the param itself updates.
  useEffect(() => {
    const type = searchParams.get("type");
    if (!type) return;
    const mappedRole = TYPE_PARAM_TO_ROLE[type];
    if (mappedRole) {
      setFormData((prev) => ({ ...prev, role: mappedRole }));
    }
  }, [searchParams]);

  // Success-panel auto-reset timer. Kept in a ref so the "Send another
  // message" button can cancel it (otherwise it races the button and
  // wipes input the user has started typing), and cleared on unmount.
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");
    try {
      const res = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // Carry the ?type= URL param through to Sanity as a
          // provenance hint — useful for triage (e.g. distinguishing
          // a Distributor card click from an organic contact form fill).
          source: searchParams.get("type") || undefined,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setFormState("sent");
      resetTimerRef.current = setTimeout(() => {
        setFormState("idle");
        setFormData({
          name: "",
          email: "",
          address: "",
          phone: "",
          role: "",
          application: "",
          message: "",
        });
      }, 3000);
    } catch (err) {
      console.error("[contact form] submit failed:", err);
      setFormState("idle");
      alert(
        "Sorry, we couldn't send your message. Please try again or email us directly."
      );
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative bg-stone-950 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pt-32 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left — existing copy */}
            <div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-block text-xs font-medium tracking-[0.25em] uppercase text-pacific-mid/70 mb-4"
              >
                Get in Touch
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
                className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white max-w-2xl"
              >
                Let&apos;s Create Something Extraordinary
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="mt-4 text-lg text-pacific-mid/70 max-w-xl font-light"
              >
                Whether you need a quote, samples, or expert advice on surface
                selection — we&apos;re here to help.
              </motion.p>
            </div>

            {/* Right — looping map animation. Same compression treatment
                as every other site video (H.264 crf 28, faststart, no
                audio); poster paints first while the file streams. */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-stone-900"
            >
              <video
                src="/videos/contact-map.mp4"
                poster="/videos/contact-map-poster.jpg"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none rounded-2xl" />
            </motion.div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </section>

      {/* Contact Content */}
      <section className="bg-[#112732]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
            {/* Form */}
            <AnimatedSection className="lg:col-span-3" animation="slideInLeft">
              {formState === "sent" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 rounded-2xl p-12 text-center border border-white/10"
                >
                  <div className="p-4 bg-emerald-900/30 rounded-full w-fit mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white">
                    Message Sent
                  </h3>
                  <p className="mt-3 text-pacific-mid font-light max-w-sm mx-auto">
                    Thank you for reaching out. Our team will get back to you
                    within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      // Cancel the pending auto-reset so it can't fire
                      // later and wipe input the user has started typing.
                      if (resetTimerRef.current) {
                        clearTimeout(resetTimerRef.current);
                        resetTimerRef.current = null;
                      }
                      setFormState("idle");
                      setFormData({
                        name: "",
                        email: "",
                        address: "",
                        phone: "",
                        role: "",
                        application: "",
                        message: "",
                      });
                    }}
                    className="mt-6 text-sm text-pacific-mid underline hover:text-white transition-colors"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-medium tracking-wider uppercase text-pacific-mid/70 mb-2"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium tracking-wider uppercase text-pacific-mid/70 mb-2"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                        placeholder="you@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-xs font-medium tracking-wider uppercase text-pacific-mid/70 mb-2"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                      placeholder="Your address"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-xs font-medium tracking-wider uppercase text-pacific-mid/70 mb-2"
                      >
                        Phone <span aria-hidden="true">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        aria-required="true"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                        placeholder="+91 98940 33566"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="role"
                        className="block text-xs font-medium tracking-wider uppercase text-pacific-mid/70 mb-2"
                      >
                        I am
                      </label>
                      <select
                        id="role"
                        required
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                      >
                        <option value="" className="bg-[#112732]">
                          Select your role
                        </option>
                        <option value="architect" className="bg-[#112732]">
                          Architect
                        </option>
                        <option
                          value="interior-designer"
                          className="bg-[#112732]"
                        >
                          Interior Designer
                        </option>
                        <option value="homeowner" className="bg-[#112732]">
                          Homeowner
                        </option>
                        <option value="builder" className="bg-[#112732]">
                          Builder
                        </option>
                        <option value="fabricator" className="bg-[#112732]">
                          Fabricator
                        </option>
                        <option value="distributor" className="bg-[#112732]">
                          Distributor
                        </option>
                        <option value="other" className="bg-[#112732]">
                          Other
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="application"
                      className="block text-xs font-medium tracking-wider uppercase text-pacific-mid/70 mb-2"
                    >
                      Application
                    </label>
                    <select
                      id="application"
                      required
                      value={formData.application}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          application: e.target.value,
                        })
                      }
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                    >
                      <option value="" className="bg-[#112732]">
                        Select application
                      </option>
                      <option
                        value="kitchen-countertops"
                        className="bg-[#112732]"
                      >
                        Kitchen Countertops
                      </option>
                      <option value="flooring" className="bg-[#112732]">
                        Flooring
                      </option>
                      <option value="staircases" className="bg-[#112732]">
                        Staircases
                      </option>
                      <option
                        value="exterior-cladding"
                        className="bg-[#112732]"
                      >
                        Exterior Cladding
                      </option>
                      <option value="commercial" className="bg-[#112732]">
                        Commercial
                      </option>
                      <option value="other" className="bg-[#112732]">
                        Other
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-medium tracking-wider uppercase text-pacific-mid/70 mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-sm focus:outline-none focus:border-white/30 transition-colors resize-none placeholder:text-white/20"
                      placeholder="Tell us about your project..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={formState === "sending"}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-3 bg-white text-[#112732] px-8 py-4 rounded-full text-sm font-medium tracking-wider uppercase hover:bg-white/90 transition-colors disabled:opacity-60"
                  >
                    {formState === "sending" ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#112732]/30 border-t-[#112732] rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </AnimatedSection>

            {/* Contact Info */}
            <AnimatedSection
              className="lg:col-span-2"
              animation="slideInRight"
              delay={0.2}
            >
              <div className="space-y-10">
                <div>
                  <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-pacific-mid/70 mb-6">
                    Quick Contact
                  </h3>
                  <div className="space-y-6">
                    <a
                      href="mailto:info@thepacific.group"
                      className="flex items-start gap-4 group"
                    >
                      <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                        <Mail className="w-5 h-5 text-pacific-mid" />
                      </div>
                      <div>
                        <p className="text-xs text-pacific-mid/70 tracking-wide">
                          Email
                        </p>
                        <p className="mt-1 text-sm text-white font-medium group-hover:text-pacific-mid transition-colors break-all">
                          info@thepacific.group
                        </p>
                      </div>
                    </a>

                    <a
                      href="tel:+919894033566"
                      className="flex items-start gap-4 group"
                    >
                      <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                        <Phone className="w-5 h-5 text-pacific-mid" />
                      </div>
                      <div>
                        <p className="text-xs text-pacific-mid/70 tracking-wide">
                          Phone
                        </p>
                        <p className="mt-1 text-sm text-white font-medium group-hover:text-pacific-mid transition-colors">
                          +91 98940 33566
                        </p>
                      </div>
                    </a>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white/5 rounded-xl">
                        <Clock className="w-5 h-5 text-pacific-mid" />
                      </div>
                      <div>
                        <p className="text-xs text-pacific-mid/70 tracking-wide">
                          Hours
                        </p>
                        <p className="mt-1 text-sm text-white font-medium">
                          Mon - Sat: 9:00 AM - 7:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social */}
                <div>
                  <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-pacific-mid/70 mb-6">
                    Follow Us
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        name: "Instagram",
                        href: "https://www.instagram.com/pacific_surfaces/",
                      },
                      {
                        name: "Facebook",
                        href: "https://www.facebook.com/pacificsurfaces",
                      },
                      {
                        name: "LinkedIn",
                        href: "https://www.linkedin.com/company/pacific-surfaces",
                      },
                      {
                        name: "YouTube",
                        href: "https://www.youtube.com/@pacificsurfaces",
                      },
                    ].map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between py-3 border-b border-white/10 group hover:border-white/15 transition-colors"
                      >
                        <span className="text-sm text-pacific-mid group-hover:text-white transition-colors">
                          {social.name}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-white/15 group-hover:text-pacific-mid transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Find A Dealer Section — pincode-based lookup wired to
          Sanity's `dealer` documents. Sits immediately above
          Department Contacts so visitors with a city/region in mind
          see this surface before scanning the department list. */}
      <section className="bg-[#0e2030]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24 border-t border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start"
          >
            <div>
              <span className="text-xs font-medium tracking-[0.25em] uppercase text-pacific-mid mb-4 block">
                Find A Dealer
              </span>
              <h2 className="text-3xl lg:text-4xl font-light tracking-tight text-white mb-4">
                Find a Pacific dealer near you
              </h2>
              <p className="text-pacific-mid font-light max-w-md leading-relaxed">
                Enter your postal code (PIN, ZIP, postcode — any format) and
                we&apos;ll connect you with the nearest Pacific Surfaces dealer
                in your area.
              </p>
            </div>
            <form
              onSubmit={handleDealerSearch}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                maxLength={12}
                placeholder="Postal code / pincode / ZIP"
                value={dealerPincode}
                onChange={(e) => {
                  setDealerPincode(e.target.value.slice(0, 12));
                  // Reset stale result list whenever the input
                  // changes so the user doesn't see results that
                  // no longer match what's typed.
                  if (dealerResults !== null) setDealerResults(null);
                }}
                aria-label="Postal code"
                required
                className="flex-1 bg-[#112732] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-pacific-mid/60 font-light tracking-wide focus:border-white/30 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={normalisePostal(dealerPincode).length < 3}
                className="px-7 py-4 rounded-2xl bg-white text-[#0a1620] font-medium text-sm tracking-[0.05em] uppercase hover:bg-pacific-light disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors whitespace-nowrap inline-flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Find Dealers
              </button>
            </form>
          </motion.div>

          {/* Search results — only renders after the user submits
              once. Shows match cards or, on empty match, a polite
              empty state with a WhatsApp escape hatch. */}
          {dealerResults !== null && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-12 lg:mt-16"
            >
              {dealerResults.length > 0 ? (
                <>
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-xs font-medium tracking-[0.25em] uppercase text-pacific-mid">
                      {dealerResultsApproximate ? "Nearest" : "Results"}
                    </span>
                    <span className="text-sm font-light text-pacific-mid/80">
                      {dealerResultsApproximate ? (
                        <>
                          No exact match for{" "}
                          <span className="text-white">{dealerPincode}</span> —
                          showing {dealerResults.length} nearest dealer
                          {dealerResults.length === 1 ? "" : "s"} in the same
                          region.
                        </>
                      ) : (
                        <>
                          {dealerResults.length} dealer
                          {dealerResults.length === 1 ? "" : "s"} matching{" "}
                          <span className="text-white">{dealerPincode}</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dealerResults.map((d) => (
                      <div
                        key={d._id}
                        className="bg-[#112732] border border-white/10 rounded-2xl p-6 lg:p-7 flex flex-col gap-4 hover:border-white/20 transition-colors"
                      >
                        <div>
                          <h3 className="text-xl font-light text-white tracking-tight">
                            {d.name}
                          </h3>
                          {d.type && (
                            <span className="inline-block mt-2 text-[10px] font-medium tracking-[0.2em] uppercase text-pacific-light bg-white/5 border border-white/10 rounded-full px-3 py-1">
                              {d.type}
                            </span>
                          )}
                        </div>

                        {d.description && (
                          <p className="text-sm text-pacific-mid font-light leading-relaxed">
                            {d.description}
                          </p>
                        )}

                        <div className="space-y-2.5 text-sm font-light">
                          {(d.address || d.city || d.pincode) && (
                            <div className="flex items-start gap-3 text-pacific-light">
                              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-pacific-mid" />
                              <div>
                                {d.address && <div>{d.address}</div>}
                                <div className="text-pacific-mid">
                                  {[d.city, d.pincode, d.country]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </div>
                              </div>
                            </div>
                          )}
                          {d.phone && (
                            <a
                              href={`tel:${d.phone.replace(/\s+/g, "")}`}
                              className="flex items-center gap-3 text-pacific-light hover:text-white transition-colors"
                            >
                              <Phone className="w-4 h-4 text-pacific-mid" />
                              {d.phone}
                            </a>
                          )}
                          {d.email && (
                            <a
                              href={`mailto:${d.email}`}
                              className="flex items-center gap-3 text-pacific-light hover:text-white transition-colors break-all"
                            >
                              <Mail className="w-4 h-4 text-pacific-mid shrink-0" />
                              {d.email}
                            </a>
                          )}
                          {d.website && (
                            <a
                              href={d.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 text-pacific-light hover:text-white transition-colors break-all"
                            >
                              <ExternalLink className="w-4 h-4 text-pacific-mid shrink-0" />
                              {d.website.replace(/^https?:\/\//, "")}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-[#112732] border border-white/10 rounded-2xl p-8 lg:p-10 text-center max-w-2xl mx-auto">
                  <MapPin className="w-8 h-8 text-pacific-mid mx-auto mb-4" />
                  <h3 className="text-xl font-light text-white tracking-tight mb-2">
                    No dealers found for {dealerPincode}
                  </h3>
                  <p className="text-pacific-mid font-light mb-6 leading-relaxed">
                    We don&apos;t have a registered Pacific Surfaces dealer at
                    this postal code yet. Reach out on WhatsApp and our team
                    will recommend the nearest dealer for you.
                  </p>
                  <a
                    href={dealerWhatsAppFallback}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[#0a1620] font-medium text-sm tracking-[0.05em] uppercase hover:bg-pacific-light transition-colors"
                  >
                    Chat with our team
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Department Contacts Section */}
      <section className="bg-[#0e2030]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24 border-t border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight text-white mb-4">
              Department Contacts
            </h2>
            <p className="text-pacific-mid font-light max-w-2xl">
              Reach out to our specialized teams for region-specific or
              department-specific inquiries.
            </p>
          </motion.div>

          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {departmentContacts.map((dept, idx) => (
              <StaggerItem key={idx}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white/5 rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-white/15 transition-colors"
                >
                  <h3 className="text-lg font-medium text-white mb-6">
                    {dept.name}
                  </h3>
                  <div className="space-y-4">
                    {dept.contacts.map((contact, cidx) => (
                      <div key={cidx} className="flex flex-col gap-2">
                        {contact.name && (
                          <p className="text-sm font-medium text-pacific-light">
                            {contact.name}
                          </p>
                        )}
                        <div className="space-y-1">
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone.replace(/\s/g, "")}`}
                              className="flex items-center gap-2 text-sm text-pacific-mid hover:text-white transition-colors"
                            >
                              <Phone className="w-4 h-4" />
                              {contact.phone}
                            </a>
                          )}
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="flex items-center gap-2 text-sm text-pacific-mid hover:text-white transition-colors break-all"
                            >
                              <Mail className="w-4 h-4 shrink-0" />
                              {contact.email}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Office Locations Section */}
      <section className="bg-[#112732]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24 border-t border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight text-white mb-4">
              Office Locations
            </h2>
            <p className="text-pacific-mid font-light max-w-2xl">
              Visit us at any of our offices across India for a premium surface
              experience.
            </p>
          </motion.div>

          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {officeLocations.map((location, idx) => (
              <StaggerItem key={idx}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/15 transition-colors"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-white rounded-xl">
                      <MapPin className="w-5 h-5 text-[#112732]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        {location.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-pacific-mid font-light leading-relaxed ml-16">
                    {location.address}
                  </p>
                  <div className="mt-6 pt-6 border-t border-white/10 ml-16">
                    <p className="text-xs text-pacific-mid font-light">
                      Mon - Sat: 9:00 AM - 7:00 PM
                    </p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Dealer Locations Section */}
      <section className="bg-[#0e2030]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24 border-t border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-pacific-mid/70 mb-4 block">
              Our Network
            </span>
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight text-white mb-4">
              Our Dealers & Partners
            </h2>
            <p className="text-pacific-mid font-light max-w-2xl">
              Connect with our trusted dealer partners across India.
            </p>
          </motion.div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dealerLocations.map((dealer, idx) => (
              <StaggerItem key={idx}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/15 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white">
                        {dealer.name}
                      </h3>
                      <p className="text-xs uppercase tracking-wider text-pacific-mid mt-1">
                        {dealer.city}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-pacific-mid font-light leading-relaxed">
                    {dealer.address}
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </>
  );
}
