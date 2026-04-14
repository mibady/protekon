import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

type Topic = {
  title: string
  regulation: string
  objective: string
  modules: { heading: string; bullets: string[] }[]
  acknowledgement: string
}

const TOPICS: Record<string, Topic> = {
  "sb-553-wvpp": {
    title: "SB 553 Workplace Violence Prevention Plan — Employee Training",
    regulation: "California Labor Code §6401.9",
    objective:
      "Employees will recognize workplace violence hazards, know how to report incidents or threats, and understand the employer's response and investigation process.",
    modules: [
      {
        heading: "1. What is workplace violence?",
        bullets: [
          "Type 1 — Criminal intent (unrelated to the business)",
          "Type 2 — Customer / client / patient directed at staff",
          "Type 3 — Worker-on-worker",
          "Type 4 — Personal relationship violence brought into the workplace",
        ],
      },
      {
        heading: "2. Recognizing warning signs",
        bullets: [
          "Verbal threats, intimidation, or aggressive body language",
          "Rapid escalation in behavior, substance use signs",
          "Weapons or objects used as weapons on site",
          "Changes in behavior from coworkers or visitors",
        ],
      },
      {
        heading: "3. How to report",
        bullets: [
          "Report any threat, incident, or near-miss immediately to a supervisor",
          "Use the anonymous reporting channel if preferred",
          "No retaliation for reporting in good faith",
          "All reports are logged in the WVPP Incident Log within 24 hours",
        ],
      },
      {
        heading: "4. Your rights under §6401.9",
        bullets: [
          "Request a copy of the incident log at any time — response within 15 days",
          "Participate in hazard assessments and WVPP updates",
          "Access training at no cost during paid hours",
        ],
      },
    ],
    acknowledgement:
      "I acknowledge that I have received and understood SB 553 workplace violence prevention training. I know how to recognize, report, and respond to workplace violence hazards and understand my rights under California Labor Code §6401.9.",
  },
  "iipp": {
    title: "Injury & Illness Prevention Program (IIPP) — Employee Training",
    regulation: "8 CCR §3203",
    objective:
      "Employees will understand the company's IIPP, hazard identification procedures, and how to safely report unsafe conditions.",
    modules: [
      {
        heading: "1. Purpose of the IIPP",
        bullets: [
          "Systematically identify and correct workplace hazards",
          "Ensure compliance with Cal/OSHA §3203 and related standards",
          "Communicate safety expectations to every worker",
        ],
      },
      {
        heading: "2. Identifying hazards",
        bullets: [
          "Walk-through inspections and job hazard analyses",
          "Near-miss and incident reviews",
          "Employee hazard reports",
        ],
      },
      {
        heading: "3. Correcting hazards",
        bullets: [
          "Imminent hazards — stop work, notify supervisor, isolate area",
          "Non-imminent — document and correct within defined timeframe",
          "Track correction to completion in the IIPP log",
        ],
      },
      {
        heading: "4. Your responsibilities",
        bullets: [
          "Follow all safety rules and PPE requirements",
          "Report unsafe conditions and near misses",
          "Participate in scheduled safety training",
        ],
      },
    ],
    acknowledgement:
      "I acknowledge that I have received IIPP training covering hazard identification, reporting, and correction, and understand my responsibilities under 8 CCR §3203.",
  },
  "heat-illness": {
    title: "Heat Illness Prevention — Employee Training",
    regulation: "8 CCR §3395",
    objective:
      "Outdoor and high-heat indoor workers will recognize heat illness, apply prevention measures, and follow emergency response procedures.",
    modules: [
      {
        heading: "1. Recognizing heat illness",
        bullets: [
          "Heat rash, heat cramps, heat exhaustion, heat stroke",
          "Early signs: heavy sweating, dizziness, nausea, confusion",
          "Heat stroke is a medical emergency — call 911",
        ],
      },
      {
        heading: "2. Prevention",
        bullets: [
          "Drink at least one quart of water per hour in high heat",
          "Use shade or cool-down rest areas during breaks",
          "Acclimatize new workers gradually over 14 days",
          "Monitor coworkers — buddy system",
        ],
      },
      {
        heading: "3. Emergency response",
        bullets: [
          "Move affected worker to shade or cool area",
          "Remove heavy clothing, cool with water or ice",
          "Call 911 for suspected heat stroke",
          "Do not leave a heat-ill worker alone",
        ],
      },
    ],
    acknowledgement:
      "I acknowledge that I have received Heat Illness Prevention training and understand how to recognize, prevent, and respond to heat illness on the job.",
  },
  "hazcom": {
    title: "Hazard Communication (HazCom) — Employee Training",
    regulation: "8 CCR §5194",
    objective:
      "Employees will interpret chemical labels, safety data sheets (SDS), and follow safe handling procedures for hazardous chemicals in the workplace.",
    modules: [
      {
        heading: "1. The Hazard Communication Standard",
        bullets: [
          "Right to know about chemicals you may be exposed to",
          "Written HazCom program, chemical inventory, labels, SDS, training",
        ],
      },
      {
        heading: "2. Reading GHS labels",
        bullets: [
          "Product identifier, signal word, pictograms",
          "Hazard statements and precautionary statements",
          "Supplier identification",
        ],
      },
      {
        heading: "3. Safety Data Sheets (SDS)",
        bullets: [
          "16-section standard format",
          "Where to find them in your facility",
          "Using Section 4 (First-aid) and Section 8 (Exposure controls)",
        ],
      },
      {
        heading: "4. Safe handling",
        bullets: [
          "Wear the specified PPE every time",
          "Never transfer chemicals to unlabeled containers",
          "Report spills, leaks, or unlabeled containers immediately",
        ],
      },
    ],
    acknowledgement:
      "I acknowledge that I have received HazCom training and understand how to interpret GHS labels, use SDSs, and safely handle hazardous chemicals per 8 CCR §5194.",
  },
  "forklift": {
    title: "Powered Industrial Truck (Forklift) Operator Training",
    regulation: "8 CCR §3668 / 29 CFR §1910.178",
    objective:
      "Operators will safely inspect, operate, and park powered industrial trucks and recognize site-specific hazards.",
    modules: [
      {
        heading: "1. Pre-operation inspection",
        bullets: [
          "Daily inspection of forks, tires, mast, hydraulics, lights, horn, seatbelt",
          "Document defects — do not operate an unsafe truck",
        ],
      },
      {
        heading: "2. Operating principles",
        bullets: [
          "Load center and capacity limits",
          "Stability triangle — never exceed rated capacity",
          "Travel with forks low, tilted back",
          "Yield to pedestrians always",
        ],
      },
      {
        heading: "3. Site-specific hazards",
        bullets: [
          "Ramps, dock plates, blind corners, rack damage",
          "Indoor vs outdoor truck requirements",
          "Fueling / charging safety",
        ],
      },
      {
        heading: "4. Parking and shutdown",
        bullets: [
          "Forks fully lowered, neutral, brake set, key removed",
          "Never park in front of exits, panels, or fire equipment",
        ],
      },
    ],
    acknowledgement:
      "I acknowledge operator training covering pre-operation inspection, operating principles, site hazards, and parking per 8 CCR §3668 / 29 CFR §1910.178. I understand an evaluation is required before independent operation.",
  },
}

export function listTrainingTopics(): { slug: string; title: string; regulation: string }[] {
  return Object.entries(TOPICS).map(([slug, t]) => ({
    slug,
    title: t.title,
    regulation: t.regulation,
  }))
}

export function getTrainingTopic(slug: string): Topic | null {
  return TOPICS[slug] ?? null
}

function wrap(text: string, font: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>, size: number, maxW: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ""
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (font.widthOfTextAtSize(test, size) > maxW && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

export async function generateTrainingMaterialPDF(slug: string): Promise<{ buffer: Uint8Array; filename: string }> {
  const topic = getTrainingTopic(slug)
  if (!topic) throw new Error("Unknown training topic")

  const doc = await PDFDocument.create()
  const helv = await doc.embedFont(StandardFonts.Helvetica)
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold)
  let page = doc.addPage([612, 792])
  let y = 740
  const left = 54
  const maxW = 504

  const draw = (text: string, size: number, bold = false, colorDark = true) => {
    const font = bold ? helvBold : helv
    for (const line of wrap(text, font, size, maxW)) {
      if (y < 72) {
        page = doc.addPage([612, 792])
        y = 740
      }
      page.drawText(line, { x: left, y, size, font, color: colorDark ? rgb(0.05, 0.07, 0.12) : rgb(0.4, 0.4, 0.45) })
      y -= size + 6
    }
  }

  draw("PROTEKON TRAINING MATERIAL", 10, true, false)
  y -= 4
  draw(topic.title, 18, true)
  y -= 6
  draw(topic.regulation, 10, false, false)
  y -= 12
  draw("Objective", 12, true)
  draw(topic.objective, 11)
  y -= 8

  for (const m of topic.modules) {
    y -= 6
    draw(m.heading, 13, true)
    for (const b of m.bullets) {
      draw(`• ${b}`, 11)
    }
  }

  y -= 12
  draw("Employee Acknowledgement", 12, true)
  draw(topic.acknowledgement, 11)
  y -= 28
  draw("Employee name: ___________________________________________", 11)
  y -= 8
  draw("Signature: ______________________________   Date: _______________", 11)

  const buffer = await doc.save()
  return { buffer, filename: `training-${slug}.pdf` }
}

export async function generateSignoffSheetPDF(params: {
  employeeName: string
  trainingType: string
  completedAt: string | null
  dueDate: string
  businessName: string
}): Promise<{ buffer: Uint8Array; filename: string }> {
  const doc = await PDFDocument.create()
  const helv = await doc.embedFont(StandardFonts.Helvetica)
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const page = doc.addPage([612, 792])
  const left = 54
  let y = 740

  page.drawText("TRAINING COMPLETION — EMPLOYEE SIGN-OFF", { x: left, y, size: 14, font: helvBold, color: rgb(0.05, 0.07, 0.12) })
  y -= 24
  page.drawText(params.businessName, { x: left, y, size: 11, font: helv, color: rgb(0.4, 0.4, 0.45) })
  y -= 32

  const rows: [string, string][] = [
    ["Employee", params.employeeName],
    ["Training topic", params.trainingType],
    ["Assigned due date", params.dueDate],
    ["Completion status", params.completedAt ? `Completed ${new Date(params.completedAt).toLocaleDateString()}` : "Pending"],
  ]
  for (const [label, value] of rows) {
    page.drawText(label, { x: left, y, size: 10, font: helvBold, color: rgb(0.05, 0.07, 0.12) })
    page.drawText(value, { x: left + 140, y, size: 11, font: helv, color: rgb(0.05, 0.07, 0.12) })
    y -= 20
  }

  y -= 20
  page.drawText("Attestation", { x: left, y, size: 12, font: helvBold })
  y -= 18
  const att =
    "I attest that I received the training identified above, had the opportunity to ask questions, " +
    "and understand my responsibilities. I will follow the procedures covered during training."
  for (const line of wrap(att, helv, 11, 504)) {
    page.drawText(line, { x: left, y, size: 11, font: helv, color: rgb(0.05, 0.07, 0.12) })
    y -= 16
  }

  y -= 30
  page.drawText("Employee signature: ___________________________________________", { x: left, y, size: 11, font: helv })
  y -= 26
  page.drawText("Printed name: _____________________________________   Date: _______________", { x: left, y, size: 11, font: helv })
  y -= 40
  page.drawText("Trainer / supervisor signature: _______________________________________", { x: left, y, size: 11, font: helv })
  y -= 26
  page.drawText("Printed name: _____________________________________   Date: _______________", { x: left, y, size: 11, font: helv })

  const buffer = await doc.save()
  const slug = params.trainingType.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  return { buffer, filename: `signoff-${slug}-${params.employeeName.replace(/\s+/g, "-")}.pdf` }
}
