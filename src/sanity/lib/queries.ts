import { groq } from "next-sanity";

// Catalogue page — lightweight projection for filter UI
export const catalogueProductsQuery = groq`
  *[_type == "product"] | order(name asc) {
    _id,
    name,
    slug,
    "mainImage": mainImage.asset->url,
    "collectionName": collection->name,
    finishes,
    thickness,
    ribbons,
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
    "relatedProducts": coalesce(
      *[_type == "product" && collection._ref == ^.collection._ref && _id != ^._id][0...12] {
        _id, name, slug, "mainImage": mainImage.asset->url, price,
        "collectionName": collection->name,
        "categoryName": category->name
      },
      []
    ),
    "allOtherProducts": *[_type == "product" && _id != ^._id] | order(name asc) {
      _id, name, slug, "mainImage": mainImage.asset->url, price,
      "categoryName": category->name,
      "collectionName": collection->name
    }
  }
`;

export const productsByCollectionQuery = groq`
  *[_type == "product" && collection._ref in *[_type == "collection" && slug.current == $slug]._id] | order(name asc) {
    _id,
    name,
    slug,
    "mainImage": mainImage.asset->url,
    price,
    ribbons,
    collection->{_id, name, slug}
  }
`;

// Collections
export const allCollectionsQuery = groq`
  *[_type == "collection"] | order(order asc) {
    _id,
    name,
    slug,
    description,
    "image": image.asset->url,
    "productCount": count(*[_type == "product" && collection._ref == ^._id])
  }
`;

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

// Pages (for static pages like About, Contact, etc.)
export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    body,
    seoTitle,
    seoDescription
  }
`;

// Collections for homepage showcase (includes homepage-specific fields)
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
    "productCount": count(*[_type == "product" && collection._ref == ^._id])
  }
`;

// Signature Projects
export const signatureProjectsQuery = groq`
  *[_type == "signatureProject"] | order(order asc) {
    _id,
    name,
    location,
    "image": image.asset->url,
    link
  }
`;

// Application Cards
export const applicationCardsQuery = groq`
  *[_type == "applicationCard"] | order(order asc) {
    _id,
    label,
    title,
    description,
    "image": image.asset->url,
    link
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
export const allDealersQuery = groq`
  *[_type == "dealer"] | order(name asc) {
    _id,
    name,
    type,
    address,
    city,
    country,
    phone,
    email,
    website,
    description,
    mapPin,
    featured
  }
`;

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

// Site Settings
export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    title,
    description,
    logo,
    "logoUrl": logo.asset->url,
    socialLinks,
    contactInfo
  }
`;
