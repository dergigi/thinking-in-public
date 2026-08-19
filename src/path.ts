import { PUBLISHER_ORIGIN } from './config.ts'

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/'
  }
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

export function pathFromCanonical(canonicalUrl: string): string | null {
  try {
    const url = new URL(canonicalUrl, PUBLISHER_ORIGIN)
    if (url.pathname === '/' || url.pathname === '') {
      return null
    }
    return normalizePath(url.pathname)
  } catch {
    return null
  }
}

export function currentPath(): string {
  return normalizePath(location.pathname)
}
