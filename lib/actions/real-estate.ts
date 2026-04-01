"use server"

import { createClient } from "@/lib/supabase/server"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, clientId: user?.id ?? null }
}

export async function getProperties() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return []
  const { data } = await supabase
    .from("property_portfolio")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function addProperty(formData: FormData) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }

  const { error } = await supabase.from("property_portfolio").insert({
    client_id: clientId,
    property_name: formData.get("property_name") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string || "CA",
    units: parseInt(formData.get("units") as string) || 1,
    property_type: formData.get("property_type") as string,
    compliance_status: formData.get("compliance_status") as string || "compliant",
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function getOrdinances(jurisdiction?: string) {
  const supabase = (await createClient())
  let query = supabase.from("municipal_ordinances").select("*").order("effective_date", { ascending: false })
  if (jurisdiction) query = query.eq("jurisdiction", jurisdiction)
  const { data } = await query.limit(20)
  return data ?? []
}
