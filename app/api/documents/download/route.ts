import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const documentId = request.nextUrl.searchParams.get("id")

  if (!documentId) {
    return NextResponse.json({ error: "Missing document ID" }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get document and verify ownership via client_id -> user_id
  const { data: doc } = await supabase
    .from("documents")
    .select("storage_url, client_id")
    .eq("document_id", documentId)
    .single()

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  // Verify the requesting user owns this document's client
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", doc.client_id)
    .eq("id", user.id)
    .single()

  if (!client) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  if (!doc.storage_url) {
    return NextResponse.json(
      { error: "Document is still being generated" },
      { status: 202 }
    )
  }

  return NextResponse.redirect(doc.storage_url)
}
