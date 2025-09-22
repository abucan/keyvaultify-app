// src/app/(private)/team/invitations/page.tsx
import { columns } from '@/app/(private)/team/invitations/columns'
import { DataTable } from '@/app/(private)/team/invitations/data-table'
import { listTeamInvitations } from '@/server/invitations.actions'

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
