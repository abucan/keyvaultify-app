// src/components/toast-token.tsx
'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

const ALLOWED = new Set(['INVITE_ACCEPTED'])

export default function ToastOnce({ token }: { token?: string }) {
  useEffect(() => {
    if (!token || !ALLOWED.has(token)) return

    if (token === 'INVITE_ACCEPTED') {
      setTimeout(() => {
        toast.success('Joined the team successfully.')
      })
    }

    document.cookie = 'kvf_toast=; Max-Age=0; path=/; SameSite=Lax; Secure'
  }, [token])

  return null
}
