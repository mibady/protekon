/**
 * Vitest setup: stub @/lib/billing-guard.requirePaidAuth so unit tests don't
 * hit Next's `cookies()` outside a request scope.
 *
 * Strategy: delegate to the existing getAuth() mock that legacy tests already
 * set up via vi.mock("@/lib/actions/shared", ...). When a test mocks getAuth,
 * requirePaidAuth resolves with the same supabase + clientId — preserving the
 * test's existing mockFrom assertions. Tests that need to assert paywall codes
 * can still override requirePaidAuth per-test.
 */
import { vi } from "vitest"

vi.mock("@/lib/billing-guard", () => {
  const TEST_USER = {
    id: "00000000-0000-0000-0000-000000000001",
    email: "test@example.com",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
  }

  return {
    requirePaidAuth: vi.fn(async () => {
      // Defer to getAuth() — tests typically mock @/lib/actions/shared with
      // a synthetic supabase + clientId. Reuse it so existing assertions hold.
      try {
        const shared = await import("@/lib/actions/shared")
        const auth = await shared.getAuth()
        if (!auth.clientId) {
          return {
            supabase: null as any,
            clientId: null as any,
            user: null as any,
            error: "UNAUTHENTICATED" as const,
            message: "Please log in to continue.",
          }
        }
        return {
          supabase: auth.supabase as any,
          clientId: auth.clientId,
          user: { ...TEST_USER, id: auth.clientId },
          error: null,
          message: null,
        }
      } catch {
        return {
          supabase: { from: vi.fn() } as any,
          clientId: TEST_USER.id,
          user: TEST_USER,
          error: null,
          message: null,
        }
      }
    }),
  }
})
