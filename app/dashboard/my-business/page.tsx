import { PageHeader } from "@/components/v2/primitives/PageHeader"
import {
  getClientProfile,
  getNotificationPreferences,
} from "@/lib/actions/settings"
import { listSites } from "@/lib/actions/sites"
import { SettingsPageClient } from "@/components/v2/settings/SettingsPageClient"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function MyBusinessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const requiresPasswordSetup =
    user?.user_metadata?.requires_password_setup === true

  const [profile, sites, notificationPrefs] = await Promise.all([
    getClientProfile(),
    listSites(),
    getNotificationPreferences(),
  ])

  return (
    <div className="px-8 pt-10 pb-16 max-w-6xl w-full mx-auto">
      <PageHeader
        eyebrow="ACCOUNT · MY BUSINESS"
        title="Your account, your rules."
        subtitle="Profile, sites, billing, notifications, security, and data retention — every lever that shapes how Protekon works for you."
      />

      <SettingsPageClient
        profile={profile}
        sites={sites}
        notificationPrefs={notificationPrefs}
        requiresPasswordSetup={requiresPasswordSetup}
      />
    </div>
  )
}
