import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Protekon compliance team. Schedule a consultation for your California workplace safety needs.",
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
