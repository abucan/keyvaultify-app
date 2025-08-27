// src/app/(app)/settings/layout.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings } from 'lucide-react'

import { Card } from '@/components/ui/card'

const settings = [
  {
    title: 'General',
    description: 'Manage your account settings and preferences.',
    href: '/settings/general'
  },
  {
    title: 'Billing',
    description: 'Manage your billing information and subscriptions.',
    href: '/settings/billing'
  },
  {
    title: 'Danger',
    description: 'Delete your account and all associated data.',
    href: '/settings/danger'
  }
]

export default function SettingsLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-bricolage-grotesque">
          Account Settings
        </h1>
        <p className="text-base text-muted-foreground font-bricolage-grotesque">
          Manage your account settings and preferences.
        </p>
      </div>
      <div className="flex flex-row gap-10">
        <Card className="py-2 px-2 h-52">
          <div className="flex flex-col justify-between h-full">
            {settings.map(setting => (
              <Link
                href={setting.href}
                key={setting.title}
                className={`${pathname === setting.href ? 'bg-primary/10' : 'hover:bg-muted'} py-2.5 pl-2 pr-10 rounded-xl`}
              >
                <div className="flex flex-row items-center gap-2">
                  <Settings
                    className={`${pathname === setting.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground bg-muted'} p-1.5 rounded-md mr-1`}
                    width={30}
                    height={30}
                  />
                  <div className="flex flex-col">
                    <p
                      className={`text-base font-bold font-bricolage-grotesque ${pathname === setting.href ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                    >
                      {setting.title}
                    </p>
                    <p
                      className={`text-xs ${pathname === setting.href ? 'text-primary-foreground' : 'text-muted-foreground'} font-bricolage-grotesque`}
                    >
                      {setting.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
        <div className="flex flex-1">{children}</div>
      </div>
    </div>
  )
}
