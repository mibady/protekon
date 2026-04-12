"use server"

import { createClient } from "@/lib/supabase/server"
import { getIndustryProfile, getNearbyEnforcement, getBenchmarks } from "@/lib/osha-api"
import type { OshaIndustryProfile, OshaNearbyEnforcement, OshaBenchmarks } from "@/lib/types"

export async function getOshaIndustryData(): Promise<OshaIndustryProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: client } = await supabase
    .from("clients")
    .select("vertical")
    .eq("id", user.id)
    .single()

  if (!client?.vertical) return null

  const VERTICAL_NAICS: Record<string, string> = {
    construction: "236220",
    healthcare: "621111",
    "real-estate": "531210",
    manufacturing: "332710",
    hospitality: "721110",
    retail: "445110",
    wholesale: "493110",
    agriculture: "111120",
    transportation: "484110",
    "auto-services": "811110",
  }

  const naicsCode = VERTICAL_NAICS[client.vertical] || "236220"
  return getIndustryProfile(naicsCode)
}

export async function getOshaNearbyData(): Promise<OshaNearbyEnforcement[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Use client's city if available, default to Riverside CA
  const { data: client } = await supabase
    .from("clients")
    .select("business_name")
    .eq("id", user.id)
    .single()

  // Default to Riverside for South LA County / IE territory
  return getNearbyEnforcement("Riverside", "CA", 10)
}

export async function getOshaBenchmarkData(): Promise<OshaBenchmarks | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: client } = await supabase
    .from("clients")
    .select("vertical")
    .eq("id", user.id)
    .single()

  return getBenchmarks(client?.vertical || "construction")
}
