// src/components/billing/PricingTables.tsx
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

export function PricingTables() {
  const [frequency, setFrequency] = useState<string>('monthly')

  return (
    <div className="not-prose flex flex-col text-center @container">
      <div className="flex flex-col items-center justify-center gap-4">
        <Tabs
          defaultValue={frequency}
          onValueChange={setFrequency}
          className="w-full items-end"
        >
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
              Yearly
              <Badge variant="secondary">20% off</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="grid w-full max-w-4xl gap-4 @2xl:grid-cols-3">
          {plans.map(plan => (
            <Card
              className={cn(
                'relative w-full text-left',
                plan.popular && 'ring-2 ring-primary'
              )}
              key={plan.id}
            >
              {plan.popular && (
                <Badge className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2 rounded-full">
                  Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="font-medium text-xl">
                  {plan.name}
                </CardTitle>
                <CardDescription>
                  <p>{plan.description}</p>
                  {typeof plan.price[frequency as keyof typeof plan.price] ===
                  'number' ? (
                    <NumberFlow
                      className="font-medium text-foreground"
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
                    <span className="font-medium text-foreground">
                      {plan.price[frequency as keyof typeof plan.price]}.
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {plan.features.map((feature, index) => (
                  <div
                    className="flex items-center gap-2 text-muted-foreground text-sm"
                    key={index}
                  >
                    <BadgeCheck className="h-4 w-4" />
                    {feature}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full"
                  variant={plan.popular ? 'default' : 'secondary'}
                  disabled={plan.id === 'hobby'}
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
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
