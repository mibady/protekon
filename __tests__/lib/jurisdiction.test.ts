import { describe, it, expect } from "vitest"
import {
  stateToJurisdiction,
  applyJurisdictionOverride,
  resolveTemplateSections,
  type JurisdictionOverride,
} from "@/lib/jurisdiction"
import type { SectionTemplate } from "@/lib/document-templates"

const baseSections: SectionTemplate[] = [
  {
    heading: "1. Scope",
    purpose:
      "Establish plan per Cal/OSHA Title 8 and Labor Code §6401.9. Covers all Cal/OSHA employers.",
    requiredReferences: ["Cal/OSHA Title 8 §3203", "Labor Code §6401.9"],
    targetWords: 120,
    alwaysInclude: true,
  },
  {
    heading: "2. Training",
    purpose: "Annual refresher per Cal/OSHA training-record retention.",
    requiredReferences: ["Cal/OSHA"],
    targetWords: 90,
    alwaysInclude: true,
  },
]

describe("stateToJurisdiction", () => {
  it("defaults to ca when state is null", () => {
    expect(stateToJurisdiction(null)).toBe("ca")
    expect(stateToJurisdiction(undefined)).toBe("ca")
    expect(stateToJurisdiction("")).toBe("ca")
  })

  it("maps state-plan codes to their jurisdiction", () => {
    expect(stateToJurisdiction("CA")).toBe("ca")
    expect(stateToJurisdiction("ca")).toBe("ca")
    expect(stateToJurisdiction(" TX ")).toBe("tx")
    expect(stateToJurisdiction("WA")).toBe("wa")
    expect(stateToJurisdiction("NJ")).toBe("nj")
  })

  it("falls back to federal for non-plan states", () => {
    expect(stateToJurisdiction("FL")).toBe("federal")
    expect(stateToJurisdiction("NY")).toBe("federal")
    expect(stateToJurisdiction("XX")).toBe("federal")
  })
})

describe("applyJurisdictionOverride", () => {
  it("returns base sections unchanged when override is null", () => {
    const out = applyJurisdictionOverride(baseSections, null)
    expect(out).toEqual(baseSections)
  })

  it("applies legal_ref_swap to purpose and requiredReferences", () => {
    const override: JurisdictionOverride = {
      template_id: "wvpp",
      jurisdiction: "federal",
      sections_override: null,
      legal_ref_swap: {
        "Cal/OSHA Title 8": "29 CFR 1910",
        "Labor Code §6401.9": "OSHA General Duty Clause §5(a)(1)",
        "Cal/OSHA": "OSHA",
      },
    }
    const out = applyJurisdictionOverride(baseSections, override)
    expect(out[0].heading).toBe("1. Scope")  // heading locked
    expect(out[0].purpose).not.toContain("Cal/OSHA")
    expect(out[0].purpose).toContain("29 CFR 1910")
    expect(out[0].purpose).toContain("OSHA General Duty Clause")
    expect(out[0].requiredReferences[0]).toBe("29 CFR 1910 §3203")
    expect(out[0].requiredReferences[1]).toBe("OSHA General Duty Clause §5(a)(1)")
    expect(out[1].requiredReferences[0]).toBe("OSHA")
  })

  it("prefers longest-key swaps first (Cal/OSHA Title 8 before Cal/OSHA)", () => {
    const override: JurisdictionOverride = {
      template_id: "iipp",
      jurisdiction: "federal",
      sections_override: null,
      legal_ref_swap: {
        "Cal/OSHA": "OSHA",
        "Cal/OSHA Title 8": "29 CFR 1910",
      },
    }
    const out = applyJurisdictionOverride(baseSections, override)
    expect(out[0].requiredReferences[0]).toBe("29 CFR 1910 §3203")
    expect(out[0].requiredReferences[0]).not.toContain("OSHA Title 8")
  })

  it("replaces sections entirely when sections_override is present", () => {
    const replacement: SectionTemplate[] = [
      {
        heading: "1. Federal Scope",
        purpose: "Voluntary IIPP per OSHA recommended best practice.",
        requiredReferences: ["29 CFR 1910"],
        targetWords: 100,
        alwaysInclude: true,
      },
    ]
    const override: JurisdictionOverride = {
      template_id: "iipp",
      jurisdiction: "federal",
      sections_override: replacement,
      legal_ref_swap: {},
    }
    const out = applyJurisdictionOverride(baseSections, override)
    expect(out).toHaveLength(1)
    expect(out[0].heading).toBe("1. Federal Scope")
  })

  it("runs legal_ref_swap over sections_override contents too", () => {
    const replacement: SectionTemplate[] = [
      {
        heading: "1. Scope",
        purpose: "Voluntary program per Cal/OSHA recommendation.",
        requiredReferences: ["Cal/OSHA"],
        targetWords: 100,
        alwaysInclude: true,
      },
    ]
    const override: JurisdictionOverride = {
      template_id: "iipp",
      jurisdiction: "federal",
      sections_override: replacement,
      legal_ref_swap: { "Cal/OSHA": "OSHA" },
    }
    const out = applyJurisdictionOverride(baseSections, override)
    expect(out[0].purpose).toBe("Voluntary program per OSHA recommendation.")
    expect(out[0].requiredReferences).toEqual(["OSHA"])
  })

  it("does not mutate the base sections array", () => {
    const baseSnapshot = JSON.parse(JSON.stringify(baseSections))
    const override: JurisdictionOverride = {
      template_id: "wvpp",
      jurisdiction: "federal",
      sections_override: null,
      legal_ref_swap: { "Cal/OSHA": "OSHA" },
    }
    applyJurisdictionOverride(baseSections, override)
    expect(baseSections).toEqual(baseSnapshot)
  })
})

describe("resolveTemplateSections", () => {
  it("is a thin alias of applyJurisdictionOverride", () => {
    const via1 = resolveTemplateSections(baseSections, null)
    const via2 = applyJurisdictionOverride(baseSections, null)
    expect(via1).toEqual(via2)
  })
})
