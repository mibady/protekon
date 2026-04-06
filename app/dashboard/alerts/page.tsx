"use client"

import { motion } from "framer-motion"
import { Warning, Info, CheckCircle, Clock, CaretRight } from "@phosphor-icons/react"
import { useState, useEffect, useCallback } from "react"
import { getAlerts, markAllAlertsRead } from "@/lib/actions/alerts"
import { toast } from "sonner"

const getAlertIcon = (type: string) => {
  switch (type) {
    case "urgent":
      return <Warning size={20} weight="fill" className="text-crimson" />
    case "warning":
      return <Warning size={20} weight="fill" className="text-gold" />
    case "success":
      return <CheckCircle size={20} weight="fill" className="text-green-600" />
    default:
      return <Info size={20} weight="fill" className="text-blue-500" />
  }
}

const getAlertBorder = (type: string) => {
  switch (type) {
    case "urgent":
      return "border-l-crimson"
    case "warning":
      return "border-l-gold"
    case "success":
      return "border-l-green-600"
    default:
      return "border-l-blue-500"
  }
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<{ id: string; type: string; title: string; description: string; date: string; action: string; read: boolean }[]>([])
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [markingRead, setMarkingRead] = useState(false)
  const LIMIT = 20

  const fetchAlerts = useCallback(async (currentOffset: number, append: boolean = false) => {
    const result = await getAlerts(currentOffset, LIMIT)
    if (result.error) {
      toast.error("Failed to load alerts")
    }
    if (append) {
      setAlerts((prev) => [...prev, ...result.data])
    } else {
      setAlerts(result.data)
    }
    return result.data
  }, [])

  useEffect(() => {
    fetchAlerts(0).then(() => setLoading(false))
  }, [fetchAlerts])

  const urgentCount = alerts.filter(a => a.type === "urgent").length
  const warningCount = alerts.filter(a => a.type === "warning").length
  const infoCount = alerts.filter(a => a.type === "info").length

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-[28px] text-midnight">Alerts</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            Stay informed about compliance updates and deadlines
          </p>
        </div>
        <button
          onClick={async () => {
            setMarkingRead(true)
            const result = await markAllAlertsRead()
            if (result.success) {
              setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
              toast.success("All alerts marked as read")
            } else {
              toast.error(result.error || "Failed to mark alerts as read")
            }
            setMarkingRead(false)
          }}
          disabled={markingRead}
          className="inline-flex items-center gap-2 text-steel hover:text-midnight font-display text-[11px] tracking-[2px] uppercase transition-colors disabled:opacity-50"
        >
          {markingRead ? "Marking..." : "Mark All as Read"}
        </button>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Urgent", count: urgentCount, color: "text-crimson bg-crimson/5" },
          { label: "Warnings", count: warningCount, color: "text-gold bg-gold/5" },
          { label: "Info", count: infoCount, color: "text-blue-500 bg-blue-50" },
          { label: "Total", count: alerts.length, color: "text-green-600 bg-green-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-ash p-4">
            <span className={`font-display font-bold text-[24px] ${stat.color.split(" ")[0]}`}>
              {stat.count}
            </span>
            <span className="font-display text-[12px] tracking-[2px] uppercase text-steel block mt-1">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Alerts List */}
      <div className="flex flex-col gap-4">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.id}
            className={`bg-white border border-ash border-l-4 ${getAlertBorder(alert.type)} p-6`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-[16px] text-midnight mb-1">
                      {alert.title}
                    </h3>
                    <p className="font-sans text-[14px] text-steel leading-relaxed">
                      {alert.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-steel shrink-0">
                    <Clock size={14} />
                    <span className="font-sans text-[12px]">{alert.date}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const routes: Record<string, string> = {
                      "View Details": `/dashboard/alerts`,
                      "Review Document": `/dashboard/documents`,
                      "View Incident": `/dashboard/incidents`,
                      "View Regulation": `/dashboard/regulations`,
                    }
                    const href = routes[alert.action] ?? "/dashboard"
                    window.location.href = href
                  }}
                  className="mt-4 inline-flex items-center gap-1 font-display text-[11px] tracking-[2px] uppercase text-crimson hover:text-crimson/80 transition-colors"
                >
                  {alert.action}
                  <CaretRight size={14} weight="bold" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <button
          onClick={async () => {
            setLoadingMore(true)
            const newOffset = offset + LIMIT
            const data = await fetchAlerts(newOffset, true)
            setOffset(newOffset)
            if (data.length === 0) {
              toast.info("No more alerts to load")
            }
            setLoadingMore(false)
          }}
          disabled={loadingMore}
          className="font-display text-[11px] tracking-[2px] uppercase text-steel hover:text-midnight border border-ash px-6 py-3 hover:border-midnight transition-colors disabled:opacity-50"
        >
          {loadingMore ? "Loading..." : "Load Earlier Alerts"}
        </button>
      </div>
    </div>
  )
}
