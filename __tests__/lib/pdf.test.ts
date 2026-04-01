import { describe, it, expect } from "vitest"
import { generateCompliancePDF } from "@/lib/pdf"

describe("PDF generation", () => {
  it("generates a PDF with 3 pages (cover, summary, content)", async () => {
    const { buffer, pages } = await generateCompliancePDF({
      businessName: "Test Construction Co",
      documentType: "construction-compliance-plan",
      vertical: "construction",
      documentId: "DOC-TEST-001",
      complianceScore: 85,
      riskLevel: "low",
      auditCount: 3,
      incidentCount: 2,
    })

    expect(pages).toBe(3)
    expect(buffer).toBeInstanceOf(Uint8Array)
    expect(buffer.length).toBeGreaterThan(1000) // PDF should be at least 1KB
  })

  it("generates PDF for healthcare vertical", async () => {
    const { buffer, pages } = await generateCompliancePDF({
      businessName: "Test Medical Group",
      documentType: "hipaa-compliance-plan",
      vertical: "healthcare",
      documentId: "DOC-TEST-002",
      complianceScore: 60,
      riskLevel: "medium",
      auditCount: 1,
      incidentCount: 5,
    })

    expect(pages).toBe(3)
    expect(buffer.length).toBeGreaterThan(1000)
  })

  it("generates PDF for real-estate vertical", async () => {
    const { pages } = await generateCompliancePDF({
      businessName: "Test Properties LLC",
      documentType: "property-compliance-plan",
      vertical: "real-estate",
      documentId: "DOC-TEST-003",
      complianceScore: 40,
      riskLevel: "high",
      auditCount: 0,
      incidentCount: 10,
    })

    expect(pages).toBe(3)
  })

  it("falls back to default sections for unknown vertical", async () => {
    const { pages } = await generateCompliancePDF({
      businessName: "Test Biz",
      documentType: "general-compliance",
      vertical: "other",
      documentId: "DOC-TEST-004",
      complianceScore: 90,
      riskLevel: "low",
      auditCount: 5,
      incidentCount: 0,
    })

    expect(pages).toBe(3)
  })

  it("handles zero scores gracefully", async () => {
    const { buffer } = await generateCompliancePDF({
      businessName: "New Client",
      documentType: "initial-assessment",
      vertical: "construction",
      documentId: "DOC-NEW-001",
      complianceScore: 0,
      riskLevel: "high",
      auditCount: 0,
      incidentCount: 0,
    })

    expect(buffer.length).toBeGreaterThan(0)
  })
})
