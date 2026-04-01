"use client"

import { motion } from "framer-motion"
import { Clipboard, Plus, ShieldCheck } from "@phosphor-icons/react"
import { useState, useEffect } from "react"
import { getPosterLocations, addPosterLocation, verifyPoster } from "@/lib/actions/poster-compliance"

interface PosterLocation {
  id: string
  location_name: string
  poster_type: string
  jurisdiction: string
  status: string
  last_verified_at: string | null
  next_update_due: string | null
}

const statusStyles: Record<string, string> = {
  current: "bg-[#2A7D4F]/10 text-[#2A7D4F]",
  "due-for-update": "bg-gold/10 text-gold",
  overdue: "bg-crimson/10 text-crimson",
}

const statusLabels: Record<string, string> = {
  current: "Current",
  "due-for-update": "Due for Update",
  overdue: "Overdue",
}

export default function PosterCompliancePage() {
  const [locations, setLocations] = useState<PosterLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    location_name: "",
    poster_type: "",
    jurisdiction: "",
    next_update_due: "",
  })

  useEffect(() => {
    getPosterLocations().then((data) => {
      setLocations(data)
      setLoading(false)
    })
  }, [])

  const handleAdd = async () => {
    const fd = new FormData()
    fd.set("location_name", formData.location_name)
    fd.set("poster_type", formData.poster_type)
    fd.set("jurisdiction", formData.jurisdiction)
    fd.set("next_update_due", formData.next_update_due)
    await addPosterLocation(fd)
    const updated = await getPosterLocations()
    setLocations(updated as PosterLocation[])
    setFormData({
      location_name: "",
      poster_type: "",
      jurisdiction: "",
      next_update_due: "",
    })
    setShowForm(false)
  }

  const handleVerify = async (id: string) => {
    await verifyPoster(id)
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === id
          ? { ...loc, last_verified_at: new Date().toISOString(), status: "current" as const }
          : loc
      )
    )
  }

  const stats = {
    total: locations.length,
    current: locations.filter((l) => l.status === "current").length,
    dueForUpdate: locations.filter((l) => l.status === "due-for-update").length,
    overdue: locations.filter((l) => l.status === "overdue").length,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-[28px] text-midnight">Poster Compliance</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            {locations.length} location{locations.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
        >
          <Plus size={16} weight="bold" />
          Add Location
        </button>
      </div>

      {/* Stats Mini Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-midnight" },
          { label: "Current", value: stats.current, color: "text-[#2A7D4F]" },
          { label: "Due for Update", value: stats.dueForUpdate, color: "text-gold" },
          { label: "Overdue", value: stats.overdue, color: "text-crimson" },
        ].map((stat) => (
          <div key={stat.label} className="bg-brand-white border border-midnight/[0.08] p-4">
            <span className={`font-mono font-bold text-[22px] ${stat.color}`}>
              {stat.value}
            </span>
            <p className="font-display font-medium text-[9px] tracking-[2px] uppercase text-steel mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <motion.div
          className="bg-brand-white border border-midnight/[0.08] p-6 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-display font-bold text-[10px] tracking-[2px] uppercase text-steel mb-4">
            New Poster Location
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Location Name
              </label>
              <input
                type="text"
                value={formData.location_name}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Poster Type
              </label>
              <input
                type="text"
                value={formData.poster_type}
                onChange={(e) => setFormData({ ...formData, poster_type: e.target.value })}
                placeholder="Federal, State, OSHA"
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Jurisdiction
              </label>
              <input
                type="text"
                value={formData.jurisdiction}
                onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Next Update Due
              </label>
              <input
                type="date"
                value={formData.next_update_due}
                onChange={(e) => setFormData({ ...formData, next_update_due: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAdd}
              className="bg-midnight text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
            >
              Save Location
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="border border-midnight/[0.1] text-midnight font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:bg-midnight/[0.04] transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-midnight/20 border-t-midnight rounded-full animate-spin mx-auto mb-4" />
          <p className="font-sans text-[14px] text-steel">Loading poster locations...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <motion.div
          className="bg-brand-white border border-midnight/[0.08] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {locations.length === 0 ? (
            <div className="text-center py-12">
              <Clipboard size={48} className="text-steel/30 mx-auto mb-4" />
              <p className="font-sans text-[14px] text-steel mb-3">No poster locations tracked yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-crimson font-display font-semibold text-[11px] tracking-[2px] uppercase hover:underline"
              >
                Add Your First Location
              </button>
            </div>
          ) : (
            <>
            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3 p-3">
              {locations.map((loc) => (
                <div key={loc.id} className="bg-midnight/50 border border-brand-white/[0.06] p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-sans font-medium text-[14px] text-midnight">{loc.location_name}</span>
                    <span className={`px-2 py-0.5 font-display font-medium text-[8px] tracking-[1px] uppercase shrink-0 ml-2 ${statusStyles[loc.status] || "bg-steel/10 text-steel"}`}>
                      {statusLabels[loc.status] || loc.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[9px] tracking-[2px] uppercase text-steel">Poster Type</span>
                      <span className="font-sans text-[12px] text-midnight">{loc.poster_type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[9px] tracking-[2px] uppercase text-steel">Jurisdiction</span>
                      <span className="font-sans text-[12px] text-midnight">{loc.jurisdiction}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[9px] tracking-[2px] uppercase text-steel">Next Update</span>
                      <span className="font-sans text-[12px] text-midnight">
                        {loc.next_update_due ? new Date(loc.next_update_due).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-midnight/[0.06]">
                    <button
                      onClick={() => handleVerify(loc.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2A7D4F]/10 text-[#2A7D4F] font-display font-medium text-[8px] tracking-[1px] uppercase hover:bg-[#2A7D4F]/20 transition-colors"
                    >
                      <ShieldCheck size={14} />
                      Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-midnight/[0.06] bg-parchment/50">
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Location</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Poster Type</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Jurisdiction</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Status</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Last Verified</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Next Update Due</th>
                    <th className="text-right px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc) => (
                    <tr
                      key={loc.id}
                      className="border-b border-midnight/[0.06] last:border-0 hover:bg-parchment/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-sans font-medium text-[13px] text-midnight">{loc.location_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-sans text-[13px] text-midnight">{loc.poster_type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-sans text-[13px] text-midnight">{loc.jurisdiction}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 font-display font-medium text-[8px] tracking-[1px] uppercase ${statusStyles[loc.status] || "bg-steel/10 text-steel"}`}>
                          {statusLabels[loc.status] || loc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-sans text-[13px] text-midnight">
                          {loc.last_verified_at
                            ? new Date(loc.last_verified_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "--"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-sans text-[13px] text-midnight">
                          {loc.next_update_due ? new Date(loc.next_update_due).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleVerify(loc.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2A7D4F]/10 text-[#2A7D4F] font-display font-medium text-[8px] tracking-[1px] uppercase hover:bg-[#2A7D4F]/20 transition-colors"
                          >
                            <ShieldCheck size={14} />
                            Verify
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
