// src/components/team/AddTeamForm.tsx
'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { createTeamAction } from '@/app/(private)/team/_actions/createTeamAction'
import { AddButton } from '@/components/shared/AddButton'
import { toastRes } from '@/components/toast-result'
import { DialogFooter } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  AddTeamFormData,
  addTeamFormSchema
} from '@/lib/zod-schemas/form-schema'

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

  async function onSubmit(values: AddTeamFormData) {
    const fd = new FormData()
    fd.append('name', values.name)
    fd.append('slug', values.slug)

    startTransition(async () => {
      const res = await createTeamAction(fd)

      toastRes(res, {
        success: 'Switched to a newly created team.',
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
        <DialogFooter>
          <AddButton
            disabledLogic={pending}
            title="Create team"
            loadingTitle="Creating..."
          />
        </DialogFooter>
      </form>
    </Form>
  )
}
