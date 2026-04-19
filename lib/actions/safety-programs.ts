"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireRole, RoleError } from "@/lib/auth/roles"
import {
  SAFETY_PROGRAM_TEMPLATES,
  type ProgramType,
  type ProgramStatus,
} from "@/lib/data/safety-program-templates"

// ============================================================
// Types
// ============================================================
// ProgramType / ProgramStatus live in `lib/data/safety-program-templates.ts`
// because "use server" files may only export async functions. Callers that
// need those types should import them from `@/lib/data/safety-program-templates`.

export type SafetyProgram = {
  id: string
  sub_id: string
  program_type: ProgramType
  document_url: string | null
  effective_date: string | null
  last_reviewed_at: string | null
  status: ProgramStatus
  reviewer_notes: string | null
  reviewed_at: string | null
  sub_company_name?: string
}

export type ActionResult = {
  success?: boolean
  error?: string
  id?: string
}

const VALID_PROGRAM_TYPES = new Set<ProgramType>(
  Object.keys(SAFETY_PROGRAM_TEMPLATES) as ProgramType[]
)

// ============================================================
// Reads
// ============================================================

/**
 * Lists all safety programs for the current client, enriched with
 * sub_company_name from construction_subs.
 */
export async function listSafetyPrograms(): Promise<SafetyProgram[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: programs, error } = await supabase
    .from("sub_safety_programs")
    .select(
      "id, sub_id, program_type, document_url, effective_date, last_reviewed_at, status, reviewer_notes, reviewed_at"
    )
    .order("program_type", { ascending: true })

  if (error || !programs) return []

  // JOIN construction_subs for display name
  const subIds = Array.from(new Set(programs.map((p) => p.sub_id)))
  let nameMap = new Map<string, string>()
  if (subIds.length > 0) {
    const { data: subs } = await supabase
      .from("construction_subs")
      .select("id, company_name")
      .in("id", subIds)
    nameMap = new Map((subs ?? []).map((s) => [s.id, s.company_name]))
  }

  return programs.map((p) => ({
    id: p.id,
    sub_id: p.sub_id,
    program_type: p.program_type as ProgramType,
    document_url: p.document_url,
    effective_date: p.effective_date,
    last_reviewed_at: p.last_reviewed_at,
    status: p.status as ProgramStatus,
    reviewer_notes: p.reviewer_notes,
    reviewed_at: p.reviewed_at,
    sub_company_name: nameMap.get(p.sub_id),
  }))
}

// ============================================================
// Writes
// ============================================================

/**
 * Upserts a safety program record for (sub_id, program_type).
 * Updating a program resets status to 'pending' so a reviewer re-approves.
 */
export async function upsertSafetyProgram(
  formData: FormData
): Promise<ActionResult> {
  try {
    const { clientId } = await requireRole(["owner", "compliance_manager"])

    const subId = (formData.get("sub_id") as string)?.trim()
    const programType = (formData.get("program_type") as string)?.trim() as
      | ProgramType
      | ""
    const documentUrl =
      (formData.get("document_url") as string)?.trim() || null
    const effectiveDate =
      (formData.get("effective_date") as string)?.trim() || null

    if (!subId) return { error: "Sub is required." }
    if (!programType || !VALID_PROGRAM_TYPES.has(programType)) {
      return { error: "Invalid program type." }
    }

    const admin = createAdminClient()

    // Confirm sub belongs to caller (defence-in-depth — admin bypasses RLS)
    const { data: sub } = await admin
      .from("construction_subs")
      .select("id, client_id, company_name")
      .eq("id", subId)
      .maybeSingle()
    if (!sub || sub.client_id !== clientId) {
      return { error: "Sub not found." }
    }

    const { data: existing } = await admin
      .from("sub_safety_programs")
      .select("id")
      .eq("sub_id", subId)
      .eq("program_type", programType)
      .maybeSingle()

    if (existing) {
      const { error: updErr } = await admin
        .from("sub_safety_programs")
        .update({
          document_url: documentUrl,
          effective_date: effectiveDate,
          status: "pending",
          reviewer_notes: null,
          reviewed_at: null,
          reviewed_by: null,
        })
        .eq("id", existing.id)
      if (updErr) return { error: updErr.message }

      await admin.from("audit_log").insert({
        client_id: clientId,
        event_type: "safety_program.updated",
        description: `Updated ${programType} for ${sub.company_name}`,
        metadata: { sub_id: subId, program_type: programType },
      })

      return { success: true, id: existing.id }
    }

    const { data: inserted, error: insErr } = await admin
      .from("sub_safety_programs")
      .insert({
        sub_id: subId,
        client_id: clientId,
        program_type: programType,
        document_url: documentUrl,
        effective_date: effectiveDate,
        status: "pending",
      })
      .select("id")
      .single()

    if (insErr || !inserted) {
      return { error: insErr?.message ?? "Could not save program." }
    }

    await admin.from("audit_log").insert({
      client_id: clientId,
      event_type: "safety_program.created",
      description: `Added ${programType} for ${sub.company_name}`,
      metadata: {
        sub_id: subId,
        program_type: programType,
        program_id: inserted.id,
      },
    })

    return { success: true, id: inserted.id }
  } catch (err) {
    if (err instanceof RoleError) return { error: err.message }
    return { error: err instanceof Error ? err.message : "Unknown error." }
  }
}

/**
 * Reviewer decision on a submitted safety program.
 */
export async function reviewSafetyProgram(
  id: string,
  decision: "approved" | "rejected",
  notes?: string
): Promise<ActionResult> {
  try {
    const { userId, clientId } = await requireRole([
      "owner",
      "compliance_manager",
    ])
    const admin = createAdminClient()

    if (decision !== "approved" && decision !== "rejected") {
      return { error: "Invalid decision." }
    }

    const { data: prog, error: fetchErr } = await admin
      .from("sub_safety_programs")
      .select("id, client_id, program_type, sub_id")
      .eq("id", id)
      .maybeSingle()

    if (fetchErr) return { error: fetchErr.message }
    if (!prog || prog.client_id !== clientId) {
      return { error: "Program not found." }
    }

    const now = new Date().toISOString()
    const { error: updErr } = await admin
      .from("sub_safety_programs")
      .update({
        status: decision,
        reviewer_notes: notes?.trim() || null,
        reviewed_at: now,
        reviewed_by: userId,
        last_reviewed_at: now,
      })
      .eq("id", id)

    if (updErr) return { error: updErr.message }

    await admin.from("audit_log").insert({
      client_id: clientId,
      event_type: `safety_program.${decision}`,
      description: `${decision === "approved" ? "Approved" : "Rejected"} ${prog.program_type}`,
      metadata: {
        program_id: id,
        sub_id: prog.sub_id,
        program_type: prog.program_type,
        notes: notes?.trim() || null,
      },
    })

    return { success: true }
  } catch (err) {
    if (err instanceof RoleError) return { error: err.message }
    return { error: err instanceof Error ? err.message : "Unknown error." }
  }
}
