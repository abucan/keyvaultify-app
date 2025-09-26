// src/app/(private)/team/invitations/page.tsx
import { InvitationsColumns } from '@/app/(private)/team/_components/InvitationsColumns'
import { InvitationsDataTable } from '@/app/(private)/team/_components/InvitationsDataTable'
import { getTeamInvitations } from '@/app/(private)/team/_data/team.queries'

export default async function InvitationsPage() {
  const invitations = await getTeamInvitations()

  return (
    <>
      {invitations?.ok && invitations?.data && (
        <InvitationsDataTable
          columns={InvitationsColumns}
          data={invitations?.data}
        />
      )}
    </>
  )
}
