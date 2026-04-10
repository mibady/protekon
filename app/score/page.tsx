"use client"

import { useState, useMemo, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Question, CaretUp } from "@phosphor-icons/react"
import Link from "next/link"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import ScoreRing from "@/components/score/ScoreRing"
import GapCards from "@/components/score/GapCards"
import PdfGateForm from "@/components/score/PdfGateForm"
import { calculateScore } from "@/lib/score-calculator"
import type { ScoreAnswers, ScoreResult } from "@/lib/types/score"

/* ─── Constants ─── */

const INDUSTRIES = [
  "Construction",
  "Manufacturing",
  "Agriculture",
  "Hospitality",
  "Retail",
  "Healthcare",
  "Wholesale",
  "Transportation",
  "Automotive Services",
  "Other",
]

const EMPLOYEE_COUNTS = ["10-25", "26-50", "51-100", "101-250", "251+"]

type AnswerKey = "has_wvpp" | "wvpp_site_specific" | "has_incident_log" | "pii_stripped" | "training_current" | "audit_ready"

const COMPLIANCE_QUESTIONS: {
  key: AnswerKey
  question: string
  help: string
}[] = [
  {
    key: "has_wvpp",
    question:
      "Do you have a written Workplace Violence Prevention Plan (WVPP)?",
    help: "A formal written document — not a general safety policy or employee handbook section.",
  },
  {
    key: "wvpp_site_specific",
    question:
      "Is your WVPP specific to your actual worksite address and layout?",
    help: "A site-specific plan references your real address, physical layout, and industry-specific risks. A generic template doesn\u2019t count.",
  },
  {
    key: "has_incident_log",
    question: "Do you currently maintain a Violent Incident Log?",
    help: "An ongoing record where workplace incidents are logged with required data fields — not a spreadsheet of notes.",
  },
  {
    key: "pii_stripped",
    question:
      "Is your incident log free of personally identifying information (PII)?",
    help: "Under California Labor Code \u00A76401.9, your log must not contain employee names or other identifying details. Employees can legally request this log at any time.",
  },
  {
    key: "training_current",
    question:
      "Have all employees received interactive workplace violence prevention training in the last 12 months?",
    help: "SB 553 requires annual interactive training — not a one-time video or handout. Must be specific to your worksite plan.",
  },
  {
    key: "audit_ready",
    question:
      "Can you produce an audit-ready compliance package right now if Cal/OSHA showed up today?",
    help: "A complete package includes your current WVPP, incident log, training records, and employee sign-off sheets — ready to hand to an inspector.",
  },
]

/* ─── Helpers ─── */

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

/* ─── Inner component (uses useSearchParams) ─── */

function ScorePageInner() {
  const searchParams = useSearchParams()

  /* ─── State ─── */
  const [step, setStep] = useState<"hero" | "assessment" | "results">("hero")
  const [industry, setIndustry] = useState("")
  const [employeeCount, setEmployeeCount] = useState("")
  const [answers, setAnswers] = useState<Record<AnswerKey, boolean | null>>({
    has_wvpp: null,
    wvpp_site_specific: null,
    has_incident_log: null,
    pii_stripped: null,
    training_current: null,
    audit_ready: null,
  })
  const [expandedHelp, setExpandedHelp] = useState<AnswerKey | null>(null)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [, setSavingAnonymous] = useState(false)

  /* ─── Derived ─── */
  const allAnswered = Object.values(answers).every((v) => v !== null)
  const yesCount = Object.values(answers).filter((v) => v === true).length

  const liveResult = useMemo(() => {
    if (!allAnswered) return null
    const full: ScoreAnswers = {
      industry,
      employee_count: employeeCount,
      has_wvpp: !!answers.has_wvpp,
      wvpp_site_specific: !!answers.wvpp_site_specific,
      has_incident_log: !!answers.has_incident_log,
      pii_stripped: !!answers.pii_stripped,
      training_current: !!answers.training_current,
      audit_ready: !!answers.audit_ready,
    }
    return calculateScore(full)
  }, [allAnswered, answers, industry, employeeCount])

  /* ─── Partial score for live ring ─── */
  const partialScore = useMemo(() => {
    return yesCount
  }, [yesCount])

  /* ─── Handlers ─── */
  function toggleAnswer(key: AnswerKey, value: boolean) {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  function handleStartAssessment() {
    if (!industry || !employeeCount) return
    setStep("assessment")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleChangeContext() {
    setStep("hero")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleShowResults = useCallback(async () => {
    if (!liveResult) return
    setResult(liveResult)
    setStep("results")
    window.scrollTo({ top: 0, behavior: "smooth" })

    // Fire anonymous save in background
    setSavingAnonymous(true)
    try {
      const res = await fetch("/api/score/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: "anonymous",
          answers: {
            industry,
            employee_count: employeeCount,
            has_wvpp: !!answers.has_wvpp,
            wvpp_site_specific: !!answers.wvpp_site_specific,
            has_incident_log: !!answers.has_incident_log,
            pii_stripped: !!answers.pii_stripped,
            training_current: !!answers.training_current,
            audit_ready: !!answers.audit_ready,
          },
          utm_source: searchParams.get("utm_source") || undefined,
          utm_medium: searchParams.get("utm_medium") || undefined,
          utm_campaign: searchParams.get("utm_campaign") || undefined,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setLeadId(data.id || null)
      }
    } catch {
      // Silent fail on anonymous save
    } finally {
      setSavingAnonymous(false)
    }
  }, [liveResult, industry, employeeCount, answers, searchParams])

  async function handlePdfCapture(email: string, businessName: string) {
    if (!leadId) throw new Error("No lead ID")
    const res = await fetch("/api/score/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phase: "capture",
        lead_id: leadId,
        email,
        business_name: businessName,
      }),
    })
    if (!res.ok) throw new Error("Capture failed")
  }

  function handleRetake() {
    setStep("hero")
    setIndustry("")
    setEmployeeCount("")
    setAnswers({
      has_wvpp: null,
      wvpp_site_specific: null,
      has_incident_log: null,
      pii_stripped: null,
      training_current: null,
      audit_ready: null,
    })
    setExpandedHelp(null)
    setLeadId(null)
    setResult(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /* Benchmark placeholder percentages by industry */
  const benchmarkPct = useMemo(() => {
    const map: Record<string, number> = {
      Construction: 34,
      Manufacturing: 41,
      Agriculture: 28,
      Hospitality: 38,
      Retail: 45,
      Healthcare: 52,
      Wholesale: 43,
      Transportation: 37,
      "Automotive Services": 39,
      Other: 40,
    }
    return map[industry] ?? 40
  }, [industry])

  /* ─── RENDER ─── */
  return (
    <div className="min-h-screen bg-brand-white">
      <Nav />

      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 1 — HERO                               */}
        {/* ═══════════════════════════════════════════════ */}
        {step === "hero" && (
          <motion.section
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="pt-32 pb-20 px-6 lg:px-8"
          >
            <div className="max-w-3xl mx-auto">
              {/* Eyebrow */}
              <span className="font-display text-[13px] font-semibold uppercase tracking-[0.1em] text-crimson">
                Free Compliance Assessment
              </span>

              {/* H1 */}
              <h1 className="font-display text-[44px] md:text-[44px] text-[30px] font-bold text-midnight tracking-tight mt-4 leading-[1.05]">
                Would you pass a Cal/OSHA inspection today?
              </h1>

              {/* Subhead */}
              <p className="font-sans text-[17px] text-steel leading-relaxed max-w-[600px] mt-4">
                Six yes-or-no questions. Your compliance score calculated in real
                time. No email required, no sales pitch — just an honest picture
                of where your business stands.
              </p>

              {/* Trust */}
              <p className="font-sans text-[13px] text-steel/60 mt-3">
                Takes 90 seconds. Based on California Labor Code &sect;6401.9
                and SB 553 requirements.
              </p>

              {/* ─── Section 2: Pre-Assessment Selectors ─── */}
              <div className="mt-12">
                <h3 className="font-display text-[18px] font-semibold text-midnight mb-6">
                  Tell us about your business
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Industry */}
                  <div>
                    <label className="font-display font-semibold text-[13px] text-midnight block mb-1.5">
                      Industry
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-brand-white border border-midnight/[0.15] text-midnight font-sans text-[15px] px-4 py-3 focus:outline-none focus:border-crimson/50 transition-colors"
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
                  </div>

                  {/* Employee Count */}
                  <div>
                    <label className="font-display font-semibold text-[13px] text-midnight block mb-1.5">
                      Employee Count
                    </label>
                    <select
                      value={employeeCount}
                      onChange={(e) => setEmployeeCount(e.target.value)}
                      className="w-full bg-brand-white border border-midnight/[0.15] text-midnight font-sans text-[15px] px-4 py-3 focus:outline-none focus:border-crimson/50 transition-colors"
                    >
                      <option value="" disabled>
                        Select employee count
                      </option>
                      {EMPLOYEE_COUNTS.map((ec) => (
                        <option key={ec} value={ec}>
                          {ec} employees
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleStartAssessment}
                  disabled={!industry || !employeeCount}
                  className="mt-8 inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[15px] uppercase tracking-[2px] w-full py-4 hover:bg-crimson/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Check My Compliance
                  <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 3 — ASSESSMENT + LIVE SCORE             */}
        {/* ═══════════════════════════════════════════════ */}
        {step === "assessment" && (
          <motion.section
            key="assessment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="pt-32 pb-20 px-6 lg:px-8"
          >
            <div className="max-w-3xl mx-auto">
              {/* Context summary bar */}
              <div className="flex items-center justify-between bg-parchment border border-midnight/[0.08] px-4 py-3 mb-8">
                <span className="font-sans text-[14px] text-midnight">
                  {industry} &middot; {employeeCount} employees
                </span>
                <button
                  onClick={handleChangeContext}
                  className="font-sans text-[13px] text-crimson hover:text-crimson/80 transition-colors underline underline-offset-2"
                >
                  Change
                </button>
              </div>

              {/* Desktop: grid with sticky ring */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
                {/* Questions */}
                <div className="flex flex-col gap-4">
                  {COMPLIANCE_QUESTIONS.map((q) => {
                    const val = answers[q.key]
                    const isYes = val === true
                    const isNo = val === false
                    const helpOpen = expandedHelp === q.key

                    return (
                      <div
                        key={q.key}
                        className={`bg-brand-white border border-midnight/[0.08] p-4 flex flex-col transition-all ${
                          isYes
                            ? "border-l-[3px] border-l-[#10B981]"
                            : isNo
                              ? "border-l-[3px] border-l-crimson"
                              : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="font-sans text-[14px] font-medium text-midnight leading-snug flex-1">
                            {q.question}
                          </p>
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Help toggle */}
                            <button
                              onClick={() =>
                                setExpandedHelp(helpOpen ? null : q.key)
                              }
                              className="text-steel hover:text-midnight transition-colors"
                              aria-label="Toggle help"
                            >
                              <Question size={18} weight="bold" />
                            </button>
                            {/* Toggle pill */}
                            <button
                              onClick={() => toggleAnswer(q.key, val === true ? false : true)}
                              className={`relative w-12 h-6 rounded-full transition-colors ${
                                isYes
                                  ? "bg-[#10B981]"
                                  : isNo
                                    ? "bg-crimson"
                                    : "bg-ash"
                              }`}
                              aria-label={`Toggle ${q.key}`}
                            >
                              <span
                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                  isYes
                                    ? "translate-x-[26px]"
                                    : isNo
                                      ? "translate-x-[2px]"
                                      : "translate-x-[14px]"
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Help text */}
                        <AnimatePresence>
                          {helpOpen && (
                            <motion.p
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="font-sans text-[13px] text-steel mt-2 overflow-hidden"
                            >
                              {q.help}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}

                  {/* Show Results CTA */}
                  {allAnswered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <button
                        onClick={handleShowResults}
                        className="inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[15px] uppercase tracking-[2px] w-full py-4 hover:bg-crimson/90 transition-colors"
                      >
                        See My Results
                        <ArrowRight size={16} weight="bold" />
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Score Ring — sticky on desktop */}
                <div className="hidden lg:block">
                  <div className="sticky top-24">
                    <div className="flex justify-center">
                      <ScoreRing score={partialScore} size={160} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile: compact fixed bar */}
              <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-brand-white border-b border-midnight/[0.08] h-16 flex items-center justify-between px-6">
                <span className="font-sans text-[13px] text-steel">
                  Compliance Score
                </span>
                <span
                  className="font-mono text-[22px] font-bold"
                  style={{
                    color:
                      partialScore === 6
                        ? "#10B981"
                        : partialScore >= 4
                          ? "#C9A84C"
                          : "#C41230",
                  }}
                >
                  {partialScore}/6
                </span>
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 4-7 — RESULTS                          */}
        {/* ═══════════════════════════════════════════════ */}
        {step === "results" && result && (
          <motion.section
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pt-32 pb-20 px-6 lg:px-8"
          >
            <div className="max-w-3xl mx-auto">
              {/* ─── Score Result Card ─── */}
              <div
                className={`p-6 ${
                  result.tier === "green"
                    ? "bg-[#10B981]/5 border border-[#10B981]/30"
                    : result.tier === "yellow"
                      ? "bg-[#C9A84C]/5 border border-[#C9A84C]/30"
                      : "bg-crimson/5 border border-crimson/30"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex justify-center">
                    <ScoreRing
                      score={result.score}
                      size={160}
                      fineExposure={
                        result.gaps.length > 0
                          ? { low: result.fine_low, high: result.fine_high }
                          : null
                      }
                    />
                  </div>
                  <div className="flex-1">
                    {result.tier === "green" && (
                      <>
                        <h2 className="font-display text-[28px] font-bold text-[#10B981]">
                          Fully Compliant
                        </h2>
                        <p className="font-sans text-[15px] text-steel leading-relaxed mt-2">
                          You passed all six checks. Your compliance posture is
                          strong. Stay current with annual refreshes and
                          regulatory monitoring to maintain your position.
                        </p>
                      </>
                    )}
                    {result.tier === "yellow" && (
                      <>
                        <h2 className="font-display text-[28px] font-bold text-[#C9A84C]">
                          Gaps Detected
                        </h2>
                        <p className="font-sans text-[15px] text-steel leading-relaxed mt-2">
                          You have {result.gaps.length} compliance{" "}
                          {result.gaps.length === 1 ? "gap" : "gaps"} that could
                          result in citations. Each gap is a separate violation
                          with its own fine schedule.
                        </p>
                      </>
                    )}
                    {result.tier === "red" && (
                      <>
                        <h2 className="font-display text-[28px] font-bold text-crimson">
                          {result.score === 0 ? "Not Compliant" : "At Risk"}
                        </h2>
                        <p className="font-sans text-[15px] text-steel leading-relaxed mt-2">
                          Your business has significant compliance exposure.{" "}
                          {result.gaps.length} open gaps mean multiple citable
                          violations if inspected. Immediate action is
                          recommended.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ─── Gap Analysis Cards ─── */}
              {result.gaps.length > 0 && (
                <div className="mt-10">
                  <h3 className="font-display text-[18px] font-semibold text-midnight mb-4">
                    Your Compliance Gaps
                  </h3>
                  <GapCards gaps={result.gaps} />
                </div>
              )}

              {/* ─── Fine Exposure Summary ─── */}
              {result.gaps.length > 0 && (
                <div
                  className={`mt-10 p-6 border ${
                    result.tier === "yellow"
                      ? "border-[#C9A84C]/30"
                      : "border-crimson/30"
                  }`}
                >
                  <p className="font-sans text-[13px] text-steel mb-1">
                    Total estimated fine exposure
                  </p>
                  <p className="font-mono text-[32px] font-bold text-crimson">
                    {formatCurrency(result.fine_low)}&ndash;
                    {formatCurrency(result.fine_high)}
                  </p>

                  {/* Cost comparison bars */}
                  <div className="mt-6 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-sans text-[13px] text-steel">
                          Cal/OSHA fine exposure
                        </span>
                        <span className="font-mono text-[13px] text-crimson font-semibold">
                          {formatCurrency(result.fine_high)}
                        </span>
                      </div>
                      <div className="h-3 bg-crimson/20 w-full">
                        <div className="h-full bg-crimson w-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-sans text-[13px] text-steel">
                          PROTEKON annual cost
                        </span>
                        <span className="font-mono text-[13px] text-[#10B981] font-semibold">
                          $7,164/yr
                        </span>
                      </div>
                      <div className="h-3 bg-[#10B981]/20 w-full">
                        <div
                          className="h-full bg-[#10B981]"
                          style={{
                            width: `${Math.min(
                              100,
                              (7164 / result.fine_high) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Industry Benchmark ─── */}
              <div className="bg-parchment p-5 mt-10">
                <p className="font-sans text-[14px] text-midnight leading-relaxed">
                  Based on Cal/OSHA enforcement data,{" "}
                  <strong className="font-semibold">
                    only {benchmarkPct}% of {industry.toLowerCase()} businesses
                  </strong>{" "}
                  in California can produce a complete compliance package on
                  demand. The rest are operating with at least one citable gap.
                </p>
              </div>

              {/* ─── Cost Comparison Table ─── */}
              {result.gaps.length > 0 && (
                <div className="mt-10 overflow-x-auto">
                  <table className="w-full border border-midnight/[0.08]">
                    <thead>
                      <tr className="bg-parchment">
                        <th className="text-left font-display text-[13px] font-semibold text-midnight p-3 border-b border-midnight/[0.08]">
                          Compliance Area
                        </th>
                        <th className="text-right font-display text-[13px] font-semibold text-midnight p-3 border-b border-midnight/[0.08]">
                          Cal/OSHA Fine
                        </th>
                        <th className="text-right font-display text-[13px] font-semibold text-midnight p-3 border-b border-midnight/[0.08]">
                          PROTEKON Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.gaps.map((gap) => (
                        <tr
                          key={gap.key}
                          className="border-b border-midnight/[0.06]"
                        >
                          <td className="font-sans text-[14px] text-midnight p-3">
                            {gap.label}
                          </td>
                          <td className="font-mono text-[14px] text-crimson text-right p-3">
                            {formatCurrency(gap.citation_amount)}
                          </td>
                          <td className="font-mono text-[14px] text-[#10B981] text-right p-3">
                            Included
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-parchment/50">
                        <td className="font-display text-[14px] font-semibold text-midnight p-3">
                          Total
                        </td>
                        <td className="font-mono text-[14px] font-bold text-crimson text-right p-3">
                          {formatCurrency(result.fine_high)}
                        </td>
                        <td className="font-mono text-[14px] font-bold text-[#10B981] text-right p-3">
                          $597/mo
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* ─── Section 5: PDF Gate ─── */}
              <PdfGateForm leadId={leadId} onCapture={handlePdfCapture} />

              {/* ─── Section 6: Post-Download CTAs ─── */}
              <div className="mt-16">
                <h2 className="font-display text-[32px] font-bold text-midnight mb-6">
                  Ready to close these gaps in 48 hours?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Primary */}
                  <Link
                    href="/contact"
                    className="flex flex-col items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[14px] uppercase tracking-[1.5px] p-6 text-center hover:bg-crimson/90 transition-colors"
                  >
                    Start My Intake
                    <ArrowRight size={16} weight="bold" />
                  </Link>
                  {/* Secondary */}
                  <Link
                    href="/sample-reports"
                    className="flex flex-col items-center justify-center gap-2 bg-brand-white border border-midnight/[0.12] text-midnight font-display font-semibold text-[14px] uppercase tracking-[1.5px] p-6 text-center hover:border-crimson/30 transition-colors"
                  >
                    See a Sample Plan
                  </Link>
                  {/* Tertiary */}
                  <a
                    href="#"
                    className="flex flex-col items-center justify-center gap-2 bg-brand-white border border-midnight/[0.12] text-midnight font-display font-semibold text-[14px] uppercase tracking-[1.5px] p-6 text-center hover:border-crimson/30 transition-colors"
                  >
                    Book a 15-Minute Call
                  </a>
                </div>
              </div>

              {/* ─── Section 7: Retake + Legal ─── */}
              <div className="mt-16 flex flex-col items-center">
                <button
                  onClick={handleRetake}
                  className="inline-flex items-center gap-2 font-sans text-[14px] text-crimson hover:text-crimson/80 transition-colors underline underline-offset-2"
                >
                  <CaretUp size={14} weight="bold" />
                  Retake Assessment
                </button>
                <p className="font-sans text-[13px] text-steel/60 text-center max-w-[640px] mx-auto mt-6">
                  This assessment is for informational purposes only and does
                  not constitute legal advice. Results are based on
                  self-reported answers and publicly available Cal/OSHA
                  enforcement data. Fine estimates represent average citation
                  amounts and actual penalties may vary. Consult a qualified
                  compliance professional for specific guidance. PROTEKON is not
                  a law firm.
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

/* ─── Page export with Suspense boundary for useSearchParams ─── */

export default function ScorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-white">
          <Nav />
          <div className="pt-32 pb-24 px-6 lg:px-8 flex justify-center">
            <div className="text-steel font-sans">Loading...</div>
          </div>
          <Footer />
        </div>
      }
    >
      <ScorePageInner />
    </Suspense>
  )
}
