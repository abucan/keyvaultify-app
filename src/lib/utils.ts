// src/lib/utils.ts
import { generateReactHelpers } from '@uploadthing/react'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { ourFileRouter } from '@/app/api/uploadthing/core'

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<typeof ourFileRouter>()

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
