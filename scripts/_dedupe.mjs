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

// Find all Lineal Extreme Dark Design products
const dupes = await c.fetch(`*[_type=="product" && collection._ref=="collection-stone-finishes" && name=="Lineal Extreme Dark Design"] | order(_createdAt asc){_id, _createdAt, "gallery": count(gallery)}`);
console.log("Found:", dupes.length);
for (const d of dupes) console.log(" -", d._id, "created:", d._createdAt, "gallery:", d.gallery);

if (dupes.length > 1) {
  // Keep the first (oldest), delete the rest
  const toDelete = dupes.slice(1).map(d => d._id);
  console.log("Deleting:", toDelete);
  const tx = c.transaction();
  for (const id of toDelete) tx.delete(id);
  await tx.commit();
  console.log("Deleted", toDelete.length);
}
