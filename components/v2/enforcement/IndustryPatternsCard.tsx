import type { OshaIndustryProfile } from "@/lib/types"
import { Card } from "@/components/v2/primitives/Card"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"

type Props = {
  profile: OshaIndustryProfile | null
}

/**
 * Server component. Renders "Industry patterns" — top citation categories + mean penalty.
 * Empty when profile is null.
 */
export function IndustryPatternsCard({ profile }: Props) {
  if (!profile) {
    return (
      <Card accent="steel">
        <div className="font-display uppercase mb-2" style={{ color: "var(--ink)", opacity: 0.5, fontSize: "11px", letterSpacing: "2px" }}>
          Industry patterns
        </div>
        <p className="font-sans" style={{ color: "var(--ink)", opacity: 0.8, fontSize: "15px", lineHeight: 1.55, margin: 0 }}>
          Industry profile is still being curated for your vertical. I&rsquo;ll surface top citations here as soon as the dataset is ready.
        </p>
      </Card>
    )
  }

  return (
    <Card accent="sand">
      <div className="flex items-center justify-between mb-4">
        <div className="font-display uppercase" style={{ color: "var(--ink)", opacity: 0.5, fontSize: "11px", letterSpacing: "2px" }}>
          Industry patterns · NAICS {profile.naicsCode}
        </div>
        <PriorityPill tone="sand">
          AVG ${profile.avgPenalty.toLocaleString()}
        </PriorityPill>
      </div>

      <div className="mb-6">
        <h3 className="font-display" style={{ color: "var(--ink)", fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>
          {profile.industryName}
        </h3>
        <div className="font-sans" style={{ color: "var(--steel)", fontSize: "13px" }}>
          {profile.totalViolations.toLocaleString()} violations tracked · {(profile.violationRate * 100).toFixed(1)}% violation rate
        </div>
      </div>

      <div className="space-y-3">
        {profile.topStandards.slice(0, 5).map((s) => (
          <div key={s.code} className="flex items-start justify-between gap-4 py-2" style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.06)" }}>
            <div className="flex-1">
              <div className="font-display" style={{ color: "var(--ink)", fontSize: "13px", letterSpacing: "1px", fontWeight: 600 }}>
                {s.code}
              </div>
              <div className="font-sans" style={{ color: "var(--steel)", fontSize: "13px", lineHeight: 1.5 }}>
                {s.description}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display" style={{ color: "var(--ink)", fontSize: "15px", fontWeight: 700 }}>
                {s.count.toLocaleString()}
              </div>
              {s.avgPenalty !== undefined ? (
                <div className="font-sans" style={{ color: "var(--enforcement)", fontSize: "12px" }}>
                  ${s.avgPenalty.toLocaleString()}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
