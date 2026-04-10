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

    // Day 0 — Score Report Delivery
    await step.run("send-day0-report", async () => {
      await sendEmail({
        to: email,
        subject: `Your compliance score: ${score}/6 — here's what it means`,
        html: buildDay0Email(name, score, gaps, industry, fine_low, fine_high, lead_id),
      })
      await supabase
        .from("compliance_score_leads")
        .update({ report_sent_at: new Date().toISOString() })
        .eq("id", lead_id)
    })

    // Day 3 — The Inspection Scenario
    await step.sleep("wait-day3", "3 days")
    await step.run("send-day3-inspection", async () => {
      const { data: lead } = await supabase
        .from("compliance_score_leads")
        .select("unsubscribed_at")
        .eq("id", lead_id)
        .single()
      if (lead?.unsubscribed_at) return { skipped: true, reason: "unsubscribed" }

      await sendEmail({
        to: email,
        subject: `What a Cal/OSHA inspection looks like for a ${industry} business with your score`,
        html: buildDay3Email(name, score, gaps, industry, lead_id),
      })
      await supabase
        .from("compliance_score_leads")
        .update({ drip_day3_sent_at: new Date().toISOString() })
        .eq("id", lead_id)
    })

    // Day 7 — The Sample Deliverable
    await step.sleep("wait-day7", "4 days")
    await step.run("send-day7-sample", async () => {
      const { data: lead } = await supabase
        .from("compliance_score_leads")
        .select("unsubscribed_at")
        .eq("id", lead_id)
        .single()
      if (lead?.unsubscribed_at) return { skipped: true, reason: "unsubscribed" }

      await sendEmail({
        to: email,
        subject: `Here's the exact compliance plan we'd generate for a ${industry} business like yours`,
        html: buildDay7Email(name, industry, lead_id),
      })
      await supabase
        .from("compliance_score_leads")
        .update({ drip_day7_sent_at: new Date().toISOString() })
        .eq("id", lead_id)
    })

    // Day 14 — The Cost Comparison
    await step.sleep("wait-day14", "7 days")
    await step.run("send-day14-cost", async () => {
      const { data: lead } = await supabase
        .from("compliance_score_leads")
        .select("unsubscribed_at")
        .eq("id", lead_id)
        .single()
      if (lead?.unsubscribed_at) return { skipped: true, reason: "unsubscribed" }

      await sendEmail({
        to: email,
        subject: `You're spending more than $597/month on compliance — you just don't see the invoice`,
        html: buildDay14Email(name, fine_low, fine_high, industry, lead_id),
      })
      await supabase
        .from("compliance_score_leads")
        .update({ drip_day14_sent_at: new Date().toISOString() })
        .eq("id", lead_id)
    })

    // Day 21 — Direct CTA
    await step.sleep("wait-day21", "7 days")
    await step.run("send-day21-cta", async () => {
      const { data: lead } = await supabase
        .from("compliance_score_leads")
        .select("unsubscribed_at")
        .eq("id", lead_id)
        .single()
      if (lead?.unsubscribed_at) return { skipped: true, reason: "unsubscribed" }

      await sendEmail({
        to: email,
        subject: `Your compliance score hasn't changed in 3 weeks`,
        html: buildDay21Email(name, score, gaps.length, industry, lead_id),
      })
      await supabase
        .from("compliance_score_leads")
        .update({ drip_day21_sent_at: new Date().toISOString() })
        .eq("id", lead_id)
    })

    return { sent: 5, email, lead_id }
  }
)

// ---------------------------------------------------------------------------
// Email builders — inline-styled HTML, no external CSS
// ---------------------------------------------------------------------------

type Gap = { key: string; label: string; description: string }

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

// Day 0 — Score Report Delivery
function buildDay0Email(
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
        `<li style="margin-bottom:8px;"><strong>${g.label}</strong> — ${g.description}</li>`
    )
    .join("")

  const content = `
<h1 style="font-size:22px;color:#18181b;margin:16px 0 8px;">Hi ${name},</h1>
<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Your AI compliance officer just finished scanning California workplace regulations against your ${industry} business. Your compliance score is <strong style="font-size:18px;color:${score <= 2 ? "#dc2626" : score <= 4 ? "#ca8a04" : "#16a34a"};">${score}/6</strong>.
  Here's what that means.
</p>

<h2 style="font-size:16px;color:#18181b;margin:24px 0 8px;">Open gaps</h2>
<ul style="font-size:14px;color:#3f3f46;line-height:1.7;padding-left:20px;">
${gapListHtml || "<li>None — you're in great shape.</li>"}
</ul>

<h2 style="font-size:16px;color:#18181b;margin:24px 0 8px;">Fine exposure</h2>
<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Based on your gaps, a single Cal/OSHA inspection could cost between
  <strong>$${fine_low.toLocaleString()}</strong> and <strong>$${fine_high.toLocaleString()}</strong>.
  That's not a worst case — it's the standard penalty schedule for what you're missing.
</p>

<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Your AI compliance officer put together a detailed report with specifics on each gap, the regulation behind it, and what "fixed" looks like.
</p>

${ctaButton("View your full report &rarr;", `${appUrl}/api/score/report?id=${lead_id}`)}

<p style="font-size:13px;color:#71717a;line-height:1.6;">
  No pitch. Just data. Over the next few weeks we'll send a few more emails with context on what these gaps mean in practice.
</p>`

  return wrapper(lead_id, content)
}

// Day 3 — The Inspection Scenario
function buildDay3Email(
  name: string,
  score: number,
  gaps: Gap[],
  industry: string,
  lead_id: string,
): string {
  const hasIipp = !gaps.some((g) => g.key === "has_iipp")
  const hasIncidentLog = !gaps.some((g) => g.key === "has_incident_log")
  const hasTraining = !gaps.some((g) => g.key === "training_current")

  const iippLine = hasIipp
    ? "They ask for your Injury and Illness Prevention Program. You hand it over — good start."
    : "They ask for your Injury and Illness Prevention Program. You don't have one. That's an automatic citation — typically $3,000 to $7,000."
  const logLine = hasIncidentLog
    ? "They check your 300 log. It's current. No issues there."
    : "They check your 300 log. It's incomplete or missing. Another citation."
  const trainingLine = hasTraining
    ? "They ask about your training records. Everything checks out."
    : "They ask for training documentation. You can't produce records showing employees were trained. That's a per-employee violation."

  const content = `
<h1 style="font-size:22px;color:#18181b;margin:16px 0 8px;">${name}, picture this.</h1>
<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  It's a Tuesday morning. A Cal/OSHA inspector walks into your ${industry} business at 9am. No warning — that's how it works. Here's what happens next.
</p>

<p style="font-size:15px;color:#3f3f46;line-height:1.8;background:#fef9c3;padding:16px;border-radius:6px;border-left:4px solid #ca8a04;">
  ${iippLine}<br><br>
  ${logLine}<br><br>
  ${trainingLine}
</p>

<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  You scored ${score}/6. That means ${gaps.length} gap${gaps.length !== 1 ? "s" : ""} an inspector would find. Not "might find" — <em>would</em> find. These aren't obscure regulations. They're the first things on the checklist.
</p>

<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  The good news: every one of those gaps is fixable. Most take less than a week when someone knows what they're doing.
</p>

${ctaButton("Close your gaps before that scenario becomes real &rarr;", `${appUrl}/pricing`)}
`

  return wrapper(lead_id, content)
}

// Day 7 — The Sample Deliverable
function buildDay7Email(name: string, industry: string, lead_id: string): string {
  const content = `
<h1 style="font-size:22px;color:#18181b;margin:16px 0 8px;">What "done-for-you" actually looks like</h1>
<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Hi ${name},
</p>
<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Most ${industry} business owners know they have compliance gaps. The problem isn't awareness — it's bandwidth. You don't have time to research Cal/OSHA regulations, draft programs, train your team, and maintain documentation.
</p>

<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  That's what your AI compliance officer handles. Here's a sample of what a Protekon client in your space receives:
</p>

<ul style="font-size:14px;color:#3f3f46;line-height:2;padding-left:20px;">
  <li><strong>Custom IIPP</strong> — tailored to your industry, locations, and hazards</li>
  <li><strong>Training schedule</strong> — mapped to your team size with completion tracking</li>
  <li><strong>Incident log system</strong> — pre-configured 300/300A with auto-reminders</li>
  <li><strong>Inspection prep binder</strong> — everything an inspector asks for, organized</li>
  <li><strong>Monthly compliance report</strong> — so you always know where you stand</li>
</ul>

<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  We generate the first draft of your compliance program within 48 hours of signup. Not a template — a real program built from your assessment answers.
</p>

${ctaButton("Get yours in 48 hours &rarr;", `${appUrl}/signup`)}
`

  return wrapper(lead_id, content)
}

// Day 14 — The Cost Comparison
function buildDay14Email(
  name: string,
  fine_low: number,
  fine_high: number,
  industry: string,
  lead_id: string,
): string {
  const content = `
<h1 style="font-size:22px;color:#18181b;margin:16px 0 8px;">The compliance bill you're already paying</h1>
<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Hi ${name},
</p>
<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Most ${industry} business owners think compliance costs start when they hire someone. In reality, you're already paying — you just don't see the invoice.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;font-size:14px;">
  <tr style="background:#f4f4f5;">
    <td style="padding:12px 16px;font-weight:600;color:#18181b;">Approach</td>
    <td style="padding:12px 16px;font-weight:600;color:#18181b;">Annual Cost</td>
  </tr>
  <tr>
    <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;color:#3f3f46;">DIY (your time)</td>
    <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;color:#3f3f46;">8-12 hrs/month &times; your rate</td>
  </tr>
  <tr>
    <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;color:#3f3f46;">Safety consultant</td>
    <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;color:#3f3f46;">$2,000-$5,000/month</td>
  </tr>
  <tr>
    <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;color:#3f3f46;">One Cal/OSHA citation</td>
    <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;color:#3f3f46;">$${fine_low.toLocaleString()}-$${fine_high.toLocaleString()}</td>
  </tr>
  <tr style="background:#fef2f2;">
    <td style="padding:12px 16px;font-weight:600;color:#dc2626;">Doing nothing</td>
    <td style="padding:12px 16px;font-weight:600;color:#dc2626;">All of the above, eventually</td>
  </tr>
  <tr style="background:#f0fdf4;">
    <td style="padding:12px 16px;font-weight:600;color:#16a34a;">Protekon</td>
    <td style="padding:12px 16px;font-weight:600;color:#16a34a;">$597/month</td>
  </tr>
</table>

<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  $597 per month gets you an AI compliance officer that manages your entire program — documents, training tracking, incident management, and a dedicated compliance dashboard. Cancel anytime.
</p>

<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Compare that to your fine exposure of <strong>$${fine_low.toLocaleString()}-$${fine_high.toLocaleString()}</strong> from a single inspection. The math isn't close.
</p>

${ctaButton("See what $597/month actually buys &rarr;", `${appUrl}/pricing`)}
`

  return wrapper(lead_id, content)
}

// Day 21 — Direct CTA
function buildDay21Email(
  name: string,
  score: number,
  gapCount: number,
  industry: string,
  lead_id: string,
): string {
  const content = `
<h1 style="font-size:22px;color:#18181b;margin:16px 0 8px;">${name}, a straight question.</h1>
<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Three weeks ago, you scored <strong>${score}/6</strong> on your California compliance assessment. That means ${gapCount} open gap${gapCount !== 1 ? "s" : ""} that would show up on an inspection.
</p>

<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  Those gaps are still open. Nothing has changed unless you've taken action.
</p>

<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  We work with ${industry} businesses across California. The ones who sign up fix their gaps within the first two weeks. The ones who don't eventually get that knock on the door.
</p>

<p style="font-size:15px;color:#3f3f46;line-height:1.7;">
  There's no long-term contract. No setup meeting that wastes your morning. You fill out the intake, we generate your compliance program in 48 hours, and you get back to running your business.
</p>

${ctaButton("Start your intake now &rarr;", `${appUrl}/signup`)}

<p style="font-size:13px;color:#71717a;line-height:1.6;margin-top:16px;">
  This is the last email in this sequence. If now isn't the right time, no hard feelings. Your score report stays available if you need it later.
</p>
`

  return wrapper(lead_id, content)
}
