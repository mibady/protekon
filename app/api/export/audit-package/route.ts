import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import archiver from "archiver"
import { PassThrough } from "stream"

export const maxDuration = 120

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: client } = await supabase
    .from("clients")
    .select("business_name")
    .eq("id", user.id)
    .single()

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 })
  }

  // Get all documents with storage URLs
  const { data: docs } = await supabase
    .from("documents")
    .select("document_id, type, filename, storage_url, created_at")
    .eq("client_id", user.id)
    .not("storage_url", "is", null)
    .order("type")
    .order("created_at", { ascending: false })

  if (!docs || docs.length === 0) {
    return NextResponse.json(
      { error: "No documents available. Generate compliance documents first." },
      { status: 404 }
    )
  }

  // Create ZIP archive
  const archive = archiver("zip", { zlib: { level: 6 } })
  const passthrough = new PassThrough()
  archive.pipe(passthrough)

  // Fetch each PDF and add to archive
  for (const doc of docs) {
    try {
      const res = await fetch(doc.storage_url!, { signal: AbortSignal.timeout(10000) })
      if (!res.ok) continue

      const buffer = Buffer.from(await res.arrayBuffer())
      const safeName = (doc.filename || `${doc.type}-${doc.document_id}.pdf`)
        .replace(/[^a-zA-Z0-9._-]/g, "_")

      archive.append(buffer, { name: safeName })
    } catch {
      // Skip documents that fail to download
    }
  }

  // Add a manifest
  const manifest = [
    `PROTEKON AUDIT PACKAGE`,
    `Business: ${client.business_name}`,
    `Generated: ${new Date().toISOString()}`,
    `Documents: ${docs.length}`,
    ``,
    `Contents:`,
    ...docs.map((d) => `  - ${d.filename || d.type} (${d.document_id}) — ${d.created_at}`),
  ].join("\n")

  archive.append(manifest, { name: "MANIFEST.txt" })
  archive.finalize()

  // Stream the ZIP response directly — no buffering in memory
  const slug = client.business_name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()
  const date = new Date().toISOString().slice(0, 10)

  const stream = new ReadableStream({
    start(controller) {
      passthrough.on("data", (chunk: Buffer) => {
        controller.enqueue(new Uint8Array(chunk))
      })
      passthrough.on("end", () => {
        controller.close()
      })
      passthrough.on("error", (err) => {
        controller.error(err)
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="protekon-audit-${slug}-${date}.zip"`,
      "Transfer-Encoding": "chunked",
    },
  })
}
