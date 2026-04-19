import { getOshaBenchmarkData } from "@/lib/actions/osha"
import { getSiteRollup } from "@/lib/actions/rollup"
import type { RollupPayload } from "@/lib/actions/rollup"
import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { BenchmarksGrid } from "@/components/v2/benchmarks/BenchmarksGrid"
import type { OshaBenchmarks } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function BenchmarksPage() {
  const [benchmarksResult, rollupResult] = await Promise.allSettled([
    getOshaBenchmarkData(),
    getSiteRollup(),
  ])

  const benchmarks: OshaBenchmarks | null =
    benchmarksResult.status === "fulfilled" ? benchmarksResult.value : null
  const rollup: RollupPayload | null =
    rollupResult.status === "fulfilled" ? rollupResult.value : null

  return (
    <div className="px-10 py-10" style={{ maxWidth: 1400 }}>
      <PageHeader
        eyebrow="INTELLIGENCE · PEER BENCHMARKS"
        title="Where you stand against your trade."
        subtitle="Cohort minimum of 5. Individual businesses are never identified."
      />

      <BenchmarksGrid benchmarks={benchmarks} rollup={rollup} />
    </div>
  )
}
