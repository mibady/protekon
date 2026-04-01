import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description: "Protekon delivers California workplace compliance as a managed service. Learn about our mission to make compliance accessible for every business.",
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
