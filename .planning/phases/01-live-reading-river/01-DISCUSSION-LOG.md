# Phase 1: Live reading river - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-19
**Phase:** 1-Live reading river
**Areas discussed:** Feed path, River shape, Empty state, Reading surface, Stack

---

## Feed path

| Option | Description | Selected |
|--------|-------------|----------|
| Runtime browser fetch of thoughts.xml | New tagged posts appear without redeploy | ✓ |
| Build-time fetch | Simpler static hosting | |
| Server proxy | Needed only if CORS closes | |

**User's choice:** Runtime fetch (original brief). CORS `*` already on the live feed.
**Notes:** Locked before discuss. Auto-recorded from the spec.

---

## River shape

| Option | Description | Selected |
|--------|-------------|----------|
| One long river, newest first | A log, not a magazine | ✓ |
| Card grid / magazine | Cover heroes, teasers | |
| Pagination | Older/newer pages | |

**User's choice:** One long river. No cover heroes.
**Notes:** Locked in the original brief.

---

## Empty state

| Option | Description | Selected |
|--------|-------------|----------|
| Quiet empty state, no invented posts | Honest if the feed fails or is empty | ✓ |
| Fake demo posts | Fills the page for screenshots | |

**User's choice:** Empty state. No fake posts.
**Notes:** Locked in the original brief.

---

## Reading surface

| Option | Description | Selected |
|--------|-------------|----------|
| Light paper, Impeccable Read | Generous measure, quiet type | ✓ |
| Dark dergigi.com clone | Brand match | |

**User's choice:** Light paper. Do not clone dark dergigi.com. Read mode.
**Notes:** Impeccable init recorded this in PRODUCT.md. Polish leftover is Phase 2.

---

## Stack

| Option | Description | Selected |
|--------|-------------|----------|
| Vite vanilla-ts + DOMPurify | Smallest runtime-fetch path | ✓ |
| Next / Astro SSR | Server fetch | |
| React SPA | Extra framework | |

**User's choice:** Delegated to GSD research (Vite vanilla-ts).
**Notes:** Recorded under PRODUCT.md Stack.

## Claude's Discretion

Empty-state wording, typeface within the paper brief, quiet loading line.

## Deferred Ideas

Distinct error vs empty copy; footer feed link; CORS proxy; Impeccable polish (Phase 2).
