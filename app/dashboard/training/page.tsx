"use client"

import { motion } from "framer-motion"
import { GraduationCap, Plus, Check, Trash } from "@phosphor-icons/react"
import { useState, useEffect } from "react"
import { getTrainingRecords, addTrainingRecord, completeTraining, deleteTrainingRecord } from "@/lib/actions/training"

interface TrainingRecord {
  id: string
  employee_name: string
  training_type: string
  due_date: string
  status: string
  completed_at: string | null
}

const statusStyles: Record<string, string> = {
  pending: "bg-gold/10 text-gold",
  completed: "bg-[#2A7D4F]/10 text-[#2A7D4F]",
  overdue: "bg-crimson/10 text-crimson",
}

function getEffectiveStatus(record: TrainingRecord): string {
  if (record.status === "completed") return "completed"
  if (new Date(record.due_date) < new Date()) return "overdue"
  return "pending"
}

export default function TrainingPage() {
  const [records, setRecords] = useState<TrainingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    employee_name: "",
    training_type: "",
    due_date: "",
  })

  useEffect(() => {
    getTrainingRecords().then((data) => {
      setRecords(data as TrainingRecord[])
      setLoading(false)
    })
  }, [])

  const handleAdd = async () => {
    const fd = new FormData()
    fd.set("employee_name", formData.employee_name)
    fd.set("training_type", formData.training_type)
    fd.set("due_date", formData.due_date)
    await addTrainingRecord(fd)
    const updated = await getTrainingRecords()
    setRecords(updated as TrainingRecord[])
    setFormData({ employee_name: "", training_type: "", due_date: "" })
    setShowForm(false)
  }

  const handleComplete = async (id: string) => {
    await completeTraining(id)
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, status: "completed", completed_at: new Date().toISOString() } : r))
  }

  const handleDelete = async (id: string) => {
    await deleteTrainingRecord(id)
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }

  const overdueCount = records.filter((r) => getEffectiveStatus(r) === "overdue").length
  const pendingCount = records.filter((r) => r.status === "pending").length
  const completedCount = records.filter((r) => r.status === "completed").length

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-[28px] text-midnight">Training Records</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            {records.length} record{records.length !== 1 ? "s" : ""} — {overdueCount} overdue, {pendingCount} pending, {completedCount} completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
        >
          <Plus size={16} weight="bold" />
          Add Training
        </button>
      </div>

      {/* Stats */}
      <motion.div
        className="bg-midnight p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Overdue", value: overdueCount, color: "text-crimson" },
            { label: "Pending", value: pendingCount, color: "text-gold" },
            { label: "Completed", value: completedCount, color: "text-[#2A7D4F]" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <span className={`font-mono font-extrabold text-[36px] leading-none ${stat.color}`}>
                {stat.value}
              </span>
              <p className="font-display font-medium text-[9px] tracking-[2px] uppercase text-steel mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Add Form */}
      {showForm && (
        <motion.div
          className="bg-brand-white border border-midnight/[0.08] p-6 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-display font-bold text-[14px] text-midnight mb-4">Add Training Record</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="font-display text-[12px] tracking-[2px] uppercase text-steel block mb-1">Employee Name</label>
              <input
                type="text"
                value={formData.employee_name}
                onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-display text-[12px] tracking-[2px] uppercase text-steel block mb-1">Training Type</label>
              <select
                value={formData.training_type}
                onChange={(e) => setFormData({ ...formData, training_type: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight bg-white focus:border-midnight focus:outline-none transition-colors"
              >
                <option value="">Select type...</option>
                <option value="IIPP">IIPP Training</option>
                <option value="SB 553">SB 553 WVPP</option>
                <option value="Heat Illness">Heat Illness Prevention</option>
                <option value="Hazcom">Hazard Communication</option>
                <option value="Forklift">Forklift Safety</option>
                <option value="Fire Safety">Fire Safety</option>
                <option value="First Aid">First Aid/CPR</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="font-display text-[12px] tracking-[2px] uppercase text-steel block mb-1">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={!formData.employee_name || !formData.training_type || !formData.due_date}
              className="bg-midnight text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:bg-midnight/90 transition-colors disabled:opacity-50"
            >
              Add Record
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="border border-ash text-steel font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:border-midnight hover:text-midnight transition-colors"
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
          <p className="font-sans text-[14px] text-steel">Loading training records...</p>
        </div>
      )}

      {/* Table */}
      {!loading && records.length > 0 && (
        <motion.div
          className="bg-brand-white border border-midnight/[0.08] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-midnight/[0.06] bg-parchment/50">
                  <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Employee</th>
                  <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Training Type</th>
                  <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Due Date</th>
                  <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Status</th>
                  <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Completed</th>
                  <th className="text-right px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const effectiveStatus = getEffectiveStatus(record)
                  return (
                    <tr key={record.id} className="border-b border-midnight/[0.06] last:border-0 hover:bg-parchment/30 transition-colors">
                      <td className="px-4 py-3 font-sans text-[13px] text-midnight">{record.employee_name}</td>
                      <td className="px-4 py-3 font-sans text-[13px] text-midnight">{record.training_type}</td>
                      <td className="px-4 py-3 font-sans text-[12px] text-steel">
                        {new Date(record.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 font-display font-medium text-[10px] tracking-[1px] uppercase ${statusStyles[effectiveStatus] || statusStyles.pending}`}>
                          {effectiveStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans text-[12px] text-steel">
                        {record.completed_at
                          ? new Date(record.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {record.status !== "completed" && (
                            <button
                              onClick={() => handleComplete(record.id)}
                              className="px-3 py-1.5 bg-[#2A7D4F]/10 text-[#2A7D4F] font-display font-medium text-[10px] tracking-[1px] uppercase hover:bg-[#2A7D4F]/20 transition-colors"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-1.5 text-steel hover:text-crimson transition-colors"
                          >
                            <Trash size={14} />
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
            {records.map((record) => {
              const effectiveStatus = getEffectiveStatus(record)
              return (
                <div
                  key={record.id}
                  className="bg-midnight/50 border border-brand-white/[0.06] p-4 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-sans font-semibold text-[14px] text-midnight">{record.employee_name}</span>
                    <span className={`px-2 py-0.5 font-display font-medium text-[10px] tracking-[1px] uppercase shrink-0 ${statusStyles[effectiveStatus] || statusStyles.pending}`}>
                      {effectiveStatus}
                    </span>
                  </div>
                  <p className="font-sans text-[12px] text-steel mb-1">{record.training_type}</p>
                  <p className="font-sans text-[11px] text-steel">
                    Due: {new Date(record.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  {record.status !== "completed" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleComplete(record.id)}
                        className="px-3 py-1.5 bg-[#2A7D4F]/10 text-[#2A7D4F] font-display font-medium text-[10px] tracking-[1px] uppercase hover:bg-[#2A7D4F]/20 transition-colors"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-1.5 text-steel hover:text-crimson transition-colors"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  )}
                  {record.status === "completed" && (
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-sans text-[11px] text-steel">
                        Completed: {record.completed_at
                          ? new Date(record.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </span>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-1.5 text-steel hover:text-crimson transition-colors"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && records.length === 0 && (
        <div className="text-center py-12 bg-brand-white border border-midnight/[0.08]">
          <GraduationCap size={48} className="text-steel/30 mx-auto mb-4" />
          <p className="font-sans text-[14px] text-steel">
            No training records yet. Add your first record to start tracking.
          </p>
        </div>
      )}
    </div>
  )
}
