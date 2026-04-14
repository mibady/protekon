"use client"

import { useState } from "react"
import Link from "next/link"
import { submitSampleGate } from "@/lib/actions/samples"

export default function BlogPostCTA() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    const fd = new FormData()
    fd.set("email", email)
    await submitSampleGate(fd)
    setDone(true)
    setSubmitting(false)
  }

  return (
    <section className="my-16 border-y border-midnight/10 py-12">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div>
          <h3 className="font-display font-bold text-[11px] tracking-[3px] uppercase text-crimson mb-3">
            Stay ahead of Cal/OSHA
          </h3>
          <p className="font-display font-black text-[28px] leading-tight text-midnight mb-3">
            Get the weekly compliance brief.
          </p>
          <p className="font-sans text-[14px] text-midnight/70 leading-relaxed">
            One email a week: new regulations, enforcement trends, and the templates we publish. No spam, unsubscribe any time.
          </p>
          {done ? (
            <p className="mt-6 font-sans text-[13px] text-emerald-700">
              You&apos;re in — check your inbox for the next brief.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="flex-1 px-4 py-3 bg-brand-white border border-midnight/15 font-sans text-[14px] text-midnight focus:border-crimson focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-3 bg-crimson text-brand-white font-display font-semibold text-[11px] uppercase tracking-[1.5px] hover:bg-crimson/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
          )}
        </div>

        <div className="bg-midnight text-brand-white p-8">
          <p className="font-display font-bold text-[11px] tracking-[3px] uppercase text-gold mb-3">
            See where you stand
          </p>
          <p className="font-display font-black text-[24px] leading-tight mb-3">
            What would Cal/OSHA cite you for today?
          </p>
          <p className="font-sans text-[14px] text-brand-white/70 leading-relaxed mb-6">
            Run the compliance score. You&apos;ll see the gaps, the fine exposure, and the remediation path.
          </p>
          <Link
            href="/score"
            className="inline-block px-5 py-3 bg-gold text-midnight font-display font-semibold text-[11px] uppercase tracking-[1.5px] hover:bg-gold/90 transition-colors"
          >
            Get your score
          </Link>
        </div>
      </div>
    </section>
  )
}
