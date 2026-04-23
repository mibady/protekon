import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { generateSignoffSheetPDF } from "@/lib/pdf-training"

type SignBody = {
  signatureDataUrl: string // "data:image/png;base64,..."
  signerName: string
  signerEmail?: string
  userAgent: string
}

type TokenRequestRow = {
  policy_document_id: string
  policy_version: string
  cohort_note: string | null
  due_date: string | null
  client_id: string
}

function firstRequest(r: TokenRequestRow | TokenRequestRow[] | null): TokenRequestRow | null {
  if (!r) return null
  return Array.isArray(r) ? r[0] ?? null : r
}

/**
 * GET — preview: validates the token and returns minimal campaign metadata
 * for the signer UI to display (policy version, due date, cohort note).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token } = await params
  const admin = createAdminClient()

  const { data: tok, error } = await admin
    .from("acknowledgment_tokens")
    .select(
      "token, request_id, assigned_to, expires_at, used_at, acknowledgment_requests!inner(policy_document_id, policy_version, cohort_note, due_date, client_id)"
    )
    .eq("token", token)
    .maybeSingle()

  if (error || !tok) {
    return NextResponse.json({ error: "Invalid token." }, { status: 404 })
  }
  if (tok.used_at) {
    return NextResponse.json(
      { error: "This link has already been used.", signed: true },
      { status: 410 }
    )
  }
  if (new Date(tok.expires_at) < new Date()) {
    return NextResponse.json({ error: "This link has expired." }, { status: 410 })
  }

  const req = firstRequest(tok.acknowledgment_requests as TokenRequestRow | TokenRequestRow[] | null)
  if (!req) {
    return NextResponse.json({ error: "Campaign not found." }, { status: 404 })
  }

  return NextResponse.json({
    valid: true,
    policyVersion: req.policy_version,
    dueDate: req.due_date,
    cohortNote: req.cohort_note,
    assignedTo: tok.assigned_to,
  })
}

/**
 * POST — sign: validates the token, stitches a signed PDF from the
 * training-signoff template, uploads to Vercel Blob (fallback: Supabase Storage),
 * records the acknowledgment with sha256 + ip + user_agent, and marks the
 * token used.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token } = await params
  let body: SignBody
  try {
    body = (await req.json()) as SignBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  if (!body?.signatureDataUrl || !body?.signerName || !body?.userAgent) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
  }

  const admin = createAdminClient()
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0"

  // Validate token
  const { data: tok, error: tokErr } = await admin
    .from("acknowledgment_tokens")
    .select(
      "token, request_id, used_at, expires_at, acknowledgment_requests!inner(policy_document_id, policy_version, cohort_note, due_date, client_id)"
    )
    .eq("token", token)
    .maybeSingle()

  if (tokErr || !tok) {
    return NextResponse.json({ error: "Invalid token." }, { status: 404 })
  }
  if (tok.used_at) {
    return NextResponse.json({ error: "Already signed." }, { status: 410 })
  }
  if (new Date(tok.expires_at) < new Date()) {
    return NextResponse.json({ error: "Expired." }, { status: 410 })
  }

  const ackReq = firstRequest(
    tok.acknowledgment_requests as TokenRequestRow | TokenRequestRow[] | null
  )
  if (!ackReq) {
    return NextResponse.json({ error: "Campaign not found." }, { status: 404 })
  }

  // Generate signed PDF using the training-signoff pattern.
  // Wave 1: reuse generateSignoffSheetPDF verbatim (no modification to
  // lib/pdf-training.ts). dueDate is required (string, not null) so pass a
  // sensible default when absent.
  const dueDateLabel = ackReq.due_date
    ? new Date(ackReq.due_date).toLocaleDateString()
    : "No due date"

  const { buffer } = await generateSignoffSheetPDF({
    employeeName: body.signerName,
    trainingType: `Policy acknowledgment: ${ackReq.policy_version}`,
    completedAt: new Date().toISOString(),
    dueDate: dueDateLabel,
    businessName: "Policy acknowledgment record",
  })

  // Normalize Uint8Array -> Buffer for Node APIs (crypto, blob upload).
  const pdfBuffer = Buffer.from(buffer)

  // Strip data URL prefix for the signature image
  const sigBase64 = body.signatureDataUrl.replace(/^data:image\/\w+;base64,/, "")
  const sigBuffer = Buffer.from(sigBase64, "base64")

  // Upload to Vercel Blob (installed: @vercel/blob ^2.3.2).
  // Falls back to Supabase Storage (bucket "acknowledgments") if Blob fails
  // at runtime (e.g., missing BLOB_READ_WRITE_TOKEN in some envs).
  let signedPdfUrl: string
  let signatureImageUrl: string
  try {
    const { put } = await import("@vercel/blob")
    const pdfBlob = await put(`ack-signed/${crypto.randomUUID()}.pdf`, pdfBuffer, {
      access: "public",
      contentType: "application/pdf",
    })
    signedPdfUrl = pdfBlob.url

    const sigBlob = await put(`ack-signatures/${crypto.randomUUID()}.png`, sigBuffer, {
      access: "public",
      contentType: "image/png",
    })
    signatureImageUrl = sigBlob.url
  } catch {
    // Fallback: Supabase Storage
    const pdfPath = `ack-signed/${crypto.randomUUID()}.pdf`
    const sigPath = `ack-signatures/${crypto.randomUUID()}.png`
    const { error: pdfUploadErr } = await admin.storage
      .from("acknowledgments")
      .upload(pdfPath, pdfBuffer, { contentType: "application/pdf" })
    const { error: sigUploadErr } = await admin.storage
      .from("acknowledgments")
      .upload(sigPath, sigBuffer, { contentType: "image/png" })
    if (pdfUploadErr || sigUploadErr) {
      return NextResponse.json(
        { error: "Could not store signed document." },
        { status: 500 }
      )
    }
    const { data: pdfUrl } = admin.storage.from("acknowledgments").getPublicUrl(pdfPath)
    const { data: sigUrl } = admin.storage.from("acknowledgments").getPublicUrl(sigPath)
    signedPdfUrl = pdfUrl.publicUrl
    signatureImageUrl = sigUrl.publicUrl
  }

  // Tamper-evident hash of the signed PDF bytes
  const hash = crypto.createHash("sha256").update(pdfBuffer).digest("hex")

  // Insert acknowledgment row (immutable by policy — no UPDATE/DELETE allowed)
  const { error: ackErr } = await admin.from("acknowledgments").insert({
    request_id: tok.request_id,
    signer_name: body.signerName,
    signer_email: body.signerEmail ?? null,
    signature_image_url: signatureImageUrl,
    signed_pdf_url: signedPdfUrl,
    sha256_hash: hash,
    ip,
    user_agent: body.userAgent,
  })

  if (ackErr) {
    return NextResponse.json(
      { error: "Could not record signature." },
      { status: 500 }
    )
  }

  // Mark token used (single-use)
  await admin
    .from("acknowledgment_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("token", token)

  // Audit log
  await admin.from("audit_log").insert({
    client_id: ackReq.client_id,
    event_type: "acknowledgment.signed",
    description: `${body.signerName} signed policy ${ackReq.policy_version}`,
    metadata: {
      request_id: tok.request_id,
      signer_name: body.signerName,
      sha256: hash,
    },
  })

  return NextResponse.json({ success: true, signedPdfUrl })
}
