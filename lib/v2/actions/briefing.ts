"use server"

import { createClient } from "@/lib/supabase/server"
import type {
  ActionItem,
  ActivityActor,
  ActivityEntry,
  ActivityKind,
  Posture,
  V2Client,
} from "@/lib/v2/types"
import type { UpNextItem } from "@/components/v2/primitives/UpNextRow"
import type { IntelligenceStory } from "@/components/v2/primitives/IntelligenceCard"

/**
 * Briefing data pipeline.
 *
 * Each function below returns the shape expected by one block of the
 * Briefing page. They're independent — the page calls them in parallel via
 * Promise.all. If one fails, the others still render.
 *
 * All functions enforce row ownership via Supabase RLS (policies key off
 * auth.uid() = clients.id). No explicit client_id filter is needed —
 * Postgres applies the policy automatically. That said, we filter anyway as
 * a belt-and-suspenders defense against RLS misconfigurations.
 */

// ──────────────────────────────────────────────────────────────────────────
// getPosture — computes the verdict + summary paragraph
// ──────────────────────────────────────────────────────────────────────────

export async function getPosture(client: V2Client): Promise<Posture> {
  const supabase = await createClient()

  // Onboarding state short-circuits everything else.
  if (
    client.onboarding_completed_at === null ||
    client.compliance_score === null
  ) {
    return {
      verdict: "onboarding",
      summary:
        "I'm getting your coverage set up. Your first documents are being drafted — I'll have them ready within 24 hours.",
      detail: null,
    }
  }

  // Count open action items by priority. We only need must + high for the
  // verdict decision, and we cap at 5 to avoid pulling unnecessary rows.
  const { data: priorityRows } = await supabase
    .from("client_action_items")
    .select("priority")
    .eq("client_id", client.id)
    .eq("status", "open")
    .in("priority", ["must", "high"])
    .limit(20)

  const mustCount =
    priorityRows?.filter((r) => r.priority === "must").length ?? 0
  const highCount =
    priorityRows?.filter((r) => r.priority === "high").length ?? 0

  // Verdict selection logic per type definition.
  if (mustCount > 0) {
    return {
      verdict: "at_risk",
      summary: buildAtRiskSummary(mustCount),
      detail: null,
    }
  }
  if (highCount > 0) {
    return {
      verdict: "needs_attention",
      summary: buildNeedsAttentionSummary(highCount),
      detail: null,
    }
  }
  if (client.compliance_score >= 75) {
    return {
      verdict: "strong",
      summary: buildStrongSummary(),
      detail: null,
    }
  }
  // Score below 75 but no open musts/highs — phrased more softly than
  // "at risk" because the user hasn't been given anything to fix yet.
  return {
    verdict: "needs_attention",
    summary:
      "Your Cal/OSHA posture needs a look. Your score is below the strong threshold, and I'm putting together a set of actions for you.",
    detail: null,
  }
}

function buildStrongSummary(): string {
  // Rotating phrasing keeps daily visits from feeling identical. The
  // selection is deterministic by day so the same user sees the same line
  // all day but something different tomorrow.
  const variants = [
    "Your Cal/OSHA posture is strong. Nothing open today.",
    "Your Cal/OSHA posture is strong. You're current on every plan and the week is clear.",
    "Your Cal/OSHA posture is strong. Training's filed, documents are current, and there's nothing for you to handle.",
  ]
  return variants[new Date().getDate() % variants.length]
}

function buildNeedsAttentionSummary(highCount: number): string {
  const thing = highCount === 1 ? "one thing" : `${highCount} things`
  return `Your Cal/OSHA posture needs a look. I need you on ${thing} this week — nothing on fire, but worth handling before it escalates.`
}

function buildAtRiskSummary(mustCount: number): string {
  const thing = mustCount === 1 ? "one item" : `${mustCount} items`
  return `Your Cal/OSHA posture is at risk. ${thing} need your attention today. I've lined them up below.`
}

// ──────────────────────────────────────────────────────────────────────────
// getHandled — "Handled this week" activity list
// ──────────────────────────────────────────────────────────────────────────

/**
 * Returns activity entries from the past 7 days that represent work Protekon
 * did on behalf of the client (system_action) or alerts the system raised.
 * Excludes user-logged incidents — those are the user's own actions and
 * don't belong in "I handled" framing.
 */
export async function getHandled(clientId: string): Promise<ActivityEntry[]> {
  const supabase = await createClient()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data, error } = await supabase
    .from("v_client_activity")
    .select("*")
    .eq("client_id", clientId)
    .eq("kind", "system_action")
    .gte("at", sevenDaysAgo.toISOString())
    .order("at", { ascending: false })
    .limit(8)

  if (error || !data) return []

  return data.map(decorateActivityEntry)
}

// ──────────────────────────────────────────────────────────────────────────
// getOpenActionItems — "I need you on" cards
// ──────────────────────────────────────────────────────────────────────────

/**
 * Returns open action items sorted by priority (must → high → medium → low)
 * then by due_at ascending (overdue first, then soonest due).
 *
 * The priority sort uses Postgres's CASE expression rather than hardcoded
 * ordering — we rely on the query's priority enum ordering.
 */
export async function getOpenActionItems(
  clientId: string
): Promise<ActionItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("client_action_items")
    .select("*")
    .eq("client_id", clientId)
    .eq("status", "open")
    .order("priority", { ascending: true }) // Text sort — must/high/medium/low alphabetized is wrong
    .order("due_at", { ascending: true, nullsFirst: false })
    .limit(6)

  if (error || !data) return []

  // Postgres alphabetical sort on priority gives: high, low, medium, must
  // That's wrong. Re-sort in JS using the correct priority order.
  const priorityOrder = { must: 0, high: 1, medium: 2, low: 3 } as const
  return [...data].sort((a, b) => {
    const ap = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 99
    const bp = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 99
    if (ap !== bp) return ap - bp
    // Within same priority, sort by due_at (null last)
    if (a.due_at === null && b.due_at === null) return 0
    if (a.due_at === null) return 1
    if (b.due_at === null) return -1
    return a.due_at.localeCompare(b.due_at)
  }) as ActionItem[]
}

// ──────────────────────────────────────────────────────────────────────────
// getIntelligence — "What's happening out there" stories
// ──────────────────────────────────────────────────────────────────────────

/**
 * Pulls the top 5 relevant intelligence stories for the client from the app
 * DB mirror table `client_intelligence_items`. That table is populated by
 * `inngest/functions/mirror-intelligence-nightly.ts` (NGE-481), which pulls
 * from the external scraper project once per day.
 *
 * Selection:
 *   1. Supabase query — vertical_tags contains client.vertical, within 14 days,
 *      excluding rows the client has dismissed, limit 20 candidates.
 *   2. Re-rank in-process: relevance_score × recency(half-life ~5d) × geo boost
 *      (1.25× if client.state matches a geo_tag).
 *   3. Slice top 5.
 *
 * RLS already enforces vertical match and dismissal exclusion; the query
 * filters are belt-and-suspenders.
 */
export async function getIntelligence(
  client: V2Client
): Promise<IntelligenceStory[]> {
  const supabase = await createClient()
  const cutoff = new Date(Date.now() - 14 * 86_400_000).toISOString()

  const { data, error } = await supabase
    .from("client_intelligence_items")
    .select(
      "id, headline, story, means_for_you, link_url, source_name, severity, created_at, relevance_score, geo_tags"
    )
    .contains("vertical_tags", [client.vertical])
    .gte("created_at", cutoff)
    .not("dismissed_by_client_ids", "cs", `{${client.id}}`)
    .order("relevance_score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20)

  if (error || !data) return []

  const now = Date.now()
  const stateTag = client.state?.toLowerCase() ?? null
  const ranked = data
    .map((row) => {
      const ageDays =
        (now - new Date(row.created_at as string).getTime()) / 86_400_000
      const recency = Math.exp(-ageDays / 7) // half-life ~5 days
      const geoBoost =
        stateTag &&
        Array.isArray(row.geo_tags) &&
        (row.geo_tags as string[]).includes(stateTag)
          ? 1.25
          : 1
      return {
        row,
        score: Number(row.relevance_score) * recency * geoBoost,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  return ranked.map(({ row }) => ({
    id: row.id as string,
    headline: row.headline as string,
    story: row.story as string,
    means_for_you: (row.means_for_you as string | null) ?? "",
    published_at: row.created_at as string,
    link_url: (row.link_url as string | null) ?? "#",
    severity: ((row.severity as string | null) ??
      "context") as IntelligenceStory["severity"],
  }))
}

// ──────────────────────────────────────────────────────────────────────────
// getUpNext — upcoming deadlines
// ──────────────────────────────────────────────────────────────────────────

/**
 * Returns upcoming deadlines over the next 60 days. Sources:
 *   - client_action_items with due_at in window (lower priority items that
 *     didn't make the "I need you on" cut)
 *   - compliance_calendar entries (if the table exists in this deployment)
 *   - documents.expires_at (plans up for renewal)
 *
 * Merged, deduplicated by subject_id, sorted by date ascending, capped at 5.
 *
 * IMPLEMENTATION STATUS: reads from client_action_items only. The
 * compliance_calendar and documents.expires_at integrations are
 * placeholders — the infrastructure exists but the data is sparse in
 * staging. Adding them is a follow-up.
 */
export async function getUpNext(clientId: string): Promise<UpNextItem[]> {
  const supabase = await createClient()

  const sixtyDaysOut = new Date()
  sixtyDaysOut.setDate(sixtyDaysOut.getDate() + 60)

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("client_action_items")
    .select("id, title, description, due_at, cta_href")
    .eq("client_id", clientId)
    .eq("status", "open")
    .not("due_at", "is", null)
    .gte("due_at", now)
    .lte("due_at", sixtyDaysOut.toISOString())
    .in("priority", ["medium", "low"])
    .order("due_at", { ascending: true })
    .limit(5)

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    due_at: row.due_at as string, // filtered out nulls above
    context: row.description,
    link_url: row.cta_href,
  }))
}

// ──────────────────────────────────────────────────────────────────────────
// Activity entry decoration
// ──────────────────────────────────────────────────────────────────────────

/**
 * Takes a raw v_client_activity row and computes the derived fields that
 * the UI consumes: key, actor, headline, link_url.
 *
 * The headline rewrite is where officer voice gets applied. DB titles like
 * "Document generated" become "I drafted your Heat Illness Prevention Plan."
 * The rewrites are vocabulary-dependent, not comprehensive — anything we
 * don't have a rule for falls back to the raw title.
 */
function decorateActivityEntry(
  row: Record<string, unknown>
): ActivityEntry {
  const kind = row.kind as ActivityKind
  const subtype = (row.subtype as string | null) ?? null
  const at = row.at as string
  const subject_id = (row.subject_id as string | null) ?? null
  const title = (row.title as string) ?? ""
  const detail = (row.detail as string | null) ?? null

  const actor = deriveActor(kind)
  const headline = rewriteHeadline(kind, subtype, title, detail)
  const link_url = deriveLinkUrl(
    row.subject_type as string | null,
    subject_id
  )

  return {
    key: `${kind}:${subject_id ?? "none"}:${at}`,
    client_id: row.client_id as string,
    at,
    kind,
    subtype,
    severity: (row.severity as string | null) ?? null,
    title,
    detail,
    subject_id,
    subject_type: (row.subject_type as string | null) ?? null,
    actor,
    headline,
    link_url,
  }
}

function deriveActor(kind: ActivityKind): ActivityActor {
  if (kind === "system_action") return "officer"
  if (kind === "incident") return "user"
  return "system"
}

function rewriteHeadline(
  kind: ActivityKind,
  subtype: string | null,
  title: string,
  detail: string | null
): string {
  // First-person officer voice for things Protekon did.
  if (kind === "system_action") {
    if (subtype === "doc_generated") {
      // Detail often names the document — "Heat Illness Prevention Plan".
      // If present, splice it into the officer template.
      return detail
        ? `I drafted your ${detail}.`
        : "I drafted a new document for you."
    }
    if (subtype === "training_completed") {
      return detail
        ? `${detail} completed their training.`
        : "Training completed."
    }
  }

  // Incidents are user actions.
  if (kind === "incident") {
    return `You logged a ${subtype ?? "new"} incident.`
  }

  // Alerts describe system-detected conditions — keep the original title.
  // Voice sweep (NGE-458) can refine these later if needed.
  return title
}

function deriveLinkUrl(
  subject_type: string | null,
  subject_id: string | null
): string | null {
  if (!subject_type || !subject_id) return null
  // Map subject_type to the appropriate v2 surface. Keep this list aligned
  // with routes as they come online.
  const routes: Record<string, string> = {
    document: `/dashboard/documents/${subject_id}`,
    incident: `/dashboard/incidents/${subject_id}`,
    training_record: `/dashboard/my-business/team/training/${subject_id}`,
    alert: `/dashboard/activity#${subject_id}`,
  }
  return routes[subject_type] ?? null
}
