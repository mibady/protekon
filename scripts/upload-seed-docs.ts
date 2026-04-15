/**
 * One-shot script: Generate 7 demo PDFs and upload to Vercel Blob.
 * Outputs URLs to paste into seed files.
 *
 * Usage: npx tsx scripts/upload-seed-docs.ts
 * Requires: BLOB_READ_WRITE_TOKEN in .env.local
 */

import { generateCompliancePDF } from "../lib/pdf"
import { put } from "@vercel/blob"
import { readFileSync } from "fs"
import { resolve } from "path"

// Load .env.local
const envPath = resolve(process.cwd(), ".env.local")
const envContent = readFileSync(envPath, "utf-8")
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=["']?(.+?)["']?$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

const DOCS = [
  { id: "DOC-2026-001", type: "wvpp", filename: "WVPP_2026.pdf" },
  { id: "DOC-2026-002", type: "gap-analysis", filename: "Gap_Analysis_Q1_2026.pdf" },
  { id: "DOC-2026-003", type: "incident-response-protocol", filename: "Incident_Response_Protocol.pdf" },
  { id: "DOC-2026-004", type: "training-curriculum", filename: "Training_Curriculum_2026.pdf" },
  { id: "DOC-2026-005", type: "audit-package", filename: "Audit_Package_Jan_2026.pdf" },
  { id: "DOC-2026-006", type: "salary-range", filename: "Salary_Ranges_2026.pdf" },
  { id: "DOC-2026-007", type: "eeo-policy", filename: "EEO_Policy.pdf" },
]

async function main() {
  console.log("Generating and uploading 7 demo PDFs...\n")

  const results: Record<string, string> = {}

  for (const doc of DOCS) {
    const { buffer } = await generateCompliancePDF({
      businessName: "Coastal Health Group",
      documentType: doc.type,
      vertical: "hipaa",
      documentId: doc.id,
      complianceScore: 83,
      riskLevel: "medium",
      auditCount: 3,
      incidentCount: 5,
    })

    const blob = await put(`demo-seed/${doc.filename}`, Buffer.from(buffer), {
      access: "private",
      contentType: "application/pdf",
      addRandomSuffix: false,
    })

    results[doc.id] = blob.url
    console.log(`  ${doc.id} (${doc.type}) → ${blob.url}`)
  }

  console.log("\n--- Paste into seed files ---\n")
  for (const [id, url] of Object.entries(results)) {
    console.log(`${id}: ${url}`)
  }
}

main().catch((err) => {
  console.error("Failed:", err.message)
  process.exit(1)
})
