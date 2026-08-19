import { fetchFeed } from './fetchFeed.ts'
import { parseRss } from './parseRss.ts'
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
  if (parsed.items.length === 0) {
    return { status: 'empty', reason: 'no-items' }
  }

  const pieces: Piece[] = parsed.items.map((item) => ({
    title: item.title,
    publishedAt: item.publishedAt,
    canonicalUrl: item.link,
    bodyText: item.description,
  }))

  return { status: 'ready', pieces }
}
