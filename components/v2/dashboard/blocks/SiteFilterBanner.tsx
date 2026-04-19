/**
 * SiteFilterBanner — ported from dashboard.jsx:809.
 * Sand-toned context strip that explains what changes when a single site is scoped.
 * Uses live SiteRollupRow data and falls back to a generic note when no per-site narrative is defined.
 */

import type { SiteRollupRow } from "@/lib/actions/rollup"

type SiteFilterBannerProps = {
  siteKey: string
  sites: SiteRollupRow[]
}

// Per-site narrative overrides keyed by name slug. Optional — falls back to a
// generic headline when not matched. TODO(wave-3): move to a DB table when
// operators can author their own scope narratives.
const NOTES: Record<string, string> = {
  oakland:  "Shop-level view. No jobsite subs to worry about — focus is shop safety, tools, training currency.",
  sanjose:  "Satellite shop view. Lower headcount · WVPP acks all current · silica training due for some workers.",
  oakgrove: "Active project view. Delta Mechanical's COI is deficient and they're on this project — $840K exposure.",
  millbrae: "Active project view. Pioneer Flooring's license expired while assigned here · Summit Electric W-9 still missing.",
}

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "")
}

export function SiteFilterBanner({ siteKey, sites }: SiteFilterBannerProps) {
  if (siteKey === "all") return null
  const site = sites.find((s) => s.site_id === siteKey)
  if (!site) return null

  const slug = slugify(site.site_name)
  const note = NOTES[slug] ?? "This site has its own document stack, training roster, and vendor list."
  const scope = site.is_primary ? "Shop" : "Project"

  return (
    <div
      className="mb-6 p-4 flex items-center gap-4"
      style={{
        background: "rgba(201,168,76,0.08)",
        borderLeft: "3px solid var(--sand)",
        border: "1px solid rgba(201,168,76,0.2)",
      }}
    >
      <div
        className="font-display uppercase"
        style={{
          color: "var(--sand)",
          fontSize: "10px",
          letterSpacing: "2px",
          fontWeight: 600,
          minWidth: 120,
        }}
      >
        Site scope · {scope}
      </div>
      <div
        className="flex-1 font-sans"
        style={{ color: "var(--midnight)", fontSize: "13px", lineHeight: 1.5 }}
      >
        <strong>{site.site_name}.</strong> {note}
      </div>
    </div>
  )
}
