import { groq } from "next-sanity";

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
    "relatedProducts": *[_type == "product" && collection._ref == ^.collection._ref && _id != ^._id][0...4] {
      _id, name, slug, "mainImage": mainImage.asset->url, price
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
