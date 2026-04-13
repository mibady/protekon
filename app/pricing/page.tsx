"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Check, ArrowRight, Star } from "@phosphor-icons/react"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"

const plans = [
  {
    name: "Core",
    slug: "core",
    price: "$597",
    period: "/month",
    setupFee: "$297 one-time setup",
    bestFor: "Single-location businesses, 10\u201350 employees",
    features: [
      "Site-specific compliance plan \u2014 delivered within 48 hours",
      "Secure incident reporting",
      "Incident log processing within 24 hours",
      "Regulatory monitoring \u2014 plain-English alerts",
      "Annual plan refresh",
      "Monthly compliance status report",
      "Audit-ready PDF package",
      "Email support \u2014 1 business day response",
    ],
    inheritLabel: null,
  },
  {
    name: "Professional",
    slug: "professional",
    price: "$897",
    period: "/month",
    setupFee: "$397 one-time setup",
    bestFor: "50\u2013150 employees, cited before, quarterly reviews",
    popular: true,
    features: [
      "Quarterly compliance review",
      "Vertical-specific tracking features",
      "Employee log request handling",
      "Priority support \u2014 4 business hours",
    ],
    inheritLabel: "Everything in Core, plus:",
  },
  {
    name: "Multi-Site",
    slug: "multi-site",
    price: "$1,297",
    period: "/month",
    setupFee: "$597 one-time setup",
    bestFor: "2+ locations, regional operators",
    features: [
      "Separate site-specific documentation per location",
      "Separate incident reporting per location",
      "Consolidated compliance dashboard",
      "Consolidated monthly reporting",
      "Monthly account review call \u2014 30 minutes",
      "One billing account",
    ],
    inheritLabel: "Everything in Professional, across locations:",
    extraNote: "Additional locations beyond 3: $197/month per site",
  },
]

const comparisonRows = [
  {
    option: "Hire a compliance officer",
    cost: "$60,000\u2013$80,000/year",
    who: "Them \u2014 one person, one point of failure",
    ongoing: "Yes, if they stay",
  },
  {
    option: "CalChamber SB 553 Toolkit",
    cost: "$1,298 upfront",
    who: "You \u2014 templates to fill out yourself",
    ongoing: "No \u2014 static",
  },
  {
    option: "Enterprise GRC (NAVEX, Resolver)",
    cost: "$800\u2013$2,000+/month",
    who: "You + IT team",
    ongoing: "Requires administration",
  },
  {
    option: "Compliance training course",
    cost: "$20/seat, one-time",
    who: "You \u2014 course to watch",
    ongoing: "No ongoing support",
  },
  {
    option: "Local consultant",
    cost: "$150\u2013$300/hour",
    who: "Episodic \u2014 bill again later",
    ongoing: "Only when you pay",
  },
]

const protekonRow = {
  option: "PROTEKON \u2014 Managed",
  cost: "$597/month",
  who: "Us \u2014 fully done for you",
  ongoing: "Yes \u2014 always current",
}

const verticalExamples = [
  { label: "Auto dealer", verticals: "SB 553 + Construction", price: "$994/month" },
  { label: "Warehouse", verticals: "SB 553 + Wholesale", price: "$994/month" },
  { label: "Hotel", verticals: "SB 553 + Hospitality + Real Estate", price: "$1,297/month (suite)" },
]

const faqs = [
  {
    question: "Every vertical is the same price?",
    answer:
      "Yes. Whether you choose SB 553, Construction, Healthcare, or any other vertical, the plan price is identical. The deliverables are different \u2014 a construction client gets subcontractor tracking, a healthcare client gets HIPAA-adjacent monitoring \u2014 but the pricing structure is flat across all verticals. No surprises.",
  },
  {
    question: "What if I start with one vertical and want to add another later?",
    answer:
      "You can add any additional vertical at any time for a flat $397/month add-on. There\u2019s a one-time $197 setup fee per additional vertical to configure your plan, incident pipeline, and monitoring for the new domain. No disruption to your existing service.",
  },
  {
    question: "I have 4 locations but only need one compliance vertical. Which plan?",
    answer:
      "Multi-Site. It covers up to 3 locations. Your fourth location is an additional $197/month. Total: $1,297 + $197 = $1,494/month for four locations under one vertical, one dashboard, one invoice.",
  },
  {
    question: "I have 2 locations AND 2 compliance verticals. How does that work?",
    answer:
      "Start with Multi-Site ($1,297/month) for your primary vertical across both locations. Add the second vertical for $397/month. Total: $1,694/month. Each vertical gets its own site-specific documentation, incident pipeline, and monitoring \u2014 all consolidated in one dashboard.",
  },
  {
    question: "Is there a discount for annual billing?",
    answer:
      "Yes. Annual billing saves you roughly two months \u2014 pay for 10 months, get 12. Contact us during signup or reach out to your account manager to switch to annual billing at any time.",
  },
  {
    question: "We\u2019re a nonprofit. Is there a discount?",
    answer:
      "We offer a 15% nonprofit discount on any plan. Provide your 501(c)(3) determination letter during intake and the discount applies automatically to your first invoice and every invoice after.",
  },
  {
    question: "What if I want to downgrade?",
    answer:
      "You can downgrade at the end of any billing cycle. Moving from Multi-Site to Professional or Professional to Core takes effect on your next invoice. No penalties, no friction. Your existing documents and history stay in your account.",
  },
  {
    question: "Do I need to install any software or manage anything?",
    answer:
      "No. PROTEKON runs autonomously. Compliance documents are delivered to your inbox on schedule. Your dashboard shows real-time compliance status, but you never have to log in for the system to do its job. It monitors regulations, processes incidents, updates documents, and sends you proof \u2014 whether you check the dashboard or not.",
  },
  {
    question: "How is this different from compliance software like NAVEX or FaceUp?",
    answer:
      "Enterprise compliance software gives you a dashboard to manage yourself. You still need staff to enter data, interpret regulations, generate reports, and maintain records. Protekon is an AI agent that does all of that autonomously. You don\u2019t operate a system. You don\u2019t manage a platform. The agent does the compliance work \u2014 the same work a $60\u201380K/year compliance officer would do \u2014 for less than $1,300/month.",
  },
  {
    question: "What does the AI actually do vs. a human?",
    answer:
      "The AI writes your compliance plans from your intake data, classifies incidents by severity and OSHA code, strips personally identifiable information from reports, scans three regulatory feeds every morning, analyzes the impact of new regulations on your documents, and delivers reports on schedule. A human compliance analyst reviews edge cases on Professional and Multi-Site plans. The AI handles the 95% that is procedural. The human handles the 5% that requires judgment.",
  },
]

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  async function handleCheckout(slug: string) {
    setLoadingPlan(slug)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: slug }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        window.location.href = "/signup"
      }
    } catch {
      window.location.href = "/signup"
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <main className="bg-void min-h-screen">
      <Nav />

      {/* ───── HERO ───── */}
      <section className="pt-32 pb-16 px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-8 h-[2px] bg-gold" />
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              Simple pricing. Every vertical. One structure.
            </span>
            <div className="w-8 h-[2px] bg-gold" />
          </motion.div>

          <motion.h1
            className="font-display font-black text-[clamp(36px,5.5vw,64px)] leading-[1.05] text-parchment mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Less Than 1% of a Compliance Officer.{" "}
            <span className="text-gold">100% of the Work.</span>
          </motion.h1>

          <motion.p
            className="font-sans text-[18px] text-fog max-w-[740px] mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            A full-time compliance officer costs $60–80K a year. PROTEKON
            costs $7,164–$15,564 a year — and it works 24
            hours a day, 365 days a year. Every plan includes full document
            generation, incident classification, regulatory monitoring, PII
            stripping, and scheduled delivery. No incomplete tiers. No add-on
            fees.
          </motion.p>
        </div>
      </section>

      {/* ───── INSTRUCTION TEXT ───── */}
      <section className="pb-12 px-6 lg:px-8">
        <motion.div
          className="max-w-[900px] mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
        >
          <p className="font-sans text-[15px] text-steel leading-relaxed border border-brand-white/[0.06] bg-midnight/50 px-8 py-6">
            PROTEKON costs less than one serious violation.
            Average serious OSHA fine: $16,131. Protekon Core annual cost: $7,164.
            The agent pays for itself the first time an inspector walks away
            with zero citations.
          </p>
        </motion.div>
      </section>

      {/* ───── TIER CARDS ───── */}
      <section className="pb-24 px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`relative flex flex-col bg-midnight border ${
                  plan.popular
                    ? "border-crimson/30 -mt-4 mb-4 md:mb-0 md:-mt-6"
                    : "border-brand-white/[0.06]"
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="font-display font-semibold text-[9px] tracking-[2px] uppercase text-parchment bg-crimson px-4 py-1.5">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Top accent line */}
                <div
                  className={`h-[3px] ${
                    plan.popular ? "bg-crimson" : "bg-steel/20"
                  }`}
                />

                <div className="p-8 flex flex-col flex-1">
                  {/* Header */}
                  <div className="mb-8">
                    <h3 className="font-display font-bold text-[24px] text-parchment mb-1">
                      {plan.name}
                    </h3>
                    <p className="font-sans text-[13px] text-steel mb-4">
                      Best for: {plan.bestFor}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-black text-[48px] text-gold">
                        {plan.price}
                      </span>
                      <span className="font-sans text-[16px] text-steel">
                        {plan.period}
                      </span>
                    </div>
                    <p className="font-sans text-[13px] text-steel/70 mt-1">
                      {plan.setupFee}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-8">
                    {plan.inheritLabel && (
                      <p className="font-display font-semibold text-[12px] tracking-[1px] uppercase text-gold/80 mb-4">
                        {plan.inheritLabel}
                      </p>
                    )}
                    <ul className="flex flex-col gap-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check
                            size={16}
                            weight="bold"
                            className="text-gold flex-shrink-0 mt-0.5"
                          />
                          <span className="font-sans text-[14px] text-fog">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Extra note for Multi-Site */}
                    {"extraNote" in plan && plan.extraNote && (
                      <p className="mt-5 font-sans text-[12px] text-crimson/80 border-t border-brand-white/[0.06] pt-4">
                        {plan.extraNote}
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleCheckout(plan.slug)}
                    disabled={loadingPlan === plan.slug}
                    className={`w-full py-4 font-display font-semibold text-[11px] tracking-[3px] uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                      plan.popular
                        ? "bg-crimson text-parchment hover:bg-crimson/90"
                        : "border border-brand-white/[0.1] text-parchment hover:border-gold/50 hover:text-gold"
                    }`}
                  >
                    {loadingPlan === plan.slug ? "Redirecting..." : "Get Started"}
                    {loadingPlan !== plan.slug && (
                      <ArrowRight size={14} weight="bold" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── COMPARISON TABLE ───── */}
      <section className="py-24 px-6 lg:px-8 bg-parchment">
        <div className="max-w-[1000px] mx-auto">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              Alternatives
            </span>
            <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] text-midnight mt-4">
              Before you look at our pricing &mdash;
              <br className="hidden sm:block" />
              look at the alternatives.
            </h2>
          </motion.div>

          <motion.div
            className="overflow-x-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            transition={{ delay: 0.15 }}
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-midnight/10">
                  <th className="font-display font-bold text-[13px] tracking-[1px] uppercase text-midnight py-4 pr-4">
                    Option
                  </th>
                  <th className="font-display font-bold text-[13px] tracking-[1px] uppercase text-midnight py-4 pr-4">
                    Cost
                  </th>
                  <th className="font-display font-bold text-[13px] tracking-[1px] uppercase text-midnight py-4 pr-4">
                    Who does the work?
                  </th>
                  <th className="font-display font-bold text-[13px] tracking-[1px] uppercase text-midnight py-4">
                    Ongoing?
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr
                    key={row.option}
                    className="border-b border-midnight/5"
                  >
                    <td className="font-sans text-[14px] text-steel py-4 pr-4">
                      {row.option}
                    </td>
                    <td className="font-sans text-[14px] text-steel py-4 pr-4">
                      {row.cost}
                    </td>
                    <td className="font-sans text-[14px] text-steel py-4 pr-4">
                      {row.who}
                    </td>
                    <td className="font-sans text-[14px] text-steel py-4">
                      {row.ongoing}
                    </td>
                  </tr>
                ))}

                {/* Protekon highlight row */}
                <tr className="bg-crimson/10 border-2 border-crimson/30">
                  <td className="font-display font-bold text-[14px] text-crimson py-4 pr-4 pl-3">
                    <span className="flex items-center gap-2">
                      <Star size={16} weight="fill" className="text-gold" />
                      {protekonRow.option}
                    </span>
                  </td>
                  <td className="font-display font-bold text-[14px] text-crimson py-4 pr-4">
                    {protekonRow.cost}
                  </td>
                  <td className="font-display font-bold text-[14px] text-crimson py-4 pr-4">
                    {protekonRow.who}
                  </td>
                  <td className="font-display font-bold text-[14px] text-crimson py-4">
                    {protekonRow.ongoing}
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ───── ADD A VERTICAL ───── */}
      <section className="py-24 px-6 lg:px-8 bg-void">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              Multi-Vertical
            </span>
            <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] text-parchment mt-4 mb-6">
              Need more than one compliance area? Add it.
            </h2>
            <p className="font-sans text-[17px] text-fog max-w-[680px] mx-auto leading-relaxed">
              Any additional compliance vertical is a flat{" "}
              <span className="text-gold font-semibold">$397/month</span> add-on
              with a one-time $197 setup fee. Same deliverables, same monitoring,
              same incident processing &mdash; just for a different domain. Your
              dashboard stays unified. Your invoice stays one line item.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-3 gap-4 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            transition={{ delay: 0.15 }}
          >
            {verticalExamples.map((ex) => (
              <div
                key={ex.label}
                className="bg-midnight border border-brand-white/[0.06] p-6"
              >
                <p className="font-display font-bold text-[16px] text-parchment mb-2">
                  {ex.label}
                </p>
                <p className="font-sans text-[13px] text-steel mb-3">
                  {ex.verticals}
                </p>
                <p className="font-display font-black text-[22px] text-gold">
                  {ex.price}
                </p>
              </div>
            ))}
          </motion.div>

          <div className="text-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:bg-crimson/90 transition-colors"
            >
              Start with Multiple Verticals
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───── SETUP FEE EXPLAINER ───── */}
      <section className="py-16 px-6 lg:px-8 bg-midnight border-y border-brand-white/[0.06]">
        <motion.div
          className="max-w-[700px] mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
        >
          <h3 className="font-display font-bold text-[22px] text-parchment mb-4">
            What does the setup fee cover?
          </h3>
          <p className="font-sans text-[15px] text-fog leading-relaxed">
            We collect your business data, generate your site-specific compliance
            plan, configure your incident pipeline, activate regulatory monitoring
            for your vertical, and deliver your baseline compliance score &mdash;
            all within 48 hours. The setup fee covers this initial buildout. It is
            charged once and never repeats.
          </p>
        </motion.div>
      </section>

      {/* ───── FAQs ───── */}
      <section className="py-24 px-6 lg:px-8 bg-parchment">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-16">
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              FAQ
            </span>
            <h2 className="font-display font-black text-[42px] text-midnight mt-4">
              Common Questions
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className="bg-brand-white p-6 border-l-[3px] border-crimson"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
              >
                <h3 className="font-display font-bold text-[18px] text-midnight mb-3">
                  {faq.question}
                </h3>
                <p className="font-sans text-[15px] text-steel leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── BOTTOM CTA ───── */}
      <section className="py-24 px-6 lg:px-8 bg-crimson">
        <div className="max-w-[900px] mx-auto text-center">
          <motion.h2
            className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] text-parchment mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            Your Compliance Officer Is Ready.
          </motion.h2>

          <motion.p
            className="font-sans text-[14px] text-parchment/60 mb-10 max-w-[520px] mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            transition={{ delay: 0.1 }}
          >
            First delivery in 48 hours. Regulatory monitoring starts
            immediately. No software. No staff. No onboarding meetings. Cancel
            anytime.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-parchment text-crimson font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:bg-parchment/90 transition-colors"
            >
              Activate Your Compliance Officer
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="/score"
              className="inline-flex items-center justify-center gap-2 border border-parchment/30 text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:border-parchment/60 transition-colors"
            >
              Take the Free Compliance Score First
              <ArrowRight size={16} weight="bold" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
