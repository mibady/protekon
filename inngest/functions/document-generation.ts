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

    // Step 2: Generate AI content (HEAD layer)
    const aiContent = await step.run("generate-ai-content", async () => {
      try {
        const { generateDocumentContent } = await import("@/lib/ai/document-generator")
        return await generateDocumentContent({
          businessName,
          documentType,
          vertical,
          complianceScore: clientData.compliance_score ?? 0,
          riskLevel: clientData.risk_level ?? "unknown",
        })
      } catch (err) {
        console.warn("[document-generation] AI content generation failed, using static templates:", err instanceof Error ? err.message : err)
        return null
      }
    })

    // Step 3: Generate PDF and upload to Vercel Blob
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
        aiContent: aiContent ?? undefined,
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

    // Step 5: Index document content for RAG
    if (aiContent) {
      await step.run("index-for-rag", async () => {
        const serialized = [
          aiContent.title,
          ...aiContent.sections.map((s) => `${s.heading}\n${s.body}`),
          aiContent.recommendations.length > 0
            ? `Recommendations:\n${aiContent.recommendations.join("\n")}`
            : "",
        ].filter(Boolean).join("\n\n")

        await inngest.send({
          name: "rag/document.index",
          data: {
            id: `${clientId}-${documentType}-${Date.now()}`,
            title: aiContent.title,
            content: serialized,
            metadata: {
              type: "document",
              vertical,
              clientId,
              title: aiContent.title,
            },
          },
        })
      })
    }

    return { success: true, documentType, pages: docResult.pages }
  }
)
