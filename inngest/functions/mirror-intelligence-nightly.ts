import { createHash } from "node:crypto"
import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { createScraperServiceClient } from "@/lib/supabase/scraper"

/**
 * NGE-481 — Nightly Inngest mirror.
 *
 * Pulls intelligence rows from the scraper Supabase project (vizmtkfpxxjzlpzibate)
 * and upserts them into the app DB table `client_intelligence_items`. Sources:
 *   - protekon_v_notable_stories    (enforcement narrative view)
 *   - protekon_regulatory_updates   (rule-change tracking)
 *   - protekon_anomaly_events       (statistical signals, filter severity != 'low')
 *
 * Keyword rankings are out of scope (belong on a different surface).
 *
 * Cron: 0 10 * * *  UTC  → 2 AM PST / 3 AM PDT. DST drift documented in
 * README.md "Inngest Cron Catalog".
 */

// ── Row shape written to client_intelligence_items ────────────────────────────
type MirrorRow = {
  headline: string
  story: string
  means_for_you: string | null
  link_url: string | null
  source_url: string
  source_name: string
  severity: "exposure" | "context" | "neutral"
  vertical_tags: string[]
  geo_tags: string[]
  target_client_industry_codes: string[]
  relevance_score: number
  dedupe_key: string
  source_kind:
    | "enforcement_story"
    | "regulatory_update"
    | "trigger_event"
    | "keyword_ranking"
  source_row_id: string | null
}

// Scraper-row permissive record (view columns are not all strictly typed).
type ScraperRow = Record<string, unknown>

// ── Dedupe + normalization helpers ────────────────────────────────────────────
export const dedupeKey = (sourceUrl: string, headline: string): string =>
  createHash("sha256").update(`${sourceUrl}|${headline}`).digest("hex")

export const VERTICAL_ALIAS: Record<string, string> = {
  construction: "construction",
  general_contractor: "construction",
  concrete: "construction",
  roofing: "construction",
  manufacturing: "manufacturing",
  factory: "manufacturing",
  fabrication: "manufacturing",
  healthcare: "healthcare",
  medical: "healthcare",
  clinic: "healthcare",
  dental: "healthcare",
  warehouse: "wholesale",
  logistics: "wholesale",
  distribution: "wholesale",
  janitorial: "business_support",
  cleaning: "business_support",
  landscaping: "business_support",
  salon: "personal_services",
  spa: "personal_services",
  gym: "personal_services",
  security: "security",
  guard: "security",
}

export function normalizeVertical(raw: string | null | undefined): string | null {
  if (!raw) return null
  const key = String(raw).trim().toLowerCase()
  if (!key) return null
  return VERTICAL_ALIAS[key] ?? key
}

function pickString(row: ScraperRow, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = row[k]
    if (typeof v === "string" && v.length > 0) return v
  }
  return null
}

function pickNumber(row: ScraperRow, ...keys: string[]): number | null {
  for (const k of keys) {
    const v = row[k]
    if (typeof v === "number" && Number.isFinite(v)) return v
    if (typeof v === "string" && v !== "" && !Number.isNaN(Number(v))) {
      return Number(v)
    }
  }
  return null
}

function buildMeansFor(
  vertical: string | null,
  state: string | null,
  severity: MirrorRow["severity"]
): string | null {
  if (!vertical) return null
  const geo = state ? ` in ${state.toUpperCase()}` : ""
  if (severity === "exposure") {
    return `Worth a scan: this is a ${vertical} exposure${geo}. I'll flag it on your next audit if it fits your profile.`
  }
  if (severity === "neutral") {
    return `Context for ${vertical}${geo}. No action needed — I'm keeping it in the file.`
  }
  return `Industry context for ${vertical}${geo}. I'll fold this into your next briefing.`
}

// ── Transformers ──────────────────────────────────────────────────────────────
export function mapEnforcement(r: ScraperRow): MirrorRow {
  const headline = pickString(r, "headline", "title") ?? "Enforcement update"
  const story = pickString(r, "story_body", "summary", "narrative") ?? ""
  const rawVertical = pickString(r, "vertical", "industry")
  const verticalTag = normalizeVertical(rawVertical)
  const state = pickString(r, "state", "state_code")
  const naics = pickString(r, "naics_code", "naics")
  const sourceUrl = pickString(r, "source_url", "url") ?? ""
  const sourceId = pickString(r, "id", "story_id") ?? null
  const severity: MirrorRow["severity"] = "exposure"
  return {
    headline,
    story,
    means_for_you: buildMeansFor(verticalTag, state, severity),
    link_url: sourceUrl || null,
    source_url: sourceUrl,
    source_name: pickString(r, "source_name", "publisher") ?? "Cal/OSHA",
    severity,
    vertical_tags: verticalTag ? [verticalTag] : [],
    geo_tags: state ? [state.toLowerCase()] : [],
    target_client_industry_codes: naics ? [String(naics)] : [],
    relevance_score: pickNumber(r, "relevance_score", "score") ?? 60,
    dedupe_key: dedupeKey(sourceUrl || `enf:${sourceId ?? headline}`, headline),
    source_kind: "enforcement_story",
    source_row_id: sourceId,
  }
}

export function mapRegulatory(r: ScraperRow): MirrorRow {
  const headline = pickString(r, "headline", "title") ?? "Regulatory update"
  const story =
    pickString(r, "summary", "story_body", "description", "body") ?? ""
  const rawVertical = pickString(r, "vertical", "industry")
  const verticalTag = normalizeVertical(rawVertical)
  const state = pickString(r, "state", "state_code")
  const naics = pickString(r, "naics_code", "naics")
  const sourceUrl = pickString(r, "source_url", "url") ?? ""
  const sourceId = pickString(r, "id", "update_id") ?? null
  const severity: MirrorRow["severity"] = "context"
  return {
    headline,
    story,
    means_for_you: buildMeansFor(verticalTag, state, severity),
    link_url: sourceUrl || null,
    source_url: sourceUrl,
    source_name: pickString(r, "source_name", "agency") ?? "Regulator",
    severity,
    vertical_tags: verticalTag ? [verticalTag] : [],
    geo_tags: state ? [state.toLowerCase()] : [],
    target_client_industry_codes: naics ? [String(naics)] : [],
    relevance_score: pickNumber(r, "relevance_score", "score") ?? 55,
    dedupe_key: dedupeKey(sourceUrl || `reg:${sourceId ?? headline}`, headline),
    source_kind: "regulatory_update",
    source_row_id: sourceId,
  }
}

export function mapTrigger(r: ScraperRow): MirrorRow {
  const headline = pickString(r, "headline", "title", "event_type") ?? "Signal"
  const story =
    pickString(r, "summary", "description", "story_body", "details") ?? ""
  const rawVertical = pickString(r, "vertical", "industry")
  const verticalTag = normalizeVertical(rawVertical)
  const state = pickString(r, "state", "state_code")
  const sourceUrl = pickString(r, "source_url", "url") ?? ""
  const sourceId = pickString(r, "id", "event_id") ?? null
  const eventSeverity = pickString(r, "severity")
  const severity: MirrorRow["severity"] =
    eventSeverity === "high" || eventSeverity === "critical"
      ? "exposure"
      : "neutral"
  return {
    headline,
    story,
    means_for_you: buildMeansFor(verticalTag, state, severity),
    link_url: sourceUrl || null,
    source_url: sourceUrl,
    source_name: pickString(r, "source_name", "source") ?? "Anomaly signal",
    severity,
    vertical_tags: verticalTag ? [verticalTag] : [],
    geo_tags: state ? [state.toLowerCase()] : [],
    target_client_industry_codes: [],
    relevance_score: pickNumber(r, "relevance_score", "score") ?? 50,
    dedupe_key: dedupeKey(sourceUrl || `trg:${sourceId ?? headline}`, headline),
    source_kind: "trigger_event",
    source_row_id: sourceId,
  }
}

// Collapse within-batch duplicates by dedupe_key.
export function collapseByKey(rows: MirrorRow[]): MirrorRow[] {
  const byKey = new Map<string, MirrorRow>()
  for (const r of rows) byKey.set(r.dedupe_key, r)
  return Array.from(byKey.values())
}

// ── Inngest function ──────────────────────────────────────────────────────────
export const mirrorIntelligenceNightly = inngest.createFunction(
  {
    id: "mirror-intelligence-nightly",
    name: "Mirror Intelligence Nightly (NGE-481)",
    retries: 3,
    triggers: [{ cron: "0 10 * * *" }],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ({ step }: { step: any }) => {
    const scraper = createScraperServiceClient()
    const app = createAdminClient()

    const enforcement = (await step.run("fetch-enforcement", async () => {
      const since = new Date(Date.now() - 14 * 86_400_000).toISOString()
      const { data, error } = await scraper
        .from("protekon_v_notable_stories")
        .select("*")
        .gte("published_at", since)
        .order("published_at", { ascending: false })
        .limit(500)
      if (error) throw new Error(`notable-stories fetch: ${error.message}`)
      return (data ?? []) as ScraperRow[]
    })) as ScraperRow[]

    const regulatory = (await step.run("fetch-regulatory", async () => {
      const since = new Date(Date.now() - 30 * 86_400_000).toISOString()
      const { data, error } = await scraper
        .from("protekon_regulatory_updates")
        .select("*")
        .gte("published_at", since)
        .order("published_at", { ascending: false })
        .limit(200)
      if (error) throw new Error(`regulatory-updates fetch: ${error.message}`)
      return (data ?? []) as ScraperRow[]
    })) as ScraperRow[]

    const triggers = (await step.run("fetch-triggers", async () => {
      const since = new Date(Date.now() - 14 * 86_400_000).toISOString()
      const { data, error } = await scraper
        .from("protekon_anomaly_events")
        .select("*")
        .neq("severity", "low")
        .gte("event_date", since)
        .order("event_date", { ascending: false })
        .limit(500)
      if (error) throw new Error(`anomaly-events fetch: ${error.message}`)
      return (data ?? []) as ScraperRow[]
    })) as ScraperRow[]

    const rows = (await step.run("transform-and-dedupe", async () => {
      const all: MirrorRow[] = [
        ...enforcement.map(mapEnforcement),
        ...regulatory.map(mapRegulatory),
        ...triggers.map(mapTrigger),
      ]
      return collapseByKey(all)
    })) as MirrorRow[]

    const result = (await step.run("upsert", async () => {
      let written = 0
      for (let i = 0; i < rows.length; i += 100) {
        const chunk = rows.slice(i, i + 100)
        const { error } = await app
          .from("client_intelligence_items")
          .upsert(chunk, {
            onConflict: "dedupe_key",
            ignoreDuplicates: false,
          })
        if (error) throw new Error(`upsert chunk ${i}: ${error.message}`)
        written += chunk.length
      }
      return { written }
    })) as { written: number }

    const fetched =
      enforcement.length + regulatory.length + triggers.length
    return {
      fetched,
      deduped: rows.length,
      written: result.written,
      skipped: fetched - rows.length,
    }
  }
)
