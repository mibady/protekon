import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { getTrainingRecords } from "@/lib/actions/training"
import { TrainingPageClient } from "@/components/v2/training/TrainingPageClient"
import type { TrainingRecord } from "@/components/v2/training/TrainingTable"

export const dynamic = "force-dynamic"

export default async function TrainingPage() {
  const raw = await getTrainingRecords()
  const records = (raw ?? []) as unknown as TrainingRecord[]

  return (
    <div className="px-8 pt-10 pb-16 max-w-6xl w-full mx-auto">
      <PageHeader
        eyebrow="MY BUSINESS · TRAINING LOG"
        title="Who was trained on what, when, and by whom."
        subtitle="Every row is a defensible training record under 8 CCR §3203(a)(7). Log in the field, review here."
      />
      <TrainingPageClient records={records} />
    </div>
  )
}
