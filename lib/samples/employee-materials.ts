import fs from "node:fs"
import path from "node:path"

/**
 * Minimal MDX frontmatter + body parser.
 * We intentionally avoid a dep on gray-matter / next-mdx here — these
 * documents are rendered to PDF as plain markdown-ish text, and we only
 * need (a) the frontmatter fields for metadata and (b) the raw body to
 * feed into the shared PDF layout pipeline.
 */
export interface ParsedEmployeeMaterial {
  frontmatter: Record<string, string | string[]>
  body: string
  sections: { heading: string; items: string[] }[]
}

export type EmployeeSampleKey =
  | "sb-553-employee"
  | "signoff-sheet"
  | "manager-wvp-guide"

export interface TokenContext {
  client?: { business_name?: string }
  plan?: { wvpp_rev?: string }
  employee?: {
    name?: string
    date?: string
    signature_line?: string
  }
}

const EMPLOYEE_MATERIAL_FILES: Record<EmployeeSampleKey, string> = {
  "sb-553-employee": "sb-553-summary.mdx",
  "signoff-sheet": "signoff-sheet-template.mdx",
  "manager-wvp-guide": "manager-wvp-communication-guide.mdx",
}

const MATERIALS_DIR = path.join(process.cwd(), "content", "employee-materials")

function parseFrontmatter(source: string): {
  frontmatter: Record<string, string | string[]>
  body: string
} {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    return { frontmatter: {}, body: source }
  }
  const [, raw, body] = match
  const frontmatter: Record<string, string | string[]> = {}
  let currentKey: string | null = null
  let listBuffer: string[] = []
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue
    const listItem = line.match(/^\s+-\s+(.*)$/)
    if (listItem && currentKey) {
      listBuffer.push(listItem[1].replace(/^["']|["']$/g, "").trim())
      frontmatter[currentKey] = [...listBuffer]
      continue
    }
    const kv = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/)
    if (kv) {
      // close previous list
      listBuffer = []
      currentKey = kv[1]
      const value = kv[2].trim()
      if (value) {
        frontmatter[currentKey] = value.replace(/^["']|["']$/g, "")
      } else {
        frontmatter[currentKey] = []
      }
    }
  }
  return { frontmatter, body }
}

/**
 * Break the MDX body into `{ heading, items }` sections that match the
 * existing PDF generator's expected shape (H2 → section heading; each
 * paragraph or list item becomes an item).
 */
function extractSections(body: string): { heading: string; items: string[] }[] {
  const sections: { heading: string; items: string[] }[] = []
  const lines = body.split("\n")
  let current: { heading: string; items: string[] } | null = null
  let paragraph: string[] = []

  const flushParagraph = (): void => {
    if (!current) return
    const text = paragraph.join(" ").trim()
    if (text) current.items.push(text)
    paragraph = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    // Skip top-level H1 title (handled by cover page)
    if (line.startsWith("# ")) {
      flushParagraph()
      continue
    }
    if (line.startsWith("## ")) {
      flushParagraph()
      if (current) sections.push(current)
      current = { heading: line.slice(3).trim(), items: [] }
      continue
    }
    if (!current) {
      // preamble content before first H2 — start a default section
      current = { heading: "Overview", items: [] }
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph()
      current.items.push(line.slice(2).trim())
      continue
    }
    if (line.match(/^\d+\.\s+/)) {
      flushParagraph()
      current.items.push(line.replace(/^\d+\.\s+/, "").trim())
      continue
    }
    if (!line.trim()) {
      flushParagraph()
      continue
    }
    if (line.startsWith("---")) {
      flushParagraph()
      continue
    }
    paragraph.push(line.replace(/\s+/g, " ").trim())
  }
  flushParagraph()
  if (current) sections.push(current)

  // Drop empty sections
  return sections.filter((s) => s.items.length > 0)
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
}

function applyTokens(text: string, ctx: TokenContext | undefined): string {
  if (!ctx) return text
  const map: Record<string, string | undefined> = {
    "{{client.business_name}}": ctx.client?.business_name,
    "{{plan.wvpp_rev}}": ctx.plan?.wvpp_rev,
    "{{employee.name}}": ctx.employee?.name,
    "{{employee.date}}": ctx.employee?.date,
    "{{employee.signature_line}}": ctx.employee?.signature_line,
  }
  let out = text
  for (const [token, value] of Object.entries(map)) {
    if (value) {
      out = out.split(token).join(value)
    }
  }
  return out
}

export function loadEmployeeMaterial(
  sampleKey: EmployeeSampleKey,
  context?: TokenContext
): ParsedEmployeeMaterial {
  const filename = EMPLOYEE_MATERIAL_FILES[sampleKey]
  if (!filename) {
    throw new Error(`Unknown employee material sampleKey: ${sampleKey}`)
  }
  const filepath = path.join(MATERIALS_DIR, filename)
  const source = fs.readFileSync(filepath, "utf8")
  const { frontmatter, body } = parseFrontmatter(source)

  const transformed = stripMarkdown(applyTokens(body, context))
  const sections = extractSections(transformed)

  return { frontmatter, body: transformed, sections }
}

export function getEmployeeMaterialMeta(sampleKey: EmployeeSampleKey): {
  title: string
  filename: string
  footer: string
} {
  const { frontmatter } = loadEmployeeMaterial(sampleKey)
  const titleRaw = (frontmatter.title as string) ?? "Employee Material"
  const baseFilename = EMPLOYEE_MATERIAL_FILES[sampleKey].replace(/\.mdx$/, "")
  return {
    title: titleRaw,
    filename: `Protekon-${baseFilename}.pdf`,
    footer:
      "This is a SAMPLE employee-shareable document generated by PROTEKON. Your employer's actual plan governs in case of any conflict.",
  }
}

export function isEmployeeSampleKey(key: string): key is EmployeeSampleKey {
  return key in EMPLOYEE_MATERIAL_FILES
}

/**
 * Map each sampleKey to the *report title* used as the lookup key in the
 * existing generateSamplePDF REPORTS table, so callers that pass either
 * the sampleKey or the full title both resolve to the same PDF.
 */
export const EMPLOYEE_TITLE_BY_KEY: Record<EmployeeSampleKey, string> = {
  "sb-553-employee": "SB 553 Employee Summary",
  "signoff-sheet": "WVPP Employee Sign-Off Sheet",
  "manager-wvp-guide": "Manager WVP Communication Guide",
}
