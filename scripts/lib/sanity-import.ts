/**
 * Shared Sanity import utilities
 * Used by all seed-* and import-* scripts
 */
import { config } from "dotenv"
config({ path: ".env.local" })

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_API_PROJECT_ID
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_API_DATASET
const TOKEN = process.env.SANITY_API_WRITE_TOKEN

if (!PROJECT_ID || !DATASET || !TOKEN) {
  console.error("Missing SANITY env vars. Check .env.local")
  process.exit(1)
}

const API = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`

export function rkey() {
  return Math.random().toString(36).slice(2, 10)
}

/** Convert markdown-style text into Sanity Portable Text blocks */
export function textToBlocks(text: string) {
  return text
    .split("\n\n")
    .map((paragraph) => {
      const isH2 = paragraph.startsWith("## ")
      const isH3 = paragraph.startsWith("### ")
      const isH4 = paragraph.startsWith("#### ")
      const isList = paragraph.split("\n").every((l) => l.trimStart().startsWith("- "))
      const isNumberedList = paragraph.split("\n").every((l) => /^\d+\.\s/.test(l.trimStart()))

      if (isH2) {
        return {
          _type: "block" as const,
          _key: rkey(),
          style: "h2" as const,
          children: [{ _type: "span" as const, _key: rkey(), text: paragraph.replace("## ", "") }],
        }
      }
      if (isH3) {
        return {
          _type: "block" as const,
          _key: rkey(),
          style: "h3" as const,
          children: [{ _type: "span" as const, _key: rkey(), text: paragraph.replace("### ", "") }],
        }
      }
      if (isH4) {
        return {
          _type: "block" as const,
          _key: rkey(),
          style: "h4" as const,
          children: [{ _type: "span" as const, _key: rkey(), text: paragraph.replace("#### ", "") }],
        }
      }
      if (isList) {
        return paragraph.split("\n").map((line) => ({
          _type: "block" as const,
          _key: rkey(),
          style: "normal" as const,
          listItem: "bullet" as const,
          level: 1,
          children: [{ _type: "span" as const, _key: rkey(), text: line.replace(/^\s*-\s/, "") }],
        }))
      }
      if (isNumberedList) {
        return paragraph.split("\n").map((line) => ({
          _type: "block" as const,
          _key: rkey(),
          style: "normal" as const,
          listItem: "number" as const,
          level: 1,
          children: [{ _type: "span" as const, _key: rkey(), text: line.replace(/^\s*\d+\.\s/, "") }],
        }))
      }
      return {
        _type: "block" as const,
        _key: rkey(),
        style: "normal" as const,
        children: [{ _type: "span" as const, _key: rkey(), text: paragraph.trim() }],
      }
    })
    .flat()
}

/** Helper to create a slug object */
export function slug(value: string) {
  return { _type: "slug" as const, current: value }
}

/** Helper to create a category reference */
export function catRef(id: string) {
  return { _type: "reference" as const, _ref: id, _key: rkey() }
}

/** Push documents to Sanity using createOrReplace (idempotent) */
export async function pushToSanity(documents: any[], label?: string) {
  const mutations = documents.map((doc) => ({ createOrReplace: doc }))
  const batchSize = 100
  let total = 0

  for (let i = 0; i < mutations.length; i += batchSize) {
    const batch = mutations.slice(i, i + batchSize)
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ mutations: batch }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error(`Sanity API error (batch ${Math.floor(i / batchSize) + 1}):`, JSON.stringify(data, null, 2))
      process.exit(1)
    }
    total += data.results?.length || 0
    console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${data.results?.length || 0} documents`)
  }

  console.log(`✅ ${label || "Import"}: ${total} documents pushed`)
  return total
}

// ─── Canonical Lists ───

export const INDUSTRIES_27 = [
  "agriculture", "arts-entertainment", "automotive-services", "building-services",
  "construction", "education", "healthcare", "hospitality", "manufacturing",
  "public-administration", "retail-trade", "transportation", "utilities",
  "waste-environmental", "wholesale-trade",
  "business-support-services", "equipment-repair", "facilities-management",
  "information-telecom", "laundry-drycleaning", "mining", "professional-services",
  "real-estate", "staffing-employment", "warehouse",
  "personal-services", "security-services",
] as const

export const DOMAINS = [
  "sb-553", "cal-osha", "federal-osha", "hipaa",
  "subcontractor-risk", "municipal", "wvp-multistate",
] as const

export const KEYWORD_CLUSTERS = [
  "fine-panic", "privacy-trap", "post-incident", "vendor-roadblocks",
  "diy-failure", "annual-review", "permanent-standard", "industry-specific",
  "training", "recordkeeping", "hr-research", "legal-crossover",
  "geo-targeted", "competitor", "discovery",
] as const
