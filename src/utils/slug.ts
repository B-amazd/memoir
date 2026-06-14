export const RESERVED_SLUGS = [
  'dashboard', 'admin', 'client', 'api',
  'auth', 'login', 'signup', 'settings',
  'pricing', 'about', 'contact',
]

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase())
}