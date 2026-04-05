import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase
const mockGetUser = vi.fn()
const mockSingle = vi.fn()
const mockOrder = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: () => mockSingle(),
          order: (...args: unknown[]) => {
            mockOrder(...args)
            return mockOrder
          },
        })),
      })),
    })),
  }),
}))

// Mock pdf-lib to avoid heavy PDF generation in tests
vi.mock("pdf-lib", () => ({
  PDFDocument: {
    create: vi.fn().mockResolvedValue({
      addPage: vi.fn().mockReturnValue({
        drawText: vi.fn(),
        drawLine: vi.fn(),
        drawRectangle: vi.fn(),
      }),
      embedFont: vi.fn().mockResolvedValue({}),
      save: vi.fn().mockResolvedValue(new Uint8Array([37, 80, 68, 70])), // %PDF
    }),
  },
  StandardFonts: { Helvetica: "Helvetica", HelveticaBold: "HelveticaBold" },
  rgb: vi.fn().mockReturnValue({}),
}))

const mockUser = { id: "user-1", email: "test@example.com" }

function makeIncidentsRequest(params?: Record<string, string>): Request {
  const url = new URL("http://localhost/api/export/incidents")
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }
  const req = new Request(url.toString(), { method: "GET" })
  Object.defineProperty(req, "nextUrl", { value: url, writable: false })
  return req
}

function makeReportRequest(params?: Record<string, string>): Request {
  const url = new URL("http://localhost/api/export/report")
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }
  const req = new Request(url.toString(), { method: "GET" })
  Object.defineProperty(req, "nextUrl", { value: url, writable: false })
  return req
}

describe("GET /api/export/incidents", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    mockSingle.mockResolvedValue({ data: { id: "client-1" } })
    mockOrder.mockResolvedValue({ data: [], error: null })
  })

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    const { GET } = await import("@/app/api/export/incidents/route")
    const res = await GET(makeIncidentsRequest() as never)

    expect(res.status).toBe(401)
  })

  it("supports format=csv with correct content-type", async () => {
    const { GET } = await import("@/app/api/export/incidents/route")
    const res = await GET(makeIncidentsRequest({ format: "csv" }) as never)

    expect(res.status).toBe(200)
    expect(res.headers.get("content-type")).toContain("text/csv")
  })

  it("supports format=pdf with correct content-type", async () => {
    const { GET } = await import("@/app/api/export/incidents/route")
    const res = await GET(makeIncidentsRequest({ format: "pdf" }) as never)

    expect(res.status).toBe(200)
    expect(res.headers.get("content-type")).toContain("application/pdf")
  })

  it("defaults to csv when no format specified", async () => {
    const { GET } = await import("@/app/api/export/incidents/route")
    const res = await GET(makeIncidentsRequest() as never)

    expect(res.status).toBe(200)
    expect(res.headers.get("content-type")).toContain("text/csv")
  })

  it("handles empty incidents gracefully", async () => {
    const { GET } = await import("@/app/api/export/incidents/route")
    const res = await GET(makeIncidentsRequest({ format: "csv" }) as never)

    expect(res.status).toBe(200)
    const text = await res.text()
    // Should have at least the header row
    expect(text).toContain("Incident ID")
  })
})

describe("GET /api/export/report", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    mockSingle.mockResolvedValue({ data: { id: "client-1", business_name: "Test Co", compliance_score: 85, risk_level: "low", vertical: "construction", plan: "core" } })
  })

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    const { GET } = await import("@/app/api/export/report/route")
    const res = await GET(makeReportRequest({ type: "compliance-score" }) as never)

    expect(res.status).toBe(401)
  })

  it("returns 400 for invalid report type", async () => {
    const { GET } = await import("@/app/api/export/report/route")
    const res = await GET(makeReportRequest({ type: "invalid-type" }) as never)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain("Invalid report type")
  })

  it("only supports PDF format for reports", async () => {
    const { GET } = await import("@/app/api/export/report/route")
    const res = await GET(makeReportRequest({ type: "compliance-score", format: "csv" }) as never)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain("Only PDF format")
  })
})
