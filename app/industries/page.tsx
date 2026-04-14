import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import IndustriesClient from "./industries-client"

export default function IndustriesPage() {
  return (
    <main className="min-h-screen bg-void">
      <Nav />
      <IndustriesClient />
      <Footer />
    </main>
  )
}
