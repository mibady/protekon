/**
 * Seed osha_knowledge_base from content/blog/*.md
 *
 * Usage: npx tsx scripts/seed-knowledge-base.ts [--dry] [--filter=help|faq|guide]
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *
 * Idempotent: upserts by (title). Safe to re-run.
 *
 * Mapping:
 *   frontmatter.title           -> title
 *   frontmatter.regulatoryDomain | helpCategory | faqCategory -> topic
 *   type (help|faq|pillar|etc.) -> category
 *   frontmatter.industries      -> applies_to_verticals
 *   body (below ---)            -> content
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync, readdirSync } from "fs"
import { resolve, join } from "path"

// Load .env.local
const envPath = resolve(process.cwd(), ".env.local")
const envContent = readFileSync(envPath, "utf-8")
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=["']?(.+?)["']?$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const DRY = process.argv.includes("--dry")
const filterArg = process.argv.find((a) => a.startsWith("--filter="))?.split("=")[1]
const phaseArg = (process.argv.find((a) => a.startsWith("--phase="))?.split("=")[1] ?? "2a") as
  | "2a"
  | "2b"
  | "all"

type Frontmatter = Record<string, unknown>

function parseFrontmatter(raw: string): { fm: Frontmatter; body: string } {
  // Normalize CRLF (Windows line endings) → LF
  raw = raw.replace(/\r\n/g, "\n")
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { fm: {}, body: raw }
  const fm: Frontmatter = {}
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([a-zA-Z_][\w]*):\s*(.+)$/)
    if (!kv) continue
    const key = kv[1]
    let value: unknown = kv[2].trim()
    if (typeof value === "string") {
      // Strip wrapping quotes
      if (/^".*"$/.test(value) || /^'.*'$/.test(value)) value = value.slice(1, -1)
      // Array literal
      if (typeof value === "string" && /^\[.*\]$/.test(value)) {
        try {
          value = JSON.parse((value as string).replace(/'/g, '"'))
        } catch {
          // leave as string
        }
      }
    }
    fm[key] = value
  }
  return { fm, body: match[2].trim() }
}

function deriveCategory(fm: Frontmatter, filename: string): string {
  if (fm.type === "help" || fm.helpCategory) return "help"
  if (fm.faqCategory || /^\d+-faq-/.test(filename)) return "faq"
  if (/^\d+-regupdate-/.test(filename)) return "regulatory-update"
  if (fm.contentTier === "pillar") return "guide"
  if (/-compliance-guide\.md$/.test(filename)) return "industry-guide"
  if (/-enforcement-intelligence\.md$/.test(filename)) return "enforcement-intelligence"
  if (/-playbook\.md$/.test(filename)) return "playbook"
  if (/-checklist\.md$/.test(filename)) return "checklist"
  if (/-template\.md$/.test(filename)) return "template"
  return "guide"
}

function deriveTopic(fm: Frontmatter, filename: string): string {
  if (typeof fm.regulatoryDomain === "string") return fm.regulatoryDomain
  if (typeof fm.helpCategory === "string") return fm.helpCategory
  if (typeof fm.faqCategory === "string") return fm.faqCategory
  // Fall back to filename slug minus numeric prefix
  return filename.replace(/^\d+-/, "").replace(/\.md$/, "").slice(0, 60)
}

function deriveVerticals(fm: Frontmatter): string[] {
  const raw = fm.industries
  if (Array.isArray(raw)) return raw.map((v) => String(v).toLowerCase())
  if (typeof raw === "string") return [raw.toLowerCase()]
  return ["all"]
}

function derivePriority(category: string): string {
  if (category === "guide" || category === "regulatory-update") return "high"
  if (category === "faq") return "low"
  return "medium"
}

// Phase 2a scope: platform-wide regulatory + help + faq
function inPhase2a(filename: string): boolean {
  // Help articles (311-325)
  if (/^3(1[1-9]|2[0-5])-/.test(filename)) return true
  // FAQs (259-298)
  if (/^(2[5-9]\d|29[0-8])-faq-/.test(filename)) return true
  // Platform-wide regulatory pillars (108-117)
  if (/^1(0[89]|1[0-7])-/.test(filename)) return true
  // Core reg guides (194 CA, 211 incident checklist, 215-217 standards, 270 retention)
  if (/^(194|211|215|216|217|270)-/.test(filename)) return true
  // Regulatory updates (299-310)
  if (/^(299|30\d|310)-regupdate-/.test(filename)) return true
  return false
}

// Phase 2b scope: 27 vertical industry pairs (compliance + enforcement intelligence, files 123-176)
function inPhase2b(filename: string): boolean {
  return /^1([2-6]\d|7[0-6])-.*(compliance-guide|enforcement-intelligence)\.md$/.test(filename)
}

function inScope(filename: string): boolean {
  if (phaseArg === "2a") return inPhase2a(filename)
  if (phaseArg === "2b") return inPhase2b(filename)
  return inPhase2a(filename) || inPhase2b(filename)
}

async function main() {
  const blogDir = resolve(process.cwd(), "content/blog")
  const files = readdirSync(blogDir).filter((f) => f.endsWith(".md"))

  const records: Array<{
    title: string
    topic: string
    category: string
    content: string
    applies_to_verticals: string[]
    priority: string
    source_publication: string
  }> = []

  for (const file of files) {
    if (!inScope(file)) continue

    const raw = readFileSync(join(blogDir, file), "utf-8")
    const { fm, body } = parseFrontmatter(raw)
    if (!fm.title || !body) continue

    const category = deriveCategory(fm, file)
    if (filterArg && category !== filterArg) continue

    records.push({
      title: String(fm.title),
      topic: deriveTopic(fm, file),
      category,
      content: body,
      applies_to_verticals: deriveVerticals(fm),
      priority: derivePriority(category),
      source_publication: `content/blog/${file}`,
    })
  }

  console.log(`Prepared ${records.length} articles`)
  const byCategory = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1
    return acc
  }, {})
  console.log("By category:", byCategory)

  if (DRY) {
    console.log("Dry run — first 3 records:")
    console.log(JSON.stringify(records.slice(0, 3), null, 2))
    return
  }

  // Upsert in batches of 50
  let inserted = 0
  for (let i = 0; i < records.length; i += 50) {
    const batch = records.slice(i, i + 50)
    const { error } = await supabase
      .from("osha_knowledge_base")
      .upsert(batch, { onConflict: "title" })
    if (error) {
      console.error(`Batch ${i / 50 + 1} failed:`, error.message)
      process.exit(1)
    }
    inserted += batch.length
    console.log(`Upserted batch ${i / 50 + 1}: ${inserted}/${records.length}`)
  }

  const { count } = await supabase
    .from("osha_knowledge_base")
    .select("*", { count: "exact", head: true })
  console.log(`\n✓ Seed complete. osha_knowledge_base now has ${count} rows.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
