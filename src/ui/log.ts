import type { Piece } from '../feed/types.ts'

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

export function renderLog(pieces: Piece[]): HTMLElement {
  const list = document.createElement('ul')
  list.className = 'log'

  for (const piece of pieces) {
    const item = document.createElement('li')
    const line = document.createElement('a')
    line.className = 'log-line'
    line.href = piece.path

    if (piece.publishedAt) {
      const date = document.createElement('time')
      date.dateTime = piece.publishedAt.toISOString()
      date.textContent = dateFormat.format(piece.publishedAt)
      line.append(date)
    }

    const title = document.createElement('span')
    title.className = 'log-title'
    title.textContent = piece.title
    line.append(title)

    item.append(line)
    list.append(item)
  }

  return list
}
