"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { requestDocument } from "@/lib/actions/documents"
import { CTAButton } from "@/components/v2/primitives/CTAButton"

type DocType = {
  id: string
  title: string
  description: string
  regulation: string
  sectionCount: number
  isVerticalSpecific: boolean
}

type RequestDocumentModalProps = {
  open: boolean
  onClose: () => void
  docTypes: DocType[]
}

export function RequestDocumentModal({ open, onClose, docTypes }: RequestDocumentModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  if (!open) return null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await requestDocument(formData)
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
            Request a document
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
            Which plan do you need?
          </h2>

          <label className="block">
            <span
              className="block font-display uppercase mb-2"
              style={{
                color: "var(--steel)",
                fontSize: "10px",
                letterSpacing: "2px",
                fontWeight: 600,
              }}
            >
              Document type
            </span>
            <select
              name="type"
              required
              className="w-full px-3 py-2 font-sans"
              style={{
                background: "var(--parchment)",
                border: "1px solid rgba(11, 29, 58, 0.15)",
                color: "var(--ink)",
                fontSize: "14px",
              }}
            >
              <option value="">Select a template…</option>
              {docTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
              <option value="custom">Custom (describe below)</option>
            </select>
          </label>

          <label className="block">
            <span
              className="block font-display uppercase mb-2"
              style={{
                color: "var(--steel)",
                fontSize: "10px",
                letterSpacing: "2px",
                fontWeight: 600,
              }}
            >
              Notes (optional)
            </span>
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
              placeholder="Anything I should know before assembling this?"
            />
          </label>

          <label className="block">
            <span
              className="block font-display uppercase mb-2"
              style={{
                color: "var(--steel)",
                fontSize: "10px",
                letterSpacing: "2px",
                fontWeight: 600,
              }}
            >
              Priority
            </span>
            <select
              name="priority"
              defaultValue="standard"
              className="w-full px-3 py-2 font-sans"
              style={{
                background: "var(--parchment)",
                border: "1px solid rgba(11, 29, 58, 0.15)",
                color: "var(--ink)",
                fontSize: "14px",
              }}
            >
              <option value="standard">Standard</option>
              <option value="rush">Rush</option>
            </select>
          </label>

          {error && (
            <div
              className="font-sans"
              style={{ color: "var(--enforcement)", fontSize: "13px" }}
            >
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <CTAButton variant="ghost" icon={false} onClick={onClose}>
              Cancel
            </CTAButton>
            <CTAButton type="submit" icon={false} disabled={pending}>
              {pending ? "Requesting…" : "Request"}
            </CTAButton>
          </div>
        </form>
      </div>
    </div>
  )
}
