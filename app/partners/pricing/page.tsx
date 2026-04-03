"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Check, Star, Crown } from "@phosphor-icons/react"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    clientLimit: "1 client max",
    popular: false,
    features: [
      "Full platform access for 1 client",
      "Score tool (5 sends/month)",
      "PROTEKON branded (no white-label)",
      "Email support",
    ],
    suggestedRetail: "$597–$897",
    suggestedMargin: "$597–$897",
    cta: "Start Free",
    href: "/partners/apply",
  },
  {
    name: "Essentials",
    price: "$149",
    period: "/client/month",
    clientLimit: "Up to 10 clients",
    popular: false,
    features: [
      "1 vertical authorization",
      "50 score sends/month",
      "Partner dashboard",
      '"Managed by [Your Brand]" attribution',
      "Partner-branded score report PDFs",
    ],
    suggestedRetail: "$500–$700",
    suggestedMargin: "$351–$551",
    cta: "Start with Essentials",
    href: "/partners/apply",
  },
  {
    name: "Professional",
    price: "$249",
    period: "/client/month",
    clientLimit: "Up to 50 clients",
    popular: true,
    features: [
      "All verticals",
      "Full white-label portal + custom domain",
      "200 score sends/month + bulk CSV",
      "Full insights dashboard",
      "Boot Camp access",
      "Dedicated partner success contact",
    ],
    suggestedRetail: "$600–$900",
    suggestedMargin: "$351–$651",
    cta: "Start with Professional",
    href: "/partners/apply",
  },
  {
    name: "Enterprise",
    price: "$399",
    period: "/client/month",
    clientLimit: "Unlimited clients",
    popular: false,
    features: [
      "Unlimited score sends",
      "API access",
      "Custom report formatting",
      "Monthly business review",
      "Co-marketing support",
    ],
    suggestedRetail: "$800–$1,200",
    suggestedMargin: "$401–$801",
    cta: "Contact Us",
    href: "/contact",
  },
]

const buildVsPartner = [
  { category: "Time to first client", build: "3–6 months", partner: "48 hours" },
  { category: "Upfront investment", build: "$50,000–$150,000", partner: "$0 (Free tier)" },
  { category: "Compliance expertise required", build: "Yes — hire or become one", partner: "No" },
  { category: "Technology infrastructure", build: "Build and maintain", partner: "Included" },
  { category: "Regulatory monitoring", build: "Manual tracking", partner: "Automated" },
  { category: "Document generation", build: "Build PDF pipeline", partner: "Included" },
  { category: "Incident processing", build: "Build workflow engine", partner: "Included" },
  { category: "Ongoing maintenance", build: "Your responsibility", partner: "PROTEKON handles" },
  { category: "Scalability", build: "Hire more staff", partner: "Add clients in dashboard" },
  { category: "White-label branding", build: "Build it yourself", partner: "Built in (Pro+)" },
  { category: "Time to break even", build: "12–18 months", partner: "Month 1" },
]

const faqs = [
  {
    question: "When does billing start?",
    answer:
      "Billing starts when the first client deliverable is completed — typically within 48 hours of client enrollment. You are not charged during the application, approval, or onboarding period. No deliverable, no charge.",
  },
  {
    question: "Is there a minimum number of clients?",
    answer:
      "No. The Free tier supports one client at no cost. Paid tiers have no minimum — you pay per client, and you can start with one. The client limits on each tier are maximums, not minimums.",
  },
  {
    question: "What if a client needs multiple verticals?",
    answer:
      "Additional verticals for a single client are $100/month per additional vertical. For example, a construction company that also needs SB 553 coverage would be your per-client platform fee plus $100/month for the second vertical.",
  },
  {
    question: "Can I mix tiers across different clients?",
    answer:
      "No. Your tier applies to your entire partner account and all clients under it. This keeps pricing simple and ensures consistent service delivery. If you need features from a higher tier, upgrade your account — all clients benefit automatically.",
  },
  {
    question: "Is there annual billing?",
    answer:
      "Yes. Annual billing saves you two months — pay for 10 months, get 12. This applies to the per-client platform fee. Contact your partner success manager or select annual billing during enrollment to switch.",
  },
  {
    question: "What happens if I exceed my client limit?",
    answer:
      "We will not cut off service to your existing clients. If you approach your tier limit, we'll reach out to discuss upgrading. There's no surprise billing and no service interruption — just a conversation about the right tier for your growth.",
  },
  {
    question: "Are there any other fees?",
    answer:
      "No. The per-client platform fee covers everything — compliance plan generation, incident processing, regulatory monitoring, document delivery, portal access, and support. There are no setup fees, no overage charges, and no hidden costs.",
  },
]

const tierPlatformFees: Record<string, number> = {
  Essentials: 149,
  Professional: 249,
  Enterprise: 399,
}

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

export default function PartnerPricingPage() {
  const [clients, setClients] = useState(20)
  const [price, setPrice] = useState(700)
  const [tier, setTier] = useState<string>("Professional")

  const platformFee = tierPlatformFees[tier] ?? 249
  const monthlyRevenue = clients * price
  const monthlyPlatformFees = clients * platformFee
  const monthlyMargin = monthlyRevenue - monthlyPlatformFees
  const annualMargin = monthlyMargin * 12
  const marginPerClient = price - platformFee
  const marginPercentage = price > 0 ? ((marginPerClient / price) * 100).toFixed(1) : "0"

  return (
    <main className="bg-void min-h-screen">
      <Nav />

      {/* ───── HERO ───── */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-8 h-[2px] bg-gold" />
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              Partner Pricing
            </span>
            <div className="w-8 h-[2px] bg-gold" />
          </motion.div>

          <motion.h1
            className="font-display font-black text-[clamp(36px,5.5vw,64px)] leading-[1.05] text-parchment mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            You pay per client. You charge what you want.
            <br />
            <span className="text-gold">The spread is your business.</span>
          </motion.h1>

          <motion.p
            className="font-sans text-[18px] text-fog max-w-[740px] mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            A flat platform fee per client. No revenue share. No percentage of your
            retail price. No hidden costs. You know your cost before you quote the
            client, so the margin is predictable from day one.
          </motion.p>
        </div>
      </section>

      {/* ───── TIER CARDS ───── */}
      <section className="pb-24 px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((t, i) => (
              <motion.div
                key={t.name}
                className={`relative flex flex-col bg-midnight border ${
                  t.popular
                    ? "border-crimson/30 lg:-mt-4 lg:mb-0"
                    : "border-brand-white/[0.06]"
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                {t.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="font-display font-semibold text-[9px] tracking-[2px] uppercase text-parchment bg-crimson px-4 py-1.5 flex items-center gap-1.5">
                      <Crown size={12} weight="fill" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`h-[3px] ${t.popular ? "bg-crimson" : "bg-steel/20"}`} />

                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-6">
                    <h3 className="font-display font-bold text-[22px] text-parchment mb-1">
                      {t.name}
                    </h3>
                    <p className="font-sans text-[12px] text-steel mb-4">
                      {t.clientLimit}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-black text-[40px] text-gold">
                        {t.price}
                      </span>
                      <span className="font-sans text-[14px] text-steel">
                        {t.period}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 mb-6">
                    <ul className="flex flex-col gap-2.5">
                      {t.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <Check
                            size={14}
                            weight="bold"
                            className="text-gold flex-shrink-0 mt-0.5"
                          />
                          <span className="font-sans text-[13px] text-fog">
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggested retail & margin */}
                  <div className="border-t border-brand-white/[0.06] pt-4 mb-6">
                    <div className="flex justify-between mb-1">
                      <span className="font-sans text-[11px] text-steel">Suggested retail</span>
                      <span className="font-sans text-[11px] text-parchment">{t.suggestedRetail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-[11px] text-steel">Your margin/client</span>
                      <span className="font-sans text-[11px] text-gold font-semibold">{t.suggestedMargin}</span>
                    </div>
                  </div>

                  <Link
                    href={t.href}
                    className={`w-full py-3.5 font-display font-semibold text-[11px] tracking-[3px] uppercase flex items-center justify-center gap-2 transition-colors ${
                      t.popular
                        ? "bg-crimson text-parchment hover:bg-crimson/90"
                        : "border border-brand-white/[0.1] text-parchment hover:border-gold/50 hover:text-gold"
                    }`}
                  >
                    {t.cta}
                    <ArrowRight size={14} weight="bold" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── MARGIN CALCULATOR ───── */}
      <section className="py-24 px-6 lg:px-8 bg-midnight border-y border-brand-white/[0.06]">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              Calculator
            </span>
            <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] text-parchment mt-4">
              See your revenue at scale.
            </h2>
          </motion.div>

          <motion.div
            className="bg-void border border-brand-white/[0.06] p-8 lg:p-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            transition={{ delay: 0.15 }}
          >
            {/* Inputs */}
            <div className="grid md:grid-cols-3 gap-8 mb-10">
              <div>
                <label className="font-display font-semibold text-[11px] tracking-[2px] uppercase text-steel block mb-3">
                  Clients: <span className="text-parchment">{clients}</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={clients}
                  onChange={(e) => setClients(Number(e.target.value))}
                  className="w-full accent-crimson"
                />
                <div className="flex justify-between font-sans text-[10px] text-steel mt-1">
                  <span>5</span>
                  <span>100</span>
                </div>
              </div>

              <div>
                <label className="font-display font-semibold text-[11px] tracking-[2px] uppercase text-steel block mb-3">
                  Retail Price: <span className="text-parchment">${price}</span>
                </label>
                <input
                  type="range"
                  min={400}
                  max={1200}
                  step={25}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full accent-crimson"
                />
                <div className="flex justify-between font-sans text-[10px] text-steel mt-1">
                  <span>$400</span>
                  <span>$1,200</span>
                </div>
              </div>

              <div>
                <label className="font-display font-semibold text-[11px] tracking-[2px] uppercase text-steel block mb-3">
                  Tier
                </label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="w-full bg-midnight border border-brand-white/[0.1] text-parchment font-sans text-[14px] py-2.5 px-4 focus:outline-none focus:border-gold/50"
                >
                  <option value="Essentials">Essentials — $149/client</option>
                  <option value="Professional">Professional — $249/client</option>
                  <option value="Enterprise">Enterprise — $399/client</option>
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className="h-[2px] bg-crimson/30 mb-10" />

            {/* Output */}
            <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { label: "Monthly Revenue", value: `$${monthlyRevenue.toLocaleString()}`, highlight: false },
                { label: "Platform Fees", value: `$${monthlyPlatformFees.toLocaleString()}`, highlight: false },
                { label: "Monthly Margin", value: `$${monthlyMargin.toLocaleString()}`, highlight: true },
                { label: "Annual Margin", value: `$${annualMargin.toLocaleString()}`, highlight: true },
                { label: "Margin/Client", value: `$${marginPerClient.toLocaleString()}`, highlight: false },
                { label: "Margin %", value: `${marginPercentage}%`, highlight: false },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="font-sans text-[10px] tracking-[1px] uppercase text-steel mb-2">
                    {item.label}
                  </p>
                  <p
                    className={`font-display font-black text-[24px] ${
                      item.highlight ? "text-gold" : "text-parchment"
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── BUILD VS PARTNER ───── */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-[1000px] mx-auto">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              Comparison
            </span>
            <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] text-parchment mt-4">
              Build it yourself — or partner and sell tomorrow.
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
                <tr className="border-b-2 border-brand-white/[0.08]">
                  <th className="font-display font-bold text-[12px] tracking-[1px] uppercase text-steel py-4 pr-6">
                    Category
                  </th>
                  <th className="font-display font-bold text-[12px] tracking-[1px] uppercase text-steel py-4 pr-6">
                    Build Your Own
                  </th>
                  <th className="font-display font-bold text-[12px] tracking-[1px] uppercase text-gold py-4">
                    <span className="flex items-center gap-2">
                      <Star size={14} weight="fill" className="text-gold" />
                      PROTEKON Partner
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {buildVsPartner.map((row) => (
                  <tr
                    key={row.category}
                    className="border-b border-brand-white/[0.06]"
                  >
                    <td className="font-sans text-[14px] text-fog py-3.5 pr-6">
                      {row.category}
                    </td>
                    <td className="font-sans text-[14px] text-steel/70 py-3.5 pr-6">
                      {row.build}
                    </td>
                    <td className="font-sans text-[14px] text-parchment font-medium py-3.5">
                      {row.partner}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="py-24 px-6 lg:px-8 bg-parchment">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-16">
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              FAQ
            </span>
            <h2 className="font-display font-black text-[42px] text-midnight mt-4">
              Pricing Questions
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
            Start free. Prove the model.
            <br />
            Scale when it works.
          </motion.h2>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            transition={{ delay: 0.1 }}
          >
            <Link
              href="/partners/apply"
              className="inline-flex items-center justify-center gap-2 bg-parchment text-crimson font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:bg-parchment/90 transition-colors"
            >
              Apply to the Partner Program
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-parchment/30 text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:border-parchment/60 transition-colors"
            >
              Talk to a Partner Specialist
              <ArrowRight size={16} weight="bold" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
