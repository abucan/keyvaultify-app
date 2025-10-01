// src/app/(private)/projects/components/ProjectSettingsForm.tsx
'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { updateProjectAction } from '@/app/(private)/projects/actions/updateProjectAction'
import { SubmitButton } from '@/components/shared/SubmitButton'
import { toastRes } from '@/components/toast-result'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export function ProjectSettingsForm({
  projectId,
  name,
  description,
  slug,
  hasPermission
}: {
  projectId: string
  name: string
  description: string | null
  slug: string | null
  hasPermission: boolean
}) {
  const form = useForm<AddProjectFormData>({
    resolver: zodResolver(addProjectFormSchema),
    defaultValues: {
      name: name ?? '',
      description: description ?? '',
      slug: slug ?? ''
    },
    mode: 'onSubmit'
  })
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  async function onSubmit(values: AddProjectFormData) {
    startTransition(async () => {
      const res = await updateProjectAction(
        projectId,
        values.name,
        values.description,
        values.slug
      )

      toastRes(res, {
        success: 'Project updated successfully.',
        errors: {
          INVALID_INPUT: 'Please check the fields.',
          UNAUTHORIZED: 'You do not have permission to update this project.',
          NOT_FOUND: 'Project not found.',
          NO_CHANGES: 'No changes detected.'
        }
      })

      if (res.ok) {
        router.refresh()
      } else if (res.code === 'INVALID_INPUT') {
        form.setError('name', {
          type: 'manual',
          message: res.message ?? 'Please provide valid input.'
        })
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bricolage-grotesque">
          Project Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="My App"
                      disabled={!hasPermission}
                    />
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
                    <Input
                      {...field}
                      placeholder="Main application backend"
                      disabled={!hasPermission}
                    />
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
                    <Input
                      {...field}
                      placeholder="my-app"
                      disabled={!hasPermission}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    URL-friendly identifier (lowercase, numbers, hyphens)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {hasPermission && (
              <SubmitButton
                disabledLogic={pending}
                title="Save changes"
                loadingTitle="Saving..."
              />
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
