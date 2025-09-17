// src/app/(private)/team/settings/page.tsx
import { headers } from 'next/headers'

import { DangerZoneCard } from '@/components/shared/DangerZoneCard'
import { TeamSettingsForm } from '@/components/team/TeamSettingsForm'
import { auth } from '@/lib/better-auth/auth'
import {
  deleteTeamAction,
  updateTeamSettingsAction
} from '@/server/team.actions'

export default async function SettingsPage() {
  const fullTeam = await auth.api.getFullOrganization({
    headers: await headers()
  })
  const metadata = JSON.parse(fullTeam?.metadata ?? '{}')

  return (
    <>
      {fullTeam && (
        <div className="w-full flex flex-col gap-4 mb-6">
          <TeamSettingsForm
            id={fullTeam?.id}
            name={fullTeam?.name}
            slug={fullTeam?.slug}
            logo={fullTeam?.logo ?? ''}
            default_role={metadata?.defaultRole ?? ''}
            updateTeamSettings={updateTeamSettingsAction}
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
