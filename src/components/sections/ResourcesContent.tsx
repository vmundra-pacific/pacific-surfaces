"use client";

import { FileText } from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { PageHeader } from "@/components/ui/page-header";

interface DownloadCard {
  title: string;
  category: string;
}

const quartz: DownloadCard[] = [
  { title: "Quartz Color Palette", category: "Quartz Curations" },
  { title: "Kosmic Color Palette", category: "Quartz Curations" },
  { title: "Integrated Sink Collection", category: "Quartz Curations" },
  { title: "Quartz Cut-to-Size Guide", category: "Quartz Curations" },
];

const indian: DownloadCard[] = [
  { title: "Indian Color Palette", category: "Indian Edition" },
  { title: "Chromia Vision Series", category: "Indian Edition" },
];

const technical: DownloadCard[] = [
  { title: "Quality Parameters", category: "Technical Details" },
  { title: "Care & Maintenance Sheet", category: "Technical Details" },
  { title: "Fabrication Manual", category: "Technical Details" },
  { title: "Life Cycle Assessment (LCA)", category: "Technical Details" },
  { title: "Technical Data Sheet", category: "Technical Details" },
  { title: "Sustainability Blueprint", category: "Technical Details" },
  { title: "Brand Manual", category: "Technical Details" },
  { title: "Ecosurface Test Reports", category: "Technical Details" },
];

const granite: DownloadCard[] = [
  { title: "Natural Stone Catalog", category: "Granite Curations" },
  { title: "Natural Stone Finishes", category: "Granite Curations" },
  { title: "Cut-to-Size Catalog", category: "Granite Curations" },
  { title: "Window Sills & Thresholds Flyer", category: "Granite Curations" },
  { title: "Monument Catalog", category: "Granite Curations" },
  { title: "Landscape Edition Catalog", category: "Granite Curations" },
];

const DownloadCardComponent = ({ item }: { item: DownloadCard }) => (
  <StaggerItem>
    <div className="bg-white rounded-2xl p-8 border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all duration-500 h-full flex flex-col">
      <div className="p-3 bg-stone-50 rounded-xl w-fit mb-6">
        <FileText className="w-5 h-5 text-stone-600" />
      </div>
      <h3 className="text-base font-light text-stone-900 flex-grow">
        {item.title}
      </h3>
      <div className="mt-6 pt-6 border-t border-stone-100">
        <a
          href="#"
          className="inline-block px-6 py-2 text-sm font-light text-stone-600 border border-stone-300 rounded-full hover:bg-stone-50 hover:border-stone-400 transition-all duration-300"
        >
          Download
        </a>
      </div>
      <div className="mt-4 text-xs text-stone-400 font-light">
        PDF will be uploaded to Sanity
      </div>
    </div>
  </StaggerItem>
);

export function ResourcesContent() {
  return (
    <>
      {/* Page Header */}
      <PageHeader
        badge="Resources"
        title="Explore Our Premium Stone Catalogs"
        description="Browse comprehensive design collections, technical documentation, and specifications for all our quartz, granite, and ecosurface products."
      />

      {/* Quartz Curations Section */}
      <section className="bg-white border-b border-stone-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-stone-900">
              Quartz Curations
            </h2>
            <p className="mt-2 text-stone-500 font-light">
              Discover our signature engineered quartz collections with curated color palettes and comprehensive design guides.
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {quartz.map((item) => (
              <DownloadCardComponent key={item.title} item={item} />
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Indian Edition Section */}
      <section className="bg-stone-50 border-b border-stone-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-stone-900">
              Indian Edition
            </h2>
            <p className="mt-2 text-stone-500 font-light">
              Specially curated collections designed for the Indian market and regional preferences.
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {indian.map((item) => (
              <DownloadCardComponent key={item.title} item={item} />
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Technical Details Section */}
      <section className="bg-white border-b border-stone-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-stone-900">
              Technical Details
            </h2>
            <p className="mt-2 text-stone-500 font-light">
              Comprehensive technical specifications, care instructions, and sustainability documentation for architects, designers, and fabricators.
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {technical.map((item) => (
              <DownloadCardComponent key={item.title} item={item} />
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Granite Curations Section */}
      <section className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-stone-900">
              Granite Curations
            </h2>
            <p className="mt-2 text-stone-500 font-light">
              Natural stone collections with comprehensive catalogs, finishes, and specifications for every application.
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {granite.map((item) => (
              <DownloadCardComponent key={item.title} item={item} />
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-stone-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24 text-center">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-4">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="text-stone-400 font-light mb-8">
              Reach out to our team for specialized catalogs, custom specifications, or technical consultations.
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-white text-stone-950 rounded-xl font-light tracking-wide hover:bg-stone-100 transition-colors duration-300"
            >
              Contact Us
            </a>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
