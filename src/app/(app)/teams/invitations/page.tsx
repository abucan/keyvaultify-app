// src/app/(app)/teams/members/page.tsx
import { listInvitations } from '../members/actions'

import { columns } from './columns'
import { DataTable } from './data-table'

export default async function InvitationsPage() {
  const invitations = await listInvitations()

  console.log(invitations)

  return <DataTable columns={columns} data={invitations} />
}
