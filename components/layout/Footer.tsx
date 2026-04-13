"use client"

import Link from "next/link"
import { LinkedinLogo, XLogo, ShieldCheck } from "@phosphor-icons/react"

const footerLinks = {
  industries: {
    title: "INDUSTRIES",
    links: [
      { name: "Construction", href: "/industries/construction" },
      { name: "Manufacturing", href: "/industries/manufacturing" },
      { name: "Healthcare", href: "/industries/healthcare" },
      { name: "Hospitality", href: "/industries/hospitality" },
      { name: "Warehouse & Logistics", href: "/industries/logistics" },
      { name: "Agriculture", href: "/industries/agriculture" },
      { name: "Retail", href: "/industries/retail" },
      { name: "Transportation", href: "/industries/transportation" },
      { name: "Real Estate", href: "/industries/real-estate" },
      { name: "Automotive Services", href: "/industries/auto-services" },
    ],
    cta: { name: "All 27 Industries", href: "/industries" },
  },
  platform: {
    title: "PLATFORM",
    links: [
      { name: "Compliance Suite", href: "/solutions/compliance-suite" },
      { name: "Protekon for Construction", href: "/solutions/construction" },
      { name: "Protekon for Healthcare", href: "/solutions/healthcare" },
      { name: "Protekon for Real Estate", href: "/solutions/real-estate" },
      { name: "Pricing", href: "/pricing" },
    ],
  },
  partners: {
    title: "PARTNERS",
    links: [
      { name: "Partner Program", href: "/partners" },
      { name: "Partner Pricing", href: "/partners/pricing" },
      { name: "Compliance Boot Camp", href: "/partners/boot-camp" },
      { name: "Apply", href: "/partners/apply" },
    ],
  },
  resources: {
    title: "RESOURCES",
    links: [
      { name: "Blog", href: "/blog" },
      { name: "Resource Library", href: "/resources" },
      { name: "Compliance Score", href: "/score" },
      { name: "Compliance Calculator", href: "/calculator" },
      { name: "Sample Reports", href: "/samples" },
    ],
  },
  company: {
    title: "COMPANY",
    links: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
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
        <div className="py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-12">
          {/* Brand Column — spans 2 on large */}
          <div className="col-span-2">
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
              AI COMPLIANCE OFFICER
            </p>

            {/* Description — national positioning */}
            <p className="font-sans font-light text-[12px] leading-[1.75] text-steel max-w-[280px] mb-6">
              PROTEKON is the compliance officer for American businesses.
              It runs your entire compliance department — every document, every
              deadline, every regulation — so a citation never catches you off guard.
            </p>

            {/* CTA */}
            <Link
              href="/score"
              className="inline-flex items-center font-display font-semibold text-[10px] tracking-[3px] uppercase text-void bg-gold px-6 py-3 hover:bg-parchment transition-colors mb-8"
            >
              Get Your Compliance Score
              <svg className="ml-2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <Link
                href="https://linkedin.com/company/protekon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-steel hover:text-gold transition-colors"
              >
                <LinkedinLogo size={18} weight="fill" />
              </Link>
              <Link
                href="https://x.com/protekon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-steel hover:text-gold transition-colors"
              >
                <XLogo size={18} weight="fill" />
              </Link>
            </div>
          </div>

          {/* Industries Column */}
          <div>
            <h4 className="font-display font-semibold text-[9px] tracking-[3px] uppercase text-steel mb-6">
              {footerLinks.industries.title}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.industries.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-sans font-light text-[13px] text-steel hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li className="mt-1.5 pt-2 border-t border-brand-white/[0.04]">
                <Link
                  href={footerLinks.industries.cta.href}
                  className="font-display font-semibold text-[10px] tracking-[2px] uppercase text-gold hover:text-parchment transition-colors inline-flex items-center gap-1.5"
                >
                  {footerLinks.industries.cta.name}
                  <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform + Partners stacked */}
          <div>
            <h4 className="font-display font-semibold text-[9px] tracking-[3px] uppercase text-steel mb-6">
              {footerLinks.platform.title}
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.platform.links.map((link) => (
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

            <h4 className="font-display font-semibold text-[9px] tracking-[3px] uppercase text-steel mb-6 mt-10">
              {footerLinks.partners.title}
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.partners.links.map((link) => (
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

          {/* Resources + Company stacked */}
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

            <h4 className="font-display font-semibold text-[9px] tracking-[3px] uppercase text-steel mb-6 mt-10">
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
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-brand-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left: Copyright */}
          <p className="font-display font-normal text-[9px] tracking-[2px] text-brand-white/20">
            © 2026 PROTEKON. All rights reserved.
          </p>

          {/* Center: Security badges — only claims we can back */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} weight="fill" className="text-gold" />
              <span className="font-display font-normal text-[9px] tracking-[2px] text-steel">
                Encrypted in Transit
              </span>
            </div>
            <span className="text-brand-white/10">|</span>
            <span className="font-display font-normal text-[9px] tracking-[2px] text-steel">
              Encrypted at Rest
            </span>
            <span className="text-brand-white/10">|</span>
            <span className="font-display font-normal text-[9px] tracking-[2px] text-steel">
              Row-Level Security
            </span>
          </div>

          {/* Right: National positioning */}
          <p className="font-display font-medium text-[9px] tracking-[3px] text-crimson">
            NATIONWIDE COMPLIANCE
          </p>
        </div>
      </div>
    </footer>
  )
}
