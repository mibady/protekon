import { streamText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { createClient } from "@/lib/supabase/server"
import { retrieveContext } from "@/lib/rag/retrieval"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Rate limit per user — LLM endpoint costs money per token
  const ip = getClientIp(req.headers instanceof Headers ? req.headers : new Headers())
  const limiter = rateLimit(`chat:${user.id}:${ip}`, { maxRequests: 20, windowMs: 60_000 })
  if (limiter.limited) {
    return new Response("Rate limit exceeded. Please wait before sending more messages.", { status: 429 })
  }

  let messages: unknown
  try {
    const body = await req.json()
    messages = body.messages
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Messages array is required", { status: 400 })
  }

  // Gather client context from database
  const [clientResult, docsResult, incidentsResult, regsResult] = await Promise.all([
    supabase.from("clients").select("business_name, vertical, compliance_score, risk_level, plan").eq("id", user.id).single(),
    supabase.from("documents").select("type, status, created_at").eq("client_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("incidents").select("description, severity, incident_date, location").eq("client_id", user.id).order("incident_date", { ascending: false }).limit(5),
    supabase.from("regulatory_updates").select("title, summary, severity, effective_date").order("created_at", { ascending: false }).limit(5),
  ])

  const client = clientResult.data
  const docs = docsResult.data ?? []
  const incidents = incidentsResult.data ?? []
  const regs = regsResult.data ?? []

  // RAG: retrieve relevant compliance knowledge based on the latest user message
  const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === "user")
  const userQuery = typeof lastUserMessage?.content === "string"
    ? lastUserMessage.content
    : Array.isArray(lastUserMessage?.content)
      ? lastUserMessage.content.map((p: { text?: string }) => p.text ?? "").join(" ")
      : ""

  let ragBlock = ""
  if (userQuery) {
    try {
      const chunks = await retrieveContext(userQuery, {
        vertical: client?.vertical ?? undefined,
      })
      if (chunks.length > 0) {
        ragBlock = `\n\nCOMPLIANCE KNOWLEDGE (retrieved from knowledge base — cite these when relevant):\n${chunks
          .map(
            (c, i) =>
              `[${i + 1}] ${c.metadata.title ?? "Untitled"}${c.metadata.standardCode ? ` (${c.metadata.standardCode})` : ""}\n${c.content.slice(0, 500)}`
          )
          .join("\n\n")}`
      }
    } catch (err) {
      console.warn("[api/chat] RAG retrieval failed, continuing without context:", err instanceof Error ? err.message : err)
    }
  }

  const contextBlock = `
CLIENT PROFILE:
- Business: ${client?.business_name ?? "Unknown"}
- Industry: ${client?.vertical ?? "Unknown"}
- Compliance Score: ${client?.compliance_score ?? 0}%
- Risk Level: ${client?.risk_level ?? "Unknown"}
- Plan: ${client?.plan ?? "Unknown"}

RECENT DOCUMENTS (${docs.length}):
${docs.map((d) => `- ${d.type} (${d.status}, ${new Date(d.created_at).toLocaleDateString()})`).join("\n")}

RECENT INCIDENTS (${incidents.length}):
${incidents.map((i) => `- [${i.severity}] ${i.description?.slice(0, 100)} (${i.incident_date}, ${i.location})`).join("\n")}

LATEST REGULATORY UPDATES (${regs.length}):
${regs.map((r) => `- [${r.severity}] ${r.title} (effective: ${r.effective_date ?? "TBD"}) — ${r.summary?.slice(0, 150)}`).join("\n")}${ragBlock}
`.trim()

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: `You are the Protekon Compliance Assistant — an AI compliance advisor for California small and mid-sized businesses. You help clients understand their compliance obligations, interpret regulations, and take action on their compliance posture.

You have access to the client's profile, recent documents, incidents, regulatory updates, and compliance knowledge base below. Use this context to provide personalized, actionable advice. When citing compliance knowledge, reference the specific standard codes.

${contextBlock}

Rules:
- Always reference specific Cal/OSHA standards (e.g., 8 CCR 3203, SB 553) when relevant
- Provide California-specific guidance — do not give generic federal-only advice
- When discussing penalties, use real Cal/OSHA penalty ranges (serious: $18,000+, willful: $72,988 avg)
- If the client asks about something outside their current documents, recommend requesting the relevant document type
- Keep responses concise and actionable — these are busy business owners, not compliance experts
- Never provide legal advice — always recommend consulting with a compliance specialist for legal questions
- Use the client's industry context to tailor recommendations
- When compliance knowledge chunks are provided, cite the specific standard codes and section numbers from them`,
    messages,
    maxOutputTokens: 2000,
  })

  return result.toUIMessageStreamResponse()
}
