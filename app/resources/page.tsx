"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import { FileText, Video, Newspaper, BookOpen, Download, ArrowRight } from "@phosphor-icons/react"

const featuredResources = [
  {
    type: "Guide",
    icon: BookOpen,
    title: "The Complete Guide to SB 553 Compliance",
    description: "Everything California employers need to know about the Workplace Violence Prevention Act. Requirements, deadlines, and implementation strategies.",
    readTime: "15 min read",
    href: "/resources/sb-553-guide",
  },
  {
    type: "Template",
    icon: FileText,
    title: "IIPP Template for California SMBs",
    description: "A customizable Injury and Illness Prevention Program template that meets 8 CCR 3203 requirements. Ready to adapt to your business.",
    readTime: "Download",
    href: "/resources/iipp-template",
  },
  {
    type: "Webinar",
    icon: Video,
    title: "Cal/OSHA Inspection: What to Expect",
    description: "A recorded webinar walking through the Cal/OSHA inspection process. Opening conference, walkaround, closing conference, and follow-up.",
    readTime: "45 min video",
    href: "/resources/inspection-webinar",
  },
]

const articles = [
  {
    category: "Compliance",
    title: "Top 10 Cal/OSHA Violations in 2024",
    date: "Mar 15, 2025",
    href: "/resources/top-violations-2024",
  },
  {
    category: "Regulations",
    title: "Understanding the SB 553 July 1 Deadline",
    date: "Mar 10, 2025",
    href: "/resources/sb-553-deadline",
  },
  {
    category: "Industry",
    title: "Construction Safety: New CSLB Requirements",
    date: "Mar 5, 2025",
    href: "/resources/cslb-requirements",
  },
  {
    category: "Best Practices",
    title: "How to Conduct an Effective Safety Meeting",
    date: "Feb 28, 2025",
    href: "/resources/safety-meetings",
  },
  {
    category: "Compliance",
    title: "Incident Logging: OSHA 300 Requirements",
    date: "Feb 20, 2025",
    href: "/resources/osha-300-logging",
  },
  {
    category: "Regulations",
    title: "Heat Illness Prevention: California Rules",
    date: "Feb 15, 2025",
    href: "/resources/heat-illness",
  },
]

const downloads = [
  { title: "IIPP Template", format: "DOCX", size: "245 KB" },
  { title: "SB 553 Checklist", format: "PDF", size: "128 KB" },
  { title: "Incident Report Form", format: "PDF", size: "89 KB" },
  { title: "Safety Meeting Log", format: "XLSX", size: "56 KB" },
]

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-void">
      <Nav />
      
      {/* Hero */}
      <section className="pt-32 pb-20 px-8 border-b border-brand-white/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-display text-[10px] tracking-[4px] uppercase text-gold">
              Resources
            </span>
            <h1 className="font-display font-black text-[clamp(40px,6vw,64px)] leading-[0.92] text-parchment mt-4 mb-6">
              COMPLIANCE KNOWLEDGE BASE
            </h1>
            <p className="font-sans text-[16px] text-steel max-w-[600px] leading-relaxed">
              Guides, templates, webinars, and articles to help you understand and maintain 
              California workplace compliance. All free. No registration required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-20 px-8">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-display font-bold text-[12px] tracking-[4px] uppercase text-gold mb-8">
            Featured Resources
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredResources.map((resource, i) => (
              <motion.div
                key={resource.title}
                className="group bg-midnight border border-brand-white/[0.06] p-8 hover:border-gold/30 transition-colors flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 flex items-center justify-center bg-crimson/10">
                    <resource.icon size={20} weight="bold" className="text-crimson" />
                  </div>
                  <span className="font-display text-[10px] tracking-[2px] uppercase text-gold">
                    {resource.type}
                  </span>
                </div>

                <h3 className="font-display font-bold text-[18px] text-parchment mb-3">
                  {resource.title}
                </h3>

                <p className="font-sans text-[14px] text-steel leading-relaxed mb-6 flex-1">
                  {resource.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="font-display text-[10px] tracking-[2px] uppercase text-steel">
                    {resource.readTime}
                  </span>
                  <Link
                    href={resource.href}
                    className="inline-flex items-center font-display font-semibold text-[10px] tracking-[3px] uppercase text-gold hover:text-parchment transition-colors"
                  >
                    Access
                    <ArrowRight size={14} className="ml-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles + Downloads */}
      <section className="py-20 px-8 bg-midnight border-y border-brand-white/[0.06]">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-[2fr_1fr] gap-12">
          {/* Articles */}
          <div>
            <h2 className="font-display font-bold text-[12px] tracking-[4px] uppercase text-gold mb-8">
              Latest Articles
            </h2>
            <div className="space-y-6">
              {articles.map((article, i) => (
                <motion.div
                  key={article.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link 
                    href={article.href}
                    className="group flex items-start gap-6 p-4 border-l-2 border-transparent hover:border-gold hover:bg-void/50 transition-all"
                  >
                    <div className="flex-1">
                      <span className="font-display text-[9px] tracking-[2px] uppercase text-crimson">
                        {article.category}
                      </span>
                      <h3 className="font-display font-semibold text-[16px] text-parchment group-hover:text-gold transition-colors mt-1">
                        {article.title}
                      </h3>
                    </div>
                    <span className="font-display text-[10px] tracking-[2px] uppercase text-steel">
                      {article.date}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
            <Link
              href="/resources/articles"
              className="inline-flex items-center font-display font-semibold text-[10px] tracking-[3px] uppercase text-gold hover:text-parchment transition-colors mt-8"
            >
              View All Articles
              <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>

          {/* Downloads */}
          <div>
            <h2 className="font-display font-bold text-[12px] tracking-[4px] uppercase text-gold mb-8">
              Free Downloads
            </h2>
            <div className="space-y-4">
              {downloads.map((download, i) => (
                <motion.div
                  key={download.title}
                  className="flex items-center justify-between p-4 bg-void border border-brand-white/[0.06] hover:border-gold/30 transition-colors"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <Download size={18} className="text-gold" />
                    <div>
                      <span className="font-display text-[14px] text-parchment block">
                        {download.title}
                      </span>
                      <span className="font-display text-[9px] tracking-[2px] uppercase text-steel">
                        {download.format} · {download.size}
                      </span>
                    </div>
                  </div>
                  <button className="font-display text-[9px] tracking-[2px] uppercase text-gold hover:text-parchment transition-colors">
                    Download
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 px-8">
        <div className="max-w-[600px] mx-auto text-center">
          <Newspaper size={48} weight="light" className="text-gold mx-auto mb-6" />
          <h2 className="font-display font-black text-[clamp(24px,4vw,32px)] leading-[0.92] text-parchment mb-4">
            STAY COMPLIANT
          </h2>
          <p className="font-sans text-[14px] text-steel mb-8">
            Get weekly compliance updates, regulation changes, and enforcement trends delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-midnight border border-brand-white/[0.08] px-4 py-3 font-sans text-[14px] text-parchment placeholder:text-steel focus:outline-none focus:border-gold transition-colors"
            />
            <button
              type="submit"
              className="font-display font-semibold text-[10px] tracking-[3px] uppercase text-parchment bg-crimson px-6 py-3 hover:brightness-110 transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  )
}
