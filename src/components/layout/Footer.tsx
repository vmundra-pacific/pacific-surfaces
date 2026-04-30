"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Mail, Phone, MapPin, Send } from "lucide-react";

/* ------------------------------------------------------------------ *
 * Social-platform icons — inline SVGs.
 *
 * The installed lucide-react version doesn't export every brand icon
 * (Facebook / Linkedin / Youtube were undefined at runtime), so all
 * five are rendered as inline 24×24 SVG components instead. Style
 * matches the rest of the footer's editorial tone:
 *   - viewBox 0 0 24 24
 *   - fill: currentColor (so text colour = icon colour, hover transition
 *     hits both at once)
 *   - stroke: none — using filled glyphs for crisp recognition at
 *     16px size (stroke would render too thin)
 * ------------------------------------------------------------------ */

type IconProps = { className?: string };

function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.14 0-3.51.01-4.75.07-1.07.05-1.65.23-2.04.38-.51.2-.88.44-1.27.83-.39.39-.63.76-.83 1.27-.15.39-.33.97-.38 2.04-.06 1.24-.07 1.61-.07 4.75s.01 3.51.07 4.75c.05 1.07.23 1.65.38 2.04.2.51.44.88.83 1.27.39.39.76.63 1.27.83.39.15.97.33 2.04.38 1.24.06 1.61.07 4.75.07s3.51-.01 4.75-.07c1.07-.05 1.65-.23 2.04-.38.51-.2.88-.44 1.27-.83.39-.39.63-.76.83-1.27.15-.39.33-.97.38-2.04.06-1.24.07-1.61.07-4.75s-.01-3.51-.07-4.75c-.05-1.07-.23-1.65-.38-2.04a3.4 3.4 0 0 0-.83-1.27 3.4 3.4 0 0 0-1.27-.83c-.39-.15-.97-.33-2.04-.38-1.24-.06-1.61-.07-4.75-.07zm0 2.76a5.46 5.46 0 1 1 0 10.92 5.46 5.46 0 0 1 0-10.92zm0 9a3.54 3.54 0 1 0 0-7.08 3.54 3.54 0 0 0 0 7.08zm6.96-9.22a1.27 1.27 0 1 1-2.55 0 1.27 1.27 0 0 1 2.55 0z" />
    </svg>
  );
}

function FacebookIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88V14.9H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.9h-2.34v6.98C18.34 21.13 22 16.99 22 12z" />
    </svg>
  );
}

function LinkedInIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34V9.67H5.67v8.67h2.67zM7 8.34a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1zm11.34 10V13.6c0-2.55-1.36-3.74-3.18-3.74-1.46 0-2.12.8-2.49 1.37V9.67h-2.67c.04.76 0 8.67 0 8.67h2.67v-4.84c0-.24.02-.48.09-.65.19-.48.62-.97 1.35-.97.95 0 1.34.72 1.34 1.78v4.69h2.89z" />
    </svg>
  );
}

function PinterestIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.86 6.36 9.32-.09-.79-.17-2.01.04-2.87.19-.78 1.21-4.97 1.21-4.97s-.31-.62-.31-1.54c0-1.44.84-2.52 1.88-2.52.89 0 1.32.67 1.32 1.47 0 .9-.57 2.24-.86 3.49-.25 1.04.52 1.89 1.55 1.89 1.86 0 3.29-1.96 3.29-4.79 0-2.5-1.8-4.25-4.37-4.25-2.98 0-4.73 2.23-4.73 4.54 0 .9.35 1.86.78 2.39.09.1.1.19.07.29-.07.31-.24.97-.27 1.11-.04.18-.14.22-.32.13-1.21-.56-1.97-2.33-1.97-3.75 0-3.05 2.22-5.86 6.41-5.86 3.36 0 5.97 2.4 5.97 5.6 0 3.34-2.11 6.03-5.04 6.03-.98 0-1.91-.51-2.22-1.12l-.6 2.31c-.22.84-.81 1.89-1.21 2.53C9.73 21.79 10.85 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}

function YoutubeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.6 4 12 4 12 4s-7.6 0-9.4.4a3 3 0 0 0-2.1 2.1C0 8.3 0 12 0 12s0 3.7.5 5.5a3 3 0 0 0 2.1 2.1C4.4 20 12 20 12 20s7.6 0 9.4-.4a3 3 0 0 0 2.1-2.1c.5-1.8.5-5.5.5-5.5s0-3.7-.5-5.5zM9.6 15.6V8.4l6.4 3.6-6.4 3.6z" />
    </svg>
  );
}

// Footer columns rebalanced — was Products(8) / Company(5) / Support(4)
// with Semi-Precious mis-categorised under Support and product
// collections (Kosmic / Nebula / Centrepiece) bloating the Products
// list. Cleaner split now: Products by category (5), Company (5),
// Resources & Legal (5). Each column has the same item count so the
// columns visually align instead of one dominating.
const footerLinks = {
  products: [
    { name: "Quartz", href: "/products/quartz" },
    // Vision = Vision Series collection — the same target the
    // header's Products dropdown uses (/products/quartz/chromia).
    { name: "Vision", href: "/products/quartz/chromia" },
    { name: "Granite", href: "/products/granites" },
    { name: "Semi-Precious", href: "/products/semi-precious" },
    // Ecosurfaces + Sinks removed from the footer per editorial
    // direction — users who want them reach the full catalogue via
    // "More" below. Header dropdown still surfaces every category.
    { name: "More", href: "/products" },
  ],
  company: [
    { name: "Our Story", href: "/about" },
    { name: "Sustainability", href: "/sustainability" },
    { name: "Careers", href: "/careers" },
    { name: "News & Events", href: "/blog" },
    { name: "Contact Us", href: "/contact" },
  ],
  resources: [
    // "All Collections" removed — Products column's "More" link
    // already opens /products, and duplicating it here muddied the
    // hierarchy.
    { name: "Resources", href: "/resources" },
    { name: "Visualizer", href: "/visualize" },
    { name: "Terms & Conditions", href: "#" },
    { name: "Privacy Policy", href: "#" },
  ],
};

// Each entry pairs the URL with the matching inline-SVG component
// defined above. All five share the same currentColor + 16px (w-4
// h-4) sizing so the row reads as one consistent strip.
const socialLinks: {
  name: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/pacific_surfaces/",
    Icon: InstagramIcon,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/thepacificstone/",
    Icon: FacebookIcon,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/pacific-granites-india-pvt-ltd/",
    Icon: LinkedInIcon,
  },
  {
    name: "Pinterest",
    href: "https://in.pinterest.com/thepacificstone",
    Icon: PinterestIcon,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/channel/UCWeTO3mX6zInSev42K9h5Fw",
    Icon: YoutubeIcon,
  },
];

export default function Footer() {
  const [newsletter, setNewsletter] = useState({ firstName: "", email: "" });
  const [newsletterState, setNewsletterState] = useState<
    "idle" | "sending" | "sent"
  >("idle");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterState("sending");
    setTimeout(() => {
      setNewsletterState("sent");
      setNewsletter({ firstName: "", email: "" });
      setTimeout(() => setNewsletterState("idle"), 3000);
    }, 1000);
  };

  return (
    <footer className="bg-stone-950 text-stone-400 overflow-hidden">
      {/* Top separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-stone-700/50 to-transparent" />

      {/* Newsletter Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 sm:py-16 lg:py-20 border-b border-stone-800/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <h3 className="text-2xl lg:text-3xl font-light tracking-tight text-white mb-3">
            Join us on this exciting journey as we shape the future of stones.
          </h3>
          <p className="text-stone-500 font-light mb-8">
            Subscribe for updates on new collections, design inspiration, and
            exclusive offers.
          </p>

          {newsletterState === "sent" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-emerald-400 font-light"
            >
              Thank you for subscribing!
            </motion.div>
          ) : (
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-xl"
            >
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="First name"
                  value={newsletter.firstName}
                  onChange={(e) =>
                    setNewsletter({ ...newsletter, firstName: e.target.value })
                  }
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-700 text-white text-sm focus:outline-none focus:border-stone-500 transition-colors placeholder:text-stone-600"
                />
              </div>
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Email address"
                  value={newsletter.email}
                  onChange={(e) =>
                    setNewsletter({ ...newsletter, email: e.target.value })
                  }
                  required
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-700 text-white text-sm focus:outline-none focus:border-stone-500 transition-colors placeholder:text-stone-600"
                />
              </div>
              <motion.button
                type="submit"
                disabled={newsletterState === "sending"}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-stone-700 hover:bg-stone-600 text-white px-6 py-3 rounded-full text-sm font-light tracking-wide transition-colors disabled:opacity-60"
              >
                {newsletterState === "sending" ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {newsletterState === "sending" ? "Sending..." : "Subscribe"}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-12 sm:pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4"
          >
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-xl sm:text-[22px] font-semibold tracking-[0.18em] text-white">
                PACIFIC
              </span>
              <span className="text-xl sm:text-[22px] font-light tracking-[0.18em] text-stone-500">
                SURFACES
              </span>
            </Link>
            <p className="text-[13px] text-stone-400 leading-relaxed max-w-sm mb-8 font-light">
              India&apos;s premier destination for engineered quartz, granite,
              and eco surfaces. Crafted for architects, designers, and spaces
              that demand the extraordinary.
            </p>

            {/* Contact info — matched typography with the rest of the
                footer body (text-[13px] / stone-400) so contact rows
                read as siblings to the link columns rather than a
                separate visual register. */}
            <div className="space-y-3">
              <a
                href="mailto:info@thepacific.group"
                className="flex items-center gap-3 text-[13px] text-stone-400 hover:text-white transition-colors duration-300 group"
              >
                <Mail className="w-4 h-4 text-stone-500 group-hover:text-white transition-colors duration-300 shrink-0" />
                info@thepacific.group
              </a>
              <a
                href="tel:+917305477549"
                className="flex items-center gap-3 text-[13px] text-stone-400 hover:text-white transition-colors duration-300 group"
              >
                <Phone className="w-4 h-4 text-stone-500 group-hover:text-white transition-colors duration-300 shrink-0" />
                +91 73054 77549
              </a>
              <div className="flex items-center gap-3 text-[13px] text-stone-400">
                <MapPin className="w-4 h-4 text-stone-500 shrink-0" />
                India
              </div>
            </div>
          </motion.div>

          {/* Link columns — three even columns (Products / Company /
              Resources) with matching item counts for visual balance.
              Section labels share identical typography so one column
              never out-shouts the others. */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-10">
            {[
              { heading: "Products", links: footerLinks.products, delay: 0.1 },
              { heading: "Company", links: footerLinks.company, delay: 0.2 },
              {
                heading: "Resources",
                links: footerLinks.resources,
                delay: 0.3,
              },
            ].map(({ heading, links, delay }) => (
              <motion.div
                key={heading}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay }}
              >
                <h4 className="text-[11px] font-medium tracking-[0.25em] uppercase text-white/85 mb-5 sm:mb-6">
                  {heading}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-stone-400 hover:text-white transition-colors duration-300 font-light tracking-[0.01em]"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Social + Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 pt-8 border-t border-stone-800/50"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Social links — icon + tracked-out label per item.
                Icon sits before the name; both share text colour
                so hover transitions hit them in sync. */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:gap-6">
              {socialLinks.map((social) => {
                const Icon = social.Icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-stone-500 hover:text-white transition-colors duration-300"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{social.name}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                  </a>
                );
              })}
            </div>

            {/* Copyright */}
            <p className="text-xs text-stone-600 font-light">
              &copy; {new Date().getFullYear()} Pacific Surfaces. All rights
              reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
