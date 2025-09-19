// src/app/(private)/team/settings/page.tsx
import { DangerZoneCard } from '@/components/shared/DangerZoneCard'
import { TeamSettingsForm } from '@/components/team/TeamSettingsForm'
import {
  deleteTeamAction,
  getTeamInformation,
  updateTeamSettingsAction
} from '@/server/team.actions'

export default async function SettingsPage() {
  const res = await getTeamInformation()
  const metadata = res?.ok
    ? JSON.parse(res?.data?.organization?.metadata ?? '{}')
    : {}

  return (
    <>
      {res?.ok && res?.data && (
        <div className="w-full flex flex-col gap-4 mb-6">
          <TeamSettingsForm
            id={res?.data?.organization?.id}
            name={res?.data?.organization?.name}
            slug={res?.data?.organization?.slug}
            logo={res?.data?.organization?.logo ?? '/shadcn.jfif'}
            default_role={metadata?.default_role}
            isPersonal={metadata?.isPersonal}
            updateTeamSettings={updateTeamSettingsAction}
            hasPermission={res?.data?.hasPermission}
          />
          <DangerZoneCard
            title="Delete team"
            description="Delete your team and all associated data."
            content={
              <>
                Deleting your team is irreversible and will not end your
                subscription. To delete your team, please make sure you are the
                only owner of the team.
              </>
            }
            formAction={deleteTeamAction}
            hasPermission={res?.data?.hasPermission}
            errorMessages={{
              UNAUTHORIZED: 'Please sign in.',
              USER_NOT_FOUND: 'User not found.'
            }}
          />
        </div>
      )}
    </>
  )
}
