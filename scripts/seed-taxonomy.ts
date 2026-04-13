/**
 * Seed: Blog categories, resource categories, and authors
 * Run: npx tsx scripts/seed-taxonomy.ts
 */
import { pushToSanity, slug } from "./lib/sanity-import.js"

// ─── Blog Categories (12) ───
const blogCategories = [
  { _id: "blogcat-sb553", _type: "blogCategory", title: "SB 553 Compliance", slug: slug("sb-553-compliance") },
  { _id: "blogcat-calosha", _type: "blogCategory", title: "Cal/OSHA Enforcement", slug: slug("cal-osha-enforcement") },
  { _id: "blogcat-fedosha", _type: "blogCategory", title: "Federal OSHA", slug: slug("federal-osha") },
  { _id: "blogcat-wvp", _type: "blogCategory", title: "Workplace Violence Prevention", slug: slug("workplace-violence-prevention") },
  { _id: "blogcat-hipaa", _type: "blogCategory", title: "Healthcare & HIPAA", slug: slug("healthcare-hipaa") },
  { _id: "blogcat-subcontractor", _type: "blogCategory", title: "Subcontractor Risk", slug: slug("subcontractor-risk") },
  { _id: "blogcat-municipal", _type: "blogCategory", title: "Municipal Compliance", slug: slug("municipal-compliance") },
  { _id: "blogcat-industry", _type: "blogCategory", title: "Industry Insights", slug: slug("industry-insights") },
  { _id: "blogcat-penalties", _type: "blogCategory", title: "Penalty Analysis", slug: slug("penalty-analysis") },
  { _id: "blogcat-training", _type: "blogCategory", title: "Training & Certification", slug: slug("training-certification") },
  { _id: "blogcat-regupdates", _type: "blogCategory", title: "Regulatory Updates", slug: slug("regulatory-updates") },
  { _id: "blogcat-stateguides", _type: "blogCategory", title: "State Compliance Guides", slug: slug("state-compliance-guides") },
]

// ─── Resource Categories (7) ───
const resourceCategories = [
  { _id: "rescat-guides", _type: "resourceCategory", title: "Compliance Guides", slug: slug("compliance-guides"), description: "Step-by-step guides for meeting compliance requirements" },
  { _id: "rescat-templates", _type: "resourceCategory", title: "Templates & Forms", slug: slug("templates-forms"), description: "Ready-to-use compliance document templates" },
  { _id: "rescat-checklists", _type: "resourceCategory", title: "Checklists", slug: slug("checklists"), description: "Actionable compliance checklists" },
  { _id: "rescat-playbooks", _type: "resourceCategory", title: "Industry Playbooks", slug: slug("industry-playbooks"), description: "Vertical-specific compliance playbooks" },
  { _id: "rescat-penalties", _type: "resourceCategory", title: "Penalty Reports", slug: slug("penalty-reports"), description: "Enforcement data and penalty analysis" },
  { _id: "rescat-briefings", _type: "resourceCategory", title: "Regulatory Briefings", slug: slug("regulatory-briefings"), description: "Current regulatory intelligence and updates" },
  { _id: "rescat-assessments", _type: "resourceCategory", title: "Assessment Tools", slug: slug("assessment-tools"), description: "Self-assessment and scoring tools" },
]

// ─── Help Categories (5) ───
const helpCategories = [
  { _id: "helpcat-getting-started", _type: "helpCategory", title: "Getting Started", slug: slug("getting-started"), icon: "rocket" },
  { _id: "helpcat-compliance-plans", _type: "helpCategory", title: "Compliance Plans", slug: slug("compliance-plans"), icon: "clipboard" },
  { _id: "helpcat-training", _type: "helpCategory", title: "Training", slug: slug("training"), icon: "graduation-cap" },
  { _id: "helpcat-incidents", _type: "helpCategory", title: "Incidents", slug: slug("incidents"), icon: "alert-triangle" },
  { _id: "helpcat-documents", _type: "helpCategory", title: "Documents", slug: slug("documents"), icon: "file-text" },
]

// ─── Blog Authors (2) ───
const authors = [
  {
    _id: "author-compliance-team",
    _type: "blogAuthor",
    name: "Protekon Compliance Team",
    slug: slug("protekon-compliance-team"),
    bio: [
      {
        _type: "block",
        _key: "bio1",
        style: "normal",
        children: [{ _type: "span", _key: "s1", text: "The Protekon Compliance Team monitors regulatory changes, enforcement trends, and industry best practices across all 50 states. Our analysts combine Cal/OSHA enforcement data with on-the-ground compliance experience to deliver actionable intelligence for high-risk industries." }],
      },
    ],
  },
  {
    _id: "author-enforcement-desk",
    _type: "blogAuthor",
    name: "Protekon Enforcement Desk",
    slug: slug("protekon-enforcement-desk"),
    bio: [
      {
        _type: "block",
        _key: "bio2",
        style: "normal",
        children: [{ _type: "span", _key: "s2", text: "The Protekon Enforcement Desk tracks OSHA citations, penalties, and inspection patterns in real time. We analyze enforcement data to identify trends, quantify risk, and alert employers before violations escalate." }],
      },
    ],
  },
]

async function seed() {
  console.log("Seeding taxonomy...")
  await pushToSanity(blogCategories, "Blog Categories")
  await pushToSanity(resourceCategories, "Resource Categories")
  await pushToSanity(helpCategories, "Help Categories")
  await pushToSanity(authors, "Authors")
  console.log("\n✅ Taxonomy seeded: 12 blog categories, 7 resource categories, 5 help categories, 2 authors")
}

seed().catch((err) => {
  console.error("Fatal:", err)
  process.exit(1)
})
