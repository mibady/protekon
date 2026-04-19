/**
 * scripts/test-sample-pdf.ts
 *
 * Task 5 E2E verification: in-process test of generateSamplePDF for every
 * sample slug/title referenced by the /samples page and every key in the
 * REPORTS + EMPLOYEE_MATERIAL_FILES tables.
 *
 * Validates:
 *   (i)   bytes returned
 *   (ii)  %PDF- header present
 *   (iii) size > 1 KiB
 *
 * Run: pnpm tsx scripts/test-sample-pdf.ts
 */

import { generateSamplePDF } from "@/lib/pdf-samples"

// Titles surfaced on /samples page (what real users click)
const SAMPLES_PAGE_TITLES = [
  "SB 553 Workplace Violence Prevention Plan",
  "Construction Subcontractor Compliance Report",
  "Property Management Municipal Compliance Pulse",
  "SB 553 Employee Summary",
  "WVPP Employee Sign-Off Sheet",
  "Manager WVP Communication Guide",
]

// Extra REPORTS keys that aren't on /samples yet but must still generate
// (marketing / dashboard paths may link to these)
const EXTRA_REPORT_TITLES = [
  "Injury & Illness Prevention Program (IIPP)",
  "SB 553 Violent Incident Log (Sample)",
  "Audit-Ready Compliance Package",
  "Quarterly Compliance Review",
]

// Raw sampleKey aliases (fallback path in generateSamplePDF)
const EMPLOYEE_SAMPLE_KEYS = [
  "sb-553-employee",
  "signoff-sheet",
  "manager-wvp-guide",
]

const ALL_SLUGS = [
  ...SAMPLES_PAGE_TITLES,
  ...EXTRA_REPORT_TITLES,
  ...EMPLOYEE_SAMPLE_KEYS,
]

interface Result {
  slug: string
  pass: boolean
  bytes: number
  hasHeader: boolean
  filename: string
  error?: string
}

async function runOne(slug: string): Promise<Result> {
  try {
    const { buffer, filename } = await generateSamplePDF(slug)
    const bytes = buffer.byteLength
    const header = new TextDecoder().decode(buffer.slice(0, 5))
    const hasHeader = header === "%PDF-"
    const pass = bytes > 1024 && hasHeader
    return { slug, pass, bytes, hasHeader, filename }
  } catch (err) {
    return {
      slug,
      pass: false,
      bytes: 0,
      hasHeader: false,
      filename: "",
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

async function main(): Promise<void> {
  console.log(`\nTesting ${ALL_SLUGS.length} sample PDF slugs...\n`)
  const results: Result[] = []
  for (const slug of ALL_SLUGS) {
    const r = await runOne(slug)
    results.push(r)
    const status = r.pass ? "PASS" : "FAIL"
    const kb = (r.bytes / 1024).toFixed(1)
    const detail = r.error ? ` — ERR: ${r.error}` : ` — ${kb} KiB — ${r.filename}`
    console.log(`  [${status}] ${slug}${detail}`)
  }

  const passed = results.filter((r) => r.pass).length
  const failed = results.length - passed
  console.log(`\n${passed}/${results.length} passed, ${failed} failed\n`)

  if (failed > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("Fatal:", err)
  process.exit(1)
})
