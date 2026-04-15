"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Plus, Buildings, Star, Trash, PencilSimple } from "@phosphor-icons/react"
import { useEffect, useState, useTransition } from "react"
import {
  listSites,
  createSite,
  deleteSite,
  setPrimarySite,
  assignUnassignedToSite,
  type Site,
} from "@/lib/actions/sites"
import { getClientProfile } from "@/lib/actions/settings"
import type { ClientProfile } from "@/lib/types"

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [client, setClient] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const refresh = () => listSites().then(setSites)

  useEffect(() => {
    Promise.all([listSites(), getClientProfile()]).then(([s, c]) => {
      setSites(s)
      setClient(c)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="p-8 text-steel font-sans text-[14px]">Loading sites…</div>
  }

  const eligible = client?.plan === "multi-site"
  if (!eligible) {
    return (
      <div className="p-8 max-w-[720px]">
        <Link href="/dashboard" className="flex items-center gap-2 text-steel hover:text-midnight mb-6 font-display text-[11px] tracking-[2px] uppercase">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <div className="bg-brand-white border border-gold/30 p-8">
          <h1 className="font-display font-black text-[28px] text-midnight mb-3">Manage Sites</h1>
          <p className="font-sans text-[14px] text-steel leading-relaxed mb-6">
            Managing multiple locations is included on the Multi-Site plan. Add up to 3 sites, each with
            their own incidents, documents, training, and reports — rolled up in a single dashboard.
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-block bg-gold text-midnight font-display font-bold text-[12px] tracking-[2px] uppercase px-6 py-3 hover:bg-gold/90 transition-colors"
          >
            Upgrade plan
          </Link>
        </div>
      </div>
    )
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createSite(fd)
      if ("error" in result) setError(result.error)
      else {
        setError(null)
        setShowForm(false)
        ;(e.target as HTMLFormElement).reset()
        refresh()
      }
    })
  }

  const onDelete = (site: Site) => {
    if (!window.confirm(`Delete "${site.name}"? Existing records tagged to this site will be unassigned but not removed.`)) return
    startTransition(async () => {
      const result = await deleteSite(site.id)
      if ("error" in result) setError(result.error)
      else { setError(null); refresh() }
    })
  }

  const onSetPrimary = (id: string) => {
    startTransition(async () => {
      const result = await setPrimarySite(id)
      if ("error" in result) setError(result.error)
      else { setError(null); refresh() }
    })
  }

  const onAssignUnassigned = (id: string) => {
    if (!window.confirm("Assign all unassigned records (incidents, documents, training, log requests) to this site?")) return
    startTransition(async () => {
      const result = await assignUnassignedToSite(id)
      if ("error" in result) setError(result.error)
      else { setError(null); refresh() }
    })
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1100px]">
      <Link href="/dashboard" className="inline-flex items-center gap-2 font-display font-medium text-[11px] tracking-[2px] uppercase text-steel hover:text-midnight mb-6">
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Buildings size={20} className="text-crimson" />
            <span className="font-display text-[11px] tracking-[3px] uppercase text-crimson">Multi-Site</span>
          </div>
          <h1 className="font-display font-bold text-[28px] text-midnight mb-2">Manage Sites</h1>
          <p className="font-sans text-[14px] text-steel max-w-[620px]">
            Add up to 3 locations. Each site gets its own incidents, documents, training, and SB 553 log
            requests; the rollup view consolidates everything in one matrix.
          </p>
        </div>
        {sites.length < 3 && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-5 py-3 hover:brightness-110 transition-all"
          >
            <Plus size={14} weight="bold" /> {showForm ? "Cancel" : "Add Site"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-crimson/10 border border-crimson/20 text-crimson font-sans text-[13px]">
          {error}
        </div>
      )}

      {showForm && (
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-brand-white border border-midnight/[0.08] p-5 grid md:grid-cols-2 gap-4"
        >
          <label className="block">
            <span className="font-display font-medium text-[11px] tracking-[2px] uppercase text-steel block mb-1">Site name *</span>
            <input name="name" required className="w-full bg-brand-white border border-midnight/[0.12] px-3 py-2 font-sans text-[14px] focus:border-midnight focus:outline-none" />
          </label>
          <label className="block">
            <span className="font-display font-medium text-[11px] tracking-[2px] uppercase text-steel block mb-1">Employee count</span>
            <input name="employee_count" type="number" min={0} className="w-full bg-brand-white border border-midnight/[0.12] px-3 py-2 font-sans text-[14px] focus:border-midnight focus:outline-none" />
          </label>
          <label className="block md:col-span-2">
            <span className="font-display font-medium text-[11px] tracking-[2px] uppercase text-steel block mb-1">Address</span>
            <input name="address" className="w-full bg-brand-white border border-midnight/[0.12] px-3 py-2 font-sans text-[14px] focus:border-midnight focus:outline-none" />
          </label>
          <label className="block">
            <span className="font-display font-medium text-[11px] tracking-[2px] uppercase text-steel block mb-1">City</span>
            <input name="city" className="w-full bg-brand-white border border-midnight/[0.12] px-3 py-2 font-sans text-[14px] focus:border-midnight focus:outline-none" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="font-display font-medium text-[11px] tracking-[2px] uppercase text-steel block mb-1">State</span>
              <input name="state" maxLength={2} className="w-full bg-brand-white border border-midnight/[0.12] px-3 py-2 font-sans text-[14px] uppercase focus:border-midnight focus:outline-none" />
            </label>
            <label className="block">
              <span className="font-display font-medium text-[11px] tracking-[2px] uppercase text-steel block mb-1">ZIP</span>
              <input name="zip" className="w-full bg-brand-white border border-midnight/[0.12] px-3 py-2 font-sans text-[14px] focus:border-midnight focus:outline-none" />
            </label>
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={isPending} className="bg-midnight text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-5 py-3 hover:brightness-110 disabled:opacity-50">
              {isPending ? "Adding…" : "Add site"}
            </button>
          </div>
        </motion.form>
      )}

      {sites.length === 0 ? (
        <div className="bg-brand-white border border-midnight/[0.08] p-10 text-center">
          <Buildings size={40} className="text-steel/40 mx-auto mb-4" />
          <h2 className="font-display font-bold text-[16px] text-midnight mb-2">No sites yet</h2>
          <p className="font-sans text-[13px] text-steel">Add your first site to start organizing records by location.</p>
        </div>
      ) : (
        <div className="bg-brand-white border border-midnight/[0.08] overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-midnight/5">
              <tr className="font-display font-medium text-[10px] tracking-[2px] uppercase text-steel text-left">
                <th className="px-4 py-3">Name</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3 text-right">Employees</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s.id} className="border-t border-midnight/[0.06]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-[13px] text-midnight">{s.name}</span>
                      {s.is_primary && (
                        <span className="inline-flex items-center gap-1 font-display font-medium text-[9px] tracking-[1px] uppercase text-gold bg-gold/10 px-1.5 py-0.5">
                          <Star size={10} weight="fill" /> Primary
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-sans text-[12px] text-steel">
                    {[s.city, s.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-3 py-3 text-right font-sans text-[13px] text-midnight">{s.employee_count ?? "—"}</td>
                  <td className="px-3 py-3 text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <button
                        onClick={() => onAssignUnassigned(s.id)}
                        disabled={isPending}
                        className="px-2 py-1 text-[10px] tracking-[1px] uppercase font-display text-steel border border-midnight/20 hover:border-gold hover:text-gold disabled:opacity-50"
                        title="Assign all unassigned records to this site"
                      >
                        Claim unassigned
                      </button>
                      {!s.is_primary && (
                        <button
                          onClick={() => onSetPrimary(s.id)}
                          disabled={isPending}
                          className="px-2 py-1 text-[10px] tracking-[1px] uppercase font-display text-steel border border-midnight/20 hover:border-gold hover:text-gold disabled:opacity-50"
                        >
                          Set primary
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(s)}
                        disabled={isPending || s.is_primary}
                        className="p-1.5 text-steel hover:text-crimson disabled:opacity-30 disabled:hover:text-steel"
                        title={s.is_primary ? "Set another site as primary first" : "Delete site"}
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
