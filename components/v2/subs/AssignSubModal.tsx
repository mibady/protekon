"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { assignSubToProject } from "@/lib/actions/projects"
import { CTAButton } from "@/components/v2/primitives/CTAButton"

type AvailableSub = {
  id: string
  company_name: string
  license_number?: string | null
}

type AssignSubModalProps = {
  open: boolean
  projectId: string
  availableSubs: AvailableSub[]
  assignedSubIds: string[]
  onClose: () => void
  onAssigned: () => void
}

export function AssignSubModal({
  open,
  projectId,
  availableSubs,
  assignedSubIds,
  onClose,
  onAssigned,
}: AssignSubModalProps) {
  const [subId, setSubId] = useState("")
  const [scope, setScope] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  if (!open) return null

  const pool = availableSubs.filter((s) => !assignedSubIds.includes(s.id))

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!subId) {
      setError("Pick a sub.")
      return
    }
    startTransition(async () => {
      const r = await assignSubToProject(projectId, subId, scope || undefined)
      if (r.error) {
        setError(r.error)
        return
      }
      setSubId("")
      setScope("")
      onAssigned()
      router.refresh()
    })
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ background: "rgba(7, 15, 30, 0.5)", zIndex: 60 }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        style={{
          background: "var(--white)",
          border: "1px solid rgba(11, 29, 58, 0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div
            className="font-display uppercase"
            style={{
              color: "var(--steel)",
              fontSize: "11px",
              letterSpacing: "3px",
            }}
          >
            Assign sub
          </div>
          <h2
            className="font-display"
            style={{
              color: "var(--ink)",
              fontSize: "20px",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Which sub is on this project?
          </h2>

          <label className="block">
            <Label>Sub</Label>
            <select
              value={subId}
              onChange={(e) => setSubId(e.target.value)}
              required
              className="w-full px-3 py-2 font-sans"
              style={{
                background: "var(--parchment)",
                border: "1px solid rgba(11, 29, 58, 0.15)",
                color: "var(--ink)",
                fontSize: "14px",
              }}
            >
              <option value="">Select a sub…</option>
              {pool.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.company_name}
                  {s.license_number ? ` · Lic ${s.license_number}` : ""}
                </option>
              ))}
            </select>
            {pool.length === 0 && (
              <p
                className="mt-2 font-sans"
                style={{
                  color: "var(--ink)",
                  opacity: 0.6,
                  fontSize: "12px",
                }}
              >
                No unassigned subs. Add subs from Sub Onboarding first.
              </p>
            )}
          </label>

          <label className="block">
            <Label>Scope (optional)</Label>
            <input
              type="text"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="electrical, concrete, framing…"
              className="w-full px-3 py-2 font-sans"
              style={{
                background: "var(--parchment)",
                border: "1px solid rgba(11, 29, 58, 0.15)",
                color: "var(--ink)",
                fontSize: "14px",
              }}
            />
          </label>

          {error && (
            <div
              className="font-sans"
              style={{ color: "var(--enforcement)", fontSize: "13px" }}
            >
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <CTAButton variant="ghost" onClick={onClose} icon={false}>
              Cancel
            </CTAButton>
            <CTAButton
              type="submit"
              disabled={pending || pool.length === 0}
              icon={false}
            >
              {pending ? "Assigning…" : "Assign sub"}
            </CTAButton>
          </div>
        </form>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="block font-display uppercase mb-2"
      style={{
        color: "var(--steel)",
        fontSize: "10px",
        letterSpacing: "2px",
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  )
}
