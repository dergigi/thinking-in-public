# Walking Skeleton — Thinking in Public

**Phase:** 1
**Generated:** 2026-08-19

## Capability Proven End-to-End

A visitor runs `npm run dev`, opens the local Vite page, and reads pieces from a runtime GET of `https://dergigi.com/thoughts.xml` — title, date, body, and a canonical dergigi.com link — newest first.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Official Vite `vanilla-ts` (Vite 8, TypeScript 6.x) | Smallest toolchain that serves a local page and emits static `dist/`. Locked D-10. No React, Astro, Next, or Tailwind. |
| Data layer | Runtime browser `GET` of `https://dergigi.com/thoughts.xml` | There is no database and no write path. The live RSS document is the only store. A new `thoughts` post appears without redeploying this site (D-01, one-way). |
| Parse | Browser `DOMParser` (`application/xml`) | One known RSS 2.0 document. Read title, pubDate, link, description via `textContent` (D-02). |
| Auth | None | Public feed. No accounts. |
| Deployment target | Local `npm run dev` | This repo ships a local site against the live feed. Later static hosting is `npm run build` `dist/`; not this skeleton. |
| Directory layout | `src/config.ts`, `src/feed/` pipeline, `src/ui/` views, `src/styles/reading.css` | Feed transforms stay out of the renderer. The view receives `RiverState` only. |

## Stack Touched in Phase 1

- [ ] Project scaffold (Vite `vanilla-ts`, `dev` / `build` / `preview`, TypeScript 6.x)
- [ ] Routing — one URL, one page (`index.html` → `#app`). No router.
- [ ] Data layer — runtime GET of `https://dergigi.com/thoughts.xml` (not a database; no write)
- [ ] UI — live river of pieces wired to `loadRiver()`
- [ ] Deployment — documented local full-stack run: `npm run dev` against the live feed

## Out of Scope (Deferred to Later Slices)

- Impeccable polish pass (READ-02, Phase 2)
- Distinct fetch-error vs empty copy, plus retry (STATE-02, v2)
- Footer subscribe link to the feed (READ-03, v2)
- Same-origin CORS Worker / Vite-proxy-as-production (only if the feed drops `Access-Control-Allow-Origin: *`)
- Vitest, Prettier, DNS for thoughts.dergigi.com
- Search, pagination, unread, CMS, local post files

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- Phase 2: Impeccable Read polish on the live river and empty state (READ-02)
