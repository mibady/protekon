import { test, expect } from "@playwright/test"

test.use({ storageState: "e2e/.auth/user.json" })

// ── VERTICAL-SPECIFIC DASHBOARD PAGES ──

const verticalRoutes = [
  { path: "/dashboard/construction/subcontractors", label: "Subcontractor" },
  { path: "/dashboard/healthcare/phi-inventory", label: "PHI" },
  { path: "/dashboard/healthcare/baa-tracker", label: "BAA" },
  { path: "/dashboard/real-estate/properties", label: "Propert" },
  { path: "/dashboard/manufacturing/equipment", label: "Equipment" },
  { path: "/dashboard/hospitality/inspections", label: "Inspection" },
  { path: "/dashboard/agriculture/crews", label: "Crew" },
  { path: "/dashboard/retail/locations", label: "Location" },
  { path: "/dashboard/wholesale/zones", label: "Zone" },
  { path: "/dashboard/transportation/fleet", label: "Fleet" },
]

test.describe("Vertical pages load with correct content", () => {
  for (const route of verticalRoutes) {
    test(`${route.path} loads without JS errors`, async ({ page }) => {
      const errors: string[] = []
      page.on("pageerror", (err) => errors.push(err.message))
      const res = await page.goto(route.path)
      expect(res?.status()).toBeLessThan(400)
      await page.waitForLoadState("networkidle")
      expect(errors).toHaveLength(0)
    })
  }
})

test.describe("Vertical pages have Add button", () => {
  for (const route of verticalRoutes) {
    test(`${route.path} has an Add/New button`, async ({ page }) => {
      await page.goto(route.path)
      await page.waitForLoadState("networkidle")
      const addBtn = page.locator("button", { hasText: /add|new|create/i }).first()
      await expect(addBtn).toBeVisible()
    })
  }
})

test.describe("Vertical Add dialogs open", () => {
  const testRoutes = [
    "/dashboard/construction/subcontractors",
    "/dashboard/healthcare/phi-inventory",
    "/dashboard/manufacturing/equipment",
    "/dashboard/retail/locations",
  ]

  for (const path of testRoutes) {
    test(`${path} Add button opens dialog/modal`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState("networkidle")
      const addBtn = page.locator("button", { hasText: /add|new|create/i }).first()
      await addBtn.click()
      // Dialog or form should appear
      const dialog = page.locator("[role='dialog'], dialog, form")
      await expect(dialog.first()).toBeVisible({ timeout: 3000 })
    })
  }
})
