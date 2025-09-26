// src/app/(private)/settings/danger/page.tsx
import Link from 'next/link'

import { deleteUserProfileAction } from '@/app/(private)/settings/actions/deleteUserProfileAction'
import { DangerZoneCard } from '@/components/shared/DangerZoneCard'

export default function DangerSettingsPage() {
  return (
    <DangerZoneCard
      title="Delete your account"
      description="Delete your account and all associated data."
      content={
        <>
          Deleting your account is irreversible and will not end your
          subscription. For managing your subscription, please visit the{' '}
          <Link
            href="/settings/billing"
            className="underline font-medium text-primary hover:text-primary-foreground transition-all duration-200"
          >
            billing page
          </Link>
          .
        </>
      }
      formAction={deleteUserProfileAction}
      errorMessages={{
        UNAUTHORIZED: 'Please sign in.',
        USER_NOT_FOUND: 'User not found.'
      }}
    />
  )
}
