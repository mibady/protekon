/**
 * Type definitions for the v2 dashboard surfaces.
 *
 * These are the canonical shapes for data flowing from server actions to surfaces.
 * Keep in sync with migrations 036 (system_activity, v_client_activity) and
 * 037 (client_action_items).
 *
 * SCHEMA ALIGNMENT NOTE (2026-04-16):
 *   The field names here match the actual database columns. Earlier drafts
 *   used slightly different names — these are the live ones:
 *     client_action_items:  cta_href (not cta_url), description (not body),
 *                           no updated_at, completed_at + dismissed_at separate
 *     v_client_activity:    at (not occurred_at), kind / subtype (not category),
 *                           title (not headline), no id column, no link_url
 */

// ──────────────────────────────────────────────────────────────────────────
// Client identity
// ──────────────────────────────────────────────────────────────────────────

/**
 * Subset of the `clients` row needed by v2 layout + sidebar.
 * Surfaces that need more data fetch it via their own server actions.
 */
export type V2Client = {
  id: string
  business_name: string
  vertical: string
  state: string | null
  compliance_score: number | null
  v2_enabled: boolean
  onboarding_completed_at: string | null
}

// ──────────────────────────────────────────────────────────────────────────
// Posture — the verdict at the top of Briefing
// ──────────────────────────────────────────────────────────────────────────

/**
 * The four possible verdicts. Ordering matters: "strong" and "onboarding" are
 * positive states, "needs_attention" and "at_risk" are negative.
 *
 * Mapping rules (see lib/v2/actions/briefing.ts getPosture):
 *   - score === null OR onboarding_completed_at === null  → "onboarding"
 *   - any "must" action item open                         → "at_risk"
 *   - any "high" action item open                         → "needs_attention"
 *   - score >= 75 (no musts, no highs)                    → "strong"
 *   - fallback                                            → "needs_attention"
 */
export type PostureVerdict =
  | "strong"
  | "needs_attention"
  | "at_risk"
  | "onboarding"

export type Posture = {
  verdict: PostureVerdict
  /** One-paragraph narration in officer voice. Used verbatim in PostureHeader. */
  summary: string
  /**
   * Optional detail line under the summary (e.g. "Down 3 points from last week"
   * or "Your WVPP expires in 14 days"). Null when no trend-worthy change.
   */
  detail: string | null
}

// ──────────────────────────────────────────────────────────────────────────
// Action items — "I need you on" cards
// Matches table: client_action_items
// ──────────────────────────────────────────────────────────────────────────

export type ActionItemPriority = "must" | "high" | "medium" | "low"
export type ActionItemStatus = "open" | "done" | "dismissed" | "expired"
export type ActionItemSource =
  | "system"
  | "officer"
  | "partner"
  | "compliance-rule"

export type ActionItem = {
  id: string
  client_id: string
  priority: ActionItemPriority
  status: ActionItemStatus
  source: ActionItemSource
  /** The one-sentence statement the user sees on the card. Officer voice. */
  title: string
  /** Optional secondary text. Maps to the DB column `description`. */
  description: string | null
  /** The CTA text. e.g. "Review and sign" / "Acknowledge" / "Start training". */
  cta_label: string | null
  /** Where the CTA deep-links to. Maps to DB column `cta_href`. */
  cta_href: string | null
  /** ISO timestamp. Null when there's no hard deadline. */
  due_at: string | null
  /** Optional linkage to a subject row (the specific document, incident, training). */
  subject_type: string | null
  subject_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  completed_at: string | null
  dismissed_at: string | null
}

// ──────────────────────────────────────────────────────────────────────────
// Activity — the unified timeline (v_client_activity view)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Matches the `kind` column of v_client_activity.
 * Current rows: alert, incident, system_action.
 * Adding document/training as forward-looking categories.
 */
export type ActivityKind =
  | "alert"
  | "incident"
  | "system_action"
  | "document"
  | "training"

/**
 * Derived from `kind`. Used by UI to select icon + tone:
 *   - system_action → officer (Protekon did this for you)
 *   - incident      → user (you logged it)
 *   - alert         → system (automated detection)
 */
export type ActivityActor = "officer" | "user" | "system"

export type ActivityEntry = {
  /** Composite key constructed from {kind}:{subject_id}:{at}. View has no native id. */
  key: string
  client_id: string
  at: string
  kind: ActivityKind
  subtype: string | null
  severity: string | null
  /** Raw title from the view. */
  title: string
  detail: string | null
  subject_id: string | null
  subject_type: string | null
  /** Derived actor: see comment on ActivityActor. Computed in the server action. */
  actor: ActivityActor
  /**
   * Derived headline in officer voice. The DB `title` is often a generic
   * string — the server action rewrites based on actor + subtype to produce
   * the first-person form used throughout the UI.
   */
  headline: string
  /** Optional deep-link derived from subject_type + subject_id. */
  link_url: string | null
}
