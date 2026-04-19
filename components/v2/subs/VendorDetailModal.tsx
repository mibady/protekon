"use client"

import { useEffect, useState } from "react"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import { ScoreBar } from "./ScoreBar"
import { Spark } from "./Spark"
import {
  getVendorRiskDetail,
  type VendorRiskDetail,
} from "@/lib/actions/vendor-risk"

type VendorDetailModalProps = {
  subId: string | null
  onClose: () => void
}

// TODO(wave-b): replace stub with real CSLB risk-score time-series once
// historical data is landed (see vendor-risk.ts wave-b note).
const STUB_SPARK: number[] = [55, 58, 52, 60, 65, 62, 68, 70, 66, 72]

function riskTone(
  r: VendorRiskDetail["overall_risk"]
): "enforcement" | "sand" | "steel" {
  if (r === "critical" || r === "high") return "enforcement"
  if (r === "medium") return "sand"
  return "steel"
}

function coiTone(
  s: VendorRiskDetail["coi_status"]
): "enforcement" | "sand" | "steel" {
  if (s === "current") return "steel"
  if (s === "expiring") return "sand"
  return "enforcement"
}

function formatDate(d: string | null): string {
  if (!d) return "—"
  try {
    return new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return d
  }
}

export function VendorDetailModal({ subId, onClose }: VendorDetailModalProps) {
  const [detail, setDetail] = useState<VendorRiskDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!subId) {
      setDetail(null)
      return
    }
    let active = true
    setLoading(true)
    getVendorRiskDetail(subId)
      .then((d) => {
        if (active) setDetail(d)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [subId])

  if (!subId) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6 z-50"
      style={{ background: "rgba(7, 15, 30, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        style={{
          background: "var(--white)",
          border: "1px solid rgba(11, 29, 58, 0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          {loading && !detail && (
            <div
              className="font-sans"
              style={{ color: "var(--ink)", opacity: 0.6, fontSize: "14px" }}
            >
              Loading sub detail…
            </div>
          )}

          {detail && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div
                    className="font-display uppercase"
                    style={{
                      color: "var(--steel)",
                      fontSize: "11px",
                      letterSpacing: "3px",
                    }}
                  >
                    Vendor detail
                  </div>
                  <h2
                    className="font-display mt-1"
                    style={{
                      color: "var(--ink)",
                      fontSize: "26px",
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    {detail.company_name}
                  </h2>
                  <div
                    className="font-sans mt-1"
                    style={{
                      color: "var(--ink)",
                      opacity: 0.6,
                      fontSize: "13px",
                    }}
                  >
                    {detail.license_number
                      ? `CSLB License ${detail.license_number}`
                      : "No license on file"}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="font-display uppercase mb-1"
                    style={{
                      color: "var(--steel)",
                      fontSize: "10px",
                      letterSpacing: "2px",
                      fontWeight: 600,
                    }}
                  >
                    Overall risk
                  </div>
                  <PriorityPill tone={riskTone(detail.overall_risk)}>
                    {detail.overall_risk}
                  </PriorityPill>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Cell label="CSLB primary status">
                  {detail.cslb_primary_status ?? "—"}
                </Cell>
                <Cell label="CSLB license expires">
                  {formatDate(detail.cslb_license_expires)}
                </Cell>
                <Cell label="Workers' comp expires">
                  {formatDate(detail.cslb_wc_expires)}
                </Cell>
                <Cell label="COI status">
                  <PriorityPill tone={coiTone(detail.coi_status)}>
                    {detail.coi_status}
                  </PriorityPill>
                </Cell>
              </div>

              <div>
                <Label>CSLB risk score</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div style={{ flex: 1 }}>
                    <ScoreBar
                      score={detail.cslb_risk_score}
                      invert
                      weight="CSLB"
                    />
                  </div>
                  <Spark data={STUB_SPARK} />
                </div>
                <div
                  className="font-sans mt-2"
                  style={{
                    color: "var(--ink)",
                    opacity: 0.5,
                    fontSize: "11px",
                  }}
                >
                  Sparkline uses stub data until historical CSLB risk-score
                  time-series lands.
                </div>
              </div>

              <div>
                <Label>COI history</Label>
                {detail.coi_history.length === 0 ? (
                  <p
                    className="font-sans mt-2"
                    style={{
                      color: "var(--ink)",
                      opacity: 0.55,
                      fontSize: "13px",
                    }}
                  >
                    No COI records.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {detail.coi_history.map((h) => (
                      <li
                        key={h.id}
                        className="p-3 grid grid-cols-1 md:grid-cols-4 gap-2"
                        style={{
                          border: "1px solid rgba(11, 29, 58, 0.08)",
                          background: "var(--parchment)",
                        }}
                      >
                        <div>
                          <MiniLabel>Carrier</MiniLabel>
                          <MiniValue>{h.carrier_name ?? "—"}</MiniValue>
                        </div>
                        <div>
                          <MiniLabel>Type</MiniLabel>
                          <MiniValue>{h.policy_type ?? "—"}</MiniValue>
                        </div>
                        <div>
                          <MiniLabel>Effective</MiniLabel>
                          <MiniValue>{formatDate(h.effective_date)}</MiniValue>
                        </div>
                        <div>
                          <MiniLabel>Expires</MiniLabel>
                          <MiniValue>{formatDate(h.expiration_date)}</MiniValue>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <Label>Incidents & training</Label>
                <p
                  className="font-sans mt-2"
                  style={{
                    color: "var(--ink)",
                    opacity: 0.55,
                    fontSize: "13px",
                  }}
                >
                  Sub-level incident and training data lands next wave.
                  Current counts: {detail.incident_count} incidents,{" "}
                  {detail.training_overdue_count} overdue trainings.
                </p>
              </div>

              <div className="flex items-center justify-end pt-2">
                <CTAButton variant="ghost" onClick={onClose} icon={false}>
                  Back
                </CTAButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Cell({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div
        className="font-sans mt-1"
        style={{ color: "var(--ink)", fontSize: "14px" }}
      >
        {children}
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-display uppercase"
      style={{
        color: "var(--steel)",
        fontSize: "10px",
        letterSpacing: "2px",
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  )
}

function MiniLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-display uppercase"
      style={{
        color: "var(--ink)",
        opacity: 0.5,
        fontSize: "9px",
        letterSpacing: "2px",
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  )
}

function MiniValue({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-sans"
      style={{ color: "var(--ink)", fontSize: "13px" }}
    >
      {children}
    </div>
  )
}
