"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Users, HardHat, Briefcase, Buildings, Scales } from "@phosphor-icons/react"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"

const partnerProfiles = [
  {
    icon: ShieldCheck,
    title: "Insurance Brokers & Agents",
    description:
      "Your clients already trust you to protect their business. Compliance gaps drive claims, increase premiums, and create E&O exposure. When you embed managed compliance into your book, you reduce loss ratios and deepen the relationship beyond the renewal cycle.",
  },
  {
    icon: Users,
    title: "PEOs & Payroll Companies",
    description:
      "You already own the employment relationship. Payroll, benefits, workers' comp — compliance is the natural next line item. Your clients expect you to handle everything employment-related. Now you can, without building an in-house compliance team.",
  },
  {
    icon: HardHat,
    title: "Safety Consultants",
    description:
      "You do the site walk. You write the report. Then you leave — and the client does nothing until the next visit. PROTEKON turns your episodic consulting into a managed service with continuous monitoring, incident processing, and documentation that stays current between your visits.",
  },
  {
    icon: Briefcase,
    title: "HR Consulting Firms",
    description:
      "Your clients ask you compliance questions every week. You answer them ad hoc, absorbing the liability without charging for it. PROTEKON gives you a productized answer: a managed compliance program you can sell alongside your HR advisory, with your brand on the deliverables.",
  },
  {
    icon: Buildings,
    title: "Trade & Industry Associations",
    description:
      "Your members need compliance help but can't afford enterprise solutions. Offer PROTEKON as a member benefit or revenue-generating program. Non-dues revenue for the association, discounted compliance for the members, and a reason to renew membership every year.",
  },
  {
    icon: Scales,
    title: "Business Attorneys",
    description:
      "You advise clients on liability exposure, but you can't operationalize the fix. When a client asks 'how do I actually get compliant?' you need somewhere to send them. PROTEKON handles the documentation, monitoring, and incident processing — so you can recommend a service, not just a strategy.",
  },
]

const steps = [
  {
    number: "01",
    title: "Send the compliance score.",
    description:
      "Use the free compliance score tool with your clients. Ten questions. Two minutes. They get an instant gap analysis showing exactly where they're exposed. You get a warm lead with a quantified problem.",
  },
  {
    number: "02",
    title: "We build their compliance program.",
    description:
      "Once the client enrolls, PROTEKON builds their site-specific compliance plan, configures their incident pipeline, activates regulatory monitoring, and delivers audit-ready documentation — all within 48 hours. Your brand. Our infrastructure.",
  },
  {
    number: "03",
    title: "You collect the revenue. We keep it current.",
    description:
      "You set the retail price. You invoice the client. You keep the margin. PROTEKON handles ongoing monitoring, incident processing, regulatory updates, and annual plan refreshes. The client sees your brand. You see recurring revenue.",
  },
]

const partnerBenefits = [
  {
    title: "Partner Portal",
    description:
      "A dedicated dashboard to manage your clients, track compliance status, view revenue, and monitor program health — all in one place.",
  },
  {
    title: "Compliance Score Tool",
    description:
      "A branded assessment tool you can share with prospects. Ten questions, instant gap analysis, and a clear path to enrollment.",
  },
  {
    title: "White-Label Branding",
    description:
      "Your logo. Your colors. Your domain. Clients see your brand on the portal, the deliverables, and every communication.",
  },
  {
    title: "Partner-Branded Deliverables",
    description:
      "Compliance plans, incident reports, and audit packages all carry your brand. You deliver the work product. We produce it.",
  },
  {
    title: "Compliance Boot Camp",
    description:
      "A structured training program so you and your team understand the compliance landscape, can speak to it confidently, and close deals faster.",
  },
  {
    title: "Sales Enablement Materials",
    description:
      "Pitch decks, one-pagers, email templates, objection handling guides, and ROI calculators — everything you need to sell managed compliance.",
  },
  {
    title: "Dedicated Partner Support",
    description:
      "A named partner success contact who knows your business, your clients, and your goals. Not a ticket queue — a relationship.",
  },
]

const faqs = [
  {
    question: "Do I need compliance expertise?",
    answer:
      "No. PROTEKON handles all compliance work — plan generation, incident processing, regulatory monitoring, documentation. You need to understand the value proposition (businesses need compliance documentation and most don't have it), but you don't need to be a compliance expert. That's our job.",
  },
  {
    question: "How do my clients experience the service?",
    answer:
      "Your brand, your domain, your deliverables. Clients log into a portal with your logo, receive compliance plans with your branding, and interact with a system that looks and feels like your product. PROTEKON is invisible to the end client on Professional and Enterprise tiers.",
  },
  {
    question: "Can I set my own pricing?",
    answer:
      "Yes. You pay a flat platform fee per client. You set whatever retail price the market will bear. The spread is your margin. Most partners charge $500–$900 per client per month. Some charge more for specialized verticals or multi-location clients.",
  },
  {
    question: "What if my client has a compliance question I can't answer?",
    answer:
      "The platform includes an automated compliance assistant that handles most day-to-day questions. For complex or edge-case scenarios, you have a dedicated support channel staffed by compliance professionals who respond within 4 business hours.",
  },
  {
    question: "What verticals can I sell?",
    answer:
      "All of them — SB 553, Construction, Healthcare, Manufacturing, Retail, Transportation, Wholesale, Hospitality, Agriculture, and Real Estate. Your tier determines how many verticals you can offer per client, but the full catalog is available to every partner.",
  },
  {
    question: "How long does it take to get started?",
    answer:
      "Apply through the partner application. Approval typically takes 24–48 hours. Once approved, you get immediate access to the partner portal, the compliance score tool, and all sales enablement materials. You can send your first score the same day.",
  },
  {
    question: "Is there a minimum commitment?",
    answer:
      "The Free tier has no commitment at all — one client, no cost, no contract. Paid tiers are month-to-month. You can upgrade, downgrade, or cancel at the end of any billing cycle. No long-term contracts unless you want one (annual billing saves two months).",
  },
  {
    question: "I'm a solo consultant. Is this too big for me?",
    answer:
      "Solo partners are some of our best performers. You don't need a team, an office, or infrastructure. You need clients who need compliance — and most businesses do. A solo partner with 10–15 clients on Professional tier generates $6,000–$9,000 per month in margin with zero fulfillment work.",
  },
]

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

export default function PartnersPage() {
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
              PROTEKON Partner Program
            </span>
            <div className="w-8 h-[2px] bg-gold" />
          </motion.div>

          <motion.h1
            className="font-display font-black text-[clamp(36px,5.5vw,64px)] leading-[1.05] text-parchment mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Your clients already need compliance.
            <br />
            <span className="text-gold">You should be the one delivering it.</span>
          </motion.h1>

          <motion.p
            className="font-sans text-[18px] text-fog max-w-[740px] mx-auto leading-relaxed mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Every business in California needs Cal/OSHA workplace violence prevention
            documentation. Most don&apos;t have it. Most don&apos;t know where to start. That
            gap is your opportunity. PROTEKON lets you add managed compliance as a
            recurring revenue line — without building the infrastructure, hiring the
            experts, or doing the fulfillment. You sell it. We deliver it. Your brand,
            your margin, your client relationship.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/partners/apply"
              className="inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:bg-crimson/90 transition-colors"
            >
              Apply to the Partner Program
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="/partners/pricing"
              className="inline-flex items-center justify-center gap-2 border border-brand-white/[0.1] text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:border-gold/50 hover:text-gold transition-colors"
            >
              See the Partner Economics
              <ArrowRight size={16} weight="bold" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ───── THE OPPORTUNITY ───── */}
      <section className="py-24 px-6 lg:px-8 bg-midnight border-y border-brand-white/[0.06]">
        <motion.div
          className="max-w-[800px] mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
        >
          <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
            The Opportunity
          </span>
          <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] text-parchment mt-4 mb-8">
            $14.3 billion in Cal/OSHA fines since 2020.{" "}
            <span className="text-gold">Most of it was preventable.</span>
          </h2>
          <p className="font-sans text-[17px] text-fog leading-relaxed mb-6">
            California&apos;s regulatory environment is the most aggressive in the country.
            SB 553 alone requires every employer to maintain a written workplace violence
            prevention plan, conduct annual training, and process incidents within defined
            timelines. The penalties for non-compliance start at $18,000 per violation —
            and most small businesses have never heard of the requirement.
          </p>
          <p className="font-sans text-[17px] text-fog leading-relaxed">
            The enterprise market is served. Companies with 500+ employees have compliance
            officers, GRC platforms, and legal departments. But the 4.1 million small and
            mid-size businesses in California? They have nothing. No budget for a
            full-time hire. No appetite for enterprise software. No idea where to start.
            That&apos;s the gap PROTEKON fills — and that&apos;s the gap you can own in your market.
          </p>
        </motion.div>
      </section>

      {/* ───── WHO THIS IS FOR ───── */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              Partner Profiles
            </span>
            <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] text-parchment mt-4">
              Who this is for.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerProfiles.map((profile, i) => (
              <motion.div
                key={profile.title}
                className="bg-midnight border border-brand-white/[0.06] p-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
              >
                <profile.icon size={28} weight="duotone" className="text-gold mb-4" />
                <h3 className="font-display font-bold text-[18px] text-gold mb-3">
                  {profile.title}
                </h3>
                <p className="font-sans text-[14px] text-fog leading-relaxed">
                  {profile.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="py-24 px-6 lg:px-8 bg-midnight border-y border-brand-white/[0.06]">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              How It Works
            </span>
            <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] text-parchment mt-4">
              Three steps. Zero compliance expertise required.
            </h2>
          </motion.div>

          <div className="flex flex-col gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                className="flex gap-6 items-start"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 * i }}
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-crimson flex items-center justify-center">
                  <span className="font-display font-black text-[18px] text-parchment">
                    {step.number}
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-[22px] text-parchment mb-2">
                    {step.title}
                  </h3>
                  <p className="font-sans text-[15px] text-fog leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── THE MARGIN MATH ───── */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              The Math
            </span>
            <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] text-parchment mt-4">
              The economics of managed compliance as a service line.
            </h2>
          </motion.div>

          <motion.div
            className="bg-midnight border border-brand-white/[0.06] overflow-x-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            transition={{ delay: 0.15 }}
          >
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-white/[0.06]">
                  <th className="font-display font-bold text-[12px] tracking-[1px] uppercase text-steel py-4 px-6">
                    Metric
                  </th>
                  <th className="font-display font-bold text-[12px] tracking-[1px] uppercase text-steel py-4 px-6 text-right">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Number of clients", value: "20", highlight: false },
                  { label: "Your retail price (avg)", value: "$700/mo", highlight: false },
                  { label: "PROTEKON platform fee", value: "$249/mo", highlight: false },
                  { label: "Your margin per client", value: "$451/mo", highlight: true },
                  { label: "Monthly gross margin", value: "$9,020", highlight: true },
                  { label: "Annual gross margin", value: "$108,240", highlight: true },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-brand-white/[0.06] last:border-0">
                    <td className="font-sans text-[15px] text-fog py-4 px-6">
                      {row.label}
                    </td>
                    <td
                      className={`font-display font-bold text-[18px] py-4 px-6 text-right ${
                        row.highlight ? "text-gold" : "text-parchment"
                      }`}
                    >
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.p
            className="font-sans text-[15px] text-fog leading-relaxed mt-8 text-center max-w-[680px] mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            transition={{ delay: 0.25 }}
          >
            Zero compliance expertise. Zero additional staff. Zero infrastructure to
            build or maintain. You sell, you invoice, you keep the margin. PROTEKON
            handles every aspect of fulfillment.
          </motion.p>
        </div>
      </section>

      {/* ───── WHAT YOU GET ───── */}
      <section className="py-24 px-6 lg:px-8 bg-midnight border-y border-brand-white/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              What You Get
            </span>
            <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] text-parchment mt-4">
              Everything you need to sell and deliver managed compliance.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerBenefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                className="bg-void border border-brand-white/[0.06] p-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * i }}
              >
                <h3 className="font-display font-bold text-[16px] text-parchment mb-3">
                  {benefit.title}
                </h3>
                <p className="font-sans text-[14px] text-fog leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
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

      {/* ───── FINAL CTA ───── */}
      <section className="py-24 px-6 lg:px-8 bg-crimson">
        <div className="max-w-[900px] mx-auto text-center">
          <motion.h2
            className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] text-parchment mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            Start with one client. See if the model works.
            <br />
            Scale from there.
          </motion.h2>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-6"
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
              href="/partners/pricing"
              className="inline-flex items-center justify-center gap-2 border border-parchment/30 text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:border-parchment/60 transition-colors"
            >
              See Partner Pricing
              <ArrowRight size={16} weight="bold" />
            </Link>
          </motion.div>

          <motion.p
            className="font-sans text-[13px] text-parchment/60"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            transition={{ delay: 0.2 }}
          >
            Free tier available. No credit card required to apply.
          </motion.p>
        </div>
      </section>

      {/* ───── DISCLAIMER ───── */}
      <section className="py-8 px-6 lg:px-8 bg-void border-t border-brand-white/[0.06]">
        <div className="max-w-[900px] mx-auto">
          <p className="font-sans text-[11px] text-steel leading-relaxed text-center">
            PROTEKON partners are independent businesses and are not employees, agents,
            or legal representatives of PROTEKON. The compliance programs delivered
            through the partner channel are operational documentation services and do not
            constitute legal advice. Partners are responsible for their own client
            relationships, pricing, billing, and contractual obligations. PROTEKON makes
            no guarantees regarding partner revenue or client acquisition.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
