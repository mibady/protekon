import { inngest } from "../client"
import { indexSingleDocument } from "@/lib/rag/indexer"
import type { VectorMetadata } from "@/lib/rag/types"

export const ragIndexer = inngest.createFunction(
  { id: "rag-indexer", triggers: [{ event: "rag/document.index" }] },
  async ({ event, step }) => {
    const { id, title, content, metadata } = event.data as {
      id: string
      title: string
      content: string
      metadata: VectorMetadata
    }

    await step.run("embed-and-upsert", async () => {
      await indexSingleDocument({ id, title, content, metadata })
    })

    return { success: true, id }
  }
)
