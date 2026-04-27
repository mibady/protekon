import { describe, it, expect, vi, beforeEach } from "vitest"

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  user_metadata: {
    business_name: "Test Co",
    vertical: "construction",
  },
}

// Chainable mocks
const mockInsert = vi.fn().mockResolvedValue({ error: null })
const mockSelectCount = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ count: 5 }),
})
const mockSelectAll = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
})

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

vi.mock("@/inngest/client", () => ({
  inngest: { send: vi.fn().mockResolvedValue(undefined) },
}))

describe("document actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: authenticated user
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    // Default from() behavior
    mockFrom.mockImplementation((table: string) => {
      if (table === "documents") {
        return {
          insert: mockInsert,
          select: vi.fn().mockImplementation((sel: string, opts?: Record<string, unknown>) => {
            if (opts?.count === "exact") {
              return { eq: vi.fn().mockResolvedValue({ count: 5 }) }
            }
            return {
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }
          }),
        }
      }
      if (table === "audit_log") {
        return { insert: vi.fn().mockResolvedValue({ error: null }) }
      }
      return {}
    })
  })

  function makeFormData(entries: Record<string, string>): FormData {
    const fd = new FormData()
    for (const [k, v] of Object.entries(entries)) {
      fd.set(k, v)
    }
    return fd
  }

  // --- requestDocument ---

  it("requestDocument auth guard -> returns error when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { requestDocument } = await import("@/lib/actions/documents")

    const fd = makeFormData({ type: "iipp" })
    const result = await requestDocument(fd)

    expect(result).toEqual({ error: "Please log in to continue." })
  })

  it("requestDocument validates type is required -> returns error when missing", async () => {
    const { requestDocument } = await import("@/lib/actions/documents")

    const fd = makeFormData({})
    const result = await requestDocument(fd)

    expect(result).toEqual({ error: "Document type is required." })
  })

  it("requestDocument generates DOC-YYYY-NNN ID format", async () => {
    const { requestDocument } = await import("@/lib/actions/documents")

    const fd = makeFormData({ type: "iipp" })
    await requestDocument(fd)

    const year = new Date().getFullYear()
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        document_id: `DOC-${year}-006`, // count=5, so seq=006
      })
    )
  })

  it("requestDocument inserts into 'documents' table with correct fields", async () => {
    const { requestDocument } = await import("@/lib/actions/documents")

    const fd = makeFormData({ type: "wvpp", notes: "Urgent", priority: "rush" })
    await requestDocument(fd)

    expect(mockFrom).toHaveBeenCalledWith("documents")
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: "user-123",
        type: "wvpp",
        filename: "Workplace Violence Prevention Plan.pdf",
        status: "requested",
        notes: "Urgent",
        priority: "rush",
      })
    )
  })

  it("requestDocument logs to 'audit_log' table", async () => {
    const mockAuditInsert = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockImplementation((table: string) => {
      if (table === "documents") {
        return {
          insert: mockInsert,
          select: vi.fn().mockImplementation((_sel: string, opts?: Record<string, unknown>) => {
            if (opts?.count === "exact") {
              return { eq: vi.fn().mockResolvedValue({ count: 0 }) }
            }
            return {
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }
          }),
        }
      }
      if (table === "audit_log") {
        return { insert: mockAuditInsert }
      }
      return {}
    })

    const { requestDocument } = await import("@/lib/actions/documents")

    const fd = makeFormData({ type: "eap" })
    await requestDocument(fd)

    expect(mockFrom).toHaveBeenCalledWith("audit_log")
    expect(mockAuditInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: "user-123",
        event_type: "document.requested",
      })
    )
  })

  it("requestDocument fires Inngest 'compliance/document.requested' with correct data", async () => {
    const { inngest } = await import("@/inngest/client")
    const { requestDocument } = await import("@/lib/actions/documents")

    const fd = makeFormData({ type: "hazcom" })
    await requestDocument(fd)

    expect(inngest.send).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "compliance/document.requested",
        data: expect.objectContaining({
          clientId: "user-123",
          email: "test@example.com",
          businessName: "Test Co",
          documentType: "hazcom",
          vertical: "construction",
        }),
      })
    )
  })

  // --- getDocuments ---

  it("getDocuments auth guard -> returns [] when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { getDocuments } = await import("@/lib/actions/documents")

    const result = await getDocuments()
    expect(result).toEqual([])
  })

  it("getDocuments queries 'documents' table ordered by created_at desc", async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: [{ id: "doc-1" }], error: null })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelectDocs = vi.fn().mockReturnValue({ eq: mockEq })

    mockFrom.mockImplementation((table: string) => {
      if (table === "documents") {
        return { select: mockSelectDocs }
      }
      return {}
    })

    const { getDocuments } = await import("@/lib/actions/documents")
    const result = await getDocuments()

    expect(mockFrom).toHaveBeenCalledWith("documents")
    expect(mockSelectDocs).toHaveBeenCalledWith("*")
    expect(mockEq).toHaveBeenCalledWith("client_id", "user-123")
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false })
    expect(result).toEqual([{ id: "doc-1" }])
  })
})
