"use client"

import { Card } from "@/components/v2/primitives/Card"
import type { CoiSummary } from "@/lib/actions/coi"

type CoiSummaryTilesProps = {
  summary: CoiSummary
}

type Accent = "enforcement" | "sand" | "steel"

export function CoiSummaryTiles({ summary }: CoiSummaryTilesProps) {
  const tiles: Array<{ label: string; value: number; accent: Accent }> = [
    { label: "Current", value: summary.current, accent: "steel" },
    { label: "Expiring ≤30d", value: summary.expiringSoon, accent: "sand" },
    { label: "Expired", value: summary.expired, accent: "enforcement" },
    { label: "Missing", value: summary.missing, accent: "enforcement" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {tiles.map((t) => (
        <Card key={t.label} accent={t.accent} padding="p-5">
          <div
            className="font-display uppercase mb-2"
            style={{
              color: "var(--ink)",
              opacity: 0.55,
              fontSize: "10px",
              letterSpacing: "2px",
              fontWeight: 600,
            }}
          >
            {t.label}
          </div>
          <div
            className="font-display"
            style={{
              color: "var(--ink)",
              fontSize: "34px",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {t.value}
          </div>
          <div
            className="font-sans mt-1"
            style={{
              color: "var(--ink)",
              opacity: 0.55,
              fontSize: "12px",
            }}
          >
            {t.label === "Current" && "subs with a valid COI on file"}
            {t.label === "Expiring ≤30d" && "renewal window open"}
            {t.label === "Expired" && "coverage has lapsed"}
            {t.label === "Missing" && "no COI uploaded"}
          </div>
        </Card>
      ))}
    </div>
  )
}
