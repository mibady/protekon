"use server"

import { createClient } from "@/lib/supabase/server"
import { inngest } from "@/inngest/client"
import { getDocumentLabel, isValidTemplateId } from "@/lib/document-templates"
import { getSiteContext } from "@/lib/site-context"
import type { ActionResult, Document } from "@/lib/types"

export async function requestDocument(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to request a document." }
  }

  const type = formData.get("type") as string
  const notes = formData.get("notes") as string | null
  const priority = formData.get("priority") as string || "standard"

  if (!type) {
    return { error: "Document type is required." }
  }

  // Enforce schema — only accept IDs present in the template registry
  if (type !== "custom" && !isValidTemplateId(type)) {
    return { error: `Unknown document type "${type}". Please select a valid document type.` }
  }

  // Generate document ID: DOC-YYYY-NNN
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("client_id", user.id)

  const seq = String((count ?? 0) + 1).padStart(3, "0")
  const documentId = `DOC-${year}-${seq}`

  // Pull display name from the centralized registry — no hardcoded map
  const displayName = type === "custom"
    ? "Custom Compliance Document"
    : getDocumentLabel(type)
  const filename = `${displayName}.pdf`

  const { siteId } = await getSiteContext()
  const { error } = await supabase.from("documents").insert({
    client_id: user.id,
    document_id: documentId,
    type,
    filename,
    status: "requested",
    notes: notes || null,
    priority,
    site_id: siteId,
  })

  if (error) {
    return { error: error.message }
  }

  // Log to audit trail
  await supabase.from("audit_log").insert({
    client_id: user.id,
    event_type: "document.requested",
    description: `Requested ${displayName} document (${documentId})`,
    metadata: { document_id: documentId, type, priority },
  })

  // Fire Inngest event to trigger document generation pipeline
  await inngest.send({
    name: "compliance/document.requested",
    data: {
      clientId: user.id,
      email: user.email!,
      businessName: user.user_metadata?.business_name || "",
      documentType: type,
      vertical: user.user_metadata?.vertical || "other",
    },
  })

  return { success: true }
}

export async function getDocuments(): Promise<Document[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { siteId } = await getSiteContext()
  let query = supabase
    .from("documents")
    .select("*")
    .eq("client_id", user.id)
  if (siteId) query = query.eq("site_id", siteId)
  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) return []

  return data as Document[]
}

/**
 * Get available document types for the current user's vertical.
 * Pulls from the centralized template registry — no hardcoded lists.
 * The document request UI calls this to populate options dynamically.
 */
export async function getAvailableDocTypesForUser(): Promise<
  { id: string; title: string; description: string; regulation: string; sectionCount: number; isVerticalSpecific: boolean }[]
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Canonical source for vertical is the clients table (written by intake + settings).
  // Auth user_metadata is a legacy fallback only.
  const { data: clientRow } = await supabase
    .from("clients")
    .select("vertical")
    .eq("id", user.id)
    .maybeSingle()
  const vertical = clientRow?.vertical || user.user_metadata?.vertical || "other"

  const { getTemplatesForVertical } = await import("@/lib/document-templates")
  const templates = getTemplatesForVertical(vertical)
  return templates.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    regulation: t.sections[0]?.requiredReferences[0] ?? "",
    sectionCount: t.sections.filter((s) => s.alwaysInclude).length,
    isVerticalSpecific: t.vertical !== "all",
  }))
}
