export function renderLoading(): HTMLElement {
  const status = document.createElement('p')
  status.className = 'loading'
  status.textContent = 'Fetching the feed.'
  return status
}
