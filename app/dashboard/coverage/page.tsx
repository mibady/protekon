import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { PageHeader } from "@/components/v2/primitives/PageHeader"
import {
  getCoverageOverview,
  type CoverageOverviewRow,
} from "@/lib/v2/actions/coverage"
import { RESOURCE_ICONS } from "@/lib/v2/coverage-resources"
import type { V2Client } from "@/lib/v2/types"

/**
 * Coverage overview.
 *
 * Reads v_client_resources in a single call (via getCoverageOverview) and
 * splits the tiles into primary (pinned) vs secondary (All coverage) based
 * on the resource_type_vertical_map.is_primary flag for the client's
 * vertical.
 *
 * Secondary-tile rule: when the current vertical has no secondaries (every
 * enabled type is primary), the "All coverage" expander is suppressed. No
 * empty disclosure should appear.
 */
export default async function CoveragePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login?next=/v2/coverage")

  // Admin client bypasses RLS for the self-lookup — see app/v2/layout.tsx.
  const admin = createAdminClient()
  const { data: client } = await admin
    .from("clients")
    .select("id, business_name, vertical, compliance_score")
    .eq("email", user.email!)
    .maybeSingle()

  // Break the loop: /dashboard now redirects v2_enabled clients back to v2,
  // so any v2 page that falls back to /dashboard would bounce forever.
  if (!client) redirect("/login?error=session_expired")

  const typed = client as Pick<
    V2Client,
    "id" | "business_name" | "vertical" | "compliance_score"
  >

  const rows = await getCoverageOverview(typed.id)

  const enabledRows = rows.filter((r) => r.enabled)
  const primaries = enabledRows.filter((r) => r.is_primary)
  const secondaries = enabledRows.filter((r) => !r.is_primary)

  return (
    <div className="min-h-screen">
      <div className="px-8 pt-12 pb-12 max-w-6xl w-full mx-auto">
        <PageHeader
          eyebrow="MY BUSINESS · COVERAGE"
          title="Here's everything I'm covering for you."
          subtitle="Every resource type I maintain on your behalf — people, places, documents, third parties. Open any tile to see the full list and drill into specific records."
        />

        {/* Primary tiles — always visible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {primaries.map((row) => (
            <CoverageTile key={row.resource_type} row={row} />
          ))}
        </div>

        {/* Secondary tiles — only when the vertical has any */}
        {secondaries.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer list-none select-none inline-flex items-center gap-2 text-[11px] font-sans font-medium tracking-[0.25em] text-steel uppercase mb-4 hover:text-midnight transition-colors">
              <span
                className="inline-block bg-gold"
                style={{ width: 6, height: 6, borderRadius: 0 }}
                aria-hidden
              />
              <span>All coverage</span>
              <span className="text-steel/60 normal-case tracking-normal font-normal">
                ({secondaries.length})
              </span>
            </summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {secondaries.map((row) => (
                <CoverageTile key={row.resource_type} row={row} />
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Tile
// ──────────────────────────────────────────────────────────────────────────

function CoverageTile({ row }: { row: CoverageOverviewRow }) {
  const Icon = RESOURCE_ICONS[row.resource_type]
  const href = `/dashboard/coverage/${row.resource_type}`

  return (
    <Link
      href={href}
      className="block bg-white p-6 hover:shadow-[0_2px_16px_rgba(7,15,30,0.08)] transition-shadow"
      style={{ borderRadius: 0 }}
    >
      <div className="flex items-start gap-4">
        <div className="text-midnight pt-0.5">
          {Icon ? <Icon size={24} weight="regular" /> : null}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg text-midnight mb-1">
            {row.label}
          </div>
          <div className="font-display text-3xl text-midnight mb-3 tabular-nums">
            {row.total_count}
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-sans">
            {row.critical_count > 0 && (
              <span
                className="px-2 py-0.5 bg-crimson/10 text-crimson"
                style={{ borderRadius: 0 }}
              >
                {row.critical_count} critical
              </span>
            )}
            {row.attention_count > 0 && (
              <span
                className="px-2 py-0.5 bg-gold/10 text-gold"
                style={{ borderRadius: 0 }}
              >
                {row.attention_count} attention
              </span>
            )}
            {row.critical_count === 0 && row.attention_count === 0 && (
              <span className="text-steel/70">Nothing to handle</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
