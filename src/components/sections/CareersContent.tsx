"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Send } from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { MagneticButton } from "@/components/ui/magnetic-button";

const jobs = [
  {
    title: "Events Manager",
    location: "North America",
    department: "Events/Marketing",
    description: "You will play a pivotal role in enhancing the company's presence at both international and domestic events. Your responsibilities will include identifying relevant events, securing booth spaces, negotiating with vendors, overseeing booth fabrication, and ensuring effective sampling and execution."
  },
  {
    title: "Senior Accountant",
    location: "Bangalore",
    department: "Finance",
    description: "Responsible for overseeing the financial operations of the company, ensuring accuracy and compliance with accounting standards and regulations. You will play a critical role in financial reporting, budgeting, forecasting, and analysis to support strategic decision-making."
  },
  {
    title: "Digital Marketing Manager",
    location: "Germany",
    department: "Digital Marketing",
    description: "Responsible for developing and implementing digital marketing strategies to promote our brand, drive customer engagement, and generate leads within the stone industry. You will lead a dynamic team and leverage your expertise in digital marketing channels."
  },
  {
    title: "Chief Financial Officer",
    location: "India",
    department: "Finance",
    description: "A strategic partner to the executive leadership team, providing financial leadership and driving the company's overall financial strategy. Responsible for overseeing all aspects of financial management including financial planning, budgeting, accounting, treasury, and risk management."
  },
  {
    title: "International Sales",
    location: "PAN India",
    department: "Sales",
    description: "You will play a vital role in expanding our market presence and driving sales growth on a global scale. Responsibilities include identifying and pursuing sales opportunities in international markets, building relationships with distributors and clients."
  },
  {
    title: "A&D Executive",
    location: "France",
    department: "Architecture & Design",
    description: "Engages architects and interior designers to promote products and secure project specifications. Tracks projects from design to execution and supports sales for conversion. Builds strong relationships and represents the brand in the assigned territory."
  },
  {
    title: "Business Development Manager",
    location: "Spain",
    department: "Business Development",
    description: "A dynamic and driven individual to join our team at our Quartz Slabs Manufacturing Plant. The ideal candidate will have excellent communication skills, a proven track record in sales, and the ability to foster strong relationships with clients."
  },
  {
    title: "Purchase Manager",
    location: "UK",
    department: "Procurement",
    description: "Oversee and manage all aspects of our company's procurement processes. Ensuring the timely and cost-effective acquisition of raw materials, consumables, and other production-related necessities with exceptional attention to detail and negotiation skills."
  },
  {
    title: "Marketing Head",
    location: "Hosur, Tamil Nadu",
    department: "Marketing",
    description: "Lead our marketing initiatives and drive brand growth. The ideal candidate will have a proven track record in brand building, deep understanding of SEO and digital marketing, event management, proficiency in print media. Requires 8-10 years of marketing experience."
  },
  {
    title: "A&D Manager",
    location: "Mexico",
    department: "Architecture & Design",
    description: "Leads the national Architecture & Design function to drive product specification and brand preference among architects and designers. Manages regional A&D teams and key national accounts while aligning closely with sales and marketing."
  },
  {
    title: "SEO Specialist",
    location: "Belgium",
    department: "Digital Marketing",
    description: "Optimize the content on our website based on analytics and keyword research. Also responsible for researching advertising and website layout trends that will generate more page traffic."
  },
  {
    title: "Senior Graphic Designer",
    location: "Italy",
    department: "Design/Creative",
    description: "Crucial role in enhancing the visual identity of our brand within the stone industry. Responsibilities include designing promotional materials, graphics, product catalogs, digital assets, and other creative collateral to support marketing and sales efforts."
  },
];

const values = [
  {
    title: "A Place to Grow",
    description: "At Pacific, we invest in people. We offer an environment where talent is recognized, skills evolve, and every individual is encouraged to reach their highest potential.",
  },
  {
    title: "A Culture That Inspires",
    description: "We believe in teamwork, open communication, and positive energy. Our workspace is built on enthusiasm, ambition, and a mindset that welcomes new ideas.",
  },
  {
    title: "A Future We Build Together",
    description: "Join a company committed to integrity, innovation, and responsible growth. At Pacific, you become part of a team shaping meaningful, global impact.",
  },
];

export function CareersContent() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    department: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

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
    setSubmitStatus("submitting");

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
      setTimeout(() => setSubmitStatus("idle"), 3000);
    } catch {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center bg-stone-950 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-stone-950/80 to-stone-950" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-24 text-center"
        >
          <span className="inline-block text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-6">
            Careers
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white max-w-3xl mx-auto">
            An Environment That Supports Your Progress
          </h1>
          <p className="mt-6 text-lg text-stone-400 max-w-2xl mx-auto font-light leading-relaxed">
            Pacific is built on the belief that great environments help people thrive. Our products are designed to elevate spaces across the globe, creating settings that are functional, expressive, and welcoming. For our team and partners, we nurture a culture of openness and growth.
          </p>
        </motion.div>
      </section>

      {/* Values */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-stone-50 rounded-2xl p-8 border border-stone-100 hover:border-stone-200 transition-all duration-500"
                >
                  <h3 className="text-xl font-light tracking-tight text-stone-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-stone-600 font-light leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Job Listings */}
      <section className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
          <AnimatedSection className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
              Open Positions
            </h2>
            <p className="mt-3 text-stone-600 font-light">
              Explore career opportunities across our global offices.
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job, index) => (
              <StaggerItem key={`${job.title}-${job.location}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-6 border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all duration-500"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-light tracking-tight text-stone-900">
                        {job.title}
                      </h3>
                      <div className="mt-2 flex gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-stone-100 text-xs font-medium tracking-wide text-stone-600">
                          {job.location}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-xs font-medium tracking-wide text-emerald-700">
                          {job.department}
                        </span>
                      </div>
                      <p className="mt-4 text-sm text-stone-600 font-light leading-relaxed">
                        {job.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-300 flex-shrink-0 mt-1" />
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Application Form */}
      <section className="bg-white">
        <div className="mx-auto max-w-2xl px-6 lg:px-8 py-16 lg:py-24">
          <AnimatedSection className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
              Apply Now
            </h2>
            <p className="mt-3 text-stone-600 font-light">
              Send us your information and resume. We&apos;ll review your application and get back to you soon.
            </p>
          </AnimatedSection>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-6 bg-stone-50 rounded-2xl p-8 border border-stone-100"
          >
            {/* Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium tracking-[0.15em] uppercase text-stone-600 mb-3">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white font-light text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs font-medium tracking-[0.15em] uppercase text-stone-600 mb-3">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white font-light text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium tracking-[0.15em] uppercase text-stone-600 mb-3">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white font-light text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium tracking-[0.15em] uppercase text-stone-600 mb-3">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white font-light text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium tracking-[0.15em] uppercase text-stone-600 mb-3">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white font-light text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                placeholder="123 Main Street, City, State"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-medium tracking-[0.15em] uppercase text-stone-600 mb-3">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white font-light text-stone-900 focus:outline-none focus:border-stone-400 transition-colors"
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
            </div>

            {/* Resume */}
            <div>
              <label className="block text-xs font-medium tracking-[0.15em] uppercase text-stone-600 mb-3">
                Upload Resume
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white font-light text-stone-900 focus:outline-none focus:border-stone-400 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-stone-100 file:font-light file:text-stone-700 hover:file:bg-stone-200"
                />
              </div>
              {resumeFile && (
                <p className="mt-2 text-xs text-stone-500">
                  Selected: {resumeFile.name}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitStatus === "submitting"}
                className="w-full bg-stone-900 text-white px-6 py-3 rounded-lg font-light tracking-wide hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 group"
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
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-emerald-700 font-light">
                  Thank you for your application! We&apos;ll review it and get back to you soon.
                </p>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 font-light">
                  There was an error submitting your application. Please try again.
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
              Don&apos;t see the right position?
            </h2>
            <p className="mt-3 text-stone-400 font-light max-w-md mx-auto">
              Send us your resume and let us know your interest. We&apos;d love to consider you for future opportunities.
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
