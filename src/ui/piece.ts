import type { Piece } from '../feed/types.ts'

export function renderPiece(piece: Piece): HTMLElement {
  const article = document.createElement('article')
  article.className = 'piece'

  const title = document.createElement('h2')
  title.textContent = piece.title

  const date = document.createElement('time')
  if (piece.publishedAt) {
    date.dateTime = piece.publishedAt.toISOString()
    date.textContent = piece.publishedAt.toLocaleDateString('en-GB', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const body = document.createElement('div')
  body.className = 'body'
  body.textContent = piece.bodyText

  const permalink = document.createElement('a')
  permalink.className = 'canonical'
  permalink.href = piece.canonicalUrl
  permalink.textContent = piece.canonicalUrl

  article.append(title, date, body, permalink)
  return article
}
