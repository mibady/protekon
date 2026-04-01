"use server"

import { createClient } from "@/lib/supabase/server"
import { inngest } from "@/inngest/client"
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

  // Generate document ID: DOC-YYYY-NNN
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("client_id", user.id)

  const seq = String((count ?? 0) + 1).padStart(3, "0")
  const documentId = `DOC-${year}-${seq}`

  const typeLabels: Record<string, string> = {
    iipp: "Injury & Illness Prevention Program",
    sb553: "SB 553 Workplace Violence Prevention",
    eap: "Emergency Action Plan",
    hazcom: "Hazard Communication Program",
    heat: "Heat Illness Prevention Plan",
    custom: "Custom Compliance Document",
  }

  const filename = `${typeLabels[type] || type}.pdf`

  const { error } = await supabase.from("documents").insert({
    client_id: user.id,
    document_id: documentId,
    type,
    filename,
    status: "requested",
    notes: notes || null,
    priority,
  })

  if (error) {
    return { error: error.message }
  }

  // Log to audit trail
  await supabase.from("audit_log").insert({
    client_id: user.id,
    event_type: "document.requested",
    description: `Requested ${typeLabels[type] || type} document (${documentId})`,
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

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return []

  return data as Document[]
}
