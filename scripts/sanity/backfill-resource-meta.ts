/**
 * Backfill missing metadata on Sanity `resource` documents:
 *   - categories (references to resourceCategory)
 *   - coverImage (reference to sanity.imageAsset)
 *   - regulatoryDomain (enum)
 *
 * Strategy:
 *   1. Rule-based inference from resourceType + industries + title keywords.
 *   2. Jaccard similarity between title keywords and imageAsset metadata for cover image.
 *   3. Claude Sonnet fallback for categories when rule-based is unconfident.
 *
 * Modes:
 *   --dry   (default) → write proposed patches to reports/sanity-resource-backfill-YYYY-MM-DD.json
 *   --apply           → POST a single-transaction mutate with setIfMissing patches
 *
 * Idempotent: never overwrites an existing value (uses setIfMissing).
 *
 * Run:
 *   npx tsx scripts/sanity/backfill-resource-meta.ts --dry
 *   npx tsx scripts/sanity/backfill-resource-meta.ts --apply
 */
import { config } from "dotenv"
import { writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import Anthropic from "@anthropic-ai/sdk"

config({ path: ".env.local" })

// ----- env -----
const PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_API_PROJECT_ID
const DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_API_DATASET
const WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN
const READ_TOKEN = process.env.SANITY_API_READ_TOKEN || WRITE_TOKEN
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!PROJECT_ID || !DATASET || !READ_TOKEN) {
  console.error("Missing SANITY env vars (PROJECT_ID / DATASET / READ token). Check .env.local")
  process.exit(1)
}

const API_VERSION = "v2024-01-01"
const QUERY_URL = `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/query/${DATASET}`
const MUTATE_URL = `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`

const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null

// ----- types -----
type SanityRef = { _type: "reference"; _ref: string; _key?: string }
type SlugField = { current: string }
type ImageField = { _type: "image"; asset: SanityRef }

interface ResourceDoc {
  _id: string
  title: string
  slug?: SlugField
  excerpt?: string
  resourceType?: string
  industries?: string[]
  regulatoryDomain?: string
  categories?: SanityRef[]
  coverImage?: ImageField
}

interface ResourceCategoryDoc {
  _id: string
  title: string
  slug: SlugField
}

interface ImageAssetDoc {
  _id: string
  originalFilename?: string
  title?: string
  altText?: string
}

interface ProposedPatch {
  docId: string
  title: string
  currentCategories: string[]
  proposedCategories: string[] | null
  categoriesConfidence: number
  categoriesSource: "existing" | "rule" | "claude" | "none"
  currentImage: string | null
  proposedImage: string | null
  imageConfidence: number
  imageSource: "existing" | "jaccard" | "none"
  currentDomain: string | null
  proposedDomain: string | null
  domainConfidence: number
  domainSource: "existing" | "rule" | "claude" | "none"
  flaggedForReview: boolean
}

// ----- groq helpers -----
async function groq<T>(query: string): Promise<T> {
  const url = `${QUERY_URL}?query=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${READ_TOKEN}` } })
  if (!res.ok) throw new Error(`GROQ fail ${res.status}: ${await res.text()}`)
  const json = (await res.json()) as { result: T }
  return json.result
}

// ----- keyword utils -----
const STOP = new Set([
  "the", "and", "for", "with", "from", "that", "this", "your", "you", "are", "how",
  "what", "why", "when", "into", "out", "about", "a", "an", "to", "of", "in", "on",
  "by", "or", "is", "it", "as", "be", "at", "&", "-", "–", "—", ":",
])

function keywords(s: string | undefined | null): Set<string> {
  if (!s) return new Set()
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 2 && !STOP.has(w)),
  )
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  const union = a.size + b.size - inter
  return union === 0 ? 0 : inter / union
}

// ----- domain inference rules -----
function inferDomain(res: ResourceDoc): { value: string | null; confidence: number } {
  const t = (res.title + " " + (res.excerpt || "")).toLowerCase()
  const inds = new Set(res.industries || [])

  // Strong signals — order matters: check specific topical markers before industry fallbacks.
  if (/\bsb[- ]?553\b|workplace violence|wvpp/i.test(t)) {
    return { value: "sb-553", confidence: 0.9 }
  }
  if (/\bhipaa\b|\bphi\b|protected health|baa\b|business associate/i.test(t)) {
    return { value: "hipaa", confidence: 0.9 }
  }
  if (/\biipp\b|injury.{0,10}illness prevention/i.test(t)) {
    return { value: "cal-osha", confidence: 0.85 }
  }
  if (/heat illness|heat stress/i.test(t)) {
    return { value: "cal-osha", confidence: 0.85 }
  }
  if (/osha 300|recordkeeping|incident log/i.test(t)) {
    return { value: "federal-osha", confidence: 0.8 }
  }
  if (/multi[- ]state|multistate|across states/i.test(t) && /violence|wvp/i.test(t)) {
    return { value: "wvp-multistate", confidence: 0.85 }
  }
  if (/subcontract|\bcoi\b|certificate of insurance|prequalif/i.test(t)) {
    return { value: "subcontractor-risk", confidence: 0.85 }
  }
  if (/\bcal[- ]?osha\b|\bcalifornia osha\b/i.test(t)) {
    return { value: "cal-osha", confidence: 0.9 }
  }
  // Healthcare industry w/o explicit HIPAA keywords — weaker signal
  if (inds.has("healthcare") && !/osha|sb[- ]?553|workplace violence|construction/i.test(t)) {
    return { value: "hipaa", confidence: 0.7 }
  }
  if (inds.has("construction") && /osha|fall|scaffold|trench|ladder|safety/i.test(t)) {
    return { value: "cal-osha", confidence: 0.7 }
  }
  if (/federal osha|\b29 cfr\b|osha 300|recordkeeping/i.test(t)) {
    return { value: "federal-osha", confidence: 0.85 }
  }
  if (/municipal|city ordinance|poster|local compliance/i.test(t)) {
    return { value: "municipal", confidence: 0.75 }
  }
  if (inds.has("construction")) {
    return { value: "cal-osha", confidence: 0.55 }
  }
  if (/osha|safety/i.test(t)) {
    return { value: "federal-osha", confidence: 0.5 }
  }
  return { value: null, confidence: 0 }
}

// ----- category inference rules -----
// Map (resourceType | industry | keyword) → likely category slug fragments.
function inferCategoriesByRule(
  res: ResourceDoc,
  cats: ResourceCategoryDoc[],
): { ids: string[]; confidence: number } {
  const titleKw = keywords(res.title + " " + (res.excerpt || ""))
  const type = (res.resourceType || "").toLowerCase()
  const inds = new Set(res.industries || [])

  // Score each category by keyword overlap with its title/slug, then boost by type/industry hints.
  const scored = cats.map((c) => {
    const cKw = keywords(c.title + " " + c.slug.current.replace(/-/g, " "))
    let score = jaccard(titleKw, cKw)

    const cSlug = c.slug.current.toLowerCase()
    const cTitle = c.title.toLowerCase()

    // Type affinity
    if (type === "template" && /template|form|checklist/.test(cTitle + cSlug)) score += 0.25
    if (type === "checklist" && /checklist|audit/.test(cTitle + cSlug)) score += 0.25
    if (type === "guide" && /guide|how-to|playbook/.test(cTitle + cSlug)) score += 0.2
    if (type === "webinar" && /webinar|training/.test(cTitle + cSlug)) score += 0.3
    if (type === "whitepaper" && /whitepaper|research|report/.test(cTitle + cSlug)) score += 0.3
    if (type === "playbook" && /playbook|guide/.test(cTitle + cSlug)) score += 0.25
    if (type === "briefing" && /briefing|update|alert/.test(cTitle + cSlug)) score += 0.25
    if (type === "assessment" && /assessment|audit|risk/.test(cTitle + cSlug)) score += 0.3

    // Industry affinity
    if (inds.has("healthcare") && /hipaa|healthcare|phi/.test(cTitle + cSlug)) score += 0.3
    if (inds.has("construction") && /construction|cal-osha|subcontract/.test(cTitle + cSlug)) score += 0.3
    if (/workplace violence|sb-553|wvpp/.test((res.title + " " + (res.excerpt || "")).toLowerCase())
      && /sb-553|workplace-violence|wvpp/.test(cSlug)) score += 0.4

    return { id: c._id, slug: cSlug, score }
  })

  scored.sort((a, b) => b.score - a.score)
  const top = scored[0]
  if (!top || top.score < 0.15) return { ids: [], confidence: 0 }

  const picks = [top.id]
  const second = scored[1]
  if (second && second.score >= 0.3 && second.score >= top.score * 0.75) picks.push(second.id)

  return { ids: picks, confidence: Math.min(top.score, 1) }
}

async function inferCategoriesByClaude(
  res: ResourceDoc,
  cats: ResourceCategoryDoc[],
): Promise<{ ids: string[]; confidence: number }> {
  if (!anthropic) return { ids: [], confidence: 0 }
  const catList = cats.map((c) => `- ${c.slug.current}: ${c.title}`).join("\n")
  const prompt = `You are tagging a compliance resource for a CMS. Pick 1-2 categories.

Available categories (slug: title):
${catList}

Resource:
- Type: ${res.resourceType || "unknown"}
- Industries: ${(res.industries || []).join(", ") || "none"}
- Title: ${res.title}
- Excerpt: ${res.excerpt || "(none)"}

Respond with ONLY a JSON object of the form:
{"slugs": ["slug-one", "slug-two"], "confidence": 0.0-1.0}
`
  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    })
    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return { ids: [], confidence: 0 }
    const parsed = JSON.parse(match[0]) as { slugs: string[]; confidence: number }
    const ids = parsed.slugs
      .map((s) => cats.find((c) => c.slug.current === s)?._id)
      .filter((x): x is string => typeof x === "string")
    return { ids, confidence: Number(parsed.confidence) || 0.5 }
  } catch (err) {
    console.warn(`Claude category inference failed for ${res._id}:`, (err as Error).message)
    return { ids: [], confidence: 0 }
  }
}

// ----- image inference -----
function inferCoverImage(
  res: ResourceDoc,
  assets: ImageAssetDoc[],
): { assetId: string | null; confidence: number } {
  const tKw = keywords(res.title + " " + (res.excerpt || "") + " " + (res.resourceType || ""))
  let best: { id: string; score: number } | null = null
  for (const a of assets) {
    const aKw = keywords(
      [a.originalFilename, a.title, a.altText].filter(Boolean).join(" "),
    )
    const s = jaccard(tKw, aKw)
    if (!best || s > best.score) best = { id: a._id, score: s }
  }
  if (!best || best.score < 0.3) return { assetId: null, confidence: best?.score || 0 }
  return { assetId: best.id, confidence: best.score }
}

// ----- main -----
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const apply = args.includes("--apply")
  const mode = apply ? "APPLY" : "DRY"

  console.log(`[backfill-resource-meta] mode=${mode}`)
  console.log(`[backfill-resource-meta] project=${PROJECT_ID} dataset=${DATASET}`)

  // Fetch all inputs
  const resources = await groq<ResourceDoc[]>(
    `*[_type == "resource"]{ _id, title, slug, excerpt, resourceType, industries, regulatoryDomain, categories, coverImage }`,
  )
  const categories = await groq<ResourceCategoryDoc[]>(
    `*[_type == "resourceCategory"]{ _id, title, slug }`,
  )
  const assets = await groq<ImageAssetDoc[]>(
    `*[_type == "sanity.imageAsset"]{ _id, originalFilename, title, altText }`,
  )

  console.log(
    `Loaded ${resources.length} resources, ${categories.length} categories, ${assets.length} image assets.`,
  )

  // Before coverage
  const before = {
    categories: resources.filter((r) => (r.categories?.length || 0) > 0).length,
    coverImage: resources.filter((r) => !!r.coverImage?.asset?._ref).length,
    regulatoryDomain: resources.filter((r) => !!r.regulatoryDomain).length,
  }

  const proposals: ProposedPatch[] = []
  const mutations: Array<{
    patch: {
      id: string
      setIfMissing: Record<string, unknown>
    }
  }> = []

  for (const r of resources) {
    const hasCats = (r.categories?.length || 0) > 0
    const hasImg = !!r.coverImage?.asset?._ref
    const hasDom = !!r.regulatoryDomain

    // Categories
    let proposedCats: string[] | null = null
    let catConf = 0
    let catSrc: ProposedPatch["categoriesSource"] = hasCats ? "existing" : "none"
    if (!hasCats) {
      const ruleCats = inferCategoriesByRule(r, categories)
      if (ruleCats.ids.length > 0 && ruleCats.confidence >= 0.25) {
        proposedCats = ruleCats.ids
        catConf = ruleCats.confidence
        catSrc = "rule"
      } else {
        const claude = await inferCategoriesByClaude(r, categories)
        if (claude.ids.length > 0) {
          proposedCats = claude.ids
          catConf = claude.confidence
          catSrc = "claude"
        }
      }
    }

    // Cover image
    let proposedImg: string | null = null
    let imgConf = 0
    let imgSrc: ProposedPatch["imageSource"] = hasImg ? "existing" : "none"
    if (!hasImg) {
      const imgInf = inferCoverImage(r, assets)
      if (imgInf.assetId) {
        proposedImg = imgInf.assetId
        imgConf = imgInf.confidence
        imgSrc = "jaccard"
      }
    }

    // Regulatory domain
    let proposedDom: string | null = null
    let domConf = 0
    let domSrc: ProposedPatch["domainSource"] = hasDom ? "existing" : "none"
    if (!hasDom) {
      const d = inferDomain(r)
      if (d.value) {
        proposedDom = d.value
        domConf = d.confidence
        domSrc = "rule"
      }
    }

    const minConfidence = Math.min(
      catSrc === "none" || catSrc === "existing" ? 1 : catConf,
      imgSrc === "none" || imgSrc === "existing" ? 1 : imgConf,
      domSrc === "none" || domSrc === "existing" ? 1 : domConf,
    )
    const flaggedForReview = minConfidence < 0.5 && (!hasCats || !hasImg || !hasDom)

    const currentCategoriesRefs = (r.categories || [])
      .map((c) => c._ref)
      .filter((x): x is string => !!x)

    const proposedCategorySlugs = proposedCats
      ? proposedCats
          .map((id) => categories.find((c) => c._id === id)?.slug.current)
          .filter((x): x is string => !!x)
      : null

    proposals.push({
      docId: r._id,
      title: r.title,
      currentCategories: currentCategoriesRefs,
      proposedCategories: proposedCategorySlugs,
      categoriesConfidence: Number(catConf.toFixed(3)),
      categoriesSource: catSrc,
      currentImage: r.coverImage?.asset?._ref || null,
      proposedImage: proposedImg,
      imageConfidence: Number(imgConf.toFixed(3)),
      imageSource: imgSrc,
      currentDomain: r.regulatoryDomain || null,
      proposedDomain: proposedDom,
      domainConfidence: Number(domConf.toFixed(3)),
      domainSource: domSrc,
      flaggedForReview,
    })

    // Build patch (apply only non-flagged or >=0.5 confidence changes)
    const setIfMissing: Record<string, unknown> = {}
    if (!hasCats && proposedCats && proposedCats.length > 0 && catConf >= 0.25) {
      setIfMissing.categories = proposedCats.map((id, i) => ({
        _type: "reference",
        _ref: id,
        _key: `cat_${i}_${id.slice(-6)}`,
      }))
    }
    if (!hasImg && proposedImg && imgConf >= 0.3) {
      setIfMissing.coverImage = {
        _type: "image",
        asset: { _type: "reference", _ref: proposedImg },
      }
    }
    if (!hasDom && proposedDom && domConf >= 0.5) {
      setIfMissing.regulatoryDomain = proposedDom
    }

    if (Object.keys(setIfMissing).length > 0) {
      mutations.push({ patch: { id: r._id, setIfMissing } })
    }
  }

  // Projected after-coverage
  const projected = {
    categories: before.categories + mutations.filter((m) => "categories" in m.patch.setIfMissing).length,
    coverImage: before.coverImage + mutations.filter((m) => "coverImage" in m.patch.setIfMissing).length,
    regulatoryDomain:
      before.regulatoryDomain + mutations.filter((m) => "regulatoryDomain" in m.patch.setIfMissing).length,
  }

  const total = resources.length
  const pct = (n: number): string => ((n / total) * 100).toFixed(1) + "%"
  const flaggedCount = proposals.filter((p) => p.flaggedForReview).length

  console.log("\n=== Coverage ===")
  console.log(`                      before         projected`)
  console.log(`categories:           ${before.categories}/${total} (${pct(before.categories)})  →  ${projected.categories}/${total} (${pct(projected.categories)})`)
  console.log(`coverImage:           ${before.coverImage}/${total} (${pct(before.coverImage)})  →  ${projected.coverImage}/${total} (${pct(projected.coverImage)})`)
  console.log(`regulatoryDomain:     ${before.regulatoryDomain}/${total} (${pct(before.regulatoryDomain)})  →  ${projected.regulatoryDomain}/${total} (${pct(projected.regulatoryDomain)})`)
  console.log(`\nPatches queued: ${mutations.length}`)
  console.log(`Flagged for human review (low confidence): ${flaggedCount}`)

  // Report
  const date = new Date().toISOString().slice(0, 10)
  const reportDir = join(process.cwd(), "reports")
  mkdirSync(reportDir, { recursive: true })
  const reportPath = join(reportDir, `sanity-resource-backfill-${date}.json`)
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        mode,
        generatedAt: new Date().toISOString(),
        project: PROJECT_ID,
        dataset: DATASET,
        totals: {
          resources: total,
          categories: categories.length,
          imageAssets: assets.length,
        },
        coverage: { before, projected },
        mutationsQueued: mutations.length,
        flaggedForReview: flaggedCount,
        proposals,
      },
      null,
      2,
    ),
  )
  console.log(`\nReport written: ${reportPath}`)

  if (!apply) {
    console.log("\n[DRY] No changes written. Re-run with --apply to patch Sanity.")
    return
  }

  // Apply
  if (!WRITE_TOKEN) {
    console.error("SANITY_API_WRITE_TOKEN missing — cannot apply.")
    process.exit(1)
  }
  if (mutations.length === 0) {
    console.log("Nothing to apply.")
    return
  }
  const res = await fetch(MUTATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WRITE_TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  })
  if (!res.ok) {
    console.error(`Mutate failed ${res.status}: ${await res.text()}`)
    process.exit(1)
  }
  const json = (await res.json()) as { transactionId?: string }
  console.log(`\nApplied ${mutations.length} patches. Transaction: ${json.transactionId}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
