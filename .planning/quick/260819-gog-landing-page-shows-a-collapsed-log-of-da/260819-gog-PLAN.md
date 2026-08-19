---
phase: 260819-gog
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/ui/piece.ts
  - src/styles/reading.css
  - package.json
  - CHANGELOG.md
autonomous: true
requirements:
  - RIVER-01
  - RIVER-03
  - HTML-02
  - READ-01
  - REPO-01
user_setup: []

estimate:
  tokens: 35000
  raw_tokens: 35000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "The landing river shows each piece as a closed log row of UTC date plus title"
    - "Activating a row opens that piece in place; the browser stays on this site"
    - "More than one piece can be open at the same time"
    - "An open piece still shows the sanitized HTML body and the On dergigi.com canonical link"
    - "package.json is 0.0.2 and CHANGELOG.md records 0.0.2 in Keep a Changelog form"
  artifacts:
    - path: src/ui/piece.ts
      provides: details/summary log row around the existing body and canonical link
      contains: createElement('details')
      exports: ["renderPiece"]
    - path: src/styles/reading.css
      provides: compact log rhythm on the paper surface
      contains: summary
    - path: package.json
      provides: SemVer 0.0.2
      contains: '"version": "0.0.2"'
    - path: CHANGELOG.md
      provides: 0.0.2 release notes
      contains: "[0.0.2]"
  key_links:
    - from: src/ui/piece.ts
      to: src/feed/types.ts
      via: renderPiece still reads Piece.title, publishedAt, bodyHtml, canonicalUrl
      pattern: bodyHtml
    - from: src/ui/piece.ts
      to: src/styles/reading.css
      via: .piece summary / .piece .body / .piece .canonical
      pattern: "\\.piece"
    - from: src/feed/loadRiver.ts
      to: src/ui/piece.ts
      via: bodyHtml stays the already-sanitized string; piece.ts does not re-sanitize
      pattern: bodyHtml
---

<objective>
Turn the landing river into a collapsed date-plus-title log. A click (or keyboard activate) on a row opens that piece in place via native details/summary. Open pieces keep the sanitized body and the On dergigi.com link. Ship as SemVer 0.0.2.

Purpose: Visitors scan the log; they read a piece only after they open it. This is still one page, still the live feed, still a log rather than a magazine (D-01, D-02, D-03, D-04, D-05, D-06).
Output: Updated piece markup, compact log CSS, version 0.0.2, changelog entry.
</objective>

<execution_context>
@/Users/gigi/Development/thinking-in-public/.cursor/gsd-core/workflows/execute-plan.md
@/Users/gigi/Development/thinking-in-public/.cursor/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/STATE.md
@PRODUCT.md
@src/ui/piece.ts
@src/ui/river.ts
@src/styles/reading.css
@CHANGELOG.md
@package.json

<interfaces>
From src/feed/types.ts:
export type Piece = {
  title: string
  publishedAt: Date | null
  canonicalUrl: string
  bodyHtml: string
}

From src/ui/piece.ts:
export function renderPiece(piece: Piece): HTMLElement

From src/feed/loadRiver.ts:
bodyHtml is already sanitizeHtml(item.description). renderPiece must not call sanitizeHtml again.

From src/ui/piece.ts dateFormat:
Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })
Keep this formatter. RIVER-01 is a UTC calendar date with no clock.

Canonical link copy stays the string On dergigi.com.
</interfaces>
</context>

<tasks>

<task type="tracer">
  <name>End-to-end open-in-place log row</name>
  <files>src/ui/piece.ts</files>
  <read_first>src/ui/piece.ts, src/feed/types.ts, src/feed/loadRiver.ts</read_first>
  <action>
Rewrite renderPiece so each article.piece is a native disclosure row per D-01, D-02, and D-03.

Build this DOM, in this order, with document.createElement (no innerHTML for the chrome):
- article.piece
  - details (no open flag; do not group entries into an exclusive accordion)
    - summary
      - time (only when piece.publishedAt is set: dateTime = toISOString(), textContent = existing dateFormat)
      - h2 whose textContent is piece.title
    - div.body whose innerHTML is piece.bodyHtml (already sanitized upstream; D-04)
    - a.canonical whose href is piece.canonicalUrl and whose textContent is On dergigi.com (D-04)

Title, date, and the canonical label remain text nodes (HTML-02). The only innerHTML assignment is the body node.

The summary must not contain the canonical anchor or any other link. Activating the summary toggles details in place and must not leave this site (D-02).

Rely on the browser toggle. Do not attach listeners. Do not add a query box, page controls, client routes, or fragment identifiers (D-06).

Leave render.ts, river.ts, loadRiver.ts, and sanitizeHtml.ts untouched. Empty and loading states stay as they are.
  </action>
  <verify>
    <automated>npm run build</automated>
    <automated>test "$(grep -vE '^\s*(//|/\*|\*)' src/ui/piece.ts | grep -c "createElement('details')")" -ge 1</automated>
    <automated>test "$(grep -vE '^\s*(//|/\*|\*)' src/ui/piece.ts | grep -c "createElement('summary')")" -ge 1</automated>
    <automated>test "$(grep -vE '^\s*(//|/\*|\*)' src/ui/piece.ts | grep -c "createElement('time')")" -ge 1</automated>
    <automated>test "$(grep -vE '^\s*(//|/\*|\*)' src/ui/piece.ts | grep -c 'bodyHtml')" -ge 1</automated>
    <automated>test "$(grep -vE '^\s*(//|/\*|\*)' src/ui/piece.ts | grep -c 'On dergigi.com')" -ge 1</automated>
    <automated>test "$(grep -vE '^\s*(//|/\*|\*)' src/ui/piece.ts | grep -c 'canonicalUrl')" -ge 1</automated>
    <automated>test "$(grep -vE '^\s*(//|/\*|\*)' src/ui/piece.ts | grep -c 'addEventListener')" -eq 0</automated>
    <automated>test "$(grep -vE '^\s*(//|/\*|\*)' src/ui/piece.ts | grep -c "setAttribute('open'")" -eq 0</automated>
    <automated>test "$(grep -vE '^\s*(//|/\*|\*)' src/ui/piece.ts | grep -c "setAttribute('name'")" -eq 0</automated>
    <automated>test "$(grep -vE '^\s*(//|/\*|\*)' src/ui/piece.ts src/ui/river.ts src/ui/render.ts | grep -cE 'pushState|hashchange')" -eq 0</automated>
  </verify>
  <acceptance_criteria>
    - Each piece is a closed details/summary row of date plus title (D-01, D-03, RIVER-01).
    - Body and On dergigi.com sit inside details, after summary (D-04, RIVER-03, HTML-02).
    - No exclusive accordion grouping; no open flag on first paint (D-03).
    - No listeners, no fragment identifiers, no client routes (D-02, D-06).
    - npm run build succeeds.
  </acceptance_criteria>
  <done>A visitor can open a live-feed piece in place from a date-plus-title row without leaving the site.</done>
</task>

<task type="auto">
  <name>Compact log typeset and 0.0.2</name>
  <files>src/styles/reading.css, package.json, CHANGELOG.md</files>
  <read_first>src/styles/reading.css, src/ui/piece.ts, PRODUCT.md, .cursor/skills/impeccable/SKILL.md, .cursor/skills/impeccable/reference/layout.md, CHANGELOG.md, package.json</read_first>
  <action>
This is a refinement of the incumbent Read surface, not a new visual world. Run node .cursor/skills/impeccable/scripts/context.mjs --target src/styles/reading.css once. Then load .cursor/skills/impeccable/reference/craft-floor.md immediately before editing CSS. Mode is Read. Honor PRODUCT.md: log not magazine, light paper, quiet type, no cover heroes, no generic AI look.

Restyle the river as a compact scan log per D-01 and READ-01:
- Tighten .river gap. Closed rows should sit as a list, not as isolated essays with space-16 between them.
- summary is one log line: date then title, same reading order as the DOM. A two-column grid on summary (date column, then title) keeps dates aligned. Keep the existing long en-GB UTC date string.
- Keep the native disclosure marker so the row still reads as openable. Do not invent a custom icon set or motion.
- Give summary enough padding for a usable hit target. Reuse --space-* and --rule. Do not add new colors.
- Closed rows must not reveal .body or .canonical (D-01). Open details keep the current body measure, paragraph rhythm, and .canonical styling (D-04).
- Title in the log row should scan at log density, not magazine-hero size. Do not duplicate the title below the summary.
- Do not add cards, teasers, excerpts, a query box, page controls, client routes, or fragment identifiers (D-06).

After CSS, run node .cursor/skills/impeccable/scripts/detect.mjs --json --scope layout src/styles/reading.css src/ui/piece.ts. Fix what it reports in one batch. Do not rewrite PRODUCT.md. Do not create DESIGN.md.

Bump package.json version from 0.0.1 to 0.0.2 (D-05, REPO-01). Keep it on the 0.0.x line.

Update CHANGELOG.md in Keep a Changelog form (D-05): leave ## [Unreleased] in place, add ## [0.0.2] - 2026-08-19 with a Changed note that the landing river is a collapsed date-and-title log and that opening a row shows the sanitized body plus the On dergigi.com link. Do not invent posts or rewrite the 0.0.1 section.
  </action>
  <verify>
    <automated>npm run build</automated>
    <automated>node -e "const p=require('./package.json'); if(p.version!=='0.0.2') process.exit(1)"</automated>
    <automated>test "$(grep -c '\[0.0.2\]' CHANGELOG.md)" -ge 1</automated>
    <automated>test "$(grep -vE '^\s*(//|/\*|\*)' src/styles/reading.css | grep -c 'summary')" -ge 1</automated>
    <automated>test "$(grep -vE '^\s*(//|/\*|\*)' src/styles/reading.css | grep -c 'details')" -ge 1</automated>
    <human-check>Run npm run dev. Confirm the landing is a date-plus-title log, a click opens the body and On dergigi.com in place, a second row can stay open at the same time, and the summary click does not leave this site.</human-check>
  </verify>
  <acceptance_criteria>
    - Closed river is a compact date-plus-title log on the paper page (D-01, READ-01).
    - Open row still shows sanitized body and On dergigi.com (D-04).
    - package.json version is 0.0.2 (D-05, REPO-01).
    - CHANGELOG.md has a 0.0.2 section dated 2026-08-19 (D-05, REPO-01).
    - No query box, page controls, or fragment identifiers (D-06).
  </acceptance_criteria>
  <done>The landing reads as a collapsed log; 0.0.2 is recorded.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Sanitized feed HTML → .body innerHTML | Untrusted item description already passed through DOMPurify in loadRiver. This plan must not open a second raw-HTML sink. |
| Summary click → navigation | If a link lands inside summary, activating the row leaves this site. |
| npm install → node_modules | No new packages in this plan. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-gog-01 | Tampering / XSS | src/ui/piece.ts .body | high | mitigate | innerHTML only on piece.bodyHtml, which loadRiver already ran through sanitizeHtml. Do not assign item.description or any other raw string. Title, date, and canonical label stay textContent (HTML-02). |
| T-gog-02 | Tampering / spoofed navigation | src/ui/piece.ts summary | medium | mitigate | summary contains only time and h2 text nodes. Canonical anchor stays after the body, inside details, so a row activate cannot navigate to dergigi.com (D-02). |
| T-gog-03 | Information disclosure | public RSS titles/dates | low | accept | Feed is already public. Collapsing bodies hides nothing sensitive. |
| T-gog-04 | Denial of service | many open details | low | accept | Native details; D-03 allows more than one open. Author's log is small. |
| T-gog-05 | Elevation of privilege | n/a | low | accept | No auth, no server, no new privileges. |
| T-gog-SC | Tampering | npm/pip/cargo installs | high | accept | No package-manager installs. Stack stays Vite + TypeScript + DOMPurify already in package.json. |

ASVS L1. Block on high. T-gog-01 is the high item and is mitigated by keeping the existing sanitize sink.
</threat_model>

<verification>
npm run build succeeds. piece.ts builds a details/summary row with bodyHtml and On dergigi.com. reading.css styles summary/details. package.json is 0.0.2. CHANGELOG.md contains [0.0.2].
</verification>

<success_criteria>
Landing shows a collapsed UTC-date-plus-title log. Opening a row reveals the sanitized body and the On dergigi.com link without leaving the site. Multiple rows may stay open. Repo is 0.0.2.
</success_criteria>

<output>
Create `.planning/quick/260819-gog-landing-page-shows-a-collapsed-log-of-da/260819-gog-SUMMARY.md` when done
</output>
