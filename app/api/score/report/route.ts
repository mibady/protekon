import { NextRequest, NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { createClient } from "@/lib/supabase/server"
import type { ScoreGap } from "@/lib/types/score"

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MARGIN = 50
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

const BRAND = {
  midnight: rgb(0.1, 0.1, 0.18),
  crimson: rgb(0.545, 0, 0),
  gold: rgb(0.835, 0.686, 0.322),
  steel: rgb(0.5, 0.5, 0.55),
  parchment: rgb(0.96, 0.953, 0.937),
  white: rgb(1, 1, 1),
  green: rgb(0.16, 0.64, 0.29),
  yellow: rgb(0.79, 0.54, 0.02),
}

// All 11 baseline requirements — matches lib/score-calculator.ts
const ALL_REQUIREMENTS = [
  { key: "has_iipp", label: "Written Injury & Illness Prevention Program (IIPP)", citation: "T8 CCR §3203", fine: 18000 },
  { key: "iipp_current", label: "IIPP Reviewed in Last 12 Months", citation: "T8 CCR §3203(a)(1)", fine: 7000 },
  { key: "has_eap", label: "Written Emergency Action Plan", citation: "29 CFR 1910.38", fine: 16131 },
  { key: "has_hazcom", label: "HazCom Program with Accessible SDSs", citation: "29 CFR 1910.1200", fine: 16131 },
  { key: "osha_300_current", label: "OSHA 300/300A Records Current & Posted", citation: "29 CFR 1904", fine: 16131 },
  { key: "has_wvpp", label: "Written Workplace Violence Prevention Plan (WVPP)", citation: "Cal. Labor Code §6401.9(b)", fine: 25000 },
  { key: "wvpp_site_specific", label: "Site-Specific WVPP", citation: "Cal. Labor Code §6401.9(b)(1)", fine: 25000 },
  { key: "has_incident_log", label: "Violent Incident Log", citation: "Cal. Labor Code §6401.9(d)", fine: 25000 },
  { key: "pii_stripped", label: "PII Stripped from Incident Log", citation: "Cal. Labor Code §6401.9(d)(2)", fine: 25000 },
  { key: "training_current", label: "Annual Interactive Training", citation: "Cal. Labor Code §6401.9(e)", fine: 7000 },
  { key: "audit_ready", label: "Audit-Ready Compliance Package", citation: "Cal. Labor Code §6401.9(a)", fine: 25000 },
]

function wrapText(
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(" ")
  const lines: string[] = []
  let currentLine = ""

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const width = font.widthOfTextAtSize(testLine, fontSize)
    if (width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

function addFooter(
  page: ReturnType<PDFDocument["addPage"]>,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  pageNum: number,
  totalPages: number
) {
  const text = `PROTEKON Compliance Scorecard  |  Page ${pageNum} of ${totalPages}  |  protekon.vercel.app`
  const width = font.widthOfTextAtSize(text, 7)
  page.drawText(text, {
    x: (PAGE_WIDTH - width) / 2,
    y: 20,
    size: 7,
    font,
    color: BRAND.steel,
  })
}

function drawSectionHeader(
  page: ReturnType<PDFDocument["addPage"]>,
  fontBold: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  title: string,
  y: number
): number {
  page.drawText(title, {
    x: MARGIN,
    y,
    size: 13,
    font: fontBold,
    color: BRAND.midnight,
  })
  y -= 6
  page.drawRectangle({ x: MARGIN, y, width: 40, height: 2, color: BRAND.crimson })
  return y - 18
}

async function generateScoreReportPDF(row: {
  name: string | null
  industry: string
  employee_count: string
  score: number
  max_score: number
  score_tier: string
  gaps: ScoreGap[]
  estimated_fine_low: number
  estimated_fine_high: number
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const gapKeys = new Set(row.gaps.map((g) => g.key))
  const totalFineExposure = row.gaps.reduce((sum, g) => sum + (g.fine ?? g.citation_amount ?? 25000), 0)

  // --- Page 1: Header + Score + Gap Table ---
  const page1 = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

  // Crimson header bar
  page1.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 70,
    width: PAGE_WIDTH,
    height: 70,
    color: BRAND.crimson,
  })
  page1.drawText("COMPLIANCE SCORECARD", {
    x: MARGIN,
    y: PAGE_HEIGHT - 32,
    size: 22,
    font: fontBold,
    color: BRAND.white,
  })
  page1.drawText(`PROTEKON  |  ${generatedDate}`, {
    x: MARGIN,
    y: PAGE_HEIGHT - 50,
    size: 10,
    font,
    color: rgb(1, 0.85, 0.85),
  })

  let y = PAGE_HEIGHT - 95

  // Business info
  y = drawSectionHeader(page1, fontBold, "Business Profile", y)

  const infoLines = [
    ["Industry", row.industry],
    ["Employees", row.employee_count],
  ]
  if (row.name) {
    infoLines.unshift(["Business", row.name])
  }
  for (const [label, value] of infoLines) {
    page1.drawText(`${label}:`, { x: MARGIN, y, size: 10, font: fontBold, color: BRAND.steel })
    page1.drawText(value, { x: MARGIN + 80, y, size: 10, font, color: BRAND.midnight })
    y -= 16
  }

  y -= 12

  // Score display
  y = drawSectionHeader(page1, fontBold, "Compliance Score", y)

  const tierColor =
    row.score_tier === "green" ? BRAND.green
      : row.score_tier === "yellow" ? BRAND.yellow
        : BRAND.crimson

  const ratio = row.max_score > 0 ? row.score / row.max_score : 0
  const tierLabel =
    ratio >= 0.9 ? "COMPLIANT"
      : ratio >= 0.6 ? "AT RISK"
        : "NON-COMPLIANT"

  // Score box
  page1.drawRectangle({
    x: MARGIN,
    y: y - 38,
    width: CONTENT_WIDTH,
    height: 50,
    color: BRAND.parchment,
  })
  page1.drawText(`${row.score} / ${row.max_score}`, {
    x: MARGIN + 20,
    y: y - 8,
    size: 30,
    font: fontBold,
    color: tierColor,
  })
  page1.drawText(tierLabel, {
    x: MARGIN + 130,
    y: y - 3,
    size: 13,
    font: fontBold,
    color: tierColor,
  })
  page1.drawText("Cal/OSHA + Federal Requirements Met", {
    x: MARGIN + 130,
    y: y - 20,
    size: 9,
    font,
    color: BRAND.steel,
  })
  y -= 60

  // Gap table
  y -= 8
  y = drawSectionHeader(page1, fontBold, "Requirement Status", y)

  // Table header
  const colX = { status: MARGIN, requirement: MARGIN + 28, citation: MARGIN + 280, fine: MARGIN + 430 }
  page1.drawRectangle({ x: MARGIN, y: y - 2, width: CONTENT_WIDTH, height: 16, color: BRAND.parchment })
  page1.drawText("", { x: colX.status, y: y + 2, size: 8, font: fontBold, color: BRAND.midnight })
  page1.drawText("Requirement", { x: colX.requirement, y: y + 2, size: 8, font: fontBold, color: BRAND.midnight })
  page1.drawText("Citation", { x: colX.citation, y: y + 2, size: 8, font: fontBold, color: BRAND.midnight })
  page1.drawText("Fine", { x: colX.fine, y: y + 2, size: 8, font: fontBold, color: BRAND.midnight })
  y -= 18

  // Combine baseline requirements with any vertical-specific gaps
  const allRows = [
    ...ALL_REQUIREMENTS,
    ...row.gaps
      .filter((g) => g.phase === "vertical")
      .map((g) => ({ key: g.key, label: g.label, citation: g.citation, fine: g.fine })),
  ]

  for (const req of allRows) {
    if (y < 80) break // Prevent overflow
    const isGap = gapKeys.has(req.key)
    const statusSymbol = isGap ? "\u2717" : "\u2713"
    const statusColor = isGap ? BRAND.crimson : BRAND.green

    page1.drawText(statusSymbol, { x: colX.status + 8, y, size: 12, font: fontBold, color: statusColor })

    // Truncate long labels to fit
    const label = req.label.length > 45 ? req.label.slice(0, 42) + "..." : req.label
    page1.drawText(label, { x: colX.requirement, y, size: 9, font, color: BRAND.midnight })
    page1.drawText(req.citation, { x: colX.citation, y, size: 8, font, color: BRAND.steel })
    page1.drawText(isGap ? `$${req.fine.toLocaleString("en-US")}` : "$0", {
      x: colX.fine,
      y,
      size: 9,
      font: isGap ? fontBold : font,
      color: isGap ? BRAND.crimson : BRAND.green,
    })

    y -= 16
    page1.drawRectangle({ x: MARGIN, y: y + 10, width: CONTENT_WIDTH, height: 0.5, color: BRAND.parchment })
  }

  // Total fine exposure
  y -= 10
  page1.drawRectangle({ x: MARGIN, y: y - 6, width: CONTENT_WIDTH, height: 28, color: BRAND.parchment })
  page1.drawText("Total Fine Exposure (single inspection):", {
    x: MARGIN + 10,
    y: y + 2,
    size: 10,
    font: fontBold,
    color: BRAND.midnight,
  })

  if (totalFineExposure > 0) {
    const fineRange = `$${row.estimated_fine_low.toLocaleString("en-US")} — $${row.estimated_fine_high.toLocaleString("en-US")}`
    page1.drawText(fineRange, {
      x: colX.fine - 50,
      y: y + 2,
      size: 11,
      font: fontBold,
      color: BRAND.crimson,
    })
  } else {
    page1.drawText("$0", {
      x: colX.fine,
      y: y + 2,
      size: 11,
      font: fontBold,
      color: BRAND.green,
    })
  }

  // --- Page 2: Remediation + Cost Comparison + CTA ---
  const page2 = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  y = PAGE_HEIGHT - MARGIN - 20

  // Remediation checklist
  if (row.gaps.length > 0) {
    y = drawSectionHeader(page2, fontBold, "Remediation Checklist", y)

    for (const gap of row.gaps) {
      if (y < 120) break

      page2.drawText(`\u25A1  ${gap.label}`, {
        x: MARGIN + 5,
        y,
        size: 10,
        font: fontBold,
        color: BRAND.crimson,
      })
      y -= 14

      const descLines = wrapText(gap.description, font, 9, CONTENT_WIDTH - 25)
      for (const line of descLines) {
        if (y < 120) break
        page2.drawText(line, {
          x: MARGIN + 20,
          y,
          size: 9,
          font,
          color: BRAND.steel,
        })
        y -= 13
      }

      // Citation reference
      const citationText = gap.citation ?? ""
      if (citationText) {
        page2.drawText(citationText, {
          x: MARGIN + 20,
          y,
          size: 8,
          font,
          color: BRAND.gold,
        })
        y -= 13
      }
      y -= 6
    }
  } else {
    y = drawSectionHeader(page2, fontBold, "Status", y)
    page2.drawText("All compliance requirements met. No remediation needed.", {
      x: MARGIN,
      y,
      size: 11,
      font,
      color: BRAND.green,
    })
    y -= 25
  }

  // Cost comparison
  y -= 15
  y = drawSectionHeader(page2, fontBold, "Cost Comparison", y)

  const annualRisk = row.estimated_fine_high > 0
    ? `$${row.estimated_fine_high.toLocaleString("en-US")}`
    : "$0"

  const comparisonRows = [
    ["Annual Risk (citation exposure)", annualRisk, BRAND.crimson],
    ["Safety Consultant (12 months)", "$24,000 - $60,000", BRAND.steel],
    ["PROTEKON AI Compliance Officer", "$7,164/year ($597/mo)", BRAND.green],
  ] as const

  for (const [label, value, color] of comparisonRows) {
    page2.drawRectangle({ x: MARGIN, y: y - 4, width: CONTENT_WIDTH, height: 20, color: BRAND.parchment })
    page2.drawText(label, { x: MARGIN + 10, y, size: 9, font, color: BRAND.midnight })
    page2.drawText(value, { x: MARGIN + 320, y, size: 9, font: fontBold, color })
    y -= 24
  }

  // CTA
  y -= 20
  page2.drawRectangle({
    x: MARGIN,
    y: y - 30,
    width: CONTENT_WIDTH,
    height: 50,
    color: BRAND.crimson,
  })
  page2.drawText("Close every gap in 48 hours", {
    x: MARGIN + 20,
    y: y - 5,
    size: 14,
    font: fontBold,
    color: BRAND.white,
  })
  page2.drawText("protekon.vercel.app/contact", {
    x: MARGIN + 20,
    y: y - 22,
    size: 10,
    font,
    color: rgb(1, 0.85, 0.85),
  })

  // Disclaimer
  y -= 55
  const disclaimerLines = wrapText(
    "This assessment is generated by PROTEKON's AI Compliance Officer and is for informational purposes only. " +
    "It does not constitute legal advice. Fine amounts are based on published Cal/OSHA penalty schedules and may vary. " +
    "Consult a qualified compliance professional for formal legal guidance.",
    font,
    7,
    CONTENT_WIDTH
  )
  for (const line of disclaimerLines) {
    page2.drawText(line, {
      x: MARGIN,
      y,
      size: 7,
      font,
      color: BRAND.steel,
    })
    y -= 10
  }

  // Add footers to all pages
  const totalPages = doc.getPageCount()
  const pages = doc.getPages()
  for (let i = 0; i < totalPages; i++) {
    addFooter(pages[i], font, i + 1, totalPages)
  }

  return doc.save()
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const id = request.nextUrl.searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: row, error } = await supabase
    .from("compliance_score_leads")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !row) {
    return NextResponse.json({ error: "Score report not found" }, { status: 404 })
  }

  try {
    const pdfBytes = await generateScoreReportPDF({
      name: row.name ?? null,
      industry: row.industry,
      employee_count: row.employee_count,
      score: row.score,
      max_score: row.max_score ?? 11,
      score_tier: row.score_tier,
      gaps: (row.gaps ?? []) as ScoreGap[],
      estimated_fine_low: row.estimated_fine_low,
      estimated_fine_high: row.estimated_fine_high,
    })

    const filename = `protekon-scorecard-${id}.pdf`
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error("[api/score/report] PDF generation failed:", err)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
