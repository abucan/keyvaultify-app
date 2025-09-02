'use client'
import { useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { APIError } from 'better-auth/api'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createTeamAction } from '@/app/(app)/dashboard/[orgSlug]/teams/actions'

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

const schema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  slug: z.string().min(3, { message: 'Slug is required' })
})
type FormValues = z.infer<typeof schema>

export function AddTeamForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      slug: ''
    },
    mode: 'onChange'
  })
  const [pending, startTransition] = useTransition()

  async function onSubmit(values: FormValues) {
    const fd = new FormData()
    fd.append('name', values.name)
    fd.append('slug', values.slug)

    startTransition(async () => {
      try {
        await createTeamAction(fd)
        form.reset()
        toast.success('Team created')
      } catch (e) {
        form.setError('slug', {
          message:
            e instanceof APIError && e.body?.code === 'SLUG_IS_TAKEN'
              ? 'Slug is unavailable. Please try a different slug.'
              : e instanceof Error && e.message === 'SLUG_IS_TAKEN'
                ? 'Slug is unavailable. Please try a different slug.'
                : 'Unknown error'
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
        <Button type="submit" disabled={pending}>
          Create team
        </Button>
      </form>
    </Form>
  )
}
