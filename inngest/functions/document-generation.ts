import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/resend"
import { documentReadyEmail } from "@/lib/email-templates"

export const documentGeneration = inngest.createFunction(
  { id: "document-generation", triggers: [{ event: "compliance/document.requested" }] },
  async ({ event, step }) => {
    const { clientId, email, businessName, documentType, vertical } = event.data as {
      clientId: string; email: string; businessName: string; documentType: string; vertical: string
    }
    const supabase = createAdminClient()

    // Step 1: Gather client data
    const clientData = await step.run("gather-client-data", async () => {
      const { data: client } = await supabase
        .from("clients")
        .select("compliance_score, risk_level, vertical, plan")
        .eq("id", clientId)
        .single()

      const { count: auditCount } = await supabase
        .from("audits")
        .select("*", { count: "exact", head: true })
        .eq("client_id", clientId)

      const { count: incidentCount } = await supabase
        .from("incidents")
        .select("*", { count: "exact", head: true })
        .eq("client_id", clientId)

      return {
        ...client,
        auditCount: auditCount ?? 0,
        incidentCount: incidentCount ?? 0,
      }
    })

    // Step 2: Generate PDF and upload to Vercel Blob
    const docResult = await step.run("generate-document", async () => {
      const { generateCompliancePDF } = await import("@/lib/pdf")
      const { put } = await import("@vercel/blob")

      const { buffer, pages } = await generateCompliancePDF({
        businessName,
        documentType,
        vertical,
        documentId: `${documentType}-${Date.now()}`,
        complianceScore: clientData.compliance_score ?? 0,
        riskLevel: clientData.risk_level ?? "unknown",
        auditCount: clientData.auditCount,
        incidentCount: clientData.incidentCount,
      })

      const blob = await put(
        `docs/${clientId}/${documentType}-${Date.now()}.pdf`,
        new Blob([buffer], { type: "application/pdf" }),
        { access: "public", contentType: "application/pdf" }
      )

      return { pages, storageUrl: blob.url }
    })

    // Step 3: Update document record
    await step.run("update-document-status", async () => {
      const { error } = await supabase
        .from("documents")
        .update({
          status: "current",
          pages: docResult.pages,
          storage_url: docResult.storageUrl,
        })
        .eq("client_id", clientId)
        .eq("type", documentType)
        .eq("status", "requested")
        .order("created_at", { ascending: false })
        .limit(1)

      if (error) {
        console.error(`[document-generation] Failed to update document: ${error.message}`)
      }
    })

    // Step 4: Notify client
    await step.run("notify-client", async () => {
      await sendEmail({ to: email, ...documentReadyEmail(documentType, businessName) })
    })

    return { success: true, documentType, pages: docResult.pages }
  }
)
