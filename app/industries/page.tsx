"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import {
  HardHat, Factory, ForkKnife, Hospital, Buildings, Truck, ShoppingCart, Wrench,
  Tree, Lightning, GraduationCap, Recycle, MusicNotes, Briefcase, Mountains,
  Warehouse, Users, Gear, Globe, TShirt, Shield, UserCircle, Broom,
} from "@phosphor-icons/react"
import { getVerticals } from "@/lib/actions/score"
import type { VerticalBenchmark } from "@/lib/types/score"

type IconComponent = typeof HardHat

const ICON_MAP: Record<string, IconComponent> = {
  construction: HardHat,
  manufacturing: Factory,
  hospitality: ForkKnife,
  healthcare: Hospital,
  real_estate: Buildings,
  transportation: Truck,
  retail: ShoppingCart,
  automotive: Wrench,
  agriculture: Tree,
  utilities: Lightning,
  education: GraduationCap,
  waste_environmental: Recycle,
  arts_entertainment: MusicNotes,
  professional_services: Briefcase,
  mining: Mountains,
  warehouse: Warehouse,
  staffing: Users,
  equipment_repair: Gear,
  information: Globe,
  laundry: TShirt,
  security: Shield,
  personal_services: UserCircle,
  building_services: Broom,
  public_admin: Buildings,
  facilities_mgmt: Gear,
  business_support: Briefcase,
  wholesale: Warehouse,
}

const INDUSTRY_IMAGES: Record<string, string> = {
  construction: "/images/industries/construction.jpg",
  manufacturing: "/images/industries/manufacturing.jpg",
  healthcare: "/images/industries/healthcare.jpg",
  hospitality: "/images/industries/hospitality.jpg",
  retail: "/images/industries/retail.jpg",
  warehouse: "/images/industries/warehouse.jpg",
  wholesale: "/images/industries/warehouse.jpg",
  agriculture: "/images/industries/agriculture.jpg",
  transportation: "/images/industries/transportation.jpg",
  real_estate: "/images/industries/real-estate.jpg",
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n)
}

export default function IndustriesPage() {
  const [industries, setIndustries] = useState<VerticalBenchmark[]>([])

  useEffect(() => {
    getVerticals().then((verts) => {
      setIndustries(
        verts.map((v) => ({
          slug: v.slug,
          display_name: v.display_name,
          tier: v.tier,
          national_violations: 0,
          national_penalties_usd: 0,
          serious_pct: 0,
          top_hazcats: [],
          compliance_stack: v.compliance_stack,
        }))
      )
      // Fetch full benchmark data for each
      Promise.all(
        verts.map(async (v) => {
          const { getVerticalBenchmark } = await import("@/lib/actions/score")
          return getVerticalBenchmark(v.slug)
        })
      ).then((benchmarks) => {
        setIndustries(benchmarks.filter((b): b is VerticalBenchmark => b !== null))
      })
    })
  }, [])

  const tier1 = industries.filter((i) => i.tier === "tier_1")
  const tier2 = industries.filter((i) => i.tier === "tier_2")
  const tier3 = industries.filter((i) => i.tier === "tier_3")

  return (
    <main className="min-h-screen bg-void">
      <Nav />

      {/* Hero */}
      <section className="pt-32 pb-20 px-8 border-b border-brand-white/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-display text-[12px] tracking-[4px] uppercase text-gold">
              Industries
            </span>
            <h1 className="font-display font-black text-[clamp(40px,6vw,64px)] leading-[0.92] text-parchment mt-4 mb-6">
              BUILT FOR YOUR INDUSTRY
            </h1>
            <p className="font-sans text-[16px] text-steel max-w-[600px] leading-relaxed">
              Every industry has unique compliance requirements. PROTEKON&apos;s engine analyzes
              431,000+ federal and state enforcement records across 27 verticals to understand the specific risks that affect your business.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-midnight border-b border-brand-white/[0.06]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            { value: "27", label: "Industry Verticals" },
            { value: "24/7", label: "Regulatory Monitoring" },
            { value: "100%", label: "Federal + State OSHA" },
            { value: "48hr", label: "First Delivery" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`p-8 ${i < 3 ? "border-r border-brand-white/[0.06]" : ""}`}
            >
              <span className="font-display font-black text-[28px] text-gold block">
                {stat.value}
              </span>
              <span className="font-display text-[9px] tracking-[2px] uppercase text-steel">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Tier 1 */}
      {tier1.length > 0 && (
        <section className="py-20 px-8">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-display font-bold text-[22px] text-gold mb-8 tracking-[2px] uppercase">Primary Markets</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {tier1.map((industry, i) => {
                const Icon = ICON_MAP[industry.slug] ?? Briefcase
                const riskLevel = industry.serious_pct >= 55 ? "Very High" : industry.serious_pct >= 40 ? "High" : "Moderate"
                return (
                  <motion.div
                    key={industry.slug}
                    className="group relative bg-midnight border border-brand-white/[0.06] overflow-hidden hover:border-gold/30 transition-colors"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.03 }}
                  >
                    {/* Background image */}
                    {INDUSTRY_IMAGES[industry.slug] && (
                      <div className="absolute inset-0">
                        <Image
                          src={INDUSTRY_IMAGES[industry.slug]}
                          alt={industry.display_name}
                          fill
                          className="object-cover opacity-15 group-hover:opacity-25 transition-opacity duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/90 to-midnight/60" />
                      </div>
                    )}

                    <div className="relative z-10 p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 flex items-center justify-center bg-gold/10 backdrop-blur-sm">
                            <Icon size={24} weight="bold" className="text-gold" />
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-[18px] text-parchment">
                              {industry.display_name}
                            </h3>
                            <span className={`font-display text-[12px] tracking-[2px] uppercase ${
                              riskLevel === "Very High" ? "text-crimson" : riskLevel === "High" ? "text-gold" : "text-steel"
                            }`}>
                              {riskLevel} Risk
                            </span>
                          </div>
                        </div>
                      </div>

                      {industry.national_violations > 0 && (
                        <div className="flex gap-6 mb-6">
                          <div>
                            <span className="font-mono text-[16px] font-bold text-crimson">{formatNumber(industry.national_violations)}</span>
                            <span className="font-sans text-[11px] text-steel block">violations</span>
                          </div>
                          <div>
                            <span className="font-mono text-[16px] font-bold text-crimson">{formatCurrency(industry.national_penalties_usd)}</span>
                            <span className="font-sans text-[11px] text-steel block">in penalties</span>
                          </div>
                          <div>
                            <span className="font-mono text-[16px] font-bold text-gold">{industry.serious_pct}%</span>
                            <span className="font-sans text-[11px] text-steel block">serious</span>
                          </div>
                        </div>
                      )}

                      <Link
                        href="/score"
                        className="inline-flex items-center font-display font-semibold text-[12px] tracking-[3px] uppercase text-gold hover:text-parchment transition-colors"
                      >
                        Check Your Score
                        <svg className="ml-2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Tier 2 */}
      {tier2.length > 0 && (
        <section className="py-16 px-8 border-t border-brand-white/[0.06]">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-display font-bold text-[22px] text-steel mb-8 tracking-[2px] uppercase">Secondary Markets</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {tier2.map((industry) => {
                const Icon = ICON_MAP[industry.slug] ?? Briefcase
                return (
                  <div key={industry.slug} className="bg-midnight border border-brand-white/[0.06] p-6 hover:border-gold/20 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon size={20} weight="bold" className="text-steel" />
                      <h3 className="font-display font-bold text-[15px] text-parchment">{industry.display_name}</h3>
                    </div>
                    {industry.national_violations > 0 && (
                      <p className="font-mono text-[13px] text-steel">
                        {formatNumber(industry.national_violations)} violations &middot; {formatCurrency(industry.national_penalties_usd)}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Tier 3 */}
      {tier3.length > 0 && (
        <section className="py-12 px-8 border-t border-brand-white/[0.06]">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-display font-bold text-[18px] text-steel mb-6 tracking-[2px] uppercase">Emerging Markets</h2>
            <div className="flex flex-wrap gap-3">
              {tier3.map((industry) => (
                <span key={industry.slug} className="px-4 py-2 bg-midnight border border-brand-white/[0.06] font-sans text-[13px] text-steel">
                  {industry.display_name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-8 bg-crimson">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="font-display font-black text-[clamp(28px,4vw,40px)] leading-[0.92] text-parchment mb-6">
            27 INDUSTRIES. ONE PLATFORM.
          </h2>
          <p className="font-sans text-[16px] text-parchment/80 mb-8">
            Every business faces unique compliance requirements. Get your free score now.
          </p>
          <Link
            href="/score"
            className="inline-flex items-center justify-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-crimson bg-parchment px-8 py-4 hover:bg-gold transition-colors"
          >
            Get Your Free Score
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
