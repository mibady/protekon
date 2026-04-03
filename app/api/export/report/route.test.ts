import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase
const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}))

// Mock pdf-lib
vi.mock("pdf-lib", () => ({
  PDFDocument: {
    create: vi.fn(async () => ({
      embedFont: vi.fn(async () => ({})),
      addPage: vi.fn(() => ({
        drawText: vi.fn(),
        drawLine: vi.fn(),
        drawRectangle: vi.fn(),
      })),
      save: vi.fn(async () => new Uint8Array([1, 2, 3])),
    })),
  },
  StandardFonts: {
    Helvetica: "Helvetica",
    HelveticaBold: "Helvetica-Bold",
  },
  rgb: vi.fn(() => ({ type: "RGB" })),
}))

describe("GET /api/export/report", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === "clients") {
        return {
          select: (cols: string) => {
            if (cols === "id") {
              return {
                eq: () => ({
                  single: () => Promise.resolve({ data: { id: "client-1" }, error: null }),
                }),
              }
            }
            if (cols === "business_name") {
              return {
                eq: () => ({
                  single: () => Promise.resolve({ data: { business_name: "Test Co" }, error: null }),
                }),
              }
            }
            // compliance-score case
            return {
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: {
                      compliance_score: 85,
                      risk_level: "low",
                      vertical: "construction",
                      plan: "professional",
                      business_name: "Test Co",
                    },
                    error: null,
                  }),
              }),
            }
          },
        }
      }
      if (table === "documents") {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        }
      }
      if (table === "incidents") {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        }
      }
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null }),
            order: () => Promise.resolve({ data: [] }),
          }),
        }),
      }
    })
  })

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { GET } = await import("./route")
    const request = new Request("http://localhost/api/export/report?type=compliance-score&format=pdf")
    const response = await GET(request as unknown as import("next/server").NextRequest)

    expect(response.status).toBe(401)
  })

  it("returns 400 for invalid report type", async () => {
    const { GET } = await import("./route")
    const request = new Request("http://localhost/api/export/report?type=invalid-type&format=pdf")
    const response = await GET(request as unknown as import("next/server").NextRequest)

    expect(response.status).toBe(400)
  })

  it("returns 400 for non-pdf format", async () => {
    const { GET } = await import("./route")
    const request = new Request("http://localhost/api/export/report?type=compliance-score&format=csv")
    const response = await GET(request as unknown as import("next/server").NextRequest)

    expect(response.status).toBe(400)
  })

  it("returns PDF for valid compliance-score request", async () => {
    const { GET } = await import("./route")
    const request = new Request("http://localhost/api/export/report?type=compliance-score&format=pdf")
    const response = await GET(request as unknown as import("next/server").NextRequest)

    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe("application/pdf")
    expect(response.headers.get("Content-Disposition")).toContain("compliance-score-report.pdf")
  })

  it("returns PDF for valid incident-analysis request", async () => {
    const { GET } = await import("./route")
    const request = new Request("http://localhost/api/export/report?type=incident-analysis&format=pdf")
    const response = await GET(request as unknown as import("next/server").NextRequest)

    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe("application/pdf")
    expect(response.headers.get("Content-Disposition")).toContain("incident-analysis-report.pdf")
  })

  it("accepts all valid report types", async () => {
    const validTypes = [
      "compliance-score",
      "regulatory-impact",
      "annual-summary",
      "document-history",
      "incident-analysis",
      "delivery-log",
    ]

    const { GET } = await import("./route")

    for (const type of validTypes) {
      const request = new Request(`http://localhost/api/export/report?type=${type}&format=pdf`)
      const response = await GET(request as unknown as import("next/server").NextRequest)
      expect(response.status).toBe(200)
    }
  })
})
