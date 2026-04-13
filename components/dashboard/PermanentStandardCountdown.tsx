"use client"

import { useEffect, useState } from "react"
import { ShieldCheck } from "@phosphor-icons/react"
import Link from "next/link"

/**
 * Countdown to the SB 553 permanent standard taking effect.
 * Cal/OSHA permanent workplace violence prevention standard replaces
 * the interim standard on December 31, 2026.
 */

const PERMANENT_STANDARD_DATE = new Date("2026-12-31T00:00:00-08:00")

function getTimeRemaining() {
  const now = new Date()
  const diff = PERMANENT_STANDARD_DATE.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, isPast: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { days, hours, minutes, isPast: false }
}

export function PermanentStandardCountdown() {
  const [time, setTime] = useState(getTimeRemaining)

  useEffect(() => {
    const timer = setInterval(() => setTime(getTimeRemaining()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const urgency =
    time.days <= 30
      ? "critical"
      : time.days <= 90
      ? "warning"
      : "normal"

  const urgencyColors = {
    critical: "border-crimson/30 bg-crimson/[0.04]",
    warning: "border-gold/30 bg-gold/[0.04]",
    normal: "border-midnight/[0.08] bg-brand-white",
  }

  const urgencyBadge = {
    critical: "bg-crimson text-white",
    warning: "bg-gold text-midnight",
    normal: "bg-midnight/10 text-midnight",
  }

  if (time.isPast) {
    return (
      <div className="border border-[#2A7D4F]/30 bg-[#2A7D4F]/[0.04] p-5">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck size={20} weight="fill" className="text-[#2A7D4F]" />
          <span className="font-display font-bold text-[12px] tracking-[2px] uppercase text-[#2A7D4F]">
            Permanent Standard In Effect
          </span>
        </div>
        <p className="font-sans text-[13px] text-steel">
          The Cal/OSHA permanent workplace violence prevention standard is now active.
          Ensure your WVPP complies with the permanent requirements.
        </p>
      </div>
    )
  }

  return (
    <div className={`border p-5 ${urgencyColors[urgency]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} weight="fill" className="text-crimson" />
          <span className="font-display font-bold text-[12px] tracking-[2px] uppercase text-midnight">
            SB 553 Permanent Standard
          </span>
        </div>
        <span className={`px-2 py-0.5 font-display font-bold text-[9px] tracking-[1px] uppercase ${urgencyBadge[urgency]}`}>
          {urgency === "critical" ? "Urgent" : urgency === "warning" ? "Approaching" : "Upcoming"}
        </span>
      </div>

      {/* Countdown blocks */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-midnight/[0.04] p-3 text-center">
          <span className="block font-display font-extrabold text-[28px] text-midnight leading-none">
            {time.days}
          </span>
          <span className="font-display font-medium text-[9px] tracking-[2px] uppercase text-steel mt-1 block">
            Days
          </span>
        </div>
        <div className="flex-1 bg-midnight/[0.04] p-3 text-center">
          <span className="block font-display font-extrabold text-[28px] text-midnight leading-none">
            {time.hours}
          </span>
          <span className="font-display font-medium text-[9px] tracking-[2px] uppercase text-steel mt-1 block">
            Hours
          </span>
        </div>
        <div className="flex-1 bg-midnight/[0.04] p-3 text-center">
          <span className="block font-display font-extrabold text-[28px] text-midnight leading-none">
            {time.minutes}
          </span>
          <span className="font-display font-medium text-[9px] tracking-[2px] uppercase text-steel mt-1 block">
            Min
          </span>
        </div>
      </div>

      <p className="font-sans text-[12px] text-steel mb-3">
        Cal/OSHA permanent workplace violence prevention standard takes effect December 31, 2026.
        Your WVPP must comply with the permanent requirements by this date.
      </p>

      <Link
        href="/dashboard/documents/request"
        className="inline-flex items-center gap-2 font-display font-semibold text-[10px] tracking-[2px] uppercase text-crimson hover:text-midnight transition-colors"
      >
        Update Your WVPP →
      </Link>
    </div>
  )
}
