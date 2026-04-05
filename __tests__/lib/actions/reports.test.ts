import { describe, it, expect, vi, beforeEach } from "vitest"

const mockEqChain = vi.fn().mockReturnValue({
  order: vi.fn().mockReturnValue({
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  eq: vi.fn().mockReturnValue({
    order: vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
  gte: vi.fn().mockResolvedValue({ data: [], error: null }),
  in: vi.fn().mockReturnValue({
    order: vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  }),
  lt: vi.fn().mockReturnValue({
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
  not: vi.fn().mockReturnValue({
    order: vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  }),
})
const mockSelect = vi.fn().mockReturnValue({
  eq: mockEqChain,
  order: vi.fn().mockReturnValue({
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
})
const mockUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ error: null }),
})

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  update: mockUpdate,
}))

vi.mock("@/lib/actions/shared", () => ({
  getAuth: vi.fn().mockResolvedValue({
    supabase: { from: mockFrom },
    clientId: "user-123",
  }),
}))

describe("reports actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getReportsSummary returns defaults when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getReportsSummary } = await import("@/lib/actions/reports")
    const result = await getReportsSummary()
    expect(result).toEqual({ documentCount: 0, incidentCount: 0, auditCount: 0, trainingCount: 0 })
  })

  it("getReportsSummary queries documents, incidents, audits, training_records", async () => {
    const { getReportsSummary } = await import("@/lib/actions/reports")
    await getReportsSummary()
    const tables = mockFrom.mock.calls.map((c: unknown[]) => c[0])
    expect(tables).toContain("documents")
    expect(tables).toContain("incidents")
    expect(tables).toContain("audits")
    expect(tables).toContain("training_records")
  })

  it("getComplianceScoreReport returns defaults when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getComplianceScoreReport } = await import("@/lib/actions/reports")
    const result = await getComplianceScoreReport()
    expect(result).toEqual({ score: 0, monthlyScores: [], documents: [], categories: [] })
  })

  it("getIncidentAnalysis returns defaults when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getIncidentAnalysis } = await import("@/lib/actions/reports")
    const result = await getIncidentAnalysis()
    expect(result).toEqual({ kpis: [], incidentsByType: [], incidentsBySeverity: [], correctiveActions: [] })
  })

  it("getDocumentHistory returns defaults when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getDocumentHistory } = await import("@/lib/actions/reports")
    const result = await getDocumentHistory()
    expect(result).toEqual({ stats: [], documents: [], deliveryLog: [] })
  })

  it("getDeliveryLog returns defaults when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getDeliveryLog } = await import("@/lib/actions/reports")
    const result = await getDeliveryLog()
    expect(result).toEqual({ stats: [], deliveries: [], deliverySchedule: [] })
  })

  it("getRegulations returns [] when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getRegulations } = await import("@/lib/actions/reports")
    const result = await getRegulations()
    expect(result).toEqual([])
  })

  it("getRegulations queries regulatory_updates table", async () => {
    const { getRegulations } = await import("@/lib/actions/reports")
    await getRegulations()
    expect(mockFrom).toHaveBeenCalledWith("regulatory_updates")
  })

  it("acknowledgeRegulation returns error when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { acknowledgeRegulation } = await import("@/lib/actions/reports")
    const result = await acknowledgeRegulation("reg-1")
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("getAlerts returns [] when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getAlerts } = await import("@/lib/actions/reports")
    const result = await getAlerts()
    expect(result).toEqual([])
  })
})
