"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Check, X, Minus } from "@phosphor-icons/react"

const capabilities = [
  { name: "Writes plan for you", training: false, diy: false, enterprise: true, consultant: true, shield: true },
  { name: "Manages incident log", training: false, diy: false, enterprise: true, consultant: "partial", shield: true },
  { name: "Monitors reg changes", training: false, diy: false, enterprise: true, consultant: false, shield: true },
  { name: "Strips PII automatically", training: false, diy: false, enterprise: false, consultant: false, shield: true },
  { name: "Delivers to inbox", training: false, diy: false, enterprise: false, consultant: false, shield: true },
  { name: "No software to learn", training: true, diy: true, enterprise: false, consultant: true, shield: true },
  { name: "Recurring service", training: false, diy: false, enterprise: true, consultant: "partial", shield: true },
]

const pricing = {
  training: "$20/seat",
  diy: "$1,300 one-time",
  enterprise: "$800–$2,000+/mo",
  consultant: "$150–$300/hr",
  shield: "$297–$797/mo",
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
          THE ONLY OPTION THAT DOES THE WORK
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

        {/* Bottom Banner */}
        <motion.div
          className="mt-12 py-4 px-6 bg-crimson/[0.08] border border-crimson/20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="font-display font-semibold text-[20px] text-gold">
            No funded competitor occupies managed, done-for-you physical workplace 
            compliance for SMBs at $300–$500/month.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
