import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PROTEKON Partner Program",
  description: "Add managed compliance to your service offering",
}

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
