"use server"

import { createClient } from "@/lib/supabase/server"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, clientId: user?.id ?? null }
}

export async function getInspections() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return []
  const { data } = await supabase
    .from("hospitality_inspections")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function addInspection(formData: FormData) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }

  const { error } = await supabase.from("hospitality_inspections").insert({
    client_id: clientId,
    inspection_type: formData.get("inspection_type") as string || "health",
    inspector: formData.get("inspector") as string || null,
    inspection_date: formData.get("inspection_date") as string,
    score: formData.get("score") ? parseFloat(formData.get("score") as string) : null,
    violations: formData.get("violations") ? parseInt(formData.get("violations") as string) : 0,
    findings: formData.get("findings") as string || null,
    next_inspection: formData.get("next_inspection") as string || null,
    status: formData.get("status") as string || "passed",
  })

  if (error) return { error: error.message }
  return { success: true }
}
