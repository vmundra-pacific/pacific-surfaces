import { createClient } from "@sanity/client";
import fs from "node:fs";

const env = {};
for (const l of fs.readFileSync(".env.local", "utf-8").split(/\r?\n/)) {
  if (!l || l.startsWith("#")) continue;
  const i = l.indexOf("=");
  if (i < 0) continue;
  let v = l.slice(i + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  env[l.slice(0, i).trim()] = v;
}

const c = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-03-28",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const id = (t, c) => "jobOpening-" + [t, c].join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const cities7 = ["Pune", "Ahmedabad", "Mumbai", "Hyderabad", "Kolkata", "Bangalore", "Delhi"];

const regionalResp = (region, citiesCSV) => [
  `Own revenue, market share, and pipeline across ${citiesCSV}.`,
  `Build and lead a team of City Sales Managers across the ${region} region.`,
  "Develop and grow dealer, fabricator, and distributor relationships in the region.",
  "Build a specifier network with leading architects, interior designers, and project consultants.",
  "Forecast monthly demand and partner with supply chain to fulfil regional orders.",
];

const roles = [
  {
    title: "National Sales Head", cities: ["Bangalore"], department: "Sales", experience: "10+ years", order: 1,
    description: "Lead Pacific Surfaces' national sales strategy across India. Drive revenue growth, build and mentor a high-performing regional sales team, and own commercial outcomes for our quartz, granite, and engineered-surface portfolio.",
    responsibilities: [
      "Own the national sales P&L and quarterly revenue targets across all India regions.",
      "Build, mentor, and lead the Regional Sales Director team across South, West, North, and East.",
      "Develop and execute go-to-market strategy for new collections, channels, and product lines.",
      "Drive key-account engagement with marquee architects, designers, builders, and large fabricator networks.",
      "Partner with marketing, supply chain, and operations to align demand with production capacity.",
    ],
  },
  {
    title: "HR Head", cities: ["Hosur"], department: "Human Resources", experience: "10+ years", order: 2,
    description: "Own the people strategy for Pacific Surfaces' 378,000 sq ft manufacturing facility and corporate functions. Lead talent acquisition, employee experience, performance management, and organizational development across the group.",
    responsibilities: [
      "Lead the end-to-end HR function for the Hosur manufacturing facility and corporate office.",
      "Own talent acquisition strategy for both factory floor and corporate hiring at scale.",
      "Drive performance management, succession planning, and leadership development programs.",
      "Champion employee engagement, safety culture, and statutory / labour-law compliance.",
      "Partner with senior leadership on organisation design, total rewards, and HR transformation.",
    ],
  },
  {
    title: "VP Marketing", cities: ["Bangalore"], department: "Marketing", experience: "7+ years", order: 3,
    description: "Lead Pacific Surfaces' brand, digital, and product marketing. Drive demand generation, manage the marketing team, and shape how architects, designers, and end-customers discover and engage with our premium surfaces.",
    responsibilities: [
      "Own the brand narrative, visual identity, and positioning of Pacific Surfaces across all channels.",
      "Lead integrated demand-generation campaigns across digital, ATL, BTL, events, and trade shows.",
      "Manage product marketing for new collection launches and category extensions.",
      "Build and lead a cross-functional marketing team spanning content, performance, and design.",
      "Own marketing analytics, attribution, and ROI reporting to the leadership team.",
    ],
  },
  {
    title: "Corporate HR Manager", cities: ["Bangalore"], department: "Human Resources", experience: "5+ years", order: 4,
    description: "Partner with corporate functions to deliver HR business partnering, talent acquisition, and employee engagement initiatives. Support policy rollout and operational HR across Pacific Surfaces' Bangalore corporate office.",
    responsibilities: [
      "Act as HR business partner to corporate function leaders across Sales, Marketing, and BD.",
      "Drive recruitment for corporate roles end-to-end, from sourcing to onboarding.",
      "Roll out HR policies, employee handbook updates, and statutory communications.",
      "Lead engagement, recognition, and culture-building initiatives for the Bangalore office.",
      "Maintain accurate HRIS records, payroll inputs, and audit-ready documentation.",
    ],
  },
  {
    title: "Regional Sales Director - South", cities: ["Bangalore"], department: "Sales", experience: "7+ years", order: 10,
    description: "Own Pacific Surfaces' commercial outcomes across South India. Build and lead a city-level sales team, develop dealer / fabricator partnerships, and grow share of voice with architects and specifiers in the region.",
    responsibilities: regionalResp("South", "Bangalore, Chennai, Hyderabad, and Kochi"),
  },
  {
    title: "Regional Sales Director - West", cities: ["Mumbai"], department: "Sales", experience: "7+ years", order: 11,
    description: "Own Pacific Surfaces' commercial outcomes across West India. Build and lead a city-level sales team, develop dealer / fabricator partnerships, and grow share of voice with architects and specifiers in the region.",
    responsibilities: regionalResp("West", "Mumbai, Pune, Ahmedabad, and Surat"),
  },
  {
    title: "Regional Sales Director - North", cities: ["Delhi"], department: "Sales", experience: "7+ years", order: 12,
    description: "Own Pacific Surfaces' commercial outcomes across North India. Build and lead a city-level sales team, develop dealer / fabricator partnerships, and grow share of voice with architects and specifiers in the region.",
    responsibilities: regionalResp("North", "Delhi NCR, Chandigarh, Jaipur, and Lucknow"),
  },
  {
    title: "Regional Sales Director - East", cities: ["Kolkata"], department: "Sales", experience: "7+ years", order: 13,
    description: "Own Pacific Surfaces' commercial outcomes across East India. Build and lead a city-level sales team, develop dealer / fabricator partnerships, and grow share of voice with architects and specifiers in the region.",
    responsibilities: regionalResp("East", "Kolkata, Bhubaneswar, Guwahati, and Patna"),
  },
  {
    title: "City Sales Manager", cities: cities7, department: "Sales", experience: "2+ years", order: 20,
    description: "Drive Pacific Surfaces' growth in your city. Build and nurture relationships with dealers, fabricators, architects, and interior designers; own the local pipeline; and represent the brand to the design and construction community in your market.",
    responsibilities: [
      "Own the city-level sales pipeline, quarterly targets, and dealer activation plan.",
      "Build and maintain relationships with dealers, fabricators, and key project specifiers.",
      "Conduct architect and designer outreach - sample drops, mood boards, and project briefings.",
      "Coordinate sample dispatch, quotes, order tracking, and dealer training in your city.",
      "Report weekly pipeline movement, conversion ratios, and competitive intelligence.",
    ],
  },
  {
    title: "Management Trainee - Human Resources", cities: ["Bangalore"], department: "Human Resources", experience: "Fresher with MBA", order: 30,
    description: "Join Pacific Surfaces' HR team as a Management Trainee. Rotate through talent acquisition, employee engagement, learning and development, and HR operations under the mentorship of senior HR leaders. Ideal for MBA graduates from HR / OB specializations.",
    responsibilities: [
      "Rotate across talent acquisition, employee engagement, L&D, and HR operations over the program.",
      "Support sourcing, screening, and interview coordination for live corporate roles.",
      "Help design and roll out engagement, recognition, and culture-building initiatives.",
      "Assist with onboarding, policy communication, and HRIS data hygiene.",
      "Take ownership of small project deliverables to build end-to-end HR exposure.",
    ],
  },
  {
    title: "Management Trainee - Business Development", cities: cities7, department: "Business Development", experience: "Fresher with MBA", order: 31,
    description: "Join Pacific Surfaces' commercial team as a Management Trainee. Rotate across regional sales, dealer relationship management, project specification, and field marketing under the mentorship of senior commercial leaders. Ideal for MBA graduates from Sales / Marketing specializations.",
    responsibilities: [
      "Rotate across city sales, dealer development, project specification, and field marketing.",
      "Shadow City Sales Managers on dealer visits, architect meetings, and site walkthroughs.",
      "Build CRM hygiene, lead-list quality, and pipeline reporting discipline in your region.",
      "Support sample dispatch, quote follow-ups, and proposal preparation for live projects.",
      "Take ownership of a defined territory or account list by the end of the program.",
    ],
  },
];

const docs = [];
for (const r of roles) {
  for (const city of r.cities) {
    docs.push({
      _id: id(r.title, city),
      _type: "jobOpening",
      title: r.title,
      location: city,
      department: r.department,
      description: r.description,
      experience: r.experience,
      responsibilities: r.responsibilities,
      order: r.order,
      visible: true,
    });
  }
}

console.log("Upserting " + docs.length + " jobOpening documents...");
let written = 0;
for (const doc of docs) {
  try { await c.createOrReplace(doc); written++; console.log("  ok  " + doc._id); }
  catch (e) { console.error("  ERR " + doc._id + " - " + e.message); }
}
console.log("\nDone. " + written + "/" + docs.length + " written.");
