# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Vite official `vanilla-ts` template (Vite 8, TypeScript 6.x) plus DOMPurify. Chosen because GSD stack research picked the smallest runtime-fetch path; CORS on the live feed is already open, so no server framework.

## Users

People who want to read Gigi's `thoughts` pieces in one place. They arrive to read, not to subscribe, convert, or manage a blog. The author is also a user: they write on dergigi.com and expect a new `thoughts`-tagged post to show up here without touching this repo.

## Product Purpose

Thinking in Public is a reading surface for the live RSS feed at https://dergigi.com/thoughts.xml. It exists so writing tagged `thoughts` on dergigi.com can be read as one long log. Success: a newly tagged post appears here without redeploying this site.

## Positioning

This is not a second blog and not a feed reader. dergigi.com stays the only writing workflow and the canonical home of each piece. This site only fetches, sanitizes, and presents the feed as a river.

## Operating Context

- Source of truth: Jekyll blog at https://dergigi.com
- Opt-in: posts with a `thoughts` tag
- Feed: https://dergigi.com/thoughts.xml (already live)
- Later host: thoughts.dergigi.com (tip.dergigi.com may point at the same thing)
- Local work: `npm run dev` against the live feed
- Redeploy this site only when the interface changes

## Capabilities and Constraints

- Fetch the live RSS at runtime; parse title, date, HTML description
- Newest first, one long river, almost no chrome
- Canonical link is the feed `<link>`
- Rewrite root-relative URLs in item HTML to https://dergigi.com
- Empty state if the feed fails or has no items
- No CMS, no markdown copies, no build-time fetch
- Do not create or edit posts in this repo
- Out of scope: DNS, the Jekyll feed, tagging old posts

## Brand Commitments

- Name: Thinking in Public
- Voice: the author's own writing from the feed. No LLM-looking interface copy. No fake posts.
- Binding visual constraints volunteered by the author (not a designed world): light theme; paper-like page; generous measure; quiet type; do not clone the dark dergigi.com chrome; no cover heroes.

## Evidence on Hand

- Live feed: https://dergigi.com/thoughts.xml
- Feed HTML contains the author's pieces and relative links such as `/time`
- Do not fabricate posts, excerpts, testimonials, or demo content

## Product Principles

- The feed is the only source of truth
- A log, not a magazine
- The visitor is here to read
- Redeploy for interface changes, never for new writing
- Restraint is the product

## Accessibility & Inclusion

No product-specific standard was set. The reading surface must remain readable: real text, sufficient contrast on the paper page, no motion required to reach the writing.
