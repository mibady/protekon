import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Solutions",
  description: "Industry-specific compliance solutions for construction, healthcare, real estate, and general business. California regulatory compliance made simple.",
}

export default function SolutionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
