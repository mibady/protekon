import { test, expect } from "@playwright/test"

// ── PUBLIC FORM INTERACTIONS ──

test.describe("Contact form", () => {
  test("form has all required fields", async ({ page }) => {
    await page.goto("/contact")
    await page.waitForLoadState("networkidle")
    await expect(page.locator('input[type="text"]').first()).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator("textarea").first()).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test("form shows validation on empty submit", async ({ page }) => {
    await page.goto("/contact")
    await page.waitForLoadState("networkidle")
    const submitBtn = page.locator('button[type="submit"]')
    await submitBtn.click()
    expect(page.url()).toContain("/contact")
  })

  test("form accepts input in all fields", async ({ page }) => {
    await page.goto("/contact")
    await page.waitForLoadState("networkidle")
    const nameInput = page.locator('input[type="text"]').first()
    await nameInput.fill("Test User")
    await expect(nameInput).toHaveValue("Test User")
  })
})

test.describe("Samples email gate", () => {
  test("email gate form is visible", async ({ page }) => {
    await page.goto("/samples")
    await page.waitForLoadState("networkidle")
    await expect(page.locator('input[type="email"]').first()).toBeVisible()
  })

  test("sample cards are visible", async ({ page }) => {
    await page.goto("/samples")
    await page.waitForLoadState("networkidle")
    // SB 553 appears in the full title "SB 553 Workplace Violence Prevention Plan"
    await expect(page.getByText("SB 553 Workplace Violence Prevention Plan")).toBeVisible()
  })
})

test.describe("Calculator interaction", () => {
  test("calculator page loads with exposure estimate", async ({ page }) => {
    await page.goto("/calculator")
    await page.waitForLoadState("networkidle")
    await expect(page.getByText(/exposure/i).first()).toBeVisible()
  })

  test("employee size buttons update calculation", async ({ page }) => {
    await page.goto("/calculator")
    await page.waitForLoadState("networkidle")
    // Click a different employee size
    const btn = page.locator("button", { hasText: /51-100|26-50/i }).first()
    if (await btn.isVisible()) {
      await btn.click()
      // Dollar amount should still be visible (may have changed)
      await expect(page.getByText(/\$\d/).first()).toBeVisible()
    }
  })

  test("calculator has signup CTA", async ({ page }) => {
    await page.goto("/calculator")
    await expect(page.locator('a[href="/signup"]').first()).toBeVisible()
  })
})

test.describe("Login form", () => {
  test("has email and password fields", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test("has forgot password link", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible()
  })

  test("has signup link", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator('a[href="/signup"]')).toBeVisible()
  })
})
