# Project Research Summary

**Project:** Thinking in Public
**Domain:** Runtime RSS reading river (single-feed personal log)
**Researched:** 2026-08-19
**Confidence:** HIGH

## Executive Summary

This is a reading surface for one author's `thoughts` feed, not a magazine, not a SaaS reader, and not a second blog. Visitors come here to read. dergigi.com stays the writing workflow and the canonical home of each piece. Experts build this as a static client page that fetches RSS at runtime, parses it in the browser, sanitizes the HTML, and renders one long reverse-chronological river. They do not bake posts into the build, and they do not invent a CMS.

The recommended approach is Vite 8 vanilla TypeScript plus one library: DOMPurify 3.4.13. Parse with `DOMParser`. Fetch `https://dergigi.com/thoughts.xml` in the browser (CORS is already `Access-Control-Allow-Origin: *`). Rewrite root-relative URLs with `new URL(value, "https://dergigi.com")` during sanitize. Render title, calendar date, and sanitized description as one column. Empty state on failure or zero items. Impeccable Read mode owns the paper look: light theme, generous measure, quiet type, almost no chrome. No React, no Astro, no Next, no Tailwind.

The risks that actually kill this product are few and known. XSS from feed HTML is the security risk: sanitize at the sink, rewrite URLs inside `uponSanitizeAttribute`, never assign raw description to `innerHTML`. Relative `/time` links that resolve against this host are the correctness risk. A build-time fetch, a checked-in `thoughts.xml`, or a demo post kills the core value (a new tagged post appears without redeploying). Midnight UTC `pubDate` printed in the viewer's zone slips the calendar day. A magazine skin or a dark dergigi.com clone fails the brief even if the pipeline works. Mitigate all of these in the first phase. Do not split fetch, sanitize, and render across phases.

## Key Findings

### Recommended Stack

See [STACK.md](STACK.md). Scaffold with `npm create vite@latest . -- --template vanilla-ts`. That is the whole toolchain: Vite 8.2.1, TypeScript ~6.0.2, `npm run dev` / `build` / `preview`. Add DOMPurify 3.4.13 as the only production dependency. Everything else is a browser API (`fetch`, `DOMParser`, `URL`). Impeccable is an in-repo design skill, not an npm package. Stay on TypeScript 6.x; TypeScript 7 has no JS compiler API and will break later ESLint tooling.

**Core technologies:**
- Vite 8.2.1: local server and static `dist/` — smallest current tool that matches later static hosting
- TypeScript 6.0.3 (`~6.0.2`): typed app code and the template's `tsc && vite build` gate
- Browser `fetch`: load the live feed at runtime — CORS is open; a new post appears without a redeploy
- `DOMParser`: parse the known RSS 2.0 document — no npm XML parser earns its keep
- DOMPurify 3.4.13: sanitize item HTML and rewrite URLs in the same pass — the feed is untrusted input
- Impeccable Read mode (skill v4.1.1): paper reading surface — custom CSS you author, not a theme kit

### Expected Features

See [FEATURES.md](FEATURES.md). Table stakes are the product. Differentiators are restraint, not extra chrome. Adjacent products (Winer's scan river, Miniflux, kottke, dergigi.com itself) teach what to refuse: teasers, unread counts, pagination, membership, a dark clone.

**Must have (table stakes):**
- Runtime fetch of `https://dergigi.com/thoughts.xml` — new `thoughts` posts appear without redeploy
- RSS 2.0 parse; decode description HTML once via XML `textContent`
- Title, calendar date, sanitized HTML description, newest first, one long river
- Canonical link from each item `<link>` to dergigi.com
- Rewrite root-relative `href`/`src` to `https://dergigi.com/...`
- Empty state when the feed fails or has no items (no fake posts)
- Light paper reading surface (Impeccable Read mode, almost no chrome)
- Calendar date only (Jekyll midnight UTC is not a clock)
- Quiet channel title ("Thinking in Public")

**Should have (competitive):**
- Distinct empty vs fetch-error copy, plus a quiet retry — add after the river reads cleanly
- Last-good river on a failed refetch — in-memory only, not a second store
- Footer link to `thoughts.xml` — if readers ask how to subscribe

**Defer (v2+):**
- Last-fetched timestamp, in-page fragments, client cache, print stylesheet
- Search, pagination, CMS, newsletter, heroes, dark mode toggle, local per-piece pages
- Multi-feed reader features, comments, accounts, archive-by-year
- Same-origin CORS proxy / Worker — only if the feed drops `Access-Control-Allow-Origin: *`

### Architecture Approach

See [ARCHITECTURE.md](ARCHITECTURE.md). Client-only. One page, no router, no store. A six-step pipeline in `src/feed/` returns a `RiverState` union (`loading` | `ready` | `empty`). The view layer in `src/ui/` only renders that state. Config holds `FEED_URL` and `PUBLISHER_ORIGIN`. The feed is the only data store. Vite `server.proxy` is a documented fallback for local CORS testing, not a production path.

**Major components:**
1. Fetcher (`fetchFeed`) — GET the XML text; map HTTP / network failure to a typed error
2. Parser (`parseRss`) — `DOMParser` `application/xml`, reject `parsererror`, read title / pubDate / link / description, sort newest first
3. URL rewriter (`rewriteUrls`) — resolve `href` / `src` against `https://dergigi.com` with the URL API
4. Sanitizer (`sanitizeHtml`) — DOMPurify HTML profile at the sink; rewrite during `uponSanitizeAttribute`
5. Loader (`loadRiver`) — orchestrates the pipeline; returns `ready` or `empty`
6. River / empty / loading views — one column; title and date are text; body is sanitized HTML; permalink is item `<link>`

### Critical Pitfalls

See [PITFALLS.md](PITFALLS.md). Address every critical pitfall in Phase 1. Do not leave sanitize or empty state for a later phase.

1. **XSS via feed HTML** — Sanitize with DOMPurify (≥ 3.3.2, pin 3.4.13) at insert time. Title, date, and canonical link are text nodes. Rewrite URLs inside `uponSanitizeAttribute`, not after sanitize. Never raw `innerHTML` of the description.
2. **Broken relative URLs** — Rewrite path-absolute `/time` against `https://dergigi.com`, not the channel `<link>` (`https://dergigi.com/thinking`). No document `<base>`. No regex on the HTML string.
3. **CDATA / escaped HTML mishandled** — One XML parse, then `textContent`. No custom entity decoder. Escaped and CDATA fixtures must yield the same HTML string.
4. **Build-time fetch or copied posts** — Runtime `fetch` only. No prerendered item list, no `content/` markdown, no committed feed used at runtime. Test fixtures stay in the test tree.
5. **Empty/error that looks broken, or a fake post** — Designed loading, empty, and error on the same paper. No demo essay. No forever spinner.
6. **Midnight UTC printed in the viewer zone** — Format the calendar date in UTC so it matches the canonical URL path. No clock, no "3 hours ago."
7. **Magazine chrome or a dark dergigi.com clone** — One river. Light paper. Impeccable Read mode. Cut heroes, cards, and marketing footers.

## Implications for Roadmap

This is a small product. Research mapped pitfalls onto four micro-phases (parse, sanitize, river UI, Impeccable). That is the wrong granularity. The pipeline is one vertical slice: skip any step and the river is empty, shows raw entities, points at the wrong host, or is unsafe.

Recommend **two coarse phases**. Fold Impeccable typeset, layout, and distill into Phase 1 so the first ship is a reading page, not a Vite demo. Fold repo conventions (Conventional Commits, SemVer, Keep a Changelog) into Phase 1 scaffold. Phase 2 is a short polish gate after live posts are on screen. Do not add a third phase for CORS proxies, retry chrome, or v1.x niceties.

### Phase 1: Live reading river
**Rationale:** The core value is a new `thoughts` post appearing here without a redeploy. That only exists when fetch, parse, rewrite, sanitize, render, and empty state all work against the live feed. A paper surface is table stakes, not a later skin. Repo conventions are files and a habit, not a product phase.
**Delivers:** A local Vite site that loads `https://dergigi.com/thoughts.xml` at runtime and renders a readable river (or an honest empty state). Scaffold, pipeline, UI, paper CSS, `CHANGELOG.md`, SemVer starting version.
**Addresses:** All FEATURES.md P1 items: runtime fetch, parse + one decode, title / date / HTML river, canonical `<link>`, URL rewrite, sanitize, empty/error state, live content only, calendar date, quiet channel title, light paper surface. PROJECT.md repo conventions.
**Avoids:** XSS (PITFALLS 1), broken relative URLs (2), CDATA / double-decode (3), empty/error that looks dead or a fake post (4), build-time freeze (5), date off-by-one (6), magazine / dark clone (7), copied posts in the repo (8).
**Uses:** Vite 8 vanilla-ts, TypeScript 6.x, `fetch`, `DOMParser`, DOMPurify 3.4.13, `URL`, Impeccable Read (typeset, layout, distill).
**Implements:** The full `src/feed/` pipeline and `src/ui/` render path from ARCHITECTURE.md.

### Phase 2: Impeccable polish
**Rationale:** Distill and polish want a real river on screen, not fixtures. Keep this phase thin. If Phase 1 already meets the craft floor after distill, Phase 2 is verification and leftover polish, not new product work.
**Delivers:** Impeccable polish pass on the live river and empty state. Print / reduced-motion / skip-to-content only if they fall out of the craft floor. No new features.
**Uses:** In-repo Impeccable skill; existing `reading.css` and UI.
**Implements:** Pitfall 7 residual (magazine gravity after first ship). FEATURES.md P2 items stay out unless a real reader asks.

### Phase Ordering Rationale

- Fetch → parse → rewrite → sanitize → render → empty state is one dependency chain. Splitting it produces a half-site that cannot be validated.
- The paper surface enhances the river; it does not replace it. Ship both in Phase 1 so the first review is a reading page.
- Impeccable polish after live content is the only split that earns a second phase. Repo conventions do not.
- CORS fallback, retry, last-good cache, and footer subscribe links are not phases. Document the fallback. Add P2 after a real post has been read end-to-end.

### Research Flags

Phases likely needing deeper research during planning:
- None. Do not run `/gsd-plan-phase --research-phase` on either phase.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Official Vite `vanilla-ts` template, MDN `DOMParser` / `fetch`, DOMPurify README, live feed already inspected (2026-08-19). Rewrite and sanitize pitfalls are documented in PITFALLS.md.
- **Phase 2:** Impeccable is already in-repo. Read mode, typeset / layout / distill / polish is the skill's own flow.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | `npm view` + official Vite / TypeScript / DOMPurify docs on 2026-08-19. Live feed CORS verified with `curl`. |
| Features | HIGH | Table stakes and anti-features locked to PROJECT.md plus the live feed. Differentiator ranking is MEDIUM and should not shape the roadmap. |
| Architecture | HIGH | Client-only pipeline matches the feed shape. Feed facts from direct inspection, not search snippets. |
| Pitfalls | HIGH | XSS, relative URLs, build-time freeze, midnight UTC, and empty-state slop are well-sourced. Phase mapping in PITFALLS.md is too fine; ignore it for roadmap grain. |

**Overall confidence:** HIGH

### Gaps to Address

- **CORS is `*` today, not a contract:** Ship the error state in Phase 1. Wire `FALLBACK_FEED_URL` as a config value if cheap. Do not build a Worker or Vite-proxy-as-production until the header actually disappears.
- **Date zone:** RESEARCH agrees UTC matches the canonical URL path. Lock UTC in Phase 1 planning. Do not use `toLocaleDateString()` without `timeZone: "UTC"`.
- **`srcset` / images:** Current feed sample only needs `href`. Support `src` now. Split `srcset` only if a later item uses it.
- **Empty vs error copy:** v1 can share one quiet state. Distinct copy and retry are P2 after the river works.
- **Impeccable artifacts:** `PRODUCT.md` / `DESIGN.md` do not exist yet. Generate them in Phase 1 via the Impeccable new-work flow, not as a separate research phase.
- **Vitest:** Optional. Add when writing rewrite / decode / empty-state tests. Not a phase.

## Sources

### Primary (HIGH confidence)
- Live feed `https://dergigi.com/thoughts.xml` via `curl` on 2026-08-19 — RSS 2.0, CORS `*`, escaped HTML, root-relative `href="/time"`, midnight UTC `pubDate`
- [PROJECT.md](../PROJECT.md) — validated scope, out-of-scope, core value
- [Vite getting started](https://vite.dev/guide/) and [create-vite template-vanilla-ts](https://github.com/vitejs/vite/blob/main/packages/create-vite/template-vanilla-ts/package.json) — Vite 8.2.1, TypeScript ~6.0.2, scripts
- [DOMParser.parseFromString (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString) — `application/xml`, `parsererror`
- [DOMPurify README](https://github.com/cure53/DOMPurify) — 3.4.13, hooks, non-re-entrant `sanitize`
- [RSS 2.0 specification](https://www.rssboard.org/rss-2-0-9) and [RSS Board Best Practices Profile](https://www.rssboard.org/rss-profile) — description is HTML; relative URLs have no defined base
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) — sanitize HTML; DOMPurify
- `npm view` on 2026-08-19 — vite 8.2.1, typescript 6.0.3 / 7.0.2, dompurify 3.4.13, create-vite 9.1.2

### Secondary (MEDIUM confidence)
- [W3C feed validator: ContainsRelRef](https://validator.w3.org/feed/docs/warning/ContainsRelRef.html) — relative `href`/`src` break in aggregators
- [Jesse Squires, RSS feeds, Jekyll, and absolute versus relative URLs](https://www.jessesquires.com/blog/2021/06/06/rss-feeds-jekyll-and-absolute-versus-relative-urls/) (2021-06-06)
- [Dave Winer, What is a River of News aggregator?](http://scripting.com/2014/06/02/whatIsARiverOfNewsAggregator.html) (2014-06-02) — contrast, not a spec (this river keeps full HTML)
- [Will Richardson, Lazy Jekyll hacks for more accurate publication times](https://willhbr.net/2024/07/18/lazy-jekyll-hacks-for-more-accurate-publication-times/) (2024-07-18) — midnight UTC `pubDate`
- [Impeccable](https://impeccable.style/) — Read mode, not a CSS framework
- [Vite `server.proxy`](https://vite.dev/config/server-options.html#server-proxy) — dev-only; gone after `vite build`
- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) — stay on 6.x for compiler API consumers
- [CVE-2026-65912](https://github.com/cure53/DOMPurify/security/advisories/GHSA-cjmm-f4jc-qw8r) — pin DOMPurify ≥ 3.3.2
- [CVE-2026-65914](https://github.com/advisories/GHSA-H8R8-WCCR-V5F2) — do not wrap sanitized HTML in a second parse context

### Tertiary (LOW confidence)
- Competitor analogs (kottke membership/pagination, Miniflux unread, consumer reading-log apps) — useful as anti-features, not requirements
- Cloudflare Workers CORS header proxy — documented fallback only; do not schedule as a phase

---
*Research completed: 2026-08-19*
*Ready for roadmap: yes*
