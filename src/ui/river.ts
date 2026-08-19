import type { Piece } from '../feed/types.ts'
import { renderPiece } from './piece.ts'

export function renderRiver(pieces: Piece[]): HTMLElement {
  const river = document.createElement('div')
  river.className = 'river'
  for (const piece of pieces) {
    river.append(renderPiece(piece))
  }
  return river
}
