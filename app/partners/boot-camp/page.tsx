"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  CaretDown,
  CaretUp,
  Certificate,
  ChartBar,
  Clock,
  GraduationCap,
  Lightning,
  Lightbulb,
  MapTrifold,
  Megaphone,
  Package,
  Target,
  Trophy,
  UserCirclePlus,
} from "@phosphor-icons/react"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"

/* ─── Constants ─── */

const modules = [
  {
    number: 1,
    title: "The Market",
    duration: "25 min",
    icon: MapTrifold,
    topics: [
      "California compliance landscape and enforcement trends",
      "What inspectors actually look for (and cite)",
      "Competitive landscape: who else is selling this?",
      "The PROTEKON wedge: why managed beats DIY",
    ],
    outcome:
      "You'll understand why California businesses are exposed and how to explain it in 30 seconds.",
  },
  {
    number: 2,
    title: "The Verticals",
    duration: "25 min",
    icon: Package,
    topics: [
      "10 compliance verticals explained in plain English",
      "How to match a vertical to your client's industry",
      "Overlap scenarios: when clients need 2+ verticals",
      "Vertical-specific language that closes deals",
    ],
    outcome:
      "You'll be able to recommend the right vertical for any client in your portfolio.",
  },
  {
    number: 3,
    title: "The Score Tool",
    duration: "20 min",
    icon: Target,
    topics: [
      "How the compliance score works (and what it measures)",
      "Positioning: when and how to send an assessment",
      "Reading and interpreting results with your client",
      "Follow-up sequence: score to close",
    ],
    outcome:
      "You'll have sent a practice assessment and know how to walk a client through their results.",
  },
  {
    number: 4,
    title: "Packaging & Pricing",
    duration: "20 min",
    icon: ChartBar,
    topics: [
      "Pricing strategy: partner margins by tier",
      "Margin targets and revenue projections",
      "Bundling compliance with your existing services",
      "Handling the 'that seems expensive' objection",
    ],
    outcome:
      "You'll have a pricing sheet and margin calculator ready for your first pitch.",
  },
  {
    number: 5,
    title: "Pitching & Closing",
    duration: "25 min",
    icon: Megaphone,
    topics: [
      "Discovery questions that surface compliance pain",
      "The 3 objections you'll hear (and how to handle each)",
      "Closing sequence: proposal to signature",
      "Email templates and call scripts (copy-paste ready)",
    ],
    outcome:
      "You'll have a complete pitch deck, email templates, and a closing checklist.",
  },
  {
    number: 6,
    title: "Onboarding & Delivery",
    duration: "15 min",
    icon: UserCirclePlus,
    topics: [
      "Client onboarding flow: what they see and when",
      "Incident processing: how reports get handled",
      "Dashboard walkthrough: reading your clients' status",
      "When to escalate to PROTEKON support",
    ],
    outcome:
      "You'll know exactly what happens after a client signs up and how to support them.",
  },
]

const metrics = [
  { label: "Time to first client", graduates: "8 days", nonGraduates: "23 days" },
  { label: "90-day client count", graduates: "6.2", nonGraduates: "2.1" },
  { label: "Assessment conversion", graduates: "31%", nonGraduates: "14%" },
  { label: "12-month retention", graduates: "94%", nonGraduates: "71%" },
]

const faqs = [
  {
    question: "How long does the Boot Camp take?",
    answer:
      "About 2-3 hours total. Six modules, each 15-25 minutes. You can stop and resume anytime. Most partners finish in a single sitting.",
  },
  {
    question: "Is it required before I can onboard clients?",
    answer:
      "No. You can start onboarding clients immediately after approval. But partners who complete the Boot Camp onboard 3x faster and retain clients at significantly higher rates.",
  },
  {
    question: "Is there a test at the end?",
    answer:
      "No test. It's completion-based. Finish all six modules and you receive your certification automatically.",
  },
  {
    question: "Can my team members take the Boot Camp too?",
    answer:
      "Yes. Each team member gets their own certification and can complete the modules independently. There's no limit on the number of certifications per partner account.",
  },
  {
    question: "I already have compliance experience. Do I still need this?",
    answer:
      "If you're already selling compliance services, you can skip modules you're familiar with. Modules 3-6 cover PROTEKON-specific tools and processes that are worth reviewing regardless of experience.",
  },
  {
    question: "Can I access the Boot Camp before my application is approved?",
    answer:
      "This overview page is available to everyone. The full modules, tools, and certification are available after your partner application is approved.",
  },
]

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

/* ─── Component ─── */

export default function BootCampPage() {
  const [expandedModule, setExpandedModule] = useState<number | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <main className="bg-void min-h-screen">
      <Nav />

      {/* ───── HERO ───── */}
      <section className="pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-[900px] mx-auto text-center">
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-8 h-[2px] bg-gold" />
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              PROTEKON Compliance Boot Camp
            </span>
            <div className="w-8 h-[2px] bg-gold" />
          </motion.div>

          <motion.h1
            className="font-display font-black text-[clamp(32px,5vw,52px)] leading-[1.05] text-parchment mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            You don&apos;t need to become a compliance expert.
            <br />
            You need to know enough to{" "}
            <span className="text-gold">start the conversation.</span>
          </motion.h1>

          <motion.p
            className="font-sans text-[18px] text-fog max-w-[700px] mx-auto leading-relaxed mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Self-paced training. 2-3 hours. Walk away with a playbook, a prospect
            list, and a script. $0.
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
              Start the Boot Camp
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="/partners/apply"
              className="inline-flex items-center justify-center gap-2 border border-brand-white/[0.1] text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:border-gold/50 hover:text-gold transition-colors"
            >
              Apply to the Partner Program First
              <ArrowRight size={16} weight="bold" />
            </Link>
          </motion.div>

          <motion.p
            className="font-sans text-[12px] text-steel mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Full modules require partner login.
          </motion.p>
        </div>
      </section>

      {/* ───── THE PROBLEM ───── */}
      <section className="py-24 px-6 lg:px-8 bg-midnight border-y border-brand-white/[0.06]">
        <div className="max-w-[800px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <h2 className="font-display font-black text-[clamp(28px,4vw,38px)] text-parchment mb-10 leading-[1.1]">
              The gap between &ldquo;I want to offer compliance&rdquo; and
              &ldquo;I just sold my first client.&rdquo;
            </h2>

            <div className="flex flex-col gap-6">
              {[
                {
                  num: "01",
                  text: "You don't need to memorize Cal/OSHA regulations. You need to know which questions surface pain and which answers signal a sale.",
                },
                {
                  num: "02",
                  text: "You don't need a compliance certification. You need a repeatable pitch, a pricing sheet, and a follow-up sequence that converts.",
                },
                {
                  num: "03",
                  text: "You don't need months of training. You need 2 hours, a practice assessment, and the confidence to send it to your first prospect.",
                },
              ].map((item) => (
                <div key={item.num} className="flex gap-5">
                  <span className="font-display font-black text-[32px] text-crimson/30 leading-none flex-shrink-0 w-12">
                    {item.num}
                  </span>
                  <p className="font-sans text-[16px] text-fog leading-relaxed pt-1">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── CURRICULUM ───── */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-[800px] mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              Curriculum
            </span>
            <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] text-parchment mt-4">
              Six modules. Everything you need.
            </h2>
          </motion.div>

          <div className="flex flex-col gap-4">
            {modules.map((mod, i) => {
              const expanded = expandedModule === mod.number
              const Icon = mod.icon

              return (
                <motion.div
                  key={mod.number}
                  className="bg-midnight border border-brand-white/[0.06] overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * i }}
                >
                  <button
                    onClick={() =>
                      setExpandedModule(expanded ? null : mod.number)
                    }
                    className="w-full flex items-center gap-4 p-6 text-left hover:bg-brand-white/[0.02] transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-crimson/15 border border-crimson/30 flex items-center justify-center">
                      <span className="font-display font-black text-[14px] text-crimson">
                        {mod.number}
                      </span>
                    </div>
                    <Icon size={24} weight="duotone" className="text-gold flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-[18px] text-gold">
                        {mod.title}
                      </h3>
                    </div>
                    <span className="font-sans text-[13px] text-steel flex-shrink-0 flex items-center gap-1.5">
                      <Clock size={14} weight="bold" />
                      {mod.duration}
                    </span>
                    {expanded ? (
                      <CaretUp size={18} weight="bold" className="text-steel flex-shrink-0" />
                    ) : (
                      <CaretDown size={18} weight="bold" className="text-steel flex-shrink-0" />
                    )}
                  </button>

                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="px-6 pb-6"
                    >
                      <ul className="flex flex-col gap-2 mb-5 ml-14">
                        {mod.topics.map((topic) => (
                          <li
                            key={topic}
                            className="font-sans text-[14px] text-fog flex items-start gap-2"
                          >
                            <span className="text-steel mt-1.5 flex-shrink-0">
                              &bull;
                            </span>
                            {topic}
                          </li>
                        ))}
                      </ul>
                      <div className="ml-14 bg-crimson/5 border-l-[3px] border-crimson px-5 py-4">
                        <p className="font-display font-semibold text-[11px] tracking-[2px] uppercase text-crimson mb-1">
                          What you&apos;ll have after this module
                        </p>
                        <p className="font-sans text-[14px] text-fog leading-relaxed">
                          {mod.outcome}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ───── COMPLETION & CERTIFICATION ───── */}
      <section className="py-24 px-6 lg:px-8 bg-midnight border-y border-brand-white/[0.06]">
        <div className="max-w-[800px] mx-auto">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              Certification
            </span>
            <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] text-parchment mt-4">
              Finish the Boot Camp. Get certified. Start selling.
            </h2>
          </motion.div>

          <motion.div
            className="bg-void border border-gold/20 p-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            transition={{ delay: 0.15 }}
          >
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Certificate,
                  label: "Certified Partner badge for your website and email signature",
                },
                {
                  icon: Lightning,
                  label: "Unique certification number for client-facing credibility",
                },
                {
                  icon: Lightbulb,
                  label: "Full sales library unlocked: scripts, decks, templates",
                },
                {
                  icon: Trophy,
                  label: "Partner profile activated in the PROTEKON referral directory",
                },
              ].map((item) => (
                <div key={item.label} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <item.icon size={20} weight="duotone" className="text-gold" />
                  </div>
                  <p className="font-sans text-[14px] text-fog leading-relaxed pt-1">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── METRICS ───── */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-[800px] mx-auto">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              Results
            </span>
            <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] text-parchment mt-4">
              The numbers speak for themselves.
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
                <tr className="border-b-2 border-brand-white/[0.1]">
                  <th className="font-display font-bold text-[13px] tracking-[1px] uppercase text-parchment py-4 pr-4">
                    Metric
                  </th>
                  <th className="font-display font-bold text-[13px] tracking-[1px] uppercase text-gold py-4 pr-4">
                    Boot Camp Graduates
                  </th>
                  <th className="font-display font-bold text-[13px] tracking-[1px] uppercase text-steel py-4">
                    Non-Graduates
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr
                    key={m.label}
                    className="border-b border-brand-white/[0.05]"
                  >
                    <td className="font-sans text-[14px] text-fog py-4 pr-4">
                      {m.label}
                    </td>
                    <td className="font-display font-bold text-[16px] text-gold py-4 pr-4">
                      {m.graduates}
                    </td>
                    <td className="font-sans text-[14px] text-steel py-4">
                      {m.nonGraduates}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.p
            className="font-sans text-[13px] text-steel mt-4 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            transition={{ delay: 0.25 }}
          >
            Partners who complete the Boot Camp onboard 3x faster.
          </motion.p>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="py-24 px-6 lg:px-8 bg-midnight border-y border-brand-white/[0.06]">
        <div className="max-w-[800px] mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              FAQ
            </span>
            <h2 className="font-display font-black text-[42px] text-parchment mt-4">
              Common Questions
            </h2>
          </motion.div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => {
              const expanded = expandedFaq === i
              return (
                <motion.div
                  key={i}
                  className="bg-void border border-brand-white/[0.06] overflow-hidden"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * i }}
                >
                  <button
                    onClick={() => setExpandedFaq(expanded ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-brand-white/[0.02] transition-colors"
                  >
                    <h3 className="font-display font-bold text-[16px] text-parchment">
                      {faq.question}
                    </h3>
                    {expanded ? (
                      <CaretUp size={18} weight="bold" className="text-steel flex-shrink-0" />
                    ) : (
                      <CaretDown size={18} weight="bold" className="text-steel flex-shrink-0" />
                    )}
                  </button>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="px-5 pb-5"
                    >
                      <p className="font-sans text-[15px] text-fog leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ───── FINAL CTA ───── */}
      <section className="py-24 px-6 lg:px-8 bg-crimson">
        <div className="max-w-[800px] mx-auto text-center">
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <GraduationCap size={32} weight="duotone" className="text-parchment/60" />
          </motion.div>

          <motion.h2
            className="font-display font-black text-[clamp(32px,5vw,48px)] leading-[1.05] text-parchment mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            Two hours from now, you&apos;ll have sent your first compliance assessment.
          </motion.h2>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            transition={{ delay: 0.15 }}
          >
            <Link
              href="/partners/apply"
              className="inline-flex items-center justify-center gap-2 bg-parchment text-crimson font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:bg-parchment/90 transition-colors"
            >
              Start the Boot Camp
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="/partners/apply"
              className="inline-flex items-center justify-center gap-2 border border-parchment/30 text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:border-parchment/60 transition-colors"
            >
              Apply to Become a Partner
              <ArrowRight size={16} weight="bold" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
