// src/components/team/TeamSettingsForm.tsx
'use client'
import { useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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
import {
  TeamSettingsFormData,
  teamSettingsFormSchema
} from '@/lib/zod-schemas/form-schema'
import { Organization } from '@/types/auth'

import { toastRes } from '../toast-result'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'

export function TeamSettingsForm({
  name,
  slug,
  logo,
  default_role,
  updateTeamSettings,
  hasPermission,
  isPersonal
}: Organization & { hasPermission: boolean; isPersonal: boolean }) {
  const form = useForm<TeamSettingsFormData>({
    resolver: zodResolver(teamSettingsFormSchema),
    defaultValues: {
      name: name,
      slug: slug,
      logo: logo,
      default_role: default_role as 'member' | 'admin' | 'owner'
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

  async function onSubmit(values: TeamSettingsFormData) {
    const fd = new FormData()
    fd.append('name', values.name ?? name)
    fd.append('slug', values.slug ?? slug)
    fd.append('logo', values.logo ?? logo)
    fd.append('default_role', values.default_role ?? default_role)
    const res = await updateTeamSettings(fd)

    toastRes(res, {
      success: 'Team updated',
      errors: {
        SLUG_TAKEN: 'Slug already in use.',
        INVALID_INPUT: 'Please check your inputs.',
        NOT_AUTHORIZED: 'Not authorized.',
        NOT_FOUND_OR_NO_ACCESS: 'You are not authorized to update this team.',
        IS_PERSONAL_ORG:
          'You cannot change the slug of a personal organization.',
        UNKNOWN: 'Could not update team.'
      }
    })

    if (res.ok) {
      form.reset(values)
    }
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
                  disabled={isUploading || !hasPermission}
                >
                  {isUploading ? 'Uploading...' : 'Change logo'}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={!hasPermission}
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
                      <Input
                        placeholder="Team name"
                        {...field}
                        disabled={!hasPermission}
                      />
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
                      <Input
                        type="hidden"
                        {...field}
                        disabled={!hasPermission}
                      />
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
                      <Input
                        placeholder="Team slug"
                        {...field}
                        disabled={!hasPermission || isPersonal}
                      />
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
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!hasPermission || isPersonal}
                    >
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
            <Button
              type="submit"
              disabled={isUploading || !isDirty || !hasPermission}
            >
              Save changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
