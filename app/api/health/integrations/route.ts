import { NextRequest, NextResponse } from "next/server"
import { list as blobList } from "@vercel/blob"
import { getStripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/resend"

export const runtime = "nodejs"
// Function-level timeout: external probes should never hold the request for long.
export const maxDuration = 30

type Status = "pass" | "fail" | "skip"
type Check = { name: string; status: Status; detail?: string; ms?: number }

async function timed(name: string, fn: () => Promise<Check>): Promise<Check> {
  const t0 = Date.now()
  try {
    const result = await fn()
    return { ...result, ms: Date.now() - t0 }
  } catch (err) {
    return {
      name,
      status: "fail",
      detail: err instanceof Error ? err.message : "unknown error",
      ms: Date.now() - t0,
    }
  }
}

// ─── Individual checks ──────────────────────────────────────────────────────

async function checkSupabaseApp(): Promise<Check> {
  const name = "supabase_app"
  const supabase = createAdminClient()
  const { error } = await supabase.from("clients").select("id", { count: "exact", head: true }).limit(1)
  if (error) return { name, status: "fail", detail: error.message }
  return { name, status: "pass" }
}

async function checkSupabaseScraper(): Promise<Check> {
  const name = "supabase_scraper"
  const url = process.env.SCRAPER_SUPABASE_URL
  const key = process.env.SCRAPER_SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return { name, status: "skip", detail: "scraper env not configured" }
  }
  // The scraper DB has no `clients` table, so confirm reachability via the REST
  // root. A valid service-role key returns 200; an invalid one returns 401.
  const res = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })
  if (!res.ok) return { name, status: "fail", detail: `REST ${res.status}` }
  return { name, status: "pass" }
}

async function checkStripe(): Promise<Check> {
  const name = "stripe"
  if (!process.env.STRIPE_SECRET_KEY) {
    return { name, status: "fail", detail: "STRIPE_SECRET_KEY missing" }
  }
  await getStripe().products.list({ limit: 1 })
  return { name, status: "pass" }
}

async function checkResend(): Promise<Check> {
  const name = "resend"
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { name, status: "fail", detail: "RESEND_API_KEY missing" }

  const fromAddress = process.env.RESEND_FROM ?? "Protekon <compliance@protekon.org>"
  const fromDomain = (fromAddress.match(/@([^>]+?)>?$/)?.[1] ?? "").toLowerCase().trim()
  if (!fromDomain) {
    return { name, status: "fail", detail: `cannot parse domain from RESEND_FROM=${fromAddress}` }
  }

  const res = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return { name, status: "fail", detail: `Resend API ${res.status}` }

  const body = (await res.json()) as { data?: Array<{ name: string; status: string }> }
  const match = body.data?.find((d) => d.name.toLowerCase() === fromDomain)
  if (!match) {
    return {
      name,
      status: "fail",
      detail: `${fromDomain} not in Resend domain list — emails will be rejected`,
    }
  }
  if (match.status !== "verified") {
    return {
      name,
      status: "fail",
      detail: `${fromDomain} status=${match.status} (must be verified)`,
    }
  }
  return { name, status: "pass" }
}

async function checkInngest(): Promise<Check> {
  const name = "inngest"
  if (!process.env.INNGEST_EVENT_KEY) return { name, status: "fail", detail: "INNGEST_EVENT_KEY missing" }
  if (!process.env.INNGEST_SIGNING_KEY) return { name, status: "fail", detail: "INNGEST_SIGNING_KEY missing" }
  return { name, status: "pass", detail: "env present (no remote ping)" }
}

async function checkVercelBlob(): Promise<Check> {
  const name = "vercel_blob"
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { name, status: "fail", detail: "BLOB_READ_WRITE_TOKEN missing" }
  }
  await blobList({ limit: 1 })
  return { name, status: "pass" }
}

async function checkUpstashVector(): Promise<Check> {
  const name = "upstash_vector"
  if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
    return { name, status: "skip", detail: "vector env not configured" }
  }
  const res = await fetch(`${process.env.UPSTASH_VECTOR_REST_URL}/info`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_VECTOR_REST_TOKEN}` },
  })
  if (!res.ok) return { name, status: "fail", detail: `Upstash ${res.status}` }
  return { name, status: "pass" }
}

async function checkSanity(): Promise<Check> {
  const name = "sanity"
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.NEXT_PUBLIC_SANITY_DATASET) {
    return { name, status: "skip", detail: "sanity env not configured" }
  }
  const url = `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${process.env.NEXT_PUBLIC_SANITY_DATASET}?query=*[_type==%22settings%22][0]{_id}`
  const res = await fetch(url, {
    headers: process.env.SANITY_API_READ_TOKEN
      ? { Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` }
      : {},
  })
  if (!res.ok) return { name, status: "fail", detail: `Sanity ${res.status}` }
  return { name, status: "pass" }
}

// ─── Route handler ──────────────────────────────────────────────────────────

async function handle(request: NextRequest) {
  // Header gate
  const expected = process.env.HEALTH_CHECK_SECRET
  const provided = request.headers.get("x-health-secret")
  // Vercel Cron requests carry an "Authorization: Bearer <CRON_SECRET>" header.
  // Accept either path so the same endpoint serves cron + manual probes.
  const cronAuth = request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
  if (!expected) {
    return NextResponse.json({ ok: false, error: "HEALTH_CHECK_SECRET not configured" }, { status: 503 })
  }
  if (provided !== expected && !cronAuth) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const checks = await Promise.all([
    timed("supabase_app", checkSupabaseApp),
    timed("supabase_scraper", checkSupabaseScraper),
    timed("stripe", checkStripe),
    timed("resend", checkResend),
    timed("inngest", checkInngest),
    timed("vercel_blob", checkVercelBlob),
    timed("upstash_vector", checkUpstashVector),
    timed("sanity", checkSanity),
  ])

  const failures = checks.filter((c) => c.status === "fail")
  const ok = failures.length === 0
  const summary: Record<string, string> = {}
  for (const c of checks) {
    summary[c.name] = c.detail ? `${c.status}: ${c.detail}` : c.status
  }

  // Alert on regression — fire-and-forget; never block the response.
  if (!ok && process.env.RESEND_ALERT_TO && process.env.RESEND_API_KEY) {
    const lines = failures
      .map((c) => `• ${c.name}: ${c.detail ?? "unknown"}`)
      .join("\n")
    const subject = `[Protekon] Integration health: ${failures.length} fail(s)`
    sendEmail({
      to: process.env.RESEND_ALERT_TO,
      subject,
      html: `<pre style="font-family:monospace;font-size:13px;line-height:1.5">${lines}\n\nFull report: ${JSON.stringify(summary, null, 2)}</pre>`,
    }).catch((err) => {
      console.error("[health] alert send failed:", err instanceof Error ? err.message : err)
    })
  }

  return NextResponse.json({
    ok,
    checks: summary,
    failures: failures.map((c) => c.name),
    ts: new Date().toISOString(),
  })
}

export async function GET(request: NextRequest) {
  return handle(request)
}

export async function POST(request: NextRequest) {
  return handle(request)
}
