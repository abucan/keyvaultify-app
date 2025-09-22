// src/components/billing/ManageBillingCard.tsx

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ManageBillingCard() {
  return (
    <Card className="py-4 bg-muted">
      <CardContent className="flex flex-row items-center justify-between gap-4">
        <Image
          src="/icons/stripe.svg"
          alt="Stripe"
          width={40}
          height={40}
          className="rounded-lg"
        />
        <Button
          asChild
          variant={'outline'}
          className="font-bricolage-grotesque"
        >
          <Link href={`/api/billing/portal`}>
            Manage Billing
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
