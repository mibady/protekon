"use client"

import { motion } from "framer-motion"
import { FileText, Download, Eye, Calendar, MagnifyingGlass } from "@phosphor-icons/react"
import { useState } from "react"

const documents = [
  {
    id: 1,
    name: "Injury and Illness Prevention Program (IIPP)",
    type: "IIPP",
    status: "Current",
    lastUpdated: "Jan 15, 2025",
    size: "2.4 MB",
  },
  {
    id: 2,
    name: "Workplace Violence Prevention Plan (SB 553)",
    type: "SB 553",
    status: "Current",
    lastUpdated: "Jan 10, 2025",
    size: "1.8 MB",
  },
  {
    id: 3,
    name: "Q4 2024 Compliance Summary Report",
    type: "Report",
    status: "Final",
    lastUpdated: "Dec 31, 2024",
    size: "856 KB",
  },
  {
    id: 4,
    name: "Annual Safety Training Documentation",
    type: "Training",
    status: "Current",
    lastUpdated: "Dec 15, 2024",
    size: "3.2 MB",
  },
  {
    id: 5,
    name: "Hazard Assessment Report",
    type: "Assessment",
    status: "Current",
    lastUpdated: "Nov 28, 2024",
    size: "1.1 MB",
  },
  {
    id: 6,
    name: "Emergency Action Plan",
    type: "EAP",
    status: "Current",
    lastUpdated: "Nov 15, 2024",
    size: "945 KB",
  },
]

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === "all" || doc.type === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-[28px] text-midnight">Documents</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            All your compliance documents in one place
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all">
          <FileText size={16} weight="bold" />
          Request New Document
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-ash pl-11 pr-4 py-3 font-sans text-[14px] text-midnight placeholder:text-steel focus:border-midnight focus:outline-none transition-colors"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
        >
          <option value="all">All Types</option>
          <option value="IIPP">IIPP</option>
          <option value="SB 553">SB 553</option>
          <option value="Report">Reports</option>
          <option value="Training">Training</option>
          <option value="Assessment">Assessments</option>
          <option value="EAP">EAP</option>
        </select>
      </div>

      {/* Documents Table */}
      <motion.div 
        className="bg-white border border-ash overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ash bg-fog/30">
                <th className="text-left px-6 py-4 font-display text-[10px] tracking-[2px] uppercase text-steel">
                  Document
                </th>
                <th className="text-left px-6 py-4 font-display text-[10px] tracking-[2px] uppercase text-steel">
                  Type
                </th>
                <th className="text-left px-6 py-4 font-display text-[10px] tracking-[2px] uppercase text-steel">
                  Status
                </th>
                <th className="text-left px-6 py-4 font-display text-[10px] tracking-[2px] uppercase text-steel">
                  Last Updated
                </th>
                <th className="text-left px-6 py-4 font-display text-[10px] tracking-[2px] uppercase text-steel">
                  Size
                </th>
                <th className="text-right px-6 py-4 font-display text-[10px] tracking-[2px] uppercase text-steel">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc, i) => (
                <motion.tr 
                  key={doc.id}
                  className="border-b border-ash last:border-b-0 hover:bg-fog/20 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-midnight/5">
                        <FileText size={20} className="text-midnight" />
                      </div>
                      <span className="font-sans text-[14px] font-medium text-midnight">
                        {doc.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-display text-[10px] tracking-[2px] uppercase text-steel px-2 py-1 bg-fog/50">
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-display text-[10px] tracking-[2px] uppercase px-2 py-1 ${
                      doc.status === "Current" ? "text-green-700 bg-green-50" : "text-midnight bg-fog/50"
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-steel">
                      <Calendar size={14} />
                      <span className="font-sans text-[13px]">{doc.lastUpdated}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-sans text-[13px] text-steel">{doc.size}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-fog transition-colors" title="Preview">
                        <Eye size={18} className="text-steel hover:text-midnight" />
                      </button>
                      <button className="p-2 hover:bg-fog transition-colors" title="Download">
                        <Download size={18} className="text-steel hover:text-midnight" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="text-steel/30 mx-auto mb-4" />
          <p className="font-sans text-[14px] text-steel">No documents found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
