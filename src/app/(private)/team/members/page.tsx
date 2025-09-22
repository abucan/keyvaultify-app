// src/app/(private)/team/members/page.tsx
import { columns } from '@/app/(private)/team/members/columns'
import { DataTable } from '@/app/(private)/team/members/data-table'
import { listTeamMembers } from '@/server/members.actions'

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
