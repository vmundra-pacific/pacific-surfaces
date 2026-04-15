"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Mail, Phone, MapPin, Send } from "lucide-react";

const footerLinks = {
  products: [
    { name: "Quartz Surfaces", href: "/products" },
    { name: "Kosmic Collection", href: "/collections/kosmic-collection" },
    { name: "Nebula Collection", href: "/collections/nebula-collection" },
    { name: "Centrepiece Couture", href: "/collections/centrepiece-couture" },
    { name: "Integra (Sinks)", href: "/sinks" },
    { name: "Ecosurfaces", href: "/ecosurfaces" },
    { name: "Granites", href: "/granites" },
    { name: "Natural Stone Finishes", href: "/granites" },
  ],
  company: [
    { name: "Our Story", href: "/about" },
    { name: "Sustainability", href: "/sustainability" },
    { name: "Work with Us", href: "/careers" },
    { name: "News & Events", href: "/blog" },
    { name: "Contact Us", href: "/contact" },
  ],
  support: [
    { name: "Resources", href: "/resources" },
    { name: "Semi-Precious", href: "/semi-precious" },
    { name: "Terms & Conditions", href: "#" },
    { name: "Privacy Policy", href: "#" },
  ],
};

const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/pacific_surfaces/" },
  { name: "Facebook", href: "https://www.facebook.com/thepacificstone/" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/pacific-granites-india-pvt-ltd/" },
  { name: "Pinterest", href: "https://in.pinterest.com/thepacificstone" },
  { name: "YouTube", href: "https://www.youtube.com/channel/UCWeTO3mX6zInSev42K9h5Fw" },
];

export default function Footer() {
  const [newsletter, setNewsletter] = useState({ firstName: "", email: "" });
  const [newsletterState, setNewsletterState] = useState<"idle" | "sending" | "sent">("idle");

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
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-20 border-b border-stone-800/50">
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
            Subscribe for updates on new collections, design inspiration, and exclusive offers.
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
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="First name"
                  value={newsletter.firstName}
                  onChange={(e) => setNewsletter({ ...newsletter, firstName: e.target.value })}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-700 text-white text-sm focus:outline-none focus:border-stone-500 transition-colors placeholder:text-stone-600"
                />
              </div>
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Email address"
                  value={newsletter.email}
                  onChange={(e) => setNewsletter({ ...newsletter, email: e.target.value })}
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
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-20 pb-12">
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
              <span className="text-lg font-semibold tracking-[0.15em] text-white">
                PACIFIC
              </span>
              <span className="text-lg font-light tracking-[0.15em] text-stone-500">
                SURFACES
              </span>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed max-w-sm mb-8 font-light">
              India&apos;s premier destination for engineered quartz, granite, and eco surfaces.
              Crafted for architects, designers, and spaces that demand the extraordinary.
            </p>

            {/* Contact info */}
            <div className="space-y-3">
              <a
                href="mailto:info@thepacific.group"
                className="flex items-center gap-3 text-sm text-stone-500 hover:text-white transition-colors duration-300 group"
              >
                <Mail className="w-4 h-4 text-stone-600 group-hover:text-white transition-colors duration-300" />
                info@thepacific.group
              </a>
              <a
                href="tel:+917305477549"
                className="flex items-center gap-3 text-sm text-stone-500 hover:text-white transition-colors duration-300 group"
              >
                <Phone className="w-4 h-4 text-stone-600 group-hover:text-white transition-colors duration-300" />
                +91 73054 77549
              </a>
              <div className="flex items-center gap-3 text-sm text-stone-500">
                <MapPin className="w-4 h-4 text-stone-600" />
                India
              </div>
            </div>
          </motion.div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-stone-300 mb-6">
                Products
              </h4>
              <ul className="space-y-3">
                {footerLinks.products.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-500 hover:text-white transition-colors duration-300 font-light"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-stone-300 mb-6">
                Company
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-500 hover:text-white transition-colors duration-300 font-light"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-stone-300 mb-6">
                Support
              </h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-500 hover:text-white transition-colors duration-300 font-light"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
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
            {/* Social links */}
            <div className="flex items-center gap-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase text-stone-600 hover:text-white transition-colors duration-300"
                >
                  {social.name}
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                </a>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-xs text-stone-600 font-light">
              &copy; {new Date().getFullYear()} Pacific Surfaces. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
