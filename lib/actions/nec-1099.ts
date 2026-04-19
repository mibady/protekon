"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireRole, RoleError } from "@/lib/auth/roles"

// ============================================================
// Types
// ============================================================

export type VendorPayment = {
  id: string
  sub_id: string
  payment_date: string
  amount: number
  category: string | null
  tax_year: number
  source: string
  external_id: string | null
  notes: string | null
  sub_company_name?: string
}

export type YearRow = {
  sub_id: string
  company_name: string
  total: number
  ein: string | null
  status: "flagged" | "below"
  payment_count: number
}

export type ActionResult = {
  success?: boolean
  error?: string
  id?: string
}

export type ImportResult = {
  success?: boolean
  error?: string
  imported: number
  skipped: number
}

// ============================================================
// 1099-NEC threshold
// ============================================================

const NEC_THRESHOLD = 600

// ============================================================
// Reads
// ============================================================

/**
 * Lists vendor payments for the current client, optionally filtered by tax_year.
 * Includes sub_company_name via a secondary construction_subs query.
 */
export async function listVendorPayments(
  taxYear?: number
): Promise<VendorPayment[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from("vendor_payments")
    .select(
      "id, sub_id, payment_date, amount, category, tax_year, source, external_id, notes"
    )
    .order("payment_date", { ascending: false })

  if (typeof taxYear === "number") query = query.eq("tax_year", taxYear)

  const { data: payments, error } = await query
  if (error || !payments) return []

  const subIds = Array.from(new Set(payments.map((p) => p.sub_id)))
  let nameMap = new Map<string, string>()
  if (subIds.length > 0) {
    const { data: subs } = await supabase
      .from("construction_subs")
      .select("id, company_name")
      .in("id", subIds)
    nameMap = new Map((subs ?? []).map((s) => [s.id, s.company_name]))
  }

  return payments.map((p) => ({
    id: p.id,
    sub_id: p.sub_id,
    payment_date: p.payment_date,
    amount: Number(p.amount),
    category: p.category,
    tax_year: p.tax_year,
    source: p.source,
    external_id: p.external_id,
    notes: p.notes,
    sub_company_name: nameMap.get(p.sub_id),
  }))
}

/**
 * Aggregates vendor payments for a given tax year per sub.
 * Flags subs with total >= $600 (1099-NEC reporting threshold).
 * EIN is pulled from the latest sub_onboarding_submissions row for that sub
 * (construction_subs does not carry EIN natively).
 */
export async function getYearSummary(taxYear: number): Promise<YearRow[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: payments } = await supabase
    .from("vendor_payments")
    .select("sub_id, amount")
    .eq("tax_year", taxYear)

  if (!payments || payments.length === 0) return []

  // Tally totals + counts per sub
  const totals = new Map<string, { total: number; count: number }>()
  for (const p of payments) {
    const cur = totals.get(p.sub_id) ?? { total: 0, count: 0 }
    cur.total += Number(p.amount)
    cur.count += 1
    totals.set(p.sub_id, cur)
  }

  const subIds = Array.from(totals.keys())
  if (subIds.length === 0) return []

  // Company names
  const { data: subs } = await supabase
    .from("construction_subs")
    .select("id, company_name")
    .in("id", subIds)
  const nameMap = new Map((subs ?? []).map((s) => [s.id, s.company_name]))

  // Latest EIN per sub from onboarding submissions (RLS-scoped)
  const { data: submissions } = await supabase
    .from("sub_onboarding_submissions")
    .select("sub_id, ein, created_at")
    .in("sub_id", subIds)
    .not("ein", "is", null)
    .order("created_at", { ascending: false })

  const einMap = new Map<string, string>()
  for (const s of submissions ?? []) {
    if (!s.sub_id) continue
    if (!einMap.has(s.sub_id) && s.ein) einMap.set(s.sub_id, s.ein)
  }

  const rows: YearRow[] = subIds.map((subId) => {
    const agg = totals.get(subId)!
    const total = Number(agg.total.toFixed(2))
    return {
      sub_id: subId,
      company_name: nameMap.get(subId) ?? "(unknown)",
      total,
      ein: einMap.get(subId) ?? null,
      status: total >= NEC_THRESHOLD ? "flagged" : "below",
      payment_count: agg.count,
    }
  })

  // Highest totals first — flagged subs surface to the top
  rows.sort((a, b) => b.total - a.total)
  return rows
}

// ============================================================
// Writes
// ============================================================

/**
 * Adds a single manual vendor payment. Generates an external_id so the row
 * participates in the (sub_id, external_id) idempotency key.
 */
export async function addPayment(formData: FormData): Promise<ActionResult> {
  try {
    const { clientId } = await requireRole(["owner", "compliance_manager"])
    const admin = createAdminClient()

    const subId = (formData.get("sub_id") as string)?.trim()
    const paymentDate = (formData.get("payment_date") as string)?.trim()
    const amountRaw = (formData.get("amount") as string)?.trim()
    const category =
      (formData.get("category") as string)?.trim() || null
    const taxYearRaw = (formData.get("tax_year") as string)?.trim()

    if (!subId) return { error: "Sub is required." }
    if (!paymentDate) return { error: "Payment date is required." }
    const amount = Number(amountRaw)
    if (!Number.isFinite(amount) || amount < 0) {
      return { error: "Amount must be a non-negative number." }
    }
    const taxYear = Number(taxYearRaw)
    if (!Number.isInteger(taxYear) || taxYear < 2000 || taxYear > 2100) {
      return { error: "Tax year is invalid." }
    }

    // Defence-in-depth: confirm sub belongs to caller
    const { data: sub } = await admin
      .from("construction_subs")
      .select("id, client_id")
      .eq("id", subId)
      .maybeSingle()
    if (!sub || sub.client_id !== clientId) {
      return { error: "Sub not found." }
    }

    const { data: inserted, error: insErr } = await admin
      .from("vendor_payments")
      .insert({
        sub_id: subId,
        client_id: clientId,
        payment_date: paymentDate,
        amount,
        category,
        tax_year: taxYear,
        source: "manual",
        external_id: `manual_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 10)}`,
      })
      .select("id")
      .single()

    if (insErr || !inserted) {
      return { error: insErr?.message ?? "Could not record payment." }
    }

    await admin.from("audit_log").insert({
      client_id: clientId,
      event_type: "vendor_payment.added",
      description: `Recorded $${amount.toFixed(2)} payment for tax year ${taxYear}`,
      metadata: {
        payment_id: inserted.id,
        sub_id: subId,
        tax_year: taxYear,
        amount,
      },
    })

    return { success: true, id: inserted.id }
  } catch (err) {
    if (err instanceof RoleError) return { error: err.message }
    return { error: err instanceof Error ? err.message : "Unknown error." }
  }
}

// ============================================================
// CSV Import
// ============================================================

/**
 * Minimal CSV parser — handles quoted fields containing commas + escaped
 * double-quotes (""). Strips a BOM if present. Splits on \n or \r\n.
 */
function parseCsv(text: string): string[][] {
  const stripped = text.replace(/^\uFEFF/, "")
  const rows: string[][] = []
  let field = ""
  let row: string[] = []
  let inQuotes = false
  for (let i = 0; i < stripped.length; i++) {
    const c = stripped[i]
    if (inQuotes) {
      if (c === '"') {
        if (stripped[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else if (c === "\r") {
      // swallow — \n will finalise the row
    } else {
      field += c
    }
  }
  // Flush trailing field/row
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((v) => v && v.trim().length > 0))
}

function normaliseHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, "_")
}

/**
 * CSV import for vendor payments. Resolves sub_id by precedence:
 *   1. explicit sub_id column
 *   2. ein lookup against latest sub_onboarding_submissions
 *   3. case-insensitive company_name match against construction_subs
 *
 * Rows that cannot resolve a sub, fail validation, or violate the
 * (sub_id, external_id) uniqueness constraint are skipped + counted.
 *
 * external_id default: `csv_<taxYear>_<rowIndex>_<sub_id>` for repeatable
 * imports (idempotent via the UNIQUE constraint).
 */
export async function importCsv(formData: FormData): Promise<ImportResult> {
  try {
    const { clientId } = await requireRole(["owner", "compliance_manager"])
    const admin = createAdminClient()

    const file = formData.get("file") as File | null
    if (!file || file.size === 0) {
      return { error: "CSV file is required.", imported: 0, skipped: 0 }
    }

    const text = await file.text()
    const rows = parseCsv(text)
    if (rows.length < 2) {
      return {
        error: "CSV must have a header row and at least one data row.",
        imported: 0,
        skipped: 0,
      }
    }

    const headers = rows[0].map(normaliseHeader)
    const col = (name: string) => headers.indexOf(name)
    const idxSubId = col("sub_id")
    const idxEin = col("ein")
    const idxCompanyName = col("company_name")
    const idxPaymentDate = col("payment_date")
    const idxAmount = col("amount")
    const idxCategory = col("category")
    const idxTaxYear = col("tax_year")
    const idxExternalId = col("external_id")

    if (idxPaymentDate === -1 || idxAmount === -1 || idxTaxYear === -1) {
      return {
        error:
          "CSV must include columns: payment_date, amount, tax_year (+ one of sub_id/ein/company_name).",
        imported: 0,
        skipped: 0,
      }
    }
    if (idxSubId === -1 && idxEin === -1 && idxCompanyName === -1) {
      return {
        error:
          "CSV must include at least one of: sub_id, ein, or company_name.",
        imported: 0,
        skipped: 0,
      }
    }

    // Pre-fetch this client's subs once (company_name + id).
    const { data: subs } = await admin
      .from("construction_subs")
      .select("id, company_name")
      .eq("client_id", clientId)
    const subsById = new Map<string, string>()
    const subsByName = new Map<string, string>() // lower-cased → id
    for (const s of subs ?? []) {
      subsById.set(s.id, s.company_name)
      subsByName.set(s.company_name.trim().toLowerCase(), s.id)
    }

    // EIN lookup — latest submission per sub
    const { data: submissions } = await admin
      .from("sub_onboarding_submissions")
      .select("sub_id, ein, created_at")
      .eq("client_id", clientId)
      .not("ein", "is", null)
      .order("created_at", { ascending: false })
    const einToSub = new Map<string, string>()
    for (const s of submissions ?? []) {
      if (!s.sub_id || !s.ein) continue
      const key = s.ein.replace(/\D/g, "")
      if (!key) continue
      if (!einToSub.has(key)) einToSub.set(key, s.sub_id)
    }

    let imported = 0
    let skipped = 0

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r]
      const get = (i: number): string =>
        i >= 0 && i < row.length ? (row[i] ?? "").trim() : ""

      // Resolve sub_id
      let subId: string | null = null
      const explicitSubId = get(idxSubId)
      if (explicitSubId && subsById.has(explicitSubId)) {
        subId = explicitSubId
      } else {
        const einRaw = get(idxEin).replace(/\D/g, "")
        if (!subId && einRaw && einToSub.has(einRaw)) {
          subId = einToSub.get(einRaw)!
        }
        if (!subId) {
          const name = get(idxCompanyName).toLowerCase()
          if (name && subsByName.has(name)) {
            subId = subsByName.get(name)!
          }
        }
      }
      if (!subId) {
        skipped++
        continue
      }

      const paymentDate = get(idxPaymentDate)
      const amount = Number(get(idxAmount))
      const taxYear = Number(get(idxTaxYear))
      const category = get(idxCategory) || null
      const externalIdRaw = get(idxExternalId)

      if (
        !paymentDate ||
        !Number.isFinite(amount) ||
        amount < 0 ||
        !Number.isInteger(taxYear) ||
        taxYear < 2000 ||
        taxYear > 2100
      ) {
        skipped++
        continue
      }

      const externalId =
        externalIdRaw || `csv_${taxYear}_${r}_${subId}`

      const { error: insErr } = await admin.from("vendor_payments").insert({
        sub_id: subId,
        client_id: clientId,
        payment_date: paymentDate,
        amount,
        category,
        tax_year: taxYear,
        source: "csv",
        external_id: externalId,
      })

      if (insErr) {
        // Duplicate (sub_id, external_id) OR check constraint → skip, not fatal
        skipped++
        continue
      }
      imported++
    }

    await admin.from("audit_log").insert({
      client_id: clientId,
      event_type: "vendor_payment.csv_imported",
      description: `Imported ${imported} vendor payment(s) via CSV (${skipped} skipped)`,
      metadata: { imported, skipped },
    })

    return { success: true, imported, skipped }
  } catch (err) {
    if (err instanceof RoleError) {
      return { error: err.message, imported: 0, skipped: 0 }
    }
    return {
      error: err instanceof Error ? err.message : "Unknown error.",
      imported: 0,
      skipped: 0,
    }
  }
}
