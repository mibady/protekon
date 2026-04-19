import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Public sub-onboarding portal API.
 *
 * GET  /api/sub-onboarding/submit/[token] — validate token, return invite meta.
 * POST /api/sub-onboarding/submit/[token] — accept multipart submission:
 *   - legal_name (required)
 *   - ein                       (optional)
 *   - address                   (optional)
 *   - w9                        (File, optional — PDF)
 *   - msa_signature_data_url    (data:image/png;base64,... optional)
 *   - user_agent                (optional)
 *
 * Tokens live in a deny-all RLS table and are only accessed through the
 * service-role admin client.
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token } = await params
  const admin = createAdminClient()

  const { data: tok, error } = await admin
    .from("sub_onboarding_tokens")
    .select(
      "token, sub_company_name, contact_email, contact_name, expires_at, used_at"
    )
    .eq("token", token)
    .maybeSingle()

  if (error || !tok) {
    return NextResponse.json({ error: "Invalid token." }, { status: 404 })
  }
  if (tok.used_at) {
    return NextResponse.json(
      { error: "Already submitted.", submitted: true },
      { status: 410 }
    )
  }
  if (new Date(tok.expires_at) < new Date()) {
    return NextResponse.json({ error: "Expired." }, { status: 410 })
  }

  return NextResponse.json({
    valid: true,
    company_name: tok.sub_company_name,
    contact_name: tok.contact_name,
    contact_email: tok.contact_email,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token } = await params
  const admin = createAdminClient()

  const { data: tok, error: tokErr } = await admin
    .from("sub_onboarding_tokens")
    .select("token, client_id, sub_id, expires_at, used_at, sub_company_name")
    .eq("token", token)
    .maybeSingle()

  if (tokErr || !tok) {
    return NextResponse.json({ error: "Invalid token." }, { status: 404 })
  }
  if (tok.used_at) {
    return NextResponse.json({ error: "Already submitted." }, { status: 410 })
  }
  if (new Date(tok.expires_at) < new Date()) {
    return NextResponse.json({ error: "Expired." }, { status: 410 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart body." },
      { status: 400 }
    )
  }

  const legalName = (formData.get("legal_name") as string | null)?.trim()
  const ein = (formData.get("ein") as string | null)?.trim() || null
  const address = (formData.get("address") as string | null)?.trim() || null
  const w9File = formData.get("w9") as File | null
  const msaSigDataUrl = formData.get("msa_signature_data_url") as string | null
  const userAgent = formData.get("user_agent") as string | null

  if (!legalName) {
    return NextResponse.json(
      { error: "Legal name is required." },
      { status: 400 }
    )
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0"

  // W-9 upload (Vercel Blob)
  let w9Url: string | null = null
  if (w9File && w9File.size > 0) {
    try {
      const { put } = await import("@vercel/blob")
      const path = `sub-w9/${tok.client_id}/${token}-${Date.now()}-${w9File.name}`
      const { url } = await put(path, w9File, {
        access: "public",
        contentType: w9File.type || "application/pdf",
      })
      w9Url = url
    } catch (err) {
      return NextResponse.json(
        { error: `Could not upload W-9: ${err instanceof Error ? err.message : "unknown error"}` },
        { status: 500 }
      )
    }
  }

  // MSA signature (data URL → PNG in Blob). Full MSA stitching deferred —
  // the raw signature image is the durable artifact for now.
  let msaUrl: string | null = null
  if (msaSigDataUrl) {
    try {
      const sigBase64 = msaSigDataUrl.replace(/^data:image\/\w+;base64,/, "")
      const sigBuffer = Buffer.from(sigBase64, "base64")
      const { put } = await import("@vercel/blob")
      const path = `sub-msa/${tok.client_id}/${token}-${Date.now()}.png`
      const { url } = await put(path, sigBuffer, {
        access: "public",
        contentType: "image/png",
      })
      msaUrl = url
    } catch (err) {
      return NextResponse.json(
        { error: `Could not store MSA signature: ${err instanceof Error ? err.message : "unknown error"}` },
        { status: 500 }
      )
    }
  }

  const now = new Date().toISOString()
  const { data: inserted, error: insErr } = await admin
    .from("sub_onboarding_submissions")
    .insert({
      token,
      sub_id: tok.sub_id,
      client_id: tok.client_id,
      legal_name: legalName,
      ein,
      address,
      w9_pdf_url: w9Url,
      w9_uploaded_at: w9Url ? now : null,
      msa_signed_pdf_url: msaUrl,
      msa_signed_at: msaUrl ? now : null,
      submitted_ip: ip,
      submitted_user_agent: userAgent,
    })
    .select("id")
    .single()

  if (insErr || !inserted) {
    return NextResponse.json(
      { error: insErr?.message ?? "Could not record submission." },
      { status: 500 }
    )
  }

  // Single-use — mark the token consumed
  await admin
    .from("sub_onboarding_tokens")
    .update({ used_at: now })
    .eq("token", token)

  // Audit trail
  await admin.from("audit_log").insert({
    client_id: tok.client_id,
    event_type: "sub_onboarding.submitted",
    description: `${tok.sub_company_name} submitted onboarding materials`,
    metadata: {
      submission_id: inserted.id,
      token,
      has_w9: !!w9Url,
      has_msa_signature: !!msaUrl,
    },
  })

  return NextResponse.json({ success: true })
}
