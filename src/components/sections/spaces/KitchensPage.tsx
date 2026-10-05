"use client";

import { KITCHENS_PAGE } from "@/data/kitchens-page";
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
  type SpaceColour,
} from "@/components/sections/spaces/SpaceBlocks";

/**
 * /spaces/kitchens, laid out after cosentino.com/kitchens. Copy and media
 * live in data/kitchens-page.ts; the popular colours arrive from Sanity
 * through the page. The blocks are shared with the other space pages
 * (components/sections/spaces/SpaceBlocks).
 */

export type KitchenColour = SpaceColour;

export default function KitchensPage({ colours }: { colours: KitchenColour[] }) {
  const k = KITCHENS_PAGE;
  return (
    <>
      <SpaceHero {...k.hero} />
      <SpaceCrumbs label="Kitchens" />
      <SpaceTabs tabs={k.tabs} label="Why Pacific Surfaces for the kitchen" idPrefix="kitchen" />
      <SpaceDesign {...k.design} />
      <Split {...k.plan} />
      <SpaceGallery heading={k.gallery.heading} tags={k.gallery.tags} shots={k.gallery.shots} />
      <SpaceColours heading={k.colours.heading} cta={k.colours.cta} colours={colours} />
      <Split {...k.catalogue} />
      <SpaceFaqs heading="Frequently asked questions about kitchens" faqs={k.faqs} />
      <SpaceOthers {...k.spaces} />
    </>
  );
}
