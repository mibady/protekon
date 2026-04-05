import { test, expect } from "@playwright/test"

// ── PARTNER PAGES (public, no auth needed) ──

test.describe("Partner landing page", () => {
  test("/partners loads with partner value props", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))
    await page.goto("/partners")
    await page.waitForLoadState("networkidle")
    expect(errors).toHaveLength(0)
    await expect(page.getByText(/partner/i).first()).toBeVisible()
  })

  test("/partners has Apply Now CTA", async ({ page }) => {
    await page.goto("/partners")
    await expect(page.locator('a[href="/partners/apply"]').first()).toBeVisible()
  })

  test("/partners has pricing CTA", async ({ page }) => {
    await page.goto("/partners")
    await expect(page.locator('a[href="/partners/pricing"]').first()).toBeVisible()
  })
})

test.describe("Partner pricing page", () => {
  test("/partners/pricing shows tier cards", async ({ page }) => {
    await page.goto("/partners/pricing")
    await page.waitForLoadState("networkidle")
    // Should show partner tier pricing
    await expect(page.getByText(/partner/i).first()).toBeVisible()
    // Should have Apply CTA
    await expect(page.locator('a[href="/partners/apply"]').first()).toBeVisible()
  })
})

test.describe("Partner application form", () => {
  test("/partners/apply loads step 1", async ({ page }) => {
    await page.goto("/partners/apply")
    await page.waitForLoadState("networkidle")
    // Step 1 should show business type and client count fields
    await expect(page.locator("select, input").first()).toBeVisible()
  })

  test("/partners/apply has form fields", async ({ page }) => {
    await page.goto("/partners/apply")
    await page.waitForLoadState("networkidle")
    // Should show form with selects for business type, client count etc
    const formElements = page.locator("select, input")
    expect(await formElements.count()).toBeGreaterThan(0)
  })
})

test.describe("Partner boot camp", () => {
  test("/partners/boot-camp loads with training modules", async ({ page }) => {
    await page.goto("/partners/boot-camp")
    await page.waitForLoadState("networkidle")
    // Should show training curriculum content
    await expect(page.getByText(/boot camp|training|module/i).first()).toBeVisible()
  })

  test("/partners/boot-camp has expandable sections", async ({ page }) => {
    await page.goto("/partners/boot-camp")
    await page.waitForLoadState("networkidle")
    // Look for accordion/expandable sections
    const buttons = page.locator("button, [role='button'], details summary")
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
  })
})
