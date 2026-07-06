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

// Group by collection name + productType for visible products
const rows = await c.fetch(`
  *[_type=="product" && visible != false] {
    "collection": collection->name,
    productType
  } | order(collection asc)
`);

const tally = {};
for (const r of rows) {
  const key = `${r.collection ?? "(no collection)"} | productType=${r.productType ?? "(none)"}`;
  tally[key] = (tally[key] ?? 0) + 1;
}
console.log("Collection x productType counts:");
for (const [k,v] of Object.entries(tally).sort()) console.log(`  ${v.toString().padStart(4)}  ${k}`);
