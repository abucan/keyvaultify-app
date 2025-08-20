import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteUserProfile } from '../../../../../actions/user-settings'

export default function DangerSettings() {
  return (
    <Card className="w-3/4">
      <CardHeader className="gap-0">
        <CardTitle className="text-base font-bold font-bricolage-grotesque">
          Delete your account
        </CardTitle>
        <CardDescription className="text-sm font-bricolage-grotesque">
          Delete your account and all associated data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* warning icon and message that deleting account is irreversible and it will not end subscription */}
        <div className="flex flex-row items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <p className="text-sm font-bricolage-grotesque text-muted-foreground">
            Deleting your account is irreversible and will not end your
            subscription. For managing your subscription, please visit the{' '}
            <Link href="/settings/billing" className="underline text-primary">
              billing page.
            </Link>
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <ConfirmDialog
          triggerButton={
            <Button variant={'destructive'}>
              <Trash2 className="w-4 h-4" />
              Delete account
            </Button>
          }
          title="Delete your account"
          description="Deleting your account is irreversible and will not end your subscription. For managing your subscription, please visit the billing page."
          onConfirm={deleteUserProfile}
          loadingText="Deleting..."
        />
      </CardFooter>
    </Card>
  )
}
