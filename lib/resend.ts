import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// FROM domain must be a verified sender at Resend. Override per-environment via
// RESEND_FROM in Vercel env. Default uses .org because that matches the live alias
// www.protekon.org; the previous .com default silently broke deliverability.
const FROM_ADDRESS = process.env.RESEND_FROM ?? "Protekon <compliance@protekon.org>"

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!resend) {
    console.log(`[email-dev] To: ${to} | Subject: ${subject}`)
    return null
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  })

  if (error) {
    throw new Error(`Failed to send email to ${to}: ${error.message}`)
  }

  return data
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://protekon.com"
}

export function getComplianceOfficerEmail(): string {
  const email = process.env.COMPLIANCE_OFFICER_EMAIL
  if (!email) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("COMPLIANCE_OFFICER_EMAIL env var is required in production")
    }
    return "compliance@protekon.com"
  }
  return email
}
