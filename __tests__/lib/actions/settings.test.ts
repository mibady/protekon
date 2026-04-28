import { describe, it, expect, vi, beforeEach } from "vitest"

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  user_metadata: { business_name: "Test Co" },
}

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockUpdateUser = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
      updateUser: mockUpdateUser,
    },
    from: mockFrom,
  }),
}))

describe("settings actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    mockUpdateUser.mockResolvedValue({ error: null })

    mockFrom.mockImplementation((table: string) => {
      if (table === "clients") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: "user-123",
                  business_name: "Test Co",
                  notification_preferences: null,
                },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
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

  // --- getClientProfile ---

  it("getClientProfile returns null when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { getClientProfile } = await import("@/lib/actions/settings")

    const result = await getClientProfile()
    expect(result).toBeNull()
  })

  it("getClientProfile queries 'clients' table by user id", async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: "user-123", business_name: "Test Co" } })
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

    mockFrom.mockImplementation((table: string) => {
      if (table === "clients") return { select: mockSelect }
      return {}
    })

    const { getClientProfile } = await import("@/lib/actions/settings")
    const result = await getClientProfile()

    expect(mockFrom).toHaveBeenCalledWith("clients")
    expect(mockSelect).toHaveBeenCalledWith("*")
    expect(mockEq).toHaveBeenCalledWith("id", "user-123")
    expect(result).toEqual({ id: "user-123", business_name: "Test Co" })
  })

  // --- updateProfile ---

  it("updateProfile auth guard -> returns error when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { updateProfile } = await import("@/lib/actions/settings")

    const fd = makeFormData({ businessName: "X", email: "x@x.com" })
    const result = await updateProfile(fd)

    expect(result).toEqual({ error: "You must be logged in." })
  })

  it("updateProfile updates 'clients' table and logs to 'audit_log'", async () => {
    const mockClientUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    const mockAuditInsert = vi.fn().mockResolvedValue({ error: null })

    mockFrom.mockImplementation((table: string) => {
      if (table === "clients") return { update: mockClientUpdate }
      if (table === "audit_log") return { insert: mockAuditInsert }
      return {}
    })

    const { updateProfile } = await import("@/lib/actions/settings")

    const fd = makeFormData({
      businessName: "Updated Co",
      phone: "555-1234",
      email: "test@example.com", // same as mockUser.email, no auth update
    })
    const result = await updateProfile(fd)

    expect(result).toEqual({ success: true })
    expect(mockClientUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        business_name: "Updated Co",
        phone: "555-1234",
      })
    )
    expect(mockAuditInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: "user-123",
        event_type: "settings.profile_updated",
      })
    )
  })

  // --- updateCompany ---

  it("updateCompany auth guard -> returns error when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { updateCompany } = await import("@/lib/actions/settings")

    const fd = makeFormData({ industry: "healthcare" })
    const result = await updateCompany(fd)

    expect(result).toEqual({ error: "You must be logged in." })
  })

  it("updateCompany updates 'clients' table with vertical and plan", async () => {
    const mockClientUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === "clients") return { update: mockClientUpdate }
      if (table === "audit_log") return { insert: vi.fn().mockResolvedValue({ error: null }) }
      return {}
    })

    const { updateCompany } = await import("@/lib/actions/settings")

    const fd = makeFormData({ industry: "healthcare", plan: "enterprise" })
    const result = await updateCompany(fd)

    expect(result).toEqual({ success: true })
    expect(mockClientUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        vertical: "healthcare",
        plan: "enterprise",
      })
    )
  })

  // --- changePassword ---

  it("changePassword auth guard -> returns error when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { changePassword } = await import("@/lib/actions/settings")

    const fd = makeFormData({ newPassword: "newpass123", confirmPassword: "newpass123" })
    const result = await changePassword(fd)

    expect(result).toEqual({ error: "You must be logged in." })
  })

  it("changePassword calls auth.updateUser with new password", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "audit_log") return { insert: vi.fn().mockResolvedValue({ error: null }) }
      return {}
    })

    const { changePassword } = await import("@/lib/actions/settings")

    const fd = makeFormData({ newPassword: "newpass123", confirmPassword: "newpass123" })
    const result = await changePassword(fd)

    expect(result).toEqual({ success: true })
    expect(mockUpdateUser).toHaveBeenCalledWith({
      password: "newpass123",
      data: { business_name: "Test Co", requires_password_setup: false },
    })
  })

  it("changePassword rejects mismatched passwords", async () => {
    const { changePassword } = await import("@/lib/actions/settings")

    const fd = makeFormData({ newPassword: "newpass123", confirmPassword: "different" })
    const result = await changePassword(fd)

    expect(result).toEqual({ error: "Passwords do not match." })
  })

  // --- getNotificationPreferences ---

  it("getNotificationPreferences returns defaults when no data", async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: { notification_preferences: null },
    })
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

    mockFrom.mockImplementation((table: string) => {
      if (table === "clients") return { select: mockSelect }
      return {}
    })

    const { getNotificationPreferences } = await import("@/lib/actions/settings")
    const result = await getNotificationPreferences()

    expect(result).toEqual({
      regulatory_updates: true,
      document_reminders: true,
      weekly_summaries: true,
      incident_alerts: true,
      marketing_emails: false,
    })
  })

  // --- updateNotificationPreferences ---

  it("updateNotificationPreferences auth guard -> returns error when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { updateNotificationPreferences } = await import("@/lib/actions/settings")

    const result = await updateNotificationPreferences({ regulatory_updates: false })
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("updateNotificationPreferences updates 'clients' table", async () => {
    const mockClientUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === "clients") return { update: mockClientUpdate }
      return {}
    })

    const { updateNotificationPreferences } = await import("@/lib/actions/settings")

    const prefs = { regulatory_updates: true, marketing_emails: false }
    const result = await updateNotificationPreferences(prefs)

    expect(result).toEqual({ success: true })
    expect(mockClientUpdate).toHaveBeenCalledWith({
      notification_preferences: prefs,
    })
  })
})
