import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import {
  getPosture,
  getHandled,
  getOpenActionItems,
  getIntelligence,
  getUpNext,
} from "@/lib/v2/actions/briefing"
import { PostureHeader } from "@/components/v2/primitives/PostureHeader"
import { SectionLabel } from "@/components/v2/primitives/SectionLabel"
import { HandledListItem } from "@/components/v2/primitives/HandledListItem"
import { ActionItemCard } from "@/components/v2/primitives/ActionItemCard"
import { IntelligenceCard } from "@/components/v2/primitives/IntelligenceCard"
import { UpNextRow } from "@/components/v2/primitives/UpNextRow"
import { ChatInput } from "@/components/v2/primitives/ChatInput"
import type { V2Client } from "@/lib/v2/types"

export const dynamic = "force-dynamic" // Always fresh — posture needs real-time data

/**
 * Briefing — the conversational home screen.
 *
 * Layout philosophy: a single scrollable column, narrow measure (max-w-2xl)
 * for readability. Each block is voice-driven text rather than a metric tile.
 * The user reads top-to-bottom and gets a complete picture without clicking.
 *
 * Data fetching: all five blocks fetch in parallel. If one rejects, the
 * page still renders the others (Promise.allSettled). This matters because
 * the scraper DB integration (getIntelligence) may be slower than the app DB
 * and we don't want it blocking the whole page.
 */
export default async function BriefingPage() {
  // Re-fetch the client record here (the layout already did it, but Next.js
  // doesn't expose layout data to pages cleanly). Cheap — single row lookup.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Admin client bypasses RLS for the self-lookup — see app/dashboard/layout.tsx
  // for the full rationale. Column list matches actual prod schema; `state`
  // and `onboarding_completed_at` aren't real columns on `clients`.
  const admin = createAdminClient()
  const { data: clientRow, error: clientErr } = await admin
    .from("clients")
    .select("id, business_name, vertical, compliance_score, v2_enabled")
    .eq("email", user.email!)
    .maybeSingle()

  if (clientErr) {
    console.error("[dashboard/page] clients lookup error:", clientErr)
  }

  if (!clientRow) redirect("/login?error=session_expired")
  const client = {
    ...clientRow,
    state: null,
    onboarding_completed_at: null,
  } as V2Client

  // Parallel fetch all five blocks. allSettled so one failure doesn't
  // cascade.
  const [postureRes, handledRes, actionsRes, intelRes, upNextRes] =
    await Promise.allSettled([
      getPosture(client),
      getHandled(client.id),
      getOpenActionItems(client.id),
      getIntelligence(client),
      getUpNext(client.id),
    ])

  const posture =
    postureRes.status === "fulfilled"
      ? postureRes.value
      : {
          verdict: "needs_attention" as const,
          summary:
            "Your Cal/OSHA posture needs a look. I'm reconnecting to your records — refresh in a minute.",
          detail: null,
        }

  const handled = handledRes.status === "fulfilled" ? handledRes.value : []
  const actions = actionsRes.status === "fulfilled" ? actionsRes.value : []
  const intelligence = intelRes.status === "fulfilled" ? intelRes.value : []
  const upNext = upNextRes.status === "fulfilled" ? upNextRes.value : []

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 px-8 pt-12 pb-4 max-w-2xl w-full mx-auto">
        <PostureHeader client={client} posture={posture} />

        {/* Handled this week */}
        {handled.length > 0 && (
          <section className="mb-10">
            <SectionLabel>Handled this week</SectionLabel>
            <div>
              {handled.map((entry) => (
                <HandledListItem key={entry.key} entry={entry} />
              ))}
            </div>
          </section>
        )}

        {/* I need you on */}
        <section className="mb-10">
          <SectionLabel>
            {actions.length === 0
              ? "Nothing on your plate"
              : actions.length === 1
              ? "I need you on one thing"
              : `I need you on ${actions.length} things`}
          </SectionLabel>
          {actions.length === 0 ? (
            <EmptyActionItems />
          ) : (
            <div className="space-y-3">
              {actions.map((item) => (
                <ActionItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* What's happening out there */}
        <section className="mb-10">
          <SectionLabel>What's happening out there</SectionLabel>
          {intelligence.length === 0 ? (
            <EmptyIntelligence />
          ) : (
            <div>
              {intelligence.map((story) => (
                <IntelligenceCard
                  key={story.id}
                  story={story}
                  variant="compact"
                />
              ))}
            </div>
          )}
        </section>

        {/* Up next */}
        {upNext.length > 0 && (
          <section className="mb-10">
            <SectionLabel>Up next</SectionLabel>
            <div>
              {upNext.map((item) => (
                <UpNextRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky chat — pushes to bottom of viewport in the column */}
      <div className="px-8 max-w-2xl w-full mx-auto">
        <ChatInput />
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Empty states — voice-correct, no generic SaaS placeholders
// ──────────────────────────────────────────────────────────────────────────

function EmptyActionItems() {
  return (
    <div className="py-6 text-sm font-sans text-steel leading-relaxed">
      You're caught up. I'll let you know when something needs you.
    </div>
  )
}

function EmptyIntelligence() {
  return (
    <div className="py-6 text-sm font-sans text-steel leading-relaxed">
      Nothing notable in your industry this week. I'm watching enforcement
      records, regulatory filings, and peer activity — I'll surface anything
      worth your attention.
    </div>
  )
}
