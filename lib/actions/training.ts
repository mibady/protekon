"use server"

import { createClient } from "@/lib/supabase/server"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, clientId: user?.id ?? null }
}

export async function getTrainingRecords() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return []
  const { data } = await supabase
    .from("training_records")
    .select("*")
    .eq("client_id", clientId)
    .order("due_date", { ascending: true })
  return data ?? []
}

export async function addTrainingRecord(formData: FormData) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }

  const { error } = await supabase.from("training_records").insert({
    client_id: clientId,
    employee_name: formData.get("employee_name") as string,
    training_type: formData.get("training_type") as string,
    due_date: formData.get("due_date") as string,
    status: "pending",
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function completeTraining(id: string) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }
  await supabase
    .from("training_records")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("client_id", clientId)
  return { success: true }
}

export async function deleteTrainingRecord(id: string) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }
  await supabase.from("training_records").delete().eq("id", id).eq("client_id", clientId)
  return { success: true }
}
