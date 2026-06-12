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
const rows = await c.fetch(`*[_type=="product" && collection._ref=="collection-stone-finishes"] | order(name asc){name, productType, "alt": mainImage.alt, "hasImage": defined(mainImage.asset)}`);
console.log("Total:", rows.length);
console.log("All have productType=granite-finish:", rows.every(r => r.productType === "granite-finish"));
console.log("All have main image:", rows.every(r => r.hasImage));
console.log("All have alt text:", rows.every(r => r.alt && r.alt.length > 0));
console.log("\n--- Sample (first 3) ---");
for (const r of rows.slice(0,3)) {
  console.log(`  ${r.name}`);
  console.log(`    alt: "${r.alt}"`);
}
console.log("\n--- Last 2 ---");
for (const r of rows.slice(-2)) {
  console.log(`  ${r.name}`);
  console.log(`    alt: "${r.alt}"`);
}
