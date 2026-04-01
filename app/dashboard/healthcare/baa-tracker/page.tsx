"use client"

import { motion } from "framer-motion"
import { FileText, Plus, Warning } from "@phosphor-icons/react"
import { useState, useEffect } from "react"
import { getBaaAgreements, addBaaAgreement } from "@/lib/actions/healthcare"

interface BaaAgreement {
  id: string
  vendor_name: string
  service_type: string
  phi_types: string[]
  baa_status: string
  signed_date: string
  expiration_date: string
}

const statusStyles: Record<string, string> = {
  active: "bg-[#2A7D4F]/10 text-[#2A7D4F]",
  pending: "bg-gold/10 text-gold",
  expired: "bg-crimson/10 text-crimson",
}

export default function BaaTrackerPage() {
  const [agreements, setAgreements] = useState<BaaAgreement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    vendor_name: "",
    service_type: "",
    phi_types: "",
    baa_status: "active" as BaaAgreement["baa_status"],
    signed_date: "",
    expiration_date: "",
  })

  useEffect(() => {
    getBaaAgreements().then((data) => {
      setAgreements(data)
      setLoading(false)
    })
  }, [])

  const expiringBaas = agreements.filter((baa) => {
    if (baa.baa_status === "expired") return false
    const daysUntil = (new Date(baa.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return daysUntil >= 0 && daysUntil < 30
  })

  const handleAdd = async () => {
    const fd = new FormData()
    fd.set("vendor_name", formData.vendor_name)
    fd.set("service_type", formData.service_type)
    fd.set("phi_types", formData.phi_types)
    fd.set("baa_status", formData.baa_status)
    fd.set("signed_date", formData.signed_date)
    fd.set("expiration_date", formData.expiration_date)
    await addBaaAgreement(fd)
    const updated = await getBaaAgreements()
    setAgreements(updated as BaaAgreement[])
    setFormData({
      vendor_name: "",
      service_type: "",
      phi_types: "",
      baa_status: "active",
      signed_date: "",
      expiration_date: "",
    })
    setShowForm(false)
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-[28px] text-midnight">BAA Tracker</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            {agreements.length} Business Associate Agreement{agreements.length !== 1 ? "s" : ""} on file
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
        >
          <Plus size={16} weight="bold" />
          Add BAA
        </button>
      </div>

      {/* Expiring Alert Banner */}
      {expiringBaas.length > 0 && (
        <motion.div
          className="bg-gold/10 border border-gold/30 p-4 mb-6 flex items-start gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Warning size={20} className="text-gold flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-display font-bold text-[10px] tracking-[2px] uppercase text-gold block mb-1">
              Expiring Soon
            </span>
            <p className="font-sans text-[13px] text-midnight">
              {expiringBaas.length} BAA{expiringBaas.length !== 1 ? "s" : ""} expiring within 30 days:{" "}
              {expiringBaas.map((b) => b.vendor_name).join(", ")}
            </p>
          </div>
        </motion.div>
      )}

      {/* Add Form */}
      {showForm && (
        <motion.div
          className="bg-brand-white border border-midnight/[0.08] p-6 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-display font-bold text-[10px] tracking-[2px] uppercase text-steel mb-4">
            New BAA
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Vendor Name
              </label>
              <input
                type="text"
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:outline-none focus:border-midnight/30"
              />
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Service Type
              </label>
              <input
                type="text"
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:outline-none focus:border-midnight/30"
              />
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                PHI Types (comma-separated)
              </label>
              <input
                type="text"
                value={formData.phi_types}
                onChange={(e) => setFormData({ ...formData, phi_types: e.target.value })}
                placeholder="Names, Addresses, Medical Records"
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:outline-none focus:border-midnight/30"
              />
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Status
              </label>
              <select
                value={formData.baa_status}
                onChange={(e) => setFormData({ ...formData, baa_status: e.target.value as BaaAgreement["baa_status"] })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight bg-white focus:outline-none focus:border-midnight/30"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Signed Date
              </label>
              <input
                type="date"
                value={formData.signed_date}
                onChange={(e) => setFormData({ ...formData, signed_date: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:outline-none focus:border-midnight/30"
              />
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:outline-none focus:border-midnight/30"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAdd}
              className="bg-midnight text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
            >
              Save BAA
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
          <p className="font-sans text-[14px] text-steel">Loading agreements...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <motion.div
          className="bg-brand-white border border-midnight/[0.08] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {agreements.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="text-steel/30 mx-auto mb-4" />
              <p className="font-sans text-[14px] text-steel mb-3">No BAAs on file yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-crimson font-display font-semibold text-[11px] tracking-[2px] uppercase hover:underline"
              >
                Add Your First BAA
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-midnight/[0.06] bg-parchment/50">
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Vendor</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Service Type</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">PHI Types</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Status</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Signed</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Expiration</th>
                  </tr>
                </thead>
                <tbody>
                  {agreements.map((baa) => {
                    const daysUntil = (new Date(baa.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    const isExpiringSoon = daysUntil >= 0 && daysUntil < 30 && baa.baa_status !== "expired"

                    return (
                      <tr
                        key={baa.id}
                        className={`border-b border-midnight/[0.06] last:border-0 hover:bg-parchment/30 transition-colors ${isExpiringSoon ? "bg-gold/[0.03]" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-sans font-medium text-[13px] text-midnight">{baa.vendor_name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-sans text-[13px] text-midnight">{baa.service_type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {baa.phi_types.map((type) => (
                              <span
                                key={type}
                                className="px-2 py-0.5 bg-midnight/[0.06] font-display text-[8px] tracking-[1px] uppercase text-midnight"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 font-display font-medium text-[8px] tracking-[1px] uppercase ${statusStyles[baa.baa_status] || "bg-steel/10 text-steel"}`}>
                            {baa.baa_status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-sans text-[13px] text-midnight">
                            {new Date(baa.signed_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-sans text-[13px] ${isExpiringSoon ? "text-gold font-medium" : "text-midnight"}`}>
                            {new Date(baa.expiration_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
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
