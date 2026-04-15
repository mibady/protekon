import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { put } from "@vercel/blob"

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
]

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid multipart request" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  const subId = formData.get("sub_id") as string | null
  const extractedRaw = formData.get("extracted_data") as string | null

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
  if (!subId) return NextResponse.json({ error: "sub_id is required" }, { status: 400 })

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "File type not allowed (pdf/png/jpeg only)" }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
  }

  // Authorise: the sub must belong to the caller's client.
  const { data: sub, error: subErr } = await supabase
    .from("construction_subs")
    .select("id, client_id")
    .eq("id", subId)
    .single()
  if (subErr || !sub) {
    return NextResponse.json({ error: "Subcontractor not found" }, { status: 404 })
  }

  // Upload to Blob
  const storagePath = `coi/${sub.client_id}/${subId}/${Date.now()}-${file.name}`
  const blob = await put(storagePath, file, { access: "public", contentType: file.type })

  // Parse extracted data if the caller already ran Document AI client-side.
  // Fine to pass {} — fn_process_coi_upload handles missing fields.
  let extractedData: Record<string, unknown> = {}
  if (extractedRaw) {
    try {
      extractedData = JSON.parse(extractedRaw)
    } catch {
      return NextResponse.json({ error: "extracted_data must be valid JSON" }, { status: 400 })
    }
  }

  // Invoke the DB pipeline: inserts COI row, updates sub insurance status,
  // generates expiration alerts. Requires service-role for cross-table writes.
  const admin = createAdminClient()
  const { data: rpcData, error: rpcError } = await admin.rpc("fn_process_coi_upload", {
    p_sub_id: subId,
    p_client_id: sub.client_id,
    p_storage_path: blob.url,
    p_extracted_data: extractedData,
  })

  if (rpcError) {
    return NextResponse.json(
      { error: `fn_process_coi_upload failed: ${rpcError.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({
    url: blob.url,
    storagePath,
    result: rpcData,
  })
}
