export type Piece = {
  title: string
  publishedAt: Date | null
  canonicalUrl: string
  bodyHtml: string
}

export type EmptyReason =
  | 'no-items'
  | 'fetch-failed'
  | 'parse-failed'
  | 'cors-failed'

export type RiverState =
  | { status: 'loading' }
  | { status: 'ready'; pieces: Piece[] }
  | { status: 'empty'; reason: EmptyReason }

export type FetchResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'fetch-failed' | 'cors-failed' }

export type ParsedItem = {
  title: string
  publishedAt: Date | null
  link: string
  description: string
}

export type ParseResult =
  | { ok: true; items: ParsedItem[] }
  | { ok: false }
