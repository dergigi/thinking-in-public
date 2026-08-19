import type { Piece } from '../feed/types.ts'

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export function renderPiece(piece: Piece): HTMLElement {
  const article = document.createElement('article')
  article.className = 'piece'

  const title = document.createElement('h1')
  title.textContent = piece.title

  const body = document.createElement('div')
  body.className = 'body'
  body.innerHTML = piece.bodyHtml

  article.append(title)
  if (piece.publishedAt) {
    const published = document.createElement('a')
    published.className = 'published'
    published.href = piece.canonicalUrl

    const date = document.createElement('time')
    date.dateTime = piece.publishedAt.toISOString()
    date.textContent = dateFormat.format(piece.publishedAt)
    published.append(date)
    article.append(published)
  }
  article.append(body)
  return article
}
