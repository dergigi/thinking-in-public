---
phase: 01-live-reading-river
plan: 02
subsystem: reading-surface
tags: [dompurify, rss, vite, css]

requires:
  - phase: 01-01
    provides: Vite skeleton, runtime fetch, parseRss, river render
provides:
  - Sanitized item HTML with publisher-rooted href/src
  - UTC calendar dates
  - Quiet empty state
  - Light paper reading CSS
affects: [02-impeccable-polish]

actuals:
  tokens: 4000
  tasks: 3
  commits: 1

tech-stack:
  added: [dompurify@3.4.13]
  patterns: [sanitize-at-sink, uponSanitizeAttribute rewrite, text-node chrome]

key-files:
  created:
    - src/feed/sanitizeHtml.ts
    - src/ui/empty-state.ts
    - src/styles/reading.css
  modified:
    - src/feed/loadRiver.ts
    - src/feed/types.ts
    - src/ui/piece.ts
    - src/ui/render.ts
    - src/ui/loading.ts
    - index.html
    - src/main.ts
    - package.json

key-decisions:
  - "DOMPurify 3.4.13 is the only production dependency"
  - "URL rewrite happens inside uponSanitizeAttribute via new URL(..., PUBLISHER_ORIGIN)"
  - "Title, date, and permalink stay text nodes"
  - "One empty message for fail and zero items"
  - "Source Serif 4 on a light paper page; polish left for Phase 2"

patterns-established:
  - "Untrusted HTML crosses only sanitizeHtml then the piece body node"
  - "Reading surface tokens live in src/styles/reading.css"

requirements-completed:
  - RIVER-01
  - HTML-01
  - HTML-02
  - STATE-01
  - READ-01

coverage:
  - id: D1
    description: Item HTML is sanitized and root-relative URLs resolve on dergigi.com
    requirement: HTML-01
    verification:
      - kind: other
        ref: npm run build
        status: pass
  - id: D2
    description: Title, date, and permalink are text; only sanitizer output enters the body
    requirement: HTML-02
    verification:
      - kind: other
        ref: src/ui/piece.ts textContent + body.innerHTML of bodyHtml
        status: pass
  - id: D3
    description: UTC calendar dates with no clock
    requirement: RIVER-01
    verification:
      - kind: other
        ref: Intl.DateTimeFormat timeZone UTC
        status: pass
  - id: D4
    description: Quiet empty state, no invented posts
    requirement: STATE-01
    verification:
      - kind: other
        ref: src/ui/empty-state.ts
        status: pass
  - id: D5
    description: Light paper page with generous measure
    requirement: READ-01
    verification:
      - kind: other
        ref: src/styles/reading.css --measure 65ch
        status: pass
---

# Plan 01-02 Summary

Hardened the walking skeleton: DOMPurify at the insert sink, publisher URL rewrite, UTC dates, one empty state, and a light paper page. Impeccable polish is still Phase 2.

## Accomplishments

- Installed `dompurify@3.4.13`
- `sanitizeHtml` + `rewriteUrl` rewrite `href`/`src` inside `uponSanitizeAttribute`
- `loadRiver` stores `bodyHtml`
- Piece chrome is `createElement`; body gets only sanitizer output
- Empty state: "Nothing to read just now."
- Dates via `Intl.DateTimeFormat` with `timeZone: "UTC"`
- `src/styles/reading.css` paper surface, 65ch measure, Source Serif 4
- Removed leftover Vite favicon

## Verification

`npm run build` passed. Plan 01-02 automated checks passed.
