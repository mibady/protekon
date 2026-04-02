import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ShieldAlert, ArrowRight, Check, Building2, DollarSign, Users } from "lucide-react"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"

const industries: Record<string, {
  label: string
  description: string
  violations: number
  employers: number
  totalPenalties: number
  avgPenalty: number
  seriousAvg: number
  targetEmployers: number
  targetPenalties: number
  topStandards: { code: string; name: string; citations: number; avgFine: number }[]
  documents: string[]
  painPoints: string[]
  tierRecommendation: string
  tierPrice: string
}> = {
  construction: {
    label: "Construction",
    description: "CSLB licensing, fall protection, trenching safety, and SB 553 compliance for California contractors and subcontractors.",
    violations: 19089,
    employers: 6081,
    totalPenalties: 43332522,
    avgPenalty: 2270,
    seriousAvg: 7229,
    targetEmployers: 3070,
    targetPenalties: 24033487,
    topStandards: [
      { code: "8 CCR 3395(I)", name: "Heat Illness Prevention — Training", citations: 1953, avgFine: 319 },
      { code: "8 CCR 1509(A)", name: "Fall Protection — General", citations: 1776, avgFine: 1252 },
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", citations: 844, avgFine: 3629 },
      { code: "8 CCR 1670(A)", name: "Excavation & Trenching", citations: 452, avgFine: 5281 },
      { code: "8 CCR 1712(C)(1)", name: "Electrical Safety", citations: 421, avgFine: 3698 },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "Fall Protection Plan", "Heat Illness Prevention Plan", "Subcontractor Verification Report"],
    painPoints: ["CSLB license tracking for subs", "Jobsite fall protection documentation", "SB 553 compliance for field crews", "Heat illness prevention for outdoor work"],
    tierRecommendation: "Professional",
    tierPrice: "$897",
  },
  manufacturing: {
    label: "Manufacturing",
    description: "Machine guarding, lockout-tagout, pressure vessels, and Cal/OSHA compliance for California manufacturing operations.",
    violations: 14968,
    employers: 3442,
    totalPenalties: 38913550,
    avgPenalty: 2600,
    seriousAvg: 10592,
    targetEmployers: 2560,
    targetPenalties: 30408070,
    topStandards: [
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", citations: 875, avgFine: 1086 },
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", citations: 468, avgFine: 3928 },
      { code: "8 CCR 3314(C)", name: "Machine Guarding / Lockout-Tagout", citations: 360, avgFine: 10592 },
      { code: "8 CCR 4002(A)", name: "Pressure Vessels / Permits", citations: 245, avgFine: 6577 },
      { code: "8 CCR 4184(B)", name: "Electrical Safety", citations: 189, avgFine: 6397 },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "LOTO Procedures", "Machine Guarding Assessment", "Hazard Communication Program"],
    painPoints: ["Machine guarding violations averaging $10,592", "Pressure vessel permits", "LOTO procedure documentation", "Employee training records"],
    tierRecommendation: "Multi-Site",
    tierPrice: "$1,297",
  },
  agriculture: {
    label: "Agriculture",
    description: "Heat illness prevention, pesticide safety, and Cal/OSHA compliance for California farms, dairies, and agricultural operations.",
    violations: 5375,
    employers: 1722,
    totalPenalties: 12597483,
    avgPenalty: 2344,
    seriousAvg: 3961,
    targetEmployers: 1254,
    targetPenalties: 8987275,
    topStandards: [
      { code: "8 CCR 3395(I)", name: "Heat Illness Prevention — Training", citations: 424, avgFine: 352 },
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", citations: 304, avgFine: 1212 },
      { code: "8 CCR 3395(C)", name: "Heat Illness — Water Provision", citations: 169, avgFine: 2176 },
      { code: "8 CCR 3395(D)(1)", name: "Heat Illness — Shade Provision", citations: 131, avgFine: 3961 },
      { code: "8 CCR 3395(H)(1)", name: "Heat Illness — High Heat Procedures", citations: 83, avgFine: 2191 },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "Heat Illness Prevention Plan", "Shade & Water Compliance Log", "Pesticide Safety Training Records"],
    painPoints: ["Full heat illness suite (807 citations, 15% of all ag violations)", "Shade and water provision documentation", "Seasonal worker training records", "Bilingual compliance documents"],
    tierRecommendation: "Core",
    tierPrice: "$597",
  },
  hospitality: {
    label: "Hospitality",
    description: "IIPP documentation, hazard communication, bloodborne pathogens, and SB 553 compliance for hotels, restaurants, and food service.",
    violations: 4950,
    employers: 1409,
    totalPenalties: 5182641,
    avgPenalty: 1047,
    seriousAvg: 3803,
    targetEmployers: 821,
    targetPenalties: 3677594,
    topStandards: [
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", citations: 686, avgFine: 667 },
      { code: "8 CCR 5194(E)(1)", name: "Hazard Communication (GHS Labels)", citations: 227, avgFine: 232 },
      { code: "8 CCR 3345(C)", name: "Personal Protective Equipment", citations: 151, avgFine: 229 },
      { code: "8 CCR 5162(A)", name: "Bloodborne Pathogens — Exposure Plan", citations: 128, avgFine: 1445 },
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", citations: 107, avgFine: 3803 },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "HazCom Program", "BBP Exposure Control Plan", "PPE Assessment"],
    painPoints: ["IIPP is #1 citation by huge margin (686 citations)", "Hazard communication for cleaning chemicals", "Bloodborne pathogen exposure plans", "Multi-location compliance management"],
    tierRecommendation: "Core",
    tierPrice: "$597",
  },
  retail: {
    label: "Retail",
    description: "IIPP compliance, fire safety, heat illness prevention, and SB 553 workplace violence plans for California retail businesses.",
    violations: 3855,
    employers: 1123,
    totalPenalties: 6122880,
    avgPenalty: 1588,
    seriousAvg: 3749,
    targetEmployers: 833,
    targetPenalties: 4950582,
    topStandards: [
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", citations: 377, avgFine: 1197 },
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", citations: 183, avgFine: 3749 },
      { code: "8 CCR 3395(I)", name: "Heat Illness — Training", citations: 90, avgFine: 389 },
      { code: "Title 19", name: "Fire Extinguishers / Fire Safety", citations: 79, avgFine: 325 },
      { code: "8 CCR 3203(A)(4)", name: "IIPP — Incident Investigation", citations: 52, avgFine: 1275 },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "Fire Safety Plan", "Heat Illness Prevention (warehouse)", "Incident Investigation Procedures"],
    painPoints: ["Full IIPP suite (480 combined citations)", "Fire safety for retail locations", "Heat illness for outdoor/warehouse retail", "SB 553 workplace violence for customer-facing staff"],
    tierRecommendation: "Core",
    tierPrice: "$597",
  },
  healthcare: {
    label: "Healthcare",
    description: "Aerosol transmissible disease plans, bloodborne pathogens, HIPAA-adjacent monitoring, and Cal/OSHA compliance for medical practices.",
    violations: 3024,
    employers: 843,
    totalPenalties: 6776320,
    avgPenalty: 2241,
    seriousAvg: 5619,
    targetEmployers: 640,
    targetPenalties: 4698449,
    topStandards: [
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", citations: 207, avgFine: 4017 },
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", citations: 191, avgFine: 1343 },
      { code: "8 CCR 5199(C)(5)", name: "Aerosol Transmissible Diseases — Exposure Mgmt", citations: 63, avgFine: 5619 },
      { code: "8 CCR 5162(A)", name: "Bloodborne Pathogens — Exposure Plan", citations: 68, avgFine: 2028 },
      { code: "8 CCR 5199(C)(3)", name: "ATD — Procedures", citations: 62, avgFine: 3851 },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "ATD Exposure Control Plan", "BBP Exposure Control Plan", "PHI Handling Procedures"],
    painPoints: ["ATD violations average $5,619 — unique to healthcare", "Bloodborne pathogen exposure plans", "Injury reporting for patient handling", "HIPAA-adjacent compliance monitoring"],
    tierRecommendation: "Professional",
    tierPrice: "$897",
  },
  wholesale: {
    label: "Wholesale",
    description: "Forklift safety, machine guarding, warehouse compliance, and Cal/OSHA standards for distribution and wholesale operations.",
    violations: 2839,
    employers: 839,
    totalPenalties: 6937943,
    avgPenalty: 2444,
    seriousAvg: 8498,
    targetEmployers: 603,
    targetPenalties: 5392348,
    topStandards: [
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", citations: 231, avgFine: 1324 },
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", citations: 149, avgFine: 3809 },
      { code: "8 CCR 3395(I)", name: "Heat Illness Prevention — Training", citations: 104, avgFine: 323 },
      { code: "8 CCR 3668(F)", name: "Powered Industrial Trucks — Training", citations: 57, avgFine: 426 },
      { code: "8 CCR 3314(C)", name: "Machine Guarding / LOTO", citations: 45, avgFine: 8498 },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "Forklift Training Program", "LOTO Procedures", "Warehouse Safety Plan"],
    painPoints: ["Machine guarding/LOTO fines averaging $8,498", "Forklift/PIT safety training documentation", "Heat illness for warehouse workers", "Loading dock safety protocols"],
    tierRecommendation: "Professional",
    tierPrice: "$897",
  },
  transportation: {
    label: "Transportation",
    description: "Full IIPP suite compliance, heat illness prevention, fleet safety, and Cal/OSHA standards for California logistics and trucking.",
    violations: 1610,
    employers: 562,
    totalPenalties: 5646980,
    avgPenalty: 3507,
    seriousAvg: 4248,
    targetEmployers: 395,
    targetPenalties: 3574456,
    topStandards: [
      { code: "8 CCR 3203(A)", name: "IIPP — General Requirement", citations: 188, avgFine: 2906 },
      { code: "8 CCR 342(A)", name: "Serious Injury Reporting", citations: 150, avgFine: 4248 },
      { code: "8 CCR 3395(I)", name: "Heat Illness Prevention — Training", citations: 86, avgFine: 732 },
      { code: "8 CCR 3203(A)(7)", name: "IIPP — Training & Instruction", citations: 35, avgFine: 3900 },
      { code: "8 CCR 3203(A)(4)", name: "IIPP — Incident Investigation", citations: 25, avgFine: 5125 },
    ],
    documents: ["IIPP (8 CCR 3203)", "SB 553 WVPP", "Fleet Safety Program", "Heat Illness Prevention Plan", "Driver Training Records"],
    painPoints: ["Full IIPP suite = 286 citations (18% of all transportation violations)", "Highest IIPP avg penalties of any industry", "Heat illness for drivers and dock workers", "Incident investigation documentation"],
    tierRecommendation: "Professional",
    tierPrice: "$897",
  },
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
      description: `Cal/OSHA compliance for ${data.label.toLowerCase()} businesses. ${data.violations.toLocaleString()} violations, $${(data.totalPenalties / 1e6).toFixed(1)}M in penalties. Managed compliance from $${data.tierPrice}/mo.`,
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
        <section className="bg-void text-parchment pt-28 pb-20 px-6">
          <div className="max-w-5xl mx-auto">
            <span className="font-display font-semibold text-[10px] tracking-[3px] uppercase text-gold mb-4 block">
              {data.label} Compliance
            </span>
            <h1 className="font-display font-black text-[44px] md:text-[56px] leading-[0.95] mb-6">
              {data.violations.toLocaleString()} Violations.
              <br />
              <span className="text-crimson">${(data.totalPenalties / 1e6).toFixed(1)}M in Fines.</span>
            </h1>
            <p className="font-sans text-[16px] text-fog max-w-xl leading-relaxed mb-10">
              {data.description}
            </p>

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Building2, label: "Employers Fined", value: data.employers.toLocaleString() },
                { icon: DollarSign, label: "Avg Serious Fine", value: `$${data.seriousAvg.toLocaleString()}` },
                { icon: Users, label: "Target Market (10-500)", value: data.targetEmployers.toLocaleString() },
                { icon: ShieldAlert, label: "Target Penalties", value: `$${(data.targetPenalties / 1e6).toFixed(1)}M` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-midnight/50 border border-brand-white/[0.06] p-4">
                  <Icon className="w-5 h-5 text-gold mb-2" />
                  <div className="font-display font-black text-[20px] text-parchment">{value}</div>
                  <div className="font-sans text-[10px] text-steel uppercase tracking-[1px]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Top-Cited Standards */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="font-display font-black text-[28px] text-midnight mb-2">
            Top-Cited Cal/OSHA Standards
          </h2>
          <p className="font-sans text-[14px] text-steel mb-8">
            The most frequently cited violations in California {data.label.toLowerCase()}, from our 73,960-record enforcement dataset.
          </p>

          <div className="bg-brand-white border border-midnight/[0.08]">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-midnight/[0.08] bg-parchment">
              <div className="col-span-2 font-display font-semibold text-[9px] tracking-[2px] uppercase text-steel">Code</div>
              <div className="col-span-5 font-display font-semibold text-[9px] tracking-[2px] uppercase text-steel">Standard</div>
              <div className="col-span-2 font-display font-semibold text-[9px] tracking-[2px] uppercase text-steel text-right">Citations</div>
              <div className="col-span-3 font-display font-semibold text-[9px] tracking-[2px] uppercase text-steel text-right">Avg Fine</div>
            </div>

            {data.topStandards.map((std, i) => (
              <div
                key={std.code}
                className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 ${
                  i < data.topStandards.length - 1 ? "border-b border-midnight/[0.06]" : ""
                }`}
              >
                <div className="col-span-2 font-mono text-[12px] text-crimson font-semibold">{std.code}</div>
                <div className="col-span-5 font-sans text-[13px] text-midnight">{std.name}</div>
                <div className="col-span-2 font-display font-bold text-[14px] text-midnight md:text-right">{std.citations.toLocaleString()}</div>
                <div className="col-span-3 font-display font-bold text-[14px] text-crimson md:text-right">${std.avgFine.toLocaleString()}</div>
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
              A serious {data.label.toLowerCase()} violation costs ${data.seriousAvg.toLocaleString()}.
            </h2>
            <p className="font-sans text-[15px] text-steel mb-8 max-w-lg mx-auto">
              Protekon {data.tierRecommendation} costs {data.tierPrice}/month. One prevented citation pays for
              {" "}{Math.round(data.seriousAvg / (parseInt(data.tierPrice.replace("$", "")) ))} months of service.
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
