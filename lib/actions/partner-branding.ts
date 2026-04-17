"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getAuth } from "@/lib/actions/shared"
import { revalidatePath } from "next/cache"

export interface PartnerBranding {
  id: string
  partner_id: string
  display_name: string
  logo_blob_path: string | null
  primary_color: string
  accent_color: string
  email_from_name: string | null
  custom_domain_host: string | null
  contact_email: string
  hide_protekon_attribution: boolean
}

const DEFAULTS = {
  primary_color: "#C41230",
  accent_color: "#D4AF52",
}

// ---------------------------------------------------------------------------
// Partner-facing CRUD (RLS enforces per-partner scope)
// ---------------------------------------------------------------------------

export async function getMyPartnerBranding(): Promise<PartnerBranding | null> {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return null

  const { data: profile } = await supabase
    .from("partner_profiles")
    .select("id")
    .eq("user_id", clientId)
    .maybeSingle()
  if (!profile) return null

  const { data } = await supabase
    .from("partner_branding")
    .select("*")
    .eq("partner_id", profile.id)
    .maybeSingle()
  return (data as PartnerBranding) ?? null
}

export async function upsertPartnerBranding(formData: FormData): Promise<
  { ok: true; branding: PartnerBranding } | { ok: false; error: string }
> {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { ok: false, error: "Unauthorized" }

  const { data: profile } = await supabase
    .from("partner_profiles")
    .select("id")
    .eq("user_id", clientId)
    .maybeSingle()
  if (!profile) return { ok: false, error: "Partner profile not found" }

  const display_name = String(formData.get("display_name") ?? "").trim()
  const contact_email = String(formData.get("contact_email") ?? "").trim()
  if (!display_name || !contact_email) {
    return { ok: false, error: "display_name and contact_email are required" }
  }

  const primary_color = String(formData.get("primary_color") ?? DEFAULTS.primary_color)
  const accent_color = String(formData.get("accent_color") ?? DEFAULTS.accent_color)
  if (!/^#[0-9A-Fa-f]{6}$/.test(primary_color) || !/^#[0-9A-Fa-f]{6}$/.test(accent_color)) {
    return { ok: false, error: "Colors must be 6-digit hex (e.g. #C41230)" }
  }

  const payload = {
    partner_id: profile.id,
    display_name,
    contact_email,
    primary_color,
    accent_color,
    logo_blob_path: (formData.get("logo_blob_path") as string) || null,
    email_from_name: (formData.get("email_from_name") as string) || null,
    custom_domain_host: (formData.get("custom_domain_host") as string) || null,
    hide_protekon_attribution: formData.get("hide_protekon_attribution") === "on",
  }

  const { data, error } = await supabase
    .from("partner_branding")
    .upsert(payload, { onConflict: "partner_id" })
    .select("*")
    .single()

  if (error) return { ok: false, error: error.message }
  revalidatePath("/partner/branding")
  return { ok: true, branding: data as PartnerBranding }
}

export async function uploadPartnerLogo(
  formData: FormData,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const { clientId } = await getAuth()
  if (!clientId) return { ok: false, error: "Unauthorized" }

  const file = formData.get("logo") as File | null
  if (!file || file.size === 0) return { ok: false, error: "No file provided" }
  if (file.size > 2 * 1024 * 1024) return { ok: false, error: "Logo must be under 2MB" }
  if (!["image/png", "image/jpeg", "image/svg+xml", "image/webp"].includes(file.type)) {
    return { ok: false, error: "Logo must be PNG, JPEG, SVG, or WebP" }
  }

  try {
    const { put } = await import("@vercel/blob")
    const ext = file.name.split(".").pop() ?? "png"
    const filename = `partner-logos/${clientId}-${Date.now()}.${ext}`
    const blob = await put(filename, file, { access: "public", contentType: file.type })
    return { ok: true, path: blob.url }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Upload failed" }
  }
}

// ---------------------------------------------------------------------------
// Render-path lookup (used by email + document generators).
// Admin client — bypasses RLS so any server action can resolve branding.
// ---------------------------------------------------------------------------

export async function lookupBrandingForClient(
  clientId: string,
): Promise<PartnerBranding | null> {
  if (!clientId) return null
  const admin = createAdminClient()

  const { data: client } = await admin
    .from("clients")
    .select("partner_id")
    .eq("id", clientId)
    .maybeSingle()
  if (!client?.partner_id) return null

  const { data } = await admin
    .from("partner_branding")
    .select("*")
    .eq("partner_id", client.partner_id)
    .maybeSingle()
  return (data as PartnerBranding) ?? null
}
