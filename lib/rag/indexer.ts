import { Index } from "@upstash/vector"
import { embedBatch } from "./embeddings"
import { createAdminClient } from "@/lib/supabase/admin"
import type { VectorMetadata } from "./types"

const BATCH_SIZE = 50

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

export async function indexKnowledgeBase(): Promise<number> {
  const supabase = createAdminClient()
  const { data: articles } = await supabase
    .from("osha_knowledge_base")
    .select("id, title, content, category, vertical, standard_code, source")

  if (!articles || articles.length === 0) return 0

  let indexed = 0
  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE)
    const texts = batch.map(
      (a) => `${a.title}\n\n${a.content}${a.standard_code ? `\n\nStandard: ${a.standard_code}` : ""}`
    )
    const embeddings = await embedBatch(texts)

    await index.upsert(
      batch.map((a, j) => ({
        id: `knowledge-${a.id}` as string,
        vector: embeddings[j],
        metadata: {
          type: "knowledge",
          vertical: a.vertical ?? "",
          source: a.source ?? "",
          standardCode: a.standard_code ?? "",
          title: a.title,
          content: texts[j].slice(0, 2000),
        },
      }))
    )
    indexed += batch.length
  }

  return indexed
}

export async function indexRegulatoryUpdates(): Promise<number> {
  const supabase = createAdminClient()
  const { data: updates } = await supabase
    .from("regulatory_updates")
    .select("id, title, summary, category, jurisdiction, severity, effective_date")

  if (!updates || updates.length === 0) return 0

  let indexed = 0
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE)
    const texts = batch.map(
      (u) =>
        `${u.title}\n\n${u.summary ?? ""}${u.jurisdiction ? `\nJurisdiction: ${u.jurisdiction}` : ""}${u.effective_date ? `\nEffective: ${u.effective_date}` : ""}`
    )
    const embeddings = await embedBatch(texts)

    await index.upsert(
      batch.map((u, j) => ({
        id: `regulatory-${u.id}` as string,
        vector: embeddings[j],
        metadata: {
          type: "regulatory",
          source: u.jurisdiction ?? "",
          severity: u.severity ?? "",
          title: u.title,
          content: texts[j].slice(0, 2000),
        },
      }))
    )
    indexed += batch.length
  }

  return indexed
}

export async function indexSingleDocument(doc: {
  id: string
  title: string
  content: string
  metadata: VectorMetadata
}): Promise<void> {
  const text = `${doc.title}\n\n${doc.content}`
  const [embedding] = await embedBatch([text])

  await index.upsert({
    id: `${doc.metadata.type}-${doc.id}`,
    vector: embedding,
    metadata: {
      ...Object.fromEntries(
        Object.entries(doc.metadata).filter(([, v]) => v !== undefined)
      ),
      content: text.slice(0, 2000),
    },
  })
}
