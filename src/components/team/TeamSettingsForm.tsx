// src/components/team/TeamSettingsForm.tsx
'use client'
import { useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
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
import { Separator } from '@/components/ui/separator'
import { useUploadThing } from '@/lib/utils'
import { Organization } from '@/types/auth'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'

const TeamSettingsFormSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  logo: z.string().optional(),
  default_role: z.string().optional()
})

export function TeamSettingsForm({
  name,
  slug,
  logo,
  default_role,
  updateTeamSettings
}: Organization) {
  const form = useForm<z.infer<typeof TeamSettingsFormSchema>>({
    resolver: zodResolver(TeamSettingsFormSchema),
    defaultValues: {
      name: name,
      slug: slug,
      logo: logo,
      default_role: default_role
    }
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { startUpload, isUploading } = useUploadThing('avatarUploader')

  const { isDirty } = form.formState

  const handleChangeAvatar = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const uploadedFiles = await startUpload([file])
      if (uploadedFiles && uploadedFiles[0]) {
        form.setValue('logo', uploadedFiles[0].ufsUrl, { shouldDirty: true })
      }
    }
  }

  async function onSubmit(values: z.infer<typeof TeamSettingsFormSchema>) {
    const fd = new FormData()
    fd.append('name', values.name ?? '')
    fd.append('slug', values.slug ?? '')
    fd.append('logo', values.logo ?? '')
    fd.append('default_role', values.default_role ?? '')
    const res = await updateTeamSettings(fd)
    if (!res?.ok) {
      if (res?.code === 'SLUG_TAKEN') toast.error('Slug already in use.')
      else if (res?.code === 'INVALID_INPUT')
        toast.error('Please check your inputs.')
      else if (res?.code === 'NOT_AUTHORIZED') toast.error('Not authorized.')
      else toast.error('Could not update team.')
      return
    }

    toast.success('Team updated')
    form.reset(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-3/4">
        <Card>
          <CardHeader className="gap-0">
            <CardTitle className="text-base font-bold font-bricolage-grotesque">
              Team settings
            </CardTitle>
            <CardDescription className="text-sm font-bricolage-grotesque">
              Manage your team settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row gap-4 items-center">
              <Avatar className="rounded-md size-16">
                <AvatarImage src={form.watch('logo') || '/shadcn.jfif'} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1.5 items-start">
                <Button
                  type="button"
                  variant={'outline'}
                  onClick={handleChangeAvatar}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Change logo'}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground font-bricolage-grotesque ml-2">
                  (JPG, GIF or PNG. 1MB Max.)
                </p>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Team name" {...field} />
                    </FormControl>
                    <FormDescription>This is your team name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="hidden" {...field} />
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
                      <Input placeholder="Team slug" {...field} />
                    </FormControl>
                    <FormDescription>This is your team slug.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator className="my-6" />
            <FormField
              control={form.control}
              name="default_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default role</FormLabel>
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
                  <FormDescription>
                    This is your team default role when inviting new members.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUploading || !isDirty}>
              Save changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
