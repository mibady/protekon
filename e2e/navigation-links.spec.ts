import { test, expect } from "@playwright/test"

// ── NAVIGATION LINK VERIFICATION (public) ──

test.describe("Header navigation", () => {
  test("main nav links resolve to valid pages", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    const navLinks = page.locator("header a[href^='/'], nav a[href^='/']")
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(0)

    // Spot-check first 5 unique links
    const checked = new Set<string>()
    for (let i = 0; i < count && checked.size < 5; i++) {
      const href = await navLinks.nth(i).getAttribute("href")
      if (href && !href.includes("#") && !checked.has(href)) {
        checked.add(href)
        const res = await page.request.get(`http://localhost:3000${href}`)
        expect(res.status(), `${href} should resolve`).toBeLessThan(400)
      }
    }
  })

  test("login button in header links to /login", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator('a[href="/login"]').first()).toBeVisible()
  })

  test("signup CTA in header links to /signup", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator('a[href="/signup"]').first()).toBeVisible()
  })
})

test.describe("Footer navigation", () => {
  test("footer links all resolve", async ({ page }) => {
    await page.goto("/")
    const footerLinks = page.locator("footer a[href^='/']")
    const count = await footerLinks.count()

    const checked = new Set<string>()
    for (let i = 0; i < count; i++) {
      const href = await footerLinks.nth(i).getAttribute("href")
      if (href && !href.includes("#") && !checked.has(href)) {
        checked.add(href)
        const res = await page.request.get(`http://localhost:3000${href}`)
        expect(res.status(), `${href}`).toBeLessThan(400)
      }
    }
  })

  test("footer has privacy and terms links", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator('footer a[href="/privacy"]')).toBeVisible()
    await expect(page.locator('footer a[href="/terms"]')).toBeVisible()
  })
})

test.describe("CTA buttons point to correct destinations", () => {
  test("homepage Get Started → /signup", async ({ page }) => {
    await page.goto("/")
    const cta = page.locator('a[href="/signup"]', { hasText: /get started/i }).first()
    await expect(cta).toBeVisible()
  })

  test("pricing page Get Started buttons exist", async ({ page }) => {
    await page.goto("/pricing")
    const ctas = page.locator('a[href="/signup"], button', { hasText: /get started/i })
    const count = await ctas.count()
    expect(count).toBeGreaterThan(0)
  })

  test("contact page has submit button", async ({ page }) => {
    await page.goto("/contact")
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})
