import { describe, it, expect } from "vitest"
import {
  getDocumentTemplate,
  getTemplatesForVertical,
  isValidTemplateId,
  getStarterDocuments,
  getRegisteredVerticals,
} from "@/lib/document-templates"

// Mirrors the slugs advertised in app/industries/industries-client.tsx.
// If the marketing list changes, update here too.
const ADVERTISED_INDUSTRIES = [
  "construction",
  "manufacturing",
  "healthcare",
  "hospitality",
  "logistics", // alias → wholesale
  "agriculture",
  "retail",
  "transportation",
  "real-estate",
  "auto-services",
  "wholesale",
  "utilities",
  "education",
  "waste_environmental",
  "arts_entertainment",
  "public_admin",
  "building_services",
  "equipment_repair",
  "facilities_mgmt",
  "information",
  "laundry",
  "mining",
  "professional_services",
  "staffing",
  "business_support",
  "personal_services",
  "security",
] as const

const NEW_TEMPLATE_IDS = [
  "electrical-safety-program",
  "ergonomics-program",
  "respiratory-protection-program",
  "hazwoper-program",
  "msha-mining-safety-program",
  "multi-employer-worksite-policy",
  "event-safety-crowd-management",
  "campus-safety-plan",
  "janitorial-chemical-safety",
  "drycleaning-solvent-safety",
  "salon-personal-services-safety",
] as const

// Specialized templates expected per industry (beyond the 9 platform-wide).
// Only lists what MUST be resolvable for that vertical; not exhaustive.
const REQUIRED_SPECIALIZED: Record<string, string[]> = {
  utilities: ["electrical-safety-program"],
  equipment_repair: ["electrical-safety-program", "loto-program"],
  building_services: ["electrical-safety-program", "fall-protection-plan", "janitorial-chemical-safety"],
  information: ["ergonomics-program", "electrical-safety-program"],
  facilities_mgmt: ["multi-employer-worksite-policy"],
  staffing: ["multi-employer-worksite-policy"],
  mining: ["msha-mining-safety-program"],
  waste_environmental: ["hazwoper-program", "respiratory-protection-program"],
  laundry: ["drycleaning-solvent-safety", "respiratory-protection-program"],
  arts_entertainment: ["event-safety-crowd-management"],
  education: ["campus-safety-plan"],
  public_admin: ["ergonomics-program"],
  personal_services: ["salon-personal-services-safety", "janitorial-chemical-safety"],
  professional_services: ["ergonomics-program"],
  business_support: ["ergonomics-program"],
  hospitality: ["hospitality-safety-program", "bbp-exposure-control", "event-safety-crowd-management"],
  construction: [
    "fall-protection-plan",
    "silica-exposure-control",
    "confined-space-program",
    "wildfire-smoke-protection",
    "electrical-safety-program",
    "respiratory-protection-program",
    "multi-employer-worksite-policy",
  ],
  manufacturing: [
    "loto-program",
    "machine-guarding",
    "confined-space-program",
    "pit-safety-program",
    "electrical-safety-program",
  ],
  healthcare: ["bbp-exposure-control", "hipaa-sra", "atd-plan", "baa-tracker", "ergonomics-program"],
  retail: ["store-safety-program", "pit-safety-program"],
  wholesale: ["pit-safety-program"],
  logistics: ["pit-safety-program"], // via alias
  agriculture: ["wildfire-smoke-protection", "pesticide-safety", "respiratory-protection-program"],
  transportation: ["fleet-safety-program"],
  "real-estate": ["property-compliance-program", "multi-employer-worksite-policy"],
  "auto-services": ["spray-booth-compliance", "respiratory-protection-program"],
  // security is correctly covered by platform-wide WVPP (SB 553) — no extras required
  security: [],
}

describe("document template coverage", () => {
  it("every advertised industry resolves ≥ 9 templates", () => {
    for (const slug of ADVERTISED_INDUSTRIES) {
      const templates = getTemplatesForVertical(slug)
      expect(templates.length, `vertical "${slug}" resolved ${templates.length} templates`).toBeGreaterThanOrEqual(9)
    }
  })

  it("every advertised industry except security has ≥ 10 templates (9 platform + ≥1 specialized)", () => {
    for (const slug of ADVERTISED_INDUSTRIES) {
      if (slug === "security") continue
      const templates = getTemplatesForVertical(slug)
      expect(templates.length, `vertical "${slug}" should have specialized templates`).toBeGreaterThanOrEqual(10)
    }
  })

  it("every expected specialized template resolves for its industry", () => {
    for (const [slug, expected] of Object.entries(REQUIRED_SPECIALIZED)) {
      for (const id of expected) {
        const template = getDocumentTemplate(slug, id)
        expect(template, `getDocumentTemplate("${slug}", "${id}") should resolve`).not.toBeNull()
        expect(template?.id).toBe(id)
      }
    }
  })

  it("every new template id passes isValidTemplateId", () => {
    for (const id of NEW_TEMPLATE_IDS) {
      expect(isValidTemplateId(id), `${id} should be valid`).toBe(true)
    }
  })

  it("logistics alias resolves to the same templates as wholesale", () => {
    const logistics = getTemplatesForVertical("logistics").map((t) => t.id).sort()
    const wholesale = getTemplatesForVertical("wholesale").map((t) => t.id).sort()
    expect(logistics).toEqual(wholesale)
  })

  it("every new template has ≥ 5 sections with ≥ 1 requiredReference each", () => {
    for (const id of NEW_TEMPLATE_IDS) {
      // Look it up via a vertical that registers it.
      const template =
        getDocumentTemplate("construction", id) ??
        getDocumentTemplate("utilities", id) ??
        getDocumentTemplate("mining", id) ??
        getDocumentTemplate("waste_environmental", id) ??
        getDocumentTemplate("information", id) ??
        getDocumentTemplate("laundry", id) ??
        getDocumentTemplate("personal_services", id) ??
        getDocumentTemplate("education", id) ??
        getDocumentTemplate("arts_entertainment", id) ??
        getDocumentTemplate("staffing", id) ??
        getDocumentTemplate("building_services", id)
      expect(template, `template ${id} should be resolvable`).not.toBeNull()
      if (!template) continue
      expect(template.sections.length, `${id} needs ≥ 5 sections`).toBeGreaterThanOrEqual(5)
      for (const section of template.sections) {
        expect(
          section.requiredReferences.length,
          `${id} section "${section.heading}" missing regulatory references`
        ).toBeGreaterThanOrEqual(1)
      }
      expect(template.retentionYears).toBeGreaterThanOrEqual(1)
      expect(template.requiredClientFields.length).toBeGreaterThanOrEqual(1)
      expect(template.disclaimer.length).toBeGreaterThan(20)
    }
  })

  it("getStarterDocuments produces a starter pack for every advertised industry", () => {
    for (const slug of ADVERTISED_INDUSTRIES) {
      const pack = getStarterDocuments(slug, "professional")
      expect(pack.length, `${slug} starter pack should be non-empty`).toBeGreaterThan(0)
      expect(new Set(pack).size, `${slug} starter pack has duplicates`).toBe(pack.length)
    }
  })

  it("getRegisteredVerticals includes the newly added buckets", () => {
    const registered = getRegisteredVerticals()
    const expected = [
      "utilities",
      "equipment_repair",
      "building_services",
      "information",
      "facilities_mgmt",
      "staffing",
      "mining",
      "waste_environmental",
      "laundry",
      "arts_entertainment",
      "education",
      "public_admin",
      "personal_services",
      "professional_services",
      "business_support",
    ]
    for (const v of expected) {
      expect(registered, `registry missing bucket "${v}"`).toContain(v)
    }
  })
})
