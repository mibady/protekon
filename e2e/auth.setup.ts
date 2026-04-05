import { test as setup, expect } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"

const TEST_EMAIL = process.env.TEST_EMAIL || "e2e-test@protekon.com"
const TEST_PASSWORD = process.env.TEST_PASSWORD || "ProtekonTest123!"

/**
 * Auth setup: ensures a test user exists in Supabase, signs in via API,
 * then injects the session as cookies so the middleware accepts it.
 */
setup("authenticate", async ({ page, context }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    console.warn("Missing Supabase env vars — skipping auth setup")
    await page.goto("/login")
    await context.storageState({ path: "e2e/.auth/user.json" })
    return
  }

  // Step 1: Ensure test user exists via admin API
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: existingUsers } = await admin.auth.admin.listUsers()
  const existing = existingUsers?.users.find((u) => u.email === TEST_EMAIL)
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      password: TEST_PASSWORD,
    })
  } else {
    await admin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { business_name: "E2E Test Co", vertical: "construction" },
    })
  }

  // Ensure client record exists
  const { data: users } = await admin.auth.admin.listUsers()
  const testUser = users?.users.find((u) => u.email === TEST_EMAIL)
  if (testUser) {
    await admin.from("clients").upsert(
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

  // Step 2: Sign in via Supabase API
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: signInData, error: signInError } =
    await authClient.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    })

  if (signInError || !signInData.session) {
    throw new Error(
      `Auth setup failed: ${signInError?.message || "No session returned"}`
    )
  }

  // Step 3: Inject session as cookies
  // @supabase/ssr stores auth in chunked cookies: sb-<ref>-auth-token.0, .1, etc.
  const projectRef = new URL(supabaseUrl).hostname.split(".")[0]
  const cookieBase = `sb-${projectRef}-auth-token`

  // Build the cookie value (same format @supabase/ssr uses)
  const cookieValue = JSON.stringify({
    access_token: signInData.session.access_token,
    refresh_token: signInData.session.refresh_token,
    provider_token: null,
    provider_refresh_token: null,
    expires_at: signInData.session.expires_at,
    expires_in: signInData.session.expires_in,
    token_type: "bearer",
    user: signInData.session.user,
  })

  // @supabase/ssr chunks cookies at ~3180 chars. Encode as base64.
  const encoded = Buffer.from(cookieValue).toString("base64")
  const CHUNK_SIZE = 3180
  const chunks = []
  for (let i = 0; i < encoded.length; i += CHUNK_SIZE) {
    chunks.push(encoded.slice(i, i + CHUNK_SIZE))
  }

  const cookies = chunks.map((chunk, i) => ({
    name: `${cookieBase}.${i}`,
    value: chunk,
    domain: "localhost",
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "Lax" as const,
  }))

  await context.addCookies(cookies)

  // Step 4: Verify dashboard loads
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" })
  await page.waitForLoadState("networkidle")

  // If still on login, the cookie format might differ — try raw JSON
  if (page.url().includes("/login")) {
    // Try non-base64 chunked format
    const rawChunks = []
    for (let i = 0; i < cookieValue.length; i += CHUNK_SIZE) {
      rawChunks.push(cookieValue.slice(i, i + CHUNK_SIZE))
    }
    const rawCookies = rawChunks.map((chunk, i) => ({
      name: `${cookieBase}.${i}`,
      value: chunk,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax" as const,
    }))
    await context.clearCookies()
    await context.addCookies(rawCookies)
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" })
    await page.waitForLoadState("networkidle")
  }

  expect(page.url()).toContain("/dashboard")

  // Step 5: Save authenticated state
  await context.storageState({ path: "e2e/.auth/user.json" })
})
