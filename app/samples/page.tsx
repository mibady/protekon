"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { EnvelopeSimple, FileText, ShieldCheck, ArrowRight, Check, Download, Lock } from "@phosphor-icons/react"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import { submitSampleGate } from "@/lib/actions/samples"

const sampleReports = [
  {
    title: "SB 553 Workplace Violence Prevention Plan",
    pages: 22,
    badge: "Most Downloaded",
    description:
      "Complete WVPP template meeting all SB 553 requirements. Includes hazard assessment, reporting procedures, training protocols, and incident response framework.",
    features: [
      "Cal/OSHA Title 8 compliant",
      "Hazard identification checklist",
      "Employee reporting procedures",
      "Training documentation templates",
    ],
  },
  {
    title: "Construction Subcontractor Compliance Report",
    pages: 4,
    badge: null,
    description:
      "Subcontractor verification report covering CSLB license status, insurance verification, and lien waiver compliance tracking.",
    features: [
      "CSLB license verification",
      "Insurance certificate tracking",
      "Pay/No-Pay lien status",
      "Compliance score per sub",
    ],
  },
  {
    title: "Property Management Municipal Compliance Pulse",
    pages: 6,
    badge: null,
    description:
      "Monthly municipal ordinance monitoring report covering rent control changes, habitability requirements, and local code updates.",
    features: [
      "Municipal ordinance tracking",
      "Rent control compliance",
      "Habitability requirements",
      "Local code change alerts",
    ],
  },
]

export default function SamplesPage() {
  const [email, setEmail] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [gateUnlocked, setGateUnlocked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGateSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.set("email", email)
    formData.set("companyName", companyName)

    const result = await submitSampleGate(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setGateUnlocked(true)
    }
    setSubmitting(false)
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-parchment">
        {/* Hero */}
        <section className="bg-void text-parchment py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="font-display font-semibold text-[10px] tracking-[3px] uppercase text-gold mb-4 block">
                Sample Reports
              </span>
              <h1 className="font-display font-black text-[48px] md:text-[56px] leading-[0.95] mb-6">
                See What You Get.
                <br />
                <span className="text-crimson">Before You Pay.</span>
              </h1>
              <p className="font-sans text-[16px] text-fog max-w-lg mx-auto leading-relaxed">
                Enter your email to unlock 3 sample compliance documents.
                No credit card. No sales call. Just the actual deliverables.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Email Gate */}
        {!gateUnlocked && (
          <section className="px-6 -mt-8">
            <motion.form
              onSubmit={handleGateSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto bg-brand-white border border-midnight/[0.08] p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center bg-crimson/10">
                  <Lock size={20} weight="fill" className="text-crimson" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-[16px] text-midnight">
                    Unlock Sample Reports
                  </h2>
                  <p className="font-sans text-[13px] text-steel">
                    Enter your work email to access all 3 samples instantly.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-parchment border border-midnight/[0.08] px-4 py-3.5 font-sans text-[15px] text-midnight placeholder:text-steel/50 focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
                <div className="flex-1 sm:flex-initial">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company name (optional)"
                    className="w-full bg-parchment border border-midnight/[0.08] px-4 py-3.5 font-sans text-[15px] text-midnight placeholder:text-steel/50 focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  className="bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-8 py-3.5 flex items-center justify-center gap-2 hover:bg-crimson/90 transition-colors disabled:opacity-70"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />
                  ) : (
                    <>
                      Unlock
                      <ArrowRight size={14} weight="bold" />
                    </>
                  )}
                </motion.button>
              </div>

              {error && (
                <p className="mt-3 font-sans text-[13px] text-crimson">{error}</p>
              )}
            </motion.form>
          </section>
        )}

        {/* Success Banner */}
        {gateUnlocked && (
          <section className="px-6 -mt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto bg-emerald-600/5 border border-emerald-600/20 p-6 flex items-center gap-4"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-emerald-600/10">
                <ShieldCheck size={20} weight="fill" className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-display font-bold text-[14px] text-midnight">
                  Samples Unlocked
                </h3>
                <p className="font-sans text-[13px] text-steel">
                  Download any of the 3 sample reports below. A copy has also been sent to {email}.
                </p>
              </div>
            </motion.div>
          </section>
        )}

        {/* Sample Report Cards */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {sampleReports.map((report, i) => (
              <motion.div
                key={report.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-brand-white border border-midnight/[0.08] flex flex-col"
              >
                {/* Preview mockup */}
                <div className="relative h-48 bg-midnight/[0.03] border-b border-midnight/[0.08] flex items-center justify-center overflow-hidden">
                  <div className={`absolute inset-4 bg-brand-white border border-ash ${!gateUnlocked ? "blur-[3px]" : ""}`}>
                    <div className="p-4 space-y-2">
                      <div className="w-24 h-2 bg-crimson/20" />
                      <div className="w-full h-1.5 bg-midnight/[0.06]" />
                      <div className="w-full h-1.5 bg-midnight/[0.06]" />
                      <div className="w-3/4 h-1.5 bg-midnight/[0.06]" />
                      <div className="w-16 h-1.5 bg-gold/30 mt-3" />
                      <div className="w-full h-1.5 bg-midnight/[0.06]" />
                      <div className="w-full h-1.5 bg-midnight/[0.06]" />
                    </div>
                  </div>
                  {!gateUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock size={32} weight="fill" className="text-steel/40" />
                    </div>
                  )}
                  {report.badge && (
                    <span className="absolute top-3 right-3 bg-crimson text-parchment font-display font-bold text-[8px] tracking-[1px] uppercase px-2.5 py-1">
                      {report.badge}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <FileText size={20} weight="fill" className="text-crimson flex-shrink-0 mt-0.5" />
                    <h3 className="font-display font-bold text-[15px] text-midnight leading-snug">
                      {report.title}
                    </h3>
                  </div>

                  <span className="font-mono text-[11px] text-steel mb-3">
                    {report.pages} pages
                  </span>

                  <p className="font-sans text-[13px] text-steel leading-relaxed mb-4">
                    {report.description}
                  </p>

                  <div className="space-y-2 mb-6 flex-1">
                    {report.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Check size={12} weight="bold" className="text-emerald-600 flex-shrink-0" />
                        <span className="font-sans text-[12px] text-steel">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {gateUnlocked ? (
                    <button className="w-full bg-midnight text-parchment font-display font-semibold text-[10px] tracking-[2px] uppercase py-3 flex items-center justify-center gap-2 hover:bg-midnight/90 transition-colors">
                      <Download size={14} weight="bold" />
                      Download Sample
                    </button>
                  ) : (
                    <button
                      onClick={() => document.querySelector<HTMLInputElement>('input[type="email"]')?.focus()}
                      className="w-full bg-midnight/[0.06] text-steel font-display font-semibold text-[10px] tracking-[2px] uppercase py-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-midnight/[0.1] transition-colors"
                    >
                      <Lock size={14} weight="fill" />
                      Enter Email to Unlock
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Comparison */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="bg-brand-white border border-midnight/[0.08] p-10">
            <h2 className="font-display font-black text-[28px] text-midnight text-center mb-2">
              Templates vs. Managed Compliance
            </h2>
            <p className="font-sans text-[15px] text-steel text-center mb-10 max-w-lg mx-auto">
              These samples show what we deliver. Not what you have to build yourself.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* DIY */}
              <div className="bg-parchment border border-midnight/[0.08] p-6">
                <h3 className="font-display font-bold text-[14px] text-steel mb-4 uppercase tracking-[1px]">
                  DIY Templates
                </h3>
                <div className="space-y-3">
                  {[
                    "Generic PDF you fill in yourself",
                    "No regulatory monitoring",
                    "Out of date within months",
                    "No incident log integration",
                    "One-time purchase, no updates",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <span className="text-crimson font-bold text-[14px] mt-0.5">&times;</span>
                      <span className="font-sans text-[13px] text-steel">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protekon */}
              <div className="bg-midnight text-parchment p-6 border border-gold/20">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-display font-bold text-[14px] uppercase tracking-[1px]">
                    Protekon Managed
                  </h3>
                  <span className="bg-gold/20 text-gold font-display font-bold text-[8px] tracking-[1px] uppercase px-2 py-0.5">
                    Included
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    "Site-specific documents written for you",
                    "24/7 regulatory change monitoring",
                    "Auto-updated when laws change",
                    "Integrated incident logging + PII stripping",
                    "Monthly delivery to your inbox",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <Check size={14} weight="bold" className="text-gold flex-shrink-0 mt-0.5" />
                      <span className="font-sans text-[13px] text-fog">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10 text-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-3 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-10 py-4 hover:bg-crimson/90 transition-colors"
              >
                Start Your Plan
                <ArrowRight size={16} weight="bold" />
              </Link>
              <p className="font-sans text-[12px] text-steel mt-3">
                From $297/mo. First delivery in 48 hours. Cancel anytime.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
