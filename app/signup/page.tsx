"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeSlash, ArrowRight, Check } from "@phosphor-icons/react"

const plans = [
  { id: "starter", name: "Starter", price: "$297", period: "/mo", employees: "1-25 employees" },
  { id: "professional", name: "Professional", price: "$497", period: "/mo", employees: "26-100 employees", popular: true },
  { id: "enterprise", name: "Enterprise", price: "$797", period: "/mo", employees: "100+ employees" },
]

const industries = [
  "Construction",
  "Manufacturing", 
  "Agriculture",
  "Hospitality",
  "Healthcare",
  "Retail",
  "Transportation",
  "Other",
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    businessName: "",
    industry: "",
    employeeCount: "",
    plan: "professional",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      setStep(2)
      return
    }

    setIsLoading(true)
    // Simulate signup
    await new Promise(resolve => setTimeout(resolve, 1500))
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-void flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 bg-midnight border-r border-brand-white/[0.06]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <svg viewBox="0 0 48 84" className="w-8 h-14">
            <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
            <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
            <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
            <rect x="0" y="40" width="48" height="10" fill="#C41230" />
          </svg>
          <div className="flex flex-col">
            <span className="font-display font-bold text-[20px] tracking-[5px] text-brand-white">
              PROT<span className="text-crimson">E</span>KON
            </span>
            <span className="font-display font-normal text-[9px] tracking-[2px] text-gold">
              SHIELD CaaS
            </span>
          </div>
        </Link>

        {/* Center content */}
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-display font-black text-[48px] leading-[0.95] text-parchment mb-6">
              Start Your<br />Compliance Plan.
            </h2>
            <p className="font-sans text-[16px] leading-[1.75] text-fog">
              Get your IIPP, SB 553 plan, and incident logging system set up 
              and delivered within 48 hours.
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div 
            className="mt-12 flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {[
              "California-specific compliance documents",
              "First delivery within 48 hours",
              "Ongoing regulatory monitoring",
              "Cancel anytime, no contracts",
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center bg-crimson/10 text-crimson">
                  <Check size={12} weight="bold" />
                </div>
                <span className="font-sans text-[14px] text-fog">{benefit}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom */}
        <p className="font-sans text-[12px] text-steel/50">
          © 2025 PROTEKON. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div 
          className="w-full max-w-lg py-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-3 mb-10">
            <svg viewBox="0 0 48 84" className="w-7 h-12">
              <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
              <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
              <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
              <rect x="0" y="40" width="48" height="10" fill="#C41230" />
            </svg>
            <span className="font-display font-bold text-[18px] tracking-[4px] text-brand-white">
              PROT<span className="text-crimson">E</span>KON
            </span>
          </Link>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-10">
            <div className={`w-8 h-8 flex items-center justify-center font-display font-bold text-[12px] ${step >= 1 ? 'bg-crimson text-parchment' : 'bg-midnight border border-steel/30 text-steel'}`}>
              1
            </div>
            <div className={`flex-1 h-[2px] ${step >= 2 ? 'bg-crimson' : 'bg-steel/20'}`} />
            <div className={`w-8 h-8 flex items-center justify-center font-display font-bold text-[12px] ${step >= 2 ? 'bg-crimson text-parchment' : 'bg-midnight border border-steel/30 text-steel'}`}>
              2
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display font-black text-[32px] text-parchment mb-3">
              {step === 1 ? "Create Your Account" : "Business Details"}
            </h1>
            <p className="font-sans text-[15px] text-steel">
              {step === 1 ? (
                <>
                  Already have an account?{" "}
                  <Link href="/login" className="text-gold hover:text-gold/80 transition-colors">
                    Sign in
                  </Link>
                </>
              ) : (
                "Tell us about your business to customize your compliance plan."
              )}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {step === 1 ? (
              <>
                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="font-display font-semibold text-[10px] tracking-[2px] uppercase text-steel">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-midnight/50 border border-brand-white/[0.1] px-4 py-3.5 font-sans text-[15px] text-parchment placeholder:text-steel/50 focus:outline-none focus:border-gold/50 transition-colors"
                    placeholder="you@company.com"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <label className="font-display font-semibold text-[10px] tracking-[2px] uppercase text-steel">
                    Create Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-midnight/50 border border-brand-white/[0.1] px-4 py-3.5 pr-12 font-sans text-[15px] text-parchment placeholder:text-steel/50 focus:outline-none focus:border-gold/50 transition-colors"
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-steel hover:text-parchment transition-colors"
                    >
                      {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Business Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-display font-semibold text-[10px] tracking-[2px] uppercase text-steel">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-midnight/50 border border-brand-white/[0.1] px-4 py-3.5 font-sans text-[15px] text-parchment placeholder:text-steel/50 focus:outline-none focus:border-gold/50 transition-colors"
                    placeholder="Your company name"
                  />
                </div>

                {/* Industry */}
                <div className="flex flex-col gap-2">
                  <label className="font-display font-semibold text-[10px] tracking-[2px] uppercase text-steel">
                    Industry
                  </label>
                  <select
                    required
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-midnight/50 border border-brand-white/[0.1] px-4 py-3.5 font-sans text-[15px] text-parchment focus:outline-none focus:border-gold/50 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select your industry</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind.toLowerCase()}>{ind}</option>
                    ))}
                  </select>
                </div>

                {/* Employee Count */}
                <div className="flex flex-col gap-2">
                  <label className="font-display font-semibold text-[10px] tracking-[2px] uppercase text-steel">
                    Employee Count
                  </label>
                  <select
                    required
                    value={formData.employeeCount}
                    onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                    className="w-full bg-midnight/50 border border-brand-white/[0.1] px-4 py-3.5 font-sans text-[15px] text-parchment focus:outline-none focus:border-gold/50 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select range</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-25">11-25 employees</option>
                    <option value="26-50">26-50 employees</option>
                    <option value="51-100">51-100 employees</option>
                    <option value="100+">100+ employees</option>
                  </select>
                </div>

                {/* Plan Selection */}
                <div className="flex flex-col gap-3">
                  <label className="font-display font-semibold text-[10px] tracking-[2px] uppercase text-steel">
                    Select Your Plan
                  </label>
                  <div className="grid gap-3">
                    {plans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, plan: plan.id })}
                        className={`relative flex items-center justify-between p-4 border transition-all ${
                          formData.plan === plan.id 
                            ? 'border-gold bg-gold/5' 
                            : 'border-brand-white/[0.1] hover:border-brand-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            formData.plan === plan.id ? 'border-gold' : 'border-steel/30'
                          }`}>
                            {formData.plan === plan.id && (
                              <div className="w-2 h-2 rounded-full bg-gold" />
                            )}
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-[14px] text-parchment">
                                {plan.name}
                              </span>
                              {plan.popular && (
                                <span className="font-display text-[8px] tracking-[1px] uppercase text-crimson bg-crimson/10 px-2 py-0.5">
                                  Popular
                                </span>
                              )}
                            </div>
                            <span className="font-sans text-[12px] text-steel">{plan.employees}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-display font-bold text-[20px] text-gold">{plan.price}</span>
                          <span className="font-sans text-[12px] text-steel">{plan.period}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-4 mt-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border border-brand-white/[0.1] text-steel font-display font-semibold text-[11px] tracking-[3px] uppercase hover:border-brand-white/20 hover:text-parchment transition-colors"
                >
                  Back
                </button>
              )}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase py-4 flex items-center justify-center gap-3 hover:bg-crimson/90 transition-colors disabled:opacity-70"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />
                ) : (
                  <>
                    {step === 1 ? "Continue" : "Start Your Plan"}
                    <ArrowRight size={16} weight="bold" />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-10 text-center font-sans text-[12px] text-steel/40">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-steel/60 hover:text-steel transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-steel/60 hover:text-steel transition-colors">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
