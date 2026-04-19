"use client"

/**
 * OwnerInternal — ported from dashboard.jsx:835.
 * Narrative, big-type "Owner view" of Internal Posture. Hero gauge + risk cards +
 * narrative tiles + audit-package CTA + link to Manager registry.
 */

import { Download } from "@phosphor-icons/react/dist/ssr"
import { SectionLabel } from "@/components/v2/primitives/SectionLabel"
import type { SiteRollupRow } from "@/lib/actions/rollup"
import type { DashboardSurfaceData } from "@/lib/v2/actions/dashboard-surface"
import { SiteFilterBanner } from "../blocks/SiteFilterBanner"
import { OwnerHeroGauge } from "./OwnerHeroGauge"
import { OwnerRiskCard } from "../cards/OwnerRiskCard"
import { OwnerSummary } from "./OwnerSummary"

type OwnerInternalProps = {
  siteKey: string
  sites: SiteRollupRow[]
  data: DashboardSurfaceData
  onSwitchToManager: () => void
}

export function OwnerInternal({ siteKey, sites, data, onSwitchToManager }: OwnerInternalProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
  const score = data.complianceScore > 0 ? data.complianceScore : 87

  return (
    <div className="flex flex-col gap-10">
      <SiteFilterBanner siteKey={siteKey} sites={sites} />

      {/* HERO — gauge + single big narrative line + one giant CTA */}
      <div
        className="flex items-center gap-10 p-8"
        style={{
          background: "var(--white)",
          border: "1px solid rgba(11,29,58,0.08)",
          flexWrap: "wrap",
        }}
      >
        <OwnerHeroGauge score={score} />
        <div className="flex-1 min-w-0" style={{ minWidth: 320 }}>
          <div
            className="font-display uppercase mb-3"
            style={{ color: "var(--steel)", fontSize: "11px", letterSpacing: "3px", fontWeight: 500 }}
          >
            {today} · Cal/OSHA jurisdiction
          </div>
          <h2
            className="font-display"
            style={{
              color: "var(--midnight)",
              fontSize: "clamp(28px, 3.5vw, 38px)",
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: 12,
              textWrap: "pretty",
            }}
          >
            You&apos;re in strong shape.{" "}
            <span style={{ color: "var(--enforcement)" }}>Two things</span> need fixing before the end of the month.
          </h2>
          <p
            className="font-sans"
            style={{ color: "var(--steel)", fontSize: "15px", lineHeight: 1.55, maxWidth: "38rem" }}
          >
            Everything else is current. If an inspector walked in today, you&apos;d pass — but let&apos;s close these two so next month you&apos;re not having this conversation.
          </p>
        </div>
      </div>

      {/* THE TWO THINGS — big enforcement action cards */}
      <section>
        <SectionLabel>What needs your attention</SectionLabel>
        <div className="flex flex-col gap-3">
          <OwnerRiskCard
            title="Generate your Hearing Conservation Program"
            detail="Your noise-exposure profile triggers 29 CFR 1910.95. Protekon will draft it with the right citations — you review and sign. About 5 minutes."
            cta="Generate now"
          />
          <OwnerRiskCard
            title="IIPP annual review is 42 days overdue"
            detail="Required every 12 months under 8 CCR §3203. Most of the document stays — you're just confirming site info and signing again."
            cta="Review & sign"
          />
        </div>
      </section>

      {/* WHAT I'M WATCHING — narrative version of radar + retention + seasonal */}
      <section>
        <SectionLabel>What I&apos;m watching for you</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-5" style={{ background: "var(--void)", color: "var(--parchment)" }}>
            <div
              className="font-display uppercase mb-2"
              style={{ color: "var(--sand)", fontSize: "10px", letterSpacing: "2px", fontWeight: 600 }}
            >
              Nearby enforcement
            </div>
            <div
              className="font-display"
              style={{ color: "var(--white)", fontSize: "20px", fontWeight: 700, lineHeight: 1.2, marginBottom: 10 }}
            >
              3 silica citations in Alameda County this month.
            </div>
            <div className="font-sans" style={{ color: "var(--fog)", fontSize: "12px", lineHeight: 1.5 }}>
              Your Silica Exposure Plan is current. You&apos;re covered — I&apos;m just telling you so you know.
            </div>
          </div>
          <div
            className="p-5"
            style={{
              background: "var(--white)",
              border: "1px solid rgba(11,29,58,0.08)",
              borderTop: "2px solid var(--sand)",
            }}
          >
            <div
              className="font-display uppercase mb-2"
              style={{ color: "var(--steel)", fontSize: "10px", letterSpacing: "2px", fontWeight: 600 }}
            >
              Right now
            </div>
            <div
              className="font-display"
              style={{ color: "var(--midnight)", fontSize: "20px", fontWeight: 700, lineHeight: 1.2, marginBottom: 10 }}
            >
              Heat Illness window opens in 6 weeks.
            </div>
            <div className="font-sans" style={{ color: "var(--steel)", fontSize: "12px", lineHeight: 1.5 }}>
              I&apos;ll prep your water-rest-shade posters and training signoffs end of April. Nothing for you to do yet.
            </div>
          </div>
          <div
            className="p-5"
            style={{
              background: "var(--white)",
              border: "1px solid rgba(11,29,58,0.08)",
              borderTop: "2px solid var(--enforcement)",
            }}
          >
            <div
              className="font-display uppercase mb-2"
              style={{ color: "var(--steel)", fontSize: "10px", letterSpacing: "2px", fontWeight: 600 }}
            >
              Coming up
            </div>
            <div
              className="font-display"
              style={{ color: "var(--midnight)", fontSize: "20px", fontWeight: 700, lineHeight: 1.2, marginBottom: 10 }}
            >
              I-9 forms from 2022 purge in 18 days.
            </div>
            <div className="font-sans" style={{ color: "var(--steel)", fontSize: "12px", lineHeight: 1.5 }}>
              3-year retention ends. I&apos;ll archive + shred on schedule — no action needed unless you want to keep them longer.
            </div>
          </div>
        </div>
      </section>

      {/* AUDIT PACKAGE — single big hero CTA */}
      <div
        className="flex items-center gap-8 p-8"
        style={{ background: "var(--midnight)", color: "var(--parchment)", flexWrap: "wrap" }}
      >
        <div className="flex-1 min-w-0" style={{ minWidth: 320 }}>
          <div
            className="font-display uppercase mb-2"
            style={{ color: "var(--sand)", fontSize: "11px", letterSpacing: "3px", fontWeight: 600 }}
          >
            If an inspector shows up
          </div>
          <div
            className="font-display"
            style={{ color: "var(--white)", fontSize: "28px", fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}
          >
            Hand them everything in ten seconds.
          </div>
          <div
            className="font-sans"
            style={{ color: "var(--fog)", fontSize: "14px", lineHeight: 1.55, maxWidth: "36rem" }}
          >
            One ZIP — 12 current templates, 3 most-recent training rosters, 2020–2024 OSHA 300A postings, and a signed index. Keep it on your phone.
          </div>
        </div>
        <button
          className="px-6 py-4 font-display uppercase flex items-center gap-3 flex-shrink-0"
          style={{
            background: "var(--enforcement)",
            color: "var(--parchment)",
            fontSize: "13px",
            letterSpacing: "2px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          <Download size={16} /> Generate audit package
        </button>
      </div>

      <OwnerSummary onExpand={onSwitchToManager} />
    </div>
  )
}
