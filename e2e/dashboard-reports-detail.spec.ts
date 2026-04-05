import { test, expect } from "@playwright/test"

test.use({ storageState: "e2e/.auth/user.json" })

// ── REPORT DETAIL PAGES ──

const reportRoutes = [
  { path: "/dashboard/reports/compliance-score", title: "Compliance Score" },
  { path: "/dashboard/reports/incident-analysis", title: "Incident Analysis" },
  { path: "/dashboard/reports/document-history", title: "Document History" },
  { path: "/dashboard/reports/regulatory-impact", title: "Regulatory Impact" },
  { path: "/dashboard/reports/delivery-log", title: "Delivery Log" },
  { path: "/dashboard/reports/annual-summary", title: "Annual" },
]

test.describe("Report detail pages load", () => {
  for (const route of reportRoutes) {
    test(`${route.path} loads without errors`, async ({ page }) => {
      const errors: string[] = []
      page.on("pageerror", (err) => errors.push(err.message))
      const res = await page.goto(route.path)
      expect(res?.status()).toBeLessThan(400)
      await page.waitForLoadState("networkidle")
      expect(errors).toHaveLength(0)
    })
  }
})

test.describe("Report pages have export functionality", () => {
  for (const route of reportRoutes) {
    test(`${route.path} has export/download button`, async ({ page }) => {
      await page.goto(route.path)
      await page.waitForLoadState("networkidle")
      // Each report should have an export option
      const exportBtn = page.locator("button, a", {
        hasText: /export|download|pdf|generate/i,
      })
      const count = await exportBtn.count()
      expect(count).toBeGreaterThan(0)
    })
  }
})
