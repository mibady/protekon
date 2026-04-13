import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free California Compliance Score | PROTEKON",
  description:
    "Answer 11 questions. Get your compliance score calculated against 73,960 real Cal/OSHA enforcement records. See exactly what an inspector would cite you for.",
  openGraph: {
    title: "Free California Compliance Score | PROTEKON",
    description:
      "Calculate your Cal/OSHA compliance risk in 2 minutes. No email required.",
  },
}

export default function ScoreLandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
