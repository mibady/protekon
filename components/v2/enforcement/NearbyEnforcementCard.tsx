import type { OshaNearbyEnforcement } from "@/lib/types"
import { Card } from "@/components/v2/primitives/Card"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"

type Props = {
  rows: OshaNearbyEnforcement[]
}

/**
 * Server component. Renders "Nearby enforcement" table.
 * If `rows` is empty, renders an officer-voice empty state.
 */
export function NearbyEnforcementCard({ rows }: Props) {
  if (!rows || rows.length === 0) {
    return (
      <Card accent="steel">
        <div className="font-display uppercase mb-2" style={{ color: "var(--ink)", opacity: 0.5, fontSize: "11px", letterSpacing: "2px" }}>
          Nearby enforcement
        </div>
        <p className="font-sans" style={{ color: "var(--ink)", opacity: 0.8, fontSize: "15px", lineHeight: 1.55, margin: 0 }}>
          No enforcement activity in your region this week — I&rsquo;ll let you know when it changes.
        </p>
      </Card>
    )
  }

  return (
    <Card accent="enforcement">
      <div className="flex items-center justify-between mb-4">
        <div className="font-display uppercase" style={{ color: "var(--ink)", opacity: 0.5, fontSize: "11px", letterSpacing: "2px" }}>
          Nearby enforcement
        </div>
        <PriorityPill tone="enforcement">{rows.length} CASES</PriorityPill>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.08)" }}>
              <th className="font-display uppercase text-left py-2" style={{ color: "var(--steel)", fontSize: "11px", letterSpacing: "2px", fontWeight: 600 }}>
                Establishment
              </th>
              <th className="font-display uppercase text-left py-2" style={{ color: "var(--steel)", fontSize: "11px", letterSpacing: "2px", fontWeight: 600 }}>
                City
              </th>
              <th className="font-display uppercase text-left py-2" style={{ color: "var(--steel)", fontSize: "11px", letterSpacing: "2px", fontWeight: 600 }}>
                Violation
              </th>
              <th className="font-display uppercase text-right py-2" style={{ color: "var(--steel)", fontSize: "11px", letterSpacing: "2px", fontWeight: 600 }}>
                Penalty
              </th>
              <th className="font-display uppercase text-right py-2" style={{ color: "var(--steel)", fontSize: "11px", letterSpacing: "2px", fontWeight: 600 }}>
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={`${r.establishment}-${idx}`} style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.04)" }}>
                <td className="font-sans py-3" style={{ color: "var(--ink)", fontSize: "14px", fontWeight: 600 }}>
                  {r.establishment}
                </td>
                <td className="font-sans py-3" style={{ color: "var(--steel)", fontSize: "14px" }}>
                  {r.city}, {r.state}
                </td>
                <td className="font-sans py-3" style={{ color: "var(--ink)", fontSize: "14px" }}>
                  {r.violationType}
                  {r.standardCited ? (
                    <span className="font-display ml-2" style={{ color: "var(--steel)", fontSize: "11px", letterSpacing: "1px" }}>
                      {r.standardCited}
                    </span>
                  ) : null}
                </td>
                <td className="font-display text-right py-3" style={{ color: "var(--enforcement)", fontSize: "14px", fontWeight: 700 }}>
                  ${r.penaltyAmount.toLocaleString()}
                </td>
                <td className="font-sans text-right py-3" style={{ color: "var(--steel)", fontSize: "13px" }}>
                  {r.inspectionDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
