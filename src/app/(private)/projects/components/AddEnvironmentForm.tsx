// src/app/(private)/projects/components/AddEnvironmentForm.tsx
'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { createEnvironmentAction } from '@/app/(private)/projects/actions/createEnvironmentAction'
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

export function AddEnvironmentForm({
  projectId,
  setAddEnvironmentDialogOpen
}: {
  projectId: string
  setAddEnvironmentDialogOpen: (open: boolean) => void
}) {
  const form = useForm<AddEnvironmentFormData>({
    resolver: zodResolver(addEnvironmentFormSchema),
    defaultValues: {
      name: '',
      description: ''
    },
    mode: 'onSubmit'
  })
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  async function onSubmit(values: AddEnvironmentFormData) {
    startTransition(async () => {
      const res = await createEnvironmentAction(
        projectId,
        values.name,
        values.description
      )

      toastRes(res, {
        success: 'Environment created successfully.',
        errors: {
          INVALID_INPUT: 'Please check the fields.',
          UNAUTHORIZED: 'You do not have permission to create environments.',
          NOT_FOUND: 'Project not found.'
        }
      })

      if (res.ok) {
        setAddEnvironmentDialogOpen(false)
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
            title="Create environment"
            loadingTitle="Creating..."
          />
        </DialogFooter>
      </form>
    </Form>
  )
}

