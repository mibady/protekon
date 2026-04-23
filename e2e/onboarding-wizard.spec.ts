/**
 * Onboarding Wizard E2E — construction + healthcare happy paths
 *
 * Target account: e2e-test@protekon.com (TEST_EMAIL env var)
 * Password:       ProtekonTest123!    (TEST_PASSWORD env var)
 *
 * What this mutates:
 *   - Runs `scripts/reset-onboarding.ts` before each test via execSync.
 *     This clears child-table rows and resets clients.onboarding_status to
 *     "not_started", last_onboarding_step_completed to 0, onboarded_at to null.
 *   - Updates clients.vertical to the target vertical via Supabase admin API
 *     before each test (the reset script preserves vertical, so we override
 *     explicitly here to guarantee the correct config is loaded).
 *   - Completes the full onboarding flow, which sets onboarding_status =
 *     "completed" and onboarded_at = <timestamp> on the clients row.
 *
 * Prerequisites:
 *   - Dev server running on http://localhost:3000 (or BASE_URL env var)
 *   - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
 *     SUPABASE_SERVICE_ROLE_KEY set in .env.local
 *   - Auth session fixture produced by auth.setup.ts (e2e/.auth/user.json)
 *   - tsx installed (npx tsx scripts/reset-onboarding.ts)
 *
 * Run:
 *   npx playwright test e2e/onboarding-wizard.spec.ts --project=onboarding
 *
 * Or against a running dev server without the webServer manager:
 *   BASE_URL=http://localhost:3000 npx playwright test e2e/onboarding-wizard.spec.ts --project=onboarding
 */

import { execSync } from "child_process"
import { test, expect, type Page } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"
import { loadEnvConfig } from "@next/env"

// Load .env.local so env vars are available in the test process
loadEnvConfig(process.cwd())

// ─── constants ────────────────────────────────────────────────────────────────

const TEST_EMAIL = process.env.TEST_EMAIL ?? "e2e-test@protekon.com"
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? "ProtekonTest123!"
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""

/** Timeout for full-page navigations that trigger server actions */
const NAV_TIMEOUT = 20_000

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Reset the test account's onboarding state and force-set a vertical.
 * The reset script preserves the vertical column (NOT NULL), so we patch
 * it explicitly after the reset to guarantee the right config loads.
 */
async function resetAccount(vertical: "construction" | "healthcare") {
  const missingEnv =
    !SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY

  if (missingEnv) {
    console.warn(
      "[onboarding-wizard] Missing Supabase env vars — skipping reset. " +
        "Tests will run against whatever state is already in the DB.",
    )
    return
  }

  // 1. Run the CLI reset script — clears child rows + resets onboarding cols
  try {
    execSync(`npx tsx scripts/reset-onboarding.ts ${TEST_EMAIL}`, {
      stdio: "pipe",
      cwd: process.cwd(),
      timeout: 30_000,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[onboarding-wizard] reset-onboarding.ts failed: ${msg}`)
    // Non-fatal — tests may still pass if DB is already clean
  }

  // 2. Force the vertical on the clients row so the correct step config loads
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error } = await admin
    .from("clients")
    .update({ vertical })
    .eq("email", TEST_EMAIL)

  if (error) {
    console.warn(
      `[onboarding-wizard] Could not patch vertical to '${vertical}': ${error.message}`,
    )
  }
}

/**
 * Sign the test account in by injecting @supabase/ssr-style chunked cookies.
 * Mirrors the strategy in auth.setup.ts.
 */
async function signIn(page: Page) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // Fallback: hit the login page with credentials form
    await page.goto("/login")
    await page.getByLabel(/email/i).fill(TEST_EMAIL)
    await page.getByLabel(/password/i).fill(TEST_PASSWORD)
    await page.getByRole("button", { name: /sign in|log in/i }).click()
    await page.waitForURL(/\/dashboard|\/onboarding/, { timeout: NAV_TIMEOUT })
    return
  }

  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await authClient.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  })

  if (error || !data.session) {
    throw new Error(
      `[onboarding-wizard] signIn failed: ${error?.message ?? "no session"}`,
    )
  }

  const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0]
  const cookieBase = `sb-${projectRef}-auth-token`
  const cookieValue = JSON.stringify({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    provider_token: null,
    provider_refresh_token: null,
    expires_at: data.session.expires_at,
    expires_in: data.session.expires_in,
    token_type: "bearer",
    user: data.session.user,
  })

  const CHUNK_SIZE = 3180
  const encoded = Buffer.from(cookieValue).toString("base64")
  const chunks: string[] = []
  for (let i = 0; i < encoded.length; i += CHUNK_SIZE) {
    chunks.push(encoded.slice(i, i + CHUNK_SIZE))
  }

  await page.context().addCookies(
    chunks.map((chunk, i) => ({
      name: `${cookieBase}.${i}`,
      value: chunk,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax" as const,
    })),
  )
}

/**
 * Assert that the clients row for the test account has onboarding completed.
 */
async function assertOnboardingComplete() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[onboarding-wizard] Cannot query DB — skipping DB assertion")
    return
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await admin
    .from("clients")
    .select("onboarding_status, onboarded_at")
    .eq("email", TEST_EMAIL)
    .maybeSingle()

  expect(error, `DB query error: ${error?.message}`).toBeNull()
  expect(data?.onboarding_status).toBe("completed")
  expect(data?.onboarded_at).not.toBeNull()
}

/**
 * Sign out by clearing cookies and navigating to /login, then sign back in
 * and verify the app routes directly to /dashboard (skip onboarding gate).
 */
async function assertSecondLoginSkipsOnboarding(page: Page) {
  // Clear session cookies
  await page.context().clearCookies()

  // Re-auth
  await signIn(page)
  await page.goto("/onboarding/business", { waitUntil: "domcontentloaded" })
  await page.waitForLoadState("networkidle")

  // Completed onboarding should redirect away from /onboarding/* to /dashboard
  expect(page.url()).toContain("/dashboard")
}

// ─── Step helpers ─────────────────────────────────────────────────────────────

/**
 * Step 1 — Business Snapshot
 * Selects the industry, picks one operating state, and picks a workforce size.
 * Returns when the router pushes to /onboarding/tools.
 */
async function fillStep1(page: Page, vertical: "construction" | "healthcare") {
  await page.waitForURL(/\/onboarding\/business/, { timeout: NAV_TIMEOUT })

  // Select industry via shadcn <Select>
  await page.getByRole("combobox").click()

  const label = vertical === "construction" ? "Construction" : "Healthcare"
  await page.getByRole("option", { name: label }).click()

  // Pick operating state — open the combobox popover
  await page.getByRole("button", { name: /select states/i }).click()
  // Type to filter and pick California
  await page.getByPlaceholder("Search states...").fill("California")
  await page.getByRole("option", { name: /California/ }).click()
  // Close popover by pressing Escape
  await page.keyboard.press("Escape")

  // Pick workforce size — aria-pressed buttons
  await page.getByRole("button", { name: /1.10/i }).click()

  // Submit
  await page.getByRole("button", { name: /continue/i }).click()
  await page.waitForURL(/\/onboarding\/tools/, { timeout: NAV_TIMEOUT })
}

/**
 * Step 2 — Connect Tools
 * No required input; just click Continue.
 */
async function fillStep2(page: Page) {
  await page.waitForURL(/\/onboarding\/tools/, { timeout: NAV_TIMEOUT })
  await page.getByRole("button", { name: /continue/i }).click()
  await page.waitForURL(/\/onboarding\/sites/, { timeout: NAV_TIMEOUT })
}

/**
 * Step 3 — Sites
 * Fills the primary site name and clicks Continue.
 */
async function fillStep3(page: Page) {
  await page.waitForURL(/\/onboarding\/sites/, { timeout: NAV_TIMEOUT })

  // Fill the first (primary) site name field
  const nameInput = page.getByLabel(/site name|location name|jobsite name/i).first()
  if (await nameInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await nameInput.fill("E2E Test Site")
  } else {
    // Fallback: find any visible text input that is empty
    const inputs = page.locator('input[type="text"]')
    const count = await inputs.count()
    if (count > 0) {
      await inputs.first().fill("E2E Test Site")
    }
  }

  await page.getByRole("button", { name: /continue/i }).click()
  await page.waitForURL(/\/onboarding\/people/, { timeout: NAV_TIMEOUT })
}

/**
 * Step 4 — People
 * Skips (no required input); clicks Continue.
 */
async function fillStep4(page: Page) {
  await page.waitForURL(/\/onboarding\/people/, { timeout: NAV_TIMEOUT })
  await page.getByRole("button", { name: /continue/i }).click()
  // Next step depends on vertical — caller checks the URL
}

/**
 * Step 5 — Third Parties (construction only)
 * Skips adding a sub; clicks Continue.
 */
async function fillStep5ThirdParties(page: Page) {
  await page.waitForURL(/\/onboarding\/subs/, { timeout: NAV_TIMEOUT })
  await page.getByRole("button", { name: /continue/i }).click()
  await page.waitForURL(/\/onboarding\/documents/, { timeout: NAV_TIMEOUT })
}

/**
 * Step 6 — Documents
 * No required upload; clicks Continue.
 */
async function fillStep6(page: Page) {
  await page.waitForURL(/\/onboarding\/documents/, { timeout: NAV_TIMEOUT })
  await page.getByRole("button", { name: /continue/i }).click()
  await page.waitForURL(/\/onboarding\/automations/, { timeout: NAV_TIMEOUT })
}

/**
 * Step 7 — Automations
 * Clicks "Launch my dashboard" and waits for /dashboard.
 */
async function fillStep7(page: Page) {
  await page.waitForURL(/\/onboarding\/automations/, { timeout: NAV_TIMEOUT })
  await page.getByRole("button", { name: /launch my dashboard/i }).click()
  await page.waitForURL(/\/dashboard/, { timeout: NAV_TIMEOUT })
}

// ─── tests ────────────────────────────────────────────────────────────────────

test.describe("Onboarding wizard — happy paths", () => {
  // Use chromium with no pre-loaded storage state; we inject cookies ourselves
  // so each test starts clean and can vary the vertical.
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Test A — construction: all 7 steps visible, third-parties ON", async ({
    page,
  }) => {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      test.skip(
        true,
        "Missing SUPABASE_SERVICE_ROLE_KEY — cannot reset or assert DB state. " +
          "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and " +
          "SUPABASE_SERVICE_ROLE_KEY in .env.local.",
      )
      return
    }

    // ── setup ──
    await resetAccount("construction")
    await signIn(page)

    // ── navigate to wizard ──
    await page.goto("/onboarding/business", { waitUntil: "domcontentloaded" })
    await page.waitForLoadState("networkidle")

    // If already completed (reset failed) middleware may redirect to /dashboard
    if (page.url().includes("/dashboard")) {
      test.skip(
        true,
        "Account is in completed state and reset did not work — skipping.",
      )
      return
    }

    // Step 1 — Business Snapshot → /onboarding/tools
    await fillStep1(page, "construction")

    // Step 2 — Connect Tools → /onboarding/sites
    await fillStep2(page)

    // Step 3 — Sites → /onboarding/people
    await fillStep3(page)

    // Step 4 — People → /onboarding/subs  (construction has thirdParties: true)
    await fillStep4(page)
    await page.waitForURL(/\/onboarding\/subs/, { timeout: NAV_TIMEOUT })
    // Assert we landed on subs, not documents
    expect(page.url()).toContain("/onboarding/subs")

    // Step 5 — Third Parties → /onboarding/documents
    await fillStep5ThirdParties(page)

    // Step 6 — Documents → /onboarding/automations
    await fillStep6(page)

    // Step 7 — Automations → /dashboard
    await fillStep7(page)

    // ── assert dashboard ──
    expect(page.url()).toContain("/dashboard")

    // ── assert DB state ──
    await assertOnboardingComplete()

    // ── assert second login skips wizard ──
    await assertSecondLoginSkipsOnboarding(page)
  })

  test("Test B — healthcare: Step 5 (subs) hidden, third-parties OFF", async ({
    page,
  }) => {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      test.skip(
        true,
        "Missing SUPABASE_SERVICE_ROLE_KEY — cannot reset or assert DB state. " +
          "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and " +
          "SUPABASE_SERVICE_ROLE_KEY in .env.local.",
      )
      return
    }

    // ── setup ──
    await resetAccount("healthcare")
    await signIn(page)

    // ── navigate to wizard ──
    await page.goto("/onboarding/business", { waitUntil: "domcontentloaded" })
    await page.waitForLoadState("networkidle")

    if (page.url().includes("/dashboard")) {
      test.skip(
        true,
        "Account is in completed state and reset did not work — skipping.",
      )
      return
    }

    // Step 1 — Business Snapshot → /onboarding/tools
    await fillStep1(page, "healthcare")

    // Step 2 — Connect Tools → /onboarding/sites
    await fillStep2(page)

    // Step 3 — Sites → /onboarding/people
    await fillStep3(page)

    // Step 4 — People → should jump to /onboarding/documents (subs hidden)
    await fillStep4(page)

    // KEY ASSERTION: after Step 4 Continue, URL must NOT be /onboarding/subs
    // Healthcare has stepVisibility.thirdParties = false, so Step 5 is skipped.
    await page.waitForURL(/\/onboarding\/(documents|subs)/, {
      timeout: NAV_TIMEOUT,
    })
    expect(page.url()).not.toContain("/onboarding/subs")
    expect(page.url()).toContain("/onboarding/documents")

    // Step 6 — Documents → /onboarding/automations
    await fillStep6(page)

    // Step 7 — Automations → /dashboard
    await fillStep7(page)

    // ── assert dashboard ──
    expect(page.url()).toContain("/dashboard")

    // ── assert DB state ──
    await assertOnboardingComplete()

    // ── assert second login skips wizard ──
    await assertSecondLoginSkipsOnboarding(page)
  })
})
