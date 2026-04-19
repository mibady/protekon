import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { listProjects } from "@/lib/actions/projects"
import { getSubcontractors } from "@/lib/actions/construction"
import { ProjectsPageClient } from "@/components/v2/subs/ProjectsPageClient"

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  const [projects, subs] = await Promise.all([listProjects(), getSubcontractors()])
  return (
    <div className="px-8 pt-10 pb-16 max-w-6xl w-full mx-auto">
      <PageHeader
        eyebrow="MY SUBS · PROJECTS"
        title="Project-level compliance roll-ups."
        subtitle="Which subs are on each project, and whether their coverage and safety programs hold."
      />
      <ProjectsPageClient projects={projects} availableSubs={subs ?? []} />
    </div>
  )
}
