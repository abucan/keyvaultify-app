// src/app/(private)/projects/components/EditSecretForm.tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'

import { updateSecretAction } from '@/app/(private)/projects/actions/updateSecretAction'
import { AddButton } from '@/components/shared/AddButton'
import { toastRes } from '@/components/toast-result'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  AddSecretFormData,
  addSecretFormSchema
} from '@/lib/zod-schemas/form-schema'

export function EditSecretForm({
  secretId,
  currentKey,
  currentValue,
  environmentId,
  projectId,
  setEditDialogOpen
}: {
  secretId: string
  currentKey: string
  currentValue: string
  environmentId: string
  projectId: string
  setEditDialogOpen: (open: boolean) => void
}) {
  const form = useForm<AddSecretFormData>({
    resolver: zodResolver(addSecretFormSchema),
    defaultValues: {
      key: currentKey,
      value: currentValue
    },
    mode: 'onSubmit'
  })
  const [pending, startTransition] = useTransition()
  const [showValue, setShowValue] = useState(false)
  const router = useRouter()

  const handleKeyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text')

    // Check if pasted text contains = (KEY=VALUE format)
    if (pastedText.includes('=')) {
      e.preventDefault()

      const equalIndex = pastedText.indexOf('=')
      const key = pastedText.substring(0, equalIndex).trim()
      const value = pastedText.substring(equalIndex + 1).trim()

      // Set both fields
      form.setValue('key', key)
      form.setValue('value', value)
    }
    // If no =, let default paste behavior happen (paste into key field)
  }

  async function onSubmit(values: AddSecretFormData) {
    startTransition(async () => {
      const res = await updateSecretAction(
        secretId,
        environmentId,
        projectId,
        values.key,
        values.value
      )

      toastRes(res, {
        success: 'Secret updated successfully.',
        errors: {
          INVALID_INPUT: 'Please check the fields. Key must be uppercase.',
          UNAUTHORIZED: 'You do not have permission to update secrets.',
          NOT_FOUND: 'Secret not found.',
          NO_CHANGES: 'No changes detected.',
          DUPLICATE_KEY:
            res.message ?? 'This key already exists in this environment.'
        }
      })

      if (res.ok) {
        setEditDialogOpen(false)
        router.refresh()
        form.reset()
      } else if (res.code === 'INVALID_INPUT' || res.code === 'DUPLICATE_KEY') {
        form.setError('key', {
          type: 'manual',
          message: res.message ?? 'Please provide valid input.'
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="DATABASE_URL"
                  className="font-mono"
                  onPaste={handleKeyPaste}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Uppercase letters, numbers, and underscores only. Paste
                KEY=VALUE to auto-fill both fields.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showValue ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    className="font-mono pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowValue(!showValue)}
                  >
                    {showValue ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormDescription className="text-xs">
                The secret value will be re-encrypted before storage
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <AddButton
            disabledLogic={pending}
            title="Update secret"
            loadingTitle="Updating..."
          />
        </DialogFooter>
      </form>
    </Form>
  )
}
