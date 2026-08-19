# Thinking in Public

A reading site for the live RSS feed at https://dergigi.com/thoughts.xml. Later host: thoughts.dergigi.com. The index is a date-and-title log. Each line is a real URL for that piece. Content is fetched at runtime; a new `thoughts` post on dergigi.com appears here without a redeploy.

This is a log, not a magazine. Visitors come here to read.

## Constraints

- Content source: only the live RSS feed. No local post files.
- Runtime fetch: do not snapshot the feed at build time.
- No second editorial workflow: do not create or edit posts here.
- Design: Impeccable, Read mode, light paper page, quiet type. Do not clone the dark dergigi.com chrome.
- Repo: Conventional Commits, SemVer on `0.0.x` for now, CHANGELOG.md in Keep a Changelog format.

## Stack

Vite 8 + TypeScript 6 (`vanilla-ts`), browser `fetch` + `DOMParser`, DOMPurify 3.4.13. Static `dist/` for Vercel. No React, no CMS.

## Design

Use the Impeccable skill in `.cursor/skills/impeccable` when changing the reading surface.
