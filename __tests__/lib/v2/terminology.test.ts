import { describe, it, expect } from "vitest"
import { getDashboardTerminology } from "@/lib/v2/terminology"

describe("getDashboardTerminology", () => {
  it("localizes construction with Subcontractor + Site + My Subs group", () => {
    const t = getDashboardTerminology("construction")
    expect(t.thirdParty).toBe("Subcontractor")
    expect(t.thirdPartyPlural).toBe("Subcontractors")
    expect(t.thirdPartyGroupLabel).toBe("My Subs")
    expect(t.location).toBe("Site")
    expect(t.locationPlural).toBe("Sites")
    expect(t.isConstructionFamily).toBe(true)
  })

  it("localizes healthcare with Business Associate + Facility, no construction family", () => {
    const t = getDashboardTerminology("healthcare")
    expect(t.thirdParty).toBe("Business Associate")
    expect(t.thirdPartyPlural).toBe("Business Associates")
    expect(t.thirdPartyGroupLabel).toBe("Business Associates")
    expect(t.location).toBe("Facility")
    expect(t.locationPlural).toBe("Facilities")
    expect(t.isConstructionFamily).toBe(false)
  })

  it("localizes manufacturing with Supplier + Plant", () => {
    const t = getDashboardTerminology("manufacturing")
    expect(t.thirdParty).toBe("Supplier")
    expect(t.thirdPartyPlural).toBe("Suppliers")
    expect(t.thirdPartyGroupLabel).toBe("Suppliers")
    expect(t.location).toBe("Plant")
    expect(t.locationPlural).toBe("Plants")
    expect(t.isConstructionFamily).toBe(false)
  })

  it("localizes retail with Vendor + Store", () => {
    const t = getDashboardTerminology("retail")
    expect(t.thirdParty).toBe("Vendor")
    expect(t.thirdPartyPlural).toBe("Vendors")
    expect(t.thirdPartyGroupLabel).toBe("Vendors")
    expect(t.location).toBe("Store")
  })

  it("treats real-estate as construction-family with Property location", () => {
    const t = getDashboardTerminology("real-estate")
    expect(t.isConstructionFamily).toBe(true)
    expect(t.location).toBe("Property")
    expect(t.locationPlural).toBe("Properties")
    expect(t.thirdPartyGroupLabel).toBe("Vendors")
  })

  it("falls back safely when slug is null", () => {
    const t = getDashboardTerminology(null)
    expect(t.thirdParty).toBe("Third Party")
    expect(t.thirdPartyPlural).toBe("Third Parties")
    expect(t.thirdPartyGroupLabel).toBe("Third Parties")
    expect(t.location).toBe("Location")
    expect(t.isConstructionFamily).toBe(false)
  })

  it("falls back safely when slug is undefined", () => {
    const t = getDashboardTerminology(undefined)
    expect(t.thirdParty).toBe("Third Party")
    expect(t.isConstructionFamily).toBe(false)
  })

  it("falls back to default config when slug is unknown", () => {
    const t = getDashboardTerminology("not-a-real-slug")
    expect(t.thirdParty).toBe("Third Party")
    expect(t.location).toBe("Location")
    expect(t.isConstructionFamily).toBe(false)
  })

  it("never returns empty strings for any field", () => {
    for (const slug of [
      "construction",
      "healthcare",
      "manufacturing",
      "retail",
      "hospitality",
      "transportation",
      "agriculture",
      null,
      "unknown",
    ]) {
      const t = getDashboardTerminology(slug)
      expect(t.worker).toBeTruthy()
      expect(t.workerPlural).toBeTruthy()
      expect(t.thirdParty).toBeTruthy()
      expect(t.thirdPartyPlural).toBeTruthy()
      expect(t.thirdPartyGroupLabel).toBeTruthy()
      expect(t.location).toBeTruthy()
      expect(t.locationPlural).toBeTruthy()
    }
  })
})
