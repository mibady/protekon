"use client"

import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import { ScoreBar } from "./ScoreBar"
import type { SubWithRisk } from "@/lib/actions/vendor-risk"

type VendorRiskListProps = {
  subs: SubWithRisk[]
  onRowClick: (id: string) => void
}

type Tone = "enforcement" | "sand" | "steel"

function riskTone(r: SubWithRisk["overall_risk"]): Tone {
  if (r === "critical" || r === "high") return "enforcement"
  if (r === "medium") return "sand"
  return "steel"
}

function coiTone(s: SubWithRisk["coi_status"]): Tone {
  if (s === "current") return "steel"
  if (s === "expiring") return "sand"
  return "enforcement"
}

function cslbDotColor(status: string | null, color: string | null): string {
  const normalized = (status ?? "").toLowerCase()
  if (color === "green" || normalized === "active") return "var(--steel)"
  if (color === "yellow" || normalized === "inactive") return "var(--sand)"
  if (
    color === "red" ||
    normalized === "suspended" ||
    normalized === "revoked" ||
    normalized === "expired"
  ) {
    return "var(--enforcement)"
  }
  return "rgba(11, 29, 58, 0.35)"
}

export function VendorRiskList({ subs, onRowClick }: VendorRiskListProps) {
  if (subs.length === 0) {
    return (
      <div
        className="p-10 text-center font-sans"
        style={{ color: "var(--ink)", opacity: 0.6, fontSize: "14px" }}
      >
        No subs on the roster. Risk scoring activates once you add subcontractors.
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.1)" }}>
            <Th>Company</Th>
            <Th>License</Th>
            <Th>CSLB status</Th>
            <Th>CSLB risk</Th>
            <Th>COI</Th>
            <Th>Overall</Th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s) => (
            <tr
              key={s.id}
              onClick={() => onRowClick(s.id)}
              className="cursor-pointer"
              style={{
                borderBottom: "1px solid rgba(11, 29, 58, 0.06)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(11, 29, 58, 0.02)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <Td>
                <span
                  className="font-display"
                  style={{
                    color: "var(--ink)",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {s.company_name}
                </span>
              </Td>
              <Td>{s.license_number ?? "—"}</Td>
              <Td>
                <span className="inline-flex items-center gap-2">
                  <span
                    style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: cslbDotColor(
                        s.cslb_primary_status,
                        s.cslb_status_color
                      ),
                    }}
                  />
                  <span style={{ fontSize: "13px" }}>
                    {s.cslb_primary_status ?? "—"}
                  </span>
                </span>
              </Td>
              <Td>
                <div style={{ width: "140px" }}>
                  <ScoreBar score={s.cslb_risk_score} invert />
                </div>
              </Td>
              <Td>
                <PriorityPill tone={coiTone(s.coi_status)}>
                  {s.coi_status}
                </PriorityPill>
              </Td>
              <Td>
                <PriorityPill tone={riskTone(s.overall_risk)}>
                  {s.overall_risk}
                </PriorityPill>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="font-display uppercase px-4 py-3"
      style={{
        color: "var(--ink)",
        opacity: 0.55,
        fontSize: "10px",
        letterSpacing: "2px",
        fontWeight: 600,
      }}
    >
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      className="font-sans px-4 py-3"
      style={{ color: "var(--ink)", fontSize: "14px", opacity: 0.85 }}
    >
      {children}
    </td>
  )
}
