"use client"

import { useState } from "react"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { Card } from "@/components/v2/primitives/Card"
import { ProjectsTable } from "./ProjectsTable"
import { NewProjectModal } from "./NewProjectModal"
import { ProjectDetailModal } from "./ProjectDetailModal"
import type { Project } from "@/lib/actions/projects"

type AvailableSub = {
  id: string
  company_name: string
  license_number?: string | null
}

type ProjectsPageClientProps = {
  projects: Project[]
  availableSubs: AvailableSub[]
}

export function ProjectsPageClient({
  projects,
  availableSubs,
}: ProjectsPageClientProps) {
  const [newOpen, setNewOpen] = useState(false)
  const [detailProjectId, setDetailProjectId] = useState<string | null>(null)

  return (
    <>
      <div className="mb-6 flex items-center justify-end">
        <CTAButton onClick={() => setNewOpen(true)} icon={false}>
          New project
        </CTAButton>
      </div>

      <Card padding="p-0">
        <ProjectsTable
          projects={projects}
          onRowClick={(id) => setDetailProjectId(id)}
        />
      </Card>

      <NewProjectModal open={newOpen} onClose={() => setNewOpen(false)} />

      <ProjectDetailModal
        projectId={detailProjectId}
        availableSubs={availableSubs}
        onClose={() => setDetailProjectId(null)}
      />
    </>
  )
}
