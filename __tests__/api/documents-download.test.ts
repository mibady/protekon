import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase
const mockGetUser = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: vi.fn(() => ({
      select: (...args: unknown[]) => {
        mockSelect(...args)
        return {
          eq: (...eqArgs: unknown[]) => {
            mockEq(...eqArgs)
            return {
              single: () => mockSingle(),
              eq: (...eq2Args: unknown[]) => {
                mockEq(...eq2Args)
                return { single: () => mockSingle() }
              },
            }
          },
        }
      },
    })),
  }),
}))

const mockUser = { id: "user-1", email: "test@example.com" }

function makeRequest(params?: Record<string, string>): Request {
  const url = new URL("http://localhost/api/documents/download")
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }
  const req = new Request(url.toString(), { method: "GET" })
  Object.defineProperty(req, "nextUrl", { value: url, writable: false })
  return req
}

describe("GET /api/documents/download", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
  })

  it("returns 400 when id param missing", async () => {
    const { GET } = await import("@/app/api/documents/download/route")
    const res = await GET(makeRequest() as never)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe("Missing document ID")
  })

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    const { GET } = await import("@/app/api/documents/download/route")
    const res = await GET(makeRequest({ id: "doc-1" }) as never)

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe("Unauthorized")
  })

  it("verifies document ownership and returns 404 for non-owned doc", async () => {
    // First call: document query returns a doc
    // Second call: client ownership check returns null
    mockSingle
      .mockResolvedValueOnce({ data: { storage_url: "https://example.com/file.pdf", client_id: "client-1" } })
      .mockResolvedValueOnce({ data: null })

    const { GET } = await import("@/app/api/documents/download/route")
    const res = await GET(makeRequest({ id: "doc-1" }) as never)

    expect(res.status).toBe(404)
  })

  it("redirects to storage_url on success", async () => {
    const storageUrl = "https://blob.vercel-storage.com/uploads/file.pdf"
    mockSingle
      .mockResolvedValueOnce({ data: { storage_url: storageUrl, client_id: "client-1" } })
      .mockResolvedValueOnce({ data: { id: "client-1" } })

    const { GET } = await import("@/app/api/documents/download/route")
    const res = await GET(makeRequest({ id: "doc-1" }) as never)

    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toBe(storageUrl)
  })
})
