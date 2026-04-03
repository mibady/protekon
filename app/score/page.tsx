"use client"

import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Shield, Warning, Check, X } from "@phosphor-icons/react"
import Link from "next/link"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import ScoreRing from "@/components/score/ScoreRing"
import GapList from "@/components/score/GapList"
import { calculateScore } from "@/lib/score-calculator"
import type { ScoreAnswers, ScoreResult } from "@/lib/types/score"

/* ─── Constants ─── */

const INDUSTRIES = [
  "Warehousing/Logistics",
  "Retail",
  "Auto dealer/repair",
  "Landscaping/outdoor services",
  "Construction/trades",
  "Restaurant/food service",
  "Healthcare/dental",
  "Property management",
  "Manufacturing",
  "Towing/transportation",
  "Hospitality",
  "Agriculture",
  "Wholesale/distribution",
  "Cleaning services",
  "Other",
]

const EMPLOYEE_COUNTS = ["10-25", "26-50", "51-100", "101-250", "251+"]
const LOCATION_COUNTS = ["1", "2-3", "4-10", "10+"]

const COMPLIANCE_QUESTIONS: {
  key: keyof ScoreAnswers
  question: string
  help: string
}[] = [
  {
    key: "has_iipp",
    question: "Do you have a written Injury & Illness Prevention Program (IIPP)?",
    help: "California requires every employer to have a written IIPP. This is the foundation of workplace safety compliance.",
  },
  {
    key: "iipp_site_specific",
    question: "Is your IIPP specific to your actual worksite and hazards?",
    help: "A generic template doesn't satisfy the requirement. Your plan must address the specific hazards present at your location.",
  },
  {
    key: "has_incident_log",
    question: "Do you maintain a compliant incident log?",
    help: "SB 553 requires a log of workplace violence incidents. Records must be PII-scrubbed and available for inspection.",
  },
  {
    key: "training_current",
    question: "Is your employee safety training current (within 12 months)?",
    help: "Annual interactive training is required. Expired records are a separate citation from a missing plan.",
  },
  {
    key: "has_industry_programs",
    question: "Do you have industry-specific compliance programs in place?",
    help: "Your industry may require additional programs beyond the baseline IIPP — e.g., heat illness prevention, hazcom, respiratory protection.",
  },
  {
    key: "audit_ready",
    question: "Could you produce your full compliance package today if inspected?",
    help: "If Cal/OSHA arrived today, you'd need to produce your IIPP, training records, incident log, and industry-specific documentation.",
  },
]

/* ─── Slide animation variants ─── */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

/* ─── Inner component (uses useSearchParams) ─── */

function ScorePageInner() {
  const searchParams = useSearchParams()
  const partnerRef = searchParams.get("ref") || ""
  const pid = searchParams.get("pid") || ""

  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [answers, setAnswers] = useState<Partial<ScoreAnswers>>({})
  const [contact, setContact] = useState({ email: "", name: "", phone: "" })
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  /* Live score from partial answers */
  const liveResult = useMemo(() => {
    const full: ScoreAnswers = {
      industry: (answers.industry as string) || "",
      employee_count: (answers.employee_count as string) || "",
      location_count: (answers.location_count as string) || "",
      city: "",
      state: "",
      has_iipp: !!answers.has_iipp,
      iipp_site_specific: !!answers.iipp_site_specific,
      has_incident_log: !!answers.has_incident_log,
      training_current: !!answers.training_current,
      has_industry_programs: !!answers.has_industry_programs,
      audit_ready: !!answers.audit_ready,
    }
    return calculateScore(full)
  }, [answers])

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  function updateAnswer(key: keyof ScoreAnswers, value: string | boolean) {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const step1Valid = !!answers.industry && !!answers.employee_count
  const step2Valid = COMPLIANCE_QUESTIONS.every(
    (q) => answers[q.key] !== undefined
  )
  const step3Valid = contact.email.trim() !== "" && contact.name.trim() !== ""

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    const cityState = ((answers.city as string) || "").split(",")
    const fullAnswers: ScoreAnswers = {
      industry: (answers.industry as string) || "",
      employee_count: (answers.employee_count as string) || "",
      location_count: (answers.location_count as string) || "1",
      city: cityState[0]?.trim() || "",
      state: cityState[1]?.trim() || "",
      has_iipp: !!answers.has_iipp,
      iipp_site_specific: !!answers.iipp_site_specific,
      has_incident_log: !!answers.has_incident_log,
      training_current: !!answers.training_current,
      has_industry_programs: !!answers.has_industry_programs,
      audit_ready: !!answers.audit_ready,
    }

    try {
      const res = await fetch("/api/score/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contact.email,
          name: contact.name,
          phone: contact.phone || undefined,
          answers: fullAnswers,
          partner_ref: partnerRef || undefined,
          pid: pid || undefined,
          utm_source: searchParams.get("utm_source") || undefined,
          utm_medium: searchParams.get("utm_medium") || undefined,
          utm_campaign: searchParams.get("utm_campaign") || undefined,
        }),
      })

      if (!res.ok) {
        throw new Error("Something went wrong. Please try again.")
      }

      const data = await res.json()
      setLeadId(data.id || null)
      setResult(data.result || calculateScore(fullAnswers))
      goTo(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="bg-void min-h-screen">
      <Nav />

      <section className="pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-[800px] mx-auto">
          {/* ─── Progress Bar ─── */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-semibold text-[11px] tracking-[3px] uppercase text-steel">
                Step {step} of 4
              </span>
              <span className="font-sans text-[13px] text-steel">
                {step === 1 && "Business Context"}
                {step === 2 && "Compliance Posture"}
                {step === 3 && "Get Your Report"}
                {step === 4 && "Your Results"}
              </span>
            </div>
            <div className="h-[3px] bg-brand-white/[0.06] w-full">
              <motion.div
                className="h-full bg-crimson"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* ─── Step Content ─── */}
          <AnimatePresence mode="wait" custom={direction}>
            {/* ═══ STEP 1 — Business Context ═══ */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] text-parchment mb-3">
                  Tell us about your business
                </h2>
                <p className="font-sans text-[16px] text-fog mb-10 leading-relaxed">
                  We use this to calibrate your score and estimate fine exposure
                  for your specific situation.
                </p>

                <div className="flex flex-col gap-8">
                  {/* Industry */}
                  <div>
                    <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                      Industry
                    </label>
                    <select
                      value={(answers.industry as string) || ""}
                      onChange={(e) => updateAnswer("industry", e.target.value)}
                      className="w-full bg-midnight border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 focus:outline-none focus:border-crimson/50 transition-colors"
                    >
                      <option value="" disabled>
                        Select your industry
                      </option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                    <p className="font-sans text-[12px] text-steel mt-1.5">
                      This determines which compliance verticals apply to your
                      business.
                    </p>
                  </div>

                  {/* Employee Count */}
                  <div>
                    <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                      Employee Count
                    </label>
                    <select
                      value={(answers.employee_count as string) || ""}
                      onChange={(e) =>
                        updateAnswer("employee_count", e.target.value)
                      }
                      className="w-full bg-midnight border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 focus:outline-none focus:border-crimson/50 transition-colors"
                    >
                      <option value="" disabled>
                        Select employee count
                      </option>
                      {EMPLOYEE_COUNTS.map((ec) => (
                        <option key={ec} value={ec}>
                          {ec}
                        </option>
                      ))}
                    </select>
                    <p className="font-sans text-[12px] text-steel mt-1.5">
                      Fine exposure scales with employee count. Larger teams face
                      higher per-violation penalties.
                    </p>
                  </div>

                  {/* Locations */}
                  <div>
                    <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                      Number of Locations
                    </label>
                    <select
                      value={(answers.location_count as string) || ""}
                      onChange={(e) =>
                        updateAnswer("location_count", e.target.value)
                      }
                      className="w-full bg-midnight border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 focus:outline-none focus:border-crimson/50 transition-colors"
                    >
                      <option value="" disabled>
                        Select location count
                      </option>
                      {LOCATION_COUNTS.map((lc) => (
                        <option key={lc} value={lc}>
                          {lc}
                        </option>
                      ))}
                    </select>
                    <p className="font-sans text-[12px] text-steel mt-1.5">
                      Each location requires its own site-specific compliance
                      documentation.
                    </p>
                  </div>

                  {/* City/State */}
                  <div>
                    <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                      City, State
                    </label>
                    <input
                      type="text"
                      value={(answers.city as string) || ""}
                      onChange={(e) => updateAnswer("city", e.target.value)}
                      placeholder="Riverside, CA"
                      className="w-full bg-midnight border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 placeholder:text-steel/40 focus:outline-none focus:border-crimson/50 transition-colors"
                    />
                    <p className="font-sans text-[12px] text-steel mt-1.5">
                      Some regulations are jurisdiction-specific. We tailor your
                      score accordingly.
                    </p>
                  </div>
                </div>

                <div className="mt-10">
                  <button
                    onClick={() => goTo(2)}
                    disabled={!step1Valid}
                    className="inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:bg-crimson/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <ArrowRight size={16} weight="bold" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ═══ STEP 2 — Compliance Posture ═══ */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] text-parchment mb-3">
                  Your Compliance Posture
                </h2>
                <p className="font-sans text-[16px] text-fog mb-10 leading-relaxed">
                  Answer honestly. Your score appears in real time.
                </p>

                <div className="grid lg:grid-cols-[1fr_280px] gap-10">
                  {/* Questions Column */}
                  <div className="flex flex-col gap-6">
                    {COMPLIANCE_QUESTIONS.map((q) => {
                      const val = answers[q.key]
                      return (
                        <div
                          key={q.key}
                          className="bg-midnight border border-brand-white/[0.06] p-5"
                        >
                          <p className="font-sans text-[15px] text-parchment mb-1.5 leading-snug">
                            {q.question}
                          </p>
                          <p className="font-sans text-[12px] text-steel mb-4 leading-relaxed">
                            {q.help}
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => updateAnswer(q.key, true)}
                              className={`flex-1 py-2.5 font-display font-semibold text-[11px] tracking-[2px] uppercase border transition-colors ${
                                val === true
                                  ? "bg-green-600/20 border-green-500/50 text-green-400"
                                  : "border-brand-white/[0.1] text-steel hover:border-green-500/30 hover:text-green-400"
                              }`}
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => updateAnswer(q.key, false)}
                              className={`flex-1 py-2.5 font-display font-semibold text-[11px] tracking-[2px] uppercase border transition-colors ${
                                val === false
                                  ? "bg-red-600/20 border-red-500/50 text-red-400"
                                  : "border-brand-white/[0.1] text-steel hover:border-red-500/30 hover:text-red-400"
                              }`}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Score Ring Column */}
                  <div className="lg:sticky lg:top-32 lg:self-start flex justify-center">
                    <ScoreRing score={liveResult.score} />
                  </div>
                </div>

                <div className="mt-10 flex items-center gap-4">
                  <button
                    onClick={() => goTo(1)}
                    className="inline-flex items-center justify-center gap-2 border border-brand-white/[0.1] text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:border-gold/50 hover:text-gold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => goTo(3)}
                    disabled={!step2Valid}
                    className="inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:bg-crimson/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <ArrowRight size={16} weight="bold" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ═══ STEP 3 — Email Gate ═══ */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Shield size={28} weight="fill" className="text-crimson" />
                  <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] text-parchment">
                    See your full compliance score report
                  </h2>
                </div>
                <p className="font-sans text-[16px] text-fog mb-10 leading-relaxed">
                  Enter your email to see estimated fine exposure and specific
                  gap analysis.
                </p>

                <div className="flex flex-col gap-6 max-w-[480px]">
                  {/* Email */}
                  <div>
                    <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                      Email <span className="text-crimson">*</span>
                    </label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, email: e.target.value }))
                      }
                      placeholder="you@company.com"
                      className="w-full bg-midnight border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 placeholder:text-steel/40 focus:outline-none focus:border-crimson/50 transition-colors"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                      Name <span className="text-crimson">*</span>
                    </label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, name: e.target.value }))
                      }
                      placeholder="Your name"
                      className="w-full bg-midnight border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 placeholder:text-steel/40 focus:outline-none focus:border-crimson/50 transition-colors"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                      Phone{" "}
                      <span className="text-steel font-normal">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, phone: e.target.value }))
                      }
                      placeholder="(555) 123-4567"
                      className="w-full bg-midnight border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 placeholder:text-steel/40 focus:outline-none focus:border-crimson/50 transition-colors"
                    />
                    <p className="font-sans text-[12px] text-steel mt-1.5">
                      We'll communicate by email unless you prefer a call.
                    </p>
                  </div>
                </div>

                <p className="font-sans text-[12px] text-steel/60 mt-6 max-w-[480px]">
                  We'll send your score report immediately. One follow-up email.
                  Unsubscribe anytime.
                </p>

                {error && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/30 px-4 py-3 max-w-[480px]">
                    <p className="font-sans text-[14px] text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                <div className="mt-10 flex items-center gap-4">
                  <button
                    onClick={() => goTo(2)}
                    className="inline-flex items-center justify-center gap-2 border border-brand-white/[0.1] text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:border-gold/50 hover:text-gold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!step3Valid || submitting}
                    className="inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:bg-crimson/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Calculating..." : "See My Score"}
                    {!submitting && <ArrowRight size={16} weight="bold" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ═══ STEP 4 — Results ═══ */}
            {step === 4 && result && (
              <motion.div
                key="step4"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                {/* Score Ring */}
                <div className="flex justify-center mb-10">
                  <ScoreRing score={result.score} size={240} />
                </div>

                {/* Tier Headline */}
                <div className="text-center mb-12">
                  {result.tier === "green" && (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Check
                          size={24}
                          weight="bold"
                          className="text-green-400"
                        />
                        <h2 className="font-display font-black text-[32px] text-green-400">
                          Fully Covered
                        </h2>
                      </div>
                      <p className="font-sans text-[16px] text-fog max-w-[600px] mx-auto leading-relaxed">
                        Your compliance posture is strong. You have all six core
                        areas covered. Stay current with annual refreshes and
                        regulatory monitoring to maintain your position.
                      </p>
                    </>
                  )}
                  {result.tier === "yellow" && (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Warning
                          size={24}
                          weight="fill"
                          className="text-yellow-400"
                        />
                        <h2 className="font-display font-black text-[32px] text-yellow-400">
                          Gaps Detected
                        </h2>
                      </div>
                      <p className="font-sans text-[16px] text-fog max-w-[600px] mx-auto leading-relaxed">
                        You have {result.gaps.length} compliance{" "}
                        {result.gaps.length === 1 ? "gap" : "gaps"} that could
                        result in citations. Each gap is a separate violation
                        with its own fine.
                      </p>
                    </>
                  )}
                  {result.tier === "red" && (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <X
                          size={24}
                          weight="bold"
                          className="text-red-400"
                        />
                        <h2 className="font-display font-black text-[32px] text-red-400">
                          At Risk
                        </h2>
                      </div>
                      <p className="font-sans text-[16px] text-fog max-w-[600px] mx-auto leading-relaxed">
                        Your business has significant compliance exposure.{" "}
                        {result.gaps.length} open gaps mean multiple citable
                        violations if inspected. Immediate action is
                        recommended.
                      </p>
                    </>
                  )}
                </div>

                {/* Gap List */}
                {result.gaps.length > 0 && (
                  <div className="mb-10">
                    <h3 className="font-display font-bold text-[18px] text-parchment mb-5">
                      Your Compliance Gaps
                    </h3>
                    <GapList gaps={result.gaps} />
                  </div>
                )}

                {/* Fine Exposure Card */}
                {result.gaps.length > 0 && (
                  <div className="bg-crimson/10 border border-crimson/30 p-6 mb-10">
                    <p className="font-display font-semibold text-[13px] tracking-[2px] uppercase text-crimson mb-2">
                      Estimated Fine Exposure
                    </p>
                    <p className="font-display font-black text-[36px] text-parchment">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      }).format(result.fine_low)}
                      {" \u2013 "}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      }).format(result.fine_high)}
                    </p>
                    <p className="font-sans text-[13px] text-steel mt-2">
                      Based on average Cal/OSHA citation amounts for your
                      employee count and gap profile.
                    </p>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {result.tier === "green" ? (
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:bg-crimson/90 transition-colors"
                    >
                      Stay Current with Protekon
                      <ArrowRight size={16} weight="bold" />
                    </Link>
                  ) : (
                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:bg-crimson/90 transition-colors"
                    >
                      Close These Gaps in 48 Hours
                      <ArrowRight size={16} weight="bold" />
                    </Link>
                  )}
                  {leadId && (
                    <button
                      onClick={() =>
                        window.open(
                          `/api/score/report?id=${leadId}`,
                          "_blank"
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 border border-brand-white/[0.1] text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:border-gold/50 hover:text-gold transition-colors"
                    >
                      Download Your Full Score Report (PDF)
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </main>
  )
}

/* ─── Page export with Suspense boundary for useSearchParams ─── */

export default function ScorePage() {
  return (
    <Suspense
      fallback={
        <main className="bg-void min-h-screen">
          <Nav />
          <div className="pt-32 pb-24 px-6 lg:px-8 flex justify-center">
            <div className="text-steel font-sans">Loading...</div>
          </div>
          <Footer />
        </main>
      }
    >
      <ScorePageInner />
    </Suspense>
  )
}
