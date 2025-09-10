// src/lib/errors/mapError.ts
type BetterAuthErr = {
  body?: { code?: string; message?: string }
  status?: number
  message?: string
}

export function mapError(e: unknown): { code: string; message?: string } {
  const be = e as BetterAuthErr

  // BetterAuth errors carry code/message in body
  if (be?.body?.code) {
    return { code: be.body.code, message: be.body.message }
  }

  // Add quick guards if you want (e.g., zod)
  // if (e instanceof ZodError) return { code: 'INVALID_INPUT', message: 'Invalid input' }

  return { code: 'UNKNOWN', message: (be as any)?.message }
}
