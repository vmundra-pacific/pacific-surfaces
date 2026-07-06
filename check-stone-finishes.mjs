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
const rows = await c.fetch(`*[_type=="product" && collection._ref=="collection-stone-finishes"]{_id,name}`);
console.log("count:", rows.length);
for(const r of rows) console.log("  -", r.name, r._id);
