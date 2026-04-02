"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Check, X, ArrowRight } from "@phosphor-icons/react"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"

const plans = [
  {
    name: "Core",
    slug: "core",
    price: "$597",
    period: "/month",
    description: "Full managed compliance for single-location businesses.",
    employees: "1 location · up to 50 employees",
    features: [
      { name: "AI-Generated IIPP Document", included: true },
      { name: "SB 553 WVPP", included: true },
      { name: "Incident Logging + PII Stripping", included: true },
      { name: "Weekly Regulatory Monitoring", included: true },
      { name: "Monthly Report to Inbox", included: true },
      { name: "AI Compliance Chat", included: true },
      { name: "2-Day Document Delivery", included: true },
      { name: "Quarterly Reviews", included: false },
      { name: "Priority Support", included: false },
    ],
  },
  {
    name: "Professional",
    slug: "professional",
    price: "$897",
    period: "/month",
    description: "Complete compliance stack with quarterly reviews and priority support.",
    employees: "Up to 2 locations · up to 150 employees",
    popular: true,
    features: [
      { name: "Everything in Core", included: true },
      { name: "Up to 2 Locations (+$197/location)", included: true },
      { name: "Unlimited Incident Logging + AI Classification", included: true },
      { name: "Daily Regulatory Monitoring + AI Analysis", included: true },
      { name: "Weekly + Monthly Reports", included: true },
      { name: "Quarterly Compliance Reviews", included: true },
      { name: "24-Hour Document Delivery", included: true },
      { name: "Priority Support + Dedicated Analyst", included: true },
      { name: "Subcontractor Tracking (Construction)", included: true },
    ],
  },
  {
    name: "Multi-Site",
    slug: "multi-site",
    price: "$1,297",
    period: "/month",
    description: "Multi-location compliance with consolidated reporting and white-glove service.",
    employees: "Up to 3 locations · 150+ employees",
    features: [
      { name: "Everything in Professional", included: true },
      { name: "Up to 3 Locations (+$147/location)", included: true },
      { name: "Full Vertical Stack (OSHA + CSLB + Healthcare + RE)", included: true },
      { name: "Consolidated Multi-Site Reporting", included: true },
      { name: "Same-Day Document Delivery", included: true },
      { name: "Dedicated Compliance Analyst (Human Review)", included: true },
      { name: "White-Glove Onboarding ($0 Setup Fee)", included: true },
      { name: "Annual Audit Package", included: true },
      { name: "Custom Delivery Schedule", included: true },
    ],
  },
]

const faqs = [
  {
    question: "How quickly will I receive my first documents?",
    answer: "Your IIPP and SB 553 Workplace Violence Prevention Plan will be generated and delivered to your inbox within 48 hours of completing your business intake questionnaire."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. Protekon is a monthly subscription with no long-term contracts. You can cancel at any time, and you'll retain access through the end of your billing period."
  },
  {
    question: "What happens when regulations change?",
    answer: "We monitor Cal/OSHA, OSHSB, and municipal regulations 24/7. When changes affect your business, we automatically update your documents and notify you of what's changed."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use SOC 2 compliant storage, TLS 1.3 encryption in transit, and AES-256 encryption at rest. All personally identifiable information (PII) in incident reports is automatically stripped and protected."
  },
  {
    question: "Do I need to install any software?",
    answer: "No. Protekon is a fully managed service. Your compliance documents are delivered straight to your inbox. You also get a dashboard for real-time compliance monitoring, but it requires zero setup on your end."
  },
]

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
        // Not logged in or error — redirect to signup
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
      
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-8 h-[2px] bg-gold" />
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              Pricing
            </span>
            <div className="w-8 h-[2px] bg-gold" />
          </motion.div>
          
          <motion.h1
            className="font-display font-black text-[clamp(40px,6vw,72px)] leading-[0.95] text-parchment mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Simple, Transparent Pricing
          </motion.h1>
          
          <motion.p
            className="font-sans text-[18px] text-fog max-w-[600px] mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Choose the plan that fits your business. Every plan includes California-specific 
            compliance documents delivered straight to your inbox.
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`relative flex flex-col bg-midnight border ${
                  plan.popular 
                    ? 'border-crimson/30 -mt-4 mb-4 md:mb-0 md:-mt-6' 
                    : 'border-brand-white/[0.06]'
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

                {/* Top crimson line */}
                <div className={`h-[3px] ${plan.popular ? 'bg-crimson' : 'bg-steel/20'}`} />

                <div className="p-8 flex flex-col flex-1">
                  {/* Header */}
                  <div className="mb-8">
                    <h3 className="font-display font-bold text-[24px] text-parchment mb-2">
                      {plan.name}
                    </h3>
                    <p className="font-sans text-[14px] text-steel mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-black text-[48px] text-gold">
                        {plan.price}
                      </span>
                      <span className="font-sans text-[16px] text-steel">
                        {plan.period}
                      </span>
                    </div>
                    <p className="font-display text-[11px] tracking-[2px] uppercase text-steel mt-2">
                      {plan.employees}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-8">
                    <ul className="flex flex-col gap-3">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className="flex items-center gap-3">
                          {feature.included ? (
                            <Check size={16} weight="bold" className="text-gold flex-shrink-0" />
                          ) : (
                            <X size={16} weight="bold" className="text-steel/30 flex-shrink-0" />
                          )}
                          <span className={`font-sans text-[14px] ${
                            feature.included ? 'text-fog' : 'text-steel/50'
                          }`}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleCheckout(plan.slug)}
                    disabled={loadingPlan === plan.slug}
                    className={`w-full py-4 font-display font-semibold text-[11px] tracking-[3px] uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                      plan.popular
                        ? 'bg-crimson text-parchment hover:bg-crimson/90'
                        : 'border border-brand-white/[0.1] text-parchment hover:border-gold/50 hover:text-gold'
                    }`}
                  >
                    {loadingPlan === plan.slug ? "Redirecting..." : "Get Started"}
                    {loadingPlan !== plan.slug && <ArrowRight size={14} weight="bold" />}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom note */}
          <motion.p
            className="text-center font-sans text-[14px] text-steel mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            All plans include a 14-day money-back guarantee. No questions asked.
          </motion.p>
        </div>
      </section>

      {/* Comparison Banner */}
      <section className="py-16 px-6 lg:px-8 bg-crimson/5 border-y border-crimson/10">
        <div className="max-w-[900px] mx-auto text-center">
          <h2 className="font-display font-bold text-[28px] text-gold mb-4">
            Protekon costs less than a single Cal/OSHA violation
          </h2>
          <p className="font-sans text-[16px] text-fog">
            The average serious violation fine is <span className="text-parchment font-semibold">$7,229</span>.
            A year of Protekon Core costs <span className="text-parchment font-semibold">$7,164</span>.
            One prevented citation pays for itself.
          </p>
        </div>
      </section>

      {/* FAQs */}
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

      {/* CTA */}
      <section className="py-24 px-6 lg:px-8 bg-crimson">
        <div className="max-w-[900px] mx-auto text-center">
          <h2 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] text-parchment mb-6">
            Ready to Start?
          </h2>
          <p className="font-sans text-[18px] text-parchment/75 mb-10 max-w-[500px] mx-auto">
            Get your California compliance documents delivered within 48 hours. 
            No software to learn. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-parchment text-crimson font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:bg-parchment/90 transition-colors"
            >
              Start Your Compliance Plan
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-parchment/30 text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:border-parchment/60 transition-colors"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
