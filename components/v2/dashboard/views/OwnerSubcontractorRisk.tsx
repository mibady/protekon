"use client"

/**
 * OwnerSubcontractorRisk — ported from dashboard.jsx:1228.
 * Narrative "Owner view" of subcontractor risk. Giant number of at-risk vendors
 * + Fix-these-today action rows + three watching tiles + summary CTA.
 */

import { Warning, Buildings as Building, ArrowRight } from "@phosphor-icons/react/dist/ssr"
import { SectionLabel } from "@/components/v2/primitives/SectionLabel"
import type { SiteRollupRow } from "@/lib/actions/rollup"
import type { DashboardTerminology } from "@/lib/v2/terminology"
import { SUBCONTRACTORS } from "../mocks"
import { SiteFilterBanner } from "../blocks/SiteFilterBanner"

type OwnerSubcontractorRiskProps = {
  siteKey: string
  sites: SiteRollupRow[]
  terminology: DashboardTerminology
  onSwitchToManager: () => void
}

export function OwnerSubcontractorRisk({
  siteKey,
  sites,
  terminology,
  onSwitchToManager,
}: OwnerSubcontractorRiskProps) {
  const expired = SUBCONTRACTORS.filter(
    (s) => s.coi_status === "expired" || s.license_status === "expired"
  )
  const expiring = SUBCONTRACTORS.filter((s) => s.coi_status === "expiring")
  const total = SUBCONTRACTORS.length
  const clean = total - expired.length - expiring.length

  return (
    <div className="flex flex-col gap-10">
      <SiteFilterBanner siteKey={siteKey} sites={sites} />

      {/* HERO — single narrative */}
      <div
        className="flex items-center gap-10 p-8"
        style={{ background: "var(--white)", border: "1px solid rgba(11,29,58,0.08)", flexWrap: "wrap" }}
      >
        <div className="flex-shrink-0 flex flex-col items-center" style={{ minWidth: 180 }}>
          <span
            className="font-display"
            style={{ color: "var(--enforcement)", fontSize: "96px", fontWeight: 800, lineHeight: 1 }}
          >
            {expired.length}
          </span>
          <span
            className="font-display uppercase mt-1"
            style={{ color: "var(--steel)", fontSize: "10px", letterSpacing: "2px", fontWeight: 600 }}
          >
            Vendors at risk
          </span>
        </div>
        <div className="flex-1 min-w-0" style={{ minWidth: 320 }}>
          <div
            className="font-display uppercase mb-3"
            style={{ color: "var(--steel)", fontSize: "11px", letterSpacing: "3px", fontWeight: 500 }}
          >
            {terminology.thirdParty} Risk · External liability
          </div>
          <h2
            className="font-display"
            style={{
              color: "var(--midnight)",
              fontSize: "clamp(26px, 3.2vw, 34px)",
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 12,
              textWrap: "pretty",
            }}
          >
            {expired.length} of your subs have lapsed paperwork on active jobs.{" "}
            <span style={{ color: "var(--enforcement)" }}>That&apos;s your liability.</span>
          </h2>
          <p
            className="font-sans"
            style={{ color: "var(--steel)", fontSize: "15px", lineHeight: 1.55, maxWidth: "38rem" }}
          >
            When their COI or license expires on your site and something goes wrong, Cal/OSHA comes to you. Fix these two today and the chain is clean.
          </p>
        </div>
      </div>

      {/* Action cards — the lapsed ones */}
      <section>
        <SectionLabel>Fix these today</SectionLabel>
        <div className="flex flex-col gap-3">
          {expired.map((s) => {
            const problem =
              s.coi_status === "expired"
                ? `COI lapsed ${s.coi_expires}. They're on active sites right now.`
                : `License expired. Still listed on the Oakland job.`
            return (
              <div
                key={s.id}
                className="p-5 flex items-start gap-4"
                style={{
                  background: "var(--white)",
                  border: "1px solid rgba(196,18,48,0.2)",
                  borderLeft: "3px solid var(--enforcement)",
                }}
              >
                <div style={{ color: "var(--enforcement)", marginTop: 3 }}>
                  <Warning size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-display"
                    style={{ color: "var(--midnight)", fontSize: "18px", fontWeight: 700, lineHeight: 1.25, marginBottom: 4 }}
                  >
                    {s.name} · {s.trade}
                  </div>
                  <div className="font-sans" style={{ color: "var(--steel)", fontSize: "13px", lineHeight: 1.5 }}>
                    {problem}
                  </div>
                </div>
                <button
                  className="px-4 py-2 font-display uppercase flex-shrink-0"
                  style={{
                    background: "var(--enforcement)",
                    color: "var(--parchment)",
                    fontSize: "10px",
                    letterSpacing: "2px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Request update
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Three narrative tiles */}
      <section>
        <SectionLabel>What I&apos;m watching</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
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
              Expiring soon
            </div>
            <div
              className="font-display"
              style={{ color: "var(--midnight)", fontSize: "20px", fontWeight: 700, lineHeight: 1.2, marginBottom: 10 }}
            >
              {expiring.length} COIs expire within 30 days.
            </div>
            <div className="font-sans" style={{ color: "var(--steel)", fontSize: "12px", lineHeight: 1.5 }}>
              I&apos;ve auto-sent renewal requests. They usually come back within a week — I&apos;ll nudge if they don&apos;t.
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
              Clean vendors
            </div>
            <div
              className="font-display"
              style={{ color: "var(--midnight)", fontSize: "20px", fontWeight: 700, lineHeight: 1.2, marginBottom: 10 }}
            >
              {clean} subs have everything current.
            </div>
            <div className="font-sans" style={{ color: "var(--steel)", fontSize: "12px", lineHeight: 1.5 }}>
              Licenses, COIs, W-9s all on file. No action needed.
            </div>
          </div>
          <div className="p-5" style={{ background: "var(--void)", color: "var(--parchment)" }}>
            <div
              className="font-display uppercase mb-2"
              style={{ color: "var(--sand)", fontSize: "10px", letterSpacing: "2px", fontWeight: 600 }}
            >
              Auto-management
            </div>
            <div
              className="font-display"
              style={{ color: "var(--white)", fontSize: "20px", fontWeight: 700, lineHeight: 1.2, marginBottom: 10 }}
            >
              Protekon pings subs 30 days before expiry.
            </div>
            <div className="font-sans" style={{ color: "var(--fog)", fontSize: "12px", lineHeight: 1.5 }}>
              You step in only when a sub goes silent for more than two weeks.
            </div>
          </div>
        </div>
      </section>

      <button
        onClick={onSwitchToManager}
        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:brightness-105"
        style={{ background: "var(--white)", border: "1px solid rgba(11,29,58,0.08)", cursor: "pointer" }}
      >
        <div className="flex items-center gap-5">
          <span style={{ color: "var(--sand)" }}>
            <Building size={22} />
          </span>
          <div>
            <div className="font-display" style={{ color: "var(--midnight)", fontSize: "17px", fontWeight: 600 }}>
              {total} subcontractors on file
            </div>
            <div className="font-sans mt-1" style={{ color: "var(--steel)", fontSize: "12px" }}>
              See the full vendor chain — licenses, COIs, W-9s, audit history, risk ratings.
            </div>
          </div>
        </div>
        <span
          className="font-display uppercase flex items-center gap-2"
          style={{ color: "var(--enforcement)", fontSize: "10px", letterSpacing: "2px", fontWeight: 600 }}
        >
          Open vendor table <ArrowRight size={12} />
        </span>
      </button>
    </div>
  )
}
