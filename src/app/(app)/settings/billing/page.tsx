import { Card, CardContent } from '@/components/ui/card'
import { CreditCard } from 'lucide-react'

export default function BillingSettings() {
  return (
    <div className="w-3/4 flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold font-bricolage-grotesque">
          Choose a Plan
        </h1>
        <p className="text-sm text-muted-foreground font-bricolage-grotesque">
          Choose the plan that best suits your needs.
        </p>
      </div>
      <Card className="py-4 bg-muted">
        <CardContent className="flex flex-row items-center gap-4">
          {/* subscription icon card */}
          <CreditCard className="p-2 bg-white rounded-lg" size={40} />
          <div>
            <h2 className="text-sm font-bold font-bricolage-grotesque">
              On Trial Period
            </h2>
            <p className="text-sm text-muted-foreground font-bricolage-grotesque">
              You&apos;re currently on a trial period. Select a plan to continue
              accessing premium features when your trial ends.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
