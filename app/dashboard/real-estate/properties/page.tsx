"use client"

import { motion } from "framer-motion"
import { Buildings, Plus } from "@phosphor-icons/react"
import { useState, useEffect } from "react"
import { getProperties, addProperty } from "@/lib/actions/real-estate"

interface Property {
  id: string
  property_name: string
  address: string
  city: string
  state: string
  units: number
  property_type: string
  compliance_status: string
}

const statusStyles: Record<string, string> = {
  compliant: "bg-[#2A7D4F]/10 text-[#2A7D4F]",
  "at-risk": "bg-gold/10 text-gold",
  "non-compliant": "bg-crimson/10 text-crimson",
}

const statusLabels: Record<string, string> = {
  compliant: "Compliant",
  "at-risk": "At Risk",
  "non-compliant": "Non-Compliant",
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    property_name: "",
    address: "",
    city: "",
    state: "",
    units: 1,
    property_type: "residential" as Property["property_type"],
    compliance_status: "compliant" as Property["compliance_status"],
  })

  useEffect(() => {
    getProperties().then((data) => {
      setProperties(data)
      setLoading(false)
    })
  }, [])

  const handleAdd = async () => {
    const fd = new FormData()
    fd.set("property_name", formData.property_name)
    fd.set("address", formData.address)
    fd.set("city", formData.city)
    fd.set("state", formData.state)
    fd.set("units", String(formData.units))
    fd.set("property_type", formData.property_type)
    fd.set("compliance_status", formData.compliance_status)
    await addProperty(fd)
    const updated = await getProperties()
    setProperties(updated as Property[])
    setFormData({
      property_name: "",
      address: "",
      city: "",
      state: "",
      units: 1,
      property_type: "residential",
      compliance_status: "compliant",
    })
    setShowForm(false)
  }

  const stats = {
    total: properties.length,
    compliant: properties.filter((p) => p.compliance_status === "compliant").length,
    atRisk: properties.filter((p) => p.compliance_status === "at-risk").length,
    nonCompliant: properties.filter((p) => p.compliance_status === "non-compliant").length,
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-[28px] text-midnight">Properties</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            {properties.length} propert{properties.length !== 1 ? "ies" : "y"} in portfolio
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
        >
          <Plus size={16} weight="bold" />
          Add Property
        </button>
      </div>

      {/* Stats Mini Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-midnight" },
          { label: "Compliant", value: stats.compliant, color: "text-[#2A7D4F]" },
          { label: "At Risk", value: stats.atRisk, color: "text-gold" },
          { label: "Non-Compliant", value: stats.nonCompliant, color: "text-crimson" },
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
            New Property
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Property Name
              </label>
              <input
                type="text"
                value={formData.property_name}
                onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Units
              </label>
              <input
                type="number"
                min={1}
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 1 })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Property Type
              </label>
              <select
                value={formData.property_type}
                onChange={(e) => setFormData({ ...formData, property_type: e.target.value as Property["property_type"] })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight bg-white focus:border-midnight focus:outline-none transition-colors"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="mixed">Mixed</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>
            <div>
              <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                Compliance Status
              </label>
              <select
                value={formData.compliance_status}
                onChange={(e) => setFormData({ ...formData, compliance_status: e.target.value as Property["compliance_status"] })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight bg-white focus:border-midnight focus:outline-none transition-colors"
              >
                <option value="compliant">Compliant</option>
                <option value="at-risk">At Risk</option>
                <option value="non-compliant">Non-Compliant</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAdd}
              className="bg-midnight text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
            >
              Save Property
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
          <p className="font-sans text-[14px] text-steel">Loading properties...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <motion.div
          className="bg-brand-white border border-midnight/[0.08] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <Buildings size={48} className="text-steel/30 mx-auto mb-4" />
              <p className="font-sans text-[14px] text-steel mb-3">No properties in your portfolio yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-crimson font-display font-semibold text-[11px] tracking-[2px] uppercase hover:underline"
              >
                Add Your First Property
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-midnight/[0.06] bg-parchment/50">
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Property Name</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Address</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">City</th>
                    <th className="text-right px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Units</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Type</th>
                    <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Compliance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((prop) => (
                    <tr
                      key={prop.id}
                      className="border-b border-midnight/[0.06] last:border-0 hover:bg-parchment/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-sans font-medium text-[13px] text-midnight">{prop.property_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-sans text-[13px] text-midnight">{prop.address}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-sans text-[13px] text-midnight">{prop.city}, {prop.state}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-[13px] text-midnight">{prop.units}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 font-display font-medium text-[9px] tracking-[1px] uppercase bg-steel/10 text-steel capitalize">
                          {prop.property_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 font-display font-medium text-[8px] tracking-[1px] uppercase ${statusStyles[prop.compliance_status] || "bg-steel/10 text-steel"}`}>
                          {statusLabels[prop.compliance_status] || prop.compliance_status}
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
