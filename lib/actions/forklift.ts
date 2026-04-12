"use server"

import { createClient } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"

export interface ForkliftOperator {
  id: string
  operator_name: string
  cert_date: string
  cert_expiry: string
  forklift_type: string
  evaluation_status: string
  evaluator: string | null
  notes: string | null
  zone_id: string | null
}

export async function getForkliftOperators(): Promise<ForkliftOperator[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("forklift_operators")
    .select("*")
    .eq("client_id", user.id)
    .order("cert_expiry", { ascending: true })

  return (data || []) as ForkliftOperator[]
}

export async function addForkliftOperator(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase.from("forklift_operators").insert({
    client_id: user.id,
    operator_name: formData.get("operator_name") as string,
    cert_date: formData.get("cert_date") as string,
    cert_expiry: formData.get("cert_expiry") as string,
    forklift_type: formData.get("forklift_type") as string || "Class I",
    evaluator: formData.get("evaluator") as string || null,
    notes: formData.get("notes") as string || null,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateOperatorStatus(id: string, status: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from("forklift_operators")
    .update({ evaluation_status: status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("client_id", user.id)

  if (error) return { error: error.message }
  return { success: true }
}
