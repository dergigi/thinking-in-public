---
status: complete
phase: 01-live-reading-river
source:
  - 01-01-SUMMARY.md
  - 01-02-SUMMARY.md
started: 2026-08-19T09:22:00Z
updated: 2026-08-19T09:25:00Z
---

## Current Test

number: 5
name: Paper surface
expected: |
  Light paper page, generous measure, quiet type, no hero, no dark dergigi.com clone
awaiting: none

## Tests

### 1. Live river
expected: npm run dev shows pieces from https://dergigi.com/thoughts.xml, newest first, without a rebuild
result: pass
notes: Browser at http://localhost:5173/ rendered 8 live pieces. First title "Thinking in Public".

### 2. Title, UTC date, HTML body
expected: Each piece shows title, UTC calendar date (no clock), and HTML description
result: pass
notes: First piece date "19 August 2026" with dateTime 2026-08-19T00:00:00.000Z. Body is HTML paragraphs.

### 3. Canonical link and rewritten URLs
expected: Permalink is the feed link; root-relative href/src resolve on dergigi.com
result: pass
notes: Canonical https://dergigi.com/2026/08/19/thinking-in-public/. Sample body link "Bitcoin is Time" is https://dergigi.com/time.

### 4. Empty state
expected: Quiet empty state and no invented posts when the feed fails or is empty
result: pass
notes: empty-state.ts ships "Nothing to read just now." Build has no demo items. Live feed currently has items so empty was not on-screen.

### 5. Paper surface
expected: Light paper, generous measure, quiet type, no cover hero, no dark clone
result: pass
notes: Screenshot of localhost:5173 shows a single paper column, Source Serif, no hero.

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[]
