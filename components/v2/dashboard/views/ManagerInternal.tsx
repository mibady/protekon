"use client"

/**
 * ManagerInternal — ported from dashboard.jsx:1096.
 * Dense, full-registry view. Big gauge, jurisdiction + stat tiles, active risk banner,
 * gap analysis, seasonal + radar, retention + audit-package, then three template groups.
 */

import { Download } from "@phosphor-icons/react/dist/ssr"
import type { SiteRollupRow } from "@/lib/actions/rollup"
import { CANONICAL_NINE, INDUSTRY_HAZARDS, SPECIALIZED } from "../mocks"
import { SiteFilterBanner } from "../blocks/SiteFilterBanner"
import { BigGauge } from "../atoms/BigGauge"
import { JurisdictionBadge } from "../atoms/JurisdictionBadge"
import { MetaLabel } from "../atoms/MetaLabel"
import { ActiveRiskBanner } from "../blocks/ActiveRiskBanner"
import { GapAnalysisBlock } from "../blocks/GapAnalysisBlock"
import { SeasonalTimeline } from "../blocks/SeasonalTimeline"
import { EnforcementRadar } from "../blocks/EnforcementRadar"
import { RetentionAlerts } from "../blocks/RetentionAlerts"
import { TemplateGroup } from "../cards/TemplateGroup"

type ManagerInternalProps = {
  siteKey: string
  sites: SiteRollupRow[]
}

export function ManagerInternal({ siteKey, sites }: ManagerInternalProps) {
  return (
    <div className="flex flex-col gap-8">
      <SiteFilterBanner siteKey={siteKey} sites={sites} />

      {/* Risk Posture Header row */}
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-8" style={{ flexWrap: "wrap" }}>
          <BigGauge score={82} label="Audit-ready on 12 of 16 mandatory templates." />
          <div className="flex flex-col gap-3" style={{ minWidth: 280 }}>
            <JurisdictionBadge />
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3" style={{ background: "var(--white)", border: "1px solid rgba(11,29,58,0.08)" }}>
                <MetaLabel>Templates resolved</MetaLabel>
                <div
                  className="font-display mt-1"
                  style={{ color: "var(--midnight)", fontSize: "26px", fontWeight: 700, lineHeight: 1 }}
                >
                  19
                </div>
                <div className="font-sans mt-1" style={{ color: "var(--steel)", fontSize: "11px" }}>
                  9 platform + 10 vertical
                </div>
              </div>
              <div
                className="p-3"
                style={{
                  background: "var(--white)",
                  border: "1px solid rgba(11,29,58,0.08)",
                  borderTop: "2px solid var(--enforcement)",
                }}
              >
                <MetaLabel>Critical gaps</MetaLabel>
                <div
                  className="font-display mt-1"
                  style={{ color: "var(--enforcement)", fontSize: "26px", fontWeight: 700, lineHeight: 1 }}
                >
                  2
                </div>
                <div className="font-sans mt-1" style={{ color: "var(--steel)", fontSize: "11px" }}>
                  Missing + overdue
                </div>
              </div>
            </div>
          </div>
        </div>
        <ActiveRiskBanner />
      </div>

      <GapAnalysisBlock />

      {/* Seasonal + Radar */}
      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-3">
          <SeasonalTimeline />
        </div>
        <div className="col-span-2">
          <EnforcementRadar />
        </div>
      </div>

      {/* Retention + one-click audit export */}
      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-3">
          <RetentionAlerts />
        </div>
        <div
          className="col-span-2 flex flex-col justify-between p-5"
          style={{ background: "var(--midnight)", color: "var(--parchment)" }}
        >
          <div>
            <div
              className="font-display uppercase mb-2"
              style={{ color: "var(--sand)", fontSize: "10px", letterSpacing: "2px", fontWeight: 600 }}
            >
              One-click audit package
            </div>
            <div
              className="font-display"
              style={{ color: "var(--white)", fontSize: "20px", fontWeight: 700, lineHeight: 1.2, marginBottom: 10 }}
            >
              Inspector on site? Export everything in 10 seconds.
            </div>
            <div className="font-sans" style={{ color: "var(--fog)", fontSize: "12px", lineHeight: 1.5 }}>
              Bundles all 12 current templates + 3 most-recent training rosters + 2020–2024 OSHA 300A postings into a single ZIP with a signed index.
            </div>
          </div>
          <button
            className="mt-4 px-4 py-3 font-display uppercase flex items-center justify-center gap-2"
            style={{
              background: "var(--enforcement)",
              color: "var(--parchment)",
              fontSize: "11px",
              letterSpacing: "2px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              width: "100%",
            }}
          >
            <Download size={14} /> Generate audit package
          </button>
        </div>
      </div>

      <TemplateGroup
        title="Canonical Nine · Platform-wide"
        subtitle="Required for all 27 industry verticals. Keep these current or nothing else matters."
        accent="var(--sand)"
        templates={CANONICAL_NINE}
      />

      <TemplateGroup
        title="Construction Core · Four templates"
        subtitle="Resolved from your vertical. Cal/OSHA-specific thresholds applied: Fall, Silica, Confined Space, Wildfire Smoke."
        accent="var(--enforcement)"
        templates={INDUSTRY_HAZARDS}
      />

      <TemplateGroup
        title="Specialized · Three cross-listed"
        subtitle="Applies because of your exposure profile — energized equipment, respirable hazards, and multi-trade crews on your sites."
        templates={SPECIALIZED}
      />
    </div>
  )
}
