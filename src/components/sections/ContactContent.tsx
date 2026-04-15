"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, ArrowUpRight, CheckCircle, Clock } from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";

const departmentContacts: { name: string; contacts: { name?: string; phone?: string; email: string }[] }[] = [
  {
    name: "International Sales",
    contacts: [
      { name: "Jal Shetty", phone: "+91 96773 68666", email: "thejal.shetty@thepacific.group" },
      { name: "Manish", phone: "+91 93242 81801", email: "manish@thepacific.group" },
    ],
  },
  {
    name: "Inquiries for Poland",
    contacts: [
      { name: "Paulina", phone: "+48 517 540 297", email: "paulina@thepacific.group" },
      { name: "Marcin", phone: "+48 537 819 991", email: "marcin@pacificsurfaces.pl" },
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
    contacts: [
      { phone: "+91 7305477549", email: "info@thepacific.group" },
    ],
  },
  {
    name: "Inquiries for Middle East",
    contacts: [
      { name: "Saral", phone: "+91 73977 46963", email: "saral@thepacific.group" },
    ],
  },
  {
    name: "Inquiries for Croatia",
    contacts: [
      { name: "Marko", phone: "+385 91 250 4582", email: "marko@thepacific.group" },
    ],
  },
  {
    name: "Marketing",
    contacts: [
      { email: "bindu@thepacific.group" },
    ],
  },
  {
    name: "Human Resources",
    contacts: [
      { phone: "+91 89259 01419", email: "hr@pacific-surfaces.com" },
    ],
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
    address: "JB Homes, Plot no. 35 & 36, Marble Market, Sector 23, Turbhe, Navi Mumbai, Maharashtra 400703",
  },
  {
    name: "Bengaluru Office",
    address: "Marble City, Bannerghatta Rd, Koppa Gate, Bengaluru, Karnataka 560105",
  },
];

const dealerLocations = [
  {
    name: "Shree Shantinath Granite World",
    city: "Hyderabad",
    address: "Plot No 8, Inner Ring Rd, beside Indian Oil Petrol Pump, Samathapuri, Nagole, Hyderabad, Telangana",
  },
  {
    name: "Swastik Marbles",
    city: "Bengaluru",
    address: "17/4, Bannerghatta Rd, Lakkasandra, Lakkasandra Extension, Adugodi, Bengaluru, Karnataka 560030",
  },
  {
    name: "Shree Shantinath Granite World",
    city: "Gurugram",
    address: "SY NO 52, Plot no 250 & 253, opposite Police Commissioner Office, Janardhan Hills, Lumbini Avenue, Gurugram",
  },
  {
    name: "La Casa Decor",
    city: "Panchkula",
    address: "Plot No. 271, Industrial Area Phase 2, Panchkula, Haryana 134113",
  },
];

export function ContactContent() {
  const [formState, setFormState] = useState<"idle" | "sending" | "sent">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    role: "",
    application: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");
    setTimeout(() => {
      setFormState("sent");
      setTimeout(() => {
        setFormState("idle");
        setFormData({ name: "", email: "", address: "", phone: "", role: "", application: "", message: "" });
      }, 3000);
    }, 1500);
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
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-4"
          >
            Get in Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white max-w-2xl"
          >
            Let&apos;s Create Something Extraordinary
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-4 text-lg text-stone-400 max-w-xl font-light"
          >
            Whether you need a quote, samples, or expert advice on surface selection
            — we&apos;re here to help.
          </motion.p>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-stone-700/50 to-transparent" />
      </section>

      {/* Contact Content */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Form */}
          <AnimatedSection className="lg:col-span-3" animation="slideInLeft">
            {formState === "sent" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-stone-50 rounded-2xl p-12 text-center"
              >
                <div className="p-4 bg-emerald-50 rounded-full w-fit mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-medium text-stone-900">
                  Message Sent
                </h3>
                <p className="mt-3 text-stone-500 font-light max-w-sm mx-auto">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setFormState("idle");
                    setFormData({ name: "", email: "", address: "", phone: "", role: "", application: "", message: "" });
                  }}
                  className="mt-6 text-sm text-stone-600 underline hover:text-stone-900 transition-colors"
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
                      className="block text-xs font-medium tracking-wider uppercase text-stone-400 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-300"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium tracking-wider uppercase text-stone-400 mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-300"
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-xs font-medium tracking-wider uppercase text-stone-400 mb-2"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-300"
                    placeholder="Your address"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-medium tracking-wider uppercase text-stone-400 mb-2"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-300"
                      placeholder="+91 73054 77549"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-xs font-medium tracking-wider uppercase text-stone-400 mb-2"
                    >
                      I am
                    </label>
                    <select
                      id="role"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                    >
                      <option value="">Select your role</option>
                      <option value="architect">Architect</option>
                      <option value="interior-designer">Interior Designer</option>
                      <option value="homeowner">Homeowner</option>
                      <option value="builder">Builder</option>
                      <option value="fabricator">Fabricator</option>
                      <option value="distributor">Distributor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="application"
                    className="block text-xs font-medium tracking-wider uppercase text-stone-400 mb-2"
                  >
                    Application
                  </label>
                  <select
                    id="application"
                    required
                    value={formData.application}
                    onChange={(e) => setFormData({ ...formData, application: e.target.value })}
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                  >
                    <option value="">Select application</option>
                    <option value="kitchen-countertops">Kitchen Countertops</option>
                    <option value="flooring">Flooring</option>
                    <option value="staircases">Staircases</option>
                    <option value="exterior-cladding">Exterior Cladding</option>
                    <option value="commercial">Commercial</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs font-medium tracking-wider uppercase text-stone-400 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors resize-none placeholder:text-stone-300"
                    placeholder="Tell us about your project..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={formState === "sending"}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-3 bg-stone-900 text-white px-8 py-4 rounded-full text-sm font-medium tracking-wider uppercase hover:bg-stone-800 transition-colors disabled:opacity-60"
                >
                  {formState === "sending" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-stone-400 mb-6">
                  Quick Contact
                </h3>
                <div className="space-y-6">
                  <a
                    href="mailto:info@thepacific.group"
                    className="flex items-start gap-4 group"
                  >
                    <div className="p-3 bg-stone-50 rounded-xl group-hover:bg-stone-100 transition-colors">
                      <Mail className="w-5 h-5 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 tracking-wide">
                        Email
                      </p>
                      <p className="mt-1 text-sm text-stone-900 font-medium group-hover:text-stone-600 transition-colors">
                        info@thepacific.group
                      </p>
                    </div>
                  </a>

                  <a
                    href="tel:+917305477549"
                    className="flex items-start gap-4 group"
                  >
                    <div className="p-3 bg-stone-50 rounded-xl group-hover:bg-stone-100 transition-colors">
                      <Phone className="w-5 h-5 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 tracking-wide">
                        Phone
                      </p>
                      <p className="mt-1 text-sm text-stone-900 font-medium group-hover:text-stone-600 transition-colors">
                        +91 73054 77549
                      </p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-stone-50 rounded-xl">
                      <Clock className="w-5 h-5 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 tracking-wide">
                        Hours
                      </p>
                      <p className="mt-1 text-sm text-stone-900 font-medium">
                        Mon - Sat: 9:00 AM - 7:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div>
                <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-stone-400 mb-6">
                  Follow Us
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "Instagram", href: "https://www.instagram.com/pacific_surfaces/" },
                    { name: "Facebook", href: "https://www.facebook.com/pacificsurfaces" },
                    { name: "LinkedIn", href: "https://www.linkedin.com/company/pacific-surfaces" },
                    { name: "YouTube", href: "https://www.youtube.com/@pacificsurfaces" },
                  ].map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between py-3 border-b border-stone-100 group hover:border-stone-300 transition-colors"
                    >
                      <span className="text-sm text-stone-600 group-hover:text-stone-900 transition-colors">
                        {social.name}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Department Contacts Section */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24 border-t border-stone-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-light tracking-tight text-stone-900 mb-4">
            Department Contacts
          </h2>
          <p className="text-stone-600 font-light max-w-2xl">
            Reach out to our specialized teams for region-specific or department-specific inquiries.
          </p>
        </motion.div>

        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {departmentContacts.map((dept, idx) => (
            <StaggerItem key={idx}>
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-stone-50 rounded-2xl p-8 border border-stone-200 hover:border-stone-300 transition-colors"
              >
                <h3 className="text-lg font-medium text-stone-900 mb-6">
                  {dept.name}
                </h3>
                <div className="space-y-4">
                  {dept.contacts.map((contact, cidx) => (
                    <div key={cidx} className="flex flex-col gap-2">
                      {contact.name && (
                        <p className="text-sm font-medium text-stone-700">
                          {contact.name}
                        </p>
                      )}
                      <div className="space-y-1">
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone.replace(/\s/g, "")}`}
                            className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            {contact.phone}
                          </a>
                        )}
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
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
      </section>

      {/* Office Locations Section */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24 border-t border-stone-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-light tracking-tight text-stone-900 mb-4">
            Office Locations
          </h2>
          <p className="text-stone-600 font-light max-w-2xl">
            Visit us at any of our offices across India for a premium surface experience.
          </p>
        </motion.div>

        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {officeLocations.map((location, idx) => (
            <StaggerItem key={idx}>
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-stone-50 rounded-2xl p-8 border border-stone-200 hover:border-stone-300 transition-colors"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-stone-900 rounded-xl">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-stone-900">
                      {location.name}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-stone-600 font-light leading-relaxed ml-16">
                  {location.address}
                </p>
                <div className="mt-6 pt-6 border-t border-stone-200 ml-16">
                  <p className="text-xs text-stone-500 font-light">
                    Mon - Sat: 9:00 AM - 7:00 PM
                  </p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Dealer Locations Section */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24 border-t border-stone-200">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-stone-400 mb-4 block">
              Our Network
            </span>
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight text-stone-900 mb-4">
              Our Dealers & Partners
            </h2>
            <p className="text-stone-600 font-light max-w-2xl">
              Connect with our trusted dealer partners across India.
            </p>
          </motion.div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dealerLocations.map((dealer, idx) => (
              <StaggerItem key={idx}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-stone-50 rounded-2xl p-6 border border-stone-200 hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-white rounded-lg">
                      <MapPin className="w-5 h-5 text-stone-900" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-stone-900">
                        {dealer.name}
                      </h3>
                      <p className="text-xs uppercase tracking-wider text-stone-500 mt-1">
                        {dealer.city}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-stone-500 font-light leading-relaxed">
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
