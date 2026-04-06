"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function PrivacyPage() {
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
            PRIVACY POLICY
          </h1>
          <p className="font-sans text-[14px] text-steel mb-12">
            Last updated: January 1, 2025
          </p>

          <div className="prose prose-invert max-w-none">
            <section className="mb-12">
              <h2 className="font-display font-bold text-[18px] tracking-[1px] uppercase text-parchment mb-4">
                1. Information We Collect
              </h2>
              <p className="font-sans text-[15px] leading-[1.8] text-fog mb-4">
                We collect information you provide directly, including: business information, contact details, employee counts, incident reports, and compliance documentation. We also collect usage data such as IP addresses, browser types, and interaction patterns with our platform.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-display font-bold text-[18px] tracking-[1px] uppercase text-parchment mb-4">
                2. How We Use Your Information
              </h2>
              <p className="font-sans text-[15px] leading-[1.8] text-fog mb-4">
                We use collected information to: provide and improve our compliance services, generate customized documentation, monitor regulatory changes relevant to your business, communicate service updates, and ensure platform security.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-display font-bold text-[18px] tracking-[1px] uppercase text-parchment mb-4">
                3. Data Security
              </h2>
              <p className="font-sans text-[15px] leading-[1.8] text-fog mb-4">
                We implement industry-standard security measures including encryption at rest and in transit, regular security audits, and SOC 2 Type II compliance. All incident data is stripped of personally identifiable information (PII) before processing.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-display font-bold text-[18px] tracking-[1px] uppercase text-parchment mb-4">
                4. Data Sharing
              </h2>
              <p className="font-sans text-[15px] leading-[1.8] text-fog mb-4">
                We do not sell your personal information. We may share data with: service providers who assist in platform operations, legal authorities when required by law, and successor entities in case of merger or acquisition.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-display font-bold text-[18px] tracking-[1px] uppercase text-parchment mb-4">
                5. Data Retention
              </h2>
              <p className="font-sans text-[15px] leading-[1.8] text-fog mb-4">
                We retain compliance documents and incident logs for the duration required by California law (minimum 5 years for OSHA records). Account data is retained for 90 days after termination. You may request data deletion subject to legal retention requirements.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-display font-bold text-[18px] tracking-[1px] uppercase text-parchment mb-4">
                6. Your Rights (CCPA)
              </h2>
              <p className="font-sans text-[15px] leading-[1.8] text-fog mb-4">
                Under the California Consumer Privacy Act, you have the right to: know what personal information we collect, request deletion of your data, opt-out of data sales (we do not sell data), and non-discrimination for exercising these rights.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-display font-bold text-[18px] tracking-[1px] uppercase text-parchment mb-4">
                7. Cookies and Tracking
              </h2>
              <p className="font-sans text-[15px] leading-[1.8] text-fog mb-4">
                We use essential cookies for platform functionality and analytics cookies to improve our services. You can control cookie preferences through your browser settings. Disabling cookies may affect platform functionality.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-display font-bold text-[18px] tracking-[1px] uppercase text-parchment mb-4">
                8. Contact Us
              </h2>
              <p className="font-sans text-[15px] leading-[1.8] text-fog">
                For privacy-related inquiries or to exercise your rights, contact us at{" "}
                <a href="mailto:privacy@protekon.com" className="text-gold hover:text-gold/80 transition-colors">
                  privacy@protekon.com
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
            <Link href="/terms" className="font-sans text-[12px] text-steel hover:text-brand-white transition-colors">
              Terms of Service
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
