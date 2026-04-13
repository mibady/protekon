import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free OSHA Compliance Score — All 50 States | PROTEKON",
  description:
    "Take a quick compliance assessment. Get your score calculated against real OSHA enforcement data. Every state, every industry. Instant results. Personalized gap analysis.",
  openGraph: {
    title: "Free OSHA Compliance Score — All 50 States | PROTEKON",
    description:
      "Calculate your OSHA compliance risk in 2 minutes. Real enforcement data. 27 industries. All 50 states.",
  },
}

export default function ScoreNationalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
