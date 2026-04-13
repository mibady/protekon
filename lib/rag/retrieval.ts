import { Index } from "@upstash/vector"
import { embedText } from "./embeddings"
import type { RetrievedChunk, VectorMetadata } from "./types"

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

export async function retrieveContext(
  query: string,
  filters?: { vertical?: string; clientId?: string },
  topK: number = 8
): Promise<RetrievedChunk[]> {
  const queryVector = await embedText(query)

  let filter: string | undefined
  const conditions: string[] = []
  if (filters?.vertical) {
    conditions.push(`vertical = '${filters.vertical}'`)
  }
  if (filters?.clientId) {
    conditions.push(`clientId = '${filters.clientId}'`)
  }
  if (conditions.length > 0) {
    filter = conditions.join(" AND ")
  }

  const results = await index.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
    filter,
  })

  return results
    .filter((r) => r.score && r.score > 0.3)
    .map((r) => {
      const meta = (r.metadata ?? {}) as Record<string, string>
      return {
        id: r.id as string,
        content: meta.content ?? "",
        metadata: {
          type: (meta.type ?? "knowledge") as VectorMetadata["type"],
          vertical: meta.vertical || undefined,
          source: meta.source || undefined,
          standardCode: meta.standardCode || undefined,
          clientId: meta.clientId || undefined,
          title: meta.title || undefined,
          severity: meta.severity || undefined,
        },
        score: r.score ?? 0,
      }
    })
}
