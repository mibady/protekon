import { test, expect } from "@playwright/test"

// ── SCORE WIZARD (public, 4-step flow) ──

test.describe("Score wizard page", () => {
  test("/score loads without errors", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))
    await page.goto("/score")
    await page.waitForLoadState("networkidle")
    expect(errors).toHaveLength(0)
  })

  test("step 1 shows industry and employee count fields", async ({ page }) => {
    await page.goto("/score")
    await page.waitForLoadState("networkidle")
    // Step 1 shows the business context form with labels
    await expect(page.getByText("Tell us about your business")).toBeVisible()
    await expect(page.locator("select").first()).toBeVisible()
  })

  test("Next button is disabled until industry + employee count are filled", async ({ page }) => {
    await page.goto("/score")
    await page.waitForLoadState("networkidle")
    const nextBtn = page.locator("button", { hasText: "Next" })
    await expect(nextBtn).toBeDisabled()
  })

  test("step 1 → step 2 transition after filling required fields", async ({ page }) => {
    await page.goto("/score")
    await page.waitForLoadState("networkidle")

    // Fill industry (first select)
    const selects = page.locator("select")
    await selects.nth(0).selectOption({ index: 1 })
    // Fill employee count (second select)
    await selects.nth(1).selectOption({ index: 1 })

    // Next should now be enabled
    const nextBtn = page.locator("button", { hasText: "Next" })
    await expect(nextBtn).toBeEnabled()
    await nextBtn.click()

    // Step 2 shows compliance questions
    await expect(page.getByText(/step 2 of 4/i)).toBeVisible({ timeout: 5000 })
  })

  test("step 2 shows compliance yes/no questions", async ({ page }) => {
    await page.goto("/score")
    await page.waitForLoadState("networkidle")

    // Navigate to step 2
    const selects = page.locator("select")
    await selects.nth(0).selectOption({ index: 1 })
    await selects.nth(1).selectOption({ index: 1 })
    await page.locator("button", { hasText: "Next" }).click()
    await expect(page.getByText(/step 2 of 4/i)).toBeVisible({ timeout: 5000 })

    // Should show IIPP question
    await expect(page.getByText("Injury & Illness Prevention Program")).toBeVisible()
  })

  test("score ring SVG is visible", async ({ page }) => {
    await page.goto("/score")
    await page.waitForLoadState("networkidle")
    const svg = page.locator("svg")
    expect(await svg.count()).toBeGreaterThan(0)
  })

  test("step progress indicator shows Step 1 of 4", async ({ page }) => {
    await page.goto("/score")
    await page.waitForLoadState("networkidle")
    await expect(page.getByText(/step 1 of 4/i)).toBeVisible()
  })

  test("page has business context heading", async ({ page }) => {
    await page.goto("/score")
    await page.waitForLoadState("networkidle")
    await expect(page.getByText("Tell us about your business")).toBeVisible()
  })
})
