// src/app/(private)/projects/components/AddProjectForm.tsx
'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { createProjectAction } from '@/app/(private)/projects/actions/createProjectAction'
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
  AddProjectFormData,
  addProjectFormSchema
} from '@/lib/zod-schemas/form-schema'

export function AddProjectForm({
  setAddProjectDialogOpen
}: {
  setAddProjectDialogOpen: (open: boolean) => void
}) {
  const form = useForm<AddProjectFormData>({
    resolver: zodResolver(addProjectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      slug: ''
    },
    mode: 'onSubmit'
  })
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  async function onSubmit(values: AddProjectFormData) {
    startTransition(async () => {
      const res = await createProjectAction(
        values.name,
        values.description,
        values.slug
      )

      toastRes(res, {
        success: 'Project created successfully with default environments.',
        errors: {
          INVALID_INPUT: 'Please check the fields.',
          UNAUTHORIZED: 'Please sign in.',
          LIMIT_REACHED:
            'Project limit reached. Please upgrade your plan to create more projects.'
        }
      })

      if (res.ok) {
        setAddProjectDialogOpen(false)
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
              <FormLabel>Project name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="My App" />
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
                <Input {...field} placeholder="Main application backend" />
              </FormControl>
              <FormDescription className="text-xs">
                Brief description of your project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="my-app" />
              </FormControl>
              <FormDescription className="text-xs">
                URL-friendly identifier (lowercase, numbers, hyphens)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <AddButton
            disabledLogic={pending}
            title="Create project"
            loadingTitle="Creating..."
          />
        </DialogFooter>
      </form>
    </Form>
  )
}

