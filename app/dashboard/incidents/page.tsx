"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Eye, PencilSimple, X, Brain, ShieldCheck, Plus, Export } from "@phosphor-icons/react"
import Link from "next/link"
import { useState } from "react"

const incidents = [
  {
    id: "INC-2026-001",
    date: "Jan 12, 2026",
    type: "Injury",
    severity: "Serious",
    location: "Warehouse B",
    status: "Open",
    aiProcessed: true,
    logEntry: "Employee sustained minor laceration to left hand while operating box cutter. First aid administered on-site. No lost time.",
    classification: { type: "Laceration", bodyPart: "Hand", cause: "Sharp Object" },
    aiAnalysis: { rootCause: "Improper tool handling technique", confidence: 87 },
    oshaRecordable: false,
    daysAway: 0,
    daysRestricted: 0,
  },
  {
    id: "INC-2026-002",
    date: "Jan 8, 2026",
    type: "Near Miss",
    severity: "Moderate",
    location: "Loading Dock",
    status: "Closed",
    aiProcessed: true,
    logEntry: "Forklift nearly struck pedestrian worker in loading area. No contact made. Area marking reviewed.",
    classification: { type: "Struck By", bodyPart: "N/A", cause: "Mobile Equipment" },
    aiAnalysis: { rootCause: "Inadequate pedestrian/vehicle separation", confidence: 92 },
    oshaRecordable: false,
    daysAway: 0,
    daysRestricted: 0,
  },
  {
    id: "INC-2025-047",
    date: "Dec 15, 2025",
    type: "Injury",
    severity: "Critical",
    location: "Production Floor",
    status: "Closed",
    aiProcessed: true,
    logEntry: "Employee experienced back strain while lifting heavy materials. Medical treatment required. Modified duty assigned.",
    classification: { type: "Strain", bodyPart: "Back", cause: "Overexertion" },
    aiAnalysis: { rootCause: "Manual lifting exceeding ergonomic limits", confidence: 94 },
    oshaRecordable: true,
    daysAway: 3,
    daysRestricted: 14,
  },
  {
    id: "INC-2025-046",
    date: "Dec 10, 2025",
    type: "Property",
    severity: "Minor",
    location: "Office Area",
    status: "Closed",
    aiProcessed: true,
    logEntry: "Water leak from ceiling damaged computer equipment. No injuries. Maintenance notified.",
    classification: { type: "Property Damage", bodyPart: "N/A", cause: "Facility Issue" },
    aiAnalysis: { rootCause: "Plumbing failure in floor above", confidence: 78 },
    oshaRecordable: false,
    daysAway: 0,
    daysRestricted: 0,
  },
  {
    id: "INC-2025-045",
    date: "Dec 5, 2025",
    type: "Near Miss",
    severity: "Minor",
    location: "Parking Lot",
    status: "Closed",
    aiProcessed: true,
    logEntry: "Employee slipped on icy surface but caught self. No fall occurred. Salt applied to area.",
    classification: { type: "Slip", bodyPart: "N/A", cause: "Walking Surface" },
    aiAnalysis: { rootCause: "Delayed winter weather treatment", confidence: 85 },
    oshaRecordable: false,
    daysAway: 0,
    daysRestricted: 0,
  },
]

export default function IncidentsPage() {
  const [selectedIncident, setSelectedIncident] = useState<typeof incidents[0] | null>(null)

  const stats = {
    open: incidents.filter(i => i.status === 'Open').length,
    closed: incidents.filter(i => i.status === 'Closed').length,
    recordable: incidents.filter(i => i.oshaRecordable).length,
    lostTime: incidents.filter(i => i.daysAway > 0).length,
  }

  return (
    <div className="p-6 lg:p-8">
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
          { label: "Open", value: stats.open, color: "text-crimson" },
          { label: "Closed", value: stats.closed, color: "text-midnight" },
          { label: "OSHA Recordable", value: stats.recordable, color: "text-gold" },
          { label: "Lost Time", value: stats.lostTime, color: "text-steel" },
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

      {/* Table */}
      <motion.div 
        className="bg-brand-white border border-midnight/[0.08] overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-midnight/[0.06] bg-parchment/50">
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">
                  Inc #
                </th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">
                  Type
                </th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">
                  Severity
                </th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">
                  Location
                </th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">
                  AI
                </th>
                <th className="text-right px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr 
                  key={incident.id}
                  className="border-b border-midnight/[0.06] last:border-0 hover:bg-parchment/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-[12px] text-midnight">{incident.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-sans text-[13px] text-midnight">{incident.date}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 font-display font-medium text-[9px] tracking-[1px] uppercase ${
                      incident.type === 'Injury' ? 'bg-crimson/10 text-crimson' :
                      incident.type === 'Near Miss' ? 'bg-gold/10 text-gold' :
                      'bg-steel/10 text-steel'
                    }`}>
                      {incident.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 font-display font-medium text-[9px] tracking-[1px] uppercase ${
                      incident.severity === 'Critical' ? 'bg-crimson text-white' :
                      incident.severity === 'Serious' ? 'bg-crimson/10 text-crimson' :
                      incident.severity === 'Moderate' ? 'bg-gold/10 text-gold' :
                      'bg-steel/10 text-steel'
                    }`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-sans text-[13px] text-midnight">{incident.location}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        incident.status === 'Open' ? 'bg-crimson' : 'bg-[#2A7D4F]'
                      }`} />
                      <span className={`font-display font-medium text-[10px] tracking-[1px] uppercase ${
                        incident.status === 'Open' ? 'text-crimson' : 'text-[#2A7D4F]'
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {incident.aiProcessed && (
                      <Brain size={18} className="text-gold" />
                    )}
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
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

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
                  <span className="font-mono text-[12px] text-steel">{selectedIncident.id}</span>
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
                {/* Classified Log Entry */}
                <div className="bg-midnight p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck size={18} className="text-gold" />
                    <span className="font-display font-bold text-[10px] tracking-[2px] uppercase text-gold">
                      Classified Log Entry
                    </span>
                  </div>
                  <p className="font-sans text-[14px] text-brand-white leading-relaxed">
                    {selectedIncident.logEntry}
                  </p>
                  <p className="font-sans text-[11px] text-steel mt-3 italic">
                    All personal identifiers have been automatically removed.
                  </p>
                </div>

                {/* Classification Grid */}
                <div>
                  <h3 className="font-display font-bold text-[10px] tracking-[2px] uppercase text-steel mb-3">
                    Classification
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-parchment p-3">
                      <span className="font-display text-[8px] tracking-[2px] uppercase text-steel block mb-1">Type</span>
                      <span className="font-sans font-medium text-[13px] text-midnight">{selectedIncident.classification.type}</span>
                    </div>
                    <div className="bg-parchment p-3">
                      <span className="font-display text-[8px] tracking-[2px] uppercase text-steel block mb-1">Body Part</span>
                      <span className="font-sans font-medium text-[13px] text-midnight">{selectedIncident.classification.bodyPart}</span>
                    </div>
                    <div className="bg-parchment p-3">
                      <span className="font-display text-[8px] tracking-[2px] uppercase text-steel block mb-1">Cause</span>
                      <span className="font-sans font-medium text-[13px] text-midnight">{selectedIncident.classification.cause}</span>
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Brain size={16} className="text-gold" />
                    <h3 className="font-display font-bold text-[10px] tracking-[2px] uppercase text-steel">
                      AI Analysis
                    </h3>
                  </div>
                  <div className="bg-gold/[0.05] border border-gold/20 p-4">
                    <span className="font-display text-[9px] tracking-[2px] uppercase text-steel block mb-1">Root Cause</span>
                    <p className="font-sans font-medium text-[14px] text-midnight mb-3">
                      {selectedIncident.aiAnalysis.rootCause}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-[9px] tracking-[2px] uppercase text-steel">Confidence</span>
                      <div className="flex-1 h-2 bg-midnight/10">
                        <div 
                          className="h-full bg-gold" 
                          style={{ width: `${selectedIncident.aiAnalysis.confidence}%` }}
                        />
                      </div>
                      <span className="font-mono text-[12px] text-gold">{selectedIncident.aiAnalysis.confidence}%</span>
                    </div>
                  </div>
                </div>

                {/* OSHA Metrics */}
                <div>
                  <h3 className="font-display font-bold text-[10px] tracking-[2px] uppercase text-steel mb-3">
                    OSHA Metrics
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className={`p-3 ${selectedIncident.oshaRecordable ? 'bg-crimson/10' : 'bg-parchment'}`}>
                      <span className="font-display text-[8px] tracking-[2px] uppercase text-steel block mb-1">Recordable</span>
                      <span className={`font-sans font-bold text-[14px] ${selectedIncident.oshaRecordable ? 'text-crimson' : 'text-midnight'}`}>
                        {selectedIncident.oshaRecordable ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="bg-parchment p-3">
                      <span className="font-display text-[8px] tracking-[2px] uppercase text-steel block mb-1">Days Away</span>
                      <span className="font-sans font-bold text-[14px] text-midnight">{selectedIncident.daysAway}</span>
                    </div>
                    <div className="bg-parchment p-3">
                      <span className="font-display text-[8px] tracking-[2px] uppercase text-steel block mb-1">Days Restricted</span>
                      <span className="font-sans font-bold text-[14px] text-midnight">{selectedIncident.daysRestricted}</span>
                    </div>
                  </div>
                </div>
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
