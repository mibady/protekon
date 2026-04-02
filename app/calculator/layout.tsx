import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Compliance Risk Calculator | PROTEKON",
  description:
    "Calculate your Cal/OSHA fine exposure by industry and employee count. Based on 73,960 real violation records across California.",
}

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
