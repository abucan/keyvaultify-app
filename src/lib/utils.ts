import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { generateReactHelpers } from '@uploadthing/react'

import type { ourFileRouter } from '@/app/api/uploadthing/core'

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<typeof ourFileRouter>()

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
