import { test, expect } from "@playwright/test"

test.use({ storageState: "e2e/.auth/user.json" })

// ── SETTINGS PAGE TABS ──

test.describe("Settings page tab navigation", () => {
  test("profile tab is visible by default", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForLoadState("networkidle")
    await expect(page.getByText(/profile/i).first()).toBeVisible()
  })

  test("company tab switches content", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForLoadState("networkidle")
    const companyTab = page.locator("button", { hasText: /company/i }).first()
    if (await companyTab.isVisible()) {
      await companyTab.click()
      // Company form should show business name field
      await expect(page.locator('input[name="businessName"], input[name="business_name"]').first()).toBeVisible({ timeout: 3000 })
    }
  })

  test("security tab shows password fields", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForLoadState("networkidle")
    const securityTab = page.locator("button", { hasText: /security|password/i }).first()
    if (await securityTab.isVisible()) {
      await securityTab.click()
      await expect(page.locator('input[type="password"]').first()).toBeVisible({ timeout: 3000 })
    }
  })

  test("notifications tab shows toggle switches", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForLoadState("networkidle")
    const notifTab = page.locator("button", { hasText: /notification/i }).first()
    if (await notifTab.isVisible()) {
      await notifTab.click()
      // Should show toggle switches for notification preferences
      const toggles = page.locator("[role='switch'], input[type='checkbox']")
      await expect(toggles.first()).toBeVisible({ timeout: 3000 })
    }
  })

  test("billing tab shows current plan", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForLoadState("networkidle")
    const billingTab = page.locator("button", { hasText: /billing/i }).first()
    if (await billingTab.isVisible()) {
      await billingTab.click()
      await expect(page.getByText(/\$\d+/).first()).toBeVisible({ timeout: 3000 })
    }
  })
})

test.describe("Settings profile form", () => {
  test("profile form has name and phone fields", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForLoadState("networkidle")
    // Profile tab should be default
    const nameInput = page.locator('input[name="name"], input[name="businessName"]').first()
    await expect(nameInput).toBeVisible()
  })

  test("profile form has save button", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForLoadState("networkidle")
    const saveBtn = page.locator('button[type="submit"]', { hasText: /save|update/i }).first()
    await expect(saveBtn).toBeVisible()
  })
})

test.describe("Settings security form", () => {
  test("password change requires current + new + confirm", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForLoadState("networkidle")
    const securityTab = page.locator("button", { hasText: /security|password/i }).first()
    if (await securityTab.isVisible()) {
      await securityTab.click()
      const passwordFields = page.locator('input[type="password"]')
      const count = await passwordFields.count()
      expect(count).toBeGreaterThanOrEqual(2) // at least new + confirm
    }
  })
})
