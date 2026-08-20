import { PUBLISHER_ORIGIN } from '../config.ts'
import { currentPath } from '../path.ts'
import type { RiverState } from '../feed/types.ts'
import { renderEmpty } from './empty-state.ts'
import { renderLoading } from './loading.ts'
import { renderLog } from './log.ts'
import { renderPiece } from './piece.ts'

const SITE_TITLE = 'Thinking in Public'

function syncCanonical(href: string | null): void {
  const existing = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!href) {
    existing?.remove()
    return
  }

  const link = existing ?? document.createElement('link')
  link.rel = 'canonical'
  link.href = href
  if (!existing) {
    document.head.append(link)
  }
}

function syncFooterHome(href: string): void {
  const link = document.querySelector<HTMLAnchorElement>('.footer-home')
  if (link) {
    link.href = href
  }
}

function syncMasthead(isIndex: boolean): void {
  const header = document.querySelector('.masthead')
  if (!header) {
    return
  }

  const home = document.createElement('a')
  home.href = '/'
  home.textContent = SITE_TITLE

  const wrap = document.createElement(isIndex ? 'h1' : 'p')
  wrap.append(home)
  header.replaceChildren(wrap)
}

export function render(root: HTMLElement, state: RiverState): void {
  const path = currentPath()
  const isIndex = path === '/'
  syncMasthead(isIndex)
  document.title = SITE_TITLE
  syncCanonical(null)
  syncFooterHome(PUBLISHER_ORIGIN)
  root.replaceChildren()

  switch (state.status) {
    case 'loading':
      root.append(renderLoading())
      return
    case 'empty':
      root.append(renderEmpty())
      return
    case 'ready':
      break
    default: {
      const _exhaustive: never = state
      return _exhaustive
    }
  }

  if (isIndex) {
    syncCanonical(`${location.origin}/`)
    root.append(renderLog(state.pieces))
    return
  }

  const piece = state.pieces.find((entry) => entry.path === path)
  if (!piece) {
    document.title = `Not found · ${SITE_TITLE}`
    root.append(renderEmpty('No piece at this address.'))
    return
  }

  document.title = piece.title === SITE_TITLE ? SITE_TITLE : `${piece.title} · ${SITE_TITLE}`
  syncCanonical(piece.canonicalUrl)
  syncFooterHome(piece.canonicalUrl)
  root.append(renderPiece(piece))
}
