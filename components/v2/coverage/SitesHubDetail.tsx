import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"
import type {
  SiteActivityItem,
  SiteComplianceLoad,
  SiteDocument,
} from "@/lib/v2/actions/sites"

/**
 * Sites hub detail — extends the generic CoverageDetail with four blocks
 * that only make sense for a site row:
 *
 *   1. Location (address grid, employee count, primary badge)
 *   2. Compliance load — 6 deep-link tiles to sibling drill-downs
 *   3. Recent activity — merged top-5 from system_activity + incidents
 *   4. Documents — rows from documents where site_id = …
 *
 * This component is rendered in place of CoverageDetail when the drill-down
 * resolves a row for the sites resource type. Keeps CoverageDetail itself
 * uncluttered for the 8 non-hub types.
 *
 * Officer voice reminder: sites are OWNER-managed. The CTA ("Add a site")
 * routes to the my-business surface — NOT an auto-generation flow — and
 * copy avoids claiming Protekon authored any of the site records.
 */
export function SitesHubDetail({
  config,
  row,
  singular,
  vertical,
  load,
  activity,
  documents,
}: {
  config: ResourceConfig
  row: ResourceRow
  singular: string
  vertical: string
  load: SiteComplianceLoad
  activity: SiteActivityItem[]
  documents: SiteDocument[]
}) {
  const siteId = (row.id as string | undefined) ?? ""
  const primaryAction = config.primaryAction
  const primaryHref = primaryAction?.href(row) ?? null

  // Derive the compliance-load tiles once so we can hide zero-count ones.
  const loadTiles = getLoadTiles(load, vertical)

  return (
    <div className="flex-1 px-8 pb-12 max-w-3xl w-full mx-auto">
      {/* Location */}
      <section className="mb-10">
        <h2 className="text-[11px] font-sans font-medium tracking-[0.25em] text-steel uppercase mb-3">
          Location
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 bg-white p-6">
          {config.detailSections[0]
            ?.render(row)
            .filter((f) => f.value !== null && f.value !== "")
            .map((field) => (
              <div key={field.label}>
                <dt className="text-xs text-steel/70 font-sans mb-1">
                  {field.label}
                </dt>
                <dd className="font-display text-base text-midnight">
                  {field.value}
                </dd>
              </div>
            ))}
        </dl>
      </section>

      {/* Compliance load */}
      <section className="mb-10">
        <h2 className="text-[11px] font-sans font-medium tracking-[0.25em] text-steel uppercase mb-3">
          Compliance load
        </h2>
        {loadTiles.length === 0 ? (
          <p className="bg-white p-6 text-sm font-sans text-steel/80">
            Nothing attached to this {singular.toLowerCase()} yet. As you add
            crew, permits, inspections, and equipment, I&apos;ll surface them
            here.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {loadTiles.map((tile) => (
              <Link
                key={tile.type}
                href={`/v2/coverage/${tile.type}?site_id=${siteId}`}
                className="group flex items-baseline justify-between bg-white p-5 hover:bg-parchment transition-colors"
              >
                <div>
                  <div className="font-display text-2xl text-midnight">
                    {tile.count}
                  </div>
                  <div className="text-xs font-sans text-steel mt-1">
                    {tile.label}
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="text-steel/60 group-hover:text-midnight transition-colors"
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent activity */}
      <section className="mb-10">
        <h2 className="text-[11px] font-sans font-medium tracking-[0.25em] text-steel uppercase mb-3">
          Recent activity
        </h2>
        {activity.length === 0 ? (
          <p className="bg-white p-6 text-sm font-sans text-steel/80">
            No activity logged for this {singular.toLowerCase()} yet.
          </p>
        ) : (
          <ul className="bg-white divide-y divide-fog/30">
            {activity.map((item) => (
              <li key={`${item.kind}-${item.id}`} className="p-5">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span className="font-display text-sm text-midnight">
                    {item.title}
                  </span>
                  <span className="text-xs font-sans text-steel/70 whitespace-nowrap">
                    {formatDate(item.at)}
                  </span>
                </div>
                {item.detail && (
                  <p className="text-xs font-sans text-steel/80 leading-relaxed">
                    {item.detail}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Documents */}
      <section className="mb-10">
        <h2 className="text-[11px] font-sans font-medium tracking-[0.25em] text-steel uppercase mb-3">
          Documents
        </h2>
        {documents.length === 0 ? (
          <p className="bg-white p-6 text-sm font-sans text-steel/80">
            No documents attached to this {singular.toLowerCase()} yet.
          </p>
        ) : (
          <ul className="bg-white divide-y divide-fog/30">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="p-5 flex items-baseline justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-display text-sm text-midnight truncate">
                    {doc.filename ?? "Untitled document"}
                  </div>
                  {doc.type && (
                    <div className="text-xs font-sans text-steel/70 mt-1">
                      {doc.type}
                    </div>
                  )}
                </div>
                <span className="text-xs font-sans text-steel/70 whitespace-nowrap">
                  {doc.created_at ? formatDate(doc.created_at) : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Primary action — "Add a site" routes to the my-business surface */}
      {primaryAction && primaryHref && (
        <div className="mt-4">
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 px-5 py-3 bg-midnight text-parchment text-sm font-sans font-medium hover:bg-midnight/90 transition-colors"
            style={{ borderRadius: 0 }}
          >
            {primaryAction.label}
          </Link>
        </div>
      )}

      <p className="mt-12 text-xs font-sans text-steel/70 italic">
        I&apos;m tracking this {singular.toLowerCase()} for you. If anything
        changes that needs your attention, I&apos;ll flag it on your Briefing.
      </p>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

/**
 * Maps the flat compliance-load counts to tile metadata. Tiles with count
 * === 0 are filtered out by the caller. Labels are vocab-aware: construction
 * gets "crew"/"citations"; healthcare gets "staff"; default stays generic.
 */
function getLoadTiles(
  load: SiteComplianceLoad,
  vertical: string
): Array<{ type: string; count: number; label: string }> {
  const v = (vertical ?? "").toLowerCase()
  const isConstruction = v === "construction" || v === "general_construction"
  const isHealthcare = v === "healthcare" || v === "dental" || v === "medical"

  const teamLabel = isConstruction
    ? load.team === 1
      ? "crew member at this site"
      : "crew members at this site"
    : isHealthcare
      ? load.team === 1
        ? "staff member at this practice"
        : "staff members at this practice"
      : load.team === 1
        ? "team member at this site"
        : "team members at this site"

  const findingsLabel = isConstruction
    ? load.findings === 1
      ? "citation"
      : "citations"
    : load.findings === 1
      ? "finding"
      : "findings"

  const tiles = [
    { type: "team", count: load.team, label: teamLabel },
    {
      type: "assets",
      count: load.assets,
      label: load.assets === 1 ? "asset" : "assets",
    },
    {
      type: "inspections",
      count: load.inspections,
      label: load.inspections === 1 ? "open inspection" : "open inspections",
    },
    {
      type: "permits",
      count: load.permits,
      label: load.permits === 1 ? "permit" : "permits",
    },
    {
      type: "materials",
      count: load.materials,
      label: load.materials === 1 ? "hazardous material" : "hazardous materials",
    },
    {
      type: "findings",
      count: load.findings,
      label: findingsLabel,
    },
  ]

  // Hide tiles with zero count — v1 scope keeps the detail page dense.
  return tiles.filter((t) => t.count > 0)
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return ""
  }
}
