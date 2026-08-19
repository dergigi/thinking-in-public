# Architecture Research

**Domain:** runtime RSS reading river
**Researched:** 2026-08-19
**Confidence:** HIGH

Greenfield. One static TypeScript page fetches `https://dergigi.com/thoughts.xml` in the browser, turns items into a long reading river, and shows an empty state when that fails. No backend, no CMS, no router.

Inspected the live feed on 2026-08-19: RSS 2.0, `application/xml`, GitHub Pages, `Access-Control-Allow-Origin: *`, `Cache-Control: max-age=600`. Item `description` is entity-encoded HTML with site-root links such as `href="/time"`. Canonical `link` values are already absolute on dergigi.com.

## Standard Architecture

### System Overview

```
+---------------------------------------------------------------+
|                     Browser (Vite SPA)                        |
|                                                               |
|   Fetcher --> Parser --> Rewrite --> Sanitize --> River View  |
|      |         |                                 /            |
|      |         +-------- empty / error --------+              |
|      +------------------ empty / error ------ Empty State     |
|                                                               |
+---------------------------------------------------------------+
|                     Network                                   |
|   dergigi.com/thoughts.xml     fallback if CORS closes        |
|   ACAO: * (today)              same-origin /feed.xml          |
|                                Vite proxy (dev) or            |
|                                host rewrite / Worker          |
+---------------------------------------------------------------+
```

Client-only. Vite builds static files. The feed is the only data store.

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Config | Feed URL, publisher origin, optional same-origin fallback URL | `src/config.ts` constants |
| Fetcher | GET the XML text. Try the live feed first. On CORS or network failure, try the fallback URL. Map HTTP errors to a typed failure. | `fetch` + `response.text()` |
| Parser | Parse RSS 2.0. Read `title`, `pubDate`, `link`, `description`. Reject `parsererror`. Sort newest first. | `DOMParser` with `application/xml` |
| URL rewriter | Resolve relative `href` / `src` against `https://dergigi.com` | `DOMParser` (`text/html`) + `new URL(value, origin)` |
| Sanitizer | Strip scripts and dangerous markup from description HTML | DOMPurify, HTML-only profile |
| River loader | Run fetch → parse → rewrite → sanitize. Return `ready` or `empty` | Pure `loadRiver()` function |
| River view | One long column of pieces: title, date, HTML body, canonical link | DOM render into `#app` |
| Empty state | Shown when the feed fails or the parsed list is empty | Same shell, quieter copy |
| Loading state | First paint while the request is in flight | Same shell, no fake posts |

Keep the pipeline in `src/feed/` as plain functions. The view layer only receives a `RiverState`. That keeps Impeccable polish (later) from leaking into parsing.

## Recommended Project Structure

Scaffold with `npm create vite@latest . -- --template vanilla-ts`. Vite treats `index.html` as the entry. Do not add React, Vue, or a router.

```
index.html                 # Vite root; mounts #app
vite.config.ts             # optional server.proxy for the CORS fallback
package.json
tsconfig.json
src/
├── main.ts                # boot: show loading, call loadRiver, render
├── config.ts              # FEED_URL, PUBLISHER_ORIGIN, FALLBACK_FEED_URL
├── feed/
│   ├── types.ts           # Piece, RiverState, LoadError
│   ├── fetchFeed.ts       # GET xml text, direct then fallback
│   ├── parseRss.ts        # DOMParser, item fields, sort
│   ├── rewriteUrls.ts     # relative href/src → https://dergigi.com
│   ├── sanitizeHtml.ts    # DOMPurify
│   └── loadRiver.ts       # orchestrates the six-step pipeline
├── ui/
│   ├── render.ts          # switch on RiverState
│   ├── river.ts           # list of pieces
│   ├── piece.ts           # title, date, body, permalink
│   ├── empty-state.ts     # failure or zero items
│   └── loading.ts         # first paint
└── styles/
    └── reading.css        # Impeccable Read-mode surface
```

### Structure Rationale

- **`src/feed/`:** Every transform is a named function with tests. The view never fetches.
- **`src/ui/`:** Rendering only. No XML, no sanitizer config, no knowledge of CORS.
- **`src/config.ts`:** One place for `https://dergigi.com/thoughts.xml` and `https://dergigi.com`. Do not scatter those strings.
- **No `src/pages/` or router:** One URL, one river.
- **No `src/store/`:** A discriminated union in memory is enough.
- **No `content/` or markdown:** dergigi.com stays the only writing workflow.

## Architectural Patterns

### Pattern 1: Explicit feed pipeline

**What:** One function runs six steps in a fixed order. Each step is independently testable.

**When to use:** Always, for this project. The order is the product.

**Trade-offs:** A bit more files than a single `main.ts`. Worth it because rewrite and sanitize are easy to get wrong if they sit inside the renderer.

```
1. Fetch https://dergigi.com/thoughts.xml at runtime
2. Parse RSS items (title, pubDate, link, description HTML)
3. Rewrite relative href/src to https://dergigi.com
4. Sanitize HTML
5. Render one long river, newest first
6. Empty state on failure or zero items
```

**Example:**

```typescript
export async function loadRiver(): Promise<RiverState> {
  const xml = await fetchFeed()
  if (!xml.ok) return { status: 'empty', reason: xml.reason }

  const parsed = parseRss(xml.text)
  if (!parsed.ok) return { status: 'empty', reason: 'parse-failed' }
  if (parsed.items.length === 0) return { status: 'empty', reason: 'no-items' }

  const pieces = parsed.items.map((item) => ({
    title: item.title,
    publishedAt: item.publishedAt,
    canonicalUrl: item.link,
    bodyHtml: sanitizeHtml(rewriteUrls(item.descriptionHtml, PUBLISHER_ORIGIN)),
  }))

  return { status: 'ready', pieces }
}
```

### Pattern 2: Typed river state

**What:** The UI switches on a small union. No boolean soup.

**When to use:** Boot, render, and empty-state copy.

**Trade-offs:** Slightly more types. Prevents rendering a river with an error still on screen.

```typescript
export type Piece = {
  title: string
  publishedAt: Date | null
  canonicalUrl: string
  bodyHtml: string
}

export type RiverState =
  | { status: 'loading' }
  | { status: 'ready'; pieces: Piece[] }
  | { status: 'empty'; reason: 'no-items' | 'fetch-failed' | 'parse-failed' | 'cors-failed' }
```

Treat fetch failure, parse failure, and zero items as the same surface (empty state). The `reason` is for copy and tests, not for a second chrome.

### Pattern 3: DOMParser for RSS, URL for rewrites

**What:** Parse the feed as XML. Read `description` with `textContent` so entity-encoded HTML becomes a string. Parse that string as HTML only to walk `href`/`src`. Resolve with `new URL(attr, 'https://dergigi.com')`.

**When to use:** Step 2 and step 3. Do not add `rss-parser` or `fast-xml-parser`. The feed is RSS 2.0 in a browser.

**Trade-offs:** `DOMParser` is a browser API, so unit tests need a DOM (Vitest + happy-dom or jsdom). That is cheaper than shipping an XML library for one feed.

```typescript
const doc = new DOMParser().parseFromString(xml, 'application/xml')
if (doc.querySelector('parsererror')) throw new Error('invalid xml')

const descriptionHtml = item.querySelector('description')?.textContent ?? ''
```

Jekyll emits `&lt;p&gt;...&lt;a href="/time"&gt;`. `textContent` on the XML node unescapes that once. Do not run an extra HTML-entity decode.

### Pattern 4: Sanitize at the sink

**What:** DOMPurify with `{ USE_PROFILES: { html: true } }`. Insert the result into one content node. Do not wrap the sanitized string in more HTML and assign that to `innerHTML`.

**When to use:** Step 4, immediately before the piece body hits the DOM.

**Trade-offs:** DOMPurify is the one runtime dependency that is worth it. The feed is "ours," but it is still untrusted HTML from the network.

```typescript
const clean = DOMPurify.sanitize(rewrittenHtml, { USE_PROFILES: { html: true } })
body.replaceChildren() // keep the sink stable
body.innerHTML = clean
```

CVE-2026-65914 is a reminder: concatenating sanitized HTML into wrappers such as `<script>` or `<xmp>` before a second parse can revive markup. Keep the piece chrome as real DOM nodes (`createElement` for title, time, and permalink). Only the description body is HTML.

## Data Flow

### Request Flow

```
Page load
    |
    v
main.ts -> render(loading)
    |
    v
loadRiver()
    |
    v
fetchFeed(FEED_URL)
    |-- 200 + xml text ----------------------------+
    |-- CORS / network / non-OK -> fetchFeed(FALLBACK)
                                   |-- 200 + xml text
                                   |-- fail -> empty
                                               |
                                               v
                                         parseRss
                                   |-- items[]
                                   |-- error / [] -> empty
                                               |
                                               v
                              rewriteUrls -> sanitizeHtml
                                               |
                                               v
                                    sort newest first
                                               |
                                               v
                              render(ready) or render(empty)
```

### State Management

```
RiverState (in-memory, one shot)
    ↓
render(state)
    ├─ loading → loading.ts
    ├─ ready   → river.ts → piece.ts
    └─ empty   → empty-state.ts
```

No store. No refresh loop in v1. A reload fetches again. The browser already honors the feed's `max-age=600`.

### Key Data Flows

1. **Happy path:** Boot → GET `thoughts.xml` → parse items → rewrite relative URLs → sanitize → sort by `pubDate` descending → render the river.
2. **CORS fallback:** Direct GET throws a TypeError (failed CORS) or the response is opaque. Fetcher retries `FALLBACK_FEED_URL` (same origin). Same parse pipeline after that.
3. **Empty path:** Any failure, or a valid channel with zero `<item>`s, renders the empty state. Never invent posts.

### Pipeline details that matter

| Step | Input | Output | Notes |
|------|-------|--------|-------|
| Fetch | URL | XML string | `text()`, not `response.xml()`. Need the string for `parsererror` checks. |
| Parse | XML string | `RawItem[]` | Fields: title, pubDate, link, description HTML. Sort here. |
| Rewrite | HTML string | HTML string | Only `href` and `src`. Leave `http(s):`, `mailto:`, and `#` fragments that are already usable. |
| Sanitize | HTML string | Safe HTML | Last transform before the DOM. |
| Render | `Piece[]` | DOM | Newest first. Title and date are text. Body is sanitized HTML. Permalink is `item.link`. |
| Empty | reason | DOM | Same page chrome. No magazine hero. |

RSS 2.0 does not require items in date order. Sort in the parser even if today's feed is already newest-first.

`pubDate` is RFC 822 (`Wed, 19 Aug 2026 00:00:00 +0000`). `Date.parse` handles that. If it is missing or unparsable, keep the piece and show the raw string or omit the date. Do not drop the item.

Canonical URL is `<link>`, not `<guid>`. They match on the inspected item. PROJECT.md says the feed `<link>` is the permalink.

## Suggested Build Order

Build the pipeline before the reading surface. Tests can use a checked-in fixture of `thoughts.xml`.

1. **Scaffold.** Vite `vanilla-ts`. `config.ts` with `FEED_URL` and `PUBLISHER_ORIGIN`. `types.ts`. Delete the counter demo.
2. **Fetch + parse.** `fetchFeed` and `parseRss` against a fixture. Assert title, pubDate, link, and unescaped description HTML. Check `parsererror`.
3. **Rewrite + sanitize.** Fixture HTML with `href="/time"` and `src="/assets/x.png"` becomes `https://dergigi.com/...`. DOMPurify drops `onerror` and `<script>`.
4. **Loader.** `loadRiver` wires the four transforms and the empty reasons.
5. **UI.** Loading, river, piece, empty state. One column. Title, date, body, canonical link.
6. **CORS fallback hook.** `FALLBACK_FEED_URL` plus Vite `server.proxy` for local fallback testing. Do not deploy a Worker until CORS actually closes.
7. **Read-mode polish.** Impeccable on `reading.css` and the empty state. After the river works.

## Scaling Considerations

This is a personal log. Scale is "one feed, one reader at a time."

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Keep the static SPA. Direct browser fetch. No cache layer of our own. |
| 1k-100k users | Still static. If the feed grows large, the Jekyll feed is the bottleneck, not this app. |
| 100k+ users | Unlikely. If it happens, put a CDN in front of this static host. Do not add a database. |

### Scaling Priorities

1. **First bottleneck:** Feed request fails (CORS, GitHub Pages blip, empty channel). Empty state is the fix, not retries that hide the failure.
2. **Second bottleneck:** Description HTML gets heavier (images, long posts). The river still renders the full body. Do not paginate in v1. If the feed itself becomes huge, that is a dergigi.com problem.

Do not add service workers, localStorage snapshots, or build-time snapshots. Those fight the core value: a new `thoughts` post appears without a redeploy.

## Anti-Patterns

### Anti-Pattern 1: Build-time feed fetch

**What people do:** `fetch` the RSS file in `vite build` and bake HTML.

**Why it's wrong:** A new post on dergigi.com stays invisible until this repo rebuilds. That is the one thing this site exists to avoid.

**Do this instead:** Runtime `fetch` in `main.ts`. Static assets only hold the shell.

### Anti-Pattern 2: Treating Vite `server.proxy` as production CORS

**What people do:** Proxy `/feed.xml` in `vite.config.ts` and ship it.

**Why it's wrong:** Vite's own server options apply to the dev server. `vite build` emits static files. There is no proxy after deploy.

**Do this instead:** Direct-fetch the live feed (works today). Keep a same-origin fallback URL for later. In production that fallback is a host rewrite or a Worker that only proxies `https://dergigi.com/thoughts.xml`.

### Anti-Pattern 3: Public CORS proxies

**What people do:** Point fetch at allorigins, cors-anywhere, or rss2json.

**Why it's wrong:** Third parties see every reader request, rate-limit you, and can rewrite the XML. The feed is already world-readable with `ACAO: *`.

**Do this instead:** Direct fetch. If CORS closes, a locked same-origin proxy of this one URL.

### Anti-Pattern 4: Regex rewrite of HTML

**What people do:** `html.replace(/href="\//g, 'href="https://dergigi.com/')`.

**Why it's wrong:** Misses single quotes, `src`, protocol-relative URLs, and `./` paths. Breaks when Jekyll changes quoting.

**Do this instead:** Parse a fragment, set attributes with `new URL(value, 'https://dergigi.com').href`.

### Anti-Pattern 5: `innerHTML` before sanitize

**What people do:** Drop `description` into the page, then hope the blog never contains a bad attribute.

**Why it's wrong:** The description is network HTML. XSS is a fetch away.

**Do this instead:** Rewrite, then DOMPurify, then insert into a dedicated body node.

### Anti-Pattern 6: A framework and a store for one column

**What people do:** React + React Query + a router for a single river.

**Why it's wrong:** The UI is loading / river / empty. The pipeline is the hard part. Extra machinery hides it.

**Do this instead:** Vanilla Vite TypeScript. If a later UI phase wants React for Impeccable components, `src/feed/` stays as-is.

### Anti-Pattern 7: Classic river truncation

**What people do:** Follow Winer's 2014 river recipe and strip markup, cap text at 500 characters, group by feed.

**Why it's wrong:** This site is a reading log of one feed. PROJECT.md wants the HTML description, not a scanner.

**Do this instead:** Keep the river shape (one column, newest first, scroll, no unread counts). Keep the full sanitized body.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| `https://dergigi.com/thoughts.xml` | Browser `fetch`, runtime | RSS 2.0. `ACAO: *` as of 2026-08-19. `max-age=600`. Do not cache in JS. |
| dergigi.com HTML assets | Browser loads rewritten `src`/`href` | Images and in-body links stay on dergigi.com. This site does not mirror files. |
| Vite `server.proxy` | Dev-only fallback | Maps something like `/feed.xml` → `https://dergigi.com/thoughts.xml`. Gone after `vite build`. |
| Same-origin fallback | Host rewrite or Cloudflare Worker | Only if CORS closes. Hard-code the upstream URL. Do not accept arbitrary `?url=` (open proxy). |
| DOMPurify | Library call in `sanitizeHtml` | HTML profile. One dependency. |

#### CORS fallback (document now, ship later)

Today a browser on any origin can `fetch('https://dergigi.com/thoughts.xml')`. That is the default path.

If GitHub Pages or a future host drops `Access-Control-Allow-Origin: *`:

1. Fetcher catches the failure and requests `FALLBACK_FEED_URL` (same origin as this site).
2. Dev: Vite proxy so `GET /feed.xml` returns the live XML. Official docs: `server.proxy` is a dev-server option.
3. Production: a same-origin path that server-side fetches the one feed and returns it with CORS for this origin, or simply as same-origin. Cloudflare's CORS header proxy example is the pattern. Lock the upstream to `https://dergigi.com/thoughts.xml`.
4. If the fallback is also down, show the empty state. Do not fall back to baked posts.

Do not implement the Worker in the first phase. Wire the fetcher so the second URL is a config value.

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `feed/` ↔ `ui/` | `RiverState` only | UI does not import `DOMParser` or DOMPurify. |
| `config.ts` ↔ fetcher / rewriter | constants | URLs and origin live here. |
| `loadRiver` ↔ steps | function calls | No events, no bus. |
| Piece chrome ↔ body HTML | DOM nodes vs sanitized string | Title, date, permalink are not HTML from the feed. |

## Sources

- Live feed inspection, 2026-08-19: `https://dergigi.com/thoughts.xml` (`ACAO: *`, RSS 2.0, entity-encoded description, relative `href="/time"`). Direct curl. Confidence: HIGH.
- RSS 2.0 spec, item elements (`title`, `link`, `description`, `pubDate`, `guid`): https://www.rssboard.org/rss-specification
- RSS Best Practices Profile (description is HTML; relative URLs are a problem because RSS has no base): https://www.rssboard.org/rss-profile
- W3C feed validator, relative URL warning: https://validator.w3.org/feed/docs/warning/ContainsRelRef.html
- MDN `DOMParser.parseFromString` (`application/xml`, `parsererror`): https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
- Vite getting started (`index.html` as root, `vanilla-ts` template): https://vite.dev/guide/
- Vite `server.proxy` (dev only): https://vite.dev/config/server-options.html#server-proxy
- Vite discussion: proxy does not exist after `vite build`: https://github.com/vitejs/vite/discussions/8043
- DOMPurify README and HTML profile: https://github.com/cure53/DOMPurify
- DOMPurify threat model (sanitize for the sink you use): https://github.com/cure53/DOMPurify/wiki/Security-Goals-&-Threat-Model
- mXSS via re-contextualized sanitized HTML, CVE-2026-65914: https://github.com/advisories/GHSA-H8R8-WCCR-V5F2
- Cloudflare Workers CORS header proxy (locked production fallback): https://developers.cloudflare.com/workers/examples/cors-header-proxy/
- Dave Winer, "What is a River of News aggregator?" (scroll, reverse-chrono; we keep full HTML anyway): http://scripting.com/2014/06/02/whatIsARiverOfNewsAggregator.html

Classify-confidence seam: `websearch --verified` → MEDIUM; `webfetch` → LOW. Feed-shape claims above are from direct inspection, not those providers.

---
*Architecture research for: runtime RSS reading river*
*Researched: 2026-08-19*
