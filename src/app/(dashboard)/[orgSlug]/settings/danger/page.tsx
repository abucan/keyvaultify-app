// src/app/(dashboard)/[orgSlug]/settings/danger/page.tsx
import { DangerZoneCard } from '@/components/shared/DangerZoneCard'
import { deleteUserProfileAction } from '@/server/settings.actions'

export default function DangerSettingsPage() {
  return (
    <DangerZoneCard
      title="Delete your account"
      description="Delete your account and all associated data."
      content="Deleting your account is irreversible and will not end your subscription. To delete your account, please make sure you only have one organization and are the only owner of the organization. For managing your subscription, please visit the billing page."
      onConfirm={deleteUserProfileAction}
      loadingText="Deleting..."
    />
  )
}
