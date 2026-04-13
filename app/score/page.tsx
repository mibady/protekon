"use client"

import { useState, useMemo, useCallback, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Question, CaretUp } from "@phosphor-icons/react"
import Link from "next/link"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import ScoreRing from "@/components/score/ScoreRing"
import GapCards from "@/components/score/GapCards"
import PdfGateForm from "@/components/score/PdfGateForm"
import { calculateScore, getVerticalQuestions } from "@/lib/score-calculator"
import { getVerticals, getVerticalBenchmark } from "@/lib/actions/score"
import type { ScoreAnswers, ScoreResult, VerticalBenchmark, VerticalQuestion } from "@/lib/types/score"

/* ─── Constants ─── */

const EMPLOYEE_COUNTS = ["1-9", "10-25", "26-50", "51-100", "101-250", "251+"]

type BaselineKey =
  | "has_wvpp"
  | "wvpp_site_specific"
  | "has_incident_log"
  | "pii_stripped"
  | "training_current"
  | "audit_ready"
  | "has_iipp"
  | "iipp_current"
  | "has_eap"
  | "has_hazcom"
  | "osha_300_current"

const BASELINE_QUESTIONS: {
  key: BaselineKey
  question: string
  help: string
}[] = [
  {
    key: "has_iipp",
    question: "Do you have a written Injury and Illness Prevention Program (IIPP)?",
    help: "The most fundamental Cal/OSHA requirement — cited more than SB 553. Every California employer must have one.",
  },
  {
    key: "iipp_current",
    question: "Has your IIPP been reviewed in the last 12 months?",
    help: "Stale IIPPs are citable even if you have one. Your program must be reviewed and updated at least annually.",
  },
  {
    key: "has_eap",
    question: "Do you have a written Emergency Action Plan?",
    help: "Required for every workplace with 10+ employees. Must cover evacuation routes, alarm systems, and emergency contacts.",
  },
  {
    key: "has_hazcom",
    question: "Do you maintain a HazCom program with accessible Safety Data Sheets?",
    help: "The #1 most-cited OSHA standard nationally. You must maintain a written HazCom program with accessible SDSs for all hazardous chemicals.",
  },
  {
    key: "osha_300_current",
    question: "Are your OSHA 300/300A records current and posted?",
    help: "Auto-citation if an inspector visits Feb–Apr and your 300A isn't posted. Records must be maintained for 5 years.",
  },
  {
    key: "has_wvpp",
    question: "Do you have a written Workplace Violence Prevention Plan (WVPP)?",
    help: "A formal written document — not a general safety policy or employee handbook section. Required under SB 553.",
  },
  {
    key: "wvpp_site_specific",
    question: "Is your WVPP specific to your actual worksite address and layout?",
    help: "A site-specific plan references your real address, physical layout, and industry-specific risks. A generic template doesn't count.",
  },
  {
    key: "has_incident_log",
    question: "Do you currently maintain a Violent Incident Log?",
    help: "An ongoing record where workplace incidents are logged with required data fields — not a spreadsheet of notes.",
  },
  {
    key: "pii_stripped",
    question: "Is your incident log free of personally identifying information (PII)?",
    help: "Under California Labor Code §6401.9, your log must not contain employee names or other identifying details.",
  },
  {
    key: "training_current",
    question: "Have all employees received interactive workplace violence prevention training in the last 12 months?",
    help: "SB 553 requires annual interactive training — not a one-time video or handout. Must be specific to your worksite plan.",
  },
  {
    key: "audit_ready",
    question: "Can you produce an audit-ready compliance package right now if Cal/OSHA showed up today?",
    help: "A complete package includes your IIPP, WVPP, incident log, training records, SDSs, and employee sign-off sheets — ready to hand to an inspector.",
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

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n)
}

/* ─── Inner component (uses useSearchParams) ─── */

function ScorePageInner() {
  const searchParams = useSearchParams()

  /* ─── State ─── */
  const [step, setStep] = useState<"hero" | "baseline" | "vertical" | "results">("hero")
  const [industry, setIndustry] = useState("")
  const [employeeCount, setEmployeeCount] = useState("")
  const [verticals, setVerticals] = useState<{ slug: string; display_name: string; tier: string; compliance_stack: string[] }[]>([])
  const [benchmark, setBenchmark] = useState<VerticalBenchmark | null>(null)
  const [verticalQuestions, setVerticalQuestions] = useState<VerticalQuestion[]>([])

  const [baselineAnswers, setBaselineAnswers] = useState<Record<BaselineKey, boolean | null>>({
    has_wvpp: null,
    wvpp_site_specific: null,
    has_incident_log: null,
    pii_stripped: null,
    training_current: null,
    audit_ready: null,
    has_iipp: null,
    iipp_current: null,
    has_eap: null,
    has_hazcom: null,
    osha_300_current: null,
  })
  const [verticalAnswers, setVerticalAnswers] = useState<Record<string, boolean | null>>({})
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [, setSavingAnonymous] = useState(false)

  /* ─── Load verticals on mount ─── */
  useEffect(() => {
    getVerticals().then(setVerticals)
  }, [])

  /* ─── When industry changes, load benchmark + vertical questions ─── */
  useEffect(() => {
    if (!industry) return
    const v = verticals.find((vt) => vt.slug === industry)
    if (!v) return

    getVerticalBenchmark(industry).then(setBenchmark)
    const vqs = getVerticalQuestions(v.compliance_stack)
    setVerticalQuestions(vqs)

    // Initialize vertical answer state
    const initial: Record<string, boolean | null> = {}
    vqs.forEach((q) => { initial[q.key] = null })
    setVerticalAnswers(initial)
  }, [industry, verticals])

  /* ─── Derived ─── */
  const allBaselineAnswered = Object.values(baselineAnswers).every((v) => v !== null)
  const allVerticalAnswered = verticalQuestions.length === 0 || Object.values(verticalAnswers).every((v) => v !== null)
  const hasVerticalPhase = verticalQuestions.length > 0

  const baselineYesCount = Object.values(baselineAnswers).filter((v) => v === true).length
  const verticalYesCount = Object.values(verticalAnswers).filter((v) => v === true).length
  const maxScore = 11 + verticalQuestions.length

  const liveResult = useMemo(() => {
    if (!allBaselineAnswered || (hasVerticalPhase && !allVerticalAnswered)) return null

    const full: ScoreAnswers = {
      industry,
      employee_count: employeeCount,
      has_wvpp: !!baselineAnswers.has_wvpp,
      wvpp_site_specific: !!baselineAnswers.wvpp_site_specific,
      has_incident_log: !!baselineAnswers.has_incident_log,
      pii_stripped: !!baselineAnswers.pii_stripped,
      training_current: !!baselineAnswers.training_current,
      audit_ready: !!baselineAnswers.audit_ready,
      has_iipp: !!baselineAnswers.has_iipp,
      iipp_current: !!baselineAnswers.iipp_current,
      has_eap: !!baselineAnswers.has_eap,
      has_hazcom: !!baselineAnswers.has_hazcom,
      osha_300_current: !!baselineAnswers.osha_300_current,
      vertical_answers: hasVerticalPhase
        ? Object.fromEntries(Object.entries(verticalAnswers).map(([k, v]) => [k, !!v]))
        : undefined,
    }
    return calculateScore(full)
  }, [allBaselineAnswered, allVerticalAnswered, hasVerticalPhase, baselineAnswers, verticalAnswers, industry, employeeCount])

  /* ─── Handlers ─── */
  function toggleBaseline(key: BaselineKey, value: boolean) {
    setBaselineAnswers((prev) => ({ ...prev, [key]: value }))
  }

  function toggleVertical(key: string, value: boolean) {
    setVerticalAnswers((prev) => ({ ...prev, [key]: value }))
  }

  function handleStartAssessment() {
    if (!industry || !employeeCount) return
    setStep("baseline")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleChangeContext() {
    setStep("hero")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleBaselineDone() {
    if (hasVerticalPhase) {
      setStep("vertical")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      submitAndShowResults()
    }
  }

  function handleVerticalDone() {
    submitAndShowResults()
  }

  const submitAndShowResults = useCallback(async () => {
    if (!liveResult) return
    setResult(liveResult)
    setStep("results")
    window.scrollTo({ top: 0, behavior: "smooth" })

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
            has_wvpp: !!baselineAnswers.has_wvpp,
            wvpp_site_specific: !!baselineAnswers.wvpp_site_specific,
            has_incident_log: !!baselineAnswers.has_incident_log,
            pii_stripped: !!baselineAnswers.pii_stripped,
            training_current: !!baselineAnswers.training_current,
            audit_ready: !!baselineAnswers.audit_ready,
            has_iipp: !!baselineAnswers.has_iipp,
            iipp_current: !!baselineAnswers.iipp_current,
            has_eap: !!baselineAnswers.has_eap,
            has_hazcom: !!baselineAnswers.has_hazcom,
            osha_300_current: !!baselineAnswers.osha_300_current,
            vertical_answers: hasVerticalPhase
              ? Object.fromEntries(Object.entries(verticalAnswers).map(([k, v]) => [k, !!v]))
              : undefined,
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
  }, [liveResult, industry, employeeCount, baselineAnswers, verticalAnswers, hasVerticalPhase, searchParams])

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
    setBaselineAnswers({
      has_wvpp: null, wvpp_site_specific: null, has_incident_log: null,
      pii_stripped: null, training_current: null, audit_ready: null,
      has_iipp: null, iipp_current: null, has_eap: null,
      has_hazcom: null, osha_300_current: null,
    })
    setVerticalAnswers({})
    setExpandedHelp(null)
    setLeadId(null)
    setResult(null)
    setBenchmark(null)
    setVerticalQuestions([])
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const selectedVertical = verticals.find((v) => v.slug === industry)

  /* ─── Progress bar component ─── */
  function renderProgress(answered: number, total: number) {
    const pct = Math.round((answered / total) * 100)
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-sans text-[13px] text-steel">{answered} of {total} answered</span>
          <span className="font-sans text-[13px] font-medium text-midnight">{pct}%</span>
        </div>
        <div className="h-1.5 bg-ash/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: pct === 100 ? "#10B981" : "#C41230" }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>
    )
  }

  /* ─── Shared question card renderer ─── */
  function renderQuestionCard(
    q: { key: string; question: string; help?: string },
    val: boolean | null,
    toggle: (key: string, value: boolean) => void,
    index: number
  ) {
    const isYes = val === true
    const isNo = val === false
    const helpOpen = expandedHelp === q.key
    return (
      <div
        key={q.key}
        className={`bg-brand-white border p-5 flex flex-col transition-all ${
          isYes
            ? "border-l-[3px] border-l-[#10B981] border-t-midnight/[0.08] border-r-midnight/[0.08] border-b-midnight/[0.08]"
            : isNo
              ? "border-l-[3px] border-l-crimson border-t-midnight/[0.08] border-r-midnight/[0.08] border-b-midnight/[0.08]"
              : "border-midnight/[0.08]"
        }`}
      >
        <div className="flex items-start gap-4">
          <span className="font-display text-[12px] font-semibold text-steel/50 mt-0.5 shrink-0 w-6">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <p className="font-sans text-[14px] font-medium text-midnight leading-snug flex-1">
                {q.question}
              </p>
              {q.help && (
                <button
                  onClick={() => setExpandedHelp(helpOpen ? null : q.key)}
                  className="text-steel hover:text-midnight transition-colors shrink-0 mt-0.5"
                  aria-label="Toggle help"
                >
                  <Question size={16} weight="bold" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {helpOpen && q.help && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-sans text-[13px] text-steel mt-2 overflow-hidden leading-relaxed"
                >
                  {q.help}
                </motion.p>
              )}
            </AnimatePresence>

            {/* YES / NO buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => toggle(q.key, true)}
                className={`flex-1 py-2.5 px-4 text-[13px] font-semibold uppercase tracking-[1px] border transition-all ${
                  isYes
                    ? "bg-[#10B981] text-white border-[#10B981]"
                    : "bg-transparent text-steel border-midnight/[0.12] hover:border-[#10B981]/40 hover:text-[#10B981]"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => toggle(q.key, false)}
                className={`flex-1 py-2.5 px-4 text-[13px] font-semibold uppercase tracking-[1px] border transition-all ${
                  isNo
                    ? "bg-crimson text-white border-crimson"
                    : "bg-transparent text-steel border-midnight/[0.12] hover:border-crimson/40 hover:text-crimson"
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ─── RENDER ─── */
  return (
    <div className="min-h-screen bg-brand-white">
      <Nav />

      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════ */}
        {/* HERO                                            */}
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
              <span className="font-display text-[13px] font-semibold uppercase tracking-[0.1em] text-crimson">
                Free Compliance Assessment
              </span>

              <h1 className="font-display text-[30px] md:text-[44px] font-bold text-midnight tracking-tight mt-4 leading-[1.05]">
                Would you pass a Cal/OSHA inspection today?
              </h1>

              <p className="font-sans text-[17px] text-steel leading-relaxed max-w-[600px] mt-4">
                Answer {hasVerticalPhase ? `${maxScore}` : "11"} compliance questions. Your score calculated in real
                time against {benchmark ? formatNumber(benchmark.national_violations) : "435,000+"} real enforcement records. No email required.
              </p>

              <p className="font-sans text-[13px] text-steel/60 mt-3">
                Takes 2 minutes. Based on Cal/OSHA Title 8, SB 553, and federal OSHA standards.
              </p>

              <div className="mt-12">
                <h3 className="font-display text-[18px] font-semibold text-midnight mb-6">
                  Tell us about your business
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-display font-semibold text-[13px] text-midnight block mb-1.5">
                      Industry
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-brand-white border border-midnight/[0.15] text-midnight font-sans text-[15px] px-4 py-3 focus:outline-none focus:border-crimson/50 transition-colors"
                    >
                      <option value="" disabled>Select your industry</option>
                      {verticals.length > 0 ? (
                        <>
                          <optgroup label="Primary Markets">
                            {verticals.filter((v) => v.tier === "tier_1").map((v) => (
                              <option key={v.slug} value={v.slug}>{v.display_name}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Secondary Markets">
                            {verticals.filter((v) => v.tier === "tier_2").map((v) => (
                              <option key={v.slug} value={v.slug}>{v.display_name}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Emerging Markets">
                            {verticals.filter((v) => v.tier === "tier_3").map((v) => (
                              <option key={v.slug} value={v.slug}>{v.display_name}</option>
                            ))}
                          </optgroup>
                        </>
                      ) : (
                        <option disabled>Loading industries...</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="font-display font-semibold text-[13px] text-midnight block mb-1.5">
                      Employee Count
                    </label>
                    <select
                      value={employeeCount}
                      onChange={(e) => setEmployeeCount(e.target.value)}
                      className="w-full bg-brand-white border border-midnight/[0.15] text-midnight font-sans text-[15px] px-4 py-3 focus:outline-none focus:border-crimson/50 transition-colors"
                    >
                      <option value="" disabled>Select employee count</option>
                      {EMPLOYEE_COUNTS.map((ec) => (
                        <option key={ec} value={ec}>{ec} employees</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Enforcement data preview */}
                {benchmark && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-parchment border border-midnight/[0.06] p-4"
                  >
                    <p className="font-sans text-[14px] text-midnight leading-relaxed">
                      <strong className="font-semibold">{benchmark.display_name}</strong> has{" "}
                      <strong className="font-semibold text-crimson">{formatNumber(benchmark.national_violations)}</strong>{" "}
                      recorded violations and{" "}
                      <strong className="font-semibold text-crimson">{formatCurrency(benchmark.national_penalties_usd)}</strong>{" "}
                      in penalties.{" "}
                      <strong className="font-semibold">{benchmark.serious_pct}%</strong> were serious violations.
                    </p>
                  </motion.div>
                )}

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
        {/* PHASE 1 — BASELINE QUESTIONS (11)               */}
        {/* ═══════════════════════════════════════════════ */}
        {step === "baseline" && (
          <motion.section
            key="baseline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="pt-32 pb-20 px-6 lg:px-8"
          >
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between bg-parchment border border-midnight/[0.08] px-4 py-3 mb-8">
                <span className="font-sans text-[14px] text-midnight">
                  {selectedVertical?.display_name ?? industry} &middot; {employeeCount} employees
                </span>
                <button
                  onClick={handleChangeContext}
                  className="font-sans text-[13px] text-crimson hover:text-crimson/80 transition-colors underline underline-offset-2"
                >
                  Change
                </button>
              </div>

              <h2 className="font-display text-[22px] font-bold text-midnight mb-2">
                Platform-Wide Compliance
              </h2>
              <p className="font-sans text-[14px] text-steel mb-6">
                11 requirements that apply to every California employer.
                {hasVerticalPhase && ` You'll also answer ${verticalQuestions.length} ${selectedVertical?.display_name}-specific question${verticalQuestions.length === 1 ? "" : "s"} next.`}
              </p>

              {renderProgress(
                Object.values(baselineAnswers).filter((v) => v !== null).length,
                BASELINE_QUESTIONS.length
              )}

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
                <div className="flex flex-col gap-3">
                  {BASELINE_QUESTIONS.map((q, i) =>
                    renderQuestionCard(q, baselineAnswers[q.key], (key, val) => toggleBaseline(key as BaselineKey, val), i)
                  )}

                  <div className="mt-4">
                    <button
                      onClick={handleBaselineDone}
                      disabled={!allBaselineAnswered}
                      className="inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[15px] uppercase tracking-[2px] w-full py-4 hover:bg-crimson/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {hasVerticalPhase ? `Next: ${selectedVertical?.display_name} Questions` : "See My Results"}
                      <ArrowRight size={16} weight="bold" />
                    </button>
                    {!allBaselineAnswered && (
                      <p className="font-sans text-[12px] text-steel/60 text-center mt-2">
                        Answer all {BASELINE_QUESTIONS.length} questions to continue
                      </p>
                    )}
                  </div>
                </div>

                <div className="hidden lg:block">
                  <div className="sticky top-24">
                    <div className="flex justify-center">
                      <ScoreRing score={baselineYesCount + verticalYesCount} max={maxScore} size={160} />
                    </div>
                    <p className="font-sans text-[12px] text-steel text-center mt-3">
                      {baselineYesCount + verticalYesCount} / {maxScore} compliant
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile score bar — positioned below nav */}
              <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-brand-white border-b border-midnight/[0.08] h-12 flex items-center justify-between px-6">
                <span className="font-sans text-[13px] text-steel">Compliance Score</span>
                <span
                  className="font-display text-[20px] font-bold"
                  style={{
                    color: baselineYesCount >= 10 ? "#10B981" : baselineYesCount >= 7 ? "#C9A84C" : "#C41230",
                  }}
                >
                  {baselineYesCount}/{11}
                </span>
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* PHASE 2 — VERTICAL QUESTIONS                    */}
        {/* ═══════════════════════════════════════════════ */}
        {step === "vertical" && (
          <motion.section
            key="vertical"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="pt-32 pb-20 px-6 lg:px-8"
          >
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between bg-parchment border border-midnight/[0.08] px-4 py-3 mb-8">
                <span className="font-sans text-[14px] text-midnight">
                  {selectedVertical?.display_name ?? industry} &middot; {employeeCount} employees
                  &middot; Baseline: {baselineYesCount}/11
                </span>
                <button
                  onClick={() => { setStep("baseline"); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                  className="font-sans text-[13px] text-crimson hover:text-crimson/80 transition-colors underline underline-offset-2"
                >
                  Back
                </button>
              </div>

              <h2 className="font-display text-[22px] font-bold text-midnight mb-2">
                {selectedVertical?.display_name} Requirements
              </h2>
              <p className="font-sans text-[14px] text-steel mb-6">
                {verticalQuestions.length} additional requirement{verticalQuestions.length === 1 ? "" : "s"} specific to your industry.
              </p>

              {renderProgress(
                Object.values(verticalAnswers).filter((v) => v !== null).length,
                verticalQuestions.length
              )}

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
                <div className="flex flex-col gap-3">
                  {verticalQuestions.map((q, i) =>
                    renderQuestionCard(
                      { key: q.key, question: q.question, help: q.help },
                      verticalAnswers[q.key] ?? null,
                      (key, val) => toggleVertical(key, val),
                      i
                    )
                  )}

                  <div className="mt-4">
                    <button
                      onClick={handleVerticalDone}
                      disabled={!allVerticalAnswered}
                      className="inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[15px] uppercase tracking-[2px] w-full py-4 hover:bg-crimson/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      See My Results
                      <ArrowRight size={16} weight="bold" />
                    </button>
                    {!allVerticalAnswered && (
                      <p className="font-sans text-[12px] text-steel/60 text-center mt-2">
                        Answer all {verticalQuestions.length} questions to continue
                      </p>
                    )}
                  </div>
                </div>

                <div className="hidden lg:block">
                  <div className="sticky top-24">
                    <div className="flex justify-center">
                      <ScoreRing score={baselineYesCount + verticalYesCount} max={maxScore} size={160} />
                    </div>
                    <p className="font-sans text-[12px] text-steel text-center mt-3">
                      {baselineYesCount + verticalYesCount} / {maxScore} compliant
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* RESULTS                                         */}
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
              {/* Score Result Card */}
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
                      max={result.max_score}
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
                        <h2 className="font-display text-[28px] font-bold text-[#10B981]">Fully Compliant</h2>
                        <p className="font-sans text-[15px] text-steel leading-relaxed mt-2">
                          You passed all {result.max_score} checks. Your compliance posture is
                          strong. Stay current with annual refreshes and regulatory monitoring.
                        </p>
                      </>
                    )}
                    {result.tier === "yellow" && (
                      <>
                        <h2 className="font-display text-[28px] font-bold text-[#C9A84C]">Gaps Detected</h2>
                        <p className="font-sans text-[15px] text-steel leading-relaxed mt-2">
                          You have {result.gaps.length} compliance{" "}
                          {result.gaps.length === 1 ? "gap" : "gaps"} that could
                          result in citations. Each gap is a separate violation with its own fine.
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
                          {result.gaps.length} open gaps mean multiple citable violations if inspected.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Gap Analysis Cards */}
              {result.gaps.length > 0 && (
                <div className="mt-10">
                  <h3 className="font-display text-[18px] font-semibold text-midnight mb-4">
                    Your Compliance Gaps
                  </h3>
                  <GapCards gaps={result.gaps} />
                </div>
              )}

              {/* Fine Exposure Summary */}
              {result.gaps.length > 0 && (
                <div className={`mt-10 p-6 border ${result.tier === "yellow" ? "border-[#C9A84C]/30" : "border-crimson/30"}`}>
                  <p className="font-sans text-[13px] text-steel mb-1">Total estimated fine exposure</p>
                  <p className="font-mono text-[32px] font-bold text-crimson">
                    {formatCurrency(result.fine_low)}&ndash;{formatCurrency(result.fine_high)}
                  </p>

                  <div className="mt-6 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-sans text-[13px] text-steel">Cal/OSHA fine exposure</span>
                        <span className="font-mono text-[13px] text-crimson font-semibold">{formatCurrency(result.fine_high)}</span>
                      </div>
                      <div className="h-3 bg-crimson/20 w-full"><div className="h-full bg-crimson w-full" /></div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-sans text-[13px] text-steel">PROTEKON annual cost</span>
                        <span className="font-mono text-[13px] text-[#10B981] font-semibold">$7,164/yr</span>
                      </div>
                      <div className="h-3 bg-[#10B981]/20 w-full">
                        <div className="h-full bg-[#10B981]" style={{ width: `${Math.min(100, (7164 / result.fine_high) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Real Enforcement Data Benchmark */}
              {benchmark && (
                <div className="bg-parchment p-5 mt-10">
                  <p className="font-sans text-[14px] text-midnight leading-relaxed">
                    Your score is measured against{" "}
                    <strong className="font-semibold text-crimson">{formatNumber(benchmark.national_violations)}</strong>{" "}
                    real {benchmark.display_name.toLowerCase()} violations and{" "}
                    <strong className="font-semibold text-crimson">{formatCurrency(benchmark.national_penalties_usd)}</strong>{" "}
                    in real penalties.{" "}
                    <strong className="font-semibold">{benchmark.serious_pct}%</strong> of violations in your industry
                    are classified as serious — each carrying penalties of $18,000+.
                  </p>
                </div>
              )}

              {/* Cost Comparison Table */}
              {result.gaps.length > 0 && (
                <div className="mt-10 overflow-x-auto">
                  <table className="w-full border border-midnight/[0.08]">
                    <thead>
                      <tr className="bg-parchment">
                        <th className="text-left font-display text-[13px] font-semibold text-midnight p-3 border-b border-midnight/[0.08]">Compliance Area</th>
                        <th className="text-right font-display text-[13px] font-semibold text-midnight p-3 border-b border-midnight/[0.08]">Cal/OSHA Fine</th>
                        <th className="text-right font-display text-[13px] font-semibold text-midnight p-3 border-b border-midnight/[0.08]">PROTEKON Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.gaps.map((gap) => (
                        <tr key={gap.key} className="border-b border-midnight/[0.06]">
                          <td className="font-sans text-[14px] text-midnight p-3">{gap.label}</td>
                          <td className="font-mono text-[14px] text-crimson text-right p-3">{formatCurrency(gap.citation_amount)}</td>
                          <td className="font-mono text-[14px] text-[#10B981] text-right p-3">Included</td>
                        </tr>
                      ))}
                      <tr className="bg-parchment/50">
                        <td className="font-display text-[14px] font-semibold text-midnight p-3">Total</td>
                        <td className="font-mono text-[14px] font-bold text-crimson text-right p-3">{formatCurrency(result.fine_high)}</td>
                        <td className="font-mono text-[14px] font-bold text-[#10B981] text-right p-3">$597/mo</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* PDF Gate */}
              <PdfGateForm leadId={leadId} onCapture={handlePdfCapture} />

              {/* Post-Download CTAs */}
              <div className="mt-16">
                <h2 className="font-display text-[32px] font-bold text-midnight mb-6">
                  Ready to close these gaps in 48 hours?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link href="/contact" className="flex flex-col items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[14px] uppercase tracking-[1.5px] p-6 text-center hover:bg-crimson/90 transition-colors">
                    Start My Intake
                    <ArrowRight size={16} weight="bold" />
                  </Link>
                  <Link href="/sample-reports" className="flex flex-col items-center justify-center gap-2 bg-brand-white border border-midnight/[0.12] text-midnight font-display font-semibold text-[14px] uppercase tracking-[1.5px] p-6 text-center hover:border-crimson/30 transition-colors">
                    See a Sample Plan
                  </Link>
                  <a href="#" className="flex flex-col items-center justify-center gap-2 bg-brand-white border border-midnight/[0.12] text-midnight font-display font-semibold text-[14px] uppercase tracking-[1.5px] p-6 text-center hover:border-crimson/30 transition-colors">
                    Book a 15-Minute Call
                  </a>
                </div>
              </div>

              {/* Retake + Legal */}
              <div className="mt-16 flex flex-col items-center">
                <button
                  onClick={handleRetake}
                  className="inline-flex items-center gap-2 font-sans text-[14px] text-crimson hover:text-crimson/80 transition-colors underline underline-offset-2"
                >
                  <CaretUp size={14} weight="bold" />
                  Retake Assessment
                </button>
                <p className="font-sans text-[13px] text-steel/60 text-center max-w-[640px] mx-auto mt-6">
                  This assessment is for informational purposes only and does not constitute legal advice.
                  Results are based on self-reported answers and{" "}
                  {benchmark ? formatNumber(benchmark.national_violations) : "435,000+"} real Cal/OSHA
                  enforcement records. Fine estimates represent actual citation amounts per standard and
                  actual penalties may vary. Consult a qualified compliance professional for specific guidance.
                  PROTEKON is not a law firm.
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
