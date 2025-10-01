// src/app/(private)/projects/components/EditEnvironmentForm.tsx
'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { updateEnvironmentAction } from '@/app/(private)/projects/actions/updateEnvironmentAction'
import { AddButton } from '@/components/shared/AddButton'
import { toastRes } from '@/components/toast-result'
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
  AddEnvironmentFormData,
  addEnvironmentFormSchema
} from '@/lib/zod-schemas/form-schema'

export function EditEnvironmentForm({
  envId,
  currentName,
  currentDescription,
  projectId,
  setEditDialogOpen
}: {
  envId: string
  currentName: string
  currentDescription: string
  projectId: string
  setEditDialogOpen: (open: boolean) => void
}) {
  const form = useForm<AddEnvironmentFormData>({
    resolver: zodResolver(addEnvironmentFormSchema),
    defaultValues: {
      name: currentName,
      description: currentDescription
    },
    mode: 'onSubmit'
  })
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  async function onSubmit(values: AddEnvironmentFormData) {
    startTransition(async () => {
      const res = await updateEnvironmentAction(
        envId,
        projectId,
        values.name,
        values.description
      )

      toastRes(res, {
        success: 'Environment updated successfully.',
        errors: {
          INVALID_INPUT: 'Please check the fields.',
          UNAUTHORIZED: 'You do not have permission to update environments.',
          NOT_FOUND: 'Environment not found.',
          NO_CHANGES: 'No changes detected.'
        }
      })

      if (res.ok) {
        setEditDialogOpen(false)
        router.refresh()
        form.reset()
      } else if (res.code === 'INVALID_INPUT') {
        form.setError('name', {
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Environment name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Testing" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Testing environment" />
              </FormControl>
              <FormDescription className="text-xs">
                Brief description of this environment
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <AddButton
            disabledLogic={pending}
            title="Update environment"
            loadingTitle="Updating..."
          />
        </DialogFooter>
      </form>
    </Form>
  )
}
