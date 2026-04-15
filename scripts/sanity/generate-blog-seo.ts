/**
 * Generate SEO metadata (metaTitle + metaDescription) for Sanity blogPost docs
 * that are missing one or both fields. Uses Claude Sonnet 4.6.
 *
 * Modes:
 *   --dry   (default) writes proposed patches to reports/sanity-blog-seo-<date>.json
 *   --apply               applies a Sanity transaction with the patches
 *   --force               ignore disk cache and regenerate
 *
 * Usage:
 *   npx tsx scripts/sanity/generate-blog-seo.ts          # dry run
 *   npx tsx scripts/sanity/generate-blog-seo.ts --apply  # write to Sanity
 *
 * Env required:
 *   ANTHROPIC_API_KEY
 *   SANITY_API_PROJECT_ID, SANITY_API_DATASET, SANITY_API_WRITE_TOKEN
 */

import Anthropic from "@anthropic-ai/sdk"
import { createClient, type SanityClient } from "next-sanity"
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "fs"
import { resolve, join } from "path"
import { buildSeoPrompt } from "./prompts/blog-seo"

// -----------------------------------------------------------------------------
// Env loading (.env.local)
// -----------------------------------------------------------------------------
const envPath = resolve(process.cwd(), ".env.local")
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8")
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=["']?(.+?)["']?$/)
    if (match) {
      const key = match[1].trim()
      if (!process.env[key]) process.env[key] = match[2].trim()
    }
  }
}

// -----------------------------------------------------------------------------
// Flags
// -----------------------------------------------------------------------------
const args = process.argv.slice(2)
const APPLY = args.includes("--apply")
const FORCE = args.includes("--force")
const DRY = !APPLY

// -----------------------------------------------------------------------------
// Paths
// -----------------------------------------------------------------------------
const CACHE_DIR = resolve(process.cwd(), "scripts/sanity/.cache-seo")
const REPORTS_DIR = resolve(process.cwd(), "reports")
if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true })
if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true })

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
interface BlogPost {
  _id: string
  title: string
  slug?: { current?: string }
  excerpt?: string | null
  regulatoryDomain?: string | null
  keywordCluster?: string | null
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
    [k: string]: unknown
  } | null
}

interface SeoResult {
  docId: string
  title: string
  slug?: string
  metaTitle: string
  metaDescription: string
  tokensUsed: { input: number; output: number }
  fromCache: boolean
}

interface CachedEntry {
  docId: string
  title: string
  slug?: string
  metaTitle: string
  metaDescription: string
  tokensUsed: { input: number; output: number }
  generatedAt: string
}

// -----------------------------------------------------------------------------
// Tiny concurrency limiter (no external dep)
// -----------------------------------------------------------------------------
function createLimiter(max: number) {
  let active = 0
  const queue: (() => void)[] = []
  const next = () => {
    if (active >= max) return
    const task = queue.shift()
    if (!task) return
    active++
    task()
  }
  return async function limit<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolvePromise, rejectPromise) => {
      const run = () => {
        fn()
          .then((v) => {
            active--
            resolvePromise(v)
            next()
          })
          .catch((e) => {
            active--
            rejectPromise(e)
            next()
          })
      }
      queue.push(run)
      next()
    })
  }
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------
function validate(metaTitle: string, metaDescription: string): string | null {
  if (metaTitle.length === 0) return "metaTitle is empty"
  if (metaTitle.length > 60) return `metaTitle is ${metaTitle.length} chars (max 60). Shorten it.`
  if (metaDescription.length < 150)
    return `metaDescription is ${metaDescription.length} chars (must be 150-160). Lengthen it to fall in 150-160 inclusive.`
  if (metaDescription.length > 160)
    return `metaDescription is ${metaDescription.length} chars (must be 150-160). Shorten it to fall in 150-160 inclusive.`
  return null
}

function parseJsonResponse(raw: string): { metaTitle: string; metaDescription: string } {
  // Strip possible fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim()
  const firstBrace = cleaned.indexOf("{")
  const lastBrace = cleaned.lastIndexOf("}")
  const jsonStr =
    firstBrace >= 0 && lastBrace > firstBrace ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned
  const obj = JSON.parse(jsonStr)
  if (typeof obj.metaTitle !== "string" || typeof obj.metaDescription !== "string") {
    throw new Error("Response missing metaTitle or metaDescription string fields")
  }
  return { metaTitle: obj.metaTitle.trim(), metaDescription: obj.metaDescription.trim() }
}

// -----------------------------------------------------------------------------
// Anthropic call with retry on length violation
// -----------------------------------------------------------------------------
async function generateSeoForPost(
  anthropic: Anthropic,
  post: BlogPost,
): Promise<{ metaTitle: string; metaDescription: string; tokens: { input: number; output: number } }> {
  const maxAttempts = 3 // original + 2 retries
  let retryFeedback: string | null = null
  let totalInput = 0
  let totalOutput = 0

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { system, user } = buildSeoPrompt({
      title: post.title,
      excerpt: post.excerpt ?? null,
      regulatoryDomain: post.regulatoryDomain ?? null,
      keywordCluster: post.keywordCluster ?? null,
      retryFeedback,
    })

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 512,
      system,
      messages: [{ role: "user", content: user }],
    })

    totalInput += response.usage?.input_tokens ?? 0
    totalOutput += response.usage?.output_tokens ?? 0

    const textBlock = response.content.find((b) => b.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      throw new Error(`No text block in response for ${post._id}`)
    }

    let parsed: { metaTitle: string; metaDescription: string }
    try {
      parsed = parseJsonResponse(textBlock.text)
    } catch (err) {
      retryFeedback = `Your previous response was not valid JSON. Error: ${(err as Error).message}. Return a raw JSON object with keys metaTitle and metaDescription.`
      continue
    }

    const violation = validate(parsed.metaTitle, parsed.metaDescription)
    if (!violation) {
      return {
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
        tokens: { input: totalInput, output: totalOutput },
      }
    }

    retryFeedback =
      `Previous metaTitle was ${parsed.metaTitle.length} chars: "${parsed.metaTitle}". ` +
      `Previous metaDescription was ${parsed.metaDescription.length} chars: "${parsed.metaDescription}". ` +
      `Constraint violated: ${violation}`
  }

  throw new Error(`Failed to generate valid SEO for ${post._id} after ${maxAttempts} attempts`)
}

// -----------------------------------------------------------------------------
// Cache helpers
// -----------------------------------------------------------------------------
function cachePath(docId: string): string {
  const safe = docId.replace(/[^a-zA-Z0-9._-]/g, "_")
  return join(CACHE_DIR, `${safe}.json`)
}

function readCache(docId: string): CachedEntry | null {
  const p = cachePath(docId)
  if (!existsSync(p)) return null
  try {
    return JSON.parse(readFileSync(p, "utf-8")) as CachedEntry
  } catch {
    return null
  }
}

function writeCache(entry: CachedEntry): void {
  writeFileSync(cachePath(entry.docId), JSON.stringify(entry, null, 2), "utf-8")
}

// -----------------------------------------------------------------------------
// Sanity client (write-enabled)
// -----------------------------------------------------------------------------
function makeSanityClient(): SanityClient {
  const projectId =
    process.env.SANITY_API_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.SANITY_API_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET
  if (!projectId || !dataset) {
    throw new Error("Missing SANITY_API_PROJECT_ID / SANITY_API_DATASET")
  }
  const token = APPLY ? process.env.SANITY_API_WRITE_TOKEN : process.env.SANITY_API_READ_TOKEN
  if (APPLY && !token) {
    throw new Error("--apply requires SANITY_API_WRITE_TOKEN")
  }
  return createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    useCdn: false,
    token,
  })
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------
async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not set")
  }

  const mode = APPLY ? "APPLY" : "DRY"
  console.log(`[generate-blog-seo] mode=${mode} force=${FORCE}`)

  const sanity = makeSanityClient()
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  console.log("[generate-blog-seo] Fetching blogPost documents...")
  const posts = await sanity.fetch<BlogPost[]>(
    `*[_type == "blogPost"]{
      _id,
      title,
      slug,
      excerpt,
      regulatoryDomain,
      keywordCluster,
      seo
    }`,
  )
  console.log(`[generate-blog-seo] Fetched ${posts.length} posts`)

  // Idempotency: skip posts that already have both fields
  const needWork = posts.filter((p) => {
    const hasTitle = !!p.seo?.metaTitle && p.seo.metaTitle.trim().length > 0
    const hasDesc = !!p.seo?.metaDescription && p.seo.metaDescription.trim().length > 0
    return !(hasTitle && hasDesc)
  })
  console.log(
    `[generate-blog-seo] ${needWork.length} posts missing metaTitle/metaDescription (skipping ${
      posts.length - needWork.length
    } already complete)`,
  )

  const limit = createLimiter(5)
  const results: SeoResult[] = []
  const errors: { docId: string; title: string; error: string }[] = []

  let done = 0
  await Promise.all(
    needWork.map((post) =>
      limit(async () => {
        const idx = ++done
        const label = `[${idx}/${needWork.length}]`

        // Check disk cache
        if (!FORCE) {
          const cached = readCache(post._id)
          if (cached) {
            console.log(`${label} CACHE  ${post._id} — "${post.title.slice(0, 60)}"`)
            results.push({
              docId: cached.docId,
              title: cached.title,
              slug: cached.slug,
              metaTitle: cached.metaTitle,
              metaDescription: cached.metaDescription,
              tokensUsed: cached.tokensUsed,
              fromCache: true,
            })
            return
          }
        }

        try {
          console.log(`${label} GEN    ${post._id} — "${post.title.slice(0, 60)}"`)
          const { metaTitle, metaDescription, tokens } = await generateSeoForPost(anthropic, post)
          const entry: CachedEntry = {
            docId: post._id,
            title: post.title,
            slug: post.slug?.current,
            metaTitle,
            metaDescription,
            tokensUsed: tokens,
            generatedAt: new Date().toISOString(),
          }
          writeCache(entry)
          results.push({ ...entry, fromCache: false })
          console.log(
            `${label} OK     title=${metaTitle.length}ch desc=${metaDescription.length}ch tokens(in/out)=${tokens.input}/${tokens.output}`,
          )
        } catch (err) {
          const msg = (err as Error).message
          console.error(`${label} FAIL   ${post._id}: ${msg}`)
          errors.push({ docId: post._id, title: post.title, error: msg })
        }
      }),
    ),
  )

  // Token summary
  const totalIn = results.reduce((s, r) => s + r.tokensUsed.input, 0)
  const totalOut = results.reduce((s, r) => s + r.tokensUsed.output, 0)
  // Sonnet 4.x ballpark pricing: $3/M input, $15/M output
  const estCost = (totalIn / 1_000_000) * 3 + (totalOut / 1_000_000) * 15

  console.log(`\n[generate-blog-seo] === Summary ===`)
  console.log(`  Posts processed  : ${results.length}`)
  console.log(`  From cache       : ${results.filter((r) => r.fromCache).length}`)
  console.log(`  Newly generated  : ${results.filter((r) => !r.fromCache).length}`)
  console.log(`  Errors           : ${errors.length}`)
  console.log(`  Tokens in        : ${totalIn}`)
  console.log(`  Tokens out       : ${totalOut}`)
  console.log(`  Est. cost (USD)  : $${estCost.toFixed(4)}`)

  // Write dry report always
  const dateStr = new Date().toISOString().slice(0, 10)
  const reportPath = join(REPORTS_DIR, `sanity-blog-seo-${dateStr}.json`)
  const report = {
    generatedAt: new Date().toISOString(),
    mode,
    totalPosts: posts.length,
    postsNeedingWork: needWork.length,
    successes: results.length,
    errors: errors.length,
    tokens: { input: totalIn, output: totalOut, estimatedCostUsd: Number(estCost.toFixed(4)) },
    patches: results.map((r) => ({
      docId: r.docId,
      title: r.title,
      slug: r.slug,
      metaTitle: r.metaTitle,
      metaDescription: r.metaDescription,
      tokensUsed: r.tokensUsed,
      fromCache: r.fromCache,
    })),
    errorDetails: errors,
  }
  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8")
  console.log(`\n[generate-blog-seo] Report written: ${reportPath}`)

  // Apply to Sanity
  if (APPLY) {
    if (results.length === 0) {
      console.log("[generate-blog-seo] No patches to apply.")
      return
    }
    console.log(`[generate-blog-seo] Applying ${results.length} patches to Sanity...`)
    let tx = sanity.transaction()
    for (const r of results) {
      // Preserve other seo.* subfields by using setIfMissing then set at leaf paths
      tx = tx.patch(r.docId, (patch) =>
        patch
          .setIfMissing({ seo: {} })
          .set({
            "seo.metaTitle": r.metaTitle,
            "seo.metaDescription": r.metaDescription,
          }),
      )
    }
    const result = await tx.commit()
    console.log(`[generate-blog-seo] Transaction committed. transactionId=${result.transactionId}`)
  } else {
    console.log("[generate-blog-seo] DRY mode — no writes performed. Rerun with --apply to commit.")
  }

  // Touch to reference unused import in tiny builds (keeps node happy on strict tsc)
  void readdirSync
}

main().catch((err) => {
  console.error("[generate-blog-seo] FATAL:", err)
  process.exit(1)
})
