import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { listSafetyPrograms } from "@/lib/actions/safety-programs"
import { SAFETY_PROGRAM_TEMPLATES } from "@/lib/data/safety-program-templates"
import { getSubcontractors } from "@/lib/actions/construction"
import { SafetyProgramsMatrix } from "@/components/v2/subs/SafetyProgramsMatrix"

/**
 * Safety Programs dashboard surface.
 *
 * Renders a subs × 8 program-type matrix. Click a cell to open the detail
 * drawer which upserts the program document and lets a reviewer approve /
 * reject.
 */
export const dynamic = "force-dynamic"

type SubRow = {
  id: string
  company_name: string | null
}

export default async function SafetyProgramsPage() {
  const [programs, subsRaw] = await Promise.all([
    listSafetyPrograms(),
    getSubcontractors(),
  ])

  // getSubcontractors returns `v_construction_subs_dashboard` rows — we only
  // need id + company_name for the matrix rows.
  const subs: SubRow[] = (subsRaw as Array<Record<string, unknown>>).map(
    (r) => ({
      id: String(r.id ?? ""),
      company_name: (r.company_name as string | null) ?? null,
    })
  )

  const programTemplates = Object.entries(SAFETY_PROGRAM_TEMPLATES).map(
    ([type, meta]) => ({ type, ...meta })
  )

  return (
    <>
      <PageHeader
        eyebrow="MY SUBS · SAFETY PROGRAMS"
        title="IIPP, HazCom, Heat — every plan per sub, every deadline visible."
        subtitle="Upload each sub's program once, track its effective date, and surface the ones about to expire before a Cal/OSHA inspector does."
      />
      <SafetyProgramsMatrix
        subs={subs}
        programs={programs}
        templates={programTemplates}
      />
    </>
  )
}
