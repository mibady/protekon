"use server"

import { createClient } from "@/lib/supabase/server"
import type { PartnerApplication } from "@/lib/types/partner"

export async function submitPartnerApplication(
  app: PartnerApplication
): Promise<{ success: true; id: string } | { error: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("partner_applications")
      .insert({
        name: app.name,
        email: app.email,
        phone: app.phone ?? null,
        business_name: app.business_name,
        business_type: app.business_type,
        website: app.website ?? null,
        city: app.city,
        state: app.state,
        client_count: app.client_count,
        client_industries: app.client_industries,
        verticals_interested: app.verticals_interested,
        previous_compliance_experience: app.previous_compliance_experience,
        tier_interest: app.tier_interest,
        referral_source: app.referral_source ?? null,
        notes: app.notes ?? null,
        utm_source: app.utm_source ?? null,
        utm_medium: app.utm_medium ?? null,
        utm_campaign: app.utm_campaign ?? null,
      })
      .select("id")
      .single()

    if (error) {
      console.error("[submitPartnerApplication] Supabase insert error:", error)
      return { error: error.message }
    }

    return { success: true, id: data.id }
  } catch (err) {
    console.error("[submitPartnerApplication] Unexpected error:", err)
    return { error: "Failed to submit partner application" }
  }
}
