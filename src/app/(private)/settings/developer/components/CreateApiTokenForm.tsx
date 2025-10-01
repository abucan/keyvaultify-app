// src/app/(private)/settings/developer/components/CreateApiTokenForm.tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { createApiTokenAction } from '@/app/(private)/settings/developer/actions/createApiTokenAction'
import { toastRes } from '@/components/toast-result'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-react'

export function CreateApiTokenForm({
  projects,
  currentRole,
  setCreateTokenDialogOpen,
  onTokenCreated
}: {
  projects: Array<{ id: string; name: string }>
  currentRole: 'owner' | 'admin' | 'member'
  setCreateTokenDialogOpen: (open: boolean) => void
  onTokenCreated: (token: string) => void
}) {
  const [name, setName] = useState('')
  const [projectId, setProjectId] = useState<string>('all')
  const [expiresIn, setExpiresIn] = useState<string>('30')
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const expiresInDays = expiresIn === 'never' ? null : parseInt(expiresIn)
      const projectIdValue = projectId === 'all' ? null : projectId

      const res = await createApiTokenAction(
        name,
        projectIdValue,
        expiresInDays
      )

      if (res.ok && res.data) {
        // Close create dialog and show token dialog
        setCreateTokenDialogOpen(false)
        onTokenCreated(res.data.token)
        router.refresh()
        // Reset form
        setName('')
        setProjectId('all')
        setExpiresIn('30')
      } else {
        toastRes(res, {
          errors: {
            INVALID_INPUT: 'Please provide a valid token name.',
            UNAUTHORIZED: 'You do not have permission to create tokens.',
            NOT_FOUND: 'Project not found.'
          }
        })
      }
    })
  }

  const getRolePermissions = () => {
    if (currentRole === 'owner' || currentRole === 'admin') {
      return 'read and write'
    }
    return 'read only'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Token Name</Label>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="My Laptop CLI"
          required
        />
        <p className="text-xs text-muted-foreground">
          A descriptive name to help you identify this token later
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project">Project Scope</Label>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger id="project">
            <SelectValue placeholder="Select scope" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Scope this token to a specific project or grant access to all projects
          (including future ones)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expires">Expiration</Label>
        <Select value={expiresIn} onValueChange={setExpiresIn}>
          <SelectTrigger id="expires">
            <SelectValue placeholder="Select expiration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="60">60 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
            <SelectItem value="never">Never (not recommended)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Tokens should expire for security. You can always create a new one.
        </p>
      </div>

      <div className="rounded-lg border p-3 bg-muted/30">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-primary mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Token Permissions</p>
            <p className="text-xs text-muted-foreground">
              Your current role:{' '}
              <Badge variant="secondary" className="ml-1">
                {currentRole}
              </Badge>
            </p>
            <p className="text-xs text-muted-foreground">
              This token will have <strong>{getRolePermissions()}</strong>{' '}
              access based on your role when the token is used.
            </p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={pending || !name.trim()}>
          {pending ? 'Creating...' : 'Create Token'}
        </Button>
      </DialogFooter>
    </form>
  )
}
