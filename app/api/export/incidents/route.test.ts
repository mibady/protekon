import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase
const mockGetUser = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockOrder = vi.fn()
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

describe("GET /api/export/incidents", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    })

    // Default chain for supabase queries
    mockFrom.mockImplementation((table: string) => {
      if (table === "clients") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: { id: "client-1" }, error: null }),
              }),
              single: () => Promise.resolve({ data: { id: "client-1" }, error: null }),
            }),
          }),
        }
      }
      if (table === "incidents") {
        return {
          select: () => ({
            eq: () => ({
              order: () =>
                Promise.resolve({
                  data: [
                    {
                      id: "1",
                      incident_id: "INC-001",
                      description: "Test incident",
                      location: "Site A",
                      incident_date: "2026-01-15",
                      severity: "moderate",
                      follow_up_id: null,
                      metadata: { type: "injury" },
                      created_at: "2026-01-15T10:00:00Z",
                    },
                  ],
                  error: null,
                }),
            }),
          }),
        }
      }
      return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }) }
    })
  })

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { GET } = await import("./route")
    const request = new Request("http://localhost/api/export/incidents?format=csv")
    const response = await GET(request as unknown as import("next/server").NextRequest)

    expect(response.status).toBe(401)
  })

  it("returns 400 for invalid format", async () => {
    const { GET } = await import("./route")
    const request = new Request("http://localhost/api/export/incidents?format=xlsx")
    const response = await GET(request as unknown as import("next/server").NextRequest)

    expect(response.status).toBe(400)
  })

  it("returns CSV with correct content type for format=csv", async () => {
    const { GET } = await import("./route")
    const request = new Request("http://localhost/api/export/incidents?format=csv")
    const response = await GET(request as unknown as import("next/server").NextRequest)

    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toContain("text/csv")
    expect(response.headers.get("Content-Disposition")).toContain("incidents-export.csv")
  })

  it("returns PDF with correct content type for format=pdf", async () => {
    const { GET } = await import("./route")
    const request = new Request("http://localhost/api/export/incidents?format=pdf")
    const response = await GET(request as unknown as import("next/server").NextRequest)

    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe("application/pdf")
    expect(response.headers.get("Content-Disposition")).toContain("incidents-export.pdf")
  })

  it("defaults to csv when no format is specified", async () => {
    const { GET } = await import("./route")
    const request = new Request("http://localhost/api/export/incidents")
    const response = await GET(request as unknown as import("next/server").NextRequest)

    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toContain("text/csv")
  })
})
