"use client"

import { motion } from "framer-motion"
import { Plus, Trash, ShieldCheck } from "@phosphor-icons/react"
import { useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner"

interface FormFieldConfig {
  name: string
  label: string
  type: "text" | "select" | "date" | "number" | "checkbox"
  placeholder?: string
  options?: { value: string; label: string }[]
  required?: boolean
}

interface ColumnConfig {
  key: string
  label: string
  render?: "text" | "status" | "date" | "boolean" | "tags"
}

interface VerticalPageConfig {
  title: string
  description: string
  addButtonLabel: string
  emptyStateMessage: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  fetchAction: () => Promise<Record<string, unknown>[]>
  createAction: (fd: FormData) => Promise<{ error?: string }>
  deleteAction?: (id: string) => Promise<{ error?: string }>
  verifyAction?: (id: string) => Promise<{ error?: string }>
  formFields: FormFieldConfig[]
  columns: ColumnConfig[]
  statusStyles: Record<string, string>
  statusKey?: string
  headerExtra?: ReactNode
  /** Per-row custom actions rendered before verify/delete. `refresh` re-fetches the table. */
  rowActions?: (row: Record<string, unknown>, refresh: () => Promise<void>) => ReactNode
}

const LBL = "font-display text-[12px] tracking-[2px] uppercase text-steel block mb-1"
const INP = "w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"

function formatDate(v: unknown): string {
  if (!v || typeof v !== "string") return "--"
  return new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function rid(row: Record<string, unknown>): string { return String(row.id ?? "") }

function buildDefaults(fields: FormFieldConfig[]): Record<string, string | number | boolean> {
  const d: Record<string, string | number | boolean> = {}
  for (const f of fields) {
    if (f.type === "checkbox") d[f.name] = false
    else if (f.type === "number") d[f.name] = 1
    else if (f.type === "select" && f.options?.[0]) d[f.name] = f.options[0].value
    else d[f.name] = ""
  }
  return d
}

function CellValue({ row, col, ss }: { row: Record<string, unknown>; col: ColumnConfig; ss: Record<string, string> }): ReactNode {
  const value = row[col.key]
  switch (col.render) {
    case "status": {
      const s = String(value ?? "")
      return <span className={`px-2 py-0.5 font-display font-medium text-[10px] tracking-[1px] uppercase ${ss[s] || "bg-steel/10 text-steel"}`}>{s}</span>
    }
    case "date":
      return <span className="font-sans text-[13px] text-midnight">{formatDate(value)}</span>
    case "boolean":
      return value ? <ShieldCheck size={16} className="text-[#2A7D4F]" /> : <span className="font-sans text-[12px] text-steel">--</span>
    case "tags": {
      const tags = Array.isArray(value) ? value : []
      return <div className="flex flex-wrap gap-1">{tags.map((t) => <span key={String(t)} className="px-2 py-0.5 bg-midnight/[0.06] font-display text-[10px] tracking-[1px] uppercase text-midnight">{String(t)}</span>)}</div>
    }
    default:
      return <span className="font-sans text-[13px] text-midnight">{String(value ?? "")}</span>
  }
}

function FormField({ field, value, onChange }: { field: FormFieldConfig; value: string | number | boolean | undefined; onChange: (v: string | number | boolean) => void }): ReactNode {
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-midnight" />
        <span className={LBL}>{field.label}</span>
      </label>
    )
  }
  if (field.type === "select" && field.options) {
    return (
      <div>
        <label className={LBL}>{field.label}</label>
        <select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={`${INP} bg-white`}>
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    )
  }
  if (field.type === "number") {
    return (
      <div>
        <label className={LBL}>{field.label}</label>
        <input type="number" min={1} value={Number(value ?? 0)} onChange={(e) => onChange(parseInt(e.target.value) || 0)} placeholder={field.placeholder} className={INP} />
      </div>
    )
  }
  return (
    <div>
      <label className={LBL}>{field.label}</label>
      <input type={field.type === "date" ? "date" : "text"} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={INP} />
    </div>
  )
}

function VerticalPage({ config }: { config: VerticalPageConfig }): ReactNode {
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(() => buildDefaults(config.formFields))
  const [submitting, setSubmitting] = useState(false)
  const Icon = config.icon
  const sk = config.statusKey ?? "status"
  const hasActions = !!(config.deleteAction || config.verifyAction || config.rowActions)

  async function refresh(): Promise<void> {
    const rows = await config.fetchAction()
    setData(rows)
  }
  const mobileCols = config.columns.filter((c) => c.render !== "boolean").slice(0, 3)

  useEffect(() => {
    config.fetchAction().then(setData).catch(() => toast.error("Failed to load data")).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(): Promise<void> {
    setSubmitting(true)
    try {
      const fd = new FormData()
      for (const f of config.formFields) {
        const v = formData[f.name]
        if (f.type === "checkbox") { if (v) fd.set(f.name, "on") }
        else fd.set(f.name, String(v ?? ""))
      }
      const res = await config.createAction(fd)
      if (res?.error) { toast.error(res.error); return }
      toast.success(`${config.title} added`)
      setData(await config.fetchAction())
      setFormData(buildDefaults(config.formFields))
      setShowForm(false)
    } catch { toast.error("Something went wrong") }
    finally { setSubmitting(false) }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!config.deleteAction) return
    try {
      const res = await config.deleteAction(id)
      if (res?.error) { toast.error(res.error); return }
      setData((p) => p.filter((r) => rid(r) !== id))
      toast.success("Deleted")
    } catch { toast.error("Delete failed") }
  }

  async function handleVerify(id: string): Promise<void> {
    if (!config.verifyAction) return
    try {
      const res = await config.verifyAction(id)
      if (res?.error) { toast.error(res.error); return }
      setData((p) => p.map((r) => rid(r) === id ? { ...r, verified_at: new Date().toISOString() } : r))
      toast.success("Verified")
    } catch { toast.error("Verification failed") }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-[28px] text-midnight">{config.title}</h1>
          <p className="font-sans text-[14px] text-steel mt-1">{config.description}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all">
          <Plus size={16} weight="bold" />
          {config.addButtonLabel}
        </button>
      </div>
      {config.headerExtra}

      {/* Form */}
      {showForm && (
        <motion.div className="bg-brand-white border border-midnight/[0.08] p-6 mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display font-bold text-[12px] tracking-[2px] uppercase text-steel mb-4">New {config.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.formFields.map((f) => (
              <FormField key={f.name} field={f} value={formData[f.name]} onChange={(v) => setFormData((p) => ({ ...p, [f.name]: v }))} />
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit} disabled={submitting} className="bg-midnight text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all disabled:opacity-50">
              {submitting ? "Saving..." : `Save ${config.title}`}
            </button>
            <button onClick={() => setShowForm(false)} className="border border-midnight/[0.1] text-midnight font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:bg-midnight/[0.04] transition-colors">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-midnight/20 border-t-midnight rounded-full animate-spin mx-auto mb-4" />
          <p className="font-sans text-[14px] text-steel">Loading...</p>
        </div>
      )}

      {/* Data */}
      {!loading && (
        <motion.div className="bg-brand-white border border-midnight/[0.08] overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {data.length === 0 ? (
            <div className="text-center py-12">
              <Icon size={48} className="text-steel/30 mx-auto mb-4" />
              <p className="font-sans text-[14px] text-steel mb-3">{config.emptyStateMessage}</p>
              <button onClick={() => setShowForm(true)} className="text-crimson font-display font-semibold text-[11px] tracking-[2px] uppercase hover:underline">{config.addButtonLabel}</button>
            </div>
          ) : (
            <>
              {/* Mobile */}
              <div className="lg:hidden space-y-3 p-3">
                {data.map((row) => {
                  const id = rid(row)
                  const sv = String(row[sk] ?? "")
                  return (
                    <div key={id} className="bg-midnight/50 border border-brand-white/[0.06] p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <span className="font-sans font-medium text-[14px] text-midnight">{String(row[config.columns[0]?.key] ?? "")}</span>
                        <span className={`px-2 py-0.5 font-display font-medium text-[10px] tracking-[1px] uppercase shrink-0 ml-2 ${config.statusStyles[sv] || "bg-steel/10 text-steel"}`}>{sv}</span>
                      </div>
                      <div className="space-y-2">
                        {mobileCols.slice(1).map((col) => (
                          <div key={col.key} className="flex items-center justify-between">
                            <span className="font-display text-[9px] tracking-[2px] uppercase text-steel">{col.label}</span>
                            <CellValue row={row} col={col} ss={config.statusStyles} />
                          </div>
                        ))}
                      </div>
                      {hasActions && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-midnight/[0.06]">
                          {config.rowActions && config.rowActions(row, refresh)}
                          {config.verifyAction && !row.verified_at && (
                            <button onClick={() => handleVerify(id)} className="px-3 py-1.5 bg-[#2A7D4F]/10 text-[#2A7D4F] font-display font-medium text-[10px] tracking-[1px] uppercase hover:bg-[#2A7D4F]/20 transition-colors">Verify</button>
                          )}
                          {config.deleteAction && (
                            <button onClick={() => handleDelete(id)} className="p-2 hover:bg-crimson/[0.04] transition-colors ml-auto">
                              <Trash size={16} className="text-steel hover:text-crimson" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {/* Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-midnight/[0.06] bg-parchment/50">
                      {config.columns.map((c) => <th key={c.key} className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">{c.label}</th>)}
                      {hasActions && <th className="text-right px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row) => {
                      const id = rid(row)
                      return (
                        <tr key={id} className="border-b border-midnight/[0.06] last:border-0 hover:bg-parchment/30 transition-colors">
                          {config.columns.map((c) => <td key={c.key} className="px-4 py-3"><CellValue row={row} col={c} ss={config.statusStyles} /></td>)}
                          {hasActions && (
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                {config.rowActions && config.rowActions(row, refresh)}
                                {config.verifyAction && !row.verified_at && (
                                  <button onClick={() => handleVerify(id)} className="px-3 py-1.5 bg-[#2A7D4F]/10 text-[#2A7D4F] font-display font-medium text-[10px] tracking-[1px] uppercase hover:bg-[#2A7D4F]/20 transition-colors">Verify</button>
                                )}
                                {config.deleteAction && (
                                  <button onClick={() => handleDelete(id)} className="p-2 hover:bg-crimson/[0.04] transition-colors">
                                    <Trash size={16} className="text-steel hover:text-crimson" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  )
}

export { VerticalPage, type VerticalPageConfig, type FormFieldConfig, type ColumnConfig }
