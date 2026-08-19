import DOMPurify from 'dompurify'
import { PUBLISHER_ORIGIN } from '../config.ts'

const REWRITE_ATTRS = new Set(['href', 'src', 'poster', 'cite'])

export function rewriteUrl(value: string): string {
  const trimmed = value.trim()
  if (
    trimmed === '' ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  ) {
    return trimmed
  }

  try {
    return new URL(trimmed, PUBLISHER_ORIGIN).href
  } catch {
    return trimmed
  }
}

let hooked = false

function ensureHook(): void {
  if (hooked) {
    return
  }

  DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
    if (REWRITE_ATTRS.has(data.attrName) && typeof data.attrValue === 'string') {
      data.attrValue = rewriteUrl(data.attrValue)
    }
  })

  hooked = true
}

export function sanitizeHtml(html: string): string {
  ensureHook()
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'ul',
      'ol',
      'li',
      'em',
      'i',
      'strong',
      'b',
      'blockquote',
      'cite',
      'pre',
      'code',
      'a',
      'img',
      'br',
      'hr',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'cite', 'poster'],
  })
}
