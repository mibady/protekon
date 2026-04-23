import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock user returned by auth
const mockUser = {
  id: "user-123",
  email: "test@example.com",
  user_metadata: {
    business_name: "Test Co",
    vertical: "construction",
    plan: "professional",
    location_count: 3,
  },
}

// Track calls to supabase methods
const mockSignInWithPassword = vi.fn()
const mockSignUp = vi.fn()
const mockResetPasswordForEmail = vi.fn()
const mockSignOut = vi.fn()
const mockUpsert = vi.fn().mockResolvedValue({ error: null })

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      resetPasswordForEmail: mockResetPasswordForEmail,
      signOut: mockSignOut,
    },
  }),
}))

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "clients") return { upsert: mockUpsert }
      return {}
    }),
  })),
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

describe("auth actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to build FormData
  function makeFormData(entries: Record<string, string>): FormData {
    const fd = new FormData()
    for (const [k, v] of Object.entries(entries)) {
      fd.set(k, v)
    }
    return fd
  }

  // --- signIn ---

  it("signIn success -> calls signInWithPassword, redirects to /dashboard", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    const { signIn } = await import("@/lib/actions/auth")

    const fd = makeFormData({ email: "a@b.com", password: "pass123" })

    await expect(signIn(fd)).rejects.toThrow("REDIRECT:/dashboard")
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "pass123",
    })
  })

  it("signIn error -> returns { error: message }", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid credentials" },
    })
    const { signIn } = await import("@/lib/actions/auth")

    const fd = makeFormData({ email: "a@b.com", password: "wrong" })
    const result = await signIn(fd)

    expect(result).toEqual({ error: "Invalid credentials" })
  })

  // --- signUp ---

  it("signUp success -> calls auth.signUp with metadata, creates client record, redirects to /dashboard/intake", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "new-user-1" } },
      error: null,
    })
    const { signUp } = await import("@/lib/actions/auth")

    const fd = makeFormData({
      email: "new@co.com",
      password: "password123",
      businessName: "New Co",
      vertical: "construction",
      plan: "professional",
      locationCount: "5",
    })

    await expect(signUp(fd)).rejects.toThrow("REDIRECT:/onboarding/business")

    expect(mockSignUp).toHaveBeenCalledWith({
      email: "new@co.com",
      password: "password123",
      options: {
        data: {
          business_name: "New Co",
          vertical: "construction",
          plan: "professional",
          location_count: 5,
        },
      },
    })
  })

  it("signUp stores correct user_metadata (business_name, vertical, plan, location_count)", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "new-user-2" } },
      error: null,
    })
    const { signUp } = await import("@/lib/actions/auth")

    const fd = makeFormData({
      email: "meta@co.com",
      password: "password123",
      businessName: "Meta Co",
      vertical: "healthcare",
      plan: "enterprise",
      locationCount: "10",
    })

    await expect(signUp(fd)).rejects.toThrow("REDIRECT:")

    const callArgs = mockSignUp.mock.calls[0][0]
    expect(callArgs.options.data).toEqual({
      business_name: "Meta Co",
      vertical: "healthcare",
      plan: "enterprise",
      location_count: 10,
    })
  })

  it("signUp creates client with compliance_score:0, risk_level:'high', status:'active'", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "new-user-3" } },
      error: null,
    })
    const { signUp } = await import("@/lib/actions/auth")

    const fd = makeFormData({
      email: "client@co.com",
      password: "password123",
      businessName: "Client Co",
      vertical: "construction",
      plan: "core",
      locationCount: "1",
    })

    await expect(signUp(fd)).rejects.toThrow("REDIRECT:")

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "new-user-3",
        compliance_score: 0,
        risk_level: "high",
        status: "active",
      }),
      { onConflict: "id" }
    )
  })

  it("signUp error -> returns { error: message }", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: "Email already registered" },
    })
    const { signUp } = await import("@/lib/actions/auth")

    const fd = makeFormData({
      email: "dupe@co.com",
      password: "password123",
      businessName: "Dupe Co",
      vertical: "construction",
      plan: "core",
      locationCount: "1",
    })

    const result = await signUp(fd)
    expect(result).toEqual({ error: "Email already registered" })
  })

  // --- forgotPassword ---

  it("forgotPassword success -> calls resetPasswordForEmail, returns { success: true }", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    const { forgotPassword } = await import("@/lib/actions/auth")

    const fd = makeFormData({ email: "forgot@co.com" })
    const result = await forgotPassword(fd)

    expect(result).toEqual({ success: true })
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      "forgot@co.com",
      expect.objectContaining({ redirectTo: expect.stringContaining("/auth/callback") })
    )
  })

  it("forgotPassword error -> returns { error: message }", async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: "User not found" },
    })
    const { forgotPassword } = await import("@/lib/actions/auth")

    const fd = makeFormData({ email: "ghost@co.com" })
    const result = await forgotPassword(fd)

    expect(result).toEqual({ error: "User not found" })
  })

  // --- signOut ---

  it("signOut -> calls auth.signOut, redirects to /login", async () => {
    mockSignOut.mockResolvedValue({ error: null })
    const { signOut } = await import("@/lib/actions/auth")

    await expect(signOut()).rejects.toThrow("REDIRECT:/login")
    expect(mockSignOut).toHaveBeenCalled()
  })

  // --- signUp defaults ---

  it("signUp with defaults -> vertical defaults to 'other', plan defaults to 'core'", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "default-user" } },
      error: null,
    })
    const { signUp } = await import("@/lib/actions/auth")

    // Omit vertical and plan from form data
    const fd = makeFormData({
      email: "default@co.com",
      password: "password123",
      businessName: "Default Co",
      vertical: "",
      plan: "",
      locationCount: "1",
    })

    await expect(signUp(fd)).rejects.toThrow("REDIRECT:")

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        vertical: "other",
        plan: "core",
      }),
      { onConflict: "id" }
    )
  })
})
