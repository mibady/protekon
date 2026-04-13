/**
 * One-time indexing script for RAG knowledge base.
 * Run: npx tsx scripts/index-knowledge.ts
 *
 * Idempotent — upserts by ID, safe to re-run.
 * Requires UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN, OPENAI_API_KEY env vars.
 */

import "dotenv/config"
import { indexKnowledgeBase, indexRegulatoryUpdates } from "../lib/rag/indexer"

async function main() {
  console.log("Starting RAG knowledge indexing...\n")

  console.log("Indexing knowledge base articles...")
  const knowledgeCount = await indexKnowledgeBase()
  console.log(`  ✓ Indexed ${knowledgeCount} knowledge articles\n`)

  console.log("Indexing regulatory updates...")
  const regulatoryCount = await indexRegulatoryUpdates()
  console.log(`  ✓ Indexed ${regulatoryCount} regulatory updates\n`)

  console.log(`Done. Total vectors: ${knowledgeCount + regulatoryCount}`)
}

main().catch((err) => {
  console.error("Indexing failed:", err)
  process.exit(1)
})
