import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { listTeamMembers } from "@/lib/actions/team"
import { TeamPageClient } from "@/components/v2/team/TeamPageClient"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function TeamPage() {
  const [{ members, pending }, supabase] = await Promise.all([
    listTeamMembers(),
    createClient(),
  ])
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
      <div className="px-10 pt-10">
        <PageHeader
          eyebrow="ACCOUNT · TEAM & PERMISSIONS"
          title="Invite the people who help you stay compliant."
          subtitle="Owners run the show. Compliance managers handle the day-to-day. Field leads log incidents and training. Auditors read everything, change nothing."
        />
      </div>
      <TeamPageClient
        members={members}
        pending={pending}
        currentUserId={user?.id ?? ""}
      />
    </>
  )
}
