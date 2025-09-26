// src/app/(private)/settings/components/PricingTables.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import NumberFlow from '@number-flow/react'
import { ArrowRight, BadgeCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { plans } from '@/data/plans'
import { cn } from '@/lib/utils'

export function PricingTables({ currentPlan }: { currentPlan?: string }) {
  const [frequency, setFrequency] = useState<string>('monthly')

  return (
    <div className="flex flex-col text-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <Tabs
          defaultValue={frequency}
          onValueChange={setFrequency}
          className="w-full items-end"
        >
          <TabsList>
            <TabsTrigger className="font-bricolage-grotesque" value="monthly">
              Monthly
            </TabsTrigger>
            <TabsTrigger className="font-bricolage-grotesque" value="yearly">
              Yearly (20% off)
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="w-full flex flex-row gap-4">
          {plans.map(plan => (
            <Card
              className={cn(
                'relative w-full text-left',
                plan.popular && 'ring-2 ring-primary'
              )}
              key={plan.id}
            >
              {plan.popular && (
                <Badge className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2 rounded-full font-bricolage-grotesque">
                  Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="font-medium text-xl font-bricolage-grotesque">
                  {plan.name}
                </CardTitle>
                <CardDescription>
                  <p className="font-bricolage-grotesque">{plan.description}</p>
                  {typeof plan.price[frequency as keyof typeof plan.price] ===
                  'number' ? (
                    <NumberFlow
                      className="font-medium text-foreground font-bricolage-grotesque mt-2"
                      format={{
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
                      }}
                      suffix={`/month, billed ${frequency}.`}
                      value={
                        plan.price[
                          frequency as keyof typeof plan.price
                        ] as number
                      }
                    />
                  ) : (
                    <span className="font-medium text-foreground font-bricolage-grotesque">
                      {plan.price[frequency as keyof typeof plan.price]}.
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {plan.features.map((feature, index) => (
                  <div
                    className="flex items-center gap-2 text-muted-foreground text-sm font-bricolage-grotesque"
                    key={index}
                  >
                    <BadgeCheck className="h-4 w-4" />
                    {feature}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                {plan.id === currentPlan ? (
                  <Button
                    className="w-full font-bricolage-grotesque"
                    variant={plan.popular ? 'default' : 'secondary'}
                    disabled={true}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full font-bricolage-grotesque"
                    variant={plan.popular ? 'default' : 'secondary'}
                  >
                    <Link
                      href={
                        plan.id === 'hobby'
                          ? '#'
                          : `/api/billing/checkout?plan=${plan.id}&interval=${frequency}`
                      }
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
