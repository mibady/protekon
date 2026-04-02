import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sample Reports | PROTEKON",
  description:
    "Download sample compliance documents including SB 553 WVPP, construction subcontractor reports, and property management compliance monitoring.",
}

export default function SamplesLayout({ children }: { children: React.ReactNode }) {
  return children
}
