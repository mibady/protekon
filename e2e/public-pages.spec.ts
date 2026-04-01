import { test, expect } from "@playwright/test"

const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/industries",
  "/marketplace",
  "/pricing",
  "/privacy",
  "/resources",
  "/terms",
  "/solutions",
  "/solutions/construction",
  "/solutions/healthcare",
  "/solutions/real-estate",
  "/solutions/compliance-suite",
]

test.describe("Public Pages Load", () => {
  for (const route of publicRoutes) {
    test(`${route} loads without error`, async ({ page }) => {
      const errors: string[] = []
      page.on("pageerror", (err) => errors.push(err.message))

      const response = await page.goto(route, { waitUntil: "domcontentloaded" })

      expect(response?.status()).toBeLessThan(400)
      expect(await page.locator("body").textContent()).not.toBe("")
      expect(errors).toHaveLength(0)
    })
  }
})

test.describe("Auth Pages Load", () => {
  const authRoutes = ["/login", "/signup", "/forgot-password"]

  for (const route of authRoutes) {
    test(`${route} loads without error`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" })
      expect(response?.status()).toBeLessThan(400)
    })
  }
})

test.describe("Navigation Links", () => {
  test("header nav links resolve without 404", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" })

    const navLinks = page.locator("nav a[href], header a[href]")
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(0)

    const hrefs = new Set<string>()
    for (let i = 0; i < count; i++) {
      const href = await navLinks.nth(i).getAttribute("href")
      if (href && href.startsWith("/") && !href.startsWith("/dashboard")) {
        hrefs.add(href)
      }
    }

    for (const href of hrefs) {
      const response = await page.goto(href, { waitUntil: "domcontentloaded" })
      expect(response?.status(), `${href} should not 404`).toBeLessThan(400)
    }
  })
})
