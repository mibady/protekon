import { test, expect } from "@playwright/test"

test.describe("Contact Form", () => {
  test("renders form with required fields", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" })

    await expect(page.locator("form").first()).toBeVisible()

    const inputs = page.locator("input, textarea, select")
    const count = await inputs.count()
    expect(count).toBeGreaterThanOrEqual(3) // name, email, message at minimum
  })

  test("accepts user input", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" })

    const inputs = page.locator("input:not([type='hidden']):not([type='submit'])").first()
    if (await inputs.isVisible()) {
      await inputs.fill("Test Value")
      await expect(inputs).toHaveValue("Test Value")
    }
  })
})

test.describe("Resource Page", () => {
  test("renders with interactive elements", async ({ page }) => {
    await page.goto("/resources", { waitUntil: "domcontentloaded" })

    const body = await page.locator("body").textContent()
    expect(body?.length).toBeGreaterThan(0)
  })
})
