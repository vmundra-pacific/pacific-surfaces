"use client";

import {
  SpaceColours,
  SpaceCrumbs,
  SpaceDesign,
  SpaceFaqs,
  SpaceGallery,
  SpaceHero,
  SpaceOthers,
  SpaceTabs,
  Split,
  type SpaceCard,
  type SpaceColour,
  type SpaceShot,
  type SpaceTab,
} from "@/components/sections/spaces/SpaceBlocks";

/**
 * A "<Space> by Pacific Surfaces" page in the kitchens page's running order
 * (KitchensPage): hero, five reasons in tabs, the space's applications,
 * planning, a tabbed gallery, popular colours, the catalogue, FAQ and the
 * other spaces. Each page passes its copy and media as one object; the
 * colours come from Sanity through the page.
 */

export interface SpacePageData {
  /** The last breadcrumb: "Hotels", "Bathrooms". */
  crumb: string;
  tabsLabel: string;
  idPrefix: string;
  hero: { title: string; lead: string; image: string; alt: string };
  tabs: SpaceTab[];
  design: { heading: string; body: string[]; cards: SpaceCard[] };
  plan: { heading: string; body: string; cta: { label: string; href: string }; image: string; alt: string };
  gallery: { heading: string; tags: string[]; shots: SpaceShot[] };
  colours: { heading: string; cta: { label: string; href: string }; slugs: string[] };
  catalogue: { heading: string; body: string; cta: { label: string; href: string }; image: string; alt: string };
  faqHeading: string;
  faqs: { question: string; answer: string }[];
  spaces: { heading: string; cards: SpaceCard[] };
}

export default function SpaceLanding({ page, colours }: { page: SpacePageData; colours: SpaceColour[] }) {
  return (
    <>
      <SpaceHero {...page.hero} />
      <SpaceCrumbs label={page.crumb} />
      <SpaceTabs tabs={page.tabs} label={page.tabsLabel} idPrefix={page.idPrefix} />
      <SpaceDesign {...page.design} />
      <Split {...page.plan} />
      <SpaceGallery heading={page.gallery.heading} tags={page.gallery.tags} shots={page.gallery.shots} />
      <SpaceColours heading={page.colours.heading} cta={page.colours.cta} colours={colours} />
      <Split {...page.catalogue} />
      <SpaceFaqs heading={page.faqHeading} faqs={page.faqs} />
      <SpaceOthers {...page.spaces} />
    </>
  );
}
