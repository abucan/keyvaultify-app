// src/app/(app)/teams/members/page.tsx
import { listTeamMembers } from './actions'
import { columns } from './columns'
import { DataTable } from './data-table'
import { Role } from '@/types/auth'

export default async function MembersPage() {
  const members = await listTeamMembers()
  console.log(members)
  return (
    <DataTable
      columns={columns}
      data={members}
      currentUserRole={members[0].currentUserRole as Role}
    />
  )
}
