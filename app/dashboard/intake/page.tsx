"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ShieldCheck, ArrowRight, Warning, CheckCircle, XCircle, Buildings } from "@phosphor-icons/react"
import { submitIntake, getIntakeStatus, type IntakeAnswers } from "@/lib/actions/intake"

type PlanId = "core" | "professional" | "multi-site"

const plans: { id: PlanId; name: string; price: string; description: string; features: string[] }[] = [
  {
    id: "core",
    name: "Core",
    price: "$597",
    description: "Essential compliance for single-location businesses",
    features: [
      "WVPP + IIPP documents",
      "Incident log system",
      "Quarterly regulatory updates",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: "$897",
    description: "Full compliance suite with quarterly reviews",
    features: [
      "Everything in Core",
      "Quarterly compliance reviews",
      "Training program management",
      "Priority support",
    ],
  },
  {
    id: "multi-site",
    name: "Multi-Site",
    price: "$1,297",
    description: "Enterprise compliance across multiple locations",
    features: [
      "Everything in Professional",
      "Annual audit report",
      "Multi-location management",
      "Dedicated compliance officer",
    ],
  },
]

const questions: { key: keyof IntakeAnswers; label: string; description: string }[] = [
  {
    key: "wvpp_drafted",
    label: "Workplace Violence Prevention Plan",
    description: "Has your organization drafted a written WVPP per SB 553?",
  },
  {
    key: "training_completed",
    label: "Employee Safety Training",
    description: "Have all employees completed required safety and compliance training?",
  },
  {
    key: "incident_log_active",
    label: "Incident Logging System",
    description: "Do you have an active system for logging workplace incidents?",
  },
  {
    key: "hazards_identified",
    label: "Hazard Identification",
    description: "Have workplace hazards been identified and documented?",
  },
  {
    key: "reporting_policy",
    label: "Reporting Policy",
    description: "Is your reporting policy published and accessible to all employees?",
  },
  {
    key: "union_confirmed",
    label: "Union Status Confirmed",
    description: "Has union involvement been confirmed and documented if applicable?",
  },
]

export default function IntakePage() {
  const router = useRouter()
  const [answers, setAnswers] = useState<IntakeAnswers>({
    wvpp_drafted: false,
    training_completed: false,
    incident_log_active: false,
    hazards_identified: false,
    reporting_policy: false,
    union_confirmed: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; score?: number; riskLevel?: string; error?: string } | null>(null)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [step, setStep] = useState<"assessment" | "plan">("assessment")
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("core")

  useEffect(() => {
    getIntakeStatus().then((status) => {
      if (status.completed) {
        setAlreadyCompleted(true)
        setResult({ success: true, score: status.score, riskLevel: status.riskLevel })
      }
    })
  }, [])

  const yesCount = Object.values(answers).filter(Boolean).length
  const totalQuestions = questions.length
  const percentage = Math.round((yesCount / totalQuestions) * 100)
  const riskLevel = percentage >= 75 ? "low" : percentage >= 50 ? "medium" : "high"
  const riskLabel = riskLevel === "low" ? "On Track" : riskLevel === "medium" ? "At Risk" : "Critical"

  // SVG ring math
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (circumference * yesCount) / totalQuestions

  const riskColors: Record<string, { text: string; bg: string; ring: string }> = {
    low: { text: "text-emerald-600", bg: "bg-emerald-600/10", ring: "stroke-emerald-600" },
    medium: { text: "text-amber-500", bg: "bg-amber-500/10", ring: "stroke-amber-500" },
    high: { text: "text-crimson", bg: "bg-crimson/10", ring: "stroke-crimson" },
  }
  const colors = riskColors[riskLevel]

  function toggleAnswer(key: keyof IntakeAnswers) {
    setAnswers((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSubmit() {
    setStep("plan")
  }

  async function handleFinalSubmit() {
    setSubmitting(true)
    const res = await submitIntake({ ...answers, plan: selectedPlan } as IntakeAnswers & { plan: string })
    setResult(res)
    setSubmitting(false)

    if (res.success) {
      setTimeout(() => router.push("/dashboard"), 3000)
    }
  }

  // Success state
  if (result?.success) {
    const finalScore = result.score ?? percentage
    const finalRisk = result.riskLevel ?? riskLevel
    const finalColors = riskColors[finalRisk]
    const finalLabel = finalRisk === "low" ? "On Track" : finalRisk === "medium" ? "At Risk" : "Critical"

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-brand-white border border-midnight/[0.08] p-10 text-center"
        >
          <div className={`w-16 h-16 mx-auto flex items-center justify-center ${finalColors.bg} mb-6`}>
            <ShieldCheck size={32} weight="fill" className={finalColors.text} />
          </div>
          <h2 className="font-display font-black text-[28px] text-midnight mb-2">
            {alreadyCompleted ? "Assessment Complete" : "Assessment Submitted"}
          </h2>
          <p className="font-sans text-[15px] text-steel mb-8">
            {alreadyCompleted
              ? "You have already completed your compliance assessment."
              : "Your compliance package will be delivered within 48 hours."}
          </p>

          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <span className={`font-display font-black text-[48px] ${finalColors.text}`}>
                {finalScore}%
              </span>
              <p className="font-display font-semibold text-[10px] tracking-[2px] uppercase text-steel mt-1">
                Compliance Score
              </p>
            </div>
            <div className="w-px h-16 bg-ash" />
            <div className="text-center">
              <span className={`inline-block px-3 py-1.5 font-display font-bold text-[11px] tracking-[1px] uppercase ${finalColors.text} ${finalColors.bg}`}>
                {finalLabel}
              </span>
              <p className="font-display font-semibold text-[10px] tracking-[2px] uppercase text-steel mt-3">
                Risk Level
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase py-4 flex items-center justify-center gap-3 hover:bg-crimson/90 transition-colors"
          >
            Go to Dashboard
            <ArrowRight size={16} weight="bold" />
          </button>
        </motion.div>
      </div>
    )
  }

  // Plan selection step
  if (step === "plan") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setStep("assessment")}
              className="font-display text-[10px] tracking-[2px] uppercase text-steel hover:text-midnight transition-colors"
            >
              &larr; Back
            </button>
          </div>
          <h1 className="font-display font-black text-[32px] text-midnight mb-2">
            Choose Your Plan
          </h1>
          <p className="font-sans text-[15px] text-steel max-w-xl">
            Select the compliance tier that fits your business. You can upgrade at any time.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan, i) => (
            <motion.button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className={`text-left p-6 border-2 transition-colors ${
                selectedPlan === plan.id
                  ? "border-crimson bg-crimson/[0.03]"
                  : "border-midnight/[0.08] bg-brand-white hover:border-midnight/20"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-[18px] text-midnight">
                    {plan.name}
                  </h3>
                  <p className="font-sans text-[13px] text-steel mt-1">{plan.description}</p>
                </div>
                {selectedPlan === plan.id && (
                  <CheckCircle size={20} weight="fill" className="text-crimson flex-shrink-0 mt-0.5" />
                )}
              </div>
              <div className="mb-5">
                <span className="font-display font-black text-[32px] text-midnight">{plan.price}</span>
                <span className="font-sans text-[13px] text-steel">/mo</span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle size={14} weight="fill" className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="font-sans text-[12px] text-steel">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.button>
          ))}
        </div>

        <motion.button
          onClick={handleFinalSubmit}
          disabled={submitting}
          className="w-full bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase py-4 flex items-center justify-center gap-3 hover:bg-crimson/90 transition-colors disabled:opacity-70"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />
          ) : (
            <>
              Start with {plans.find((p) => p.id === selectedPlan)?.name} — {plans.find((p) => p.id === selectedPlan)?.price}/mo
              <ArrowRight size={16} weight="bold" />
            </>
          )}
        </motion.button>

        <p className="font-sans text-[11px] text-steel/60 text-center mt-4">
          Your custom compliance package will be delivered within 48 hours.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="font-display font-black text-[32px] text-midnight mb-2">
          Compliance Posture Assessment
        </h1>
        <p className="font-sans text-[15px] text-steel max-w-xl">
          Answer 6 questions about your current compliance status. This assessment determines
          your Compliance Posture Score and customizes your compliance package.
        </p>
      </motion.div>

      {/* Main content: Questions + Score Ring */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Questions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 bg-brand-white border border-midnight/[0.08] p-8"
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-ash">
            <h2 className="font-display font-bold text-[16px] text-midnight">
              Compliance Checklist
            </h2>
            <span className="font-mono text-[11px] text-steel bg-parchment px-3 py-1">
              {yesCount}/{totalQuestions} Complete
            </span>
          </div>

          <div className="space-y-2">
            {questions.map(({ key, label, description }, i) => (
              <motion.button
                key={key}
                type="button"
                onClick={() => toggleAnswer(key)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className={`w-full flex items-start gap-4 p-4 text-left transition-colors ${
                  answers[key]
                    ? "bg-emerald-600/[0.04] border border-emerald-600/20"
                    : "bg-parchment/50 border border-transparent hover:border-midnight/[0.08]"
                }`}
              >
                <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center mt-0.5 ${
                  answers[key] ? "bg-emerald-600 text-white" : "border-2 border-steel/30"
                }`}>
                  {answers[key] && <CheckCircle size={14} weight="bold" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-display font-semibold text-[14px] text-midnight block">
                    {label}
                  </span>
                  <span className="font-sans text-[13px] text-steel mt-0.5 block">
                    {description}
                  </span>
                </div>
                <span className={`flex-shrink-0 px-3 py-1 font-display font-bold text-[9px] tracking-[1px] uppercase ${
                  answers[key]
                    ? "bg-emerald-600/10 text-emerald-600"
                    : "bg-crimson/10 text-crimson"
                }`}>
                  {answers[key] ? "Yes" : "No"}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Score Ring + Action */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full lg:w-[320px] space-y-6"
        >
          {/* Score Card */}
          <div className="bg-brand-white border border-midnight/[0.08] p-8 flex flex-col items-center">
            <h3 className="font-display font-semibold text-[10px] tracking-[2px] uppercase text-steel mb-6">
              Compliance Score
            </h3>

            {/* Ring */}
            <div className="relative flex items-center justify-center mb-6">
              <svg className="w-[140px] h-[140px] -rotate-90">
                <circle
                  className="stroke-ash"
                  cx="70" cy="70" r={radius}
                  fill="none" strokeWidth="10"
                />
                <circle
                  className={colors.ring}
                  cx="70" cy="70" r={radius}
                  fill="none" strokeWidth="10"
                  strokeLinecap="square"
                  strokeDasharray={String(circumference)}
                  strokeDashoffset={String(offset)}
                  style={{ transition: "stroke-dashoffset 0.4s ease" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`font-display font-black text-[32px] leading-none ${colors.text}`}>
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Risk Badge */}
            <span className={`px-4 py-1.5 font-display font-bold text-[10px] tracking-[2px] uppercase ${colors.text} ${colors.bg} ${riskLevel === "high" ? "animate-pulse" : ""}`}>
              {riskLabel}
            </span>

            {/* Gaps */}
            {yesCount < totalQuestions && (
              <div className="mt-6 pt-6 border-t border-ash w-full">
                <p className="font-display font-semibold text-[10px] tracking-[1px] uppercase text-steel mb-3">
                  Gaps Detected
                </p>
                <div className="space-y-2">
                  {questions
                    .filter(({ key }) => !answers[key])
                    .map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2">
                        <XCircle size={14} weight="fill" className="text-crimson flex-shrink-0" />
                        <span className="font-sans text-[12px] text-steel">{label}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Exposure Warning */}
          <div className="bg-crimson/[0.04] border border-crimson/20 p-6">
            <div className="flex items-start gap-3 mb-3">
              <Warning size={20} weight="fill" className="text-crimson flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display font-bold text-[14px] text-crimson">
                  Fine Exposure
                </h4>
                <p className="font-sans text-[13px] text-steel mt-1">
                  Your AI compliance officer has identified{" "}
                  <span className="font-bold text-crimson">{totalQuestions - yesCount}</span> compliance
                  gaps. Average serious violation:{" "}
                  <span className="font-bold text-crimson">$7,229</span>. Submit your assessment and the
                  agent will begin generating your compliance documents immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase py-4 flex items-center justify-center gap-3 hover:bg-crimson/90 transition-colors disabled:opacity-70"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />
            ) : (
              <>
                Submit Assessment
                <ArrowRight size={16} weight="bold" />
              </>
            )}
          </motion.button>

          <p className="font-sans text-[11px] text-steel/60 text-center">
            Your custom compliance package will be delivered within 48 hours.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
