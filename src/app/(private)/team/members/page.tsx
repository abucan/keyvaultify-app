// src/app/(private)/team/members/page.tsx
import { listTeamMembers } from '@/server/members.actions'

import { columns } from './columns'
import { DataTable } from './data-table'

export default async function MembersPage() {
  const members = await listTeamMembers()
  const currentUser =
    members?.ok && members.data?.find(m => m._meta.isSelf === true)

  return (
    <>
      {currentUser && members?.ok && members?.data && (
        <DataTable
          columns={columns}
          data={members?.data}
          currentUser={currentUser}
        />
      )}
    </>
  )
}
