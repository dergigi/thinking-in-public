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

  const details = document.createElement('details')
  const summary = document.createElement('summary')

  if (piece.publishedAt) {
    const date = document.createElement('time')
    date.dateTime = piece.publishedAt.toISOString()
    date.textContent = dateFormat.format(piece.publishedAt)
    summary.append(date)
  }

  const title = document.createElement('h2')
  title.textContent = piece.title
  summary.append(title)

  const body = document.createElement('div')
  body.className = 'body'
  body.innerHTML = piece.bodyHtml

  const permalink = document.createElement('a')
  permalink.className = 'canonical'
  permalink.href = piece.canonicalUrl
  permalink.textContent = 'On dergigi.com'

  details.append(summary, body, permalink)
  article.append(details)
  return article
}
