"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const industryData = [
  { name: "Construction", percentage: 25.8, color: "#C41230" },
  { name: "Manufacturing", percentage: 20.2, color: "#C41230" },
  { name: "Agriculture", percentage: 7.3, color: "#7A8FA5" },
  { name: "Services", percentage: 7.0, color: "#7A8FA5" },
  { name: "Hospitality", percentage: 6.7, color: "#7A8FA5" },
]

const donutData = [
  { label: "Serious", percentage: 70.1, color: "#C41230" },
  { label: "Willful", percentage: 4.8, color: "#C9A84C" },
  { label: "Repeat", percentage: 3.9, color: "#7A8FA5" },
  { label: "Other", percentage: 21.1, color: "#E8E2D8" },
]

export default function DataSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="bg-parchment py-24" ref={ref}>
      <div className="max-w-[1400px] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-[700px] mx-auto">
          <h2 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.92] text-midnight mb-6">
            THE ENFORCEMENT DATA BEHIND SHIELD CaaS
          </h2>
          <p className="font-sans font-light text-[16px] leading-[1.75] text-steel">
            73,960 Cal/OSHA citations scraped, analyzed, and translated into 
            the exact compliance architecture your business needs.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Large Bar Chart */}
          <div className="lg:row-span-2 bg-brand-white p-8 border-t-[3px] border-crimson">
            <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-steel mb-8">
              TOP 5 INDUSTRIES BY VIOLATIONS
            </h3>
            
            <div className="flex flex-col gap-6">
              {industryData.map((item, i) => (
                <div key={item.name} className="flex flex-col gap-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-sans font-normal text-[14px] text-midnight">
                      {item.name}
                    </span>
                    <span 
                      className="font-display font-bold text-[18px]"
                      style={{ color: item.color }}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="h-3 bg-ash/50 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${item.percentage * 3}%` } : { width: 0 }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Right: Enforcement Trend */}
          <div className="bg-brand-white p-8 border-t-[3px] border-gold">
            <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-steel mb-6">
              ENFORCEMENT TREND 2020-2025
            </h3>
            
            {/* Simple line chart visualization */}
            <div className="relative h-32">
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                {/* Grid lines - very subtle */}
                <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(11,29,58,0.06)" strokeWidth="0.5" />
                
                {/* Trend line */}
                <motion.path
                  d="M0,80 L60,70 L120,60 L180,55 L240,35 L300,25"
                  fill="none"
                  stroke="#C41230"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                
                {/* Data points */}
                {[
                  { x: 0, y: 80 },
                  { x: 60, y: 70 },
                  { x: 120, y: 60 },
                  { x: 180, y: 55 },
                  { x: 240, y: 35 },
                  { x: 300, y: 25 },
                ].map((point, i) => (
                  <motion.circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#C41230"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                  />
                ))}
              </svg>
              
              {/* X-axis labels */}
              <div className="flex justify-between mt-2">
                {["2020", "2021", "2022", "2023", "2024", "2025"].map((year) => (
                  <span key={year} className="font-sans font-light text-[11px] text-steel">
                    {year}
                  </span>
                ))}
              </div>
              
              {/* Annotation */}
              <div className="absolute top-0 right-12 flex items-center gap-2">
                <span className="font-display font-medium text-[9px] tracking-[1px] text-crimson">
                  SB 553 ENFORCEMENT
                </span>
                <span className="text-crimson">↗</span>
              </div>
            </div>
          </div>

          {/* Bottom Right: Donut Chart */}
          <div className="bg-brand-white p-8 border-t-[3px] border-steel">
            <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-steel mb-6">
              VIOLATION TYPE BREAKDOWN
            </h3>
            
            <div className="flex items-center gap-8">
              {/* Donut */}
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {donutData.reduce((acc, item, i) => {
                    const prevOffset = acc.offset
                    const circumference = 2 * Math.PI * 35
                    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`
                    
                    acc.elements.push(
                      <motion.circle
                        key={item.label}
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="16"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={-prevOffset}
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.15 }}
                      />
                    )
                    acc.offset += (item.percentage / 100) * circumference
                    return acc
                  }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
                </svg>
                
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="font-display font-extrabold text-[40px] text-midnight"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    $7,229
                  </motion.span>
                  <span className="font-display font-light text-[9px] tracking-[2px] text-steel uppercase text-center px-4">
                    AVG SERIOUS VIOLATION
                  </span>
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex flex-col gap-3">
                {donutData.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-sans text-[12px] text-midnight">
                      {item.label}
                    </span>
                    <span className="font-display font-bold text-[12px] text-steel">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
