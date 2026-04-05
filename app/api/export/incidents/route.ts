import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import type { Incident } from "@/lib/types"

const VALID_FORMATS = ["csv", "pdf"] as const
type ExportFormat = (typeof VALID_FORMATS)[number]

function isValidFormat(value: string): value is ExportFormat {
  return VALID_FORMATS.includes(value as ExportFormat)
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function buildCSV(incidents: Incident[]): string {
  const headers = [
    "Incident ID",
    "Date",
    "Type",
    "Severity",
    "Location",
    "Description",
    "Injury Occurred",
    "Medical Treatment",
    "Actions Taken",
    "Created At",
  ]

  const rows = incidents.map((inc) => [
    escapeCSV(inc.incident_id),
    inc.incident_date ?? "",
    inc.metadata?.type ?? "",
    inc.severity,
    inc.location ?? "",
    escapeCSV(inc.description),
    inc.metadata?.injuryOccurred ? "Yes" : "No",
    inc.metadata?.medicalTreatment ? "Yes" : "No",
    escapeCSV(inc.metadata?.actionsTaken ?? ""),
    inc.created_at,
  ])

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}

async function buildPDF(incidents: Incident[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 792 // landscape letter
  const pageHeight = 612
  const margin = 40
  const lineHeight = 16
  const headerHeight = 20

  // Title page
  let page = doc.addPage([pageWidth, pageHeight])
  page.drawText("Incident Export", {
    x: margin,
    y: pageHeight - margin - 30,
    size: 24,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.15),
  })
  page.drawText(`${incidents.length} incidents | Generated ${new Date().toLocaleDateString("en-US")}`, {
    x: margin,
    y: pageHeight - margin - 55,
    size: 11,
    font,
    color: rgb(0.4, 0.4, 0.45),
  })

  // Table headers
  const columns = [
    { label: "ID", x: margin, w: 70 },
    { label: "Date", x: 110, w: 80 },
    { label: "Type", x: 190, w: 80 },
    { label: "Severity", x: 270, w: 70 },
    { label: "Location", x: 340, w: 100 },
    { label: "Description", x: 440, w: 310 },
  ]

  let yPos = pageHeight - margin - 90

  function drawHeaders(p: ReturnType<typeof doc.addPage>, y: number): number {
    for (const col of columns) {
      p.drawText(col.label, {
        x: col.x,
        y,
        size: 9,
        font: fontBold,
        color: rgb(0.3, 0.3, 0.35),
      })
    }
    p.drawLine({
      start: { x: margin, y: y - 4 },
      end: { x: pageWidth - margin, y: y - 4 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    })
    return y - headerHeight
  }

  yPos = drawHeaders(page, yPos)

  for (const inc of incidents) {
    if (yPos < margin + lineHeight) {
      page = doc.addPage([pageWidth, pageHeight])
      yPos = pageHeight - margin
      yPos = drawHeaders(page, yPos)
    }

    const truncDesc =
      inc.description.length > 60
        ? inc.description.slice(0, 57) + "..."
        : inc.description

    const rowData = [
      inc.incident_id,
      inc.incident_date
        ? new Date(inc.incident_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "—",
      inc.metadata?.type ?? "—",
      inc.severity,
      inc.location ?? "—",
      truncDesc,
    ]

    for (let i = 0; i < columns.length; i++) {
      const text = rowData[i].slice(0, Math.floor(columns[i].w / 5))
      page.drawText(text, {
        x: columns[i].x,
        y: yPos,
        size: 9,
        font,
        color: rgb(0.1, 0.1, 0.15),
      })
    }
    yPos -= lineHeight
  }

  return doc.save()
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const format = request.nextUrl.searchParams.get("format") ?? "csv"

  if (!isValidFormat(format)) {
    return NextResponse.json(
      { error: "Invalid format. Use csv or pdf." },
      { status: 400 }
    )
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!client) {
    return NextResponse.json({ error: "No client profile found" }, { status: 404 })
  }

  const { data: incidents, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[export/incidents] Database error:", error.message)
    return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 })
  }

  const typedIncidents = (incidents ?? []) as Incident[]

  if (format === "csv") {
    const csv = buildCSV(typedIncidents)
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="incidents-export.csv"',
      },
    })
  }

  const pdfBytes = await buildPDF(typedIncidents)
  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="incidents-export.pdf"',
    },
  })
}
