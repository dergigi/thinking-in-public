import { pathFromCanonical } from '../path.ts'
import { fetchFeed } from './fetchFeed.ts'
import { parseRss } from './parseRss.ts'
import { sanitizeHtml } from './sanitizeHtml.ts'
import type { Piece, RiverState } from './types.ts'

export async function loadRiver(): Promise<RiverState> {
  const xml = await fetchFeed()
  if (!xml.ok) {
    return { status: 'empty', reason: xml.reason }
  }

  const parsed = parseRss(xml.text)
  if (!parsed.ok) {
    return { status: 'empty', reason: 'parse-failed' }
  }

  const pieces: Piece[] = []
  for (const item of parsed.items) {
    const path = pathFromCanonical(item.link)
    if (!path) {
      continue
    }
    pieces.push({
      title: item.title,
      publishedAt: item.publishedAt,
      canonicalUrl: item.link,
      path,
      bodyHtml: sanitizeHtml(item.description),
    })
  }

  if (pieces.length === 0) {
    return { status: 'empty', reason: 'no-items' }
  }

  return { status: 'ready', pieces }
}
