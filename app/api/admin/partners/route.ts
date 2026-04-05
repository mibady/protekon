import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * GET /api/admin/partners — List partner applications and profiles
 * Query params: ?status=pending (applications) | ?profiles=true&status=pending (profiles)
 */
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { searchParams } = request.nextUrl
  const listProfiles = searchParams.get("profiles") === "true"
  const status = searchParams.get("status")

  const supabase = createAdminClient()

  if (listProfiles) {
    let query = supabase
      .from("partner_profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ profiles: data })
  }

  // Default: list partner applications
  let query = supabase
    .from("partner_applications")
    .select("*")
    .order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ applications: data })
}

/**
 * PATCH /api/admin/partners — Approve, suspend, or reject a partner
 * Body: { partner_id: string, action: "approve" | "suspend" | "reject", tier?: string }
 *
 * "approve" on an application creates a partner_profile with status=approved.
 * "approve"/"suspend" on an existing profile updates the status.
 */
export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await request.json()
  const { partner_id, action, tier } = body as {
    partner_id: string
    action: "approve" | "suspend" | "reject"
    tier?: string
  }

  if (!partner_id || !action) {
    return NextResponse.json(
      { error: "partner_id and action are required" },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // Check if this is an application approval (creates a profile)
  if (action === "approve") {
    // First check if a profile already exists
    const { data: existingProfile } = await supabase
      .from("partner_profiles")
      .select("id")
      .eq("id", partner_id)
      .single()

    if (existingProfile) {
      // Update existing profile status
      const { error } = await supabase
        .from("partner_profiles")
        .update({ status: "approved" })
        .eq("id", partner_id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, action: "profile_approved" })
    }

    // Check if this is an application ID
    const { data: application } = await supabase
      .from("partner_applications")
      .select("*")
      .eq("id", partner_id)
      .single()

    if (!application) {
      return NextResponse.json(
        { error: "No application or profile found with that ID" },
        { status: 404 }
      )
    }

    // Create partner profile from application
    const { error: profileError } = await supabase
      .from("partner_profiles")
      .insert({
        user_id: application.user_id ?? application.email,
        company_name: application.business_name,
        contact_name: application.name,
        email: application.email,
        phone: application.phone,
        tier: tier ?? "free",
        status: "approved",
      })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Mark application as approved
    await supabase
      .from("partner_applications")
      .update({ status: "approved" })
      .eq("id", partner_id)

    return NextResponse.json({ success: true, action: "application_approved" })
  }

  if (action === "suspend") {
    const { error } = await supabase
      .from("partner_profiles")
      .update({ status: "suspended" })
      .eq("id", partner_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, action: "partner_suspended" })
  }

  if (action === "reject") {
    // Update application status
    const { error } = await supabase
      .from("partner_applications")
      .update({ status: "rejected" })
      .eq("id", partner_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, action: "application_rejected" })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
