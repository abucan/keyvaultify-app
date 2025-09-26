// src/app/(auth)/signin/utils/safe-next.ts
export function safeNextPath(
  input: unknown,
  fallback: string = '/dashboard'
): string {
  const next = String(input ?? '').trim()
  if (next.startsWith('/') && !next.startsWith('//')) return next || fallback
  return fallback
}
