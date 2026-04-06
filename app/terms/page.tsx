"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function TermsPage() {
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
            className="font-display text-[12px] tracking-[2px] uppercase text-steel hover:text-brand-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-display font-medium text-[12px] tracking-[4px] uppercase text-gold">
            Legal
          </span>
          <h1 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.92] text-parchment mt-4 mb-4">
            TERMS OF SERVICE
          </h1>
          <p className="font-sans text-[14px] text-steel mb-12">
            Last updated: January 1, 2025
          </p>

          <div className="prose prose-invert max-w-none">
            <section className="mb-12">
              <h2 className="font-display font-bold text-[18px] tracking-[1px] uppercase text-parchment mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="font-sans text-[15px] leading-[1.8] text-fog mb-4">
                By accessing or using PROTEKON services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-display font-bold text-[18px] tracking-[1px] uppercase text-parchment mb-4">
                2. Description of Services
              </h2>
              <p className="font-sans text-[15px] leading-[1.8] text-fog mb-4">
                PROTEKON provides compliance management services including but not limited to: Injury and Illness Prevention Program (IIPP) documentation, SB 553 Workplace Violence Prevention Plans, incident logging and management, and regulatory monitoring services for California businesses.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-display font-bold text-[18px] tracking-[1px] uppercase text-parchment mb-4">
                3. User Responsibilities
              </h2>
              <p className="font-sans text-[15px] leading-[1.8] text-fog mb-4">
                Users are responsible for providing accurate information about their business operations, maintaining the confidentiality of their account credentials, and ensuring compliance with applicable laws beyond the scope of our services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-display font-bold text-[18px] tracking-[1px] uppercase text-parchment mb-4">
                4. Payment Terms
              </h2>
              <p className="font-sans text-[15px] leading-[1.8] text-fog mb-4">
                Subscription fees are billed monthly or annually as selected. All fees are non-refundable except as required by law. We reserve the right to modify pricing with 30 days advance notice.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-display font-bold text-[18px] tracking-[1px] uppercase text-parchment mb-4">
                5. Limitation of Liability
              </h2>
              <p className="font-sans text-[15px] leading-[1.8] text-fog mb-4">
                PROTEKON provides compliance documentation and monitoring services but does not guarantee protection from regulatory penalties. Users remain ultimately responsible for their compliance status. Our liability is limited to the fees paid for services in the 12 months preceding any claim.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-display font-bold text-[18px] tracking-[1px] uppercase text-parchment mb-4">
                6. Termination
              </h2>
              <p className="font-sans text-[15px] leading-[1.8] text-fog mb-4">
                Either party may terminate services with 30 days written notice. Upon termination, users will retain access to their documents for 90 days. We reserve the right to terminate accounts that violate these terms immediately.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-display font-bold text-[18px] tracking-[1px] uppercase text-parchment mb-4">
                7. Governing Law
              </h2>
              <p className="font-sans text-[15px] leading-[1.8] text-fog mb-4">
                These terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-display font-bold text-[18px] tracking-[1px] uppercase text-parchment mb-4">
                8. Contact Information
              </h2>
              <p className="font-sans text-[15px] leading-[1.8] text-fog">
                For questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:legal@protekon.com" className="text-gold hover:text-gold/80 transition-colors">
                  legal@protekon.com
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-white/[0.06] py-8">
        <div className="max-w-[800px] mx-auto px-8 flex items-center justify-between">
          <span className="font-sans text-[12px] text-steel">
            © 2025 PROTEKON. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="font-sans text-[12px] text-steel hover:text-brand-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="font-sans text-[12px] text-steel hover:text-brand-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
