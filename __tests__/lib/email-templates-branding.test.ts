import { describe, it, expect } from "vitest"
import { layoutWrapper, type BrandingContext } from "@/lib/email-templates"

const CONTENT = "<h2>Hello</h2>"

const PARTNER: BrandingContext = {
  display_name: "Smith Insurance Group",
  logo_blob_path: "https://blob.vercel.app/partner-logos/smith.png",
  primary_color: "#2563eb",
  hide_protekon_attribution: true,
}

const PARTNER_NO_LOGO: BrandingContext = {
  display_name: "Acme Safety",
  logo_blob_path: null,
  primary_color: "#16a34a",
  hide_protekon_attribution: false,
}

describe("layoutWrapper — unbranded (default)", () => {
  it("renders PROTEKON wordmark when no branding provided", () => {
    const html = layoutWrapper(CONTENT)
    expect(html).toContain(">PROTEKON<")
    expect(html).toContain("Protekon Compliance")
  })

  it("wraps content inside the card", () => {
    const html = layoutWrapper(CONTENT)
    expect(html).toContain(CONTENT)
  })
})

describe("layoutWrapper — branded with logo image", () => {
  const html = layoutWrapper(CONTENT, PARTNER)

  it("renders img src from logo_blob_path", () => {
    expect(html).toContain(`src="${PARTNER.logo_blob_path}"`)
    expect(html).toContain(`alt="Smith Insurance Group"`)
  })

  it("hides Protekon attribution in footer", () => {
    expect(html).not.toContain("Protekon Compliance")
    expect(html).toContain("Smith Insurance Group")
    expect(html).toContain("Workplace Safety Compliance")
  })

  it("does not inject the PROTEKON wordmark", () => {
    expect(html).not.toContain(">PROTEKON<")
  })
})

describe("layoutWrapper — branded without logo", () => {
  const html = layoutWrapper(CONTENT, PARTNER_NO_LOGO)

  it("renders partner display_name in primary_color when no logo", () => {
    expect(html).toContain("ACME SAFETY")
    expect(html).toContain("#16a34a")
  })

  it("keeps Protekon attribution when hide_protekon_attribution=false", () => {
    expect(html).toContain("Protekon Compliance")
  })
})

describe("layoutWrapper — XSS defense", () => {
  it("escapes display_name HTML", () => {
    const evil: BrandingContext = {
      display_name: `Evil<script>alert(1)</script>`,
      logo_blob_path: null,
      primary_color: "#C41230",
      hide_protekon_attribution: true,
    }
    const html = layoutWrapper(CONTENT, evil)
    expect(html).not.toContain("<script>")
    expect(html).toContain("&lt;script&gt;")
  })

  it("escapes quotes in logo_blob_path", () => {
    const evil: BrandingContext = {
      display_name: "OK",
      logo_blob_path: `"><script>alert(1)</script>`,
      primary_color: "#C41230",
      hide_protekon_attribution: false,
    }
    const html = layoutWrapper(CONTENT, evil)
    expect(html).not.toMatch(/src="">/)
    expect(html).toContain("&quot;")
  })
})
