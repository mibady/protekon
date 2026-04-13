import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free California Compliance Score | PROTEKON",
  description:
    "Take a quick compliance assessment. Get your score calculated against real Cal/OSHA enforcement data. Instant results. Personalized gap analysis.",
  openGraph: {
    title: "Free California Compliance Score | PROTEKON",
    description:
      "Calculate your Cal/OSHA compliance risk in 2 minutes. Instant results. Personalized gap analysis.",
  },
}

export default function ScoreLandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
