// src/app/(private)/projects/components/AddSecretForm.tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'

import { createSecretAction } from '@/app/(private)/projects/actions/createSecretAction'
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
import { MultiSelect } from '@/components/ui/multi-select'
import {
  AddSecretFormData,
  addSecretFormSchema
} from '@/lib/zod-schemas/form-schema'

type Environment = {
  id: string
  name: string
}

export function AddSecretForm({
  environmentId,
  projectId,
  environments,
  setAddSecretDialogOpen
}: {
  environmentId: string
  projectId: string
  environments: Environment[]
  setAddSecretDialogOpen: (open: boolean) => void
}) {
  const form = useForm<AddSecretFormData>({
    resolver: zodResolver(addSecretFormSchema),
    defaultValues: {
      key: '',
      value: ''
    },
    mode: 'onSubmit'
  })
  const [pending, startTransition] = useTransition()
  const [showValue, setShowValue] = useState(false)
  const [selectedEnvs, setSelectedEnvs] = useState<string[]>([environmentId]) // Current environment pre-selected
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
    // Prevent submission if no environments selected
    if (selectedEnvs.length === 0) {
      toastRes(
        {
          ok: false,
          code: 'INVALID_INPUT',
          message: 'Please select at least one environment'
        },
        {}
      )
      return
    }

    startTransition(async () => {
      let successCount = 0
      let failCount = 0
      const errors: string[] = []

      // Add secret to all selected environments
      for (const envId of selectedEnvs) {
        const res = await createSecretAction(
          envId,
          projectId,
          values.key,
          values.value
        )

        if (res.ok) {
          successCount++
        } else {
          failCount++
          const envName =
            environments.find(e => e.id === envId)?.name || 'Unknown'
          if (res.code === 'DUPLICATE_KEY') {
            errors.push(`${envName} (duplicate)`)
          } else if (res.code === 'LIMIT_REACHED') {
            errors.push(`limit reached`)
            break // Stop if limit reached
          } else {
            errors.push(`${envName}`)
          }
        }
      }

      if (successCount > 0) {
        let message =
          successCount === 1
            ? 'Secret created successfully.'
            : `Secret added to ${successCount} environments`
        if (failCount > 0) {
          message += `. ${failCount} failed`
          if (errors.length > 0) {
            message += ` (${errors.join(', ')})`
          }
        }
        toastRes({ ok: true }, { success: message })
        setAddSecretDialogOpen(false)
        router.refresh()
        form.reset()
        setSelectedEnvs([environmentId]) // Reset to current environment
      } else {
        const errorMsg =
          errors.length > 0
            ? `Failed: ${errors.join(', ')}`
            : 'Failed to add secret'
        toastRes({ ok: false, code: 'UNKNOWN', message: errorMsg }, {})
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
                The secret value will be encrypted before storage
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Multi-select environments */}
        {environments.length > 1 && (
          <div className="space-y-2">
            <FormLabel>Add to Environments</FormLabel>
            <MultiSelect
              options={environments.map(env => ({
                label: env.name,
                value: env.id
              }))}
              selected={selectedEnvs}
              onChange={setSelectedEnvs}
              placeholder="Select environments..."
            />
            <FormDescription className="text-xs">
              Select which environments to add this secret to. The same value
              will be used for all selected environments.
            </FormDescription>
          </div>
        )}

        <DialogFooter>
          <AddButton
            disabledLogic={pending}
            title={
              selectedEnvs.length > 1
                ? `Add to ${selectedEnvs.length} environments`
                : 'Add secret'
            }
            loadingTitle="Adding..."
          />
        </DialogFooter>
      </form>
    </Form>
  )
}
