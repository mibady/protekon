"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CalendarCheck,
  Certificate,
  FileText,
  Scales,
  GraduationCap,
  Warning,
  Check,
  Clock,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import {
  getCalendarEvents,
  type CalendarEvent,
  type CalendarEventType,
} from "@/lib/actions/calendar"

const TYPE_CONFIG: Record<
  CalendarEventType,
  { icon: typeof CalendarCheck; label: string; color: string; bg: string }
> = {
  training: {
    icon: GraduationCap,
    label: "Training",
    color: "text-[#6366F1]",
    bg: "bg-[#6366F1]/10",
  },
  document: {
    icon: FileText,
    label: "Document",
    color: "text-midnight",
    bg: "bg-midnight/10",
  },
  regulatory: {
    icon: Scales,
    label: "Regulatory",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  certification: {
    icon: Certificate,
    label: "Certification",
    color: "text-crimson",
    bg: "bg-crimson/10",
  },
}

const STATUS_CONFIG: Record<
  string,
  { icon: typeof Warning; label: string; color: string; bg: string; border: string }
> = {
  overdue: {
    icon: Warning,
    label: "Overdue",
    color: "text-crimson",
    bg: "bg-crimson/10",
    border: "border-l-crimson",
  },
  upcoming: {
    icon: Clock,
    label: "Upcoming",
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-l-gold",
  },
  completed: {
    icon: Check,
    label: "Completed",
    color: "text-[#16A34A]",
    bg: "bg-[#16A34A]/10",
    border: "border-l-[#16A34A]",
  },
}

export default function ComplianceCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [activeFilter, setActiveFilter] = useState<CalendarEventType | "all">("all")
  const [month, setMonth] = useState(new Date())

  useEffect(() => {
    getCalendarEvents()
      .then(setEvents)
      .finally(() => setLoading(false))
  }, [])

  // Filter events
  const filteredEvents = useMemo(() => {
    if (activeFilter === "all") return events
    return events.filter((e) => e.type === activeFilter)
  }, [events, activeFilter])

  // Events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return filteredEvents.slice(0, 15)
    const dateStr = selectedDate.toISOString().slice(0, 10)
    return filteredEvents.filter((e) => e.date === dateStr)
  }, [filteredEvents, selectedDate])

  // Dates that have events (for calendar dot indicators)
  const eventDates = useMemo(() => {
    const map = new Map<string, { count: number; hasOverdue: boolean }>()
    for (const e of filteredEvents) {
      const existing = map.get(e.date) || { count: 0, hasOverdue: false }
      existing.count++
      if (e.status === "overdue") existing.hasOverdue = true
      map.set(e.date, existing)
    }
    return map
  }, [filteredEvents])

  // Summary counts
  const counts = useMemo(() => {
    const c = { overdue: 0, upcoming: 0, completed: 0, total: 0 }
    for (const e of events) {
      c[e.status]++
      c.total++
    }
    return c
  }, [events])

  // Modifiers for calendar
  const modifiers = useMemo(() => {
    const overdueDates: Date[] = []
    const upcomingDates: Date[] = []
    const completedDates: Date[] = []

    for (const [dateStr, info] of eventDates) {
      const d = new Date(dateStr + "T12:00:00")
      if (info.hasOverdue) overdueDates.push(d)
      else upcomingDates.push(d)
    }

    return { overdue: overdueDates, upcoming: upcomingDates, completed: completedDates }
  }, [eventDates])

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-[28px] text-midnight leading-none">
            Compliance Calendar
          </h1>
          <p className="font-sans text-[14px] text-steel mt-1.5">
            Deadlines, renewals, and regulatory effective dates
          </p>
        </div>

        {/* Status Summary */}
        <div className="flex items-center gap-4">
          {(["overdue", "upcoming", "completed"] as const).map((status) => {
            const cfg = STATUS_CONFIG[status]
            const Icon = cfg.icon
            return (
              <div key={status} className="flex items-center gap-1.5">
                <div className={`p-1 rounded ${cfg.bg}`}>
                  <Icon size={14} className={cfg.color} weight="bold" />
                </div>
                <span className="font-mono font-bold text-[18px] text-midnight leading-none">
                  {counts[status]}
                </span>
                <span className="font-display text-[9px] tracking-[1px] uppercase text-steel">
                  {cfg.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {(["all", "training", "document", "regulatory", "certification"] as const).map(
          (filter) => {
            const isActive = activeFilter === filter
            const cfg = filter !== "all" ? TYPE_CONFIG[filter] : null
            const Icon = cfg?.icon
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-display font-semibold text-[10px] tracking-[1.5px] uppercase transition-all flex-shrink-0 ${
                  isActive
                    ? "bg-midnight text-parchment"
                    : "bg-brand-white border border-midnight/[0.12] text-steel hover:text-midnight hover:border-midnight/30"
                }`}
              >
                {Icon && <Icon size={13} weight={isActive ? "bold" : "regular"} />}
                {filter === "all" ? "All Events" : cfg?.label}
              </button>
            )
          }
        )}
      </div>

      {/* Main Grid: Calendar + Event List */}
      <div className="grid lg:grid-cols-[auto_1fr] gap-6">
        {/* Calendar */}
        <motion.div
          className="bg-brand-white border border-midnight/[0.08]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-4 border-b border-midnight/[0.06] flex items-center gap-2">
            <CalendarCheck size={18} className="text-crimson" weight="bold" />
            <span className="font-display font-bold text-[12px] tracking-[3px] uppercase text-midnight">
              {month.toLocaleString("default", { month: "long", year: "numeric" })}
            </span>
          </div>
          <div className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={month}
              onMonthChange={setMonth}
              modifiers={modifiers}
              modifiersClassNames={{
                overdue:
                  "relative after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-crimson",
                upcoming:
                  "relative after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-gold",
              }}
              className="[--cell-size:--spacing(10)]"
            />
          </div>
          {/* Legend */}
          <div className="px-4 pb-3 flex items-center gap-4 border-t border-midnight/[0.06] pt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-crimson" />
              <span className="font-display text-[9px] tracking-[1px] uppercase text-steel">Overdue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gold" />
              <span className="font-display text-[9px] tracking-[1px] uppercase text-steel">Upcoming</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span className="font-display text-[9px] tracking-[1px] uppercase text-steel">Completed</span>
            </div>
          </div>
        </motion.div>

        {/* Event List */}
        <motion.div
          className="bg-brand-white border border-midnight/[0.08]"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="p-4 border-b border-midnight/[0.06] flex items-center justify-between">
            <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-midnight">
              {selectedDate
                ? selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : "All Upcoming Events"}
            </h3>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(undefined)}
                className="font-display text-[10px] tracking-[1px] uppercase text-crimson hover:text-crimson/80 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="divide-y divide-midnight/[0.06] max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-parchment rounded animate-pulse" />
                ))}
              </div>
            ) : selectedDateEvents.length === 0 ? (
              <div className="p-12 text-center">
                <CalendarCheck size={40} className="text-steel/20 mx-auto mb-3" />
                <p className="font-sans text-[13px] text-steel">
                  {selectedDate
                    ? "No events on this date."
                    : "No compliance events found."}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {selectedDateEvents.map((event, i) => {
                  const typeCfg = TYPE_CONFIG[event.type]
                  const statusCfg = STATUS_CONFIG[event.status]
                  const TypeIcon = typeCfg.icon
                  const StatusIcon = statusCfg.icon

                  return (
                    <motion.div
                      key={event.id}
                      className={`p-4 border-l-[3px] ${statusCfg.border} hover:bg-parchment/30 transition-colors`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`p-1.5 rounded flex-shrink-0 mt-0.5 ${typeCfg.bg}`}>
                            <TypeIcon size={16} className={typeCfg.color} weight="bold" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-sans text-[13px] text-midnight font-medium leading-snug">
                              {event.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-[11px] text-steel">
                                {new Date(event.date + "T12:00:00").toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              {event.detail && (
                                <span className="font-sans text-[11px] text-steel/70">
                                  {event.detail}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`flex-shrink-0 gap-1 font-display text-[9px] tracking-[1px] uppercase border-0 ${statusCfg.bg} ${statusCfg.color}`}
                        >
                          <StatusIcon size={11} weight="bold" />
                          {statusCfg.label}
                        </Badge>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
