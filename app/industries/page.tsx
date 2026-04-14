import type { Metadata } from "next"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import IndustriesClient from "./industries-client"

export const metadata: Metadata = {
  title: "Industries We Serve | PROTEKON",
  description:
    "PROTEKON provides done-for-you compliance across 27 industry verticals. Construction, manufacturing, healthcare, hospitality, warehouse, agriculture, retail, transportation, real estate, automotive, and more.",
}

export default function IndustriesPage() {
  return (
    <main className="min-h-screen bg-void">
      <Nav />
      <IndustriesClient />
      <Footer />
    </main>
  )
}
