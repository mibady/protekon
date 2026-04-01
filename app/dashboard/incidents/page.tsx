"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Eye, PencilSimple, X, ShieldCheck, Plus, Export } from "@phosphor-icons/react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getIncidents } from "@/lib/actions/incidents"
import type { Incident } from "@/lib/types"

const severityStyles: Record<string, string> = {
  "severe": "bg-crimson text-white",
  "serious": "bg-crimson/10 text-crimson",
  "moderate": "bg-gold/10 text-gold",
  "minor": "bg-steel/10 text-steel",
  "near-miss": "bg-steel/10 text-steel",
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  useEffect(() => {
    getIncidents().then((data) => {
      setIncidents(data)
      setLoading(false)
    })
  }, [])

  const stats = {
    total: incidents.length,
    open: incidents.filter(i => !i.follow_up_id).length,
    closed: incidents.filter(i => !!i.follow_up_id).length,
    severe: incidents.filter(i => i.severity === "severe" || i.severity === "serious").length,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-[28px] text-midnight">Incident Log</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            Track and manage workplace incidents with AI-powered classification
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 border border-midnight/[0.1] text-midnight font-display font-semibold text-[11px] tracking-[2px] uppercase px-4 py-3 hover:bg-midnight/[0.04] transition-colors">
            <Export size={16} />
            Export
          </button>
          <Link 
            href="/dashboard/incidents/new"
            className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
          >
            <Plus size={16} weight="bold" />
            Log Incident
          </Link>
        </div>
      </div>

      {/* Stats Mini Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-midnight" },
          { label: "Open", value: stats.open, color: "text-crimson" },
          { label: "Closed", value: stats.closed, color: "text-[#2A7D4F]" },
          { label: "Severe/Serious", value: stats.severe, color: "text-gold" },
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

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-midnight/20 border-t-midnight rounded-full animate-spin mx-auto mb-4" />
          <p className="font-sans text-[14px] text-steel">Loading incidents...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <motion.div
          className="bg-brand-white border border-midnight/[0.08] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {incidents.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck size={48} className="text-steel/30 mx-auto mb-4" />
              <p className="font-sans text-[14px] text-steel">No incidents logged yet.</p>
            </div>
          ) : (
            <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-midnight/[0.06] bg-parchment/50">
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Inc #</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Date</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Type</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Severity</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Location</th>
                    <th className="text-right px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => {
                    const incType = incident.metadata?.type || "other"
                    const displayDate = incident.incident_date
                      ? new Date(incident.incident_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"

                    return (
                      <tr
                        key={incident.id}
                        className="border-b border-midnight/[0.06] last:border-0 hover:bg-parchment/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-[12px] text-midnight">{incident.incident_id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-sans text-[13px] text-midnight">{displayDate}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 font-display font-medium text-[9px] tracking-[1px] uppercase bg-steel/10 text-steel">
                            {incType.replace("-", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 font-display font-medium text-[9px] tracking-[1px] uppercase ${severityStyles[incident.severity] || "bg-steel/10 text-steel"}`}>
                            {incident.severity.replace("-", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-sans text-[13px] text-midnight">{incident.location || "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedIncident(incident)}
                              className="p-2 hover:bg-midnight/[0.04] transition-colors"
                            >
                              <Eye size={16} className="text-steel" />
                            </button>
                            <button className="p-2 hover:bg-midnight/[0.04] transition-colors">
                              <PencilSimple size={16} className="text-steel" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3 p-4">
              {incidents.map((incident) => {
                const displayDate = incident.incident_date
                  ? new Date(incident.incident_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "—"

                return (
                  <div
                    key={incident.id}
                    className="bg-midnight/50 border border-brand-white/[0.06] p-4 rounded-lg cursor-pointer"
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="font-mono text-[12px] text-midnight font-semibold">{incident.incident_id}</span>
                        <span className="font-sans text-[12px] text-steel ml-2">{displayDate}</span>
                      </div>
                      <span className={`px-2 py-0.5 font-display font-medium text-[9px] tracking-[1px] uppercase shrink-0 ${severityStyles[incident.severity] || "bg-steel/10 text-steel"}`}>
                        {incident.severity.replace("-", " ")}
                      </span>
                    </div>
                    {incident.description && (
                      <p className="font-sans text-[13px] text-midnight/80 leading-relaxed">
                        {incident.description.length > 80
                          ? `${incident.description.slice(0, 80)}...`
                          : incident.description}
                      </p>
                    )}
                    {incident.location && (
                      <p className="font-sans text-[11px] text-steel mt-2">{incident.location}</p>
                    )}
                  </div>
                )
              })}
            </div>
            </>
          )}
        </motion.div>
      )}

      {/* Slide-over Panel */}
      <AnimatePresence>
        {selectedIncident && (
          <>
            <motion.div
              className="fixed inset-0 bg-void/60 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIncident(null)}
            />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-brand-white z-50 overflow-y-auto shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-brand-white border-b border-midnight/[0.06] px-6 py-4 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[12px] text-steel">{selectedIncident.incident_id}</span>
                  <h2 className="font-display font-bold text-[18px] text-midnight">Incident Detail</h2>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="p-2 hover:bg-midnight/[0.04] transition-colors"
                >
                  <X size={20} className="text-steel" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Log Entry */}
                <div className="bg-midnight p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck size={18} className="text-gold" />
                    <span className="font-display font-bold text-[10px] tracking-[2px] uppercase text-gold">
                      Incident Description
                    </span>
                  </div>
                  <p className="font-sans text-[14px] text-brand-white leading-relaxed">
                    {selectedIncident.description}
                  </p>
                </div>

                {/* Details Grid */}
                <div>
                  <h3 className="font-display font-bold text-[10px] tracking-[2px] uppercase text-steel mb-3">
                    Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-parchment p-3">
                      <span className="font-display text-[8px] tracking-[2px] uppercase text-steel block mb-1">Severity</span>
                      <span className="font-sans font-medium text-[13px] text-midnight capitalize">{selectedIncident.severity.replace("-", " ")}</span>
                    </div>
                    <div className="bg-parchment p-3">
                      <span className="font-display text-[8px] tracking-[2px] uppercase text-steel block mb-1">Location</span>
                      <span className="font-sans font-medium text-[13px] text-midnight">{selectedIncident.location || "—"}</span>
                    </div>
                    {selectedIncident.metadata?.type && (
                      <div className="bg-parchment p-3">
                        <span className="font-display text-[8px] tracking-[2px] uppercase text-steel block mb-1">Type</span>
                        <span className="font-sans font-medium text-[13px] text-midnight capitalize">{selectedIncident.metadata.type.replace("-", " ")}</span>
                      </div>
                    )}
                    {selectedIncident.incident_date && (
                      <div className="bg-parchment p-3">
                        <span className="font-display text-[8px] tracking-[2px] uppercase text-steel block mb-1">Date</span>
                        <span className="font-sans font-medium text-[13px] text-midnight">
                          {new Date(selectedIncident.incident_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {selectedIncident.metadata?.time && ` at ${selectedIncident.metadata.time}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Injury Info */}
                {(selectedIncident.metadata?.injuryOccurred || selectedIncident.metadata?.medicalTreatment) && (
                  <div>
                    <h3 className="font-display font-bold text-[10px] tracking-[2px] uppercase text-steel mb-3">
                      Injury Information
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-3 ${selectedIncident.metadata.injuryOccurred ? "bg-crimson/10" : "bg-parchment"}`}>
                        <span className="font-display text-[8px] tracking-[2px] uppercase text-steel block mb-1">Injury Occurred</span>
                        <span className={`font-sans font-bold text-[14px] ${selectedIncident.metadata.injuryOccurred ? "text-crimson" : "text-midnight"}`}>
                          {selectedIncident.metadata.injuryOccurred ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className={`p-3 ${selectedIncident.metadata.medicalTreatment ? "bg-crimson/10" : "bg-parchment"}`}>
                        <span className="font-display text-[8px] tracking-[2px] uppercase text-steel block mb-1">Medical Treatment</span>
                        <span className={`font-sans font-bold text-[14px] ${selectedIncident.metadata.medicalTreatment ? "text-crimson" : "text-midnight"}`}>
                          {selectedIncident.metadata.medicalTreatment ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions Taken */}
                {selectedIncident.metadata?.actionsTaken && (
                  <div>
                    <h3 className="font-display font-bold text-[10px] tracking-[2px] uppercase text-steel mb-3">
                      Actions Taken
                    </h3>
                    <p className="font-sans text-[14px] text-midnight leading-relaxed bg-parchment p-4">
                      {selectedIncident.metadata.actionsTaken}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-brand-white border-t border-midnight/[0.06] px-6 py-4 flex gap-3">
                <button className="flex-1 border border-midnight/[0.1] text-midnight font-display font-semibold text-[10px] tracking-[2px] uppercase py-3 hover:bg-midnight/[0.04] transition-colors">
                  Export PDF
                </button>
                <button className="flex-1 border border-midnight/[0.1] text-midnight font-display font-semibold text-[10px] tracking-[2px] uppercase py-3 hover:bg-midnight/[0.04] transition-colors">
                  Edit
                </button>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="flex-1 bg-midnight text-parchment font-display font-semibold text-[10px] tracking-[2px] uppercase py-3 hover:brightness-110 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
