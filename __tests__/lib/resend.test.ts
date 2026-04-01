import { describe, it, expect, vi, beforeEach } from "vitest"

// Test getSiteUrl and getComplianceOfficerEmail helpers
describe("lib/resend helpers", () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  describe("getSiteUrl", () => {
    it("returns env var when set", async () => {
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.protekon.com")
      // Re-import to pick up new env
      const { getSiteUrl } = await import("@/lib/resend")
      expect(getSiteUrl()).toBe("https://staging.protekon.com")
    })

    it("falls back to protekon.com when unset", async () => {
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "")
      const mod = await import("@/lib/resend")
      // Empty string is falsy, should fall back
      expect(mod.getSiteUrl()).toMatch(/protekon\.com/)
    })
  })

  describe("getComplianceOfficerEmail", () => {
    it("returns env var when set", async () => {
      vi.stubEnv("COMPLIANCE_OFFICER_EMAIL", "officer@test.com")
      const { getComplianceOfficerEmail } = await import("@/lib/resend")
      expect(getComplianceOfficerEmail()).toBe("officer@test.com")
    })

    it("throws in production when env var missing", async () => {
      vi.stubEnv("COMPLIANCE_OFFICER_EMAIL", "")
      vi.stubEnv("NODE_ENV", "production")
      const { getComplianceOfficerEmail } = await import("@/lib/resend")
      expect(() => getComplianceOfficerEmail()).toThrow("COMPLIANCE_OFFICER_EMAIL")
    })

    it("returns dev fallback in non-production", async () => {
      vi.stubEnv("COMPLIANCE_OFFICER_EMAIL", "")
      vi.stubEnv("NODE_ENV", "development")
      const { getComplianceOfficerEmail } = await import("@/lib/resend")
      expect(getComplianceOfficerEmail()).toBe("compliance-dev@example.com")
    })
  })
})
