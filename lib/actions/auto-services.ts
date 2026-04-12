"use server"

import { createClient } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"

export interface AutoServiceShop {
  id: string
  shop_type: string
  bay_count: number
  hazmat_handling: boolean
  paint_booth: boolean
  ase_certifications: string[]
  waste_disposal_method: string | null
  last_epa_inspection: string | null
}

export async function getAutoServiceShops(): Promise<Record<string, unknown>[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("auto_services")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  return (data || []) as Record<string, unknown>[]
}

export async function saveAutoServiceShop(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const aseCerts = (formData.get("ase_certifications") as string || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const { error } = await supabase.from("auto_services").upsert({
    client_id: user.id,
    shop_type: formData.get("shop_type") as string || "general",
    bay_count: parseInt(formData.get("bay_count") as string) || 0,
    hazmat_handling: formData.get("hazmat_handling") === "true",
    paint_booth: formData.get("paint_booth") === "true",
    ase_certifications: aseCerts,
    waste_disposal_method: formData.get("waste_disposal_method") as string || null,
    last_epa_inspection: formData.get("last_epa_inspection") as string || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "client_id" })

  if (error) return { error: error.message }
  return { success: true }
}
