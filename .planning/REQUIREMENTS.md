# Requirements: Thinking in Public

**Defined:** 2026-08-19
**Core Value:** A new post tagged `thoughts` on dergigi.com appears here without redeploying this site.

## v1 Requirements

### Feed

- [x] **FEED-01**: Visitor's browser fetches `https://dergigi.com/thoughts.xml` at runtime (not during `vite build`)
- [x] **FEED-02**: Site parses RSS 2.0 items and reads title, pubDate, link, and description HTML

### River

- [ ] **RIVER-01**: Visitor sees each piece's title, calendar date (UTC, no clock), and HTML description
- [x] **RIVER-02**: Pieces appear newest first as one long river on a single page
- [x] **RIVER-03**: Each piece links to its canonical feed `<link>` on dergigi.com

### HTML

- [ ] **HTML-01**: Root-relative `href` and `src` in item HTML resolve to `https://dergigi.com/...`
- [ ] **HTML-02**: Item HTML is sanitized before insert; title, date, and canonical link are text nodes

### States

- [ ] **STATE-01**: If the feed fails or has no items, visitor sees a quiet empty state with no invented posts

### Reading

- [ ] **READ-01**: Light paper reading surface: generous measure, quiet type, almost no chrome, no cover hero
- [ ] **READ-02**: Design follows Impeccable Read mode (typeset, layout, distill, polish) and does not clone dark dergigi.com

### Repo

- [x] **REPO-01**: Commits follow Conventional Commits; version follows SemVer; `CHANGELOG.md` uses Keep a Changelog

## v2 Requirements

Deferred. Not in the current roadmap.

### States

- **STATE-02**: Distinct copy for fetch failure vs a truly empty feed, plus a quiet retry

### Reading

- **READ-03**: Footer link to `https://dergigi.com/thoughts.xml` if readers ask how to subscribe

## Out of Scope

| Feature | Reason |
|---------|--------|
| Creating or editing posts | dergigi.com is the only writing workflow |
| CMS, markdown copies, second editorial store | Splits the source of truth |
| Build-time feed fetch | A new post would require a redeploy |
| Fake / demo / LLM posts | The feed is the only content |
| Search, pagination, unread, multi-feed | This is a log, not a reader app |
| Cover heroes, card grids, magazine chrome | Visitors come to read |
| Dark clone of dergigi.com | Light paper surface is the brief |
| DNS for thoughts.dergigi.com / tip.dergigi.com | Local site against the live feed is enough |
| Changing the Jekyll feed or tagging old posts | Owned by dergigi.com |
| Newsletter, comments, accounts | Wrong product |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FEED-01 | Phase 1 | Complete |
| FEED-02 | Phase 1 | Complete |
| RIVER-01 | Phase 1 | Pending |
| RIVER-02 | Phase 1 | Complete |
| RIVER-03 | Phase 1 | Complete |
| HTML-01 | Phase 1 | Pending |
| HTML-02 | Phase 1 | Pending |
| STATE-01 | Phase 1 | Pending |
| READ-01 | Phase 1 | Pending |
| READ-02 | Phase 2 | Pending |
| REPO-01 | Phase 1 | Complete |

**Coverage:**

- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0

---
*Requirements defined: 2026-08-19*
*Last updated: 2026-08-19 after roadmap creation*
