// src/app/(private)/dashboard/page.tsx
import { cookies } from 'next/headers'

import ToastOnce from '@/components/toast-token'

export default async function DashboardPage() {
  const c = await cookies()
  const toast = c.get('kvf_toast')

  return (
    <>
      <div>
        <h1 className="text-2xl font-bricolage-grotesque font-bold">
          Dashboard
        </h1>
      </div>
      <ToastOnce token={toast?.value} />
    </>
  )
}
