import { groq } from "next-sanity";

// Space page — fetches the four feature-section images for a single
// /spaces/<slug> page (Kitchens, Bathrooms, Architecture, Commercial).
// Returns null when the editor hasn't created a doc for that space
// yet — the page falls back to gradient placeholders in that case.
export const spacePageBySlugQuery = groq`
  *[_type == "spacePage" && slug == $slug][0] {
    "section1Image": section1Image.asset->url,
    "section2Image": section2Image.asset->url,
    "section3Image": section3Image.asset->url,
    "section4Image": section4Image.asset->url
  }
`;

// Learn topic — fetches the four body-section images for any
// /learn/<slug> page (what-is-<product>, maintenance-<product>,
// warranty-quartz). Returns null when no doc exists; sections fall
// back to gradient placeholders.
export const learnTopicBySlugQuery = groq`
  *[_type == "learnTopic" && slug == $slug][0] {
    "section1Image": section1Image.asset->url,
    "section2Image": section2Image.asset->url,
    "section3Image": section3Image.asset->url,
    "section4Image": section4Image.asset->url
  }
`;

// Catalogue page — lightweight projection for filter UI.
//
// `dominantColor` pulls Sanity's auto-computed palette so the hue
// filter can tag products by the slab's actual photographic colour
// rather than guessing from its name. Falls back to keyword-derivation
// in mapSanityToCatalogue when the palette is missing (older assets
// uploaded before metadata extraction was enabled).
export const catalogueProductsQuery = groq`
  *[_type == "product"] | order(name asc) {
    _id,
    name,
    slug,
    "mainImage": mainImage.asset->url,
    "gallery": gallery[].asset->url,
    "dominantColor": mainImage.asset->metadata.palette.dominant.background,
    "collectionName": collection->name,
    productType,
    finishes,
    thickness,
    ribbons,
    manualHues,
    manualPattern,
    visible
  }
`;

/**
 * Catalogue projection scoped to a collection slug + optional
 * productType. Same shape as catalogueProductsQuery so the result
 * plugs into mapSanityToCatalogue / CatalogueClient unchanged, but
 * filters down to:
 *   - products in the named collection
 *   - PLUS (when productType is non-null) every product of that type
 *     regardless of which sub-collection they're filed under.
 *
 * Used by /products/[slug]/[item]/page.tsx so category pages
 * (/products/quartz/quartz, /products/granite/granite, …) render the
 * full filter UI from the old /products catalogue, with their content
 * pre-scoped to the right product family.
 */
export const catalogueProductsByCollectionOrTypeQuery = groq`
  *[_type == "product" && (
    collection._ref in *[_type == "collection" && slug.current == $slug]._id
    || ($productType != null && productType == $productType)
  )] | order(name asc) {
    _id,
    name,
    slug,
    "mainImage": mainImage.asset->url,
    "gallery": gallery[].asset->url,
    "dominantColor": mainImage.asset->metadata.palette.dominant.background,
    "collectionName": collection->name,
    finishes,
    thickness,
    ribbons,
    manualHues,
    manualPattern,
    visible
  }
`;

// Products
export const allProductsQuery = groq`
  *[_type == "product"] | order(name asc) {
    _id,
    name,
    slug,
    description,
    "mainImage": mainImage.asset->url,
    "gallery": gallery[].asset->url,
    price,
    category->{_id, name, slug},
    collection->{_id, name, slug},
    finishes,
    thickness,
    size,
    application,
    ribbons,
    seoTitle,
    seoDescription,
    seoKeywords,
    visible
  }
`;

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    description,
    "mainImage": mainImage.asset->url,
    "gallery": gallery[].asset->url,
    "roomScenes": roomScenes[].asset->url,
    "hdFileUrl": hdFile.asset->url,
    "specSheetUrl": specSheet.asset->url,
    price,
    category->{_id, name, slug},
    collection->{_id, name, slug},
    productType,
    finishes,
    thickness,
    size,
    application,
    careAndMaintenance,
    ribbons,
    seoTitle,
    seoDescription,
    seoKeywords,
    visible,
    manualHues,
    "relatedProducts": coalesce(
      *[_type == "product" && collection._ref == ^.collection._ref && _id != ^._id][0...12] {
        _id, name, slug, "mainImage": mainImage.asset->url, price,
        "collectionName": collection->name,
        "categoryName": category->name,
        manualHues
      },
      []
    ),
    "allOtherProducts": *[_type == "product" && _id != ^._id] | order(name asc) {
      _id, name, slug, "mainImage": mainImage.asset->url, price,
      "categoryName": category->name,
      "collectionName": collection->name,
      manualHues
    }
  }
`;

// Collections
export const collectionBySlugQuery = groq`
  *[_type == "collection" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    description,
    "image": image.asset->url,
    seoTitle,
    seoDescription
  }
`;

// Blog
export const allBlogPostsQuery = groq`
  *[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    "mainImage": mainImage.asset->url,
    publishedAt,
    minutesToRead,
    author,
    categories
  }
`;

export const blogPostBySlugQuery = groq`
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    body,
    excerpt,
    "mainImage": mainImage.asset->url,
    publishedAt,
    minutesToRead,
    author,
    categories,
    seoTitle,
    seoDescription
  }
`;

// Collections for homepage showcase (includes homepage-specific fields).
//
// productCount is the number of products that should be considered
// "in" this collection on the homepage carousel. For category-level
// collections (Quartz, Granite, Semi-Precious Stones, Sinks/Integra) we
// AGGREGATE: count every product whose collection._ref points at
// this collection PLUS every product of the matching productType
// (e.g. a Kosmic-collection product with productType "quartz-slab"
// is counted toward the Quartz category card). Sub-collections fall
// through to the simple collection-ref count.
//
// Keep this category map in sync with CATEGORY_PRODUCT_TYPE in
// src/app/(site)/products/[slug]/[item]/page.tsx — both should agree
// on which slugs trigger which productType expansion.
export const homepageCollectionsQuery = groq`
  *[_type == "collection"] | order(order asc) {
    _id,
    name,
    slug,
    "image": image.asset->url,
    tag,
    headline,
    finishCount,
    showcaseLayout,
    "productCount": count(*[_type == "product" && (
      collection._ref == ^._id ||
      (^.slug.current == "quartz" && productType == "quartz-slab") ||
      (^.slug.current == "granite" && productType == "granite-slab") ||
      ((^.slug.current == "semi-precious" || ^.slug.current == "semi-precious-stones" || ^.slug.current == "semiprecious") && productType == "semi-precious") ||
      ((^.slug.current == "integra" || ^.slug.current == "sinks") && productType == "quartz-sink")
    )])
  }
`;

// Signature Projects
//
// `videoUrl` resolves to whichever source is set, with the direct
// upload winning over the manual URL string. Component sees a
// single field; editors choose the workflow that fits.
//
// `order` is projected so the component can place each project
// into a specific card slot (1–5) on the homepage grid. See
// SignatureProjects.tsx for slot semantics.
export const signatureProjectsQuery = groq`
  *[_type == "signatureProject"] | order(order asc) {
    _id,
    name,
    location,
    "image": image.asset->url,
    "imageLqip": image.asset->metadata.lqip,
    "videoUrl": coalesce(videoFile.asset->url, videoUrl),
    link,
    order
  }
`;

// Application Cards
//
// `videoUrl` resolves to whichever source is set, with the direct
// upload taking precedence over the URL string. The component sees
// one field; editors get to pick the workflow that suits them.
//
// `section` is the explicit homepage-section binding when set;
// the component prefers this over label-substring matching.
export const applicationCardsQuery = groq`
  *[_type == "applicationCard"] | order(order asc) {
    _id,
    label,
    section,
    order,
    "videoUrl": coalesce(videoFile.asset->url, videoUrl),
    title,
    description,
    "image": image.asset->url,
    link,
    "frames": frames[]{
      label,
      "videoUrl": coalesce(videoFile.asset->url, videoUrl),
      "image": image.asset->url
    }
  }
`;

// Inspiration Images
export const inspirationImagesQuery = groq`
  *[_type == "inspirationImage"] | order(order asc) {
    _id,
    name,
    category,
    "image": image.asset->url,
    "productSlug": product->slug.current
  }
`;

// Dealers
export const featuredDealersQuery = groq`
  *[_type == "dealer" && featured == true] | order(name asc) {
    _id,
    name,
    type,
    address,
    city,
    description,
    phone,
    mapPin
  }
`;

/**
 * Every dealer in Sanity, projected with the full detail set the
 * /contact "Find A Dealer" pincode search renders into cards.
 * Order is city → name so the result list reads naturally when
 * multiple dealers share a pincode area.
 */
export const allDealersQuery = groq`
  *[_type == "dealer"] | order(city asc, name asc) {
    _id,
    name,
    type,
    address,
    city,
    pincode,
    country,
    phone,
    email,
    website,
    description
  }
`;

// Resources — downloadable PDFs grouped by category for /resources page
export const allResourcesQuery = groq`
  *[_type == "resource" && visible == true] | order(category asc, order asc, title asc) {
    _id,
    title,
    category,
    description,
    "thumbnail": thumbnail.asset->url,
    "pdfUrl": pdfFile.asset->url,
    "pdfName": pdfFile.asset->originalFilename,
    order
  }
`;

// Careers — page-level copy (singleton).
//
// Returns null when the careersPage document hasn't been created
// yet, so the component should always have sensible defaults
// hardcoded as a fallback.
export const careersPageQuery = groq`
  *[_type == "careersPage"][0] {
    heroEyebrow,
    heroHeadline,
    heroDescription,
    "heroImage": heroImage.asset->url,
    heroVideoUrl,
    values[]{
      title,
      description
    },
    openPositionsHeading,
    openPositionsDescription,
    applyHeading,
    applyDescription,
    ctaHeading,
    ctaDescription
  }
`;

// Job Openings — sorted by display order then title, filtered to
// visible only. The page builds the Job Title and Location
// dropdowns from this list at render time, so adding a new
// opening in Studio automatically extends the dropdowns.
export const jobOpeningsQuery = groq`
  *[_type == "jobOpening" && visible == true] | order(coalesce(order, 999), title asc) {
    _id,
    title,
    location,
    department,
    description
  }
`;

// Sustainability — singleton with all editor-managed copy.
// Returns null when not yet created; the component falls back to
// hardcoded defaults so the page never breaks.
export const sustainabilityPageQuery = groq`
  *[_type == "sustainabilityPage"][0] {
    heroEyebrow,
    heroHeadline,
    heroBody,
    "heroImage": heroImage.asset->url,
    heroVideoUrl,
    initiatives[]{
      title,
      description,
      "image": image.asset->url
    },
    ecosurfacesEyebrow,
    ecosurfacesHeadline,
    ecosurfacesDescription,
    ecosurfacesLink,
    "ecosurfacesImage": ecosurfacesImage.asset->url,
    ecosurfacesVideoUrl,
    pillarsHeadline,
    pillars,
    greenEyebrow,
    greenHeadline,
    greenBody,
    "greenImage": greenImage.asset->url,
    greenVideoUrl,
    sdgsHeadline,
    sdgsIntro,
    sdgs[]{
      title,
      description
    },
    ctaHeadline,
    ctaDescription,
    ctaButtonLabel,
    ctaButtonHref,
    "ctaImage": ctaImage.asset->url
  }
`;

// Beyond Finish — page-level copy (singleton).
//
// Returns null when the document hasn't been created yet, so the
// component falls back to hardcoded defaults.
export const facadesAndFinishesPageQuery = groq`
  *[_type == "facadesAndFinishesPage"][0] {
    heroEyebrow,
    heroHeadline,
    heroDescription,
    "heroImage": heroImage.asset->url,
    heroVideoUrl,
    "introLeftImage": introLeftImage.asset->url,
    introLeftVideoUrl,
    "introRightImage": introRightImage.asset->url,
    introRightImageUrl,
    introRightVideoUrl,
    introSubheading,
    introBody,
    featuresEyebrow,
    featuresHeadline,
    features[]{
      title,
      body
    },
    gridEyebrow,
    gridHeadline,
    gridDescription,
    collectionSlug
  }
`;

// Beyond Finish — products in a named Collection.
//
// Pulls every product whose `collection` reference points at the
// collection with slug $slug. Each card shows the product's name +
// mainImage; the lightbox shows the same image at full resolution.
// Editors add a finish by creating a Product in Studio, uploading
// its mainImage, and assigning the collection.
export const facadesAndFinishesProductsQuery = groq`
  *[_type == "product" &&
    visible != false &&
    collection._ref in *[_type == "collection" && slug.current == $slug]._id
  ] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    "mainImage": mainImage.asset->url,
    "fullImage": mainImage.asset->url + "?w=2400&fit=max&auto=format",
    finishes,
    description
  }
`;
