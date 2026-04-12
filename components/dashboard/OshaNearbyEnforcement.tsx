"use client"

import { useEffect, useState } from "react"
import { MapPin, Warning } from "@phosphor-icons/react"
import { getOshaNearbyData } from "@/lib/actions/osha"
import type { OshaNearbyEnforcement } from "@/lib/types"

export function OshaNearbyEnforcementWidget() {
  const [data, setData] = useState<OshaNearbyEnforcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOshaNearbyData()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-brand-white border border-midnight/[0.08] p-6 animate-pulse">
        <div className="h-4 bg-parchment rounded w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-parchment rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-brand-white border border-midnight/[0.08] border-t-[3px] border-t-gold">
        <div className="p-4 border-b border-midnight/[0.06] flex items-center gap-2">
          <MapPin size={18} className="text-gold" weight="bold" />
          <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-midnight">
            Nearby Enforcement
          </h3>
        </div>
        <div className="p-6 text-center">
          <p className="font-sans text-[13px] text-steel">No recent enforcement actions found nearby.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-brand-white border border-midnight/[0.08] border-t-[3px] border-t-gold">
      <div className="p-4 border-b border-midnight/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-gold" weight="bold" />
          <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-midnight">
            Nearby Enforcement
          </h3>
        </div>
        <span className="font-display text-[9px] tracking-[2px] uppercase text-steel">
          {data.length} actions
        </span>
      </div>
      <div className="divide-y divide-midnight/[0.06] max-h-[320px] overflow-y-auto">
        {data.slice(0, 8).map((action, i) => {
          const penalty = action.penaltyAmount
          const severityColor = penalty >= 10000 ? "text-crimson" : penalty >= 1000 ? "text-gold" : "text-steel"

          return (
            <div key={i} className="p-3 hover:bg-parchment/50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-[13px] text-midnight font-medium truncate">
                    {action.establishment}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-display text-[9px] tracking-[1px] uppercase text-steel">
                      {action.city}, {action.state}
                    </span>
                    {action.violationType && (
                      <span className={`px-1.5 py-0.5 font-display font-bold text-[8px] tracking-[1px] uppercase ${
                        action.violationType === "Willful" ? "bg-crimson text-white" :
                        action.violationType === "Serious" ? "bg-gold/20 text-gold" :
                        "bg-steel/10 text-steel"
                      }`}>
                        {action.violationType}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`font-mono font-bold text-[14px] ${severityColor}`}>
                    ${penalty.toLocaleString()}
                  </span>
                  <p className="font-display text-[8px] tracking-[1px] uppercase text-steel mt-0.5">
                    {action.inspectionDate}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
