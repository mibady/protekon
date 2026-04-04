"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeSlash, ArrowRight } from "@phosphor-icons/react"
import { signIn } from "@/lib/actions/auth"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("error") === "auth_callback_failed") {
      setError("Authentication failed. Please try again.")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const result = await signIn(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
    // On success, signIn redirects to /dashboard
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
              MANAGED COMPLIANCE
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
              Welcome<br />Back.
            </h2>
            <p className="font-sans text-[16px] leading-[1.75] text-fog">
              Access your compliance dashboard, review documents, and manage your 
              workplace safety program.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="mt-12 pt-8 border-t border-brand-white/[0.06]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="grid grid-cols-2 gap-8">
              <div>
                <span className="font-display font-black text-[32px] text-gold">500+</span>
                <p className="font-display text-[10px] tracking-[2px] uppercase text-steel mt-1">
                  Protected Businesses
                </p>
              </div>
              <div>
                <span className="font-display font-black text-[32px] text-gold">99.8%</span>
                <p className="font-display text-[10px] tracking-[2px] uppercase text-steel mt-1">
                  Compliance Rate
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom */}
        <p className="font-sans text-[12px] text-steel/50">
          © 2025 PROTEKON. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-3 mb-12">
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

          {/* Header */}
          <div className="mb-10">
            <h1 className="font-display font-black text-[36px] text-parchment mb-3">
              Sign In
            </h1>
            <p className="font-sans text-[15px] text-steel">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-gold hover:text-gold/80 transition-colors">
                Start your compliance plan
              </Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-crimson/10 border border-crimson/20 text-crimson font-sans text-[13px]">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="font-display font-semibold text-[10px] tracking-[2px] uppercase text-steel">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-midnight/50 border border-brand-white/[0.1] px-4 py-3.5 font-sans text-[15px] text-parchment placeholder:text-steel/50 focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="you@company.com"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-display font-semibold text-[10px] tracking-[2px] uppercase text-steel">
                  Password
                </label>
                <Link 
                  href="/forgot-password" 
                  className="font-display text-[10px] tracking-[1px] text-gold hover:text-gold/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-midnight/50 border border-brand-white/[0.1] px-4 py-3.5 pr-12 font-sans text-[15px] text-parchment placeholder:text-steel/50 focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="Enter your password"
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

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase py-4 mt-4 flex items-center justify-center gap-3 hover:bg-crimson/90 transition-colors disabled:opacity-70"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} weight="bold" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-brand-white/[0.06]" />
            <span className="font-display text-[9px] tracking-[2px] uppercase text-steel/50">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-brand-white/[0.06]" />
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: `${window.location.origin}/auth/callback` },
                })
              }}
              className="flex items-center justify-center gap-2 py-3 border border-brand-white/[0.1] text-steel hover:text-parchment hover:border-brand-white/20 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="font-display text-[10px] tracking-[2px] uppercase">Google</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signInWithOAuth({
                  provider: "apple",
                  options: { redirectTo: `${window.location.origin}/auth/callback` },
                })
              }}
              className="flex items-center justify-center gap-2 py-3 border border-brand-white/[0.1] text-steel hover:text-parchment hover:border-brand-white/20 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <span className="font-display text-[10px] tracking-[2px] uppercase">Apple</span>
            </button>
          </div>

          {/* Footer */}
          <p className="mt-10 text-center font-sans text-[12px] text-steel/40">
            By signing in, you agree to our{" "}
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
