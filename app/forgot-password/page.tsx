"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { EnvelopeSimple, ArrowLeft, PaperPlaneTilt } from "@phosphor-icons/react"
import { forgotPassword } from "@/lib/actions/auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.set("email", email)

    const result = await forgotPassword(formData)

    setIsSubmitting(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setIsSubmitted(true)
    }
  }

  return (
    <div className="min-h-screen bg-void flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <Link href="/" className="inline-block mb-12">
            <span className="font-display font-bold text-[24px] tracking-[6px] text-brand-white">
              PROT<span className="text-crimson">E</span>KON
            </span>
          </Link>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 flex items-center justify-center border border-gold/30 mb-6">
                <PaperPlaneTilt size={28} weight="light" className="text-gold" />
              </div>
              <h1 className="font-display font-bold text-[28px] text-parchment mb-3">
                Check Your Email
              </h1>
              <p className="font-sans text-[14px] leading-[1.7] text-fog mb-8">
                We&apos;ve sent a password reset link to <span className="text-parchment">{email}</span>. 
                The link will expire in 24 hours.
              </p>
              <p className="font-sans text-[13px] text-steel mb-8">
                Didn&apos;t receive an email? Check your spam folder or{" "}
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-gold hover:text-gold/80 transition-colors"
                >
                  try again
                </button>
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 font-display text-[11px] tracking-[2px] uppercase text-steel hover:text-brand-white transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-display font-bold text-[28px] text-parchment mb-3">
                Reset Password
              </h1>
              <p className="font-sans text-[14px] leading-[1.7] text-fog mb-8">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              {error && (
                <div className="mb-6 px-4 py-3 bg-crimson/10 border border-crimson/20 text-crimson font-sans text-[13px]">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-display text-[12px] tracking-[2px] uppercase text-steel">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeSimple size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-midnight border border-brand-white/10 pl-12 pr-4 py-4 font-sans text-[14px] text-parchment placeholder:text-steel/50 focus:border-gold/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-brand-white/[0.06]">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 font-display text-[11px] tracking-[2px] uppercase text-steel hover:text-brand-white transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-midnight items-center justify-center relative overflow-hidden">
        {/* Grid background */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201,168,76,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* P-Mark */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <svg viewBox="0 0 48 84" className="w-[120px] h-[210px] opacity-10">
            <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
            <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
            <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
            <rect x="0" y="40" width="48" height="10" fill="#C41230" />
          </svg>
        </motion.div>

        {/* Corner accents */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-gold/15" />
        <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-gold/15" />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-gold/15" />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-gold/15" />
      </div>
    </div>
  )
}
