import { test, expect } from "@playwright/test"

const dashboardRoutes = [
  "/dashboard",
  "/dashboard/documents",
  "/dashboard/incidents",
  "/dashboard/reports",
  "/dashboard/regulations",
  "/dashboard/alerts",
  "/dashboard/settings",
  "/dashboard/poster-compliance",
]

test.describe("Dashboard Pages Load (Authenticated)", () => {
  for (const route of dashboardRoutes) {
    test(`${route} loads without error`, async ({ page }) => {
      const errors: string[] = []
      page.on("pageerror", (err) => errors.push(err.message))

      const response = await page.goto(route, { waitUntil: "domcontentloaded" })

      // Should not redirect to login (we're authenticated)
      expect(page.url()).toContain("/dashboard")
      expect(response?.status()).toBeLessThan(400)
      expect(await page.locator("body").textContent()).not.toBe("")
      expect(errors).toHaveLength(0)
    })
  }
})

test.describe("Dashboard Reports Load", () => {
  const reportRoutes = [
    "/dashboard/reports/compliance-score",
    "/dashboard/reports/incident-analysis",
    "/dashboard/reports/document-history",
    "/dashboard/reports/delivery-log",
    "/dashboard/reports/annual-summary",
    "/dashboard/reports/regulatory-impact",
  ]

  for (const route of reportRoutes) {
    test(`${route} loads without error`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" })
      expect(response?.status()).toBeLessThan(400)
      expect(page.url()).toContain("/dashboard")
    })
  }
})

test.describe("Dashboard Sidebar Navigation", () => {
  test("sidebar contains expected nav links", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" })

    // Core nav items should exist
    const sidebar = page.locator('[data-sidebar], aside, nav')
    await expect(sidebar.first()).toBeVisible()

    const navLinks = page.locator('a[href*="/dashboard/"]')
    const count = await navLinks.count()
    expect(count).toBeGreaterThanOrEqual(5)
  })

  test("clicking sidebar links navigates without error", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" })

    const navLinks = page.locator('a[href*="/dashboard/documents"], a[href*="/dashboard/incidents"]')
    const count = await navLinks.count()

    for (let i = 0; i < Math.min(count, 3); i++) {
      const href = await navLinks.nth(i).getAttribute("href")
      if (href) {
        await page.goto(href, { waitUntil: "domcontentloaded" })
        expect(page.url()).toContain("/dashboard")
      }
    }
  })
})
