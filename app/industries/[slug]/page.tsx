import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { ShieldAlert, ArrowRight, Check } from "lucide-react"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"

const industries: Record<string, {
  label: string
  description: string
  riskLevel: string
  enforcement: string
  topStandards: { code: string; name: string; risk: string }[]
  documents: string[]
  painPoints: string[]
  tierRecommendation: string
  tierPrice: string
}> = {
  construction: {
    label: "Construction",
    description: "CSLB licensing, fall protection, trenching safety, and SB 553 compliance for California contractors and subcontractors.",
    riskLevel: "Very High",
    enforcement: "Highest enforcement rate in California — fall protection and heat illness drive most citations",
    topStandards: [
      { code: "8 CCR 3395(I)", name: "Heat Illness Prevention — Training", risk: "Very High" },
      { code: "8 CCR 1509(A)", name: "Fall Protection — General", risk: "Very High" },
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", risk: "High" },
      { code: "8 CCR 1670(A)", name: "Excavation & Trenching", risk: "High" },
      { code: "8 CCR 1712(C)(1)", name: "Electrical Safety", risk: "High" },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "Fall Protection Plan", "Heat Illness Prevention Plan", "Subcontractor Verification Report"],
    painPoints: ["CSLB license tracking for subs", "Jobsite fall protection documentation", "SB 553 compliance for field crews", "Heat illness prevention for outdoor work"],
    tierRecommendation: "Professional",
    tierPrice: "$897",
  },
  manufacturing: {
    label: "Manufacturing",
    description: "Machine guarding, lockout-tagout, pressure vessels, and Cal/OSHA compliance for California manufacturing operations.",
    riskLevel: "Very High",
    enforcement: "Severe penalties for machine guarding and LOTO violations — among the highest per-violation fines",
    topStandards: [
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", risk: "Very High" },
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", risk: "High" },
      { code: "8 CCR 3314(C)", name: "Machine Guarding / Lockout-Tagout", risk: "Very High" },
      { code: "8 CCR 4002(A)", name: "Pressure Vessels / Permits", risk: "High" },
      { code: "8 CCR 4184(B)", name: "Electrical Safety", risk: "High" },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "LOTO Procedures", "Machine Guarding Assessment", "Hazard Communication Program"],
    painPoints: ["Machine guarding carries some of the highest fines", "Pressure vessel permits", "LOTO procedure documentation", "Employee training records"],
    tierRecommendation: "Multi-Site",
    tierPrice: "$1,297",
  },
  agriculture: {
    label: "Agriculture",
    description: "Heat illness prevention, pesticide safety, and Cal/OSHA compliance for California farms, dairies, and agricultural operations.",
    riskLevel: "High",
    enforcement: "Heat illness violations dominate — shade and water provisions heavily scrutinized",
    topStandards: [
      { code: "8 CCR 3395(I)", name: "Heat Illness Prevention — Training", risk: "Very High" },
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", risk: "High" },
      { code: "8 CCR 3395(C)", name: "Heat Illness — Water Provision", risk: "High" },
      { code: "8 CCR 3395(D)(1)", name: "Heat Illness — Shade Provision", risk: "High" },
      { code: "8 CCR 3395(H)(1)", name: "Heat Illness — High Heat Procedures", risk: "Moderate" },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "Heat Illness Prevention Plan", "Shade & Water Compliance Log", "Pesticide Safety Training Records"],
    painPoints: ["Full heat illness suite is the top enforcement area", "Shade and water provision documentation", "Seasonal worker training records", "Bilingual compliance documents"],
    tierRecommendation: "Core",
    tierPrice: "$597",
  },
  hospitality: {
    label: "Hospitality",
    description: "IIPP documentation, hazard communication, bloodborne pathogens, and SB 553 compliance for hotels, restaurants, and food service.",
    riskLevel: "High",
    enforcement: "IIPP is the dominant citation area — hazard communication and BBP also heavily enforced",
    topStandards: [
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", risk: "Very High" },
      { code: "8 CCR 5194(E)(1)", name: "Hazard Communication (GHS Labels)", risk: "High" },
      { code: "8 CCR 3345(C)", name: "Personal Protective Equipment", risk: "Moderate" },
      { code: "8 CCR 5162(A)", name: "Bloodborne Pathogens — Exposure Plan", risk: "High" },
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", risk: "High" },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "HazCom Program", "BBP Exposure Control Plan", "PPE Assessment"],
    painPoints: ["IIPP is the #1 cited standard by a wide margin", "Hazard communication for cleaning chemicals", "Bloodborne pathogen exposure plans", "Multi-location compliance management"],
    tierRecommendation: "Core",
    tierPrice: "$597",
  },
  retail: {
    label: "Retail",
    description: "IIPP compliance, fire safety, heat illness prevention, and SB 553 workplace violence plans for California retail businesses.",
    riskLevel: "Moderate",
    enforcement: "High inspection volume — IIPP and fire safety are the primary enforcement targets",
    topStandards: [
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", risk: "Very High" },
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", risk: "High" },
      { code: "8 CCR 3395(I)", name: "Heat Illness — Training", risk: "Moderate" },
      { code: "Title 19", name: "Fire Extinguishers / Fire Safety", risk: "Moderate" },
      { code: "8 CCR 3203(A)(4)", name: "IIPP — Incident Investigation", risk: "High" },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "Fire Safety Plan", "Heat Illness Prevention (warehouse)", "Incident Investigation Procedures"],
    painPoints: ["Full IIPP suite is the top compliance gap", "Fire safety for retail locations", "Heat illness for outdoor/warehouse retail", "SB 553 workplace violence for customer-facing staff"],
    tierRecommendation: "Core",
    tierPrice: "$597",
  },
  healthcare: {
    label: "Healthcare",
    description: "Aerosol transmissible disease plans, bloodborne pathogens, HIPAA-adjacent monitoring, and Cal/OSHA compliance for medical practices.",
    riskLevel: "Very High",
    enforcement: "Strictest per-violation penalties — ATD violations carry uniquely high fines",
    topStandards: [
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", risk: "High" },
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", risk: "High" },
      { code: "8 CCR 5199(C)(5)", name: "Aerosol Transmissible Diseases — Exposure Mgmt", risk: "Very High" },
      { code: "8 CCR 5162(A)", name: "Bloodborne Pathogens — Exposure Plan", risk: "High" },
      { code: "8 CCR 5199(C)(3)", name: "ATD — Procedures", risk: "Very High" },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "ATD Exposure Control Plan", "BBP Exposure Control Plan", "PHI Handling Procedures"],
    painPoints: ["ATD violations carry uniquely high penalties", "Bloodborne pathogen exposure plans", "Injury reporting for patient handling", "HIPAA-adjacent compliance monitoring"],
    tierRecommendation: "Professional",
    tierPrice: "$897",
  },
  wholesale: {
    label: "Wholesale",
    description: "Forklift safety, machine guarding, warehouse compliance, and Cal/OSHA standards for distribution and wholesale operations.",
    riskLevel: "High",
    enforcement: "Machine guarding and LOTO violations carry severe penalties",
    topStandards: [
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", risk: "Very High" },
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", risk: "High" },
      { code: "8 CCR 3395(I)", name: "Heat Illness Prevention — Training", risk: "Moderate" },
      { code: "8 CCR 3668(F)", name: "Powered Industrial Trucks — Training", risk: "High" },
      { code: "8 CCR 3314(C)", name: "Machine Guarding / LOTO", risk: "Very High" },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "Forklift Training Program", "LOTO Procedures", "Warehouse Safety Plan"],
    painPoints: ["Machine guarding/LOTO carries severe fines", "Forklift/PIT safety training documentation", "Heat illness for warehouse workers", "Loading dock safety protocols"],
    tierRecommendation: "Professional",
    tierPrice: "$897",
  },
  transportation: {
    label: "Transportation",
    description: "Full IIPP suite compliance, heat illness prevention, fleet safety, and Cal/OSHA standards for California logistics and trucking.",
    riskLevel: "High",
    enforcement: "Full IIPP suite drives the majority of violations — highest per-violation IIPP penalties of any industry",
    topStandards: [
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", risk: "Very High" },
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", risk: "High" },
      { code: "8 CCR 3395(I)", name: "Heat Illness Prevention — Training", risk: "Moderate" },
      { code: "8 CCR 3203(A)(7)", name: "IIPP — Training & Instruction", risk: "High" },
      { code: "8 CCR 3203(A)(4)", name: "IIPP — Incident Investigation", risk: "High" },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "Fleet Safety Program", "Heat Illness Prevention Plan", "Driver Training Records"],
    painPoints: ["Full IIPP suite is the primary enforcement area", "Highest IIPP penalties of any industry", "Heat illness for drivers and dock workers", "Incident investigation documentation"],
    tierRecommendation: "Professional",
    tierPrice: "$897",
  },
  "real-estate": {
    label: "Real Estate",
    description: "Property management, development, and maintenance compliance. Lead paint, habitability, tenant safety, and Cal/OSHA requirements for California real estate operations.",
    riskLevel: "Moderate",
    enforcement: "Growing enforcement — tenant safety and lead paint violations increasing",
    topStandards: [
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", risk: "High" },
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", risk: "High" },
      { code: "8 CCR 1532.1", name: "Lead in Construction", risk: "Very High" },
      { code: "8 CCR 5155", name: "Airborne Contaminants (Asbestos)", risk: "High" },
      { code: "8 CCR 3395(I)", name: "Heat Illness Prevention — Training", risk: "Moderate" },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "Lead Paint Disclosure", "Asbestos Management Plan", "Property Safety Inspection Report"],
    painPoints: ["Lead paint disclosure for pre-1978 properties", "Tenant safety habitability requirements", "Contractor compliance on renovation projects", "Multi-site inspection tracking"],
    tierRecommendation: "Multi-Site",
    tierPrice: "$1,297",
  },
  logistics: {
    label: "Logistics",
    description: "Warehousing, distribution, and supply chain compliance. Forklift safety, ergonomics, and fleet management for California logistics operations.",
    riskLevel: "High",
    enforcement: "Significant penalty exposure — forklift and ergonomic violations dominate",
    topStandards: [
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", risk: "Very High" },
      { code: "8 CCR 3668(F)", name: "Powered Industrial Trucks — Training", risk: "High" },
      { code: "8 CCR 5110", name: "Ergonomic Standards", risk: "High" },
      { code: "8 CCR 3395(I)", name: "Heat Illness Prevention — Training", risk: "High" },
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", risk: "High" },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "Forklift Training Program", "Ergonomic Assessment", "Warehouse Safety Plan"],
    painPoints: ["Forklift certification and training records", "Warehouse heat illness prevention", "Ergonomic injury claims rising in distribution", "Loading dock and racking safety inspections"],
    tierRecommendation: "Professional",
    tierPrice: "$897",
  },
  "auto-services": {
    label: "Auto Services",
    description: "Dealerships, repair shops, and body shops. Hazardous materials handling, spray booth safety, and lift inspection compliance for California auto service businesses.",
    riskLevel: "High",
    enforcement: "Hazmat-driven penalties — spray booth and chemical storage violations carry heavy fines",
    topStandards: [
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", risk: "Very High" },
      { code: "8 CCR 5155", name: "Airborne Contaminants", risk: "High" },
      { code: "8 CCR 5154.1", name: "Ventilation for Spray Booths", risk: "Very High" },
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", risk: "High" },
      { code: "8 CCR 5194", name: "Hazard Communication Program", risk: "High" },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "Hazard Communication Program", "Spray Booth Inspection Log", "Lift Inspection Records"],
    painPoints: ["Spray booth ventilation and maintenance records", "Hazardous waste disposal documentation", "Vehicle lift inspection and certification", "Chemical storage and SDS management"],
    tierRecommendation: "Core",
    tierPrice: "$597",
  },
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
  logistics: "/images/industries/warehouse.jpg",
  "auto-services": "/images/industries/manufacturing.jpg",
  "real-estate": "/images/industries/real-estate.jpg",
}

const slugs = Object.keys(industries)

export function generateStaticParams() {
  return slugs.map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  // Use a sync approach since we have static data
  return params.then(({ slug }) => {
    const data = industries[slug]
    if (!data) return { title: "Industry Not Found | PROTEKON" }
    return {
      title: `${data.label} Compliance | PROTEKON`,
      description: `Cal/OSHA compliance for ${data.label.toLowerCase()} businesses. ${data.riskLevel} risk industry. Managed compliance from ${data.tierPrice}/mo.`,
    }
  })
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = industries[slug]
  if (!data) notFound()

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-parchment">
        {/* Hero */}
        <section className="bg-void text-parchment relative overflow-hidden">
          {/* Background image */}
          {INDUSTRY_IMAGES[slug] && (
            <div className="absolute inset-0">
              <Image
                src={INDUSTRY_IMAGES[slug]}
                alt={`${data.label} industry compliance`}
                fill
                className="object-cover opacity-20"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-void via-void/95 to-void/70" />
            </div>
          )}

          <div className="relative z-10 pt-28 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
              <span className="font-display font-semibold text-[12px] tracking-[3px] uppercase text-gold mb-4 block">
                {data.label} Compliance
              </span>
              <h1 className="font-display font-black text-[44px] md:text-[56px] leading-[0.95] mb-6">
                {data.riskLevel} Risk.
                <br />
                <span className="text-crimson">We Handle It.</span>
              </h1>
              <p className="font-sans text-[16px] text-fog max-w-xl leading-relaxed mb-10">
                {data.description}
              </p>

              {/* Info bar */}
              <div className="bg-midnight/50 border border-brand-white/[0.06] p-6 backdrop-blur-sm">
                <p className="font-sans text-[14px] text-fog leading-relaxed">
                  {data.enforcement}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Top-Cited Standards */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="font-display font-black text-[28px] text-midnight mb-2">
            Top-Cited Cal/OSHA Standards
          </h2>
          <p className="font-sans text-[14px] text-steel mb-8">
            Key Cal/OSHA standards that California {data.label.toLowerCase()} businesses must comply with.
          </p>

          <div className="bg-brand-white border border-midnight/[0.08]">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-midnight/[0.08] bg-parchment">
              <div className="col-span-3 font-display font-semibold text-[9px] tracking-[2px] uppercase text-steel">Code</div>
              <div className="col-span-6 font-display font-semibold text-[9px] tracking-[2px] uppercase text-steel">Standard</div>
              <div className="col-span-3 font-display font-semibold text-[9px] tracking-[2px] uppercase text-steel text-right">Risk Level</div>
            </div>

            {data.topStandards.map((std, i) => (
              <div
                key={std.code}
                className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 ${
                  i < data.topStandards.length - 1 ? "border-b border-midnight/[0.06]" : ""
                }`}
              >
                <div className="col-span-3 font-mono text-[12px] text-crimson font-semibold">{std.code}</div>
                <div className="col-span-6 font-sans text-[13px] text-midnight">{std.name}</div>
                <div className={`col-span-3 font-display font-bold text-[12px] md:text-right ${
                  std.risk === "Very High" ? "text-crimson" :
                  std.risk === "High" ? "text-gold" : "text-steel"
                }`}>{std.risk}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Two columns: Pain Points + Documents We Deliver */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pain Points */}
            <div className="bg-crimson/[0.04] border border-crimson/20 p-8">
              <h3 className="font-display font-bold text-[16px] text-crimson mb-6 uppercase tracking-[1px]">
                Why {data.label} Gets Fined
              </h3>
              <div className="space-y-4">
                {data.painPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <ShieldAlert className="w-4 h-4 text-crimson flex-shrink-0 mt-0.5" />
                    <span className="font-sans text-[13px] text-midnight leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-midnight text-parchment p-8">
              <h3 className="font-display font-bold text-[16px] text-gold mb-6 uppercase tracking-[1px]">
                What Protekon Delivers
              </h3>
              <div className="space-y-4">
                {data.documents.map((doc) => (
                  <div key={doc} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span className="font-sans text-[13px] text-fog">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="bg-brand-white border border-midnight/[0.08] p-10 text-center">
            <h2 className="font-display font-black text-[28px] text-midnight mb-3">
              {data.label} compliance, handled.
            </h2>
            <p className="font-sans text-[15px] text-steel mb-8 max-w-lg mx-auto">
              Protekon {data.tierRecommendation} starts at {data.tierPrice}/month. One prevented citation
              pays for itself many times over.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-3 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-10 py-4 hover:bg-crimson/90 transition-colors"
              >
                Start Your Plan
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center gap-3 border border-midnight/[0.15] text-midnight font-display font-semibold text-[11px] tracking-[3px] uppercase px-10 py-4 hover:border-crimson hover:text-crimson transition-colors"
              >
                Calculate Your Risk
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
