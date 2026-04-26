"use server"

import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { configureAutomations } from "@/lib/actions/onboarding/automations"
import { getOnboardingState, markComplete } from "@/lib/actions/onboarding/state"
import type {
  ActionResult,
  ApproveImportedDocumentInput,
  AdoptTemplateInput,
  DocumentStepActionResult,
  MarkDocumentSkippedInput,
} from "@/lib/types/onboarding"

const categorySchema = z.string().min(1).max(64)
const uuidSchema = z.string().uuid()

type DocumentRowSelection = {
  id: string
  type: string
}

function documentId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix.toUpperCase()}-${Date.now()}-${rand}`
}

/**
 * Approve a document that was previously uploaded/imported (status='requested'
 * or similar) and flip it to 'approved'. Used by Step 6 "Needs eye" column.
 */
export async function approveImportedDocument(
  input: ApproveImportedDocumentInput,
): Promise<DocumentStepActionResult> {
  if (!uuidSchema.safeParse(input.documentId).success) {
    return { ok: false, error: "invalid_document_id" }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()

  if (authErr || !user) {
    return { ok: false, error: "unauthenticated" }
  }

  const { data: updated, error } = await supabase
    .from("documents")
    .update({ status: "approved" })
    .eq("id", input.documentId)
    .eq("client_id", user.id)
    .select("id, type")
    .single<DocumentRowSelection>()

  if (error || !updated) {
    return { ok: false, error: error?.message ?? "update_failed" }
  }

  return {
    ok: true,
    data: { documentId: updated.id, category: updated.type },
  }
}

/**
 * Adopt a template for a required doc category. Phase 1A stub: inserts a
 * placeholder row with status='generated'. Phase 2 will call into the
 * document-generation Inngest flow to materialise the file.
 */
export async function adoptTemplate(
  input: AdoptTemplateInput,
): Promise<DocumentStepActionResult> {
  const parsed = categorySchema.safeParse(input.category)
  if (!parsed.success) {
    return { ok: false, error: "invalid_category" }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()

  if (authErr || !user) {
    return { ok: false, error: "unauthenticated" }
  }

  const category = parsed.data
  const { data: inserted, error } = await supabase
    .from("documents")
    .insert({
      client_id: user.id,
      document_id: documentId(category.slice(0, 6)),
      type: category,
      filename: `${category}-template.pdf`,
      storage_url: null,
      status: "generated",
      notes: "Adopted from template library during onboarding.",
      priority: "standard",
    })
    .select("id, type")
    .single<DocumentRowSelection>()

  if (error || !inserted) {
    return { ok: false, error: error?.message ?? "insert_failed" }
  }

  return {
    ok: true,
    data: { documentId: inserted.id, category: inserted.type },
  }
}

/**
 * Mark a required category as intentionally skipped. Creates a stub row so
 * the scoring/intake pipeline can factor the gap in.
 */
export async function markDocumentSkipped(
  input: MarkDocumentSkippedInput,
): Promise<DocumentStepActionResult> {
  const parsed = categorySchema.safeParse(input.category)
  if (!parsed.success) {
    return { ok: false, error: "invalid_category" }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()

  if (authErr || !user) {
    return { ok: false, error: "unauthenticated" }
  }

  const category = parsed.data
  const { data: inserted, error } = await supabase
    .from("documents")
    .insert({
      client_id: user.id,
      document_id: documentId(`skip-${category.slice(0, 4)}`),
      type: category,
      filename: `${category}-skipped.txt`,
      storage_url: null,
      status: "skipped",
      notes: input.reason ?? "Skipped during onboarding.",
      priority: "low",
    })
    .select("id, type")
    .single<DocumentRowSelection>()

  if (error || !inserted) {
    return { ok: false, error: error?.message ?? "insert_failed" }
  }

  return {
    ok: true,
    data: { documentId: inserted.id, category: inserted.type },
  }
}

export async function finalizeOnboarding(): Promise<ActionResult<{ href: string }>> {
  const state = await getOnboardingState()
  if (!state.ok) return state

  const automations = state.data.config.automations
  const configured = await configureAutomations({ toggles: automations })
  if (!configured.ok) return { ok: false, error: configured.error }

  const completed = await markComplete()
  if (!completed.ok) return { ok: false, error: completed.error }

  return { ok: true, data: { href: "/dashboard" } }
}
