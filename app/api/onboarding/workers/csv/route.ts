import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"
import type { WorkerImportRow } from "@/lib/types/onboarding"

export const runtime = "nodejs"
export const maxDuration = 30

type ParseError = { row: number; message: string }

type PreviewResponse = {
  preview: WorkerImportRow[]
  errors: ParseError[]
}

const REQUIRED_HEADERS = ["name"] as const
// Optional headers recognised by the parser: role, hire_date, phone, email.
// Missing optional columns yield `null` for the corresponding field.

/**
 * Minimal RFC-4180-ish CSV parser. Handles quoted fields, escaped quotes
 * ("" inside a quoted field), CRLF line endings, and commas in quoted values.
 * Not a full implementation — papaparse is not installed and we don't want
 * to add a dependency for one route.
 */
function parseCsv(input: string): string[][] {
  const rows: string[][] = []
  let field = ""
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]

    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
      continue
    }

    if (ch === ",") {
      row.push(field)
      field = ""
      continue
    }

    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i++
      row.push(field)
      rows.push(row)
      row = []
      field = ""
      continue
    }

    field += ch
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => r.length > 0 && !(r.length === 1 && r[0] === ""))
}

function normalizeHeader(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "_")
}

function toNullable(value: string | undefined): string | null {
  if (value === undefined) return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidDate(value: string): boolean {
  // ISO-8601 date (YYYY-MM-DD) or anything Date accepts and round-trips.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(value)
    return !Number.isNaN(d.getTime())
  }
  return false
}

export async function POST(request: NextRequest): Promise<NextResponse<PreviewResponse | { error: string }>> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "invalid_multipart" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "file_too_large" }, { status: 413 })
  }

  const text = await file.text()
  const rows = parseCsv(text)

  if (rows.length === 0) {
    return NextResponse.json({ preview: [], errors: [{ row: 0, message: "empty_file" }] })
  }

  const header = rows[0].map(normalizeHeader)
  const missing = REQUIRED_HEADERS.filter((h) => !header.includes(h))
  if (missing.length > 0) {
    return NextResponse.json({
      preview: [],
      errors: [{ row: 1, message: `missing_columns:${missing.join(",")}` }],
    })
  }

  const idx = {
    name: header.indexOf("name"),
    role: header.indexOf("role"),
    hire_date: header.indexOf("hire_date"),
    phone: header.indexOf("phone"),
    email: header.indexOf("email"),
  }

  const preview: WorkerImportRow[] = []
  const errors: ParseError[] = []

  for (let r = 1; r < rows.length; r++) {
    const rowNum = r + 1
    const cols = rows[r]
    const name = toNullable(cols[idx.name])

    if (!name) {
      errors.push({ row: rowNum, message: "name_required" })
      continue
    }

    const email = idx.email >= 0 ? toNullable(cols[idx.email]) : null
    if (email && !isValidEmail(email)) {
      errors.push({ row: rowNum, message: "invalid_email" })
      continue
    }

    const hireDate = idx.hire_date >= 0 ? toNullable(cols[idx.hire_date]) : null
    if (hireDate && !isValidDate(hireDate)) {
      errors.push({ row: rowNum, message: "invalid_hire_date" })
      continue
    }

    preview.push({
      name,
      role: idx.role >= 0 ? toNullable(cols[idx.role]) : null,
      hireDate,
      phone: idx.phone >= 0 ? toNullable(cols[idx.phone]) : null,
      email,
      siteId: null,
    })

    if (preview.length >= 500) {
      errors.push({ row: rowNum, message: "row_limit_reached_500" })
      break
    }
  }

  return NextResponse.json({ preview, errors })
}
