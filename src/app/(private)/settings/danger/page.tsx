// src/app/(private)/settings/danger/page.tsx
'use client'
import { useRouter } from 'next/navigation'

import { DangerZoneCard } from '@/components/shared/DangerZoneCard'
import { toastRes } from '@/components/toast-result'
import { deleteUserProfileAction } from '@/server/settings.actions'
import { R } from '@/types/api-results'

export default function DangerSettingsPage() {
  const router = useRouter()
  const onConfirm = async (): Promise<R> => {
    const res = await deleteUserProfileAction()

    toastRes(res, {
      success: 'Account deleted successfully.',
      errors: {
        UNAUTHORIZED: 'Please sign in.',
        USER_NOT_FOUND: 'User not found.'
      }
    })

    if (res.ok) router.replace('/signin')
    return res
  }

  return (
    <DangerZoneCard
      title="Delete your account"
      description="Delete your account and all associated data."
      content="Deleting your account is irreversible and will not end your subscription. To delete your account, please make sure you only have one organization and are the only owner of the organization. For managing your subscription, please visit the billing page."
      onConfirm={onConfirm}
      loadingText="Deleting..."
    />
  )
}
