"use client"

import { useEffect, useState } from "react"
import { Gauge } from "@phosphor-icons/react"
import { getOshaBenchmarkData } from "@/lib/actions/osha"
import type { OshaBenchmarks } from "@/lib/types"

function PercentileBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-[9px] tracking-[1px] uppercase text-steel w-8 text-right">{label}</span>
      <div className="flex-1 h-2 bg-parchment rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-crimson to-gold rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[11px] text-midnight w-16 text-right">
        ${value.toLocaleString()}
      </span>
    </div>
  )
}

export function OshaScoreComparison() {
  const [data, setData] = useState<OshaBenchmarks | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOshaBenchmarkData()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-brand-white border border-midnight/[0.08] p-6 animate-pulse">
        <div className="h-4 bg-parchment rounded w-48 mb-4" />
        <div className="h-40 bg-parchment rounded" />
      </div>
    )
  }

  if (!data) return null

  const p90 = data.percentiles.p90 || 1

  return (
    <div className="bg-brand-white border border-midnight/[0.08] border-t-[3px] border-t-midnight">
      <div className="p-4 border-b border-midnight/[0.06] flex items-center gap-2">
        <Gauge size={18} className="text-midnight" weight="bold" />
        <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-midnight">
          Industry Penalty Benchmarks
        </h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-parchment p-3 text-center">
            <span className="font-mono font-extrabold text-[20px] text-midnight leading-none">
              ${Math.round(data.californiaAvg.penalty).toLocaleString()}
            </span>
            <p className="font-display text-[8px] tracking-[2px] uppercase text-steel mt-1">
              California Avg
            </p>
          </div>
          <div className="bg-parchment p-3 text-center">
            <span className="font-mono font-extrabold text-[20px] text-midnight leading-none">
              ${Math.round(data.nationalAvg.penalty).toLocaleString()}
            </span>
            <p className="font-display text-[8px] tracking-[2px] uppercase text-steel mt-1">
              National Avg
            </p>
          </div>
        </div>

        <p className="font-display text-[9px] tracking-[2px] uppercase text-steel mb-3">
          Penalty Distribution — {data.vertical}
        </p>
        <div className="space-y-2">
          <PercentileBar label="P25" value={data.percentiles.p25} max={p90} />
          <PercentileBar label="P50" value={data.percentiles.p50} max={p90} />
          <PercentileBar label="P75" value={data.percentiles.p75} max={p90} />
          <PercentileBar label="P90" value={data.percentiles.p90} max={p90} />
        </div>

        {data.topCitedStandards.length > 0 && (
          <div className="mt-4 pt-3 border-t border-midnight/[0.06]">
            <p className="font-display text-[9px] tracking-[2px] uppercase text-steel mb-2">
              Top Cited Standards
            </p>
            <div className="space-y-1">
              {data.topCitedStandards.slice(0, 5).map((std) => (
                <div key={std.code} className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-midnight">{std.code}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-[9px] text-steel">{std.count.toLocaleString()} citations</span>
                    <span className="font-mono text-[11px] text-crimson">${std.avgPenalty.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
