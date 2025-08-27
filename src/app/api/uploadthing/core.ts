// src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next'

import { getSession } from '@/lib/better-auth/auth-client'

const f = createUploadthing()

export const ourFileRouter = {
  avatarUploader: f({ image: { maxFileSize: '2MB' } })
    .middleware(async () => {
      const session = await getSession()
      if (!session) throw new Error('Unauthorized')
      return { userId: session.data?.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // You can store the uploaded URL in DB here if you want
      console.log('Upload complete:', file.url)
    })
} satisfies FileRouter
