"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Check, Clock, Rocket, ChartLineUp } from "@phosphor-icons/react"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import type { PartnerApplication } from "@/lib/types/partner"
import { getVerticals } from "@/lib/actions/score"

/* ─── Constants ─── */

const BUSINESS_TYPES = [
  "Insurance Broker/Agent",
  "PEO",
  "Safety Consultant",
  "HR Consulting Firm",
  "Trade/Industry Association",
  "Business Attorney",
  "Payroll Company",
  "Accounting/Bookkeeping Firm",
  "Other",
]

const CLIENT_COUNTS = ["1-10", "11-25", "26-50", "51-100", "100+"]

// Loaded dynamically from verticals table — see useEffect below
const STATIC_CLIENT_INDUSTRIES = ["Multiple/mixed"]
const STATIC_COMPLIANCE_EXTRAS = ["All of them", "Not sure yet"]

const EXPERIENCE_OPTIONS = [
  { value: "yes_currently", label: "Yes, currently offering" },
  { value: "yes_stopped", label: "Yes, but stopped" },
  { value: "no_new", label: "No, this would be new" },
]

const PARTNER_TIERS = [
  {
    value: "free",
    name: "Free",
    price: "$0",
    description: "1 client included. Test the platform.",
  },
  {
    value: "essentials",
    name: "Essentials",
    price: "$149",
    period: "/client",
    description: "Up to 10 clients. Full portal access.",
  },
  {
    value: "professional",
    name: "Professional",
    price: "$249",
    period: "/client",
    description: "Up to 50 clients. Priority support.",
  },
  {
    value: "enterprise",
    name: "Enterprise",
    price: "$399",
    period: "/client",
    description: "Unlimited clients. Dedicated account manager.",
  },
]

const REFERRAL_SOURCES = [
  "Google search",
  "LinkedIn",
  "Instagram/Facebook ad",
  "Industry conference",
  "Referral from another partner",
  "Referral from a client",
  "PROTEKON blog/content",
  "Other",
]

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

/* ─── Component ─── */

export default function PartnerApplyPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [industryOptions, setIndustryOptions] = useState<string[]>(STATIC_CLIENT_INDUSTRIES)
  const [verticalOptions, setVerticalOptions] = useState<string[]>(STATIC_COMPLIANCE_EXTRAS)

  useEffect(() => {
    getVerticals().then((verts) => {
      const names = verts.map((v) => v.display_name)
      setIndustryOptions([...names, ...STATIC_CLIENT_INDUSTRIES])
      setVerticalOptions([...names.map((n) => `${n} Safety`), ...STATIC_COMPLIANCE_EXTRAS])
    })
  }, [])

  /* Form state */
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [website, setWebsite] = useState("")
  const [cityState, setCityState] = useState("")
  const [clientCount, setClientCount] = useState("")
  const [clientIndustries, setClientIndustries] = useState<string[]>([])
  const [verticals, setVerticals] = useState<string[]>([])
  const [experience, setExperience] = useState("")
  const [tier, setTier] = useState("")
  const [referralSource, setReferralSource] = useState("")
  const [notes, setNotes] = useState("")

  function toggleArrayItem(arr: string[], item: string, setter: (v: string[]) => void) {
    setter(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item])
  }

  const isValid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    businessName.trim() !== "" &&
    businessType !== "" &&
    cityState.trim() !== "" &&
    clientCount !== "" &&
    clientIndustries.length > 0 &&
    verticals.length > 0 &&
    experience !== "" &&
    tier !== ""

  async function handleSubmit() {
    if (!isValid) return
    setSubmitting(true)
    setError(null)

    const parts = cityState.split(",")
    const payload: PartnerApplication = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      business_name: businessName.trim(),
      business_type: businessType,
      website: website.trim() || undefined,
      city: parts[0]?.trim() || "",
      state: parts[1]?.trim() || "",
      client_count: clientCount,
      client_industries: clientIndustries,
      verticals_interested: verticals,
      previous_compliance_experience: experience,
      tier_interest: tier,
      referral_source: referralSource || undefined,
      notes: notes.trim() || undefined,
    }

    try {
      const res = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error("Something went wrong. Please try again.")
      }

      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  /* ─── Confirmation State ─── */
  if (submitted) {
    return (
      <main className="bg-void min-h-screen">
        <Nav />

        <section className="pt-32 pb-24 px-6 lg:px-8">
          <div className="max-w-[700px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <Check size={20} weight="bold" className="text-green-400" />
                </div>
                <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-green-400">
                  Application Received
                </span>
              </div>

              <h1 className="font-display font-black text-[clamp(32px,5vw,48px)] leading-[1.05] text-parchment mb-6">
                Application received.
                <br />
                Here&apos;s what happens next.
              </h1>

              <div className="flex flex-col gap-8 mt-12">
                {/* Step 1 */}
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 bg-crimson/10 border border-crimson/30 flex items-center justify-center">
                    <Clock size={24} weight="duotone" className="text-crimson" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-[16px] text-gold mb-1">
                      Within 24-48 hours
                    </p>
                    <p className="font-sans text-[15px] text-fog leading-relaxed">
                      You&apos;ll receive an approval email with your portal login,
                      margin projection, and your first assessment link.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 bg-crimson/10 border border-crimson/30 flex items-center justify-center">
                    <Rocket size={24} weight="duotone" className="text-crimson" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-[16px] text-gold mb-1">
                      Your first week
                    </p>
                    <p className="font-sans text-[15px] text-fog leading-relaxed">
                      Log in, complete Boot Camp, send your first assessment,
                      onboard your first client.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 bg-crimson/10 border border-crimson/30 flex items-center justify-center">
                    <ChartLineUp size={24} weight="duotone" className="text-crimson" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-[16px] text-gold mb-1">
                      Your first month
                    </p>
                    <p className="font-sans text-[15px] text-fog leading-relaxed">
                      Client plan delivered, collecting revenue, dashboard active.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 bg-midnight border border-brand-white/[0.06] p-6">
                <p className="font-sans text-[15px] text-fog">
                  Questions?{" "}
                  <a
                    href="mailto:partners@protekon.com"
                    className="text-crimson hover:text-crimson/80 underline underline-offset-2 transition-colors"
                  >
                    partners@protekon.com
                  </a>
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    )
  }

  /* ─── Form State ─── */
  return (
    <main className="bg-void min-h-screen">
      <Nav />

      {/* ───── HERO ───── */}
      <section className="pt-32 pb-16 px-6 lg:px-8">
        <div className="max-w-[700px] mx-auto text-center">
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-8 h-[2px] bg-gold" />
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              Partner Application
            </span>
            <div className="w-8 h-[2px] bg-gold" />
          </motion.div>

          <motion.h1
            className="font-display font-black text-[clamp(32px,5vw,48px)] leading-[1.05] text-parchment mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Tell us about your business.
            <br />
            We&apos;ll tell you how much you can make.
          </motion.h1>

          <motion.p
            className="font-sans text-[16px] text-fog max-w-[600px] mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            This takes 5 minutes. After we review (24-48 hours), you&apos;ll receive
            portal access, margin projection, and your first score assessment link.
          </motion.p>
        </div>
      </section>

      {/* ───── FORM ───── */}
      <section className="pb-24 px-6 lg:px-8">
        <div className="max-w-[700px] mx-auto flex flex-col gap-10">
          {/* ═══ Section 1 — About You ═══ */}
          <motion.div
            className="bg-midnight border border-brand-white/[0.06] p-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <h2 className="font-display font-bold text-[20px] text-parchment mb-1">
              About You
            </h2>
            <p className="font-sans text-[13px] text-steel mb-8">
              Your contact information.
            </p>

            <div className="flex flex-col gap-6">
              <div>
                <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                  Your name <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full bg-void border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 placeholder:text-steel/40 focus:outline-none focus:border-crimson/50 transition-colors"
                />
              </div>
              <div>
                <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                  Your email <span className="text-crimson">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-void border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 placeholder:text-steel/40 focus:outline-none focus:border-crimson/50 transition-colors"
                />
              </div>
              <div>
                <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                  Your phone{" "}
                  <span className="text-steel font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full bg-void border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 placeholder:text-steel/40 focus:outline-none focus:border-crimson/50 transition-colors"
                />
              </div>
            </div>
          </motion.div>

          {/* ═══ Section 2 — About Your Business ═══ */}
          <motion.div
            className="bg-midnight border border-brand-white/[0.06] p-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <h2 className="font-display font-bold text-[20px] text-parchment mb-1">
              About Your Business
            </h2>
            <p className="font-sans text-[13px] text-steel mb-8">
              Tell us about your firm and client base.
            </p>

            <div className="flex flex-col gap-6">
              <div>
                <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                  Business name <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your company name"
                  className="w-full bg-void border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 placeholder:text-steel/40 focus:outline-none focus:border-crimson/50 transition-colors"
                />
              </div>
              <div>
                <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                  Business type <span className="text-crimson">*</span>
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full bg-void border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 focus:outline-none focus:border-crimson/50 transition-colors"
                >
                  <option value="" disabled>
                    Select business type
                  </option>
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                  Business website{" "}
                  <span className="text-steel font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="w-full bg-void border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 placeholder:text-steel/40 focus:outline-none focus:border-crimson/50 transition-colors"
                />
              </div>
              <div>
                <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                  City and state <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  placeholder="Riverside, CA"
                  className="w-full bg-void border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 placeholder:text-steel/40 focus:outline-none focus:border-crimson/50 transition-colors"
                />
              </div>
              <div>
                <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                  How many clients do you currently serve? <span className="text-crimson">*</span>
                </label>
                <select
                  value={clientCount}
                  onChange={(e) => setClientCount(e.target.value)}
                  className="w-full bg-void border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 focus:outline-none focus:border-crimson/50 transition-colors"
                >
                  <option value="" disabled>
                    Select client count
                  </option>
                  {CLIENT_COUNTS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* ═══ Section 3 — Compliance Interest ═══ */}
          <motion.div
            className="bg-midnight border border-brand-white/[0.06] p-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <h2 className="font-display font-bold text-[20px] text-parchment mb-1">
              Compliance Interest
            </h2>
            <p className="font-sans text-[13px] text-steel mb-8">
              Help us understand your clients and compliance needs.
            </p>

            <div className="flex flex-col gap-8">
              {/* Client Industries */}
              <div>
                <label className="font-display font-semibold text-[13px] text-parchment block mb-3">
                  Which industries do your clients operate in? <span className="text-crimson">*</span>
                </label>
                <p className="font-sans text-[12px] text-steel mb-4">
                  Select all that apply.
                </p>
                <div className="flex flex-wrap gap-2">
                  {industryOptions.map((industry) => {
                    const selected = clientIndustries.includes(industry)
                    return (
                      <button
                        key={industry}
                        type="button"
                        onClick={() =>
                          toggleArrayItem(clientIndustries, industry, setClientIndustries)
                        }
                        className={`px-4 py-2.5 font-sans text-[13px] border transition-colors ${
                          selected
                            ? "bg-crimson/15 border-crimson/50 text-crimson"
                            : "bg-void border-brand-white/[0.1] text-steel hover:border-crimson/30 hover:text-fog"
                        }`}
                      >
                        {selected && (
                          <Check size={14} weight="bold" className="inline mr-1.5 -mt-0.5" />
                        )}
                        {industry}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Compliance Verticals */}
              <div>
                <label className="font-display font-semibold text-[13px] text-parchment block mb-3">
                  Which compliance verticals are you interested in? <span className="text-crimson">*</span>
                </label>
                <p className="font-sans text-[12px] text-steel mb-4">
                  Select all that apply.
                </p>
                <div className="flex flex-wrap gap-2">
                  {verticalOptions.map((v) => {
                    const selected = verticals.includes(v)
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => toggleArrayItem(verticals, v, setVerticals)}
                        className={`px-4 py-2.5 font-sans text-[13px] border transition-colors ${
                          selected
                            ? "bg-crimson/15 border-crimson/50 text-crimson"
                            : "bg-void border-brand-white/[0.1] text-steel hover:border-crimson/30 hover:text-fog"
                        }`}
                      >
                        {selected && (
                          <Check size={14} weight="bold" className="inline mr-1.5 -mt-0.5" />
                        )}
                        {v}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Previous Experience */}
              <div>
                <label className="font-display font-semibold text-[13px] text-parchment block mb-3">
                  Have you offered compliance services before? <span className="text-crimson">*</span>
                </label>
                <div className="flex flex-col gap-2">
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setExperience(opt.value)}
                      className={`text-left px-4 py-3 font-sans text-[14px] border transition-colors ${
                        experience === opt.value
                          ? "bg-crimson/15 border-crimson/50 text-crimson"
                          : "bg-void border-brand-white/[0.1] text-steel hover:border-crimson/30 hover:text-fog"
                      }`}
                    >
                      {experience === opt.value && (
                        <Check size={14} weight="bold" className="inline mr-2 -mt-0.5" />
                      )}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═══ Section 4 — Getting Started ═══ */}
          <motion.div
            className="bg-midnight border border-brand-white/[0.06] p-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <h2 className="font-display font-bold text-[20px] text-parchment mb-1">
              Getting Started
            </h2>
            <p className="font-sans text-[13px] text-steel mb-8">
              Choose your tier and tell us how you found us.
            </p>

            <div className="flex flex-col gap-8">
              {/* Partner Tier Cards */}
              <div>
                <label className="font-display font-semibold text-[13px] text-parchment block mb-3">
                  Which partner tier? <span className="text-crimson">*</span>
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {PARTNER_TIERS.map((t) => {
                    const selected = tier === t.value
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setTier(t.value)}
                        className={`text-left p-5 border transition-colors ${
                          selected
                            ? "bg-crimson/10 border-crimson/50"
                            : "bg-void border-brand-white/[0.1] hover:border-crimson/30"
                        }`}
                      >
                        <div className="flex items-baseline gap-2 mb-1">
                          <span
                            className={`font-display font-bold text-[18px] ${
                              selected ? "text-gold" : "text-parchment"
                            }`}
                          >
                            {t.name}
                          </span>
                          <span className="font-display font-black text-[22px] text-gold">
                            {t.price}
                          </span>
                          {t.period && (
                            <span className="font-sans text-[13px] text-steel">
                              {t.period}
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-[13px] text-steel leading-snug">
                          {t.description}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Referral Source */}
              <div>
                <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                  How did you hear about us?{" "}
                  <span className="text-steel font-normal">(optional)</span>
                </label>
                <select
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  className="w-full bg-void border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 focus:outline-none focus:border-crimson/50 transition-colors"
                >
                  <option value="">Select one</option>
                  {REFERRAL_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="font-display font-semibold text-[13px] text-parchment block mb-2">
                  Anything else?{" "}
                  <span className="text-steel font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Questions, context, or anything you want us to know..."
                  className="w-full bg-void border border-brand-white/[0.1] text-parchment font-sans text-[15px] px-4 py-3 placeholder:text-steel/40 focus:outline-none focus:border-crimson/50 transition-colors resize-none"
                />
              </div>
            </div>
          </motion.div>

          {/* ═══ Submit ═══ */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 px-6 py-4">
              <p className="font-sans text-[14px] text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              className="inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-10 py-4 hover:bg-crimson/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Application"}
              {!submitting && <ArrowRight size={16} weight="bold" />}
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
