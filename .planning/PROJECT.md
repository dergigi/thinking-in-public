# Thinking in Public

## What This Is

A reading site for Thinking in Public, later hosted at thoughts.dergigi.com (tip.dergigi.com may point at the same thing). It fetches the live RSS feed from https://dergigi.com/thoughts.xml at runtime and renders a long river of pieces: title, date, and HTML description, newest first. Each piece links back to its canonical URL on dergigi.com.

This is a log, not a magazine. Almost no chrome. No cover heroes. Visitors come here to read, not to be sold.

## Core Value

A new post tagged `thoughts` on dergigi.com appears here without redeploying this site.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Fetch https://dergigi.com/thoughts.xml at runtime and parse RSS items
- [ ] Render each item's title, date, and HTML description, newest first, as one long river
- [ ] Link each piece to its canonical `<link>` on dergigi.com
- [ ] Rewrite relative URLs in item HTML (`href="/..."`, `src="/assets/..."`) to `https://dergigi.com/...`
- [ ] Empty state if the feed fails or has no items
- [ ] Light, paper-like reading surface via Impeccable in Read mode
- [ ] Repo conventions: Conventional Commits, SemVer, Keep a Changelog

### Out of Scope

- Creating or editing blog posts — dergigi.com is the only writing workflow
- CMS, markdown copies, or a second writing workflow
- Build-time feed fetch — publishing must not require a redeploy
- DNS for thoughts.dergigi.com / tip.dergigi.com
- Changing the Jekyll feed or tagging old posts
- Cloning the dark dergigi.com chrome
- Fake posts or LLM-looking demo copy

## Context

The source of truth is the existing Jekyll blog at https://dergigi.com. Posts opt in with a `thoughts` tag. The feed is already live.

Inspected 2026-08-19:
- RSS 2.0, `application/xml`, served from GitHub Pages
- `Access-Control-Allow-Origin: *` (browser fetch is possible)
- Channel title is already "Thinking in Public"
- Item descriptions are HTML-escaped and contain relative links such as `href="/time"`
- Canonical item links look like `https://dergigi.com/2026/08/19/thinking-in-public/`

Design system is Impeccable. First run is Read mode: the visitor is here to read. Follow the craft floor. Run typeset, layout, distill, and polish on the reading surface before calling it done. Light theme by default. Paper-like page, generous measure, quiet type. Do not invent a generic AI aesthetic.

GSD Core is installed locally for this repo. Do not one-shot the app; follow the phase loop.

## Constraints

- **Content source**: Only the live RSS feed — no local post files
- **Runtime fetch**: New tagged posts must appear without redeploying this site
- **Hosting later**: thoughts.dergigi.com; this repo only needs a local site that points at the live feed
- **Design**: Impeccable, Read mode, light theme, not a clone of dergigi.com
- **Repo**: Conventional Commits, SemVer, CHANGELOG.md in Keep a Changelog format
- **No second editorial workflow**: do not create or edit posts here

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Runtime RSS fetch from https://dergigi.com/thoughts.xml | Publishing on dergigi.com should show up here without a redeploy | — Pending |
| One long river, newest first, almost no chrome | A log, not a magazine | — Pending |
| Canonical link is the feed `<link>` | Pieces belong on dergigi.com; this site is a reading surface | — Pending |
| Rewrite relative URLs to https://dergigi.com | Feed HTML uses site-root paths that would break here | — Pending |
| Light paper theme via Impeccable Read mode | Built for reading; do not clone the dark dergigi.com chrome | — Pending |
| No CMS / no markdown copies | dergigi.com stays the only writing workflow | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-19 after initialization*
