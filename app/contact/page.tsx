"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { EnvelopeSimple, Phone, MapPin, PaperPlaneTilt } from "@phosphor-icons/react"

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "general",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <header className="border-b border-brand-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-8 py-6 flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="font-display font-bold text-[20px] tracking-[5px] text-brand-white">
              PROT<span className="text-crimson">E</span>KON
            </span>
          </Link>
          <Link 
            href="/"
            className="font-display text-[10px] tracking-[2px] uppercase text-steel hover:text-brand-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left - Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="font-display font-medium text-[10px] tracking-[4px] uppercase text-gold">
                Get in Touch
              </span>
              <h1 className="font-display font-black text-[clamp(40px,6vw,64px)] leading-[0.92] text-parchment mt-4 mb-6">
                CONTACT US
              </h1>
              <p className="font-sans text-[16px] leading-[1.75] text-fog max-w-[400px] mb-12">
                Have questions about PROTEKON? Need help with California compliance? 
                Our team is ready to help you protect your business.
              </p>
            </motion.div>

            {/* Contact Info */}
            <motion.div 
              className="flex flex-col gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center border border-gold/20">
                  <EnvelopeSimple size={18} weight="light" className="text-gold" />
                </div>
                <div>
                  <span className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                    Email
                  </span>
                  <a href="mailto:hello@protekon.com" className="font-sans text-[15px] text-parchment hover:text-gold transition-colors">
                    hello@protekon.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center border border-gold/20">
                  <Phone size={18} weight="light" className="text-gold" />
                </div>
                <div>
                  <span className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                    Phone
                  </span>
                  <a href="tel:+18005551234" className="font-sans text-[15px] text-parchment hover:text-gold transition-colors">
                    1-800-555-1234
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center border border-gold/20">
                  <MapPin size={18} weight="light" className="text-gold" />
                </div>
                <div>
                  <span className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                    Headquarters
                  </span>
                  <p className="font-sans text-[15px] text-parchment">
                    Los Angeles, California
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Hours */}
            <motion.div 
              className="mt-12 pt-8 border-t border-brand-white/[0.06]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-3">
                Support Hours
              </span>
              <p className="font-sans text-[14px] text-fog">
                Monday - Friday: 8:00 AM - 6:00 PM PST<br />
                Saturday: 9:00 AM - 2:00 PM PST
              </p>
            </motion.div>
          </div>

          {/* Right - Form */}
          <motion.div
            className="bg-midnight p-8 lg:p-12"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 flex items-center justify-center border border-gold/30 mb-6">
                  <PaperPlaneTilt size={28} weight="light" className="text-gold" />
                </div>
                <h3 className="font-display font-bold text-[24px] text-parchment mb-3">
                  Message Sent
                </h3>
                <p className="font-sans text-[14px] text-fog max-w-[300px]">
                  Thank you for reaching out. Our team will respond within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <h2 className="font-display font-bold text-[18px] tracking-[2px] uppercase text-parchment mb-2">
                  Send a Message
                </h2>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-display text-[10px] tracking-[2px] uppercase text-steel">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="bg-void border border-brand-white/10 px-4 py-3 font-sans text-[14px] text-parchment placeholder:text-steel/50 focus:border-gold/50 focus:outline-none transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-display text-[10px] tracking-[2px] uppercase text-steel">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="bg-void border border-brand-white/10 px-4 py-3 font-sans text-[14px] text-parchment placeholder:text-steel/50 focus:border-gold/50 focus:outline-none transition-colors"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-display text-[10px] tracking-[2px] uppercase text-steel">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formState.company}
                      onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                      className="bg-void border border-brand-white/10 px-4 py-3 font-sans text-[14px] text-parchment placeholder:text-steel/50 focus:border-gold/50 focus:outline-none transition-colors"
                      placeholder="Company name"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-display text-[10px] tracking-[2px] uppercase text-steel">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      className="bg-void border border-brand-white/10 px-4 py-3 font-sans text-[14px] text-parchment placeholder:text-steel/50 focus:border-gold/50 focus:outline-none transition-colors"
                      placeholder="(555) 555-5555"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-display text-[10px] tracking-[2px] uppercase text-steel">
                    Subject
                  </label>
                  <select
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="bg-void border border-brand-white/10 px-4 py-3 font-sans text-[14px] text-parchment focus:border-gold/50 focus:outline-none transition-colors"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="sales">Sales Question</option>
                    <option value="support">Technical Support</option>
                    <option value="enterprise">Enterprise Plans</option>
                    <option value="partnership">Partnership Opportunity</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-display text-[10px] tracking-[2px] uppercase text-steel">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="bg-void border border-brand-white/10 px-4 py-3 font-sans text-[14px] text-parchment placeholder:text-steel/50 focus:border-gold/50 focus:outline-none transition-colors resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
