---
phase: 01-live-reading-river
plan: 01
subsystem: feed
tags: [vite, typescript, rss, DOMParser, runtime-fetch]

requires: []
provides:
  - Vite vanilla-ts app shell with runtime RSS fetch
  - parseRss via DOMParser application/xml
  - Newest-first river of title, date, text body, and dergigi.com permalink
  - SemVer 0.1.0, Keep a Changelog, README with npm run dev
affects:
  - 01-02-sanitize-empty-paper

actuals:
  tokens: 11852
  tasks: 3
  commits: 3

tech-stack:
  added: [vite@8.2.1, typescript@~6.0.2]
  patterns:
    - src/feed pipeline (fetch → parse → loadRiver)
    - src/ui views switch on RiverState
    - Runtime browser fetch of FEED_URL; no build-time snapshot

key-files:
  created:
    - src/config.ts
    - src/feed/fetchFeed.ts
    - src/feed/parseRss.ts
    - src/feed/loadRiver.ts
    - src/feed/types.ts
    - src/ui/render.ts
    - src/ui/river.ts
    - src/ui/piece.ts
    - src/ui/loading.ts
    - src/main.ts
    - src/style.css
    - index.html
    - vite.config.ts
    - package.json
    - README.md
    - CHANGELOG.md
  modified: []

key-decisions:
  - "Honor locked D-01: browser GETs https://dergigi.com/thoughts.xml at runtime"
  - "Follow official create-vite 9.1.2 vanilla-ts (single tsconfig.json); add empty vite.config.ts so the no-fetch verify can run"
  - "Skeleton body uses textContent; HTML sanitize waits for 01-02"

patterns-established:
  - "Pattern 1: Explicit feed pipeline — fetchFeed, parseRss, loadRiver as named functions"
  - "Pattern 2: Typed RiverState union — loading | ready | empty"
  - "Pattern 3: Piece chrome is text nodes; description insert sink exists as textContent"

requirements-completed:
  - FEED-01
  - FEED-02
  - RIVER-02
  - RIVER-03
  - REPO-01

coverage:
  - id: D1
    description: Official Vite vanilla-ts app builds with tsc && vite build
    requirement: FEED-01
    verification:
      - kind: other
        ref: npm run build
        status: pass
    human_judgment: false
  - id: D2
    description: Browser code fetches FEED_URL at runtime; Vite config has no fetch
    requirement: FEED-01
    verification:
      - kind: other
        ref: grep FEED_URL in src/config.ts and src/feed/fetchFeed.ts; grep fetch( in vite.config.ts equals 0
        status: pass
    human_judgment: false
  - id: D3
    description: parseRss reads title, pubDate, link, description via DOMParser textContent
    requirement: FEED-02
    verification:
      - kind: other
        ref: grep DOMParser and textContent in src/feed/parseRss.ts
        status: pass
    human_judgment: false
  - id: D4
    description: River is one column, newest first, single page, live titles visible
    requirement: RIVER-02
    verification: []
    human_judgment: true
    rationale: Newest-first sort is in parseRss; confirming live titles and layout needs a browser.
  - id: D5
    description: Each piece permalink is the feed item link on dergigi.com
    requirement: RIVER-03
    verification:
      - kind: other
        ref: grep canonicalUrl in src/ui/piece.ts
        status: pass
    human_judgment: true
    rationale: Code wires href to item link; a human should click a live permalink.
  - id: D6
    description: package.json is 0.1.0 with Keep a Changelog and a README that documents npm run dev
    requirement: REPO-01
    verification:
      - kind: other
        ref: node package.json version check; grep 0.1.0 and Keep a Changelog in CHANGELOG.md; grep npm run dev in README.md
        status: pass
    human_judgment: false

duration: 3min
completed: 2026-08-19
status: complete
---

# Phase 1 Plan 1: Runtime RSS river skeleton Summary

**Vite vanilla-ts site that fetches https://dergigi.com/thoughts.xml at runtime and renders one newest-first river**

## Performance

- **Duration:** 3 min
- **Started:** 2026-08-19T09:16:03Z
- **Completed:** 2026-08-19T09:19:09Z
- **Tasks:** 3
- **Files modified:** 20

## Accomplishments
- Scaffolded official Vite vanilla-ts into the existing repo without overwriting PRODUCT.md, AGENTS.md, .planning/, or .cursor/
- Runtime GET of the live thoughts RSS, parsed with DOMParser (`application/xml` + `textContent`), rendered as one river
- SemVer 0.1.0, Keep a Changelog, and a README that says how to run `npm run dev`

## Task Commits

Each task was committed atomically:

1. **Task 1: Confirm one-way door: runtime feed fetch** - skipped (orchestrator auto-selected `runtime-fetch`; D-01 already locked)
2. **Task 2: End-to-end live river — scaffold, fetch, parse, render** - `1c39912` (feat)
3. **Task 3: Repo conventions: SemVer, changelog, README** - `519c297` (docs)

**Plan metadata:** `docs(01-01): complete runtime RSS river skeleton plan`

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## Files Created/Modified
- `package.json` / `package-lock.json` - Vite 8 + TypeScript 6.x; name `thinking-in-public`, version `0.1.0`
- `index.html` - title Thinking in Public, mounts `#app`
- `vite.config.ts` - empty Vite config; no `fetch(`
- `tsconfig.json` - official template compiler options
- `.gitignore` - node_modules, dist, logs
- `src/config.ts` - `FEED_URL`, `PUBLISHER_ORIGIN`, unused `FALLBACK_FEED_URL`
- `src/feed/types.ts` - `Piece`, `RiverState`, fetch/parse result types
- `src/feed/fetchFeed.ts` - runtime GET of `FEED_URL`
- `src/feed/parseRss.ts` - DOMParser, `textContent`, newest-first sort
- `src/feed/loadRiver.ts` - fetch → parse → ready or empty
- `src/main.ts` - loading, then `loadRiver`, then render
- `src/ui/render.ts` - switch on `RiverState`
- `src/ui/river.ts` - one column of pieces
- `src/ui/piece.ts` - title, UTC date, `textContent` body, `canonicalUrl` permalink
- `src/ui/loading.ts` - one quiet loading line
- `src/style.css` - unpolished paper measure (Impeccable polish is Phase 2)
- `README.md` - what this is and `npm run dev`
- `CHANGELOG.md` - Keep a Changelog starting at 0.1.0
- `public/favicon.svg` - template favicon kept so the icon href resolves

## Decisions Made
- Proceeded with runtime fetch (D-01). Orchestrator auto-selected `runtime-fetch`; did not choose build-time fetch.
- Official `create-vite` 9.1.2 `vanilla-ts` now ships a single `tsconfig.json` and no `vite.config.ts`. Followed the official template (D-10). Added an empty `vite.config.ts` so the plan's "no fetch in vite config" check has a file to inspect.
- Description body uses `textContent` this plan so the insert sink exists without an HTML sink.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Official template no longer emits split tsconfigs**
- **Found during:** Task 2 (End-to-end live river)
- **Issue:** Plan `files_modified` listed `tsconfig.app.json` and `tsconfig.node.json`. Current official vanilla-ts template does not create them.
- **Fix:** Copied the official template as-is. Did not invent the older split tsconfig files. Added a blank `vite.config.ts` because the plan verify requires that path.
- **Files modified:** `tsconfig.json`, `vite.config.ts`
- **Verification:** `npm run build` passed; vite.config.ts contains no `fetch(`
- **Committed in:** `1c39912` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking / template drift)
**Impact on plan:** No scope creep. Stack still matches D-10.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
Ready for 01-02 (sanitize, URL rewrite, empty-state copy, paper surface). Pipeline stops at `bodyText`; `FALLBACK_FEED_URL` is a constant only. Do not add DOMPurify or a proxy in leftover work from this plan.

## Self-Check: PASSED

- Created files exist on disk
- Commits `1c39912` and `519c297` exist
- `npm run build` passed
- Plan automated greps passed

---
*Phase: 01-live-reading-river*
*Completed: 2026-08-19*
