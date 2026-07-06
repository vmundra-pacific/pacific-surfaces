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

const rows = await c.fetch(`*[_type=="product" && collection._ref=="collection-stone-finishes"]{_id, "mainAlt": mainImage.alt, "galleryAlts": gallery[].alt}`);
console.log("Products to update:", rows.length);

const RX = /Pacific Surfaces Facades and Finishes/g;
const REP = "Pacific Surfaces Beyond Finish";

let mainCount = 0, galleryCount = 0;
const tx = c.transaction();
for (const r of rows) {
  const newMain = (r.mainAlt || "").replace(RX, REP);
  const patches = {};
  if (newMain !== r.mainAlt) {
    patches["mainImage.alt"] = newMain;
    mainCount++;
  }
  // For gallery, rebuild via patch on each item
  if (Array.isArray(r.galleryAlts) && r.galleryAlts.length > 0) {
    const updated = r.galleryAlts.map(a => (a || "").replace(RX, REP));
    const changed = updated.some((nv, i) => nv !== r.galleryAlts[i]);
    if (changed) {
      // Patch each gallery item's alt by index path
      const gpatch = c.patch(r._id);
      gpatch.set({ "mainImage.alt": newMain });
      for (let i = 0; i < updated.length; i++) {
        if (updated[i] !== r.galleryAlts[i]) {
          gpatch.set({ [`gallery[${i}].alt`]: updated[i] });
          galleryCount++;
        }
      }
      tx.patch(gpatch);
      continue;
    }
  }
  // Only main alt to update
  if (newMain !== r.mainAlt) {
    tx.patch(c.patch(r._id).set({ "mainImage.alt": newMain }));
  }
}
await tx.commit();
console.log("Main alts updated:", mainCount);
console.log("Gallery alts updated:", galleryCount);
