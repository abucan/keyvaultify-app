'use client'
import { useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { inviteMemberAction } from '@/app/(app)/teams/members/actions'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  role: z.enum(['member', 'admin', 'owner'])
})
type FormValues = z.infer<typeof schema>

export function AddMemberForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      role: 'member'
    },
    mode: 'onChange'
  })
  const [pending, startTransition] = useTransition()

  async function onSubmit(values: FormValues) {
    const fd = new FormData()
    fd.append('email', values.email)
    fd.append('role', values.role)

    startTransition(async () => {
      try {
        await inviteMemberAction(fd)
        form.reset()
        toast.success('Invitation sent')
      } catch {
        toast.error('Failed to send invitation')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-row gap-4 w-full">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="john@doe.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Select {...field}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={pending}>
          Send invitation
        </Button>
      </form>
    </Form>
  )
}
