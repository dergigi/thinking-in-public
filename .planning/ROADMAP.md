# Roadmap: Thinking in Public

## Overview

A visitor opens a local Vite site and reads the live `thoughts` feed from dergigi.com as one long river. Phase 1 ships the whole product slice: runtime fetch, parse, URL rewrite, sanitize, river and empty state, a light paper page, and repo conventions. Phase 2 is the leftover Impeccable polish pass once real posts are on screen. No extra phases for proxies, research, or docs.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Live reading river** - Runtime feed, river, empty state, paper surface, repo conventions
- [ ] **Phase 2: Impeccable polish** - Impeccable Read typeset, layout, distill, and polish on the live river

## Phase Details

### Phase 1: Live reading river

**Goal:** As a visitor, I want to read the live thoughts river, so that a new tagged post appears without a redeploy.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: FEED-01, FEED-02, RIVER-01, RIVER-02, RIVER-03, HTML-01, HTML-02, STATE-01, READ-01, REPO-01
**Success Criteria** (what must be TRUE):

  1. Visitor opens the local site and sees pieces from the live `thoughts.xml` feed, newest first, without a rebuild after a new tagged post.
  2. Each piece shows title, UTC calendar date (no clock), and HTML description.
  3. Each piece links to its canonical dergigi.com URL; root-relative body `href` and `src` resolve on dergigi.com; title, date, and permalink are text.
  4. If the feed fails or has no items, visitor sees a quiet empty state and no invented posts.
  5. Visitor reads on a light paper page with generous measure, quiet type, almost no chrome, and no cover hero.

**Plans**: 2 plans
Plans:
**Wave 1**

- [ ] 01-01-PLAN.md — Walking skeleton: Vite river from the live feed

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 01-02-PLAN.md — Sanitize, rewrite, UTC dates, empty state, paper surface

**UI hint**: yes

### Phase 2: Impeccable polish

**Goal:** As a visitor, I want the river polished to Impeccable Read craft, so that the page feels like paper, not a demo.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: READ-02
**Success Criteria** (what must be TRUE):

  1. Visitor reads the live river after Impeccable typeset, layout, distill, and polish have been applied.
  2. Visitor does not see a dark dergigi.com clone, magazine cards, heroes, or leftover demo chrome.
  3. Empty and loading states sit on the same paper surface as the river.

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Live reading river | 0/2 | Not started | - |
| 2. Impeccable polish | 0/? | Not started | - |
