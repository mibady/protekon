"use client"

import { useMemo, useState } from "react"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import { SafetyProgramDetail } from "./SafetyProgramDetail"
import type { ProgramType } from "@/lib/data/safety-program-templates"
import type { SafetyProgram } from "@/lib/actions/safety-programs"

type SubRow = { id: string; company_name: string | null }

type TemplateRow = {
  type: string
  title: string
  authority: string
  reviewIntervalDays: number
  description: string
}

type CellState = "approved" | "pending" | "rejected" | "expired" | "missing"

type Props = {
  subs: SubRow[]
  programs: SafetyProgram[]
  templates: TemplateRow[]
}

/**
 * Subs × 8 program-type matrix. Every cell reveals a status pill or a
 * subdued dash for missing programs. Clicking a cell opens the
 * SafetyProgramDetail drawer which handles upload + review.
 */
export function SafetyProgramsMatrix({ subs, programs, templates }: Props) {
  const [selected, setSelected] = useState<{
    sub: SubRow
    programType: ProgramType
    program: SafetyProgram | null
  } | null>(null)

  // Build a fast (sub_id, program_type) → program map
  const programIndex = useMemo(() => {
    const idx = new Map<string, SafetyProgram>()
    for (const p of programs) {
      idx.set(`${p.sub_id}:${p.program_type}`, p)
    }
    return idx
  }, [programs])

  function findCell(
    subId: string,
    programType: ProgramType
  ): { state: CellState; program: SafetyProgram | null } {
    const program = programIndex.get(`${subId}:${programType}`) ?? null
    if (!program) return { state: "missing", program: null }
    return { state: cellStateFor(program), program }
  }

  function openCell(sub: SubRow, programType: ProgramType): void {
    const { program } = findCell(sub.id, programType)
    setSelected({ sub, programType, program })
  }

  if (subs.length === 0) {
    return (
      <div
        className="font-sans"
        style={{
          padding: 20,
          background: "var(--parchment)",
          color: "var(--ink)",
          opacity: 0.7,
          fontSize: 14,
        }}
      >
        Add a subcontractor first — safety programs are tracked per sub.
      </div>
    )
  }

  return (
    <>
      <div
        className="overflow-x-auto"
        style={{
          background: "var(--white)",
          border: "1px solid rgba(11,29,58,0.08)",
        }}
      >
        <table
          className="w-full"
          style={{ borderCollapse: "collapse", minWidth: 720 }}
        >
          <thead>
            <tr>
              <ThCorner>Sub</ThCorner>
              {templates.map((t) => (
                <ThProgram key={t.type}>
                  <div style={{ fontWeight: 600 }}>{abbr(t.type)}</div>
                  <div
                    className="font-sans"
                    style={{ opacity: 0.5, fontSize: 10, letterSpacing: 0.5 }}
                  >
                    {t.authority.split(" ")[0]}
                  </div>
                </ThProgram>
              ))}
            </tr>
          </thead>
          <tbody>
            {subs.map((sub) => (
              <tr
                key={sub.id}
                style={{ borderTop: "1px solid rgba(11,29,58,0.06)" }}
              >
                <td
                  className="font-display"
                  style={{
                    padding: "12px 14px",
                    fontWeight: 600,
                    color: "var(--ink)",
                    fontSize: 14,
                    borderRight: "1px solid rgba(11,29,58,0.06)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {sub.company_name ?? "(unnamed sub)"}
                </td>
                {templates.map((t) => {
                  const { state } = findCell(sub.id, t.type as ProgramType)
                  return (
                    <td
                      key={t.type}
                      style={{
                        padding: 0,
                        borderLeft: "1px solid rgba(11,29,58,0.04)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => openCell(sub, t.type as ProgramType)}
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          padding: "14px 10px",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          minHeight: 46,
                          width: "100%",
                        }}
                      >
                        <CellBadge state={state} />
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LegendStrip />

      <SafetyProgramDetail
        open={selected !== null}
        sub={selected?.sub ?? null}
        programType={selected?.programType ?? null}
        program={selected?.program ?? null}
        templates={templates}
        onClose={() => setSelected(null)}
      />
    </>
  )
}

// ============================================================

function cellStateFor(program: SafetyProgram): CellState {
  if (program.status === "approved") {
    // Check expiration — reviewIntervalDays is templated but we approximate
    // a 365-day expiration from effective_date when present.
    if (program.effective_date) {
      const effective = new Date(program.effective_date)
      const expiresAt = new Date(effective)
      expiresAt.setDate(expiresAt.getDate() + 365)
      if (expiresAt < new Date()) return "expired"
    }
    return "approved"
  }
  if (program.status === "rejected") return "rejected"
  if (program.status === "expired") return "expired"
  return "pending"
}

function CellBadge({ state }: { state: CellState }) {
  if (state === "missing") {
    return (
      <span
        className="font-display uppercase"
        style={{
          color: "var(--ink)",
          opacity: 0.35,
          fontSize: 10,
          letterSpacing: "2px",
          fontWeight: 600,
        }}
      >
        —
      </span>
    )
  }
  if (state === "approved") {
    return <PriorityPill tone="steel">APPROVED</PriorityPill>
  }
  if (state === "pending") {
    return <PriorityPill tone="sand">PENDING</PriorityPill>
  }
  if (state === "expired") {
    return <PriorityPill tone="enforcement">EXPIRED</PriorityPill>
  }
  return <PriorityPill tone="enforcement">REJECTED</PriorityPill>
}

function ThCorner({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="font-display uppercase"
      style={{
        textAlign: "left",
        padding: "12px 14px",
        fontSize: 10,
        letterSpacing: "2px",
        fontWeight: 600,
        color: "var(--ink)",
        opacity: 0.55,
        borderBottom: "1px solid rgba(11,29,58,0.08)",
        borderRight: "1px solid rgba(11,29,58,0.06)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  )
}

function ThProgram({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="font-display uppercase"
      style={{
        textAlign: "center",
        padding: "10px 8px",
        fontSize: 10,
        letterSpacing: "2px",
        color: "var(--ink)",
        opacity: 0.6,
        borderBottom: "1px solid rgba(11,29,58,0.08)",
        borderLeft: "1px solid rgba(11,29,58,0.04)",
        verticalAlign: "bottom",
      }}
    >
      {children}
    </th>
  )
}

function LegendStrip() {
  return (
    <div
      className="font-display uppercase mt-3 flex flex-wrap gap-4"
      style={{ fontSize: 10, letterSpacing: "2px", opacity: 0.7 }}
    >
      <span>
        <PriorityPill tone="steel">APPROVED</PriorityPill> current
      </span>
      <span>
        <PriorityPill tone="sand">PENDING</PriorityPill> awaiting review
      </span>
      <span>
        <PriorityPill tone="enforcement">EXPIRED</PriorityPill> past 365 days
      </span>
      <span>
        <PriorityPill tone="enforcement">REJECTED</PriorityPill> needs redo
      </span>
      <span style={{ opacity: 0.6 }}>— missing</span>
    </div>
  )
}

function abbr(type: string): string {
  const map: Record<string, string> = {
    iipp: "IIPP",
    hazcom: "HazCom",
    wvpp: "WVPP",
    heat: "Heat",
    respirator: "Respirator",
    fall_protection: "Fall Prot.",
    confined_space: "Confined",
    lockout_tagout: "LOTO",
  }
  return map[type] ?? type
}
