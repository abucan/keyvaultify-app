// src/app/(private)/settings/developer/components/TokenCreatedDialog.tsx
'use client'
import { useState } from 'react'
import { Check, Copy, AlertTriangle } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function TokenCreatedDialog({
  token,
  onClose
}: {
  token: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AlertDialog open={!!token} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            API Token Created Successfully
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <div className="text-destructive font-medium">
                ⚠️ Copy this token now. For security reasons, you won't be able
                to see it again!
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    value={token}
                    readOnly
                    className="font-mono text-xs pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border p-3 bg-muted/30 space-y-2">
                <div className="text-sm font-medium text-foreground">
                  Next Steps:
                </div>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Copy the token above</li>
                  <li>Store it securely (password manager, env file, etc.)</li>
                  <li>
                    Use it with the CLI:{' '}
                    <code className="bg-muted px-1 rounded">
                      keyvaultify login [token]
                    </code>
                  </li>
                </ol>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onClose} variant="default">
            {copied ? 'Done - Token Copied!' : "I've Saved My Token"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
