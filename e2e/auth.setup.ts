import { test as setup, expect } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"

const TEST_EMAIL = process.env.TEST_EMAIL || "e2e-test@protekon.com"
const TEST_PASSWORD = process.env.TEST_PASSWORD || "ProtekonTest123!"

/**
 * Auth setup: ensures a test user exists, then logs in via the UI
 * and saves the session cookies for authenticated tests.
 */
setup("authenticate", async ({ page }) => {
  // Step 1: Ensure test user exists in Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Try to create user (ignore if already exists)
    const { error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { business_name: "E2E Test Co", vertical: "construction" },
    })

    if (error && !error.message.includes("already been registered")) {
      console.warn(`Could not create test user: ${error.message}`)
    }

    // Ensure client record exists
    const { data: users } = await supabase.auth.admin.listUsers()
    const testUser = users?.users.find((u) => u.email === TEST_EMAIL)
    if (testUser) {
      await supabase.from("clients").upsert(
        {
          id: testUser.id,
          email: TEST_EMAIL,
          business_name: "E2E Test Co",
          vertical: "construction",
          status: "active",
          plan: "professional",
          compliance_score: 78,
          risk_level: "medium",
        },
        { onConflict: "id" }
      )
    }
  }

  // Step 2: Log in via the UI
  await page.goto("/login", { waitUntil: "domcontentloaded" })

  await page.locator('input[type="email"], input[name="email"]').first().fill(TEST_EMAIL)
  await page.locator('input[type="password"], input[name="password"]').first().fill(TEST_PASSWORD)
  await page.locator('button[type="submit"]').first().click()

  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 10000 })
  await expect(page.locator("body")).not.toBeEmpty()

  // Step 3: Save authenticated state
  await page.context().storageState({ path: "e2e/.auth/user.json" })
})
