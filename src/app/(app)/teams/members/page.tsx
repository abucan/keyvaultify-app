// src/app/(app)/teams/members/page.tsx
import { listTeamMembers } from './actions'
import { columns } from './columns'
import { DataTable } from './data-table'

export default async function MembersPage() {
  const members = await listTeamMembers()

  return <DataTable columns={columns} data={members} />
}
