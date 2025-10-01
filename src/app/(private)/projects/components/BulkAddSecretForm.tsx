// src/app/(private)/projects/components/BulkAddSecretForm.tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, X } from 'lucide-react'

import { createSecretAction } from '@/app/(private)/projects/actions/createSecretAction'
import { toastRes } from '@/components/toast-result'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type ParsedSecret = {
  key: string
  value: string
  id: string
  showValue?: boolean
}

export function BulkAddSecretForm({
  environmentId,
  projectId,
  setBulkAddSecretDialogOpen
}: {
  environmentId: string
  projectId: string
  setBulkAddSecretDialogOpen: (open: boolean) => void
}) {
  const [bulkText, setBulkText] = useState('')
  const [parsedSecrets, setParsedSecrets] = useState<ParsedSecret[]>([])
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const handleParse = () => {
    const lines = bulkText.split('\n').filter(line => line.trim())
    const parsed: ParsedSecret[] = []

    lines.forEach(line => {
      const trimmed = line.trim()
      // Check if line contains = and matches KEY=VALUE format
      if (trimmed.includes('=')) {
        const equalIndex = trimmed.indexOf('=')
        const key = trimmed.substring(0, equalIndex).trim()
        const value = trimmed.substring(equalIndex + 1).trim()

        // Validate key format (uppercase, numbers, underscores)
        if (key && /^[A-Z0-9_]+$/.test(key)) {
          parsed.push({
            key,
            value: value || '', // Allow empty values
            id: Math.random().toString(36).substring(7),
            showValue: false
          })
        }
        // Skip invalid lines silently
      }
    })

    setParsedSecrets(parsed)
    setBulkText('') // Clear textarea after parsing
  }

  const updateSecret = (
    id: string,
    field: 'key' | 'value',
    newValue: string
  ) => {
    setParsedSecrets(prev =>
      prev.map(secret =>
        secret.id === id ? { ...secret, [field]: newValue } : secret
      )
    )
  }

  const removeSecret = (id: string) => {
    setParsedSecrets(prev => prev.filter(secret => secret.id !== id))
  }

  const toggleShowValue = (id: string) => {
    setParsedSecrets(prev =>
      prev.map(secret =>
        secret.id === id ? { ...secret, showValue: !secret.showValue } : secret
      )
    )
  }

  const handleSubmit = async () => {
    if (parsedSecrets.length === 0) {
      toastRes(
        {
          ok: false,
          code: 'INVALID_INPUT',
          message: 'No valid secrets to add'
        },
        { errors: {} }
      )
      return
    }

    startTransition(async () => {
      let successCount = 0
      let failCount = 0
      const errorList: string[] = []

      for (const secret of parsedSecrets) {
        const res = await createSecretAction(
          environmentId,
          projectId,
          secret.key,
          secret.value
        )
        if (res.ok) {
          successCount++
        } else {
          failCount++
          if (res.code === 'DUPLICATE_KEY') {
            errorList.push(`${secret.key} (duplicate)`)
          } else if (res.code === 'LIMIT_REACHED') {
            errorList.push(`limit reached`)
          } else {
            errorList.push(`${secret.key}`)
          }
        }
      }

      if (successCount > 0) {
        let message = `Successfully added ${successCount} secret${successCount > 1 ? 's' : ''}`
        if (failCount > 0) {
          message += `. ${failCount} failed`
          if (errorList.length > 0) {
            message += ` (${errorList.join(', ')})`
          }
        }
        toastRes({ ok: true }, { success: message })
        setBulkAddSecretDialogOpen(false)
        router.refresh()
        setParsedSecrets([])
      } else {
        const errorMsg =
          errorList.length > 0
            ? `All secrets failed: ${errorList.join(', ')}`
            : 'All secrets failed to add'
        toastRes(
          { ok: false, code: 'UNKNOWN', message: errorMsg },
          { errors: {} }
        )
      }
    })
  }

  return (
    <div className="space-y-4 py-4">
      {parsedSecrets.length === 0 ? (
        <>
          <div>
            <Label className="font-bricolage-grotesque">
              Paste Environment Variables
            </Label>
            <Textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder="DATABASE_URL=postgres://localhost:5432/mydb
API_KEY=sk_test_123456
REDIS_URL=redis://localhost:6379
SECRET_TOKEN=abc123def456"
              className="font-mono text-xs min-h-[200px] mt-2"
            />
            <p className="text-xs text-muted-foreground font-bricolage-grotesque mt-2">
              Paste multiple secrets in KEY=VALUE format, one per line. Invalid
              lines will be skipped.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleParse}
              disabled={!bulkText.trim()}
            >
              Parse Secrets
            </Button>
          </DialogFooter>
        </>
      ) : (
        <>
          <div>
            <Label className="font-bricolage-grotesque">
              Review and Edit Secrets ({parsedSecrets.length})
            </Label>
            <p className="text-xs text-muted-foreground font-bricolage-grotesque mt-1 mb-3">
              Review the parsed secrets below. You can edit or remove them
              before adding.
            </p>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {parsedSecrets.map(secret => (
                <div
                  key={secret.id}
                  className="flex gap-2 items-start p-3 border rounded-lg"
                >
                  <div className="flex-1 space-y-2">
                    <Input
                      value={secret.key}
                      onChange={e =>
                        updateSecret(secret.id, 'key', e.target.value)
                      }
                      placeholder="KEY_NAME"
                      className="font-mono text-xs"
                    />
                    <div className="relative">
                      <Input
                        value={secret.value}
                        onChange={e =>
                          updateSecret(secret.id, 'value', e.target.value)
                        }
                        type={secret.showValue ? 'text' : 'password'}
                        placeholder="value"
                        className="font-mono text-xs pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-2"
                        onClick={() => toggleShowValue(secret.id)}
                      >
                        {secret.showValue ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSecret(secret.id)}
                    className="h-8 w-8 mt-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setParsedSecrets([])}
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={pending || parsedSecrets.length === 0}
            >
              {pending ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                  Adding...
                </>
              ) : (
                `Add ${parsedSecrets.length} secret${parsedSecrets.length > 1 ? 's' : ''}`
              )}
            </Button>
          </DialogFooter>
        </>
      )}
    </div>
  )
}
