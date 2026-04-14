"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import {
  HardHat, Factory, ForkKnife, Hospital, Buildings, Truck, ShoppingCart, Wrench,
  Tree, Lightning, GraduationCap, Recycle, MusicNotes, Briefcase, Mountains,
  Warehouse, Users, Gear, Globe, TShirt, Shield, UserCircle, Broom,
  ArrowRight, Warning, CaretRight, MagnifyingGlass,
} from "@phosphor-icons/react"

type IconComponent = typeof HardHat

const ICON_MAP: Record<string, IconComponent> = {
  construction: HardHat,
  manufacturing: Factory,
  hospitality: ForkKnife,
  healthcare: Hospital,
  real_estate: Buildings,
  "real-estate": Buildings,
  transportation: Truck,
  retail: ShoppingCart,
  automotive: Wrench,
  "auto-services": Wrench,
  agriculture: Tree,
  utilities: Lightning,
  education: GraduationCap,
  waste_environmental: Recycle,
  arts_entertainment: MusicNotes,
  professional_services: Briefcase,
  mining: Mountains,
  warehouse: Warehouse,
  logistics: Warehouse,
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

interface Industry {
  slug: string
  label: string
  risk: "Very High" | "High" | "Moderate"
  image?: string
  enforcement: string
  topCitation: string
  hasDetailPage: boolean
}

const FEATURED: Industry[] = [
  { slug: "construction", label: "Construction", risk: "Very High", image: "/images/industries/construction.jpg", enforcement: "Highest total penalty exposure of any industry. Fall protection and heat illness drive most citations.", topCitation: "Fall Protection (29 CFR 1926.501)", hasDetailPage: true },
  { slug: "manufacturing", label: "Manufacturing", risk: "Very High", image: "/images/industries/manufacturing.jpg", enforcement: "Machine guarding and LOTO account for 60% of manufacturing fines. Among the highest per-violation penalties.", topCitation: "Machine Guarding (8 CCR §4001–4005)", hasDetailPage: true },
  { slug: "healthcare", label: "Healthcare", risk: "Very High", image: "/images/industries/healthcare.jpg", enforcement: "Strictest per-violation penalties. ATD and bloodborne pathogen violations carry uniquely high fines.", topCitation: "Aerosol Transmissible Diseases (8 CCR §5199)", hasDetailPage: true },
  { slug: "hospitality", label: "Hospitality", risk: "High", image: "/images/industries/hospitality.jpg", enforcement: "IIPP is the dominant citation — hazard communication and bloodborne pathogens heavily enforced.", topCitation: "IIPP General Requirement (8 CCR §3203)", hasDetailPage: true },
  { slug: "logistics", label: "Warehouse & Logistics", risk: "High", image: "/images/industries/warehouse.jpg", enforcement: "Forklift violations are the #2 most-cited OSHA violation nationwide for warehouses.", topCitation: "Powered Industrial Trucks (8 CCR §3668)", hasDetailPage: true },
  { slug: "agriculture", label: "Agriculture", risk: "High", image: "/images/industries/agriculture.jpg", enforcement: "California's strictest-in-the-nation heat illness standard. Shade and water provisions heavily scrutinized.", topCitation: "Heat Illness Prevention (8 CCR §3395)", hasDetailPage: true },
  { slug: "retail", label: "Retail", risk: "Moderate", image: "/images/industries/retail.jpg", enforcement: "High inspection volume. IIPP and fire safety are the primary enforcement targets.", topCitation: "IIPP General Requirement (8 CCR §3203)", hasDetailPage: true },
  { slug: "transportation", label: "Transportation", risk: "High", image: "/images/industries/transportation.jpg", enforcement: "DOT + Cal/OSHA dual enforcement. Highest per-violation IIPP penalties of any industry.", topCitation: "IIPP General Requirement (8 CCR §3203)", hasDetailPage: true },
  { slug: "real-estate", label: "Real Estate", risk: "Moderate", image: "/images/industries/real-estate.jpg", enforcement: "Municipal ordinance complexity across California cities. Habitability and rent control vary by jurisdiction.", topCitation: "Habitability Standards (Civil Code §1941)", hasDetailPage: true },
  { slug: "auto-services", label: "Automotive Services", risk: "High", enforcement: "92% of fined employers are small businesses. Spray booth and hazmat storage violations are the primary targets.", topCitation: "Spray Booth Ventilation (29 CFR 1910.94)", hasDetailPage: true },
  { slug: "wholesale", label: "Wholesale Trade", risk: "High", enforcement: "Machine guarding and LOTO violations carry severe penalties. Forklift safety is the secondary target.", topCitation: "Machine Guarding / LOTO (8 CCR §3314)", hasDetailPage: true },
]

const ALL_OTHERS: Industry[] = [
  { slug: "utilities", label: "Utilities", risk: "High", enforcement: "Electrical hazards and confined space entry.", topCitation: "Electrical Safety (8 CCR §2320)", hasDetailPage: false },
  { slug: "education", label: "Education", risk: "Moderate", enforcement: "IIPP and emergency action plan compliance.", topCitation: "IIPP (8 CCR §3203)", hasDetailPage: false },
  { slug: "waste_environmental", label: "Waste & Environmental", risk: "Very High", enforcement: "Hazardous waste handling and respiratory protection.", topCitation: "Respiratory Protection (8 CCR §5144)", hasDetailPage: false },
  { slug: "arts_entertainment", label: "Arts & Entertainment", risk: "Moderate", enforcement: "Event safety plans and crowd management.", topCitation: "IIPP (8 CCR §3203)", hasDetailPage: false },
  { slug: "public_admin", label: "Public Administration", risk: "Moderate", enforcement: "IIPP and workplace violence prevention.", topCitation: "IIPP (8 CCR §3203)", hasDetailPage: false },
  { slug: "building_services", label: "Building Services", risk: "Moderate", enforcement: "Chemical exposure and fall protection for maintenance.", topCitation: "HazCom (8 CCR §5194)", hasDetailPage: false },
  { slug: "equipment_repair", label: "Equipment Repair", risk: "High", enforcement: "LOTO and electrical safety enforcement.", topCitation: "LOTO (29 CFR 1910.147)", hasDetailPage: false },
  { slug: "facilities_mgmt", label: "Facilities Management", risk: "Moderate", enforcement: "Multi-site compliance and contractor oversight.", topCitation: "IIPP (8 CCR §3203)", hasDetailPage: false },
  { slug: "information", label: "Information & Telecom", risk: "Moderate", enforcement: "Ergonomic and electrical safety.", topCitation: "Ergonomics (8 CCR §5110)", hasDetailPage: false },
  { slug: "laundry", label: "Laundry & Drycleaning", risk: "High", enforcement: "Chemical exposure from solvents and steam.", topCitation: "HazCom (8 CCR §5194)", hasDetailPage: false },
  { slug: "mining", label: "Mining", risk: "Very High", enforcement: "MSHA + Cal/OSHA dual enforcement.", topCitation: "MSHA Standards (30 CFR)", hasDetailPage: false },
  { slug: "professional_services", label: "Professional Services", risk: "Moderate", enforcement: "Workplace violence prevention and ergonomics.", topCitation: "SB 553 WVPP", hasDetailPage: false },
  { slug: "staffing", label: "Staffing & Employment", risk: "High", enforcement: "Joint-employer liability for temp workers.", topCitation: "Multi-Employer Policy", hasDetailPage: false },
  { slug: "business_support", label: "Business Support Services", risk: "Moderate", enforcement: "IIPP and workplace safety fundamentals.", topCitation: "IIPP (8 CCR §3203)", hasDetailPage: false },
  { slug: "personal_services", label: "Personal Services", risk: "Moderate", enforcement: "Platform-wide compliance coverage.", topCitation: "IIPP (8 CCR §3203)", hasDetailPage: false },
  { slug: "security", label: "Security Services", risk: "Moderate", enforcement: "SB 553 workplace violence focus.", topCitation: "SB 553 WVPP", hasDetailPage: false },
]

const RISK_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  "Very High": { text: "text-crimson", bg: "bg-crimson/10", border: "border-crimson/30" },
  "High": { text: "text-gold", bg: "bg-gold/10", border: "border-gold/30" },
  "Moderate": { text: "text-steel", bg: "bg-steel/10", border: "border-steel/30" },
}

export default function IndustriesClient() {
  const [search, setSearch] = useState("")
  const query = search.toLowerCase().trim()

  const filteredFeatured = useMemo(
    () => (query ? FEATURED.filter((i) => i.label.toLowerCase().includes(query)) : FEATURED),
    [query]
  )
  const filteredOthers = useMemo(
    () => (query ? ALL_OTHERS.filter((i) => i.label.toLowerCase().includes(query)) : ALL_OTHERS),
    [query]
  )
  const totalResults = filteredFeatured.length + filteredOthers.length

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-12 px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="font-display font-medium text-[12px] tracking-[4px] uppercase text-crimson mb-4 block">
              Find Your Industry
            </span>
            <h1 className="font-display font-black text-[clamp(36px,5.5vw,58px)] leading-[0.92] text-parchment mt-4 mb-6 max-w-[800px]">
              YOUR INDUSTRY HAS SPECIFIC RISKS.{" "}
              <span className="text-gold">PROTEKON KNOWS EVERY ONE.</span>
            </h1>
            <p className="font-sans text-[16px] text-steel max-w-[580px] leading-relaxed mb-10">
              Every vertical faces different enforcement patterns, citation triggers, and
              regulatory requirements. Protekon builds your compliance program around the
              specific standards that apply to your business.
            </p>
          </motion.div>

          {/* Search */}
          <div className="relative max-w-[480px]">
            <MagnifyingGlass size={18} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-steel" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search industries..."
              className="w-full bg-midnight border border-brand-white/[0.08] text-parchment font-sans text-[14px] pl-11 pr-4 py-3.5 placeholder:text-steel/50 focus:outline-none focus:border-gold/40 transition-colors"
            />
            {query && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[12px] text-steel/50">
                {totalResults} {totalResults === 1 ? "result" : "results"}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Featured */}
      {filteredFeatured.length > 0 && (
        <section className="py-12 px-6 lg:px-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid md:grid-cols-2 gap-4">
              {filteredFeatured.map((industry, i) => {
                const Icon = ICON_MAP[industry.slug] ?? Briefcase
                const risk = RISK_COLORS[industry.risk]
                return (
                  <motion.div key={industry.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.03 }}>
                    <Link
                      href={`/industries/${industry.slug}`}
                      className="group block relative bg-midnight border border-brand-white/[0.06] overflow-hidden hover:border-gold/30 transition-all duration-300"
                    >
                      {industry.image && (
                        <div className="absolute inset-0">
                          <Image src={industry.image} alt={industry.label} fill className="object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/95 to-midnight/70" />
                        </div>
                      )}

                      <div className="relative z-10 p-6 lg:p-8">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-gold/10">
                              <Icon size={20} weight="bold" className="text-gold" />
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-[17px] text-parchment group-hover:text-gold transition-colors">
                                {industry.label}
                              </h3>
                              <span className={`font-display text-[10px] tracking-[2px] uppercase ${risk.text}`}>
                                {industry.risk} Risk
                              </span>
                            </div>
                          </div>
                          <div className={`px-3 py-1 ${risk.bg} border ${risk.border}`}>
                            <Warning size={12} weight="fill" className={risk.text} />
                          </div>
                        </div>

                        <p className="font-sans text-[13px] text-fog/80 leading-[1.6] mb-4">
                          {industry.enforcement}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-brand-white/[0.04]">
                          <span className="font-mono text-[11px] text-steel">
                            Top: {industry.topCitation}
                          </span>
                          <span className="font-display text-[10px] tracking-[2px] uppercase text-gold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            View Details
                            <CaretRight size={10} weight="bold" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* All Others */}
      {filteredOthers.length > 0 && (
        <section className="py-12 px-6 lg:px-8 border-t border-brand-white/[0.06]">
          <div className="max-w-[1200px] mx-auto">
            {!query && (
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-[2px] bg-steel/40" />
                <h2 className="font-display font-bold text-[16px] text-steel tracking-[3px] uppercase">
                  More Industries
                </h2>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredOthers.map((industry, i) => {
                const Icon = ICON_MAP[industry.slug] ?? Briefcase
                const risk = RISK_COLORS[industry.risk]
                return (
                  <motion.div key={industry.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.03 }}>
                    <Link href="/score" className="group block bg-midnight border border-brand-white/[0.06] p-5 hover:border-gold/20 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon size={18} weight="bold" className="text-steel group-hover:text-gold transition-colors" />
                        <h3 className="font-display font-bold text-[14px] text-parchment">
                          {industry.label}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`font-display text-[9px] tracking-[2px] uppercase ${risk.text}`}>
                          {industry.risk} Risk
                        </span>
                        <span className="font-display text-[9px] tracking-[1px] text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                          SCORE →
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* No results */}
      {query && totalResults === 0 && (
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-[600px] mx-auto text-center">
            <p className="font-sans text-[16px] text-steel mb-4">
              No industries match &ldquo;{search}&rdquo;
            </p>
            <p className="font-sans text-[14px] text-steel/60 mb-6">
              Protekon covers 27 verticals. If you don&apos;t see yours, the platform-wide
              compliance programs still apply to your business.
            </p>
            <Link href="/score" className="inline-flex items-center gap-2 font-display font-semibold text-[11px] tracking-[3px] uppercase text-gold hover:text-parchment transition-colors">
              Get Your Compliance Score
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </section>
      )}

      {/* Platform-wide */}
      {!query && (
        <section className="py-16 px-6 lg:px-8 border-t border-brand-white/[0.06]">
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-midnight border border-brand-white/[0.06] p-8 lg:p-12">
              <span className="font-display text-[10px] tracking-[3px] uppercase text-crimson mb-4 block">
                Every Industry Includes
              </span>
              <h2 className="font-display font-black text-[clamp(24px,3.5vw,36px)] leading-[0.95] text-parchment mb-8">
                8 PLATFORM-WIDE COMPLIANCE PROGRAMS
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  "IIPP (8 CCR §3203)",
                  "SB 553 WVPP",
                  "Heat Illness Prevention",
                  "Hazard Communication",
                  "OSHA 300 Log",
                  "Emergency Action Plan",
                  "Incident Investigation",
                  "Training Records",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 py-3 border-b border-brand-white/[0.04]">
                    <div className="w-1.5 h-1.5 bg-gold flex-shrink-0" />
                    <span className="font-sans text-[13px] text-fog">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-6 lg:px-8 bg-crimson">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="font-display font-black text-[clamp(28px,4vw,40px)] leading-[0.92] text-parchment mb-6">
            A CITATION COSTS MORE THAN COMPLIANCE.
          </h2>
          <p className="font-sans text-[16px] text-parchment/80 mb-8">
            Find out where your gaps are before an inspector does.
          </p>
          <Link href="/score" className="inline-flex items-center justify-center gap-3 font-display font-semibold text-[11px] tracking-[3px] uppercase text-crimson bg-parchment px-8 py-4 hover:bg-gold transition-colors">
            Get Your Compliance Score
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      </section>
    </>
  )
}
