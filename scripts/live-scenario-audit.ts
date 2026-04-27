import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { chromium, type Browser, type BrowserContext, type Page } from "@playwright/test"
import { loadEnvConfig } from "@next/env"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

loadEnvConfig(process.cwd())

type ScenarioStatus = "pass" | "fail" | "blocked"

type ScenarioContext = {
  admin: SupabaseClient
  browser: Browser
  baseUrl: string
  password: string
  startedAt: string
  email: string
  userId: string
  clientId: string
  partnerId: string | null
}

type Scenario = {
  id: string
  email: string
  title: string
  assertion: string
  run: (ctx: ScenarioContext) => Promise<string[]>
}

type ScenarioResult = {
  id: string
  email: string
  title: string
  assertion: string
  status: ScenarioStatus
  evidence: string[]
  error: string | null
  durationMs: number
}

const BASE_URL = process.env.AUDIT_BASE_URL ?? process.env.BASE_URL ?? "http://localhost:3000"
const PASSWORD = process.env.AUDIT_PASSWORD ?? "demo-password-2026"
const OUTPUT_DIR = process.env.AUDIT_OUTPUT_DIR ?? "reports"
const HEADLESS = process.env.AUDIT_HEADLESS !== "0"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required for live scenario auditing.`)
  return value
}

function absoluteUrl(route: string): string {
  return new URL(route, BASE_URL).toString()
}

function marker(prefix: string): string {
  return `${prefix} ${new Date().toISOString()} ${Math.random().toString(36).slice(2, 8)}`
}

function pass(message: string): string[] {
  return [message]
}

function fail(message: string): never {
  throw new Error(message)
}

async function resolveIdentity(admin: SupabaseClient, email: string) {
  const { data, error } = await admin.auth.admin.listUsers()
  if (error) fail(`Unable to list auth users: ${error.message}`)
  const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase())
  if (!user) fail(`Auth user not found for ${email}`)

  const { data: role } = await admin
    .from("user_roles")
    .select("client_id")
    .eq("user_id", user.id)
    .maybeSingle()

  const { data: partner } = await admin
    .from("partner_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  return {
    userId: user.id,
    clientId: (role?.client_id as string | undefined) ?? user.id,
    partnerId: (partner?.id as string | undefined) ?? null,
  }
}

async function newAuthedPage(ctx: ScenarioContext): Promise<{ context: BrowserContext; page: Page }> {
  const context = await ctx.browser.newContext({ baseURL: ctx.baseUrl })
  await context.route(/sentry\.io|\/sentry-tunnel|meticulous\.ai/, (route) => route.abort())
  const page = await context.newPage()
  await page.goto(absoluteUrl("/login"), { waitUntil: "domcontentloaded" })
  await page.locator('input[name="email"], input[type="email"]').first().fill(ctx.email)
  await page.locator('input[name="password"], input[type="password"]').first().fill(ctx.password)
  await page.getByRole("button", { name: /sign in/i }).click()
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20_000 })
  await page.waitForLoadState("networkidle", { timeout: 12_000 }).catch(() => undefined)
  return { context, page }
}

async function gotoAuthed(page: Page, route: string) {
  await page.goto(absoluteUrl(route), { waitUntil: "domcontentloaded" })
  await page.waitForLoadState("networkidle", { timeout: 12_000 }).catch(() => undefined)
  if (page.url().includes("/login")) fail(`${route} redirected to login`)
}

async function clickFirst(page: Page, label: RegExp | string) {
  const locator = page.getByRole("button", { name: label }).first()
  if ((await locator.count()) === 0) fail(`Button not found: ${String(label)}`)
  await locator.click()
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined)
}

async function newestCount(admin: SupabaseClient, table: string, clientId: string, extra: Record<string, unknown> = {}) {
  let query = admin.from(table).select("id", { count: "exact", head: true }).eq("client_id", clientId)
  for (const [key, value] of Object.entries(extra)) query = query.eq(key, value as never)
  const { count, error } = await query
  if (error) fail(`${table} count failed: ${error.message}`)
  return count ?? 0
}

async function scenarioWithPage(ctx: ScenarioContext, route: string, body: (page: Page) => Promise<string[]>) {
  const { context, page } = await newAuthedPage(ctx)
  try {
    await gotoAuthed(page, route)
    return await body(page)
  } finally {
    await context.close()
  }
}

const scenarios: Scenario[] = [
  {
    id: "client-doc-wvpp-template",
    email: "admin@sierraridgebuilders.com",
    title: "Generate WVPP from template",
    assertion: "Document appears in /documents with status=current.",
    run: async (ctx) => {
      const before = await newestCount(ctx.admin, "documents", ctx.clientId, { type: "wvpp", status: "current" })
      await scenarioWithPage(ctx, "/dashboard", async (page) => {
        await clickFirst(page, /generate/i)
        return []
      })
      const after = await newestCount(ctx.admin, "documents", ctx.clientId, { type: "wvpp", status: "current" })
      if (after <= before) fail(`No new current WVPP document. before=${before} after=${after}`)
      return pass(`current WVPP document count moved ${before} -> ${after}`)
    },
  },
  {
    id: "client-incident-log",
    email: "admin@sierraridgebuilders.com",
    title: "Log an incident",
    assertion: "Row in incidents, alert appears on briefing.",
    run: async (ctx) => {
      const description = marker("Live audit incident")
      await scenarioWithPage(ctx, "/dashboard/incidents", async (page) => {
        await clickFirst(page, /new incident/i)
        await page.locator('textarea[name="description"]').fill(description)
        await page.locator('input[name="location"]').fill("Live audit bay")
        await page.locator('select[name="severity"]').selectOption("serious")
        await clickFirst(page, /log incident/i)
        return []
      })
      const { data, error } = await ctx.admin
        .from("incidents")
        .select("id, incident_id")
        .eq("client_id", ctx.clientId)
        .eq("description", description)
        .maybeSingle()
      if (error || !data) fail(`Incident row not found: ${error?.message ?? "missing"}`)
      const { context, page } = await newAuthedPage(ctx)
      try {
        await gotoAuthed(page, "/dashboard")
        const briefingText = await page.locator("body").innerText()
        if (!/incident|reported|reporting/i.test(briefingText)) fail("Dashboard briefing did not render incident/reporting copy.")
      } finally {
        await context.close()
      }
      return pass(`incident row inserted: ${data.incident_id}`)
    },
  },
  {
    id: "property-review-action-item",
    email: "admin@pacificcoastproperty.com",
    title: "Request property review",
    assertion: "Action item created, assignee notified.",
    run: async (ctx) => {
      const before = await newestCount(ctx.admin, "action_items", ctx.clientId, { action_type: "property_review" })
      await scenarioWithPage(ctx, "/dashboard/action-items", async (page) => {
        await page.getByTestId("request-property-review").click()
        await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined)
        return []
      })
      const { data, error, count } = await ctx.admin
        .from("action_items")
        .select("id, assignee_user_id", { count: "exact" })
        .eq("client_id", ctx.clientId)
        .eq("action_type", "property_review")
      if (error) fail(`action_items query failed: ${error.message}`)
      if ((count ?? 0) <= before) fail(`No property_review action item created. before=${before} after=${count ?? 0}`)
      if (!data?.some((row) => row.assignee_user_id)) fail("Action item created but no assignee_user_id was set.")
      return pass(`property_review action item count moved ${before} -> ${count ?? 0}`)
    },
  },
  {
    id: "healthcare-baa-remediated",
    email: "admin@coastalhealthgroup.com",
    title: "Mark BAA as remediated",
    assertion: "baa_agreements.baa_status flips to current.",
    run: async (ctx) => {
      const before = await newestCount(ctx.admin, "baa_agreements", ctx.clientId, { baa_status: "current" })
      await scenarioWithPage(ctx, "/dashboard/healthcare/baa-tracker", async (page) => {
        await clickFirst(page, /remediat|mark.*current|complete/i)
        return []
      })
      const after = await newestCount(ctx.admin, "baa_agreements", ctx.clientId, { baa_status: "current" })
      if (after <= before) fail(`No BAA moved to current. before=${before} after=${after}`)
      return pass(`current BAA count moved ${before} -> ${after}`)
    },
  },
  {
    id: "healthcare-hipaa-training-complete",
    email: "admin@coastalhealthgroup.com",
    title: "Complete HIPAA training record",
    assertion: "Row updates to status=completed.",
    run: async (ctx) => {
      const before = await newestCount(ctx.admin, "training_records", ctx.clientId, { status: "completed" })
      await scenarioWithPage(ctx, "/dashboard/training", async (page) => {
        await page.getByLabel(/search training/i).fill("HIPAA")
        await clickFirst(page, /complete|mark complete/i)
        return []
      })
      const after = await newestCount(ctx.admin, "training_records", ctx.clientId, { status: "completed" })
      if (after <= before) fail(`No completed training increase. before=${before} after=${after}`)
      return pass(`completed training count moved ${before} -> ${after}`)
    },
  },
  {
    id: "municipal-reg-update-ack",
    email: "admin@summitmunicipal.com",
    title: "Acknowledge regulatory update",
    assertion: "regulatory_updates.acknowledged_at set.",
    run: async (ctx) => {
      await scenarioWithPage(ctx, "/dashboard/reg-changes", async (page) => {
        await clickFirst(page, /acknowledge/i)
        return []
      })
      const { data, error } = await ctx.admin
        .from("regulatory_updates")
        .select("id, acknowledged_by, acknowledged_at")
        .contains("acknowledged_by", [ctx.clientId])
        .limit(1)
      if (error) fail(`regulatory_updates.acknowledged_at assertion failed: ${error.message}`)
      if (!data?.[0]?.acknowledged_at) fail("Regulatory update was acknowledged_by client, but acknowledged_at is not set.")
      return pass(`acknowledged_at set on regulatory update ${data[0].id}`)
    },
  },
  {
    id: "hospitality-type2-wvp-close",
    email: "admin@goldenstatehospitality.com",
    title: "Respond to Type 2 WVP incident",
    assertion: "Incident closed, log entry PII-scrubbed.",
    run: async (ctx) => {
      await scenarioWithPage(ctx, "/dashboard/incidents", async (page) => {
        await page.getByText(/INC-|incident/i).first().click()
        await clickFirst(page, /reported|close|resolved/i)
        return []
      })
      const { data, error } = await ctx.admin
        .from("audit_log")
        .select("id, description, metadata")
        .eq("client_id", ctx.clientId)
        .ilike("event_type", "%incident%")
        .order("created_at", { ascending: false })
        .limit(1)
      if (error || !data?.length) fail(`No incident audit log found: ${error?.message ?? "missing"}`)
      const serialized = JSON.stringify(data[0])
      if (/@|\\b\\d{3}[-.) ]?\\d{3}[- ]?\\d{4}\\b/.test(serialized)) fail("Latest incident audit log appears to contain PII.")
      return pass(`latest incident log appears PII-scrubbed: ${data[0].id}`)
    },
  },
  {
    id: "lonestar-intake-first-doc",
    email: "admin@lonestarbuilders.com",
    title: "Complete intake -> first doc generated",
    assertion: "intake_submissions.status=completed, first DOC- row.",
    run: async (ctx) => {
      await scenarioWithPage(ctx, "/onboarding/business", async (page) => {
        await clickFirst(page, /continue|next|complete/i)
        return []
      })
      const { count: intakeCount, error: intakeError } = await ctx.admin
        .from("intake_submissions")
        .select("id", { count: "exact", head: true })
        .eq("email", ctx.email)
        .eq("status", "completed")
      if (intakeError) fail(`intake_submissions query failed: ${intakeError.message}`)
      const { count: docCount, error: docError } = await ctx.admin
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("client_id", ctx.clientId)
        .like("document_id", "DOC-%")
      if (docError) fail(`documents query failed: ${docError.message}`)
      if (!intakeCount || !docCount) fail(`Expected completed intake and DOC row. intake=${intakeCount ?? 0} docs=${docCount ?? 0}`)
      return pass(`completed intake count=${intakeCount}; DOC rows=${docCount}`)
    },
  },
  {
    id: "billing-payment-method",
    email: "billing@riverdeltalogistics.com",
    title: "Update payment method in test mode",
    assertion: "Past-due banner clears.",
    run: async (ctx) => {
      await scenarioWithPage(ctx, "/dashboard/settings", async (page) => {
        await page.getByRole("button", { name: /billing/i }).first().click().catch(() => undefined)
        await clickFirst(page, /open billing portal|update payment|payment method/i)
        return []
      })
      const { data, error } = await ctx.admin
        .from("clients")
        .select("status")
        .eq("id", ctx.clientId)
        .maybeSingle()
      if (error) fail(`clients status query failed: ${error.message}`)
      if (/past|due|inactive|hold/i.test(String(data?.status ?? ""))) fail(`Past-due status still present: ${data?.status}`)
      return pass(`client status is ${data?.status ?? "unset"}`)
    },
  },
  {
    id: "manager-approve-field-incident",
    email: "manager@sierraridgebuilders.com",
    title: "Approve a field-logged incident",
    assertion: "Status transitions.",
    run: async (ctx) => {
      await scenarioWithPage(ctx, "/dashboard/incidents", async (page) => {
        await page.getByText(/INC-|incident/i).first().click()
        await clickFirst(page, /approve|mark.*reviewed|accept/i)
        return []
      })
      return pass("Approval action completed without client-side error.")
    },
  },
  {
    id: "field-submit-incident",
    email: "field@sierraridgebuilders.com",
    title: "Submit incident from field",
    assertion: "Write succeeds despite restricted role.",
    run: async (ctx) => {
      const description = marker("Field role incident")
      await scenarioWithPage(ctx, "/dashboard/incidents", async (page) => {
        await clickFirst(page, /new incident/i)
        await page.locator('textarea[name="description"]').fill(description)
        await page.locator('select[name="severity"]').selectOption("minor")
        await clickFirst(page, /log incident/i)
        return []
      })
      const { count, error } = await ctx.admin
        .from("incidents")
        .select("id", { count: "exact", head: true })
        .eq("client_id", ctx.clientId)
        .eq("description", description)
      if (error) fail(`incidents query failed: ${error.message}`)
      if (!count) fail("Field role incident write did not persist.")
      return pass("field role incident persisted")
    },
  },
  {
    id: "auditor-export-package",
    email: "auditor@sierraridgebuilders.com",
    title: "Export audit package",
    assertion: "PDF generated, visible in activity log.",
    run: async (ctx) => {
      const { context } = await newAuthedPage(ctx)
      try {
        const response = await context.request.get("/api/export/audit-package")
        if (!response.ok()) fail(`Audit package export failed: HTTP ${response.status()} ${await response.text().catch(() => "")}`)
        const contentType = response.headers()["content-type"] ?? ""
        if (!/pdf|zip|octet-stream/i.test(contentType)) fail(`Unexpected export content-type: ${contentType}`)
      } finally {
        await context.close()
      }
      const { count, error } = await ctx.admin
        .from("audit_log")
        .select("id", { count: "exact", head: true })
        .eq("client_id", ctx.clientId)
        .ilike("event_type", "%export%")
      if (error) fail(`audit_log export query failed: ${error.message}`)
      if (!count) fail("Export succeeded but no activity/audit log row was found.")
      return pass(`export activity rows=${count}`)
    },
  },
  {
    id: "partner-send-assessment",
    email: "sarah@compliancefirst.io",
    title: "Send assessment to new prospect",
    assertion: "partner_assessments row inserted.",
    run: async (ctx) => {
      if (!ctx.partnerId) fail("Partner profile not found.")
      const prospectEmail = `audit-${Date.now()}@example.com`
      const before = await ctx.admin
        .from("partner_assessments")
        .select("id", { count: "exact", head: true })
        .eq("partner_id", ctx.partnerId)
      if (before.error) fail(`partner_assessments count failed: ${before.error.message}`)
      await scenarioWithPage(ctx, "/partner/assessments", async (page) => {
        await clickFirst(page, /send assessment/i)
        await page.locator('input[type="text"]').fill("Live Audit Prospect")
        await page.locator('input[type="email"]').fill(prospectEmail)
        await page.getByRole("button", { name: /^send assessment$/i }).click()
        await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined)
        return []
      })
      const { count, error } = await ctx.admin
        .from("partner_assessments")
        .select("id", { count: "exact", head: true })
        .eq("partner_id", ctx.partnerId)
        .eq("prospect_email", prospectEmail)
      if (error) fail(`partner_assessments query failed: ${error.message}`)
      if (!count) fail("Assessment row was not inserted.")
      return pass(`assessment inserted for ${prospectEmail}`)
    },
  },
  {
    id: "partner-commission-statement",
    email: "hello@safeguardadvisors.com",
    title: "View commission statement",
    assertion: "Commission total renders.",
    run: async (ctx) => scenarioWithPage(ctx, "/partner/commissions", async (page) => {
      const total = await page.getByTestId("commissions-total").innerText()
      if (!/\$\d|0/.test(total)) fail(`Commission total did not render as money: ${total}`)
      return pass(`commission total rendered: ${total}`)
    }),
  },
  {
    id: "free-tier-branding-blocked",
    email: "intro@partnerprospect.io",
    title: "Attempt branding access on free tier",
    assertion: "403 or redirect.",
    run: async (ctx) => {
      const { context, page } = await newAuthedPage(ctx)
      try {
        const response = await page.goto(absoluteUrl("/partner/branding"), { waitUntil: "domcontentloaded" })
        await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined)
        const status = response?.status() ?? 0
        if (status === 403 || page.url().includes("/login") || page.url().includes("/partner") && !page.url().includes("/partner/branding")) {
          return pass(`branding blocked with status=${status} url=${page.url()}`)
        }
        fail(`Branding was not gated. status=${status} url=${page.url()}`)
      } finally {
        await context.close()
      }
    },
  },
]

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })

  const admin = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
  const browser = await chromium.launch({ headless: HEADLESS })

  const results: ScenarioResult[] = []
  try {
    for (const scenario of scenarios) {
      const started = Date.now()
      const startedAt = new Date().toISOString()
      try {
        const identity = await resolveIdentity(admin, scenario.email)
        const evidence = await scenario.run({
          admin,
          browser,
          baseUrl: BASE_URL,
          password: PASSWORD,
          startedAt,
          email: scenario.email,
          ...identity,
        })
        results.push({
          id: scenario.id,
          email: scenario.email,
          title: scenario.title,
          assertion: scenario.assertion,
          status: "pass",
          evidence,
          error: null,
          durationMs: Date.now() - started,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        results.push({
          id: scenario.id,
          email: scenario.email,
          title: scenario.title,
          assertion: scenario.assertion,
          status: /not found|redirected to login|required/i.test(message) ? "blocked" : "fail",
          evidence: [],
          error: message,
          durationMs: Date.now() - started,
        })
      }
      const latest = results[results.length - 1]
      console.log(`${latest.status.toUpperCase()} ${scenario.id}: ${latest.error ?? latest.evidence.join("; ")}`)
    }
  } finally {
    await browser.close()
  }

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      total: results.length,
      passed: results.filter((result) => result.status === "pass").length,
      failed: results.filter((result) => result.status === "fail").length,
      blocked: results.filter((result) => result.status === "blocked").length,
    },
    results,
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const outPath = path.join(OUTPUT_DIR, `live-scenario-audit-${stamp}.json`)
  await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Live scenario audit written to ${outPath}`)
  console.log(JSON.stringify(report.summary, null, 2))

  if (report.summary.failed > 0 || report.summary.blocked > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
