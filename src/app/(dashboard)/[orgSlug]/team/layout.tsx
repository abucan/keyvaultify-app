// src/app/(dashboard)/[orgSlug]/team/layout.tsx
'use client'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { Settings } from 'lucide-react'

import { Card } from '@/components/ui/card'

export default function TeamsLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { orgSlug } = useParams<{ orgSlug: string }>() as { orgSlug?: string }

  const base = `/${orgSlug}/team`

  const teams = [
    {
      title: 'Members',
      description: 'Manage your team members.',
      href: `${base}/members`
    },
    {
      title: 'Invitations',
      description: 'Manage your team invitations.',
      href: `${base}/invitations`
    },
    {
      title: 'Settings',
      description: 'Manage your team settings.',
      href: `${base}/settings`
    }
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-bricolage-grotesque">
          Team Settings
        </h1>
        <p className="text-base text-muted-foreground font-bricolage-grotesque">
          Manage your team settings and preferences.
        </p>
      </div>
      <div className="flex flex-row gap-10">
        <Card className="py-2 px-2 h-52">
          <div className="flex flex-col justify-between h-full">
            {teams.map(team => (
              <Link
                href={team.href}
                key={team.title}
                className={`${pathname === team.href ? 'bg-primary/10' : 'hover:bg-muted'} py-2.5 pl-2 pr-10 rounded-xl`}
              >
                <div className="flex flex-row items-center gap-2">
                  <Settings
                    className={`${pathname === team.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground bg-muted'} p-1.5 rounded-md mr-1`}
                    width={30}
                    height={30}
                  />
                  <div className="flex flex-col">
                    <p
                      className={`text-base font-bold font-bricolage-grotesque ${pathname === team.href ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                    >
                      {team.title}
                    </p>
                    <p
                      className={`text-xs ${pathname === team.href ? 'text-primary-foreground' : 'text-muted-foreground'} font-bricolage-grotesque`}
                    >
                      {team.description}
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
