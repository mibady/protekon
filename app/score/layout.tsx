import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Compliance Score Calculator | PROTEKON",
  description: "Calculate your California compliance risk score. Free assessment covering Cal/OSHA, SB 553, IIPP, and industry-specific regulations.",
}

export default function ScoreLayout({ children }: { children: React.ReactNode }) {
  return children
}
