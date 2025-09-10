// src/components/team/AddTeamForm.tsx
'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  AddTeamFormData,
  addTeamFormSchema
} from '@/lib/zod-schemas/form-schema'
import { createTeamAction } from '@/server/team.actions'

import { toastRes } from '../toast-result'
import { Button } from '../ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form'
import { Input } from '../ui/input'

export function AddTeamForm({
  setAddTeamDialogOpen
}: {
  setAddTeamDialogOpen: (open: boolean) => void
}) {
  const form = useForm<AddTeamFormData>({
    resolver: zodResolver(addTeamFormSchema),
    defaultValues: {
      name: '',
      slug: ''
    },
    mode: 'onSubmit'
  })
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const { isDirty, isValid } = form.formState

  async function onSubmit(values: AddTeamFormData) {
    const fd = new FormData()
    fd.append('name', values.name)
    fd.append('slug', values.slug)

    startTransition(async () => {
      const res = await createTeamAction(fd)

      toastRes(res, {
        success: 'New team created. Switching to new team...',
        errors: {
          INVALID_INPUT: 'Please check the fields.',
          UNAUTHORIZED: 'Please sign in.',
          SLUG_IS_TAKEN: 'Please provide a different slug.',
          ORGANIZATION_ALREADY_EXISTS: 'Please provide a different slug.'
        }
      })

      if (res.ok) {
        setAddTeamDialogOpen(false)
        router.refresh()
        form.reset()
      } else if (res.code === 'INVALID_INPUT') {
        form.setError('slug', {
          type: 'manual',
          message: 'Please provide a valid slug.'
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Acme Inc." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} placeholder="acme-inc" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={pending || !isDirty || !isValid}
          className="w-full"
        >
          Create team
        </Button>
      </form>
    </Form>
  )
}
