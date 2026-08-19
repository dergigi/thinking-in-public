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

  const permalink = document.createElement('a')
  permalink.className = 'canonical'
  permalink.href = piece.canonicalUrl
  permalink.textContent = 'On dergigi.com'

  article.append(title)
  if (piece.publishedAt) {
    const date = document.createElement('time')
    date.dateTime = piece.publishedAt.toISOString()
    date.textContent = dateFormat.format(piece.publishedAt)
    article.append(date)
  }
  article.append(body, permalink)
  return article
}
