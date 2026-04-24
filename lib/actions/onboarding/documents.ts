"use server"

import type {
  AdoptTemplateInput,
  ApproveImportedDocumentInput,
  DocumentStepActionResult,
  MarkDocumentSkippedInput,
} from "@/lib/types/onboarding"

export async function approveImportedDocument(
  input: ApproveImportedDocumentInput,
): Promise<DocumentStepActionResult> {
  return {
    ok: true,
    data: { documentId: input.documentId, category: "imported" },
  }
}

export async function adoptTemplate(
  input: AdoptTemplateInput,
): Promise<DocumentStepActionResult> {
  return {
    ok: true,
    data: { documentId: crypto.randomUUID(), category: input.category },
  }
}

export async function markDocumentSkipped(
  input: MarkDocumentSkippedInput,
): Promise<DocumentStepActionResult> {
  return { ok: true, data: { documentId: null, category: input.category } }
}
