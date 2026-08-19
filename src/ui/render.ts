import type { RiverState } from '../feed/types.ts'
import { renderEmpty } from './empty-state.ts'
import { renderLoading } from './loading.ts'
import { renderRiver } from './river.ts'

export function render(root: HTMLElement, state: RiverState): void {
  root.replaceChildren()

  switch (state.status) {
    case 'loading':
      root.append(renderLoading())
      return
    case 'ready':
      root.append(renderRiver(state.pieces))
      return
    case 'empty':
      root.append(renderEmpty())
      return
    default: {
      const _exhaustive: never = state
      return _exhaustive
    }
  }
}
