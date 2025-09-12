// src/components/toast-result.ts
'use client'
import { toast } from 'sonner'

import type { R } from '@/types/result'

type Msg = string | ((r: R<any>) => string)
type ErrMap = Record<string, Msg>

export function toastRes<T>(
  res: R<T>,
  opts?: { success?: Msg; errors?: ErrMap }
) {
  if (res.ok) {
    if (opts?.success) toast.success(resolve(opts.success, res))
    return
  }
  const msg = opts?.errors?.[res.code] ?? res.message ?? 'Something went wrong.'
  toast.error(resolve(msg, res))
}

function resolve(m: Msg, r: R<any>) {
  return typeof m === 'function' ? m(r) : m
}
