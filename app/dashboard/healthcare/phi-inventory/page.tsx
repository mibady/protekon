"use client"

import { motion } from "framer-motion"
import { Database, Plus, Check, X as XIcon } from "@phosphor-icons/react"
import { useState, useEffect } from "react"
import { getPhiAssets, addPhiAsset } from "@/lib/actions/healthcare"

interface PhiAsset {
  id: string
  system_name: string
  system_type: string
  phi_content_types: string[]
  encrypted_at_rest: boolean
  encrypted_in_transit: boolean
  risk_level: string
  last_assessed_at: string | null
}

const riskStyles: Record<string, string> = {
  low: "bg-[#2A7D4F]/10 text-[#2A7D4F]",
  medium: "bg-gold/10 text-gold",
  high: "bg-[#E8712A]/10 text-[#E8712A]",
  critical: "bg-crimson/10 text-crimson",
}

export default function PhiInventoryPage() {
  const [assets, setAssets] = useState<PhiAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    system_name: "",
    system_type: "EHR" as PhiAsset["system_type"],
    phi_content_types: "",
    encrypted_at_rest: false,
    encrypted_in_transit: false,
    risk_level: "low" as PhiAsset["risk_level"],
  })

  useEffect(() => {
    getPhiAssets().then((data) => {
      setAssets(data)
      setLoading(false)
    })
  }, [])

  const handleAdd = async () => {
    const fd = new FormData()
    fd.set("system_name", formData.system_name)
    fd.set("system_type", formData.system_type)
    fd.set("phi_content_types", formData.phi_content_types)
    if (formData.encrypted_at_rest) fd.set("encrypted_at_rest", "on")
    if (formData.encrypted_in_transit) fd.set("encrypted_in_transit", "on")
    fd.set("risk_level", formData.risk_level)
    await addPhiAsset(fd)
    const updated = await getPhiAssets()
    setAssets(updated as PhiAsset[])
    setFormData({
      system_name: "",
      system_type: "EHR",
      phi_content_types: "",
      encrypted_at_rest: false,
      encrypted_in_transit: false,
      risk_level: "low",
    })
    setShowForm(false)
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-[28px] text-midnight">PHI Inventory</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            {assets.length} system{assets.length !== 1 ? "s" : ""} containing protected health information
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
        >
          <Plus size={16} weight="bold" />
          Add System
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <motion.div
          className="bg-brand-white border border-midnight/[0.08] p-6 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-display font-bold text-[10px] tracking-[2px] uppercase text-steel mb-4">
            New PHI System
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                System Name
              </label>
              <input
                type="text"
                value={formData.system_name}
                onChange={(e) => setFormData({ ...formData, system_name: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:outline-none focus:border-midnight/30"
              />
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                System Type
              </label>
              <select
                value={formData.system_type}
                onChange={(e) => setFormData({ ...formData, system_type: e.target.value as PhiAsset["system_type"] })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight bg-white focus:outline-none focus:border-midnight/30"
              >
                <option value="EHR">EHR</option>
                <option value="Lab">Lab</option>
                <option value="Imaging">Imaging</option>
                <option value="Billing">Billing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                PHI Content Types (comma-separated)
              </label>
              <input
                type="text"
                value={formData.phi_content_types}
                onChange={(e) => setFormData({ ...formData, phi_content_types: e.target.value })}
                placeholder="Names, SSN, Diagnoses"
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:outline-none focus:border-midnight/30"
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.encrypted_at_rest}
                  onChange={(e) => setFormData({ ...formData, encrypted_at_rest: e.target.checked })}
                  className="w-4 h-4 accent-midnight"
                />
                <span className="font-display text-[10px] tracking-[2px] uppercase text-steel">Encrypted at Rest</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.encrypted_in_transit}
                  onChange={(e) => setFormData({ ...formData, encrypted_in_transit: e.target.checked })}
                  className="w-4 h-4 accent-midnight"
                />
                <span className="font-display text-[10px] tracking-[2px] uppercase text-steel">Encrypted in Transit</span>
              </label>
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Risk Level
              </label>
              <select
                value={formData.risk_level}
                onChange={(e) => setFormData({ ...formData, risk_level: e.target.value as PhiAsset["risk_level"] })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight bg-white focus:outline-none focus:border-midnight/30"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAdd}
              className="bg-midnight text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
            >
              Save System
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
          <p className="font-sans text-[14px] text-steel">Loading PHI inventory...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <motion.div
          className="bg-brand-white border border-midnight/[0.08] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {assets.length === 0 ? (
            <div className="text-center py-12">
              <Database size={48} className="text-steel/30 mx-auto mb-4" />
              <p className="font-sans text-[14px] text-steel mb-3">No PHI systems inventoried yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-crimson font-display font-semibold text-[11px] tracking-[2px] uppercase hover:underline"
              >
                Add Your First System
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-midnight/[0.06] bg-parchment/50">
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">System Name</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Type</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">PHI Content Types</th>
                    <th className="text-center px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Encrypted Rest</th>
                    <th className="text-center px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Encrypted Transit</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Risk Level</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Last Assessed</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="border-b border-midnight/[0.06] last:border-0 hover:bg-parchment/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-sans font-medium text-[13px] text-midnight">{asset.system_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 font-display font-medium text-[9px] tracking-[1px] uppercase bg-steel/10 text-steel">
                          {asset.system_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {asset.phi_content_types.map((type) => (
                            <span
                              key={type}
                              className="px-2 py-0.5 bg-midnight/[0.06] font-display text-[8px] tracking-[1px] uppercase text-midnight"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {asset.encrypted_at_rest ? (
                          <Check size={16} className="text-[#2A7D4F] mx-auto" />
                        ) : (
                          <XIcon size={16} className="text-crimson mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {asset.encrypted_in_transit ? (
                          <Check size={16} className="text-[#2A7D4F] mx-auto" />
                        ) : (
                          <XIcon size={16} className="text-crimson mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 font-display font-medium text-[8px] tracking-[1px] uppercase ${riskStyles[asset.risk_level] || "bg-steel/10 text-steel"}`}>
                          {asset.risk_level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-sans text-[13px] text-midnight">
                          {asset.last_assessed_at
                            ? new Date(asset.last_assessed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "--"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
