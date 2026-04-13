"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "@phosphor-icons/react"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"

const stats = [
  { value: "431K+", label: "Violations Analyzed" },
  { value: "$1.04B", label: "Total Penalties Exposed" },
  { value: "243K+", label: "Serious Violations" },
  { value: "116K+", label: "Employers Cited" },
]

const values = [
  {
    number: "01",
    title: "Intelligence First",
    description: "Every service decision is backed by regulatory data, enforcement trends, and penalty analysis."
  },
  {
    number: "02",
    title: "Agent, Not Software",
    description: "We don't sell dashboards. We don't sell templates. Your AI compliance officer does the work — autonomously, on schedule, without being prompted. Your compliance posture improves while you run your business."
  },
  {
    number: "03",
    title: "Precision Delivery",
    description: "Every document, every report, every update — delivered with surgical precision on a defined schedule."
  },
  {
    number: "04",
    title: "Institutional Trust",
    description: "We treat your business data with the same rigor we apply to compliance documentation."
  },
]


export default function AboutPage() {
  return (
    <main className="bg-void min-h-screen">
      <Nav />
      
      {/* Hero */}
      <section className="pt-32 pb-24 px-6 lg:px-8 relative overflow-hidden">
        {/* P-mark background */}
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block"
          animate={{ rotate: [0, 3, 0] }}
          transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
        >
          <svg viewBox="0 0 48 84" className="w-[320px] h-[560px] opacity-[0.03]">
            <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
            <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
            <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
            <rect x="0" y="40" width="48" height="10" fill="#C41230" />
          </svg>
        </motion.div>

        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-[55%_45%] gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[2px] bg-gold" />
                <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
                  About Protekon
                </span>
              </div>

              <h1 className="font-display font-black text-[clamp(40px,6vw,64px)] leading-[0.95] text-parchment mb-8">
                We Built the AI That Runs Your Compliance Department.
              </h1>

              <p className="font-sans text-[17px] leading-[1.8] text-fog max-w-[520px]">
                PROTEKON is the AI compliance officer for American businesses. It
                monitors every regulation. Writes every document. Classifies every
                incident. Delivers audit-ready proof to your inbox — automatically, on
                schedule, without being asked. We built it because 116,000+ employers
                have been cited by OSHA since 2020. Most of them aren&apos;t reckless.
                They just don&apos;t have the infrastructure to keep up. Now they do.
              </p>
            </motion.div>

            <motion.div
              className="hidden lg:block relative"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/images/about/office.jpg"
                  alt="PROTEKON headquarters"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/40 to-transparent" />
                {/* Gold corner accent */}
                <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-gold/40" />
                <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-gold/40" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-6 lg:px-8 bg-parchment">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              Our Mission
            </span>
            <h2 className="font-display font-black text-[clamp(36px,5vw,52px)] text-midnight mt-4 max-w-[700px]">
              The $80K Problem We Solved for $597/Month
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <motion.p
              className="font-sans text-[16px] leading-[1.8] text-steel"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              A full-time compliance officer costs $60,000–$80,000 a year. Enterprise
              GRC software costs $800–$2,000/month and still requires a team to operate.
              Meanwhile, a 30-person warehouse in Texas faces the same OSHA regulations
              as a Fortune 500 company — but has none of the infrastructure to stay compliant.
            </motion.p>
            <motion.p
              className="font-sans text-[16px] leading-[1.8] text-steel"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              The average serious OSHA fine is $16,131 — and willful violations can exceed
              $161,000. Protekon Core costs $597/month. We built an AI agent that does
              the work of a compliance officer — writing plans, classifying incidents,
              stripping PII, scanning regulations, and delivering audit-ready documents —
              for less than 1% of the cost of hiring one.
            </motion.p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center p-6 bg-brand-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
              >
                <span className="font-display font-black text-[36px] text-crimson">
                  {stat.value}
                </span>
                <p className="font-display font-medium text-[9px] tracking-[2px] uppercase text-steel mt-2">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 lg:px-8 bg-midnight">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-gold">
              Our Values
            </span>
            <h2 className="font-display font-black text-[42px] text-parchment mt-4">
              How We Operate
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={value.number}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
              >
                {/* Large faded number */}
                <span className="font-display font-black text-[88px] text-crimson/[0.06] leading-none">
                  {value.number}
                </span>
                <h3 className="font-display font-extrabold text-[22px] tracking-[1px] uppercase text-parchment -mt-6 mb-4">
                  {value.title}
                </h3>
                <p className="font-sans text-[14px] leading-[1.7] text-steel">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 lg:px-8 bg-void">
        <div className="max-w-[900px] mx-auto text-center">
          <motion.h2
            className="font-display font-black text-[clamp(36px,5vw,52px)] leading-[0.95] text-parchment mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to Protect Your Business?
          </motion.h2>
          <motion.p
            className="font-sans text-[18px] text-fog mb-10 max-w-[500px] mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Join thousands of businesses who trust Protekon for their
            workplace compliance.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:bg-crimson/90 transition-colors"
            >
              Start Your Compliance Plan
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-brand-white/20 text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:border-gold/50 hover:text-gold transition-colors"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
