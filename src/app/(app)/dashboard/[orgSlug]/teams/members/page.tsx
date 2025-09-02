// src/app/(app)/teams/members/page.tsx
import { Role } from '@/types/auth'

import { listTeamMembers } from './actions'
import { columns } from './columns'
import { DataTable } from './data-table'

export default async function MembersPage() {
  const members = await listTeamMembers()
  console.log(members)
  const currentUserRole =
    members.find(m => m._meta.isSelf === true)?.role ?? 'member'

  return (
    <DataTable
      columns={columns}
      data={members}
      currentUserRole={currentUserRole as Role}
    />
  )
}
