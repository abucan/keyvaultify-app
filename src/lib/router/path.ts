// Build "/:orgSlug(/path)"
export const orgDash = (slug: string, path = '') =>
  `/${slug}${path ? (path.startsWith('/') ? path : `/${path}`) : ''}`

// Remove "/:orgSlug" prefix from a pathname, return "/..." (or "/")
export function stripDashPrefix(pathname: string) {
  const m = pathname.match(/^\/[^/]+(\/.*)?$/)
  return m?.[1] || '/'
}
