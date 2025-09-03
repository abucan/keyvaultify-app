// src/app/(dashboard)/[orgSlug]/team/members/page.tsx
import { listTeamMembers } from '@/server/members.actions'
import { Role } from '@/types/auth'

import { columns } from './columns'
import { DataTable } from './data-table'

export default async function MembersPage() {
  const members = await listTeamMembers()
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
