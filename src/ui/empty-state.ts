export function renderEmpty(): HTMLElement {
  const empty = document.createElement('p')
  empty.className = 'empty'
  empty.textContent = 'Nothing to read just now.'
  return empty
}
