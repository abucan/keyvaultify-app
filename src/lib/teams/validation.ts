// src/lib/teams/validation.ts
export function normalizeTeamSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function assertTeamSlug(slug: string) {
  const ok =
    /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) &&
    slug.length >= 3 &&
    slug.length <= 40
  if (!ok) throw new Error('Invalid slug')
}
