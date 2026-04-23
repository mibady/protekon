"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"

export type ActionItemType =
  | "property_review"
  | "doc_review"
  | "incident_followup"
  | "training_signoff"
  | "vendor_risk"
  | "general"

export type ActionItemStatus = "open" | "in_progress" | "completed" | "cancelled"

export type ActionItem = {
  id: string
  client_id: string
  action_type: ActionItemType
  title: string
  description: string | null
  assignee_user_id: string | null
  created_by: string | null
  status: ActionItemStatus
  due_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export async function listActionItems(): Promise<ActionItem[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("action_items")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("[action-items] listActionItems error:", error)
    return []
  }
  return (data ?? []) as ActionItem[]
}

export async function createActionItem(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "UNAUTHENTICATED" }

  const action_type = (formData.get("action_type") as ActionItemType) || "general"
  const title = (formData.get("title") as string | null)?.trim() || ""
  const description = (formData.get("description") as string | null) || null

  if (!title) return { error: "Title is required." }

  const { data: role } = await supabase
    .from("user_roles")
    .select("client_id")
    .eq("user_id", user.id)
    .maybeSingle()

  const clientId = role?.client_id ?? user.id

  const { error } = await supabase.from("action_items").insert({
    client_id: clientId,
    action_type,
    title,
    description,
    assignee_user_id: user.id,
    created_by: user.id,
    status: "open",
  })

  if (error) {
    console.error("[action-items] createActionItem error:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/action-items")
  return { success: true }
}
