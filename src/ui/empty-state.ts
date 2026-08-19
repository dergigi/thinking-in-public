export function renderEmpty(message = 'Nothing to read just now.'): HTMLElement {
  const empty = document.createElement('p')
  empty.className = 'empty'
  empty.textContent = message
  return empty
}
