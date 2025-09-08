// src/app/(private)/settings/general/components/GeneralSettingsForm.tsx
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

const ProfileFormSchema = z.object({
  username: z.string().optional(),
  image: z.string().optional()
})

export function GeneralSettingsForm({
  initialUsername,
  initialImage,
  email,
  updateUserProfile
}: {
  initialUsername: string
  initialImage: string
  email: string
  updateUserProfile: (values: {
    name?: string
    image?: string
  }) => Promise<void>
}) {
  const form = useForm<z.infer<typeof ProfileFormSchema>>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      username: initialUsername,
      image: initialImage
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
        form.setValue('image', uploadedFiles[0].ufsUrl, { shouldDirty: true })
      }
    }
  }

  async function onSubmit(values: z.infer<typeof ProfileFormSchema>) {
    await updateUserProfile({
      name: values.username,
      image: values.image
    })

    toast.success('Profile updated successfully')
    form.reset({ username: values.username, image: values.image })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-3/4">
        <Card>
          <CardHeader className="gap-0">
            <CardTitle className="text-base font-bold font-bricolage-grotesque">
              Personal information
            </CardTitle>
            <CardDescription className="text-sm font-bricolage-grotesque">
              Your main account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row gap-4 items-center">
              <Avatar className="rounded-md size-16">
                <AvatarImage src={form.watch('image') || '/shadcn.jfif'} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1.5 items-start">
                <Button
                  type="button"
                  variant={'outline'}
                  onClick={handleChangeAvatar}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Change avatar'}
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
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="@username" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator className="my-6" />
            <div>
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input value={email} disabled />
                </FormControl>
                <FormDescription>
                  Used for password recovery and notifications.
                </FormDescription>
              </FormItem>
            </div>
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
