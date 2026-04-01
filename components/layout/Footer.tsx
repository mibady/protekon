"use client"

import Link from "next/link"
import { LinkedinLogo, XLogo, ShieldCheck } from "@phosphor-icons/react"

const footerLinks = {
  solutions: {
    title: "SOLUTIONS",
    links: [
      { name: "Compliance Suite", href: "#compliance-suite" },
      { name: "Construction Shield", href: "#construction" },
      { name: "Healthcare Shield", href: "#healthcare" },
      { name: "Real Estate Shield", href: "#real-estate" },
    ],
  },
  company: {
    title: "COMPANY",
    links: [
      { name: "About", href: "/about" },
      { name: "Press & Media", href: "/press" },
      { name: "Investors", href: "/investors" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
  },
  resources: {
    title: "RESOURCES",
    links: [
      { name: "Blog / Resources", href: "/blog" },
      { name: "API Docs (Phase 2)", href: "/api-docs" },
      { name: "Compliance Calculator", href: "/calculator" },
      { name: "Sample Reports", href: "#sample" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  },
}

export default function Footer() {
  return (
    <footer className="bg-void border-t border-brand-white/[0.05] relative">
      {/* Crimson top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-crimson" />

      <div className="max-w-[1400px] mx-auto px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 mb-6">
              <svg viewBox="0 0 48 84" className="w-9 h-16">
                <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
                <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
                <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
                <rect x="0" y="40" width="48" height="10" fill="#C41230" />
              </svg>
              <span className="font-display font-bold text-[24px] tracking-[7px] text-brand-white">
                PROT<span className="text-crimson">E</span>KON
              </span>
            </Link>

            {/* Tagline */}
            <p className="font-display font-light text-[11px] tracking-[4px] uppercase text-gold mb-4">
              MANAGED COMPLIANCE. DELIVERED.
            </p>

            {/* Description */}
            <p className="font-sans font-light text-[12px] leading-[1.75] text-steel max-w-[240px] mb-6">
              PROTEKON delivers California workplace 
              compliance as a recurring managed service.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <Link 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-steel hover:text-brand-white transition-colors"
              >
                <LinkedinLogo size={18} weight="fill" />
              </Link>
              <Link 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-steel hover:text-brand-white transition-colors"
              >
                <XLogo size={18} weight="fill" />
              </Link>
            </div>
          </div>

          {/* Solutions Column */}
          <div>
            <h4 className="font-display font-semibold text-[9px] tracking-[3px] uppercase text-steel mb-6">
              {footerLinks.solutions.title}
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.solutions.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-sans font-light text-[13px] text-steel hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-display font-semibold text-[9px] tracking-[3px] uppercase text-steel mb-6">
              {footerLinks.company.title}
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.company.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-sans font-light text-[13px] text-steel hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="font-display font-semibold text-[9px] tracking-[3px] uppercase text-steel mb-6">
              {footerLinks.resources.title}
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.resources.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-sans font-light text-[13px] text-steel hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-brand-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left: Copyright */}
          <p className="font-display font-normal text-[9px] tracking-[2px] text-brand-white/20">
            © 2025 PROTEKON. All rights reserved.
          </p>

          {/* Center: Security badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} weight="fill" className="text-gold" />
              <span className="font-display font-normal text-[9px] tracking-[2px] text-steel">
                SOC 2 Compliant Storage
              </span>
            </div>
            <span className="text-brand-white/10">|</span>
            <span className="font-display font-normal text-[9px] tracking-[2px] text-steel">
              TLS 1.3 Encrypted
            </span>
            <span className="text-brand-white/10">|</span>
            <span className="font-display font-normal text-[9px] tracking-[2px] text-steel">
              AES-256 at Rest
            </span>
          </div>

          {/* Right: Location */}
          <p className="font-display font-medium text-[9px] tracking-[3px] text-crimson">
            INLAND EMPIRE, CALIFORNIA
          </p>
        </div>
      </div>
    </footer>
  )
}
