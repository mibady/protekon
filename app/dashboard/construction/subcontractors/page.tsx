"use client"

import { motion } from "framer-motion"
import { HardHat, Plus, Trash, ShieldCheck } from "@phosphor-icons/react"
import { useState, useEffect } from "react"
import { getSubcontractors, addSubcontractor, verifySubcontractor, deleteSubcontractor } from "@/lib/actions/construction"

interface Subcontractor {
  id: string
  company_name: string
  license_number: string
  license_status: string
  license_expiry: string
  insurance_status: string
  insurance_expiry: string
  verified_at: string | null
}

const statusStyles: Record<string, string> = {
  valid: "bg-[#2A7D4F]/10 text-[#2A7D4F]",
  expiring: "bg-gold/10 text-gold",
  expired: "bg-crimson/10 text-crimson",
  invalid: "bg-crimson/10 text-crimson",
}

function getEffectiveStatus(status: string, expiry: string): string {
  if (status === "expired" || status === "invalid") return status
  const daysUntil = (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  if (daysUntil < 0) return "expired"
  if (daysUntil < 30) return "expiring"
  return status
}

export default function SubcontractorsPage() {
  const [subs, setSubs] = useState<Subcontractor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    company_name: "",
    license_number: "",
    license_status: "valid",
    license_expiry: "",
    insurance_status: "valid",
    insurance_expiry: "",
  })

  useEffect(() => {
    getSubcontractors().then((data) => {
      setSubs(data)
      setLoading(false)
    })
  }, [])

  const handleAdd = async () => {
    const fd = new FormData()
    fd.set("company_name", formData.company_name)
    fd.set("license_number", formData.license_number)
    fd.set("license_status", formData.license_status)
    fd.set("license_expiry", formData.license_expiry)
    fd.set("insurance_status", formData.insurance_status)
    fd.set("insurance_expiry", formData.insurance_expiry)
    await addSubcontractor(fd)
    const updated = await getSubcontractors()
    setSubs(updated as Subcontractor[])
    setFormData({ company_name: "", license_number: "", license_status: "valid", license_expiry: "", insurance_status: "valid", insurance_expiry: "" })
    setShowForm(false)
  }

  const handleVerify = async (id: string) => {
    await verifySubcontractor(id)
    setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, verified: true } : s)))
  }

  const handleDelete = async (id: string) => {
    await deleteSubcontractor(id)
    setSubs((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-[28px] text-midnight">Subcontractors</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            {subs.length} subcontractor{subs.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
        >
          <Plus size={16} weight="bold" />
          Add Subcontractor
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
            New Subcontractor
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:outline-none focus:border-midnight/30"
              />
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                License Number
              </label>
              <input
                type="text"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:outline-none focus:border-midnight/30"
              />
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                License Status
              </label>
              <select
                value={formData.license_status}
                onChange={(e) => setFormData({ ...formData, license_status: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight bg-white focus:outline-none focus:border-midnight/30"
              >
                <option value="valid">Valid</option>
                <option value="expiring">Expiring</option>
                <option value="expired">Expired</option>
                <option value="invalid">Invalid</option>
              </select>
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                License Expiry
              </label>
              <input
                type="date"
                value={formData.license_expiry}
                onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:outline-none focus:border-midnight/30"
              />
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Insurance Status
              </label>
              <select
                value={formData.insurance_status}
                onChange={(e) => setFormData({ ...formData, insurance_status: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight bg-white focus:outline-none focus:border-midnight/30"
              >
                <option value="valid">Valid</option>
                <option value="expiring">Expiring</option>
                <option value="expired">Expired</option>
                <option value="invalid">Invalid</option>
              </select>
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Insurance Expiry
              </label>
              <input
                type="date"
                value={formData.insurance_expiry}
                onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:outline-none focus:border-midnight/30"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAdd}
              className="bg-midnight text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
            >
              Save Subcontractor
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
          <p className="font-sans text-[14px] text-steel">Loading subcontractors...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <motion.div
          className="bg-brand-white border border-midnight/[0.08] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {subs.length === 0 ? (
            <div className="text-center py-12">
              <HardHat size={48} className="text-steel/30 mx-auto mb-4" />
              <p className="font-sans text-[14px] text-steel mb-3">No subcontractors tracked yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-crimson font-display font-semibold text-[11px] tracking-[2px] uppercase hover:underline"
              >
                Add Your First Subcontractor
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-midnight/[0.06] bg-parchment/50">
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Company</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">License #</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">License Status</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">License Expiry</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Insurance Status</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Insurance Expiry</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Verified</th>
                    <th className="text-right px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((sub) => {
                    const effLicense = getEffectiveStatus(sub.license_status, sub.license_expiry)
                    const effInsurance = getEffectiveStatus(sub.insurance_status, sub.insurance_expiry)

                    return (
                      <tr
                        key={sub.id}
                        className="border-b border-midnight/[0.06] last:border-0 hover:bg-parchment/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-sans font-medium text-[13px] text-midnight">{sub.company_name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[12px] text-midnight">{sub.license_number}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 font-display font-medium text-[8px] tracking-[1px] uppercase ${statusStyles[effLicense] || "bg-steel/10 text-steel"}`}>
                            {effLicense}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-sans text-[13px] text-midnight">
                            {new Date(sub.license_expiry).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 font-display font-medium text-[8px] tracking-[1px] uppercase ${statusStyles[effInsurance] || "bg-steel/10 text-steel"}`}>
                            {effInsurance}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-sans text-[13px] text-midnight">
                            {new Date(sub.insurance_expiry).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {sub.verified_at ? (
                            <ShieldCheck size={18} className="text-[#2A7D4F]" />
                          ) : (
                            <span className="font-sans text-[12px] text-steel">--</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {!sub.verified_at && (
                              <button
                                onClick={() => handleVerify(sub.id)}
                                className="px-3 py-1.5 bg-[#2A7D4F]/10 text-[#2A7D4F] font-display font-medium text-[8px] tracking-[1px] uppercase hover:bg-[#2A7D4F]/20 transition-colors"
                              >
                                Verify
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="p-2 hover:bg-crimson/[0.04] transition-colors"
                            >
                              <Trash size={16} className="text-steel hover:text-crimson" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
