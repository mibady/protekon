import { describe, it, expect, vi, beforeEach } from "vitest"

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  user_metadata: {
    business_name: "Test Co",
    vertical: "construction",
  },
}

const mockInsert = vi.fn().mockResolvedValue({ error: null })
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

describe("incident actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    mockFrom.mockImplementation((table: string) => {
      if (table === "incidents") {
        return {
          insert: mockInsert,
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: "inc-row-1", incident_id: "INC-2026-ABCDE", client_id: "user-123" },
                  error: null,
                }),
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
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

  // --- createIncident ---

  it("createIncident auth guard -> returns error when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { createIncident } = await import("@/lib/actions/incidents")

    const fd = makeFormData({ description: "Fire", severity: "high" })
    const result = await createIncident(fd)

    expect(result).toEqual({ error: "You must be logged in to log an incident." })
  })

  it("createIncident validates description + severity required", async () => {
    const { createIncident } = await import("@/lib/actions/incidents")

    const fd = makeFormData({})
    const result = await createIncident(fd)

    expect(result).toEqual({ error: "Description and severity are required." })
  })

  it("createIncident generates INC-YYYY-XXXXX ID", async () => {
    const { createIncident } = await import("@/lib/actions/incidents")

    const fd = makeFormData({ description: "Slip and fall", severity: "medium" })
    await createIncident(fd)

    const year = new Date().getFullYear()
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        incident_id: expect.stringMatching(new RegExp(`^INC-${year}-[A-Z2-9]{5}$`)),
      })
    )
  })

  it("createIncident inserts into 'incidents' table", async () => {
    const { createIncident } = await import("@/lib/actions/incidents")

    const fd = makeFormData({
      description: "Chemical spill",
      severity: "critical",
      location: "Warehouse B",
      date: "2026-04-01",
    })
    await createIncident(fd)

    expect(mockFrom).toHaveBeenCalledWith("incidents")
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: "user-123",
        description: "Chemical spill",
        severity: "critical",
        location: "Warehouse B",
        incident_date: "2026-04-01",
      })
    )
  })

  it("createIncident logs to 'audit_log'", async () => {
    const mockAuditInsert = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockImplementation((table: string) => {
      if (table === "incidents") return { insert: mockInsert }
      if (table === "audit_log") return { insert: mockAuditInsert }
      return {}
    })

    const { createIncident } = await import("@/lib/actions/incidents")

    const fd = makeFormData({ description: "Fall", severity: "low" })
    await createIncident(fd)

    expect(mockFrom).toHaveBeenCalledWith("audit_log")
    expect(mockAuditInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: "user-123",
        event_type: "incident.reported",
      })
    )
  })

  it("createIncident fires 'compliance/incident.reported' with correct data", async () => {
    const { inngest } = await import("@/inngest/client")
    const { createIncident } = await import("@/lib/actions/incidents")

    const fd = makeFormData({
      description: "Equipment malfunction",
      severity: "high",
      location: "Floor 3",
      date: "2026-04-02",
    })
    await createIncident(fd)

    expect(inngest.send).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "compliance/incident.reported",
        data: expect.objectContaining({
          clientId: "user-123",
          businessName: "Test Co",
          incidentData: expect.objectContaining({
            description: "Equipment malfunction",
            severity: "high",
          }),
        }),
      })
    )
  })

  it("createIncident collects metadata (type, time, injuryOccurred, medicalTreatment, witnesses, actionsTaken)", async () => {
    const { createIncident } = await import("@/lib/actions/incidents")

    const fd = makeFormData({
      description: "Injury on site",
      severity: "high",
      type: "physical",
      time: "14:30",
      injuryOccurred: "yes",
      medicalTreatment: "yes",
      witnesses: "John Doe, Jane Smith",
      actionsTaken: "First aid administered",
    })
    await createIncident(fd)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          type: "physical",
          time: "14:30",
          injuryOccurred: true,
          medicalTreatment: true,
          witnesses: "John Doe, Jane Smith",
          actionsTaken: "First aid administered",
        }),
      })
    )
  })

  // --- getIncidents ---

  it("getIncidents auth guard -> returns [] when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { getIncidents } = await import("@/lib/actions/incidents")

    const result = await getIncidents()
    expect(result).toEqual([])
  })

  // --- updateIncident ---

  it("updateIncident auth guard -> returns error when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { updateIncident } = await import("@/lib/actions/incidents")

    const result = await updateIncident("inc-row-1", { severity: "low" })
    expect(result).toEqual({ error: "You must be logged in to update an incident." })
  })

  it("updateIncident verifies ownership by querying incidents with client_id match", async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } })
    const mockEqClientId = vi.fn().mockReturnValue({ single: mockSingle })
    const mockEqId = vi.fn().mockReturnValue({ eq: mockEqClientId })
    const mockSelectOwnership = vi.fn().mockReturnValue({ eq: mockEqId })

    mockFrom.mockImplementation((table: string) => {
      if (table === "incidents") {
        return {
          select: mockSelectOwnership,
          update: vi.fn(),
        }
      }
      if (table === "audit_log") return { insert: vi.fn().mockResolvedValue({ error: null }) }
      return {}
    })

    const { updateIncident } = await import("@/lib/actions/incidents")
    const result = await updateIncident("nonexistent-id", { severity: "low" })

    expect(result).toEqual({ error: "Incident not found or access denied." })
    expect(mockSelectOwnership).toHaveBeenCalledWith("id, incident_id, client_id")
    expect(mockEqId).toHaveBeenCalledWith("id", "nonexistent-id")
    expect(mockEqClientId).toHaveBeenCalledWith("client_id", "user-123")
  })
})
