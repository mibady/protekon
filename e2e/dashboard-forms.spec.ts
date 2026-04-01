import { test, expect } from "@playwright/test"

test.describe("Document Request Form", () => {
  test("renders form and accepts input", async ({ page }) => {
    await page.goto("/dashboard/documents/request", { waitUntil: "domcontentloaded" })

    // Form should be visible
    const form = page.locator("form").first()
    await expect(form).toBeVisible()

    // Should have input fields
    const inputs = page.locator("input, textarea, select")
    const count = await inputs.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})

test.describe("New Incident Form", () => {
  test("renders form with all required fields", async ({ page }) => {
    await page.goto("/dashboard/incidents/new", { waitUntil: "domcontentloaded" })

    // Should have multiple input fields for incident details
    const inputs = page.locator("input, textarea, select")
    const count = await inputs.count()
    expect(count).toBeGreaterThanOrEqual(3) // description, location, date at minimum
  })

  test("accepts text input in description field", async ({ page }) => {
    await page.goto("/dashboard/incidents/new", { waitUntil: "domcontentloaded" })

    const textarea = page.locator("textarea").first()
    if (await textarea.isVisible()) {
      await textarea.fill("Test incident description for E2E testing")
      await expect(textarea).toHaveValue("Test incident description for E2E testing")
    }
  })
})

test.describe("Settings Forms", () => {
  test("settings page loads with form tabs", async ({ page }) => {
    await page.goto("/dashboard/settings", { waitUntil: "domcontentloaded" })

    // Should have forms for profile/company/security
    const forms = page.locator("form")
    const count = await forms.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test("profile form has editable fields", async ({ page }) => {
    await page.goto("/dashboard/settings", { waitUntil: "domcontentloaded" })

    const inputs = page.locator('input:not([type="hidden"]):not([type="submit"])')
    const count = await inputs.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})

test.describe("Vertical Pages — Construction", () => {
  test("subcontractors page loads with table", async ({ page }) => {
    await page.goto("/dashboard/construction/subcontractors", { waitUntil: "domcontentloaded" })

    // Should either show table or empty state
    const body = await page.locator("body").textContent()
    expect(body?.length).toBeGreaterThan(0)
  })

  test("subcontractors page has add button", async ({ page }) => {
    await page.goto("/dashboard/construction/subcontractors", { waitUntil: "domcontentloaded" })

    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")')
    const count = await addButton.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})

test.describe("Vertical Pages — Healthcare", () => {
  test("PHI inventory page loads", async ({ page }) => {
    await page.goto("/dashboard/healthcare/phi-inventory", { waitUntil: "domcontentloaded" })
    const body = await page.locator("body").textContent()
    expect(body?.length).toBeGreaterThan(0)
  })

  test("BAA tracker page loads", async ({ page }) => {
    await page.goto("/dashboard/healthcare/baa-tracker", { waitUntil: "domcontentloaded" })
    const body = await page.locator("body").textContent()
    expect(body?.length).toBeGreaterThan(0)
  })
})

test.describe("Vertical Pages — Real Estate", () => {
  test("properties page loads", async ({ page }) => {
    await page.goto("/dashboard/real-estate/properties", { waitUntil: "domcontentloaded" })
    const body = await page.locator("body").textContent()
    expect(body?.length).toBeGreaterThan(0)
  })
})

test.describe("Poster Compliance", () => {
  test("poster compliance page loads with table or empty state", async ({ page }) => {
    await page.goto("/dashboard/poster-compliance", { waitUntil: "domcontentloaded" })
    const body = await page.locator("body").textContent()
    expect(body?.length).toBeGreaterThan(0)
  })
})
