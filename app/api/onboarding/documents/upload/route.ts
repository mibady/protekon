import { NextResponse, type NextRequest } from "next/server"
import { put } from "@vercel/blob"

import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 60

const CATEGORY_PATTERN = /^[a-z0-9_-]{1,64}$/i
const MAX_BYTES = 20 * 1024 * 1024

type UploadResponse = {
  documentId: string
  url: string
}

type DocumentRowSelection = { id: string }

export async function POST(
  request: NextRequest,
): Promise<NextResponse<UploadResponse | { error: string }>> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "invalid_multipart" }, { status: 400 })
  }

  const file = formData.get("file")
  const category = formData.get("category")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 })
  }

  if (typeof category !== "string" || !CATEGORY_PATTERN.test(category)) {
    return NextResponse.json({ error: "invalid_category" }, { status: 400 })
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "empty_file" }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 413 })
  }

  const safeName = file.name.replace(/[^a-z0-9.\-_]/gi, "_")
  const key = `onboarding/${user.id}/${category}/${Date.now()}-${safeName}`

  let blobUrl: string
  try {
    const blob = await put(key, file, {
      access: "public",
      addRandomSuffix: false,
    })
    blobUrl = blob.url
  } catch (err) {
    const message = err instanceof Error ? err.message : "blob_upload_failed"
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const docId = `${category.slice(0, 6).toUpperCase()}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`

  const { data: inserted, error } = await supabase
    .from("documents")
    .insert({
      client_id: user.id,
      document_id: docId,
      type: category,
      filename: safeName,
      storage_url: blobUrl,
      status: "requested",
      priority: "standard",
    })
    .select("id")
    .single<DocumentRowSelection>()

  if (error || !inserted) {
    return NextResponse.json(
      { error: error?.message ?? "document_row_insert_failed" },
      { status: 500 },
    )
  }

  return NextResponse.json({ documentId: inserted.id, url: blobUrl })
}
