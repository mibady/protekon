import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

const VALID_REPORT_TYPES = [
  "compliance-score",
  "regulatory-impact",
  "annual-summary",
  "document-history",
  "incident-analysis",
  "delivery-log",
] as const

type ReportType = (typeof VALID_REPORT_TYPES)[number]

function isValidReportType(value: string): value is ReportType {
  return VALID_REPORT_TYPES.includes(value as ReportType)
}

const REPORT_TITLES: Record<ReportType, string> = {
  "compliance-score": "Compliance Score Report",
  "regulatory-impact": "Regulatory Impact Report",
  "annual-summary": "Annual Compliance Summary",
  "document-history": "Document History Report",
  "incident-analysis": "Incident Analysis Report",
  "delivery-log": "Delivery Log Report",
}

interface TableRow {
  cells: string[]
}

interface PDFSection {
  title: string
  headers: string[]
  rows: TableRow[]
}

async function buildReportPDF(
  reportTitle: string,
  businessName: string,
  sections: PDFSection[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 612
  const pageHeight = 792
  const margin = 50
  const lineHeight = 16
  const contentWidth = pageWidth - margin * 2

  // Title page
  let page = doc.addPage([pageWidth, pageHeight])
  let yPos = pageHeight - margin

  // Brand bar
  page.drawRectangle({
    x: 0,
    y: pageHeight - 4,
    width: pageWidth,
    height: 4,
    color: rgb(0.77, 0.07, 0.19), // crimson
  })

  yPos -= 40
  page.drawText("PROTEKON", {
    x: margin,
    y: yPos,
    size: 10,
    font: fontBold,
    color: rgb(0.77, 0.07, 0.19),
  })

  yPos -= 30
  page.drawText(reportTitle, {
    x: margin,
    y: yPos,
    size: 22,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.15),
  })

  yPos -= 22
  page.drawText(businessName, {
    x: margin,
    y: yPos,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.45),
  })

  yPos -= 18
  page.drawText(`Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, {
    x: margin,
    y: yPos,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.55),
  })

  yPos -= 30
  page.drawLine({
    start: { x: margin, y: yPos },
    end: { x: pageWidth - margin, y: yPos },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  })
  yPos -= 20

  // Sections
  for (const section of sections) {
    // Check if we need a new page for the section title + headers + at least 1 row
    if (yPos < margin + lineHeight * 4) {
      page = doc.addPage([pageWidth, pageHeight])
      yPos = pageHeight - margin
    }

    // Section title
    page.drawText(section.title.toUpperCase(), {
      x: margin,
      y: yPos,
      size: 10,
      font: fontBold,
      color: rgb(0.77, 0.07, 0.19),
    })
    yPos -= 20

    // Column widths — distribute evenly
    const colCount = section.headers.length
    const colWidth = contentWidth / colCount

    // Headers
    for (let i = 0; i < colCount; i++) {
      page.drawText(section.headers[i], {
        x: margin + i * colWidth,
        y: yPos,
        size: 8,
        font: fontBold,
        color: rgb(0.35, 0.35, 0.4),
      })
    }
    yPos -= 6
    page.drawLine({
      start: { x: margin, y: yPos },
      end: { x: pageWidth - margin, y: yPos },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85),
    })
    yPos -= lineHeight

    // Rows
    for (const row of section.rows) {
      if (yPos < margin + lineHeight) {
        page = doc.addPage([pageWidth, pageHeight])
        yPos = pageHeight - margin
      }

      for (let i = 0; i < colCount; i++) {
        const cellText = (row.cells[i] ?? "").slice(0, Math.floor(colWidth / 5))
        page.drawText(cellText, {
          x: margin + i * colWidth,
          y: yPos,
          size: 8,
          font,
          color: rgb(0.15, 0.15, 0.2),
        })
      }
      yPos -= lineHeight
    }

    yPos -= 20
  }

  return doc.save()
}

async function getReportData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clientId: string,
  reportType: ReportType
): Promise<{ businessName: string; sections: PDFSection[] }> {
  // Get business name
  const { data: clientData } = await supabase
    .from("clients")
    .select("business_name")
    .eq("id", clientId)
    .single()
  const businessName = clientData?.business_name ?? "Unknown Business"

  const sections: PDFSection[] = []

  switch (reportType) {
    case "compliance-score": {
      const { data: client } = await supabase
        .from("clients")
        .select("compliance_score, risk_level, vertical, plan")
        .eq("id", clientId)
        .single()

      sections.push({
        title: "Compliance Overview",
        headers: ["Metric", "Value"],
        rows: [
          { cells: ["Compliance Score", String(client?.compliance_score ?? "N/A")] },
          { cells: ["Risk Level", client?.risk_level ?? "N/A"] },
          { cells: ["Industry Vertical", client?.vertical ?? "N/A"] },
          { cells: ["Plan", client?.plan ?? "N/A"] },
        ],
      })

      const { data: docs } = await supabase
        .from("documents")
        .select("filename, status, type, created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })

      if (docs && docs.length > 0) {
        sections.push({
          title: "Document Status",
          headers: ["Document", "Type", "Status", "Created"],
          rows: docs.map((d) => ({
            cells: [d.filename, d.type, d.status, new Date(d.created_at).toLocaleDateString("en-US")],
          })),
        })
      }
      break
    }

    case "regulatory-impact": {
      const { data: docs } = await supabase
        .from("documents")
        .select("filename, type, status, created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })

      sections.push({
        title: "Regulatory Documents",
        headers: ["Document", "Type", "Status", "Date"],
        rows: (docs ?? []).map((d) => ({
          cells: [d.filename, d.type, d.status, new Date(d.created_at).toLocaleDateString("en-US")],
        })),
      })
      break
    }

    case "annual-summary": {
      const { data: client } = await supabase
        .from("clients")
        .select("compliance_score, risk_level")
        .eq("id", clientId)
        .single()

      const { data: incidents } = await supabase
        .from("incidents")
        .select("incident_id, severity, incident_date, description")
        .eq("client_id", clientId)
        .order("incident_date", { ascending: false })

      const { data: docs } = await supabase
        .from("documents")
        .select("filename, status")
        .eq("client_id", clientId)

      sections.push({
        title: "Annual Overview",
        headers: ["Metric", "Value"],
        rows: [
          { cells: ["Compliance Score", String(client?.compliance_score ?? "N/A")] },
          { cells: ["Risk Level", client?.risk_level ?? "N/A"] },
          { cells: ["Total Incidents", String(incidents?.length ?? 0)] },
          { cells: ["Total Documents", String(docs?.length ?? 0)] },
        ],
      })

      if (incidents && incidents.length > 0) {
        sections.push({
          title: "Incident Log",
          headers: ["ID", "Severity", "Date", "Description"],
          rows: incidents.map((i) => ({
            cells: [
              i.incident_id,
              i.severity,
              i.incident_date ? new Date(i.incident_date).toLocaleDateString("en-US") : "—",
              (i.description ?? "").slice(0, 60),
            ],
          })),
        })
      }
      break
    }

    case "document-history": {
      const { data: docs } = await supabase
        .from("documents")
        .select("document_id, filename, type, status, created_at, pages")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })

      sections.push({
        title: "Document History",
        headers: ["ID", "Document", "Type", "Status", "Created"],
        rows: (docs ?? []).map((d) => ({
          cells: [
            d.document_id,
            d.filename,
            d.type,
            d.status,
            new Date(d.created_at).toLocaleDateString("en-US"),
          ],
        })),
      })
      break
    }

    case "incident-analysis": {
      const { data: incidents } = await supabase
        .from("incidents")
        .select("incident_id, severity, incident_date, location, description, metadata")
        .eq("client_id", clientId)
        .order("incident_date", { ascending: false })

      const typed = incidents ?? []

      // Summary by severity
      const severityCounts: Record<string, number> = {}
      for (const inc of typed) {
        severityCounts[inc.severity] = (severityCounts[inc.severity] ?? 0) + 1
      }
      sections.push({
        title: "Severity Breakdown",
        headers: ["Severity", "Count"],
        rows: Object.entries(severityCounts).map(([sev, count]) => ({
          cells: [sev, String(count)],
        })),
      })

      // Summary by type
      const typeCounts: Record<string, number> = {}
      for (const inc of typed) {
        const t = (inc.metadata as Record<string, unknown>)?.type as string | undefined
        const typeLabel = t ?? "other"
        typeCounts[typeLabel] = (typeCounts[typeLabel] ?? 0) + 1
      }
      sections.push({
        title: "Incidents by Type",
        headers: ["Type", "Count"],
        rows: Object.entries(typeCounts).map(([type, count]) => ({
          cells: [type, String(count)],
        })),
      })

      sections.push({
        title: "All Incidents",
        headers: ["ID", "Date", "Severity", "Location", "Description"],
        rows: typed.map((i) => ({
          cells: [
            i.incident_id,
            i.incident_date ? new Date(i.incident_date).toLocaleDateString("en-US") : "—",
            i.severity,
            i.location ?? "—",
            (i.description ?? "").slice(0, 50),
          ],
        })),
      })
      break
    }

    case "delivery-log": {
      const { data: docs } = await supabase
        .from("documents")
        .select("document_id, filename, type, status, storage_url, created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })

      sections.push({
        title: "Delivery Log",
        headers: ["ID", "Document", "Type", "Status", "Delivered"],
        rows: (docs ?? []).map((d) => ({
          cells: [
            d.document_id,
            d.filename,
            d.type,
            d.status,
            new Date(d.created_at).toLocaleDateString("en-US"),
          ],
        })),
      })
      break
    }
  }

  return { businessName, sections }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const reportType = request.nextUrl.searchParams.get("type") ?? ""
  const format = request.nextUrl.searchParams.get("format") ?? "pdf"

  if (!isValidReportType(reportType)) {
    return NextResponse.json(
      {
        error: `Invalid report type. Use one of: ${VALID_REPORT_TYPES.join(", ")}`,
      },
      { status: 400 }
    )
  }

  if (format !== "pdf") {
    return NextResponse.json(
      { error: "Only PDF format is supported for reports." },
      { status: 400 }
    )
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!client) {
    return NextResponse.json({ error: "No client profile found" }, { status: 404 })
  }

  try {
    const { businessName, sections } = await getReportData(supabase, client.id, reportType)
    const title = REPORT_TITLES[reportType]
    const pdfBytes = await buildReportPDF(title, businessName, sections)

    const filename = `${reportType}-report.pdf`
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error(`[export/report] Failed to generate ${reportType} report:`, err)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
