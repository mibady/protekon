import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import { getAllVerticalBenchmarks } from "@/lib/actions/score"
import IndustriesClient from "./industries-client"

export default async function IndustriesPage() {
  const industries = await getAllVerticalBenchmarks()

  return (
    <main className="min-h-screen bg-void">
      <Nav />
      <IndustriesClient industries={industries} />
      <Footer />
    </main>
  )
}
