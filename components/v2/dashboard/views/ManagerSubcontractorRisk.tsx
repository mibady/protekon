"use client"

/**
 * ManagerSubcontractorRisk — ported from dashboard.jsx:1343.
 * Dense vendor-chain tracker: 4 stat tiles, "someone else's problem" banner, and
 * the full vendor table with license / COI / W-9 / risk / actions.
 */

import { useMemo } from "react"
import { Warning, Download, Check } from "@phosphor-icons/react/dist/ssr"
import { SectionLabel } from "@/components/v2/primitives/SectionLabel"
import type { SiteRollupRow } from "@/lib/actions/rollup"
import { SUBCONTRACTORS } from "../mocks"
import { SiteFilterBanner } from "../blocks/SiteFilterBanner"
import { MetaLabel } from "../atoms/MetaLabel"
import { StatusBadge } from "../atoms/StatusBadge"
import { SubRiskBadge } from "../atoms/SubRiskBadge"

type ManagerSubcontractorRiskProps = {
  siteKey: string
  sites: SiteRollupRow[]
}

const HEADERS = [
  "Vendor / Trade",
  "License",
  "COI status",
  "COI expires",
  "W-9",
  "Last audit",
  "Risk",
  "",
] as const

export function ManagerSubcontractorRisk({ siteKey, sites }: ManagerSubcontractorRiskProps) {
  const stats = useMemo(() => {
    const total = SUBCONTRACTORS.length
    const coi_expired = SUBCONTRACTORS.filter((s) => s.coi_status === "expired").length
    const coi_expiring = SUBCONTRACTORS.filter((s) => s.coi_status === "expiring").length
    const license_expired = SUBCONTRACTORS.filter((s) => s.license_status === "expired").length
    const w9_missing = SUBCONTRACTORS.filter((s) => !s.w9).length
    return { total, coi_expired, coi_expiring, license_expired, w9_missing }
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <SiteFilterBanner siteKey={siteKey} sites={sites} />

      {/* Vendor posture header */}
      <div className="flex items-start justify-between gap-8" style={{ flexWrap: "wrap" }}>
        <div className="flex-1" style={{ minWidth: 320 }}>
          <MetaLabel>Vendor Chain Tracker</MetaLabel>
          <h2
            className="font-display mt-2"
            style={{
              color: "var(--midnight)",
              fontSize: "28px",
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: "36rem",
            }}
          >
            {stats.coi_expired + stats.license_expired} subcontractor documents lapsed. That&apos;s your liability, not theirs.
          </h2>
          <p
            className="font-sans mt-3"
            style={{ color: "var(--steel)", fontSize: "14px", maxWidth: "38rem", lineHeight: 1.55 }}
          >
            When a sub&apos;s COI expires on your job and something goes wrong, you&apos;re the one Cal/OSHA looks at. Keep this clean.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3" style={{ minWidth: 320 }}>
          <div
            className="p-3"
            style={{
              background: "var(--white)",
              border: "1px solid rgba(11,29,58,0.08)",
              borderTop: "2px solid var(--enforcement)",
            }}
          >
            <MetaLabel>COI expired</MetaLabel>
            <div
              className="font-display mt-1"
              style={{ color: "var(--enforcement)", fontSize: "26px", fontWeight: 700, lineHeight: 1 }}
            >
              {stats.coi_expired}
            </div>
          </div>
          <div
            className="p-3"
            style={{
              background: "var(--white)",
              border: "1px solid rgba(11,29,58,0.08)",
              borderTop: "2px solid var(--sand)",
            }}
          >
            <MetaLabel>COI expiring</MetaLabel>
            <div
              className="font-display mt-1"
              style={{ color: "var(--midnight)", fontSize: "26px", fontWeight: 700, lineHeight: 1 }}
            >
              {stats.coi_expiring}
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
            <MetaLabel>License expired</MetaLabel>
            <div
              className="font-display mt-1"
              style={{ color: "var(--enforcement)", fontSize: "26px", fontWeight: 700, lineHeight: 1 }}
            >
              {stats.license_expired}
            </div>
          </div>
          <div
            className="p-3"
            style={{
              background: "var(--white)",
              border: "1px solid rgba(11,29,58,0.08)",
              borderTop: "2px solid var(--sand)",
            }}
          >
            <MetaLabel>W-9 missing</MetaLabel>
            <div
              className="font-display mt-1"
              style={{ color: "var(--midnight)", fontSize: "26px", fontWeight: 700, lineHeight: 1 }}
            >
              {stats.w9_missing}
            </div>
          </div>
        </div>
      </div>

      {/* Someone Else's Problem banner */}
      <div
        className="flex items-start gap-3 px-5 py-4"
        style={{
          background: "rgba(196,18,48,0.06)",
          borderLeft: "3px solid var(--enforcement)",
          border: "1px solid rgba(196,18,48,0.15)",
        }}
      >
        <div style={{ color: "var(--enforcement)", marginTop: 2 }}>
          <Warning size={18} />
        </div>
        <div className="flex-1">
          <div
            className="font-display uppercase mb-1"
            style={{ color: "var(--enforcement)", fontSize: "10px", letterSpacing: "2px", fontWeight: 600 }}
          >
            &ldquo;Someone Else&apos;s Problem&rdquo; · 2 active exposures
          </div>
          <div className="font-sans" style={{ color: "var(--midnight)", fontSize: "14px", lineHeight: 1.5 }}>
            <strong>Sierra Drywall</strong> license expired 19 days ago — still listed on the Oakland job.{" "}
            <strong>Delta Mechanical</strong> COI lapsed Mar 15 — they&apos;re on two active sites.
          </div>
        </div>
        <button
          className="px-3 py-2 font-display uppercase"
          style={{
            background: "var(--enforcement)",
            color: "var(--parchment)",
            fontSize: "10px",
            letterSpacing: "2px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Request updates
        </button>
      </div>

      {/* Vendor table */}
      <div style={{ background: "var(--white)", border: "1px solid rgba(11,29,58,0.08)" }}>
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(11,29,58,0.08)" }}
        >
          <div>
            <SectionLabel>Active Subcontractors · {SUBCONTRACTORS.length}</SectionLabel>
            <div className="font-sans" style={{ color: "var(--steel)", fontSize: "12px" }}>
              v_construction_subs_dashboard · Refreshed 4 min ago
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 font-display uppercase"
              style={{
                background: "transparent",
                color: "var(--midnight)",
                fontSize: "10px",
                letterSpacing: "2px",
                fontWeight: 600,
                border: "1px solid rgba(11,29,58,0.15)",
                cursor: "pointer",
              }}
            >
              Add vendor
            </button>
            <button
              className="px-3 py-2 font-display uppercase flex items-center gap-1.5"
              style={{
                background: "var(--void)",
                color: "var(--parchment)",
                fontSize: "10px",
                letterSpacing: "2px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              <Download size={12} /> Export CSV
            </button>
          </div>
        </div>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(11,29,58,0.03)" }}>
              {HEADERS.map((h, i) => (
                <th
                  key={h || `empty-${i}`}
                  className="font-display uppercase text-left px-4 py-3"
                  style={{
                    color: "var(--steel)",
                    fontSize: "10px",
                    letterSpacing: "2px",
                    fontWeight: 600,
                    borderBottom: "1px solid rgba(11,29,58,0.08)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SUBCONTRACTORS.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid rgba(11,29,58,0.05)" }}>
                <td className="px-4 py-3">
                  <div
                    className="font-sans"
                    style={{ color: "var(--midnight)", fontSize: "13px", fontWeight: 500 }}
                  >
                    {s.name}
                  </div>
                  <div className="font-sans" style={{ color: "var(--steel)", fontSize: "11px", marginTop: 2 }}>
                    {s.trade}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div
                    className="font-sans"
                    style={{
                      color: s.license_status === "expired" ? "var(--enforcement)" : "var(--midnight)",
                      fontSize: "12px",
                    }}
                  >
                    {s.license}
                  </div>
                  <div style={{ marginTop: 2 }}>
                    <StatusBadge status={s.license_status === "expired" ? "expired" : "current"} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.coi_status} />
                </td>
                <td className="px-4 py-3 font-sans" style={{ color: "var(--midnight)", fontSize: "12px" }}>
                  {s.coi_expires}
                </td>
                <td className="px-4 py-3">
                  {s.w9 ? (
                    <span style={{ color: "var(--sand)" }}>
                      <Check size={14} />
                    </span>
                  ) : (
                    <span
                      className="font-display uppercase"
                      style={{
                        color: "var(--enforcement)",
                        fontSize: "10px",
                        letterSpacing: "2px",
                        fontWeight: 600,
                      }}
                    >
                      Missing
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-sans" style={{ color: "var(--steel)", fontSize: "12px" }}>
                  {s.last_audit}
                </td>
                <td className="px-4 py-3">
                  <SubRiskBadge risk={s.risk} />
                </td>
                <td className="px-4 py-3">
                  <button
                    className="font-display uppercase"
                    style={{
                      color: "var(--enforcement)",
                      background: "transparent",
                      border: "none",
                      fontSize: "10px",
                      letterSpacing: "2px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Request →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="font-sans italic"
        style={{ color: "var(--steel)", fontSize: "12px", textAlign: "center" }}
      >
        Protekon sends auto-requests to subs 30 days before COI expiry. You step in only when a sub goes silent.
      </div>
    </div>
  )
}
