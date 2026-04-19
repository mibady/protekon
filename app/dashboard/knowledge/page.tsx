import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { getKnowledgeArticles } from "@/lib/actions/knowledge"
import { KnowledgeClient } from "@/components/v2/knowledge/KnowledgeClient"

export const dynamic = "force-dynamic"

export default async function KnowledgePage() {
  const articles = await getKnowledgeArticles()

  return (
    <div className="px-8 pt-10 pb-16 max-w-6xl w-full mx-auto">
      <PageHeader
        eyebrow="INTELLIGENCE · KNOWLEDGE BASE"
        title="Knowledge base."
        subtitle="Ask me anything, or browse the articles I've written for businesses like yours. Every article is cross-referenced with the regulations that back it up."
      />

      <KnowledgeClient articles={articles} />
    </div>
  )
}
