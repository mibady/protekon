"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import { FileText, Video, Newspaper, BookOpen, Download, ArrowRight } from "@phosphor-icons/react"
import { submitSampleGate } from "@/lib/actions/samples"

const iconMap: Record<string, typeof BookOpen> = {
  guide: BookOpen,
  template: FileText,
  webinar: Video,
  article: Newspaper,
  checklist: FileText,
  whitepaper: FileText,
}

const typeLabels: Record<string, string> = {
  guide: "Guide",
  template: "Template",
  webinar: "Webinar",
  article: "Article",
  checklist: "Checklist",
  whitepaper: "Whitepaper",
}

interface SanityResource {
  _id: string
  title: string
  slug: { current: string }
  resourceType: string
  excerpt: string
  publishedAt: string
  categories?: { title: string; slug: { current: string } }[]
}

interface Props {
  featured: SanityResource[]
  articles: SanityResource[]
  downloads: { title: string; format: string; size: string }[]
}

export default function ResourcesClient({ featured, articles, downloads }: Props) {
  const [nlEmail, setNlEmail] = useState("")
  const [nlSubmitting, setNlSubmitting] = useState(false)
  const [nlDone, setNlDone] = useState(false)

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nlEmail.trim()) return
    setNlSubmitting(true)
    const fd = new FormData()
    fd.set("email", nlEmail)
    await submitSampleGate(fd)
    setNlDone(true)
    setNlSubmitting(false)
  }

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
            <span className="font-display text-[12px] tracking-[4px] uppercase text-gold">
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
      {featured.length > 0 && (
        <section className="py-20 px-8">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-display font-bold text-[12px] tracking-[4px] uppercase text-gold mb-8">
              Featured Resources
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featured.map((resource: SanityResource, i: number) => {
                const Icon = iconMap[resource.resourceType] || FileText
                const readTime = resource.resourceType === "webinar" ? "45 min video"
                  : resource.resourceType === "template" ? "Download"
                  : "15 min read"

                return (
                  <motion.div
                    key={resource._id}
                    className="group bg-midnight border border-brand-white/[0.06] p-8 hover:border-gold/30 transition-colors flex flex-col"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 flex items-center justify-center bg-crimson/10">
                        <Icon size={20} weight="bold" className="text-crimson" />
                      </div>
                      <span className="font-display text-[12px] tracking-[2px] uppercase text-gold">
                        {typeLabels[resource.resourceType] || resource.resourceType}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-[18px] text-parchment mb-3">
                      {resource.title}
                    </h3>

                    <p className="font-sans text-[14px] text-steel leading-relaxed mb-6 flex-1">
                      {resource.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="font-display text-[12px] tracking-[2px] uppercase text-steel">
                        {readTime}
                      </span>
                      <Link
                        href={`/resources/${resource.slug.current}`}
                        className="inline-flex items-center font-display font-semibold text-[12px] tracking-[3px] uppercase text-gold hover:text-parchment transition-colors"
                      >
                        Access
                        <ArrowRight size={14} className="ml-1" />
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Articles + Downloads */}
      <section className="py-20 px-8 bg-midnight border-y border-brand-white/[0.06]">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-[2fr_1fr] gap-12">
          {/* Articles */}
          <div>
            <h2 className="font-display font-bold text-[12px] tracking-[4px] uppercase text-gold mb-8">
              Latest Articles
            </h2>
            <div className="space-y-6">
              {articles.map((article: SanityResource, i: number) => {
                const category = article.categories?.[0]?.title || "Article"
                const date = article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : ""

                return (
                  <motion.div
                    key={article._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <Link
                      href={`/resources/${article.slug.current}`}
                      className="group flex items-start gap-6 p-4 border-l-2 border-transparent hover:border-gold hover:bg-void/50 transition-all"
                    >
                      <div className="flex-1">
                        <span className="font-display text-[9px] tracking-[2px] uppercase text-crimson">
                          {category}
                        </span>
                        <h3 className="font-display font-semibold text-[16px] text-parchment group-hover:text-gold transition-colors mt-1">
                          {article.title}
                        </h3>
                      </div>
                      <span className="font-display text-[12px] tracking-[2px] uppercase text-steel">
                        {date}
                      </span>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
            {articles.length > 0 && (
              <Link
                href="/resources/articles"
                className="inline-flex items-center font-display font-semibold text-[12px] tracking-[3px] uppercase text-gold hover:text-parchment transition-colors mt-8"
              >
                View All Articles
                <ArrowRight size={14} className="ml-2" />
              </Link>
            )}
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
                  <button
                    onClick={() => window.open(`/api/samples/gate?report=${encodeURIComponent(download.title)}`, "_blank")}
                    className="font-display text-[9px] tracking-[2px] uppercase text-gold hover:text-parchment transition-colors"
                  >
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
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              required
              value={nlEmail}
              onChange={(e) => setNlEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={nlDone}
              className="flex-1 bg-midnight border border-brand-white/[0.08] px-4 py-3 font-sans text-[14px] text-parchment placeholder:text-steel focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={nlSubmitting || nlDone}
              className="font-display font-semibold text-[12px] tracking-[3px] uppercase text-parchment bg-crimson px-6 py-3 hover:brightness-110 transition-all disabled:opacity-70"
            >
              {nlSubmitting ? "Subscribing..." : nlDone ? "Subscribed ✓" : "Subscribe"}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  )
}
