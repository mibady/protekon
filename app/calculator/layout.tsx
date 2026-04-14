import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Compliance Risk Calculator | PROTEKON",
  description:
    "Calculate your Cal/OSHA fine exposure by industry and employee count. Built on the full Cal/OSHA enforcement record.",
}

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
