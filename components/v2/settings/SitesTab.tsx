"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  createSite,
  updateSite,
  deleteSite,
  setPrimarySite,
} from "@/lib/actions/sites"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import type { Site } from "@/lib/actions/sites"

type SitesTabProps = {
  sites: Site[]
}

export function SitesTab({ sites }: SitesTabProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [editSite, setEditSite] = useState<Site | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handlePrimary(id: string) {
    setError(null)
    startTransition(async () => {
      const result = await setPrimarySite(id)
      if ("error" in result) setError(result.error)
      else router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this site? This cannot be undone.")) return
    setError(null)
    startTransition(async () => {
      const result = await deleteSite(id)
      if ("error" in result) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div
          className="font-display uppercase"
          style={{
            color: "var(--ink)",
            fontSize: "11px",
            letterSpacing: "3px",
            fontWeight: 600,
          }}
        >
          Sites
        </div>
        <CTAButton onClick={() => setAddOpen(true)} icon={false}>
          Add site
        </CTAButton>
      </div>

      {error && (
        <div
          className="font-sans"
          style={{ color: "var(--enforcement)", fontSize: "13px" }}
        >
          {error}
        </div>
      )}

      {sites.length === 0 ? (
        <div
          className="py-8 text-center font-sans"
          style={{ color: "var(--steel)", fontSize: "14px" }}
        >
          No sites yet. Add your first location to start tracking by-site compliance.
        </div>
      ) : (
        <ul className="divide-y" style={{ borderColor: "rgba(11, 29, 58, 0.06)" }}>
          {sites.map((site) => (
            <li
              key={site.id}
              className="flex items-start justify-between gap-4 py-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  {site.is_primary && (
                    <PriorityPill tone="steel">Primary</PriorityPill>
                  )}
                  <span
                    className="font-sans"
                    style={{ color: "var(--ink)", fontSize: "15px", fontWeight: 600 }}
                  >
                    {site.name}
                  </span>
                </div>
                <div
                  className="font-sans"
                  style={{ color: "var(--steel)", fontSize: "13px" }}
                >
                  {[site.address, site.city, site.state, site.zip]
                    .filter(Boolean)
                    .join(" · ") || "No address on file"}
                </div>
                {site.employee_count !== null && (
                  <div
                    className="font-sans mt-1"
                    style={{ color: "var(--steel)", fontSize: "12px" }}
                  >
                    {site.employee_count} workers
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!site.is_primary && (
                  <button
                    onClick={() => handlePrimary(site.id)}
                    disabled={pending}
                    className="font-display uppercase"
                    style={{
                      color: "var(--steel)",
                      fontSize: "10px",
                      letterSpacing: "2px",
                      padding: "0.5rem 0.75rem",
                      border: "1px solid rgba(11, 29, 58, 0.15)",
                      background: "transparent",
                    }}
                  >
                    Set primary
                  </button>
                )}
                <button
                  onClick={() => setEditSite(site)}
                  className="font-display uppercase"
                  style={{
                    color: "var(--ink)",
                    fontSize: "10px",
                    letterSpacing: "2px",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid rgba(11, 29, 58, 0.15)",
                    background: "transparent",
                  }}
                >
                  Edit
                </button>
                {!site.is_primary && (
                  <button
                    onClick={() => handleDelete(site.id)}
                    disabled={pending}
                    className="font-display uppercase"
                    style={{
                      color: "var(--enforcement)",
                      fontSize: "10px",
                      letterSpacing: "2px",
                      padding: "0.5rem 0.75rem",
                      border: "1px solid rgba(11, 29, 58, 0.15)",
                      background: "transparent",
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <SiteFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        mode="create"
      />
      <SiteFormModal
        open={editSite !== null}
        onClose={() => setEditSite(null)}
        mode="edit"
        site={editSite}
      />
    </div>
  )
}

type SiteFormModalProps = {
  open: boolean
  onClose: () => void
  mode: "create" | "edit"
  site?: Site | null
}

function SiteFormModal({ open, onClose, mode, site }: SiteFormModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  if (!open) return null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result =
        mode === "edit" && site
          ? await updateSite(site.id, formData)
          : await createSite(formData)
      if ("error" in result) {
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
            {mode === "edit" ? "Edit site" : "Add site"}
          </div>

          {["name", "address", "city", "state", "zip"].map((field) => (
            <label key={field} className="block">
              <span
                className="block font-display uppercase mb-2"
                style={{
                  color: "var(--steel)",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  fontWeight: 600,
                }}
              >
                {field}
              </span>
              <input
                name={field}
                defaultValue={
                  site
                    ? (site[field as keyof Site] as string | null) ?? ""
                    : ""
                }
                required={field === "name"}
                className="w-full px-3 py-2 font-sans"
                style={{
                  background: "var(--parchment)",
                  border: "1px solid rgba(11, 29, 58, 0.15)",
                  color: "var(--ink)",
                  fontSize: "14px",
                }}
              />
            </label>
          ))}

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
              Employee count
            </span>
            <input
              name="employee_count"
              type="number"
              min={0}
              defaultValue={site?.employee_count ?? ""}
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

          <div className="flex items-center justify-end gap-3 pt-2">
            <CTAButton variant="ghost" icon={false} onClick={onClose}>
              Cancel
            </CTAButton>
            <CTAButton type="submit" icon={false} disabled={pending}>
              {pending ? "Saving…" : mode === "edit" ? "Save" : "Add"}
            </CTAButton>
          </div>
        </form>
      </div>
    </div>
  )
}
