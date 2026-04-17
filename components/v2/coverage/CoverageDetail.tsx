import Link from "next/link"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

/**
 * Detail-mode body. Renders the per-config sections as label/value grids.
 * Empty values are skipped so the page stays dense — if a section ends up
 * with zero rendered fields, the whole section is suppressed.
 */
export function CoverageDetail({
  config,
  row,
  singular,
}: {
  config: ResourceConfig
  row: ResourceRow
  singular: string
}) {
  const tone = config.statusFn(row)
  const toneDot = TONE_DOT[tone]

  const primaryAction = config.primaryAction
  const primaryHref = primaryAction?.href(row) ?? null

  return (
    <div className="flex-1 px-8 pb-12 max-w-3xl w-full mx-auto">
      {/* Status chip */}
      {toneDot && (
        <div className="mb-8 flex items-center gap-2">
          <span
            className={`inline-block ${toneDot.bg}`}
            style={{ width: 8, height: 8, borderRadius: 0 }}
            aria-hidden
          />
          <span className={`text-xs font-sans tracking-wide ${toneDot.text}`}>
            {toneDot.label}
          </span>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-10">
        {config.detailSections.map((section) => {
          const fields = section
            .render(row)
            .filter((f) => f.value !== null && f.value !== "")
          if (fields.length === 0) return null
          return (
            <section key={section.label}>
              <h2 className="text-[11px] font-sans font-medium tracking-[0.25em] text-steel uppercase mb-3">
                {section.label}
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 bg-white p-6">
                {fields.map((field) => (
                  <div key={field.label}>
                    <dt className="text-xs text-steel/70 font-sans mb-1">
                      {field.label}
                    </dt>
                    <dd className="font-display text-base text-midnight">
                      {field.render ?? field.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )
        })}
      </div>

      {/* Primary action */}
      {primaryAction && primaryHref && (
        <div className="mt-10">
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 px-5 py-3 bg-midnight text-parchment text-sm font-sans font-medium hover:bg-midnight/90 transition-colors"
            style={{ borderRadius: 0 }}
          >
            {primaryAction.label}
          </Link>
        </div>
      )}

      {/* Voice footer — light reassurance the officer is watching this row */}
      <p className="mt-12 text-xs font-sans text-steel/70 italic">
        I&apos;m tracking this {singular.toLowerCase()} for you. If anything
        changes that needs your attention, I&apos;ll flag it on your Briefing.
      </p>
    </div>
  )
}

const TONE_DOT: Record<
  ReturnType<ResourceConfig["statusFn"]>,
  { label: string; bg: string; text: string } | null
> = {
  critical: {
    label: "Critical — needs action today",
    bg: "bg-crimson",
    text: "text-crimson",
  },
  attention: {
    label: "Attention — act this week",
    bg: "bg-gold",
    text: "text-gold",
  },
  ok: null,
  unknown: null,
}
