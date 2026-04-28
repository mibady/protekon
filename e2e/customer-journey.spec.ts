import { test, expect } from "@playwright/test"

import {
  getJourneyAdminClient,
  pollForUserCreation,
} from "./helpers/supabase-admin"
import { pollResendDelivery } from "./helpers/resend-poll"
import {
  cleanupJourneyTestUser,
  getJourneyStripe,
} from "./helpers/journey-cleanup"

/**
 * The single test that, if green, says a paying customer can sign up and
 * reach the dashboard. No mocks. Hits real Stripe (test mode), real
 * Supabase, real Inngest, real Resend.
 *
 * Step 6 (poll Resend for `delivered`) is the assertion that yesterday's
 * setup didn't have. It would have caught the unverified-domain bug
 * before a customer hit it.
 *
 * Designed to run nightly via `.github/workflows/journey-cron.yml` against
 * https://www.protekon.org. Local run:
 *   BASE_URL=https://www.protekon.org \
 *     JOURNEY_SUPABASE_URL=… JOURNEY_SUPABASE_SERVICE_ROLE_KEY=… \
 *     JOURNEY_STRIPE_SECRET_KEY=sk_test_… JOURNEY_RESEND_API_KEY=re_… \
 *     npx playwright test --project=journey
 */

test.describe("customer-journey", () => {
  // The flow can take a while: Stripe checkout 30s, webhook 5–15s,
  // Resend delivery 30–60s, magic-link login 5s, total budget ~3 min.
  test.setTimeout(180_000)

  let testEmail: string

  test.afterEach(async () => {
    if (!testEmail) return
    try {
      const admin = getJourneyAdminClient()
      const stripe = getJourneyStripe()
      const result = await cleanupJourneyTestUser(admin, stripe, testEmail)
      if (!result.ok) {
        console.warn(`[journey-cleanup] partial cleanup for ${testEmail}:`, result.errors)
      }
    } catch (err) {
      console.warn(`[journey-cleanup] failed entirely for ${testEmail}:`, err)
    }
  })

  test("pricing → checkout → webhook → email delivered → magic link → dashboard", async ({
    page,
  }) => {
    testEmail = `journey-${Date.now()}@protekon-test.com`

    // 1–2. Visit pricing and click the Core plan.
    await page.goto("/pricing")
    await page.waitForLoadState("domcontentloaded")
    // Be flexible: try a data-plan attribute, then a text match.
    const corePlanCta = page
      .locator('[data-plan="core"], a:has-text("Core"), button:has-text("Get started")')
      .first()
    await corePlanCta.click()

    // 3. Fill Stripe Checkout form. Stripe Hosted Checkout uses standard
    // form inputs (no iframes for the hosted page).
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 })
    await page.locator('input[name="email"]').fill(testEmail)
    await page.locator('input[name="cardNumber"]').fill("4242 4242 4242 4242")
    await page.locator('input[name="cardExpiry"]').fill("12 / 30")
    await page.locator('input[name="cardCvc"]').fill("123")
    await page.locator('input[name="billingName"]').fill("Journey Test")
    // Postal code field varies by country; try US ZIP first.
    const postal = page.locator('input[name="billingPostalCode"]')
    if (await postal.count()) await postal.fill("92501")
    await page.locator('button[type="submit"]').click()

    // 4. Land on /login?welcome=true&next=/onboarding/business
    await page.waitForURL(/\/login\?.*welcome=true/, { timeout: 60_000 })
    expect(page.url()).toContain("welcome=true")

    // 5. Poll Supabase admin: assert auth.users + clients rows exist.
    const admin = getJourneyAdminClient()
    const { userId } = await pollForUserCreation(admin, testEmail, {
      timeoutMs: 60_000,
      intervalMs: 3_000,
    })
    expect(userId).toBeTruthy()

    // 6. Poll Resend: assert email actually delivered (not just enqueued).
    const delivered = await pollResendDelivery(testEmail, {
      timeoutMs: 90_000,
      intervalMs: 5_000,
    })
    expect(delivered.last_event).toBe("delivered")

    // 7. Mint a fresh magic link server-side (Resend payload doesn't carry
    // the token) and visit it.
    const baseUrl = process.env.BASE_URL || "http://localhost:3000"
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: testEmail,
      options: { redirectTo: `${baseUrl}/dashboard` },
    })
    if (linkErr) throw linkErr
    const actionLink = linkData?.properties?.action_link
    expect(actionLink).toBeTruthy()
    await page.goto(actionLink!)

    // 8. Assert the magic link landed us inside the authenticated app —
    // either dashboard or onboarding step. Either is acceptable.
    await page.waitForLoadState("networkidle")
    expect(page.url()).toMatch(/\/(dashboard|onboarding)/)
  })
})
