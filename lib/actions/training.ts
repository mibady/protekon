"use server"

import { getAuth } from "@/lib/actions/shared"
import { getSiteContext } from "@/lib/site-context"

export async function getTrainingRecords() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return []
  const { siteId } = await getSiteContext()
  let query = supabase
    .from("training_records")
    .select("*")
    .eq("client_id", clientId)
  if (siteId) query = query.eq("site_id", siteId)
  const { data } = await query.order("due_date", { ascending: true })
  return data ?? []
}

export async function addTrainingRecord(formData: FormData) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }

  const { siteId } = await getSiteContext()
  const { error } = await supabase.from("training_records").insert({
    client_id: clientId,
    employee_name: formData.get("employee_name") as string,
    training_type: formData.get("training_type") as string,
    due_date: formData.get("due_date") as string,
    status: "pending",
    site_id: siteId,
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
