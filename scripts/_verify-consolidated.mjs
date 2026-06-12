import { createClient } from "@sanity/client";
import fs from "node:fs";
const env = {};
for (const l of fs.readFileSync(".env.local","utf-8").split(/\r?\n/)) {
  if(!l||l.startsWith("#"))continue;
  const i=l.indexOf("=");if(i<0)continue;
  let v=l.slice(i+1).trim();
  if(v.startsWith('"')&&v.endsWith('"'))v=v.slice(1,-1);
  env[l.slice(0,i).trim()]=v;
}
const c=createClient({projectId:env.NEXT_PUBLIC_SANITY_PROJECT_ID,dataset:env.NEXT_PUBLIC_SANITY_DATASET,apiVersion:env.NEXT_PUBLIC_SANITY_API_VERSION||"2026-03-28",token:env.SANITY_API_WRITE_TOKEN,useCdn:false});
const rows = await c.fetch(`*[_type=="product" && collection._ref=="collection-stone-finishes"] | order(name asc){
  name, productType,
  "mainAlt": mainImage.alt,
  "hasMain": defined(mainImage.asset),
  "galleryCount": count(gallery),
  "galleryAlts": gallery[].alt
}`);
console.log("Total products:", rows.length);
console.log("All granite-finish:", rows.every(r => r.productType === "granite-finish"));
console.log("All have main image:", rows.every(r => r.hasMain));
console.log("All have main alt:", rows.every(r => r.mainAlt && r.mainAlt.length > 0));
console.log("Total gallery images:", rows.reduce((s,r) => s + (r.galleryCount||0), 0));
console.log("\nPer-family breakdown:");
for (const r of rows) {
  console.log(`  ${r.name}: main + ${r.galleryCount || 0} gallery`);
}
console.log("\nSample alts (Velvet Design):");
const v = rows.find(r => r.name === "Velvet Design");
if (v) {
  console.log("  main:", v.mainAlt);
  for (const a of v.galleryAlts || []) console.log("  gal :", a);
}
