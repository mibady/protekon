"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "@phosphor-icons/react/dist/ssr"
import {
  getProjectDetail,
  removeSubFromProject,
  type ProjectDetail,
} from "@/lib/actions/projects"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import { AssignSubModal } from "./AssignSubModal"

type AvailableSub = {
  id: string
  company_name: string
  license_number?: string | null
}

type ProjectDetailModalProps = {
  projectId: string | null
  availableSubs: AvailableSub[]
  onClose: () => void
}

function statusTone(status: ProjectDetail["status"]): "enforcement" | "sand" | "steel" {
  if (status === "completed" || status === "archived") return "steel"
  if (status === "paused") return "sand"
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

export function ProjectDetailModal({
  projectId,
  availableSubs,
  onClose,
}: ProjectDetailModalProps) {
  const [detail, setDetail] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    if (!projectId) {
      setDetail(null)
      return
    }
    let active = true
    setLoading(true)
    getProjectDetail(projectId)
      .then((d) => {
        if (active) setDetail(d)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [projectId])

  async function refresh() {
    if (!projectId) return
    const d = await getProjectDetail(projectId)
    setDetail(d)
  }

  function handleRemove(subId: string) {
    if (!projectId) return
    if (!confirm("Remove this sub from the project?")) return
    startTransition(async () => {
      const r = await removeSubFromProject(projectId, subId)
      if (r.error) {
        alert(r.error)
        return
      }
      await refresh()
      router.refresh()
    })
  }

  if (!projectId) return null

  return (
    <>
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
                Loading project…
              </div>
            )}

            {detail && (
              <>
                <div>
                  <div
                    className="font-display uppercase"
                    style={{
                      color: "var(--steel)",
                      fontSize: "11px",
                      letterSpacing: "3px",
                    }}
                  >
                    Project
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
                    {detail.name}
                  </h2>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <InfoCell label="Status">
                    <PriorityPill tone={statusTone(detail.status)}>
                      {detail.status}
                    </PriorityPill>
                  </InfoCell>
                  <InfoCell label="Start">{formatDate(detail.start_date)}</InfoCell>
                  <InfoCell label="End">{formatDate(detail.end_date)}</InfoCell>
                  <InfoCell label="Address">
                    <span style={{ color: "var(--ink)", fontSize: "14px" }}>
                      {detail.address ?? "—"}
                    </span>
                  </InfoCell>
                  <InfoCell label="Subs assigned">
                    <span
                      className="font-display"
                      style={{
                        color: "var(--ink)",
                        fontSize: "20px",
                        fontWeight: 700,
                      }}
                    >
                      {detail.subs.length}
                    </span>
                  </InfoCell>
                </div>

                {detail.notes && (
                  <div>
                    <SectionLabel>Notes</SectionLabel>
                    <p
                      className="font-sans mt-1"
                      style={{
                        color: "var(--ink)",
                        opacity: 0.75,
                        fontSize: "14px",
                        lineHeight: 1.55,
                      }}
                    >
                      {detail.notes}
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <SectionLabel>Assigned subs</SectionLabel>
                    <button
                      type="button"
                      onClick={() => setAssignOpen(true)}
                      className="inline-flex items-center gap-1 font-display uppercase"
                      style={{
                        color: "var(--ink)",
                        fontSize: "11px",
                        letterSpacing: "2px",
                        fontWeight: 600,
                        background: "transparent",
                        border: "1px solid rgba(10, 19, 35, 0.15)",
                        padding: "6px 10px",
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={12} weight="bold" /> Assign sub
                    </button>
                  </div>

                  {detail.subs.length === 0 ? (
                    <p
                      className="font-sans"
                      style={{
                        color: "var(--ink)",
                        opacity: 0.55,
                        fontSize: "13px",
                      }}
                    >
                      No subs assigned yet.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {detail.subs.map((s) => (
                        <li
                          key={s.id}
                          className="flex items-center justify-between p-3"
                          style={{
                            border: "1px solid rgba(11, 29, 58, 0.08)",
                            background: "var(--parchment)",
                          }}
                        >
                          <div>
                            <div
                              className="font-display"
                              style={{
                                color: "var(--ink)",
                                fontSize: "14px",
                                fontWeight: 600,
                              }}
                            >
                              {s.sub_company_name ?? "Sub"}
                            </div>
                            <div
                              className="font-sans"
                              style={{
                                color: "var(--ink)",
                                opacity: 0.6,
                                fontSize: "12px",
                              }}
                            >
                              {s.scope ? `Scope: ${s.scope}` : "No scope set"}
                              {s.sub_license_number
                                ? ` · Lic ${s.sub_license_number}`
                                : ""}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(s.sub_id)}
                            disabled={pending}
                            className="font-display uppercase"
                            style={{
                              color: "var(--enforcement)",
                              fontSize: "10px",
                              letterSpacing: "2px",
                              fontWeight: 600,
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center justify-end pt-2">
                  <CTAButton variant="ghost" onClick={onClose} icon={false}>
                    Close
                  </CTAButton>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {detail && (
        <AssignSubModal
          open={assignOpen}
          projectId={detail.id}
          availableSubs={availableSubs}
          assignedSubIds={detail.subs.map((s) => s.sub_id)}
          onClose={() => setAssignOpen(false)}
          onAssigned={() => {
            setAssignOpen(false)
            void refresh()
          }}
        />
      )}
    </>
  )
}

function InfoCell({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div
        className="font-display uppercase mb-1"
        style={{
          color: "var(--steel)",
          fontSize: "10px",
          letterSpacing: "2px",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div>{children}</div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-display uppercase"
      style={{
        color: "var(--ink)",
        opacity: 0.65,
        fontSize: "11px",
        letterSpacing: "3px",
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  )
}
