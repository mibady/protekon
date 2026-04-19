import type { OshaBenchmarks } from "@/lib/types"
import type { RollupPayload } from "@/lib/actions/rollup"
import { Card } from "@/components/v2/primitives/Card"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import { BenchmarkBar } from "@/components/v2/benchmarks/BenchmarkBar"

type Props = {
  benchmarks: OshaBenchmarks | null
  rollup: RollupPayload | null
}

/**
 * Peer benchmark grid. Compares your site rollup against the California
 * average from OshaBenchmarks.
 *
 * Four metrics rendered:
 *   - Training overdue %   (lower better) — from rollup.training_total vs training_overdue
 *   - Document completion %(higher better) — from rollup.documents_total vs documents_completed
 *   - Severe incidents     (lower better) — rollup.incidents_severe vs peer (null / TODO)
 *   - Posture / compliance score (higher better) — from benchmarks.californiaAvg.score
 *
 * Any metric without peer data renders as a bare bar with a `peer data pending`
 * label instead of a comparison tick.
 */
export function BenchmarksGrid({ benchmarks, rollup }: Props) {
  if (!benchmarks) {
    return (
      <Card accent="steel">
        <div
          className="font-display uppercase mb-2"
          style={{ color: "var(--ink)", opacity: 0.5, fontSize: "11px", letterSpacing: "2px" }}
        >
          Peer benchmarks
        </div>
        <p
          className="font-sans"
          style={{ color: "var(--ink)", opacity: 0.8, fontSize: "15px", lineHeight: 1.55, margin: 0 }}
        >
          Not enough peers in your trade yet — cohort below 5. I&rsquo;ll surface your standing
          here as soon as enough businesses in your vertical are on the platform.
        </p>
      </Card>
    )
  }

  const totals = rollup?.totals
  const trainingTotal = totals?.training_total ?? 0
  const trainingOverdue = totals?.training_overdue ?? 0
  const trainingOverduePct =
    trainingTotal > 0 ? Math.round((trainingOverdue / trainingTotal) * 100) : 0

  const docsTotal = totals?.documents_total ?? 0
  const docsComplete = totals?.documents_completed ?? 0
  const docsCompletePct =
    docsTotal > 0 ? Math.round((docsComplete / docsTotal) * 100) : 0

  const severeIncidents = totals?.incidents_severe ?? 0

  const yourScore = benchmarks.percentiles.p50 // TODO(later): replace with real client score once posture rollup exists
  const peerScore = benchmarks.californiaAvg.score

  return (
    <Card accent="sand">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div
          className="font-display uppercase"
          style={{ color: "var(--ink)", opacity: 0.5, fontSize: "11px", letterSpacing: "2px" }}
        >
          Peer benchmarks · {benchmarks.vertical}
        </div>
        <PriorityPill tone="steel">California cohort</PriorityPill>
      </div>

      <div>
        <BenchmarkBar
          metric="Training overdue"
          you={trainingOverduePct}
          peer={null}
          max={100}
          better={false}
          unit="%"
          note="Lower is better · required training past due"
        />
        {/* TODO(later): peer training_overdue_pct — not yet in OshaBenchmarks */}

        <BenchmarkBar
          metric="Document completion"
          you={docsCompletePct}
          peer={null}
          max={100}
          better={true}
          unit="%"
          note="Higher is better · completed vs total required templates"
        />
        {/* TODO(later): peer documents_completed_pct — not yet in OshaBenchmarks */}

        <BenchmarkBar
          metric="Severe incidents (12mo)"
          you={severeIncidents}
          peer={null}
          max={Math.max(severeIncidents * 2, 10)}
          better={false}
          note="Lower is better · recordable severe incidents"
        />
        {/* TODO(later): peer severe-incident rate; current OshaBenchmarks exposes violation_rate, not DART */}

        <BenchmarkBar
          metric="Compliance posture score"
          you={yourScore}
          peer={peerScore}
          max={100}
          better={true}
          note="Higher is better · blended posture across standards"
        />
      </div>

      <div
        className="font-sans mt-4"
        style={{ color: "var(--steel)", fontSize: "12px", lineHeight: 1.55 }}
      >
        Avg penalty in your cohort: ${benchmarks.californiaAvg.penalty.toLocaleString()} ·
        CA violation rate: {(benchmarks.californiaAvg.violationRate * 100).toFixed(1)}%
      </div>
    </Card>
  )
}
