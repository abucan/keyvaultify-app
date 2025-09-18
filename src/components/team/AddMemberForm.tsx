// src/components/team/AddMemberForm.tsx
'use client'
import { useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import {
  AddMemberFormData,
  addMemberFormSchema
} from '@/lib/zod-schemas/form-schema'
import { inviteMemberAction } from '@/server/members.actions'
import { Role } from '@/types/auth'

import { AddButton } from '../shared/AddButton'
import { toastRes } from '../toast-result'
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

export function AddMemberForm({
  setAddMemberDialogOpen,
  defaultRole
}: {
  setAddMemberDialogOpen: (open: boolean) => void
  defaultRole: Role
}) {
  const form = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberFormSchema),
    defaultValues: {
      email: '',
      role: defaultRole
    },
    mode: 'onSubmit'
  })
  const [pending, startTransition] = useTransition()

  async function onSubmit(values: AddMemberFormData) {
    const fd = new FormData()
    fd.append('email', values.email)
    fd.append('role', values.role)

    startTransition(async () => {
      const res = await inviteMemberAction(fd)
      toastRes(res, {
        success: `Invitation sent to ${res.ok && res.data?.email}`,
        errors: {
          INVALID_INPUT: 'Please provide a valid email and role.',
          NOT_AUTHORIZED: 'Please sign in.',
          UNKNOWN: 'Failed to send invitation.'
        }
      })

      if (res.ok) {
        form.reset()
        setAddMemberDialogOpen(false)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
        <AddButton
          disabledLogic={pending}
          title="Send invitation"
          loadingTitle="Sending..."
        />
      </form>
    </Form>
  )
}
