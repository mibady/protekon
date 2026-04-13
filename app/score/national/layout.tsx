import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free OSHA Compliance Score — All 50 States | PROTEKON",
  description:
    "Answer 11 questions. Get your compliance score calculated against 431,000+ real OSHA enforcement records. Every state, every industry. No email required.",
  openGraph: {
    title: "Free OSHA Compliance Score — All 50 States | PROTEKON",
    description:
      "Calculate your OSHA compliance risk in 2 minutes. 431,000+ enforcement records. 27 industries. All 50 states.",
  },
}

export default function ScoreNationalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
