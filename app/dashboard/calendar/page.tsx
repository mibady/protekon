import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { Card } from "@/components/v2/primitives/Card"
import { getCalendarEvents } from "@/lib/actions/calendar"
import { CalendarList } from "@/components/v2/calendar/CalendarList"

export const dynamic = "force-dynamic"

export default async function CalendarPage() {
  const events = await getCalendarEvents()

  return (
    <div className="px-8 pt-10 pb-16 max-w-6xl w-full mx-auto">
      <PageHeader
        eyebrow="MY BUSINESS · CALENDAR"
        title="Every deadline on the horizon."
        subtitle="Expirations, renewals, training, and audit windows — one timeline, ordered by the date that matters."
      />

      <Card>
        <CalendarList events={events} />
      </Card>
    </div>
  )
}
