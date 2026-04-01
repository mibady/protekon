import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_ADDRESS = "Protekon <compliance@protekon.com>"

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
