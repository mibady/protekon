"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { ChartBar } from "@phosphor-icons/react"
import { getOshaIndustryData } from "@/lib/actions/osha"
import type { OshaIndustryProfile } from "@/lib/types"

export function OshaIndustryBenchmark() {
  const [data, setData] = useState<OshaIndustryProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOshaIndustryData()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-brand-white border border-midnight/[0.08] p-6 animate-pulse">
        <div className="h-4 bg-parchment rounded w-48 mb-4" />
        <div className="h-48 bg-parchment rounded" />
      </div>
    )
  }

  if (!data) return null

  const chartData = data.topStandards.slice(0, 6).map((s) => ({
    name: s.code.length > 12 ? s.code.slice(0, 12) + "..." : s.code,
    fullCode: s.code,
    citations: s.count,
    avgPenalty: s.avgPenalty || 0,
  }))

  const COLORS = ["#B91C1C", "#D5AF52", "#1A1A2E", "#B91C1C", "#D5AF52", "#1A1A2E"]

  return (
    <div className="bg-brand-white border border-midnight/[0.08] border-t-[3px] border-t-crimson">
      <div className="p-4 border-b border-midnight/[0.06] flex items-center gap-2">
        <ChartBar size={18} className="text-crimson" weight="bold" />
        <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-midnight">
          Industry Enforcement Profile
        </h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <span className="font-mono font-extrabold text-[24px] text-midnight leading-none">
              {data.totalViolations.toLocaleString()}
            </span>
            <p className="font-display text-[9px] tracking-[2px] uppercase text-steel mt-1">
              Total Violations
            </p>
          </div>
          <div className="text-center">
            <span className="font-mono font-extrabold text-[24px] text-crimson leading-none">
              ${Math.round(data.avgPenalty).toLocaleString()}
            </span>
            <p className="font-display text-[9px] tracking-[2px] uppercase text-steel mt-1">
              Avg Penalty
            </p>
          </div>
          <div className="text-center">
            <span className="font-mono font-extrabold text-[24px] text-gold leading-none">
              {(data.violationRate * 100).toFixed(0)}%
            </span>
            <p className="font-display text-[9px] tracking-[2px] uppercase text-steel mt-1">
              Violation Rate
            </p>
          </div>
        </div>
        <p className="font-display text-[9px] tracking-[2px] uppercase text-steel mb-2">
          Top Cited Standards — {data.industryName}
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={95}
              tick={{ fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
            />
            <Tooltip
              formatter={(value: number) => [value.toLocaleString(), "Citations"]}
              labelFormatter={(label) => {
                const item = chartData.find((d) => d.name === label)
                return item?.fullCode || label
              }}
              contentStyle={{ fontSize: 12, fontFamily: "var(--font-dm-sans)" }}
            />
            <Bar dataKey="citations" radius={[0, 2, 2, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
