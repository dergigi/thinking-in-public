# Phase 1: Live reading river - Context

**Gathered:** 2026-08-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship a local Vite site that fetches `https://dergigi.com/thoughts.xml` at runtime and renders a readable river (or an honest empty state). This phase includes fetch, parse, URL rewrite, sanitize, river UI, paper surface, and repo conventions. Impeccable polish leftover is Phase 2 (READ-02).

</domain>

<decisions>
## Implementation Decisions

Decisions below come from the user's original brief plus GSD project research. Discuss-phase did not re-ask locked questions.

### Feed and pipeline
- **D-01:** Fetch `https://dergigi.com/thoughts.xml` in the browser at runtime. Do not fetch during `vite build`. — **Reversibility:** one-way — a build-time snapshot would freeze the river and break the core value.
- **D-02:** Parse RSS 2.0 with the browser `DOMParser`. Read title, pubDate, link, description. One XML parse; use `textContent` for description (feed is entity-escaped, not CDATA).
- **D-03:** Sanitize with DOMPurify 3.4.13 at the insert sink. Rewrite root-relative `href`/`src` inside `uponSanitizeAttribute` using `new URL(value, "https://dergigi.com")`. Never assign raw description HTML. Title, date, and canonical link are text nodes. — **Reversibility:** costly — sanitizer and rewriter sit on the only untrusted-input boundary.

### River
- **D-04:** One long river, newest first, single page. No cards, heroes, teasers, or pagination.
- **D-05:** Each piece shows title, UTC calendar date (no clock, `timeZone: "UTC"`), and sanitized HTML description.
- **D-06:** Canonical permalink is the item `<link>` on dergigi.com.

### Empty state
- **D-07:** If the feed fails or has no items, show one quiet empty state. No fake posts, no demo essays, no forever spinner. Distinct fail-vs-empty copy is v2.

### Reading surface
- **D-08:** Light paper page. Generous measure, quiet type, almost no chrome. Channel title "Thinking in Public" is enough. Do not clone dark dergigi.com.
- **D-09:** Impeccable visitor mode is Read. Run `/impeccable init` then typeset, layout, distill on this surface in Phase 1; polish is Phase 2.

### Stack and repo
- **D-10:** Official Vite `vanilla-ts` template. TypeScript 6.x. DOMPurify is the only production dependency. No React, Astro, Next, or Tailwind.
- **D-11:** Conventional Commits, SemVer (start at 0.1.0), `CHANGELOG.md` in Keep a Changelog format.

### Claude's Discretion
- Empty-state wording, exact typeface choices within the paper brief, and whether to add a quiet loading line before the river arrives.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and requirements
- `.planning/PROJECT.md` — what this is, core value, out of scope
- `.planning/REQUIREMENTS.md` — FEED-01, FEED-02, RIVER-01..03, HTML-01..02, STATE-01, READ-01, REPO-01
- `.planning/ROADMAP.md` — Phase 1 goal and success criteria
- `PRODUCT.md` — Impeccable product truth (Read mode; no visual world)

### Research
- `.planning/research/SUMMARY.md` — stack, pipeline, pitfalls
- `.planning/research/STACK.md` — Vite 8 + DOMPurify 3.4.13
- `.planning/research/ARCHITECTURE.md` — `src/feed/` + `src/ui/`
- `.planning/research/PITFALLS.md` — XSS, relative URLs, midnight UTC, no copied posts

### Live source
- `https://dergigi.com/thoughts.xml` — the only content source

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None. Greenfield except GSD/Impeccable installer files under `.cursor/`.

### Established Patterns
- None in app code. Follow ARCHITECTURE.md: pipeline in `src/feed/`, view in `src/ui/`, config for `FEED_URL` and `PUBLISHER_ORIGIN`.

### Integration Points
- Browser `fetch` of the live feed. CORS is currently `Access-Control-Allow-Origin: *`. No production proxy in this phase.

</code_context>

<specifics>
## Specific Ideas

- User: "A log, not a magazine. No cover heroes."
- User: "Do not create or edit blog posts. The source of truth is the existing Jekyll blog."
- User: "Light theme by default. Built for reading: paper-like page, generous measure, quiet type. Do not clone the dark dergigi.com chrome."
- User: "No LLM-looking copy. No fake posts for the demo."
- Live feed already uses channel title "Thinking in Public" and relative links like `href="/time"`.

</specifics>

<deferred>
## Deferred Ideas

- Distinct fetch-error vs empty copy, plus retry (STATE-02, v2)
- Footer subscribe link to `thoughts.xml` (READ-03, v2)
- Impeccable polish pass (READ-02, Phase 2)
- CORS Worker / same-origin proxy (only if the feed drops `*`)

</deferred>

---

*Phase: 1-Live reading river*
*Context gathered: 2026-08-19*
