"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MagnifyingGlass, BookOpen, Funnel, ShieldCheck } from "@phosphor-icons/react"
import { getKnowledgeArticles, getKnowledgeCategories, type KnowledgeArticle } from "@/lib/actions/knowledge"

export default function KnowledgePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getKnowledgeCategories().then(setCategories)
  }, [])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      getKnowledgeArticles({
        category: selectedCategory || undefined,
        search: search || undefined,
      })
        .then(setArticles)
        .finally(() => setLoading(false))
    }, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [selectedCategory, search])

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-[28px] text-midnight">Knowledge Base</h1>
        <p className="font-sans text-[14px] text-steel mt-1">
          {articles.length} regulatory articles across Cal/OSHA, SB 553, and federal OSHA standards
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
          <input
            type="text"
            placeholder="Search articles, standards, topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-midnight/[0.12] font-sans text-[13px] text-midnight placeholder:text-steel/60 focus:outline-none focus:border-crimson transition-colors"
          />
        </div>
        <div className="relative">
          <Funnel size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-midnight/[0.12] font-display text-[11px] tracking-[1px] uppercase text-midnight appearance-none cursor-pointer focus:outline-none focus:border-crimson bg-brand-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-brand-white border border-midnight/[0.08] p-6 animate-pulse">
              <div className="h-4 bg-parchment rounded w-2/3 mb-3" />
              <div className="h-3 bg-parchment rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-brand-white border border-midnight/[0.08] p-12 text-center">
          <BookOpen size={48} className="text-steel/30 mx-auto mb-4" />
          <p className="font-sans text-[14px] text-steel">No articles found matching your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article, i) => (
            <motion.div
              key={article.id}
              className="bg-brand-white border border-midnight/[0.08] hover:shadow-sm transition-shadow cursor-pointer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              onClick={() => setExpanded(expanded === article.id ? null : article.id)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {article.cfr_standard && (
                        <span className="px-1.5 py-0.5 bg-gold/10 border border-gold/30 font-display font-medium text-[9px] tracking-[1px] text-gold">
                          {article.cfr_standard}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 bg-midnight/5 font-display font-medium text-[9px] tracking-[1px] uppercase text-steel">
                        {article.category}
                      </span>
                      {article.is_california_specific && (
                        <span className="px-1.5 py-0.5 bg-crimson/10 font-display font-medium text-[9px] tracking-[1px] uppercase text-crimson">
                          CA Specific
                        </span>
                      )}
                      {article.priority === "critical" && (
                        <ShieldCheck size={14} className="text-crimson" weight="bold" />
                      )}
                    </div>
                    <h3 className="font-display font-bold text-[15px] text-midnight leading-snug">
                      {article.title}
                    </h3>
                    <p className="font-sans text-[12px] text-steel mt-1">
                      {article.topic}
                      {article.source_publication && ` — ${article.source_publication}`}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="font-display text-[9px] tracking-[1px] uppercase text-steel">
                      {article.applies_to_verticals?.length || 0} verticals
                    </span>
                  </div>
                </div>

                {expanded === article.id && (
                  <motion.div
                    className="mt-4 pt-4 border-t border-midnight/[0.06]"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="font-sans text-[13px] text-midnight leading-relaxed whitespace-pre-line">
                      {article.content}
                    </p>
                    {article.applies_to_verticals?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {article.applies_to_verticals.map((v) => (
                          <span key={v} className="px-2 py-0.5 bg-parchment font-display text-[9px] tracking-[1px] uppercase text-midnight">
                            {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
