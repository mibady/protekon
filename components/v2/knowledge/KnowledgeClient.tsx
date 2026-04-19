"use client"

import { useMemo, useState } from "react"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import type { KnowledgeArticle } from "@/lib/actions/knowledge"

type KnowledgeClientProps = {
  articles: KnowledgeArticle[]
}

function priorityTone(priority: string): "enforcement" | "sand" | "steel" {
  const p = (priority || "").toLowerCase()
  if (p === "critical" || p === "high") return "enforcement"
  if (p === "medium") return "sand"
  return "steel"
}

export function KnowledgeClient({ articles }: KnowledgeClientProps) {
  const [query, setQuery] = useState("")
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return articles
    const q = query.toLowerCase()
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.topic.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q)
    )
  }, [articles, query])

  const grouped = useMemo(() => {
    const map = new Map<string, KnowledgeArticle[]>()
    for (const a of filtered) {
      const key = a.category || "Uncategorised"
      const bucket = map.get(key) ?? []
      bucket.push(a)
      map.set(key, bucket)
    }
    return Array.from(map.entries())
  }, [filtered])

  return (
    <>
      <div
        className="p-5 mb-8"
        style={{
          background: "var(--white)",
          border: "1px solid rgba(11, 29, 58, 0.08)",
        }}
      >
        <label className="block">
          <span
            className="block font-display uppercase mb-2"
            style={{
              color: "var(--steel)",
              fontSize: "10px",
              letterSpacing: "2px",
              fontWeight: 600,
            }}
          >
            Search the knowledge base
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Heat illness, IIPP, Cal/OSHA inspection…"
            className="w-full px-3 py-2 font-sans"
            style={{
              background: "var(--parchment)",
              border: "1px solid rgba(11, 29, 58, 0.15)",
              color: "var(--ink)",
              fontSize: "14px",
            }}
          />
        </label>
        <div
          className="mt-3 font-sans"
          style={{ color: "var(--steel)", fontSize: "12px" }}
        >
          {filtered.length} {filtered.length === 1 ? "article" : "articles"}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="py-10 text-center font-sans"
          style={{ color: "var(--steel)", fontSize: "14px" }}
        >
          Nothing matches that yet. Try a broader term, or browse all articles by clearing the
          search.
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map(([category, items]) => (
            <section key={category}>
              <div
                className="flex items-baseline gap-3 mb-5"
                style={{ borderBottom: "2px solid var(--void)", paddingBottom: "0.75rem" }}
              >
                <h2
                  className="font-display"
                  style={{ color: "var(--ink)", fontSize: "20px", fontWeight: 700 }}
                >
                  {category}
                </h2>
                <span
                  className="font-display uppercase"
                  style={{
                    color: "var(--steel)",
                    fontSize: "10px",
                    letterSpacing: "2px",
                  }}
                >
                  {items.length}
                </span>
              </div>

              <ul className="divide-y" style={{ borderColor: "rgba(11, 29, 58, 0.06)" }}>
                {items.map((article) => (
                  <li key={article.id}>
                    <button
                      onClick={() => setActiveArticle(article)}
                      className="w-full text-left py-4 flex items-start gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <PriorityPill tone={priorityTone(article.priority)}>
                            {article.priority || "info"}
                          </PriorityPill>
                          {article.is_california_specific && (
                            <span
                              className="font-display uppercase"
                              style={{
                                color: "var(--enforcement)",
                                fontSize: "10px",
                                letterSpacing: "2px",
                              }}
                            >
                              California
                            </span>
                          )}
                          {article.cfr_standard && (
                            <span
                              className="font-display uppercase"
                              style={{
                                color: "var(--steel)",
                                fontSize: "10px",
                                letterSpacing: "2px",
                              }}
                            >
                              {article.cfr_standard}
                            </span>
                          )}
                        </div>
                        <div
                          className="font-sans"
                          style={{
                            color: "var(--ink)",
                            fontSize: "15px",
                            fontWeight: 600,
                          }}
                        >
                          {article.title}
                        </div>
                        <div
                          className="font-sans mt-1"
                          style={{ color: "var(--steel)", fontSize: "13px" }}
                        >
                          {article.topic}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {activeArticle && (
        <ArticleModal
          article={activeArticle}
          onClose={() => setActiveArticle(null)}
        />
      )}
    </>
  )
}

function ArticleModal({
  article,
  onClose,
}: {
  article: KnowledgeArticle
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6 z-50"
      style={{ background: "rgba(7, 15, 30, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        style={{
          background: "var(--white)",
          border: "1px solid rgba(11, 29, 58, 0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div
              className="font-display uppercase"
              style={{
                color: "var(--steel)",
                fontSize: "11px",
                letterSpacing: "3px",
              }}
            >
              {article.category}
            </div>
            <button
              onClick={onClose}
              className="font-display uppercase"
              style={{
                color: "var(--steel)",
                fontSize: "10px",
                letterSpacing: "2px",
              }}
            >
              Close
            </button>
          </div>
          <h2
            className="font-display"
            style={{
              color: "var(--ink)",
              fontSize: "24px",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {article.title}
          </h2>
          {article.cfr_standard && (
            <div
              className="font-display uppercase"
              style={{
                color: "var(--enforcement)",
                fontSize: "11px",
                letterSpacing: "2px",
              }}
            >
              {article.cfr_standard}
              {article.source_publication ? ` · ${article.source_publication}` : ""}
            </div>
          )}
          <div
            className="font-sans whitespace-pre-wrap"
            style={{ color: "var(--ink)", fontSize: "14px", lineHeight: 1.6 }}
          >
            {article.content}
          </div>
        </div>
      </div>
    </div>
  )
}
