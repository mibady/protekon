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
      expect(getComplianceOfficerEmail()).toBe("compliance@protekon.com")
    })
  })

  // This guard exists because in 2026-04-27 the hardcoded FROM default pointed
  // at protekon.com (unverified at Resend) and every Resend send silently
  // failed in production. If the default in lib/resend.ts is changed to a
  // domain that isn't yet verified at Resend, this block fails — preventing
  // a recurrence of that class of bug from being merged.
  describe("FROM domain guard", () => {
    it("default FROM domain belongs to the verified-domain allowlist", async () => {
      const { ALLOWED_FROM_DOMAINS, DEFAULT_FROM_ADDRESS, parseFromDomain } =
        await import("@/lib/resend")
      const domain = parseFromDomain(DEFAULT_FROM_ADDRESS)
      expect(domain).not.toBeNull()
      expect(ALLOWED_FROM_DOMAINS).toContain(domain)
    })

    it("getFromAddress() returns the env override when RESEND_FROM is set", async () => {
      vi.stubEnv("RESEND_FROM", "Protekon <compliance@auryxvoice.com>")
      const { getFromAddress } = await import("@/lib/resend")
      expect(getFromAddress()).toBe("Protekon <compliance@auryxvoice.com>")
    })

    it("getFromAddress() falls back to the default when RESEND_FROM is unset", async () => {
      vi.stubEnv("RESEND_FROM", "")
      const { getFromAddress, DEFAULT_FROM_ADDRESS } = await import("@/lib/resend")
      expect(getFromAddress()).toBe(DEFAULT_FROM_ADDRESS)
    })

    it("parseFromDomain handles plain and bracketed addresses", async () => {
      const { parseFromDomain } = await import("@/lib/resend")
      expect(parseFromDomain("compliance@protekon.org")).toBe("protekon.org")
      expect(parseFromDomain("Protekon <compliance@protekon.org>")).toBe("protekon.org")
      expect(parseFromDomain("Some Name <Foo@Example.COM>")).toBe("example.com")
    })

    it("parseFromDomain returns null for malformed input", async () => {
      const { parseFromDomain } = await import("@/lib/resend")
      expect(parseFromDomain("not-an-address")).toBeNull()
      expect(parseFromDomain("")).toBeNull()
    })
  })
})
