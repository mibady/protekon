import { describe, it, expect, vi, beforeEach } from "vitest"

const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
})
const mockInsert = vi.fn().mockResolvedValue({ data: [{ id: "new-id" }], error: null })
const mockDelete = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  }),
})
const mockUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  }),
})

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  delete: mockDelete,
  update: mockUpdate,
}))

vi.mock("@/lib/actions/shared", () => ({
  getAuth: vi.fn().mockResolvedValue({
    supabase: { from: mockFrom },
    clientId: "user-123",
  }),
}))

describe("training actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getTrainingRecords returns [] when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getTrainingRecords } = await import("@/lib/actions/training")
    const result = await getTrainingRecords()
    expect(result).toEqual([])
  })

  it("getTrainingRecords queries training_records table", async () => {
    const { getTrainingRecords } = await import("@/lib/actions/training")
    await getTrainingRecords()
    expect(mockFrom).toHaveBeenCalledWith("training_records")
  })

  it("addTrainingRecord returns error when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { addTrainingRecord } = await import("@/lib/actions/training")
    const fd = new FormData()
    const result = await addTrainingRecord(fd)
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("addTrainingRecord inserts with correct fields", async () => {
    const { addTrainingRecord } = await import("@/lib/actions/training")
    const fd = new FormData()
    fd.set("employee_name", "John Doe")
    fd.set("training_type", "OSHA 10")
    fd.set("due_date", "2025-06-01")
    await addTrainingRecord(fd)
    expect(mockFrom).toHaveBeenCalledWith("training_records")
    expect(mockInsert).toHaveBeenCalledWith({
      client_id: "user-123",
      employee_name: "John Doe",
      training_type: "OSHA 10",
      due_date: "2025-06-01",
      status: "pending",
    })
  })

  it("completeTraining returns error when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { completeTraining } = await import("@/lib/actions/training")
    const result = await completeTraining("some-id")
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("completeTraining updates status to completed", async () => {
    const { completeTraining } = await import("@/lib/actions/training")
    await completeTraining("rec-1")
    expect(mockFrom).toHaveBeenCalledWith("training_records")
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "completed" })
    )
  })

  it("deleteTrainingRecord returns error when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { deleteTrainingRecord } = await import("@/lib/actions/training")
    const result = await deleteTrainingRecord("some-id")
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("deleteTrainingRecord deletes from training_records", async () => {
    const { deleteTrainingRecord } = await import("@/lib/actions/training")
    await deleteTrainingRecord("rec-1")
    expect(mockFrom).toHaveBeenCalledWith("training_records")
    expect(mockDelete).toHaveBeenCalled()
  })
})
