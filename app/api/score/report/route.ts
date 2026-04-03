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
}

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
  const text = `Protekon Compliance Score Report  |  Page ${pageNum} of ${totalPages}`
  const width = font.widthOfTextAtSize(text, 8)
  page.drawText(text, {
    x: (PAGE_WIDTH - width) / 2,
    y: 25,
    size: 8,
    font,
    color: BRAND.steel,
  })
}

async function generateScoreReportPDF(row: {
  name: string
  industry: string
  employee_count: string
  location_count: string
  city: string
  state: string
  score: number
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

  // --- Page 1: Cover + Score + Gaps ---
  const page1 = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  // Crimson header bar
  page1.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 80,
    width: PAGE_WIDTH,
    height: 80,
    color: BRAND.crimson,
  })
  page1.drawText("PROTEKON", {
    x: MARGIN,
    y: PAGE_HEIGHT - 35,
    size: 24,
    font: fontBold,
    color: rgb(1, 1, 1),
  })
  page1.drawText("Compliance Score Report", {
    x: MARGIN,
    y: PAGE_HEIGHT - 58,
    size: 12,
    font,
    color: rgb(1, 0.85, 0.85),
  })

  let y = PAGE_HEIGHT - 110

  // Business info section
  page1.drawText("Business Information", {
    x: MARGIN,
    y,
    size: 14,
    font: fontBold,
    color: BRAND.midnight,
  })
  y -= 8
  page1.drawRectangle({ x: MARGIN, y, width: 50, height: 2, color: BRAND.crimson })
  y -= 22

  const infoLines = [
    ["Name", row.name],
    ["Industry", row.industry],
    ["Employees", row.employee_count],
    ["Locations", row.location_count],
    ["Location", `${row.city}, ${row.state}`],
    ["Report Date", generatedDate],
  ]
  for (const [label, value] of infoLines) {
    page1.drawText(`${label}:`, { x: MARGIN, y, size: 10, font: fontBold, color: BRAND.steel })
    page1.drawText(value, { x: MARGIN + 100, y, size: 10, font, color: BRAND.midnight })
    y -= 18
  }

  y -= 15

  // Score section
  page1.drawText("Compliance Score", {
    x: MARGIN,
    y,
    size: 14,
    font: fontBold,
    color: BRAND.midnight,
  })
  y -= 8
  page1.drawRectangle({ x: MARGIN, y, width: 50, height: 2, color: BRAND.crimson })
  y -= 30

  const tierColor =
    row.score_tier === "green"
      ? rgb(0.16, 0.64, 0.29)
      : row.score_tier === "yellow"
        ? rgb(0.79, 0.54, 0.02)
        : BRAND.crimson

  // Score box
  page1.drawRectangle({
    x: MARGIN,
    y: y - 40,
    width: CONTENT_WIDTH,
    height: 55,
    color: BRAND.parchment,
  })
  page1.drawText(`${row.score} / 6`, {
    x: MARGIN + 20,
    y: y - 10,
    size: 32,
    font: fontBold,
    color: tierColor,
  })
  const tierLabel = row.score_tier.toUpperCase()
  page1.drawText(tierLabel, {
    x: MARGIN + 140,
    y: y - 5,
    size: 14,
    font: fontBold,
    color: tierColor,
  })
  page1.drawText("Compliance Tier", {
    x: MARGIN + 140,
    y: y - 22,
    size: 10,
    font,
    color: BRAND.steel,
  })
  y -= 65

  // Gap analysis section
  if (row.gaps.length > 0) {
    y -= 10
    page1.drawText("Gap Analysis", {
      x: MARGIN,
      y,
      size: 14,
      font: fontBold,
      color: BRAND.midnight,
    })
    y -= 8
    page1.drawRectangle({ x: MARGIN, y, width: 50, height: 2, color: BRAND.crimson })
    y -= 22

    for (const gap of row.gaps) {
      if (y < 80) break // leave room for footer

      page1.drawText(`\u2022  ${gap.label}`, {
        x: MARGIN + 5,
        y,
        size: 10,
        font: fontBold,
        color: BRAND.midnight,
      })
      y -= 16

      const descLines = wrapText(gap.description, font, 9, CONTENT_WIDTH - 20)
      for (const line of descLines) {
        if (y < 80) break
        page1.drawText(line, {
          x: MARGIN + 15,
          y,
          size: 9,
          font,
          color: BRAND.steel,
        })
        y -= 14
      }
      y -= 8
    }
  } else {
    y -= 10
    page1.drawText("No compliance gaps identified. Your programs are current.", {
      x: MARGIN,
      y,
      size: 11,
      font,
      color: rgb(0.16, 0.64, 0.29),
    })
  }

  // --- Page 2: Fine Exposure + CTA ---
  const page2 = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  y = PAGE_HEIGHT - MARGIN - 30

  // Fine exposure
  page2.drawText("Estimated Fine Exposure", {
    x: MARGIN,
    y,
    size: 14,
    font: fontBold,
    color: BRAND.midnight,
  })
  y -= 8
  page2.drawRectangle({ x: MARGIN, y, width: 50, height: 2, color: BRAND.crimson })
  y -= 30

  if (row.estimated_fine_low > 0) {
    const fineRange = `$${row.estimated_fine_low.toLocaleString("en-US")} — $${row.estimated_fine_high.toLocaleString("en-US")}`
    page2.drawRectangle({
      x: MARGIN,
      y: y - 30,
      width: CONTENT_WIDTH,
      height: 45,
      color: BRAND.parchment,
    })
    page2.drawText(fineRange, {
      x: MARGIN + 20,
      y: y - 8,
      size: 20,
      font: fontBold,
      color: BRAND.crimson,
    })
    page2.drawText("Potential Cal/OSHA citation range based on your gap count and employee size", {
      x: MARGIN + 20,
      y: y - 25,
      size: 9,
      font,
      color: BRAND.steel,
    })
    y -= 55
  } else {
    page2.drawText("$0 estimated exposure — no gaps identified.", {
      x: MARGIN,
      y,
      size: 12,
      font,
      color: rgb(0.16, 0.64, 0.29),
    })
    y -= 25
  }

  // How PROTEKON closes these gaps
  y -= 20
  page2.drawText("How PROTEKON Closes These Gaps", {
    x: MARGIN,
    y,
    size: 14,
    font: fontBold,
    color: BRAND.midnight,
  })
  y -= 8
  page2.drawRectangle({ x: MARGIN, y, width: 50, height: 2, color: BRAND.crimson })
  y -= 25

  const ctaItems = [
    "Site-specific IIPP written and maintained by compliance professionals",
    "PII-scrubbed incident logging that meets Cal/OSHA and SB 553 requirements",
    "Annual interactive training tracked with completion certificates",
    "Industry-specific compliance programs tailored to your vertical",
    "Audit-ready document packages available on demand",
    "Monthly compliance monitoring with regulatory change alerts",
  ]
  for (const item of ctaItems) {
    const lines = wrapText(`\u2022  ${item}`, font, 10, CONTENT_WIDTH - 15)
    for (const line of lines) {
      page2.drawText(line, {
        x: MARGIN + 10,
        y,
        size: 10,
        font,
        color: BRAND.midnight,
      })
      y -= 16
    }
    y -= 4
  }

  // CTA
  y -= 20
  page2.drawRectangle({
    x: MARGIN,
    y: y - 30,
    width: CONTENT_WIDTH,
    height: 40,
    color: BRAND.crimson,
  })
  page2.drawText("Start your managed compliance program", {
    x: MARGIN + 20,
    y: y - 8,
    size: 12,
    font: fontBold,
    color: rgb(1, 1, 1),
  })
  page2.drawText("protekon.vercel.app/intake", {
    x: MARGIN + 20,
    y: y - 24,
    size: 10,
    font,
    color: rgb(1, 0.85, 0.85),
  })

  // Disclaimer
  y -= 60
  const disclaimerLines = wrapText(
    "This assessment is for informational purposes only and does not constitute legal advice.",
    font,
    8,
    CONTENT_WIDTH
  )
  for (const line of disclaimerLines) {
    page2.drawText(line, {
      x: MARGIN,
      y,
      size: 8,
      font,
      color: BRAND.steel,
    })
    y -= 12
  }

  // Add footers
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
      name: row.name,
      industry: row.industry,
      employee_count: row.employee_count,
      location_count: row.location_count,
      city: row.city,
      state: row.state,
      score: row.score,
      score_tier: row.score_tier,
      gaps: (row.gaps ?? []) as ScoreGap[],
      estimated_fine_low: row.estimated_fine_low,
      estimated_fine_high: row.estimated_fine_high,
    })

    const filename = `protekon-score-report-${id}.pdf`
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
