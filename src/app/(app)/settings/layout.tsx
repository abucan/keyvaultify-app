'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const settings = [
  {
    title: 'General',
    description: 'Manage your account settings and preferences.',
    href: '/settings/general'
  },
  {
    title: 'Billing',
    description: 'Manage your billing settings and preferences.',
    href: '/settings/billing'
  },
  {
    title: 'Danger',
    description: 'Manage your danger settings and preferences.',
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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-spectral">Account Settings</h1>
        <p className="text-sm text-muted-foreground font-roboto-mono">
          Manage your account settings and preferences.
        </p>
      </div>
      <div className="flex flex-row gap-10">
        <Card className="w-1/4 py-2 px-2">
          <div className="flex flex-col gap-2">
            {settings.map(setting => (
              <Link
                href={setting.href}
                key={setting.title}
                className={`${pathname === setting.href ? 'bg-muted' : 'hover:bg-muted'} p-2 rounded-xl`}
              >
                <div className="flex flex-row items-center gap-2">
                  <Settings
                    className="bg-red-200 p-1 rounded-md mr-1"
                    width={28}
                    height={28}
                  />
                  <div className="flex flex-col">
                    <p className="text-base font-bold font-spectral">
                      {setting.title}
                    </p>
                    <p className="text-xs text-muted-foreground font-roboto-mono">
                      {setting.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
        <div className="w-full">{children}</div>
      </div>
    </div>
  )
}
