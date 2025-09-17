// src/app/(private)/team/invitations/page.tsx
import { listTeamInvitations } from '@/server/invitations.actions'

import { columns } from './columns'
import { DataTable } from './data-table'

export default async function InvitationsPage() {
  const invitations = await listTeamInvitations()

  return (
    <>
      {invitations?.ok && invitations?.data && (
        <DataTable columns={columns} data={invitations?.data} />
      )}
    </>
  )
}
