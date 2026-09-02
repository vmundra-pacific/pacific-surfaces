/**
 * Which products the store sells.
 *
 * The store is launching with a deliberately small range rather than
 * the whole 300-slab catalogue: fewer products to price, quote and
 * arrange freight for while the ordering flow is proved out. Everything
 * else stays browsable at /products, which is unaffected.
 *
 * Slugs are matched against the product's Sanity slug. Add a slug here
 * to put a product in the store; remove one to pull it. Setting this to
 * an empty array opens the store to the entire catalogue.
 */
export const STORE_PRODUCT_SLUGS: string[] = [
  "ruskin-5028",
  "adonis-5059",
  "stellar-ember-5031",
];

/** True when this product is offered in the store. */
export function isInStore(slug: string): boolean {
  if (STORE_PRODUCT_SLUGS.length === 0) return true;
  return STORE_PRODUCT_SLUGS.includes(slug);
}
