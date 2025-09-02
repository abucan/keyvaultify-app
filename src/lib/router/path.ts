// src/lib/router/paths.ts

export const orgDash = (slug: string, path = '') =>
  `/dashboard/${slug}${path.startsWith('/') ? path : `/${path}`}`

// Remove "/dashboard/:slug" prefix from a pathname, return "/..." (or "/")
export function stripDashPrefix(pathname: string) {
  const m = pathname.match(/^\/dashboard\/[^/]+(\/.*)?$/)
  return m?.[1] || '/'
}
