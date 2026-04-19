"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createProject } from "@/lib/actions/projects"
import { CTAButton } from "@/components/v2/primitives/CTAButton"

type NewProjectModalProps = {
  open: boolean
  onClose: () => void
}

export function NewProjectModal({ open, onClose }: NewProjectModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  if (!open) return null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createProject(formData)
      if (result.error) {
        setError(result.error)
        return
      }
      onClose()
      router.refresh()
    })
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6 z-50"
      style={{ background: "rgba(7, 15, 30, 0.5)" }}
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
            New project
          </div>
          <h2
            className="font-display"
            style={{
              color: "var(--ink)",
              fontSize: "22px",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            What are you building?
          </h2>

          <FormField label="Project name" name="name" required />
          <FormField label="Address / job site" name="address" />

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start date" name="start_date" type="date" />
            <FormField label="End date" name="end_date" type="date" />
          </div>

          <label className="block">
            <FieldLabel>Status</FieldLabel>
            <select
              name="status"
              defaultValue="active"
              className="w-full px-3 py-2 font-sans"
              style={{
                background: "var(--parchment)",
                border: "1px solid rgba(11, 29, 58, 0.15)",
                color: "var(--ink)",
                fontSize: "14px",
              }}
            >
              <option value="planned">planned</option>
              <option value="active">active</option>
              <option value="paused">paused</option>
              <option value="completed">completed</option>
            </select>
          </label>

          <label className="block">
            <FieldLabel>Notes</FieldLabel>
            <textarea
              name="notes"
              rows={3}
              className="w-full px-3 py-2 font-sans"
              style={{
                background: "var(--parchment)",
                border: "1px solid rgba(11, 29, 58, 0.15)",
                color: "var(--ink)",
                fontSize: "14px",
              }}
            />
          </label>

          {/* TODO(wave-b): site_id picker once sites are surfaced in UI */}

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
            <CTAButton type="submit" disabled={pending} icon={false}>
              {pending ? "Creating…" : "Create project"}
            </CTAButton>
          </div>
        </form>
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
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

function FormField({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full px-3 py-2 font-sans"
        style={{
          background: "var(--parchment)",
          border: "1px solid rgba(11, 29, 58, 0.15)",
          color: "var(--ink)",
          fontSize: "14px",
        }}
      />
    </label>
  )
}
