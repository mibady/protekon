import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MARGIN = 50
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

const BRAND = {
  midnight: rgb(0.1, 0.1, 0.18),
  crimson: rgb(0.725, 0.11, 0.11),
  gold: rgb(0.835, 0.686, 0.322),
  steel: rgb(0.5, 0.5, 0.55),
  parchment: rgb(0.96, 0.953, 0.937),
}

const verticalSections: Record<string, { title: string; items: string[] }[]> = {
  construction: [
    { title: "OSHA Compliance", items: ["Cal/OSHA Title 8 adherence", "Injury & Illness Prevention Program (IIPP)", "Heat Illness Prevention compliance", "Fall protection protocols"] },
    { title: "Jobsite Safety Protocols", items: ["Daily safety briefings", "PPE requirements by task", "Hazard communication program", "Emergency evacuation procedures"] },
    { title: "Subcontractor Requirements", items: ["Insurance verification", "Safety record review", "Pre-qualification assessments", "Joint safety responsibilities"] },
  ],
  healthcare: [
    { title: "HIPAA Compliance", items: ["Privacy Rule adherence", "Security Rule implementation", "Breach notification procedures", "Minimum necessary standard"] },
    { title: "PHI Handling", items: ["Access controls and audit trails", "Encryption requirements", "Disposal procedures", "Training and awareness"] },
    { title: "BAA Requirements", items: ["Business Associate Agreements", "Vendor risk assessment", "Subcontractor chain compliance", "Termination provisions"] },
  ],
  "real-estate": [
    { title: "Property Portfolio Compliance", items: ["Building code adherence", "Fire safety inspections", "ADA accessibility requirements", "Environmental compliance"] },
    { title: "Municipal Ordinances", items: ["Local permit requirements", "Zoning compliance", "Noise and nuisance regulations", "Tenant protection laws"] },
    { title: "Liability Management", items: ["Insurance coverage review", "Incident documentation", "Vendor liability agreements", "Risk assessment protocols"] },
  ],
  manufacturing: [
    { title: "Equipment Safety", items: ["Machine guarding program", "Lockout/Tagout procedures (8 CCR 3314)", "Pressure vessel inspections", "Electrical safety protocols"] },
    { title: "Chemical Management", items: ["Hazard communication program", "SDS management", "Chemical inventory tracking", "Spill response procedures"] },
    { title: "Training Compliance", items: ["LOTO certification records", "Equipment operator training", "PPE requirements by task", "Annual refresher schedules"] },
  ],
  hospitality: [
    { title: "Health & Safety Inspections", items: ["Health department inspection readiness", "Fire safety compliance", "Food handling certifications", "Sanitation protocols"] },
    { title: "Guest Safety", items: ["Incident reporting procedures", "ADA accessibility compliance", "Emergency evacuation plans", "Pool/spa safety (if applicable)"] },
    { title: "Employee Safety", items: ["Bloodborne pathogen training", "Slip/trip/fall prevention", "Hazard communication", "PPE requirements"] },
  ],
  agriculture: [
    { title: "Heat Illness Prevention", items: ["Heat Illness Prevention Plan (8 CCR 3395)", "Water provision verification", "Shade structure compliance", "High-heat procedures (>=95F)"] },
    { title: "Field Safety", items: ["Pesticide safety and CalEPA compliance", "Equipment operation training", "Field sanitation facilities", "Emergency response procedures"] },
    { title: "Crew Management", items: ["Crew supervisor safety training", "Portable ladder safety (8 CCR 3457)", "Youth labor compliance", "Housing standards (if applicable)"] },
  ],
  retail: [
    { title: "Store Compliance", items: ["Fire safety and exit compliance", "ADA accessibility requirements", "Hazard communication program", "Emergency action plan"] },
    { title: "Employee Safety", items: ["IIPP implementation (8 CCR 3203)", "Ergonomics for repetitive tasks", "Workplace violence prevention (SB 553)", "Seasonal worker training"] },
    { title: "Inventory Safety", items: ["Material handling procedures", "Shelf stacking and storage limits", "Chemical product storage", "Forklift safety (if applicable)"] },
  ],
  wholesale: [
    { title: "Warehouse Safety", items: ["Forklift/PIT safety (8 CCR 3668F)", "Loading dock procedures", "Rack inspection program", "Floor marking and aisle clearance"] },
    { title: "Hazmat Management", items: ["Hazardous material storage", "Chemical inventory and SDS", "Spill containment procedures", "PPE requirements by zone"] },
    { title: "Operator Compliance", items: ["Forklift operator certification", "Machine guarding (8 CCR 3314)", "LOTO procedures", "Annual safety training"] },
  ],
  transportation: [
    { title: "Fleet Compliance", items: ["DOT inspection readiness", "Vehicle maintenance logs", "Pre-trip inspection procedures", "Hours of service tracking"] },
    { title: "Driver Certifications", items: ["CDL status monitoring", "Medical certificate tracking", "Drug and alcohol testing program", "Defensive driving training"] },
    { title: "Safety Programs", items: ["Accident/incident reporting", "Hazmat transport compliance", "Fatigue management program", "Vehicle emergency equipment"] },
  ],
}

// Document-type-specific templates with legally mandated sections
const documentTemplateSections: Record<string, { title: string; items: string[] }[]> = {
  "bbp-exposure-control": [
    { title: "Exposure Determination (§5193(c))", items: ["Job classifications with occupational exposure", "Tasks and procedures where exposure occurs", "List of employees in each classification"] },
    { title: "Schedule & Methods of Implementation (§5193(d))", items: ["Hepatitis B vaccination program", "Post-exposure evaluation and follow-up procedures", "Communication of hazards to employees", "Engineering and work practice controls", "Housekeeping procedures"] },
    { title: "Hepatitis B Vaccination (§5193(f))", items: ["Vaccination offered within 10 working days of assignment", "Post-exposure prophylaxis procedures", "Declination form documentation", "Booster dose procedures"] },
    { title: "Post-Exposure Evaluation (§5193(g))", items: ["Source individual testing and identification", "Exposed employee blood collection and testing", "Healthcare professional evaluation", "Written opinion within 15 days"] },
    { title: "Recordkeeping (§5193(j))", items: ["Medical records — employee + 30 years", "Training records — 3 years", "Sharps injury log maintenance", "Annual review of exposure control plan"] },
  ],
  "habitability-report": [
    { title: "Building Systems Compliance", items: ["Plumbing — hot/cold water, drainage, sewage (Civil Code §1941.1)", "Heating — adequate heating facilities", "Electrical — lighting and wiring in good working order", "Weatherproofing — roof, walls, windows, doors"] },
    { title: "Health & Safety Standards", items: ["Smoke detectors — operable in each unit (HSC §13113.8)", "Carbon monoxide detectors — required per HSC §17926", "Lead-based paint disclosure (units pre-1978)", "Mold remediation per HSC §26147-26148"] },
    { title: "Tenant Protection (AB 1482)", items: ["Rent cap compliance — 5% + CPI (max 10%)", "Just cause eviction documentation", "Relocation assistance when required", "Anti-retaliation protections (Civil Code §1942.5)"] },
    { title: "ADA & Accessibility", items: ["Common area accessibility assessment", "Reasonable modification request procedures", "Fair housing accommodation log", "Annual accessibility review schedule"] },
  ],
  "fleet-safety-program": [
    { title: "Driver Qualification (49 CFR 391)", items: ["CDL status verification and monitoring", "Medical certificate tracking (24-month cycle)", "Motor Vehicle Record (MVR) annual review", "Pre-employment drug/alcohol testing (49 CFR 382)"] },
    { title: "Vehicle Maintenance (49 CFR 396)", items: ["Systematic inspection, repair, and maintenance program", "Pre-trip and post-trip inspection procedures (49 CFR 396.13)", "Vehicle condition report documentation", "Brake inspector qualifications (49 CFR 396.25)"] },
    { title: "Hours of Service (49 CFR 395)", items: ["ELD compliance and monitoring", "11-hour driving / 14-hour on-duty limits", "30-minute break requirement", "Sleeper berth provisions (if applicable)"] },
    { title: "Accident & Incident Management", items: ["DOT-reportable accident procedures", "Post-accident drug/alcohol testing (49 CFR 382.303)", "Accident register maintenance (49 CFR 390.15)", "Corrective action and root cause analysis"] },
  ],
  "loto-procedures": [
    { title: "Energy Control Program (8 CCR 3314)", items: ["Written energy control procedures per machine/equipment", "Lockout/tagout device specifications", "Authorized vs affected employee identification", "Exclusive control provisions"] },
    { title: "Lockout/Tagout Sequence", items: ["Step 1: Notify affected employees", "Step 2: Shut down equipment using normal procedures", "Step 3: Isolate energy sources (electrical, hydraulic, pneumatic, thermal, chemical)", "Step 4: Apply lockout/tagout devices", "Step 5: Verify isolation — attempt restart", "Step 6: Perform maintenance/service"] },
    { title: "Restoration Procedures", items: ["Inspect work area — tools/items removed", "Verify all employees clear of equipment", "Remove lockout/tagout devices (only by authorized installer)", "Notify affected employees of restoration", "Re-energize and test equipment"] },
    { title: "Periodic Inspection & Training", items: ["Annual inspection of energy control procedures", "Inspector must not be the authorized employee being inspected", "Retraining when procedures change or deficiencies found", "Certification records — inspector name, date, employees, machine"] },
  ],
}

const defaultSections = [
  { title: "Workplace Safety", items: ["Injury & Illness Prevention Program (IIPP)", "SB 553 Workplace Violence Prevention Plan", "Emergency Action Plan", "Hazard Communication Program"] },
  { title: "Regulatory Compliance", items: ["Cal/OSHA standards adherence", "Regulatory change monitoring", "Document version control", "Annual compliance review"] },
  { title: "Training & Documentation", items: ["Employee training records", "Safety meeting documentation", "Incident reporting procedures", "Record retention policies"] },
]

function wrapText(text: string, font: Awaited<ReturnType<PDFDocument["embedFont"]>>, fontSize: number, maxWidth: number): string[] {
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

function addFooter(page: ReturnType<PDFDocument["addPage"]>, font: Awaited<ReturnType<PDFDocument["embedFont"]>>, pageNum: number, totalPages: number) {
  const text = `Protekon Compliance Report  |  Page ${pageNum} of ${totalPages}`
  const width = font.widthOfTextAtSize(text, 8)
  page.drawText(text, {
    x: (PAGE_WIDTH - width) / 2,
    y: 25,
    size: 8,
    font,
    color: BRAND.steel,
  })
}

export async function generateCompliancePDF(options: {
  businessName: string
  documentType: string
  vertical: string
  documentId: string
  complianceScore: number
  riskLevel: string
  auditCount: number
  incidentCount: number
  aiContent?: { title: string; sections: { heading: string; body: string }[]; recommendations: string[] }
}): Promise<{ buffer: Uint8Array; pages: number }> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const generatedDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  // --- Cover Page ---
  const cover = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

  // Header band
  cover.drawRectangle({ x: 0, y: PAGE_HEIGHT - 120, width: PAGE_WIDTH, height: 120, color: BRAND.midnight })
  cover.drawText("PROTEKON", { x: MARGIN, y: PAGE_HEIGHT - 55, size: 28, font: fontBold, color: BRAND.parchment })
  cover.drawText("Compliance Report", { x: MARGIN, y: PAGE_HEIGHT - 80, size: 14, font, color: BRAND.gold })

  // Accent line
  cover.drawRectangle({ x: MARGIN, y: PAGE_HEIGHT - 180, width: 60, height: 3, color: BRAND.crimson })

  // Document info
  let y = PAGE_HEIGHT - 210
  cover.drawText(options.businessName, { x: MARGIN, y, size: 24, font: fontBold, color: BRAND.midnight })
  y -= 35
  const typeLines = wrapText(options.documentType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), font, 16, CONTENT_WIDTH)
  for (const line of typeLines) {
    cover.drawText(line, { x: MARGIN, y, size: 16, font, color: BRAND.steel })
    y -= 22
  }
  y -= 20
  cover.drawText(`Document ID: ${options.documentId}`, { x: MARGIN, y, size: 10, font, color: BRAND.steel })
  y -= 16
  cover.drawText(`Generated: ${generatedDate}`, { x: MARGIN, y, size: 10, font, color: BRAND.steel })

  // --- Compliance Summary Page ---
  const summary = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  y = PAGE_HEIGHT - MARGIN - 30

  summary.drawText("Compliance Summary", { x: MARGIN, y, size: 20, font: fontBold, color: BRAND.midnight })
  y -= 40

  // Score box
  const scoreColor = options.riskLevel === "low" ? rgb(0.16, 0.64, 0.29) : options.riskLevel === "medium" ? rgb(0.79, 0.54, 0.02) : BRAND.crimson
  summary.drawRectangle({ x: MARGIN, y: y - 60, width: CONTENT_WIDTH, height: 70, color: BRAND.parchment })
  summary.drawText(`${options.complianceScore}%`, { x: MARGIN + 20, y: y - 15, size: 36, font: fontBold, color: scoreColor })
  summary.drawText(`Risk Level: ${options.riskLevel.toUpperCase()}`, { x: MARGIN + 140, y: y - 10, size: 12, font: fontBold, color: scoreColor })
  summary.drawText(`Compliance Score`, { x: MARGIN + 140, y: y - 30, size: 10, font, color: BRAND.steel })
  y -= 90

  // Stats
  const stats = [
    { label: "Completed Audits", value: String(options.auditCount) },
    { label: "Recorded Incidents", value: String(options.incidentCount) },
    { label: "Industry Vertical", value: options.vertical.charAt(0).toUpperCase() + options.vertical.slice(1) },
  ]
  for (const stat of stats) {
    summary.drawText(stat.label, { x: MARGIN, y, size: 10, font, color: BRAND.steel })
    summary.drawText(stat.value, { x: MARGIN + 200, y, size: 10, font: fontBold, color: BRAND.midnight })
    y -= 20
  }
  y -= 20

  // Recommendations
  summary.drawText("Recommendations", { x: MARGIN, y, size: 14, font: fontBold, color: BRAND.midnight })
  y -= 25
  const recs = options.riskLevel === "high"
    ? ["Immediate compliance gap assessment required", "Schedule Cal/OSHA consultation within 30 days", "Implement missing safety documentation", "Conduct all-hands safety training"]
    : options.riskLevel === "medium"
      ? ["Review and update existing compliance documents", "Address identified gaps within 60 days", "Schedule quarterly compliance reviews", "Enhance employee training program"]
      : ["Maintain current compliance posture", "Continue regular document updates", "Annual comprehensive audit recommended", "Monitor regulatory changes"]
  for (const rec of recs) {
    summary.drawText(`\u2022  ${rec}`, { x: MARGIN + 10, y, size: 10, font, color: BRAND.midnight })
    y -= 18
  }

  // --- Vertical Content Page ---
  const content = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  y = PAGE_HEIGHT - MARGIN - 30

  const sections = documentTemplateSections[options.documentType] ?? verticalSections[options.vertical] ?? defaultSections
  content.drawText("Compliance Requirements", { x: MARGIN, y, size: 20, font: fontBold, color: BRAND.midnight })
  y -= 10

  for (const section of sections) {
    y -= 30
    content.drawRectangle({ x: MARGIN, y: y - 2, width: 40, height: 2, color: BRAND.crimson })
    content.drawText(section.title, { x: MARGIN + 50, y, size: 13, font: fontBold, color: BRAND.midnight })
    y -= 25
    for (const item of section.items) {
      const itemLines = wrapText(`\u2022  ${item}`, font, 10, CONTENT_WIDTH - 20)
      for (const line of itemLines) {
        content.drawText(line, { x: MARGIN + 15, y, size: 10, font, color: BRAND.midnight })
        y -= 16
      }
    }
  }

  // --- AI-Generated Content Pages (if available) ---
  if (options.aiContent) {
    for (const section of options.aiContent.sections) {
      // Check if we need a new page
      if (y < 150) {
        const newPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        y = PAGE_HEIGHT - MARGIN - 30
        // Use the new page for drawing
        const currentPage = doc.getPages()[doc.getPageCount() - 1]
        currentPage.drawText(section.heading, { x: MARGIN, y, size: 14, font: fontBold, color: BRAND.midnight })
      } else {
        y -= 30
        content.drawRectangle({ x: MARGIN, y: y - 2, width: 40, height: 2, color: BRAND.crimson })
        content.drawText(section.heading, { x: MARGIN + 50, y, size: 13, font: fontBold, color: BRAND.midnight })
      }
      y -= 25

      // Render body text with word wrapping
      const bodyLines = wrapText(section.body, font, 10, CONTENT_WIDTH - 20)
      for (const line of bodyLines) {
        if (y < 50) {
          const newPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
          y = PAGE_HEIGHT - MARGIN - 30
          newPage.drawText(section.heading + " (continued)", { x: MARGIN, y, size: 12, font: fontBold, color: BRAND.steel })
          y -= 25
        }
        const currentPage = doc.getPages()[doc.getPageCount() - 1]
        currentPage.drawText(line, { x: MARGIN + 15, y, size: 10, font, color: BRAND.midnight })
        y -= 14
      }
    }

    // AI Recommendations section
    if (options.aiContent.recommendations.length > 0) {
      if (y < 150) {
        doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        y = PAGE_HEIGHT - MARGIN - 30
      }
      y -= 30
      const lastPage = doc.getPages()[doc.getPageCount() - 1]
      lastPage.drawRectangle({ x: MARGIN, y: y - 2, width: 40, height: 2, color: BRAND.gold })
      lastPage.drawText("AI-Generated Recommendations", { x: MARGIN + 50, y, size: 13, font: fontBold, color: BRAND.midnight })
      y -= 25
      for (const rec of options.aiContent.recommendations) {
        const recLines = wrapText(`\u2022  ${rec}`, font, 10, CONTENT_WIDTH - 20)
        for (const line of recLines) {
          if (y < 50) {
            doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
            y = PAGE_HEIGHT - MARGIN - 30
          }
          const pg = doc.getPages()[doc.getPageCount() - 1]
          pg.drawText(line, { x: MARGIN + 15, y, size: 10, font, color: BRAND.midnight })
          y -= 16
        }
      }
    }
  }

  // Add footers
  const totalPages = doc.getPageCount()
  const pages = doc.getPages()
  for (let i = 0; i < totalPages; i++) {
    addFooter(pages[i], font, i + 1, totalPages)
  }

  const buffer = await doc.save()
  return { buffer, pages: totalPages }
}
