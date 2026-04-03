"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Check, X, Minus } from "@phosphor-icons/react"

const capabilities: { name: string; training: boolean | "partial"; diy: boolean | "partial"; enterprise: boolean | "partial"; consultant: boolean | "partial"; shield: boolean | "partial" }[] = [
  { name: "Runs autonomously 24/7", training: false, diy: false, enterprise: false, consultant: false, shield: true },
  { name: "Writes your plan autonomously", training: false, diy: false, enterprise: true, consultant: true, shield: true },
  { name: "Classifies + logs incidents via AI", training: false, diy: false, enterprise: true, consultant: "partial", shield: true },
  { name: "Scans regulations daily at 6am", training: false, diy: false, enterprise: true, consultant: false, shield: true },
  { name: "AI strips PII + assigns OSHA codes", training: false, diy: false, enterprise: false, consultant: false, shield: true },
  { name: "Delivers proof on schedule", training: false, diy: false, enterprise: false, consultant: false, shield: true },
  { name: "Zero software. Zero staff.", training: true, diy: true, enterprise: false, consultant: true, shield: true },
  { name: "Always-on AI agent", training: false, diy: false, enterprise: false, consultant: false, shield: true },
]

const pricing = {
  training: "$20/seat",
  diy: "$1,300 one-time",
  enterprise: "$800–$2,000+/mo",
  consultant: "$150–$300/hr",
  shield: "$597–$1,297/mo",
}

function StatusIcon({ status }: { status: boolean | "partial" }) {
  if (status === true) {
    return <Check size={18} weight="bold" className="text-crimson" />
  }
  if (status === "partial") {
    return <Minus size={18} weight="bold" className="text-gold" />
  }
  return <X size={18} weight="bold" className="text-steel/50" />
}

export default function Comparison() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="bg-void py-24" ref={ref}>
      <div className="max-w-[1400px] mx-auto px-8">
        {/* Header */}
        <motion.h2
          className="font-display font-black text-[clamp(36px,5vw,64px)] leading-[0.92] text-brand-white mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
        >
          THE ONLY OPTION THAT DOESN&apos;T REQUIRE YOU.
        </motion.h2>

        {/* Comparison Table */}
        <motion.div
          className="overflow-x-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="text-left p-4 font-display font-bold text-[11px] tracking-[3px] uppercase text-steel">
                  CAPABILITY
                </th>
                <th className="p-4 font-display font-bold text-[11px] tracking-[3px] uppercase text-steel text-center">
                  Training Co.
                </th>
                <th className="p-4 font-display font-bold text-[11px] tracking-[3px] uppercase text-steel text-center">
                  DIY Templates
                </th>
                <th className="p-4 font-display font-bold text-[11px] tracking-[3px] uppercase text-steel text-center">
                  Enterprise GRC
                </th>
                <th className="p-4 font-display font-bold text-[11px] tracking-[3px] uppercase text-steel text-center">
                  Local Consultant
                </th>
                <th className="p-4 font-display font-bold text-[11px] tracking-[3px] uppercase bg-crimson text-brand-white text-center border-l-[3px] border-crimson">
                  PROTEKON
                </th>
              </tr>
            </thead>
            <tbody>
              {capabilities.map((cap, i) => (
                <tr 
                  key={cap.name}
                  className="border-t border-brand-white/[0.06]"
                >
                  <td className="p-4 font-sans text-[14px] text-brand-white/80">
                    {cap.name}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <StatusIcon status={cap.training} />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <StatusIcon status={cap.diy} />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <StatusIcon status={cap.enterprise} />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <StatusIcon status={cap.consultant} />
                    </div>
                  </td>
                  <td className="p-4 text-center bg-crimson/[0.06] border-l-[3px] border-crimson">
                    <div className="flex justify-center">
                      <StatusIcon status={cap.shield} />
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Pricing Row */}
              <tr className="border-t-2 border-brand-white/[0.1]">
                <td className="p-4 font-display font-bold text-[12px] tracking-[2px] uppercase text-gold">
                  MONTHLY COST
                </td>
                <td className="p-4 text-center font-sans text-[13px] text-steel">
                  {pricing.training}
                </td>
                <td className="p-4 text-center font-sans text-[13px] text-steel">
                  {pricing.diy}
                </td>
                <td className="p-4 text-center font-sans text-[13px] text-steel">
                  {pricing.enterprise}
                </td>
                <td className="p-4 text-center font-sans text-[13px] text-steel">
                  {pricing.consultant}
                </td>
                <td className="p-4 text-center bg-crimson/[0.06] border-l-[3px] border-crimson">
                  <span className="font-display font-bold text-[16px] text-crimson">
                    {pricing.shield}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </motion.div>

        {/* Subtext */}
        <motion.p
          className="mt-8 text-center font-sans font-light text-[16px] leading-[1.75] text-fog max-w-[600px] mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Every other option on this table requires you to do the compliance work. PROTEKON is the only AI agent that does it for you.
        </motion.p>
      </div>
    </section>
  )
}
