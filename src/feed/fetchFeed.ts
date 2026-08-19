import { FEED_URL } from '../config.ts'
import type { FetchResult } from './types.ts'

export async function fetchFeed(): Promise<FetchResult> {
  try {
    const response = await fetch(FEED_URL)
    if (!response.ok) {
      return { ok: false, reason: 'fetch-failed' }
    }
    return { ok: true, text: await response.text() }
  } catch (error) {
    if (error instanceof TypeError) {
      return { ok: false, reason: 'cors-failed' }
    }
    return { ok: false, reason: 'fetch-failed' }
  }
}
