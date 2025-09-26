// src/app/(private)/team/members/page.tsx
import { MembersColumns } from '@/app/(private)/team/_components/MembersColumns'
import { MembersDataTable } from '@/app/(private)/team/_components/MembersDataTable'
import { getTeamMembers } from '@/app/(private)/team/_data/team.queries'

export default async function MembersPage() {
  const members = await getTeamMembers()
  const currentUser =
    members?.ok && members.data?.find(m => m._meta.isSelf === true)

  return (
    <>
      {currentUser && members?.ok && members?.data && (
        <MembersDataTable
          columns={MembersColumns}
          data={members?.data}
          currentUser={currentUser}
        />
      )}
    </>
  )
}
