import { describe, it, expect, vi, beforeEach } from "vitest"

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  user_metadata: { business_name: "Test Co" },
}

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

describe("dashboard actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    mockFrom.mockImplementation((table: string) => {
      if (table === "clients") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "user-123", business_name: "Test Co", compliance_score: 72 },
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === "documents") {
        return {
          select: vi.fn().mockImplementation((_sel: string, opts?: Record<string, unknown>) => {
            if (opts?.count === "exact") {
              return {
                eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
              }
            }
            return {
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [{ id: "doc-1" }], error: null }),
                }),
              }),
            }
          }),
        }
      }
      if (table === "incidents") {
        return {
          select: vi.fn().mockImplementation((_sel: string, opts?: Record<string, unknown>) => {
            if (opts?.count === "exact") {
              return {
                eq: vi.fn().mockResolvedValue({ count: 2, error: null }),
              }
            }
            return {
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [{ id: "inc-1" }], error: null }),
                }),
              }),
            }
          }),
        }
      }
      if (table === "audits") {
        return {
          select: vi.fn().mockImplementation(() => {
            return {
              eq: vi.fn().mockResolvedValue({ count: 1, error: null }),
            }
          }),
        }
      }
      return {}
    })
  })

  // --- getDashboardData ---

  it("getDashboardData auth guard -> returns empty/default data when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { getDashboardData } = await import("@/lib/actions/dashboard")

    const result = await getDashboardData()

    expect(result).toEqual({
      client: null,
      recentDocuments: [],
      recentIncidents: [],
      complianceScore: 0,
      documentCount: 0,
      incidentCount: 0,
      auditCount: 0,
    })
  })

  it("getDashboardData queries 'clients', 'documents', 'incidents', 'audits'", async () => {
    const { getDashboardData } = await import("@/lib/actions/dashboard")

    await getDashboardData()

    expect(mockFrom).toHaveBeenCalledWith("clients")
    expect(mockFrom).toHaveBeenCalledWith("documents")
    expect(mockFrom).toHaveBeenCalledWith("incidents")
    expect(mockFrom).toHaveBeenCalledWith("audits")
  })

  it("getDashboardData returns correct shape", async () => {
    const { getDashboardData } = await import("@/lib/actions/dashboard")

    const result = await getDashboardData()

    expect(result).toHaveProperty("client")
    expect(result).toHaveProperty("recentDocuments")
    expect(result).toHaveProperty("recentIncidents")
    expect(result).toHaveProperty("complianceScore")
    expect(result).toHaveProperty("documentCount")
    expect(result).toHaveProperty("incidentCount")
    expect(result).toHaveProperty("auditCount")

    expect(result.client).toEqual(
      expect.objectContaining({ id: "user-123", compliance_score: 72 })
    )
    expect(result.complianceScore).toBe(72)
    expect(result.documentCount).toBe(3)
    expect(result.incidentCount).toBe(2)
    expect(result.auditCount).toBe(1)
  })

  it("getDashboardData handles errors gracefully", async () => {
    // Make all from() calls return errors
    mockFrom.mockImplementation((table: string) => {
      if (table === "clients") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: "DB down" } }),
            }),
          }),
        }
      }
      return {
        select: vi.fn().mockImplementation((_sel: string, opts?: Record<string, unknown>) => {
          if (opts?.count === "exact") {
            return {
              eq: vi.fn().mockResolvedValue({ count: null, error: { message: "DB down" } }),
            }
          }
          return {
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: null, error: { message: "DB down" } }),
              }),
            }),
          }
        }),
      }
    })

    const { getDashboardData } = await import("@/lib/actions/dashboard")
    const result = await getDashboardData()

    // Should not throw, should return safe defaults
    expect(result.client).toBeNull()
    expect(result.complianceScore).toBe(0)
    expect(result.documentCount).toBe(0)
    expect(result.incidentCount).toBe(0)
    expect(result.auditCount).toBe(0)
  })
})
