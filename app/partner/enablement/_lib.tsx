import { promises as fs } from "fs"
import path from "path"

export interface EnablementDoc {
  slug: string
  title: string
  summary: string
  order: number
  body: string
}

const CONTENT_DIR = path.join(process.cwd(), "content", "partner-enablement")

export const ENABLEMENT_SLUGS = [
  "the-protekon-practice",
  "playbook-intake-to-close",
  "pricing-objection-handling",
] as const

export type EnablementSlug = (typeof ENABLEMENT_SLUGS)[number]

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { data: {}, body: raw }
  const fm = match[1]
  const body = match[2]
  const data: Record<string, string> = {}
  for (const line of fm.split("\n")) {
    const idx = line.indexOf(":")
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
    data[key] = value
  }
  return { data, body }
}

export async function getEnablementDoc(slug: string): Promise<EnablementDoc | null> {
  if (!ENABLEMENT_SLUGS.includes(slug as EnablementSlug)) return null
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  try {
    const raw = await fs.readFile(filePath, "utf-8")
    const { data, body } = parseFrontmatter(raw)
    return {
      slug,
      title: data.title ?? slug,
      summary: data.summary ?? "",
      order: data.order ? parseInt(data.order, 10) : 99,
      body,
    }
  } catch {
    return null
  }
}

export async function listEnablementDocs(): Promise<EnablementDoc[]> {
  const docs = await Promise.all(ENABLEMENT_SLUGS.map((s) => getEnablementDoc(s)))
  return docs
    .filter((d): d is EnablementDoc => d !== null)
    .sort((a, b) => a.order - b.order)
}

// Minimal markdown → React renderer.
// Supports: h1/h2/h3, paragraphs, ul/li, ol/li, blockquote, strong (**text**), em (*text*), inline code (`text`).
// This is intentionally tiny — no external MDX/markdown pipeline is introduced.
import type { ReactNode } from "react"

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // Order matters: code first (no further parsing inside), then bold, then italic.
  const nodes: ReactNode[] = []
  let remaining = text
  let i = 0
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/
  while (remaining.length > 0) {
    const m = remaining.match(pattern)
    if (!m || m.index === undefined) {
      nodes.push(remaining)
      break
    }
    if (m.index > 0) nodes.push(remaining.slice(0, m.index))
    const token = m[0]
    if (token.startsWith("`")) {
      nodes.push(
        <code key={`${keyPrefix}-c-${i}`} className="bg-midnight/[0.06] px-1.5 py-0.5 font-mono text-[0.9em]">
          {token.slice(1, -1)}
        </code>,
      )
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-midnight">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith("*")) {
      nodes.push(
        <em key={`${keyPrefix}-i-${i}`}>{token.slice(1, -1)}</em>,
      )
    }
    remaining = remaining.slice(m.index + token.length)
    i += 1
  }
  return nodes
}

export function renderMarkdown(markdown: string): ReactNode {
  const lines = markdown.split("\n")
  const blocks: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // Blank line
    if (line.trim() === "") {
      i += 1
      continue
    }

    // Headings
    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="font-display font-bold text-[18px] tracking-[1px] text-midnight mt-10 mb-3">
          {line.slice(4)}
        </h3>,
      )
      i += 1
      continue
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={key++} className="font-display font-bold text-[22px] tracking-[1px] text-midnight mt-12 mb-4 pb-2 border-b border-midnight/[0.08]">
          {line.slice(3)}
        </h2>,
      )
      i += 1
      continue
    }
    if (line.startsWith("# ")) {
      blocks.push(
        <h1 key={key++} className="font-display font-black text-[clamp(28px,4vw,42px)] tracking-tight text-midnight mt-6 mb-8">
          {line.slice(2)}
        </h1>,
      )
      i += 1
      continue
    }

    // Blockquote (possibly multi-line)
    if (line.startsWith("> ") || line.trim() === ">") {
      const quoteLines: string[] = []
      while (i < lines.length && (lines[i].startsWith(">") || lines[i].trim() === "")) {
        if (lines[i].startsWith("> ")) quoteLines.push(lines[i].slice(2))
        else if (lines[i].trim() === ">") quoteLines.push("")
        else if (lines[i].trim() === "") {
          // End blockquote if next non-empty line isn't a quote
          const next = lines.slice(i + 1).find((l) => l.trim() !== "")
          if (!next || !next.startsWith(">")) break
          quoteLines.push("")
        }
        i += 1
      }
      // Render quote body by recursively splitting paragraphs
      const quoteBody: ReactNode[] = []
      let para: string[] = []
      let qk = 0
      const flush = () => {
        if (para.length === 0) return
        const joined = para.join(" ")
        quoteBody.push(
          <p key={`q-${key}-p-${qk++}`} className="mb-3 last:mb-0">
            {renderInline(joined, `q-${key}-p-${qk}`)}
          </p>,
        )
        para = []
      }
      for (const ql of quoteLines) {
        if (ql.trim() === "") flush()
        else para.push(ql)
      }
      flush()
      blocks.push(
        <blockquote key={key++} className="border-l-[3px] border-crimson bg-parchment/60 pl-5 py-4 my-6 text-midnight/80 italic">
          {quoteBody}
        </blockquote>,
      )
      continue
    }

    // Unordered list
    if (line.startsWith("- ")) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2))
        i += 1
      }
      blocks.push(
        <ul key={key++} className="list-disc pl-6 my-4 space-y-2 text-midnight/85">
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInline(item, `ul-${key}-${idx}`)}
            </li>
          ))}
        </ul>,
      )
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""))
        i += 1
      }
      blocks.push(
        <ol key={key++} className="list-decimal pl-6 my-4 space-y-2 text-midnight/85">
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInline(item, `ol-${key}-${idx}`)}
            </li>
          ))}
        </ol>,
      )
      continue
    }

    // Paragraph (accumulate consecutive non-blank, non-special lines)
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("- ") &&
      !/^\d+\.\s/.test(lines[i]) &&
      !lines[i].startsWith(">")
    ) {
      paraLines.push(lines[i])
      i += 1
    }
    if (paraLines.length > 0) {
      blocks.push(
        <p key={key++} className="my-4 leading-relaxed text-midnight/85">
          {renderInline(paraLines.join(" "), `p-${key}`)}
        </p>,
      )
    }
  }

  return <>{blocks}</>
}
