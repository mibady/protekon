"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShieldWarning, ArrowRight, CurrencyDollar, Buildings, UsersThree } from "@phosphor-icons/react"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"

// OSHA violation data from Cal/OSHA enforcement dataset (business plan Section 4)
const industryData: Record<string, {
  label: string
  violations: number
  employers: number
  totalPenalties: number
  avgPenalty: number
  seriousAvg: number
  topStandard: string
}> = {
  construction: {
    label: "Construction",
    violations: 19089,
    employers: 6081,
    totalPenalties: 43332522,
    avgPenalty: 2270,
    seriousAvg: 7229,
    topStandard: "Fall Protection (8 CCR 1509)",
  },
  manufacturing: {
    label: "Manufacturing",
    violations: 14968,
    employers: 3442,
    totalPenalties: 38913550,
    avgPenalty: 2600,
    seriousAvg: 10592,
    topStandard: "Machine Guarding / LOTO (8 CCR 3314)",
  },
  agriculture: {
    label: "Agriculture",
    violations: 5375,
    employers: 1722,
    totalPenalties: 12597483,
    avgPenalty: 2344,
    seriousAvg: 3961,
    topStandard: "Heat Illness Prevention (8 CCR 3395)",
  },
  hospitality: {
    label: "Hospitality",
    violations: 4950,
    employers: 1409,
    totalPenalties: 5182641,
    avgPenalty: 1047,
    seriousAvg: 3803,
    topStandard: "IIPP General (8 CCR 3203)",
  },
  retail: {
    label: "Retail",
    violations: 3855,
    employers: 1123,
    totalPenalties: 6122880,
    avgPenalty: 1588,
    seriousAvg: 3749,
    topStandard: "IIPP General (8 CCR 3203)",
  },
  healthcare: {
    label: "Healthcare",
    violations: 3024,
    employers: 843,
    totalPenalties: 6776320,
    avgPenalty: 2241,
    seriousAvg: 5619,
    topStandard: "Aerosol Transmissible Diseases (8 CCR 5199)",
  },
  wholesale: {
    label: "Wholesale",
    violations: 2839,
    employers: 839,
    totalPenalties: 6937943,
    avgPenalty: 2444,
    seriousAvg: 8498,
    topStandard: "Machine Guarding / LOTO (8 CCR 3314)",
  },
  transportation: {
    label: "Transportation",
    violations: 1610,
    employers: 562,
    totalPenalties: 5646980,
    avgPenalty: 3507,
    seriousAvg: 4248,
    topStandard: "IIPP Full Suite (8 CCR 3203)",
  },
}

const sizeMultipliers: Record<string, { label: string; factor: number; avgPenalty: number }> = {
  "10-25": { label: "10-25 employees", factor: 0.75, avgPenalty: 1773 },
  "26-50": { label: "26-50 employees", factor: 1.0, avgPenalty: 2333 },
  "51-100": { label: "51-100 employees", factor: 1.25, avgPenalty: 2637 },
  "101-250": { label: "101-250 employees", factor: 1.5, avgPenalty: 3234 },
  "251-500": { label: "251-500 employees", factor: 1.75, avgPenalty: 3980 },
}

export default function CalculatorPage() {
  const [industry, setIndustry] = useState("construction")
  const [size, setSize] = useState("26-50")

  const data = industryData[industry]
  const sizeData = sizeMultipliers[size]

  const results = useMemo(() => {
    const avgViolationsPerEmployer = data.violations / data.employers
    const estimatedViolations = Math.round(avgViolationsPerEmployer * sizeData.factor)
    const estimatedExposure = Math.round(estimatedViolations * sizeData.avgPenalty)
    const seriousExposure = Math.round(data.seriousAvg * Math.max(1, Math.round(estimatedViolations * 0.22)))
    const protekonAnnualCost = size === "10-25" || size === "26-50" ? 597 * 12 : size === "51-100" ? 897 * 12 : 1297 * 12
    const roi = Math.round(seriousExposure / protekonAnnualCost)

    return {
      estimatedViolations,
      estimatedExposure,
      seriousExposure,
      protekonAnnualCost,
      roi,
      breakEvenCitations: Math.ceil(protekonAnnualCost / data.seriousAvg * 10) / 10,
    }
  }, [industry, size, data, sizeData])

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-parchment">
        {/* Hero */}
        <section className="bg-void text-parchment py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="font-display font-semibold text-[12px] tracking-[3px] uppercase text-gold mb-4 block">
                Compliance Risk Calculator
              </span>
              <h1 className="font-display font-black text-[44px] md:text-[52px] leading-[0.95] mb-6">
                What Could a <span className="text-crimson">Cal/OSHA Fine</span>
                <br />Cost Your Business?
              </h1>
              <p className="font-sans text-[16px] text-fog max-w-lg mx-auto leading-relaxed">
                Based on real Cal/OSHA enforcement data across California.
                Select your industry and size to see your estimated exposure.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Calculator */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Inputs (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-brand-white border border-midnight/[0.08] p-6">
                <h2 className="font-display font-bold text-[14px] text-midnight mb-4 uppercase tracking-[1px]">
                  Your Business
                </h2>

                {/* Industry */}
                <div className="mb-5">
                  <label className="font-display font-semibold text-[12px] tracking-[2px] uppercase text-steel block mb-2">
                    Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-parchment border border-midnight/[0.08] px-4 py-3 font-sans text-[14px] text-midnight focus:outline-none focus:border-gold/50 transition-colors appearance-none cursor-pointer"
                  >
                    {Object.entries(industryData).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                {/* Size */}
                <div>
                  <label className="font-display font-semibold text-[12px] tracking-[2px] uppercase text-steel block mb-2">
                    Employee Count
                  </label>
                  <div className="space-y-2">
                    {Object.entries(sizeMultipliers).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setSize(key)}
                        className={`w-full text-left px-4 py-2.5 font-sans text-[13px] transition-colors ${
                          size === key
                            ? "bg-crimson/[0.06] border border-crimson/20 text-midnight font-medium"
                            : "bg-parchment border border-transparent text-steel hover:border-midnight/[0.08]"
                        }`}
                      >
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Industry stats */}
              <div className="bg-brand-white border border-midnight/[0.08] p-6">
                <h3 className="font-display font-bold text-[12px] text-steel uppercase tracking-[1px] mb-4">
                  {data.label} — CA Enforcement Data
                </h3>
                <div className="space-y-3 font-sans text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-steel">Total violations</span>
                    <span className="text-midnight font-semibold">{data.violations.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel">Employers fined</span>
                    <span className="text-midnight font-semibold">{data.employers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel">Total penalties</span>
                    <span className="text-midnight font-semibold">${(data.totalPenalties / 1e6).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel">Avg serious fine</span>
                    <span className="text-crimson font-bold">${data.seriousAvg.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel">Top-cited standard</span>
                    <span className="text-midnight font-semibold text-right text-[12px] max-w-[180px]">{data.topStandard}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results (3 cols) */}
            <motion.div
              key={`${industry}-${size}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3 space-y-6"
            >
              {/* Exposure headline */}
              <div className="bg-crimson/[0.04] border border-crimson/20 p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-crimson/10 flex-shrink-0">
                    <ShieldWarning size={28} weight="fill" className="text-crimson" />
                  </div>
                  <div>
                    <h2 className="font-display font-black text-[28px] text-crimson mb-1">
                      ${results.seriousExposure.toLocaleString()}
                    </h2>
                    <p className="font-sans text-[14px] text-steel">
                      Estimated serious violation exposure for a {sizeData.label.replace(" employees", "-employee")} {data.label.toLowerCase()} business in California
                    </p>
                  </div>
                </div>
              </div>

              {/* Three stat cards */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-brand-white border border-midnight/[0.08] p-6 text-center">
                  <Buildings size={24} className="text-steel mx-auto mb-2" />
                  <div className="font-display font-black text-[24px] text-midnight">
                    {results.estimatedViolations}
                  </div>
                  <p className="font-sans text-[11px] text-steel uppercase tracking-[1px]">
                    Est. Citations
                  </p>
                </div>
                <div className="bg-brand-white border border-midnight/[0.08] p-6 text-center">
                  <CurrencyDollar size={24} className="text-steel mx-auto mb-2" />
                  <div className="font-display font-black text-[24px] text-midnight">
                    ${results.estimatedExposure.toLocaleString()}
                  </div>
                  <p className="font-sans text-[11px] text-steel uppercase tracking-[1px]">
                    Total Exposure
                  </p>
                </div>
                <div className="bg-brand-white border border-midnight/[0.08] p-6 text-center">
                  <UsersThree size={24} className="text-steel mx-auto mb-2" />
                  <div className="font-display font-black text-[24px] text-midnight">
                    ${sizeData.avgPenalty.toLocaleString()}
                  </div>
                  <p className="font-sans text-[11px] text-steel uppercase tracking-[1px]">
                    Avg Per Violation
                  </p>
                </div>
              </div>

              {/* ROI comparison */}
              <div className="bg-midnight text-parchment p-8">
                <h3 className="font-display font-bold text-[14px] uppercase tracking-[1px] text-gold mb-6">
                  Protekon vs. The Fine
                </h3>
                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="font-sans text-[11px] text-fog uppercase tracking-[1px] mb-1">Protekon Annual Cost</p>
                    <p className="font-display font-black text-[32px] text-parchment">
                      ${results.protekonAnnualCost.toLocaleString()}
                      <span className="text-[14px] text-fog font-normal">/yr</span>
                    </p>
                  </div>
                  <div>
                    <p className="font-sans text-[11px] text-fog uppercase tracking-[1px] mb-1">One Serious Violation</p>
                    <p className="font-display font-black text-[32px] text-crimson">
                      ${data.seriousAvg.toLocaleString()}
                      <span className="text-[14px] text-fog font-normal"> per citation</span>
                    </p>
                  </div>
                </div>

                <div className="bg-parchment/[0.08] p-4 mb-6">
                  <p className="font-sans text-[14px] text-fog">
                    <span className="text-gold font-bold">{results.roi}x ROI</span> — One prevented serious violation
                    pays for <span className="text-parchment font-bold">
                      {Math.round(data.seriousAvg / (results.protekonAnnualCost / 12))} months
                    </span> of Protekon service.
                  </p>
                </div>

                <Link
                  href="/signup"
                  className="inline-flex items-center gap-3 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:bg-crimson/90 transition-colors"
                >
                  Start Your Plan
                  <ArrowRight size={16} weight="bold" />
                </Link>
              </div>

              {/* Fine print */}
              <p className="font-sans text-[11px] text-steel/60 leading-relaxed">
                Estimates based on analysis of real Cal/OSHA enforcement data (2020-2026).
                Actual fines vary by inspection findings, employer history, and compliance cooperation.
                Serious violation minimum: $18,000 (Cal/OSHA 2024 schedule). Willful violations
                average $72,988. Data source: Cal/OSHA public enforcement records.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
