import type { ParsedItem, ParseResult } from './types.ts'

export function parseRss(xml: string): ParseResult {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.querySelector('parsererror')) {
    return { ok: false }
  }

  const items: ParsedItem[] = []
  for (const item of doc.querySelectorAll('item')) {
    const title = item.querySelector('title')?.textContent ?? ''
    const pubDate = item.querySelector('pubDate')?.textContent ?? ''
    const link = item.querySelector('link')?.textContent ?? ''
    const description = item.querySelector('description')?.textContent ?? ''
    const parsed = Date.parse(pubDate)

    items.push({
      title,
      publishedAt: Number.isNaN(parsed) ? null : new Date(parsed),
      link,
      description,
    })
  }

  items.sort((a, b) => {
    const aTime = a.publishedAt?.getTime() ?? Number.NEGATIVE_INFINITY
    const bTime = b.publishedAt?.getTime() ?? Number.NEGATIVE_INFINITY
    return bTime - aTime
  })

  return { ok: true, items }
}
