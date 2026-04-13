/**
 * Import bridge: cli-content output → Sanity CMS
 *
 * Reads produced content from cli-content's output directory,
 * maps taxonomy metadata from content-manifest.json,
 * converts markdown to Portable Text, and pushes to Sanity.
 *
 * Usage:
 *   npx tsx scripts/import-from-content.ts --dir ../cli-content/projects/protekon/output
 *   npx tsx scripts/import-from-content.ts --dir ./content --type blogPost
 *   npx tsx scripts/import-from-content.ts --dir ./content --ids 108,109,110
 */
import { pushToSanity, slug, catRef, textToBlocks, rkey } from "./lib/sanity-import.js"
import { readFileSync, readdirSync, existsSync } from "fs"
import { join, basename } from "path"

// ─── CLI Args ───

const args = process.argv.slice(2)
const dirIdx = args.indexOf("--dir")
const typeIdx = args.indexOf("--type")
const idsIdx = args.indexOf("--ids")

const contentDir = dirIdx !== -1 ? args[dirIdx + 1] : "./content"
const filterType = typeIdx !== -1 ? args[typeIdx + 1] : null
const filterIds = idsIdx !== -1 ? args[idsIdx + 1].split(",").map(Number) : null

if (!existsSync(contentDir)) {
  console.error(`Content directory not found: ${contentDir}`)
  console.error("Usage: npx tsx scripts/import-from-content.ts --dir <path-to-content>")
  process.exit(1)
}

// ─── Load Manifest ───

const scriptDir = new URL(".", import.meta.url).pathname
const manifestPath = join(scriptDir, "content-manifest.json")
const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"))

// Build ID → metadata lookup from manifest
type ContentMeta = {
  tier: string
  sanityType: string
  resourceType?: string
  faqCategory?: string
  helpCategory?: string
  regulatoryDomain?: string
}

function buildIdLookup(): Map<number, ContentMeta> {
  const lookup = new Map<number, ContentMeta>()

  // Blog tiers
  const blogTiers: Record<string, string> = {
    pillar: "pillar",
    domain_deep_dives: "cluster",
    vertical_compliance_guides: "vertical",
    vertical_enforcement_briefings: "data-briefing",
    extras_deep_dives: "how-to",
    state_guides: "state-guide",
    comparisons: "comparison",
    keyword_clusters: "cluster",
  }

  for (const [tierKey, contentTier] of Object.entries(blogTiers)) {
    const tier = manifest.tiers[tierKey]
    if (tier) {
      for (const id of tier.ids) {
        lookup.set(id, { tier: tierKey, sanityType: "blogPost" })
      }
    }
  }

  // Resources
  const resourceTiers = ["resources_guides", "resources_checklists", "resources_templates",
    "resources_whitepapers", "resources_playbooks", "resources_briefings"]
  for (const tierKey of resourceTiers) {
    const tier = manifest.tiers[tierKey]
    if (tier) {
      for (const id of tier.ids) {
        lookup.set(id, { tier: tierKey, sanityType: "resource", resourceType: tier.resourceType })
      }
    }
  }

  // FAQs
  if (manifest.faqs) {
    for (const [cat, data] of Object.entries(manifest.faqs) as [string, any][]) {
      for (const id of data.ids) {
        lookup.set(id, { tier: "faq", sanityType: "faq", faqCategory: cat.replace("_", "-") })
      }
    }
  }

  // Regulatory Updates
  if (manifest.regulatory_updates) {
    for (const id of manifest.regulatory_updates.ids) {
      lookup.set(id, { tier: "regulatory_update", sanityType: "regulatoryUpdate" })
    }
  }

  // Help Articles
  if (manifest.help_articles) {
    for (const [cat, data] of Object.entries(manifest.help_articles) as [string, any][]) {
      for (const id of data.ids) {
        lookup.set(id, { tier: "help_article", sanityType: "helpArticle", helpCategory: cat.replace("_", "-") })
      }
    }
  }

  return lookup
}

// ─── Category Mapping ───

const DOMAIN_TO_BLOGCAT: Record<string, string> = {
  "sb-553": "blogcat-sb553",
  "cal-osha": "blogcat-calosha",
  "federal-osha": "blogcat-fedosha",
  "hipaa": "blogcat-hipaa",
  "subcontractor-risk": "blogcat-subcontractor",
  "municipal": "blogcat-municipal",
  "wvp-multistate": "blogcat-wvp",
}

const TIER_TO_BLOGCAT: Record<string, string[]> = {
  pillar: [],
  cluster: [],
  "data-briefing": ["blogcat-penalties"],
  vertical: ["blogcat-industry"],
  "how-to": [],
  "state-guide": ["blogcat-stateguides"],
  comparison: [],
}

const HELPCAT_MAP: Record<string, string> = {
  "getting-started": "helpcat-getting-started",
  "compliance-plans": "helpcat-compliance-plans",
  "training": "helpcat-training",
  "incidents": "helpcat-incidents",
  "documents": "helpcat-documents",
}

// ─── Content File Parser ───

interface ContentFile {
  id: number
  title: string
  body: string
  excerpt?: string
  regulatoryDomain?: string
  industries?: string[]
  keywordCluster?: string
  contentTier?: string
  severity?: string
  jurisdiction?: string
  effectiveDate?: string
  standard?: string
  order?: number
}

function parseContentFile(filePath: string): ContentFile | null {
  const raw = readFileSync(filePath, "utf-8")

  // Parse frontmatter if present
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

  let frontmatter: Record<string, any> = {}
  let body: string

  if (fmMatch) {
    const fmLines = fmMatch[1].split("\n")
    for (const line of fmLines) {
      const [key, ...valueParts] = line.split(":")
      if (key && valueParts.length) {
        const value = valueParts.join(":").trim()
        // Handle arrays
        if (value.startsWith("[")) {
          try { frontmatter[key.trim()] = JSON.parse(value) } catch { frontmatter[key.trim()] = value }
        } else {
          frontmatter[key.trim()] = value
        }
      }
    }
    body = fmMatch[2].trim()
  } else {
    body = raw.trim()
  }

  // Extract title from first H1 if not in frontmatter
  const title = frontmatter.title || body.match(/^# (.+)$/m)?.[1] || basename(filePath, ".md")

  // Extract excerpt from first paragraph after title
  const bodyWithoutTitle = body.replace(/^# .+\n+/, "")
  const firstParagraph = bodyWithoutTitle.split("\n\n")[0]
  const excerpt = frontmatter.excerpt || (firstParagraph.length < 300 ? firstParagraph : firstParagraph.slice(0, 250) + "...")

  return {
    id: frontmatter.id ? Number(frontmatter.id) : 0,
    title,
    body: bodyWithoutTitle,
    excerpt,
    regulatoryDomain: frontmatter.regulatoryDomain,
    industries: frontmatter.industries,
    keywordCluster: frontmatter.keywordCluster,
    contentTier: frontmatter.contentTier,
    severity: frontmatter.severity,
    jurisdiction: frontmatter.jurisdiction,
    effectiveDate: frontmatter.effectiveDate,
    standard: frontmatter.standard,
    order: frontmatter.order ? Number(frontmatter.order) : undefined,
  }
}

// ─── Document Builders ───

function buildBlogPost(content: ContentFile, meta: ContentMeta) {
  const categories: any[] = []

  // Add domain-based category
  if (content.regulatoryDomain && DOMAIN_TO_BLOGCAT[content.regulatoryDomain]) {
    categories.push(catRef(DOMAIN_TO_BLOGCAT[content.regulatoryDomain]))
  }

  // Add tier-based categories
  const tierCats = TIER_TO_BLOGCAT[content.contentTier || ""] || []
  for (const cat of tierCats) {
    categories.push(catRef(cat))
  }

  const slugValue = content.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96)

  return {
    _id: `blog-${content.id}`,
    _type: "blogPost",
    title: content.title,
    slug: slug(slugValue),
    author: { _type: "reference", _ref: meta.tier?.includes("enforcement") ? "author-enforcement-desk" : "author-compliance-team" },
    excerpt: content.excerpt,
    categories: categories.length > 0 ? categories : undefined,
    regulatoryDomain: content.regulatoryDomain,
    industries: content.industries,
    keywordCluster: content.keywordCluster,
    contentTier: content.contentTier,
    publishedAt: new Date().toISOString(),
    body: textToBlocks(content.body),
  }
}

function buildResource(content: ContentFile, meta: ContentMeta) {
  const slugValue = content.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96)

  return {
    _id: `resource-${content.id}`,
    _type: "resource",
    title: content.title,
    slug: slug(slugValue),
    resourceType: meta.resourceType || "article",
    excerpt: content.excerpt,
    regulatoryDomain: content.regulatoryDomain,
    industries: content.industries,
    publishedAt: new Date().toISOString(),
    body: textToBlocks(content.body),
  }
}

function buildFaq(content: ContentFile, meta: ContentMeta) {
  // Extract question from title (remove "FAQ: " prefix)
  const question = content.title.replace(/^FAQ:\s*/i, "")

  return {
    _id: `faq-${content.id}`,
    _type: "faq",
    question,
    answer: textToBlocks(content.body),
    category: meta.faqCategory || "general",
    order: content.order || 0,
  }
}

function buildRegulatoryUpdate(content: ContentFile, _meta: ContentMeta) {
  const slugValue = content.title
    .toLowerCase()
    .replace(/^regulatory update:\s*/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96)

  return {
    _id: `regupdate-${content.id}`,
    _type: "regulatoryUpdate",
    title: content.title.replace(/^Regulatory Update:\s*/i, ""),
    slug: slug(slugValue),
    body: textToBlocks(content.body),
    severity: content.severity || "medium",
    jurisdiction: content.jurisdiction,
    standard: content.standard,
    effectiveDate: content.effectiveDate,
    industries: content.industries,
  }
}

function buildHelpArticle(content: ContentFile, meta: ContentMeta) {
  const slugValue = content.title
    .toLowerCase()
    .replace(/^help:\s*/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96)

  const categoryRef = meta.helpCategory && HELPCAT_MAP[meta.helpCategory]
    ? { _type: "reference" as const, _ref: HELPCAT_MAP[meta.helpCategory] }
    : undefined

  return {
    _id: `help-${content.id}`,
    _type: "helpArticle",
    title: content.title.replace(/^Help:\s*/i, ""),
    slug: slug(slugValue),
    body: textToBlocks(content.body),
    category: categoryRef,
    order: content.order || 0,
  }
}

// ─── Main ───

async function importContent() {
  const lookup = buildIdLookup()

  // Scan content directory for markdown files
  const files = readdirSync(contentDir, { recursive: true })
    .filter((f): f is string => typeof f === "string" && f.endsWith(".md"))
    .map((f) => join(contentDir, f))

  console.log(`Found ${files.length} markdown files in ${contentDir}`)

  const documents: any[] = []

  for (const filePath of files) {
    const content = parseContentFile(filePath)
    if (!content) {
      console.warn(`  Skipped (parse error): ${filePath}`)
      continue
    }

    // Find metadata from manifest
    const meta = lookup.get(content.id)
    if (!meta && filterIds) {
      console.warn(`  Skipped (not in manifest): ${filePath} (id: ${content.id})`)
      continue
    }

    // Apply filters
    if (filterIds && !filterIds.includes(content.id)) continue
    if (filterType && meta?.sanityType !== filterType) continue

    const effectiveMeta = meta || { tier: "unknown", sanityType: "blogPost" }

    // Build Sanity document based on type
    let doc: any
    switch (effectiveMeta.sanityType) {
      case "blogPost":
        doc = buildBlogPost(content, effectiveMeta)
        break
      case "resource":
        doc = buildResource(content, effectiveMeta)
        break
      case "faq":
        doc = buildFaq(content, effectiveMeta)
        break
      case "regulatoryUpdate":
        doc = buildRegulatoryUpdate(content, effectiveMeta)
        break
      case "helpArticle":
        doc = buildHelpArticle(content, effectiveMeta)
        break
      default:
        console.warn(`  Unknown type: ${effectiveMeta.sanityType} for ${filePath}`)
        continue
    }

    documents.push(doc)
  }

  if (documents.length === 0) {
    console.log("No documents to import.")
    return
  }

  // Group by type for reporting
  const byType = documents.reduce((acc, doc) => {
    acc[doc._type] = (acc[doc._type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log("\nDocuments to import:")
  for (const [type, count] of Object.entries(byType)) {
    console.log(`  ${type}: ${count}`)
  }
  console.log(`  Total: ${documents.length}\n`)

  await pushToSanity(documents, "Content Import")

  console.log("\nImport complete.")
  console.log("Verify at: https://protekon.sanity.studio")
}

importContent().catch((err) => {
  console.error("Fatal:", err)
  process.exit(1)
})
