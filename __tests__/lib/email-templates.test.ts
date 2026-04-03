import { describe, it, expect, vi } from "vitest"

// Stub getSiteUrl before importing templates
vi.mock("@/lib/resend", () => ({
  getSiteUrl: () => "https://test.protekon.com",
}))

import {
  welcomeEmail,
  intakeWelcomeEmail,
  documentReadyEmail,
  incidentAlertEmail,
  paymentWarning1Email,
  paymentWarning2Email,
  suspensionNoticeEmail,
  auditAlertEmail,
  trainingOverdueEmail,
  trainingUpcomingEmail,
  trainingEscalationEmail,
} from "@/lib/email-templates"

describe("email templates", () => {
  it("welcomeEmail returns subject and html with email", () => {
    const result = welcomeEmail("user@test.com")
    expect(result.subject).toBe("Your AI compliance officer is now active")
    expect(result.html).toContain("user@test.com")
    expect(result.html).toContain("https://test.protekon.com/dashboard")
  })

  it("intakeWelcomeEmail includes score and risk level", () => {
    const result = intakeWelcomeEmail("user@test.com", 72, "medium")
    expect(result.subject).toContain("72%")
    expect(result.html).toContain("72%")
    expect(result.html).toContain("medium")
  })

  it("documentReadyEmail includes document type and business name", () => {
    const result = documentReadyEmail("IIPP", "Acme Corp")
    expect(result.subject).toContain("IIPP")
    expect(result.html).toContain("Acme Corp")
    expect(result.html).toContain("IIPP")
  })

  it("incidentAlertEmail includes severity-colored badge", () => {
    const result = incidentAlertEmail("INC-2026-001", "Acme Corp", "severe")
    expect(result.subject).toContain("SEVERE")
    expect(result.html).toContain("INC-2026-001")
    expect(result.html).toContain("#dc2626") // severe = red
  })

  it("paymentWarning1Email formats amount correctly", () => {
    const result = paymentWarning1Email(497, "INV-001")
    expect(result.subject).toContain("Payment Failed")
    expect(result.html).toContain("$497.00")
    expect(result.html).toContain("INV-001")
  })

  it("paymentWarning2Email has urgent styling", () => {
    const result = paymentWarning2Email("Acme Corp")
    expect(result.subject).toContain("URGENT")
    expect(result.html).toContain("Acme Corp")
    expect(result.html).toContain("#dc2626") // red
  })

  it("suspensionNoticeEmail includes invoice ID", () => {
    const result = suspensionNoticeEmail("Acme Corp", "INV-002")
    expect(result.subject).toContain("Suspended")
    expect(result.html).toContain("INV-002")
  })

  it("auditAlertEmail includes score and status", () => {
    const result = auditAlertEmail("Acme Corp", 45, "non-compliant")
    expect(result.subject).toContain("non-compliant")
    expect(result.html).toContain("45%")
  })

  it("trainingOverdueEmail includes employee and type", () => {
    const result = trainingOverdueEmail("John Doe", "Forklift Safety", "2026-01-15")
    expect(result.subject).toContain("John Doe")
    expect(result.html).toContain("Forklift Safety")
    expect(result.html).toContain("2026-01-15")
  })

  it("trainingUpcomingEmail includes due date", () => {
    const result = trainingUpcomingEmail("Jane Smith", "IIPP", "2026-02-01")
    expect(result.subject).toContain("Due Soon")
    expect(result.html).toContain("2026-02-01")
  })

  it("trainingEscalationEmail pluralizes correctly", () => {
    expect(trainingEscalationEmail(1).subject).toContain("1 record")
    expect(trainingEscalationEmail(5).subject).toContain("5 records")
  })

  it("all templates include layout wrapper with PROTEKON branding", () => {
    const templates = [
      welcomeEmail("x@x.com"),
      intakeWelcomeEmail("x@x.com", 50, "medium"),
      documentReadyEmail("IIPP", "Test"),
      incidentAlertEmail("INC-1", "Test", "minor"),
      paymentWarning1Email(100, "INV-1"),
      paymentWarning2Email("Test"),
      suspensionNoticeEmail("Test", "INV-1"),
      auditAlertEmail("Test", 80, "compliant"),
      trainingOverdueEmail("Test", "IIPP", "2026-01-01"),
      trainingUpcomingEmail("Test", "IIPP", "2026-01-01"),
      trainingEscalationEmail(3),
    ]
    for (const t of templates) {
      expect(t.html).toContain("PROTEKON")
      expect(t.html).toContain("<!DOCTYPE html>")
      expect(t.subject).toBeTruthy()
    }
  })
})
