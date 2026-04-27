import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { chromium, request, type BrowserContext, type Page, type Response } from "@playwright/test"
import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd())

type NetworkRecord = {
  method: string
  url: string
  status: number | null
  durationMs: number
  cacheControl: string | null
  xCache: string | null
  age: string | null
  server: string | null
}

type CoverageRecord = {
  url: string
  totalBytes: number
  usedBytes: number
  unusedPercent: number
}

type MutationRecordSummary = {
  route: string
  action: string
  mutationCount: number
  networkCount: number
  warning: string | null
}

type ProbeResult = {
  label: string
  method: string
  url: string
  status: number
  durationMs: number
  cacheControl: string | null
  xCache: string | null
  age: string | null
  server: string | null
  bodyPreview: string
  warning: string | null
}

type AuditReport = {
  generatedAt: string
  baseUrl: string
  routes: string[]
  summary: {
    networkRequests: number
    suspiciousCachedResponses: number
    highUnusedCoverageFiles: number
    mutationWarnings: number
    probeWarnings: number
  }
  network: NetworkRecord[]
  coverage: CoverageRecord[]
  mutations: MutationRecordSummary[]
  probes: ProbeResult[]
}

const BASE_URL = process.env.AUDIT_BASE_URL ?? process.env.BASE_URL ?? "http://localhost:3000"
const ROUTES = csv(process.env.AUDIT_ROUTES, [
  "/",
  "/onboarding/business",
  "/onboarding/sites",
  "/onboarding/people",
  "/onboarding/subs",
  "/onboarding/documents",
])
const OUTPUT_DIR = process.env.AUDIT_OUTPUT_DIR ?? "reports"
const HEADLESS = process.env.AUDIT_HEADLESS !== "0"
const MAX_ACTIONS_PER_ROUTE = Number(process.env.AUDIT_MAX_ACTIONS_PER_ROUTE ?? "5")

function csv(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
}

function absoluteUrl(routeOrUrl: string): string {
  if (/^https?:\/\//.test(routeOrUrl)) return routeOrUrl
  return new URL(routeOrUrl, BASE_URL).toString()
}

function preview(text: string, max = 500): string {
  return text.replace(/\s+/g, " ").trim().slice(0, max)
}

function suspiciousCache(record: NetworkRecord | ProbeResult): boolean {
  const cacheControl = record.cacheControl?.toLowerCase() ?? ""
  const xCache = record.xCache?.toLowerCase() ?? ""
  const age = Number(record.age ?? "0")
  return (
    xCache.includes("hit") ||
    age > 0 ||
    /max-age=(31536000|[1-9]\d{5,})/.test(cacheControl)
  )
}

async function tryLogin(context: BrowserContext, page: Page) {
  const email = process.env.TEST_EMAIL
  const password = process.env.TEST_PASSWORD
  if (!email || !password) return

  await page.goto(absoluteUrl("/login"), { waitUntil: "domcontentloaded" })
  const emailInput = page.getByLabel(/email/i).or(page.locator('input[type="email"]').first())
  const passwordInput = page.getByLabel(/password/i).or(page.locator('input[type="password"]').first())
  if (!(await emailInput.count()) || !(await passwordInput.count())) return

  await emailInput.fill(email)
  await passwordInput.fill(password)
  await page.getByRole("button", { name: /sign in|log in|continue/i }).first().click()
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined)
  await context.storageState({ path: path.join(OUTPUT_DIR, "live-audit-storage-state.json") }).catch(() => undefined)
}

async function startCoverage(page: Page) {
  const session = await page.context().newCDPSession(page)
  await session.send("Profiler.enable")
  await session.send("Profiler.startPreciseCoverage", { callCount: true, detailed: true })
  return session
}

async function stopCoverage(session: Awaited<ReturnType<typeof startCoverage>>): Promise<CoverageRecord[]> {
  const coverage = await session.send("Profiler.takePreciseCoverage")
  await session.send("Profiler.stopPreciseCoverage")
  await session.detach()

  return coverage.result
    .filter((entry: { url?: string }) => entry.url && !entry.url.startsWith("extensions::"))
    .map((entry: {
      url: string
      functions: Array<{ ranges: Array<{ startOffset: number; endOffset: number; count: number }> }>
    }) => {
      const ranges = entry.functions.flatMap((fn) => fn.ranges)
      const totalBytes = Math.max(0, ...ranges.map((range) => range.endOffset))
      const usedRanges = ranges.filter((range) => range.count > 0)
      const usedBytes = mergeRanges(usedRanges).reduce((sum, range) => sum + range.endOffset - range.startOffset, 0)
      const unusedPercent = totalBytes === 0 ? 0 : Math.round(((totalBytes - usedBytes) / totalBytes) * 1000) / 10
      return { url: entry.url, totalBytes, usedBytes, unusedPercent }
    })
    .filter((entry: CoverageRecord) => entry.totalBytes > 0)
    .sort((a: CoverageRecord, b: CoverageRecord) => b.unusedPercent - a.unusedPercent)
}

function mergeRanges(ranges: Array<{ startOffset: number; endOffset: number }>) {
  const sorted = [...ranges].sort((a, b) => a.startOffset - b.startOffset)
  const merged: Array<{ startOffset: number; endOffset: number }> = []
  for (const range of sorted) {
    const last = merged[merged.length - 1]
    if (!last || range.startOffset > last.endOffset) {
      merged.push({ ...range })
    } else {
      last.endOffset = Math.max(last.endOffset, range.endOffset)
    }
  }
  return merged
}

async function installMutationObserver(page: Page) {
  await page.addInitScript(() => {
    const win = window as typeof window & { __auditMutations?: number; __auditResetMutations?: () => void }
    win.__auditMutations = 0
    win.__auditResetMutations = () => {
      win.__auditMutations = 0
    }
    new MutationObserver((records) => {
      win.__auditMutations = (win.__auditMutations ?? 0) + records.length
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    })
  })
}

async function mutationCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const win = window as typeof window & { __auditMutations?: number }
    return win.__auditMutations ?? 0
  })
}

async function resetMutationCount(page: Page) {
  await page.evaluate(() => {
    const win = window as typeof window & { __auditResetMutations?: () => void }
    win.__auditResetMutations?.()
  })
}

async function auditRouteActions(page: Page, route: string, network: NetworkRecord[]): Promise<MutationRecordSummary[]> {
  const findings: MutationRecordSummary[] = []
  await page.goto(absoluteUrl(route), { waitUntil: "domcontentloaded" })
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined)

  if (page.url().includes("/login")) {
    return [
      {
        route,
        action: "auth redirect",
        mutationCount: 0,
        networkCount: 0,
        warning: "Route redirected to login. Provide TEST_EMAIL and TEST_PASSWORD for authenticated execution tracing.",
      },
    ]
  }

  const buttons = page
    .locator('button:not([disabled]):not([type="submit"])')
    .filter({ hasNotText: /sign out|delete|remove/i })
  const count = Math.min(await buttons.count(), MAX_ACTIONS_PER_ROUTE)
  for (let index = 0; index < count; index++) {
    const button = buttons.nth(index)
    const text = preview((await button.innerText().catch(() => "")) || `button ${index + 1}`, 80)
    const networkBefore = network.length
    if (page.isClosed()) break
    await resetMutationCount(page).catch(() => undefined)
    await button.click({ timeout: 2000 }).catch(() => undefined)
    await page.waitForTimeout(750)
    if (page.isClosed()) break
    const mutations = await mutationCount(page).catch(() => 0)
    const networkDelta = network.length - networkBefore
    findings.push({
      route,
      action: text,
      mutationCount: mutations,
      networkCount: networkDelta,
      warning:
        mutations > 0 && networkDelta === 0
          ? "DOM changed without a network request. Inspect for client-side fake success or local-only state."
          : mutations === 0 && networkDelta === 0
            ? "No DOM or network activity observed. Inspect for dead listener or unreachable code path."
            : null,
    })
  }
  return findings
}

async function runProbes(): Promise<ProbeResult[]> {
  const api = await request.newContext({ baseURL: BASE_URL })
  const configured = process.env.AUDIT_PROBES
  const probes = configured
    ? configured.split(",").map((probe) => {
        const [method = "GET", url = "/"] = probe.split(/\s+/)
        return { label: probe, method: method.toUpperCase(), url }
      })
    : [
        { label: "cache-bust home", method: "GET", url: `/?audit=${Date.now()}` },
        { label: "impossible score submit", method: "POST", url: "/api/score/submit" },
      ]

  const results: ProbeResult[] = []
  for (const probe of probes) {
    const started = Date.now()
    const response = await api.fetch(probe.url, {
      method: probe.method,
      data: probe.method === "POST" ? { quantity: -1, audit: Date.now() } : undefined,
      failOnStatusCode: false,
    })
    const text = await response.text().catch(() => "")
    const record: ProbeResult = {
      label: probe.label,
      method: probe.method,
      url: absoluteUrl(probe.url),
      status: response.status(),
      durationMs: Date.now() - started,
      cacheControl: response.headers()["cache-control"] ?? null,
      xCache: response.headers()["x-cache"] ?? null,
      age: response.headers().age ?? null,
      server: response.headers().server ?? null,
      bodyPreview: preview(text),
      warning: null,
    }
    record.warning =
      suspiciousCache(record)
        ? "Response appears cached. Verify this endpoint is meant to bypass live server execution."
        : probe.method !== "GET" && response.status() < 400
          ? "Boundary probe succeeded. Verify validation is rejecting impossible input."
          : null
    results.push(record)
  }
  await api.dispose()
  return results
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: HEADLESS })
  const context = await browser.newContext({ baseURL: BASE_URL })
  await context.route(/sentry\.io|\/sentry-tunnel/, (route) => route.abort())
  const page = await context.newPage()
  const network: NetworkRecord[] = []
  const starts = new Map<string, number>()

  page.on("request", (req) => {
    starts.set(`${req.method()} ${req.url()}`, Date.now())
  })
  page.on("response", (res: Response) => {
    const req = res.request()
    const key = `${req.method()} ${res.url()}`
    const started = starts.get(key) ?? Date.now()
    network.push({
      method: req.method(),
      url: res.url(),
      status: res.status(),
      durationMs: Date.now() - started,
      cacheControl: res.headers()["cache-control"] ?? null,
      xCache: res.headers()["x-cache"] ?? null,
      age: res.headers().age ?? null,
      server: res.headers().server ?? null,
    })
  })

  await installMutationObserver(page)
  const coverageSession = await startCoverage(page)
  await tryLogin(context, page)

  const mutations: MutationRecordSummary[] = []
  for (const route of ROUTES) {
    mutations.push(...(await auditRouteActions(page, route, network)))
  }

  const coverage = await stopCoverage(coverageSession)
  const probes = await runProbes()
  await browser.close()

  const report: AuditReport = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    routes: ROUTES,
    summary: {
      networkRequests: network.length,
      suspiciousCachedResponses: network.filter(suspiciousCache).length,
      highUnusedCoverageFiles: coverage.filter((entry) => entry.unusedPercent >= 80).length,
      mutationWarnings: mutations.filter((entry) => entry.warning).length,
      probeWarnings: probes.filter((entry) => entry.warning).length,
    },
    network,
    coverage: coverage.slice(0, 80),
    mutations,
    probes,
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const outPath = path.join(OUTPUT_DIR, `live-execution-audit-${stamp}.json`)
  await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`)

  console.log(`Live execution audit written to ${outPath}`)
  console.log(JSON.stringify(report.summary, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
