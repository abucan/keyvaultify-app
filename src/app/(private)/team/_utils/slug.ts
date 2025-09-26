// src/app/(private)/team/_utils/slug.ts
export function normalizeTeamSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function assertTeamSlug(slug: string): void {
  const pattern = /^[a-z0-9-]{3,40}$/
  if (!pattern.test(slug)) {
    throw new Error(
      'Invalid slug. Slugs must be 3–40 characters and contain only lowercase letters, numbers, or hyphens.'
    )
  }
}
