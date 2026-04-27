import { Index } from "@upstash/vector"
import { embedText } from "./embeddings"
import type { RetrievedChunk, VectorMetadata } from "./types"

let index: Index<VectorMetadata> | null | undefined

function getIndex(): Index<VectorMetadata> | null {
  if (index !== undefined) return index
  const url = process.env.UPSTASH_VECTOR_REST_URL
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN
  if (!url || !token) {
    index = null
    return index
  }
  index = new Index<VectorMetadata>({ url, token })
  return index
}

export async function retrieveContext(
  query: string,
  filters?: { vertical?: string; clientId?: string },
  topK: number = 8
): Promise<RetrievedChunk[]> {
  const vectorIndex = getIndex()
  if (!vectorIndex) return []

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

  const results = await vectorIndex.query({
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
