"use client"

import { useState, useEffect } from "react"
import { getVerticals } from "@/lib/actions/score"

export default function SocialProof() {
  const [industries, setIndustries] = useState<string[]>([])

  useEffect(() => {
    getVerticals().then((verts) => {
      setIndustries(verts.map((v) => v.display_name.toUpperCase()))
    })
  }, [])

  if (industries.length === 0) return null

  return (
    <section className="bg-parchment py-12 border-t border-b border-midnight/[0.08]">
      <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row items-center gap-8">
        {/* Label */}
        <span className="font-display font-medium text-[9px] tracking-[3px] uppercase text-steel shrink-0">
          SERVING BUSINESSES IN
        </span>

        {/* Marquee Container */}
        <div className="relative overflow-hidden flex-1 w-full">
          {/* Gradient Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-parchment to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-parchment to-transparent z-10" />

          {/* Scrolling Content */}
          <div className="flex animate-marquee gap-12">
            {/* First copy */}
            {industries.map((industry) => (
              <div key={industry} className="flex items-center gap-3 shrink-0">
                <div className="w-1 h-1 bg-crimson" />
                <span className="font-display font-bold text-[14px] tracking-[4px] text-midnight whitespace-nowrap">
                  {industry}
                </span>
              </div>
            ))}
            {/* Second copy for seamless loop */}
            {industries.map((industry) => (
              <div key={`${industry}-2`} className="flex items-center gap-3 shrink-0">
                <div className="w-1 h-1 bg-crimson" />
                <span className="font-display font-bold text-[14px] tracking-[4px] text-midnight whitespace-nowrap">
                  {industry}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
