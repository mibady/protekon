import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/resend"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://protekon.vercel.app"

export const scoreDrip = inngest.createFunction(
  { id: "score-drip-sequence", name: "Score Lead Drip Sequence", triggers: [{ event: "score/lead.created" }] },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ({ event, step }: { event: any; step: any }) => {
    const {
      email,
      name,
      score,
      gaps,
      industry,
      fine_low,
      fine_high,
      lead_id,
    } = event.data

    const supabase = createAdminClient()

    // Email 1 — 24 hours: "Your compliance gaps are still open"
    await step.sleep("wait-24h", "1 day")
    await step.run("send-24h-gaps-open", async () => {
      const { data: lead } = await supabase
        .from("compliance_score_leads")
        .select("unsubscribed_at, converted_to_intake")
        .eq("id", lead_id)
        .single()
      if (lead?.unsubscribed_at) return { skipped: true, reason: "unsubscribed" }
      if (lead?.converted_to_intake) return { skipped: true, reason: "converted" }

      await sendEmail({
        to: email,
        subject: "Your compliance gaps are still open",
        html: buildEmail1(name, score, gaps, industry, fine_low, fine_high, lead_id),
      })
      await supabase
        .from("compliance_score_leads")
        .update({ drip_day3_sent_at: new Date().toISOString() })
        .eq("id", lead_id)
    })

    // Email 2 — 72 hours: "What a Cal/OSHA citation actually costs"
    await step.sleep("wait-72h", "2 days")
    await step.run("send-72h-citation-cost", async () => {
      const { data: lead } = await supabase
        .from("compliance_score_leads")
        .select("unsubscribed_at, converted_to_intake")
        .eq("id", lead_id)
        .single()
      if (lead?.unsubscribed_at) return { skipped: true, reason: "unsubscribed" }
      if (lead?.converted_to_intake) return { skipped: true, reason: "converted" }

      await sendEmail({
        to: email,
        subject: "What a Cal/OSHA citation actually costs",
        html: buildEmail2(name, gaps, industry, fine_low, fine_high, lead_id),
      })
      await supabase
        .from("compliance_score_leads")
        .update({ drip_day7_sent_at: new Date().toISOString() })
        .eq("id", lead_id)
    })

    // Email 3 — 7 days: "Close [N] compliance gaps in 48 hours"
    await step.sleep("wait-7d", "4 days")
    await step.run("send-7d-close-gaps", async () => {
      const { data: lead } = await supabase
        .from("compliance_score_leads")
        .select("unsubscribed_at, converted_to_intake")
        .eq("id", lead_id)
        .single()
      if (lead?.unsubscribed_at) return { skipped: true, reason: "unsubscribed" }
      if (lead?.converted_to_intake) return { skipped: true, reason: "converted" }

      await sendEmail({
        to: email,
        subject: `Close ${gaps.length} compliance gap${gaps.length !== 1 ? "s" : ""} in 48 hours`,
        html: buildEmail3(name, score, gaps, industry, fine_low, fine_high, lead_id),
      })
      await supabase
        .from("compliance_score_leads")
        .update({ drip_day14_sent_at: new Date().toISOString() })
        .eq("id", lead_id)
    })

    return { sent: 3, email, lead_id }
  }
)

// ---------------------------------------------------------------------------
// Email builders — inline-styled HTML, no external CSS
// ---------------------------------------------------------------------------

type Gap = { key: string; label: string; description: string; citation?: string; fine?: number }

function wrapper(lead_id: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
<!-- Crimson header bar -->
<tr><td style="background:#dc2626;height:6px;"></td></tr>
<tr><td style="padding:32px 40px 8px;">
  <strong style="font-size:20px;color:#18181b;letter-spacing:-0.5px;">PROTEKON</strong>
</td></tr>
<tr><td style="padding:0 40px 32px;">
${content}
</td></tr>
<!-- Footer -->
<tr><td style="padding:24px 40px;background:#fafafa;border-top:1px solid #e4e4e7;">
  <p style="margin:0;font-size:12px;color:#71717a;line-height:1.6;">
    This email was sent because you completed a compliance assessment on PROTEKON.<br>
    <a href="${appUrl}/api/score/unsubscribe?id=${lead_id}" style="color:#71717a;text-decoration:underline;">Unsubscribe</a>
  </p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function ctaButton(text: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr><td style="background:#dc2626;border-radius:6px;padding:14px 28px;">
  <a href="${href}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">${text}</a>
</td></tr>
</table>`
}

function getTopGap(gaps: Gap[]): Gap | null {
  if (gaps.length === 0) return null
  // Sort by fine descending, pick the highest
  const sorted = [...gaps].sort((a, b) => (b.fine ?? 25000) - (a.fine ?? 25000))
  return sorted[0]
}

// Email 1 — 24 hours: Recap score, highlight #1 gap, fine exposure
function buildEmail1(
  name: string,
  score: number,
  gaps: Gap[],
  industry: string,
  fine_low: number,
  fine_high: number,
  lead_id: string,
): string {
  const topGap = getTopGap(gaps)

  const topGapBlock = topGap
    ? `<p style="font-size:15px;color:#3f3f46;line-height:1.8;background:#fef2f2;padding:16px;border-radius:6px;border-left:4px solid #dc2626;">
  <strong style="color:#dc2626;">Your #1 gap: ${topGap.label}</strong><br><br>
  ${topGap.description}${topGap.citation ? `<br><br><span style="font-size:13px;color:#71717a;">${topGap.citation} — up to $${(topGap.fine ?? 25000).toLocaleString()} per citation</span>` : ""}
</p>`
    : ""

  const content = `
<h1 style="font-size:22px;color:#18181b;margin:16px 0 8px;">Your compliance gaps are still open.</h1>
<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Hi ${name},
</p>
<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Yesterday you scored <strong style="font-size:18px;color:${score <= 2 ? "#dc2626" : score <= 4 ? "#ca8a04" : "#16a34a"};">${score}/6</strong> on your SB 553 compliance assessment. That means ${gaps.length} open gap${gaps.length !== 1 ? "s" : ""} that a Cal/OSHA inspector would cite on a walkthrough.
</p>

${topGapBlock}

<h2 style="font-size:16px;color:#18181b;margin:24px 0 8px;">Your fine exposure</h2>
<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Based on your ${industry} business with ${gaps.length} gap${gaps.length !== 1 ? "s" : ""}, a single inspection could result in
  <strong style="color:#dc2626;">$${fine_low.toLocaleString()} — $${fine_high.toLocaleString()}</strong> in citations.
  That's not a worst case — it's the published penalty schedule for what you're missing.
</p>

<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Every day these gaps stay open is another day you're exposed. We close them in 48 hours.
</p>

${ctaButton("Start Intake &rarr;", `${appUrl}/contact`)}
`

  return wrapper(lead_id, content)
}

// Email 2 — 72 hours: Real citation example in their industry
function buildEmail2(
  name: string,
  gaps: Gap[],
  industry: string,
  fine_low: number,
  fine_high: number,
  lead_id: string,
): string {
  const topGap = getTopGap(gaps)
  const gapLabel = topGap?.label ?? "missing compliance documentation"

  const content = `
<h1 style="font-size:22px;color:#18181b;margin:16px 0 8px;">What a Cal/OSHA citation actually costs.</h1>
<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Hi ${name},
</p>
<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Here's a real scenario. A ${industry} employer in California was cited for ${gapLabel.toLowerCase()}. The inspector arrived unannounced on a Tuesday morning. The owner thought they were compliant.
</p>

<p style="font-size:15px;color:#3f3f46;line-height:1.8;background:#fef9c3;padding:16px;border-radius:6px;border-left:4px solid #ca8a04;">
  <strong>The result:</strong> $25,000 initial citation. The employer contested it, which triggered a full-scope inspection. Two additional violations were found. Total: $57,000 in penalties, plus $12,000 in legal fees to negotiate down to $38,000.<br><br>
  The compliance program that would have prevented all of it? Less than $600/month.
</p>

<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Your assessment showed ${gaps.length} gap${gaps.length !== 1 ? "s" : ""} with an estimated exposure of <strong>$${fine_low.toLocaleString()} — $${fine_high.toLocaleString()}</strong>. Citations don't come with payment plans, and they're public record — which means your clients, partners, and insurers can see them.
</p>

<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  The math is simple: fix it now for $597/month, or wait for the knock on the door.
</p>

${ctaButton("Start Intake &rarr;", `${appUrl}/contact`)}
`

  return wrapper(lead_id, content)
}

// Email 3 — 7 days: Final push, score recap, $597/mo value prop
function buildEmail3(
  name: string,
  score: number,
  gaps: Gap[],
  industry: string,
  fine_low: number,
  fine_high: number,
  lead_id: string,
): string {
  const gapListHtml = gaps
    .map(
      (g) =>
        `<li style="margin-bottom:6px;"><strong>${g.label}</strong> — ${g.citation ?? ""} (up to $${(g.fine ?? 25000).toLocaleString()})</li>`
    )
    .join("")

  const content = `
<h1 style="font-size:22px;color:#18181b;margin:16px 0 8px;">${name}, close ${gaps.length} gap${gaps.length !== 1 ? "s" : ""} in 48 hours.</h1>
<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  A week ago, you scored <strong>${score}/6</strong> on your SB 553 compliance assessment. Those gaps are still open:
</p>

<ul style="font-size:14px;color:#3f3f46;line-height:1.8;padding-left:20px;">
${gapListHtml}
</ul>

<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Total exposure: <strong style="color:#dc2626;">$${fine_low.toLocaleString()} — $${fine_high.toLocaleString()}</strong>
</p>

<h2 style="font-size:16px;color:#18181b;margin:24px 0 8px;">What $597/month gets you</h2>
<ul style="font-size:14px;color:#3f3f46;line-height:2;padding-left:20px;">
  <li><strong>Site-specific WVPP</strong> written for your ${industry} business</li>
  <li><strong>PII-scrubbed incident log</strong> that meets SB 553 requirements</li>
  <li><strong>Annual training program</strong> with completion tracking</li>
  <li><strong>Audit-ready compliance package</strong> available on demand</li>
  <li><strong>Regulatory monitoring</strong> — we track changes so you don't have to</li>
  <li><strong>AI Compliance Officer</strong> — your dedicated compliance dashboard</li>
</ul>

<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  No long-term contract. No setup meetings. Fill out the intake form, and we generate your complete compliance program in 48 hours.
</p>

${ctaButton("Start Intake &rarr;", `${appUrl}/contact`)}

<p style="font-size:13px;color:#71717a;line-height:1.6;margin-top:16px;">
  This is the last email in this sequence. Your score report stays available if you need it later.
</p>
`

  return wrapper(lead_id, content)
}
