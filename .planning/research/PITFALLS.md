# Pitfalls Research

**Domain:** Runtime RSS reading site that renders untrusted HTML from a third-party Jekyll feed
**Researched:** 2026-08-19
**Confidence:** HIGH

Live feed inspected the same day (`https://dergigi.com/thoughts.xml`): RSS 2.0 from Jekyll 3.10.0 on GitHub Pages, `Access-Control-Allow-Origin: *`, `Cache-Control: max-age=600`. One item. Descriptions are entity-escaped HTML (no CDATA). Root-relative links such as `href="/time"` are present. Item `pubDate` is midnight UTC. Channel `<link>` is `https://dergigi.com/thinking`, not the site root.

## Critical Pitfalls

### Pitfall 1: XSS via feed HTML

**What goes wrong:**
Item descriptions are HTML. Putting that markup into the page with `innerHTML` or `dangerouslySetInnerHTML` runs whatever the feed contains: `<script>`, event handlers, `javascript:` links, SVG, `<base>`, `<iframe>`, CSS `url()`.

This site and dergigi.com are different origins. The feed is a third-party document even though the same person writes both. Jekyll posts can include raw HTML. A future post, a compromised Pages deploy, or a cache-poisoned XML response is enough.

**Why it happens:**
"I wrote the posts" feels like trust. Frameworks do not sanitize HTML you opt into rendering. OWASP calls React's `dangerouslySetInnerHTML` an escape hatch with no sanitization. Output encoding would show tags as text, so people skip it and paste the string straight into the DOM.

**How to avoid:**
1. Parse the RSS as XML. Read the description as a string (the parser does the one XML decode). Treat that string as untrusted HTML.
2. Sanitize at render time with a maintained HTML sanitizer (OWASP recommends DOMPurify). Tight allowlist: `p`, `em`, `strong`, `a`, `ul`, `ol`, `li`, `blockquote`, `pre`, `code`, `br`, maybe `img` and `h2`–`h4`. Forbid `script`, `iframe`, `object`, `form`, `style`, `base`, `link`, `meta`.
3. Keep `href`/`src` URI checks on. Do not use `ALLOW_UNKNOWN_PROTOCOLS`. Pin DOMPurify at 3.3.2 or newer (3.3.1 and below skipped URI validation on the `ADD_ATTR` predicate form; CVE-2026-65912).
4. Rewrite relative URLs inside `uponSanitizeAttribute` so the sanitizer re-checks the result. Do not write `href` in `afterSanitizeAttributes`.
5. Render titles, dates, and canonical links as text (`textContent` / framework text nodes). Only the description is HTML.
6. Defense in depth: CSP that blocks inline script. Trusted Types (`require-trusted-types-for 'script'`) if the stack can emit `TrustedHTML` from the sanitizer.

**Warning signs:**
- `innerHTML` or `dangerouslySetInnerHTML` with a raw description
- "It's my feed, skip sanitize"
- Sanitizer allowlist includes `style`, `on*`, or `base`
- URL rewrite happens after sanitize, or via string replace that can produce `javascript:`
- Tests only check happy-path paragraphs, never `<script>` / `javascript:` / `<img onerror>`

**Phase to address:**
Phase 2: Safe HTML render (sanitize, rewrite, dates)

---

### Pitfall 2: Broken relative URLs

**What goes wrong:**
Feed HTML uses site-root paths (`href="/time"`, later likely `src="/assets/..."`). In this origin those become `https://thoughts.dergigi.com/time` (or localhost) and 404. Images vanish. In-post links look fine until you click them.

The RSS draft is explicit: descriptions should not contain relative URLs, and an aggregator may resolve them against the channel `<link>`. This feed ignores that. Channel `<link>` is `https://dergigi.com/thinking`, not `https://dergigi.com/`. Blind "use channel link as base" is the wrong rewrite for path-relative URLs without a leading slash.

**Why it happens:**
Jekyll emits the same HTML it uses on dergigi.com. Root-relative paths work there. People insert the fragment first; the browser resolves `/time` against *this* origin immediately. A document `<base href="https://dergigi.com">` looks clever and then rewrites this site's own chrome and fragment links. Regex on `href="/` misses `srcset`, `poster`, quoted `src`, and CSS `url()`.

**How to avoid:**
1. Rewrite on a detached fragment (or during sanitize), *before* the HTML enters the live document.
2. Resolve path-absolute URLs (`/time`, `/assets/...`) against `https://dergigi.com` with the URL API, not string concat and not the channel `<link>`.
3. Cover `href`, `src`, `srcset`, `poster`, and `url()` in style if you allow style at all (prefer not allowing style).
4. Leave already-absolute `https://` links alone. Do not touch `mailto:` or fragments (`#...`).
5. Do not add a document-level `<base>`.
6. Fixture: the live item's `/time`, `/digital`, `/slopocalypse`, `/sloppypasta` must become `https://dergigi.com/...`. Add a fixture with `src="/assets/foo.png"` even if the live feed has no images yet.

**Warning signs:**
- Clicking an in-body link stays on this host
- Images 404 on `/assets/...`
- `<base>` in `index.html`
- Rewrite runs after `appendChild` / React commit
- Rewrite base is `https://dergigi.com/thinking`

**Phase to address:**
Phase 2: Safe HTML render (sanitize, rewrite, dates)

---

### Pitfall 3: Treating CDATA / escaped HTML incorrectly

**What goes wrong:**
The live feed encodes markup as XML character data:

```
DATA_k7m2q9xp_START
<description>&lt;p&gt;...&lt;a href=&quot;/time&quot;&gt;Bitcoin is Time&lt;/a&gt;...
DATA_k7m2q9xp_END
```

There is no CDATA today. A real XML parse yields the HTML string `<p>...<a href="/time">...</a>`. Two failure modes:

1. **Under-decode.** Regex-slice the `<description>` text and render it. The page shows literal `&lt;p&gt;` or visible tags.
2. **Over-decode.** XML-parse, then run a home-grown entity decoder. `&amp;lt;` becomes `<`. That is a second unescape and a classic XSS path. If Jekyll later wraps the same HTML in CDATA, a custom unescape will also break.

RSS 2.0 allows either encoding. Both must produce the same HTML string after one XML parse. Do not bake "escaped vs CDATA" into app logic.

**Why it happens:**
People treat RSS as a text file. `innerHTML` of an XML node vs `textContent` behave differently. Tutorials show `htmlDecode()` after parse "to be safe."

**How to avoid:**
1. Parse with `DOMParser` (`text/xml`) or a real RSS parser. If `parsererror`, that is an error state, not empty content.
2. Read description via the XML text value (one decode). Then sanitize that string as HTML.
3. No custom `&lt;` / `&amp;` replace tables. No `textarea` innerHTML tricks.
4. Tests: current escaped fixture, a CDATA fixture with the same body, and a double-escaped `&amp;lt;script&gt;` that must *not* become a script tag.

**Warning signs:**
- Visible `&lt;p&gt;` or raw `<p>` in the river
- `decodeURI` / `he.decode` / chained `replace(/&lt;/g` after XML parse
- Parser assumed CDATA-only or escaped-only
- Title rendered as HTML (titles are plain text in this feed and in the spec)

**Phase to address:**
Phase 1: Runtime feed fetch and parse

---

### Pitfall 4: Empty and error states that look broken

**What goes wrong:**
Fetch fails (network, CORS gone, 5xx, Fastly blip), XML is unparsable, or the channel has zero items. The page is a blank paper, a spinner that never ends, `undefined`, or a stack trace. That reads as a dead site, not a quiet log.

The opposite failure is also in scope: inventing a demo post so the layout "has something." PROJECT.md forbids fake posts and LLM-looking copy. One real item exists today; tomorrow the `thoughts` tag could yield none.

**Why it happens:**
Happy-path demos skip failure UI. Designers want the river to look full. CORS is `*` *today*; GitHub Pages has flipped CORS behavior before, and this repo does not control dergigi.com headers.

**How to avoid:**
1. Three distinct states: loading, empty (200 + zero items), error (network / CORS / non-XML / parse error).
2. Empty copy states the fact: no thoughts in the feed right now. Error copy states the fact: the feed could not be loaded, try again. Both still look like the reading surface (paper, type, measure).
3. Never seed local markdown, fixture posts in the UI, or lorem. Tests may use a *local* XML fixture file; the running site must not.
4. Retry control on error. Do not auto-retry in a tight loop.
5. Channel title and item title are both "Thinking in Public" on the live feed. Empty/error chrome should not confuse the two.

**Warning signs:**
- First paint is a white void until JS succeeds
- `Cannot read properties of undefined` on the page
- "Sample thought" / "Hello world" / placeholder essay in the repo or UI
- Loading and error look identical
- CORS success assumed in code comments as a permanent contract

**Phase to address:**
Phase 3: Reading river and empty states

---

### Pitfall 5: Build-time fetch that freezes content

**What goes wrong:**
`getStaticProps`, Astro `await fetch` in a page module, a Vite plugin that inlines `thoughts.xml`, or a `prebuild` curl writes items into the HTML. A new `thoughts`-tagged post on dergigi.com does not appear until this repo redeploys. That kills the core value.

Related: checking the feed into git "for convenience" (see Pitfall 8). Same freeze, plus drift.

**Why it happens:**
SSG defaults are build-time. Fetching at build "just works" in preview. GitHub Pages cache (`max-age=600`) hides the mistake for ten minutes during a demo.

**How to avoid:**
1. Fetch `https://dergigi.com/thoughts.xml` at runtime: browser `fetch`, or SSR/edge *per request*. No prerendered item list in the build artifact.
2. Code review grep: `getStaticProps`, `getStaticPaths`, `export async function get`, `load()` that writes items into module scope, `fetch` in `vite.config` / `astro.config`.
3. Manual check: ship a build, publish a tagged post on dergigi.com, confirm this site shows it without a rebuild (after the feed's own cache, ~10 minutes).
4. If you cache, cache in memory or HTTP with a short TTL. Never bake items into JS chunks.

**Warning signs:**
- Built HTML or a JS module contains a post title from the feed
- Preview is fast and never hits the network
- "We'll rebuild when Gigi posts"
- CI fetches the live feed and commits the result

**Phase to address:**
Phase 1: Runtime feed fetch and parse

---

### Pitfall 6: Date timezone and display issues

**What goes wrong:**
Live item `pubDate` is `Wed, 19 Aug 2026 00:00:00 +0000`. That is Jekyll's date-only post: midnight UTC, not "published at midnight." `new Date(pubDate).toLocaleDateString()` in US/Pacific prints 18 August. Relative "8 hours ago" from a midnight stamp is a lie. Showing `00:00` looks like a bug.

Channel `pubDate` / `lastBuildDate` (`08:47:46 +0000` on inspect) is the feed build time. Using that as the item date is wrong.

**Why it happens:**
RFC 822 timestamps look like datetimes. `Date#toLocaleDateString()` uses the *viewer's* zone unless you pass `timeZone`. Jekyll timezone issues are a long-running upstream mess; this site should not try to "fix" dergigi.com.

**How to avoid:**
1. Parse `item.pubDate`. Display a calendar date, not a clock.
2. Format in a fixed zone so the printed day matches the canonical URL date (`/2026/08/19/...`). UTC is the honest choice for this feed. Europe/Vienna is acceptable if you document it. Do not use `toLocaleDateString()` with no `timeZone`.
3. Sort newest-first by parsed `pubDate` (or the date in the canonical URL if `pubDate` is missing). Do not trust XML order.
4. Skip relative time. Skip "updated" from `lastBuildDate`.
5. Tests: midnight UTC on 19 Aug must print 19 August for a viewer in Los Angeles and in Vienna.

**Warning signs:**
- Date on the river does not match the path in `<link>`
- Times like `00:00` or `2:00 AM` next to a title
- "3 hours ago" on a date-only post
- Channel build time used as the piece date

**Phase to address:**
Phase 2: Safe HTML render (sanitize, rewrite, dates)

---

### Pitfall 7: Over-designing a magazine instead of a log

**What goes wrong:**
The page grows cover heroes, cards, masonry, category chips, newsletter CTAs, dark chrome cloned from dergigi.com, or generic AI-looking UI (Inter, purple wash, glass, "Your thoughts, amplified"). Visitors came to read a river. The chrome starts shouting.

**Why it happens:**
Component libraries and default Impeccable/marketing templates lean magazine. Dark dergigi.com is a tempting "brand match." Empty-state anxiety fills the viewport with decoration.

**How to avoid:**
1. One long river: title, date, HTML body, canonical link. Newest first. Almost no chrome.
2. Impeccable **Read** mode, light theme, paper-like page, generous measure, quiet type. Run typeset, layout, distill, polish on the reading surface before calling design done.
3. Do not clone dergigi.com's dark shell. Do not invent a second visual identity that looks like a landing page.
4. If a layout needs a hero image, a card grid, or a marketing footer to "feel finished," cut it.

**Warning signs:**
- First screen is a banner, not the first paragraph
- Dark background "to match the blog"
- Gradient orbs, glass cards, badge rows
- Placeholder marketing copy in the header
- Design review talks about "sections" instead of the river

**Phase to address:**
Phase 4: Reading surface (Impeccable)

---

### Pitfall 8: Copying posts into the repo

**What goes wrong:**
Markdown under `content/`, a `posts.json`, a checked-in `thoughts.xml`, or "just for local preview" essays. dergigi.com is no longer the only writing workflow. The river drifts from the live feed. Demo text appears, often LLM-flavored, which this project explicitly forbids.

**Why it happens:**
Offline preview is easier with files. SSG tutorials start from markdown. Designers want three posts to space a layout. Someone "temporarily" vendors the XML.

**How to avoid:**
1. The only content source is the live feed URL. No post files in the app.
2. Local/dev preview fetches the live URL (CORS is open today). If you need a parse test, keep a *test* fixture under the test tree, never mounted by the UI.
3. PR check: no new `.md` / `.html` post bodies outside docs. No committed feed snapshots used at runtime.
4. When the feed is empty or down, show the empty/error state. Do not substitute a canned essay.

**Warning signs:**
- `content/`, `_posts/`, `data/thoughts.json` in the repo
- README says "add a post in /content"
- UI works with the network disabled and still shows a full essay
- Commit messages like "add sample thought"

**Phase to address:**
Phase 1: Runtime feed fetch and parse (guard). Recheck in every later phase.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip sanitizer "until we have more posts" | Faster first paint of HTML | XSS on the first odd post or feed incident | Never |
| Check in `thoughts.xml` for offline demo | Preview on a plane | Frozen/wrong content; second source of truth | Never for runtime. Test-only fixtures OK |
| Build-time fetch | Simple SSG | New posts need a redeploy | Never |
| Document `<base href="https://dergigi.com">` | One-line URL fix | Breaks this site's links and hashes | Never |
| Regex rewrite of `href="/` | Looks done | Misses `src`, `srcset`, quotes, CSS | Never; use URL + DOM |
| `toLocaleDateString()` with no zone | One liner | Wrong calendar day in the Americas | Never |
| Invent a demo post for layout | Designers see a full page | Forbidden copy; hides empty state | Never |
| Treat CORS `*` as a contract | Browser fetch is easy | Blank site the day Pages drops the header | Accept browser fetch now; always ship an error state |
| Clone dark dergigi.com tokens | Feels on-brand | Wrong product; fights Read mode | Never |

## Integration Gotchas

Common mistakes when connecting to the live feed.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `https://dergigi.com/thoughts.xml` | Fetch at build; cache forever | Runtime GET; tolerate Fastly `max-age=600` |
| GitHub Pages CORS | Assume `Access-Control-Allow-Origin: *` forever | Use it while present; error state if the browser blocks |
| XML parse | `response.text()` + regex / `innerHTML` | `DOMParser` `text/xml` or a real RSS parser; fail on `parsererror` |
| Item `<description>` | Assume CDATA *or* assume escaped | One XML text read, then sanitize |
| Item `<link>` / `<guid>` | Render as HTML; invent slugs | Text; use `<link>` as the canonical href |
| Channel `<link>` | Use as rewrite base for `/time` | Rewrite path-absolute URLs against `https://dergigi.com` |
| Channel vs item `<title>` | Both are "Thinking in Public" today | Do not use channel title as a post heading |
| Jekyll categories | Filter on this site | Feed is already `thoughts`-only; do not re-tag |

## Performance Traps

This site is a single river of short HTML. Do not scale-fiction.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-sanitize on every React render | Input lag as the river grows | Sanitize once per item when the feed arrives | A few dozen posts, already janky |
| Fetch on every route tick / focus | Rate of feed requests; flicker | Fetch on load; optional manual refresh | Immediately if in a `useEffect` without guards |
| Inlining the whole feed in the JS bundle | Huge first load; frozen content | Runtime fetch, empty shell | First build after a long post |
| Client + SSR double fetch with no cache | Flash of empty then content | One owner for the request; short memory cache | First visit |

Expected scale is tens to hundreds of tagged posts, not millions. A single fetch and a linear render is enough.

## Security Mistakes

Domain-specific issues beyond generic OWASP Top 10.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Raw description → DOM | Stored/reflected XSS from the feed | DOMPurify allowlist at render; patch the library |
| Rewrite after sanitize | Reintroduce `javascript:` / `data:` | Rewrite in `uponSanitizeAttribute` |
| Title/link as HTML | XSS in a field that is plain text | Text nodes only |
| Allow `style` / `img` without URL checks | CSS injection, tracking pixels, `javascript:` | Default deny `style`; allow `img` only with `https://dergigi.com` `src` if needed |
| Document `<base>` from feed HTML | Every relative URL on the page hijacked | Sanitizer must drop `<base>` |
| Trust CORS `*` as a security boundary | CORS is not auth; the feed is still untrusted | Sanitize regardless of origin headers |
| Old DOMPurify + `ADD_ATTR` function | URI validation skipped (≤ 3.3.1) | Pin ≥ 3.3.2 |
| Open `target=_blank` on rewritten links | Tab nabbing if you add it | Prefer same-tab canonical links; if new tab, `rel="noopener"` |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Magazine chrome | Reading interrupted; feels like a landing page | Log: type, date, body, permalink |
| Dark clone of dergigi.com | Wrong site; hard to read long | Light paper, Read mode |
| Visible escaped HTML | Looks broken / untrusted | XML parse + sanitize + render |
| Dead in-body links | Reader leaves and cannot find the referenced essay | Rewrite `/…` to dergigi.com before paint |
| Blank page on feed failure | "The site is down" | Quiet empty/error on the same paper |
| Wrong calendar day | Piece feels misfiled vs the canonical URL | Fixed-zone date, no clock |
| Demo / slop copy | Breaks the promise of the first post | Live feed only |
| Forever spinner | Same as blank | Timeout → error state |

## "Looks Done But Isn't" Checklist

- [ ] **Sanitize:** Description never hits the DOM unsanitized. Fixture with `<script>`, `javascript:`, and `<img onerror>` is stripped.
- [ ] **Rewrite:** `/time` and `/assets/...` become `https://dergigi.com/...` *before* insert. Clicking an in-body link leaves this host.
- [ ] **Decode once:** Escaped fixture and CDATA fixture render the same. Double-escaped script does not execute.
- [ ] **Runtime fetch:** Built artifacts contain no post bodies. A new tagged post appears without redeploying this repo.
- [ ] **Dates:** Midnight UTC `pubDate` prints the URL's calendar day in US and EU zones. No `00:00`.
- [ ] **Empty/error:** Offline / 500 / zero items each have a designed state. No demo essay.
- [ ] **Canonical:** Each piece links to item `<link>` (e.g. `https://dergigi.com/2026/08/19/thinking-in-public/`).
- [ ] **Design:** First screen is the river. Light paper. No hero, no dark clone, no marketing stack.
- [ ] **Repo:** No `content/` posts, no committed runtime feed snapshot.
- [ ] **Titles:** Item title is text. Channel title is not reused as a post.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| XSS via raw HTML | HIGH | Ship sanitizer immediately; rotate if you had cookies/auth (this site should have none); add fixtures |
| Wrong URL rewrite | LOW | Fix resolver; hard-refresh. No data migration |
| Double-escaped / visible entities | LOW | Delete custom decoder; use XML text + sanitize |
| Build-time freeze | MEDIUM | Remove SSG data hooks; make fetch runtime; redeploy shell only |
| Copied posts in repo | MEDIUM | Delete files; keep tests as XML fixtures; confirm UI uses the live URL |
| Date off-by-one | LOW | Format in UTC (or documented zone); add TZ tests |
| Magazine over-design | MEDIUM | Cut chrome; re-run Impeccable Read (typeset, layout, distill, polish) |
| CORS disappears | MEDIUM | Keep error state; then add a same-origin proxy *only if* you accept that extra moving part |

## Pitfall-to-Phase Mapping

Suggested coarse phases for the roadmapper. Names can change; the prevention work should not.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| CDATA / escaped HTML mishandled | Phase 1: Runtime feed fetch and parse | Escaped + CDATA fixtures render identical HTML strings before sanitize |
| Build-time fetch freezes content | Phase 1: Runtime feed fetch and parse | Network tab shows a runtime GET; built HTML has no item bodies |
| Copied posts in the repo | Phase 1 (guard) + every later phase | No runtime content files; UI empty when feed is empty |
| XSS via feed HTML | Phase 2: Safe HTML render | Dangerous fixtures stripped; sanitizer on the render path |
| Broken relative URLs | Phase 2: Safe HTML render | `/time` → `https://dergigi.com/time` before insert |
| Date timezone / midnight UTC | Phase 2: Safe HTML render | 19 Aug 00:00 +0000 prints 19 August in LA and Vienna |
| Empty/error states look broken | Phase 3: Reading river and empty states | Designed loading, empty, error; no demo posts |
| Magazine / slop / dark clone | Phase 4: Reading surface (Impeccable) | First screen is the river; light paper; Read-mode polish |

## Sources

- Live inspect of `https://dergigi.com/thoughts.xml` (2026-08-19): escaped descriptions, root-relative `href`, midnight UTC `pubDate`, CORS `*`, `max-age=600`
- [RSS 2.0 Specification 2.0.8](https://www.rssboard.org/rss-2-0-8) — entity-encoded HTML allowed in item description
- [RSS draft 1.18](https://www.rssboard.org/rss-draft-1) — description encoding; relative URLs may resolve against channel link
- [RSS Encoding Examples](https://www.rssboard.org/rss-encoding-examples) — escaped vs CDATA are equivalent after parse
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) — sanitize HTML; DOMPurify; `dangerouslySetInnerHTML` gap
- [DOMPurify README](https://github.com/cure53/DOMPurify) and [Security Goals & Threat Model](https://github.com/cure53/DOMPurify/wiki/Security-Goals-&-Threat-Model) — hooks, `<base>` ban, URI checks; rewrite in `uponSanitize*`
- [GHSA-cjmm-f4jc-qw8r](https://github.com/cure53/DOMPurify/security/advisories/GHSA-cjmm-f4jc-qw8r) / CVE-2026-65912 — `ADD_ATTR` predicate URI bypass, fixed in 3.3.2
- Jekyll date/timezone issues: [jekyll#9278](https://github.com/jekyll/jekyll/issues/9278), [jekyll#1069](https://github.com/jekyll/jekyll/issues/1069), [midnight UTC in feeds](https://willhbr.net/2024/07/18/lazy-jekyll-hacks-for-more-accurate-publication-times/)
- PROJECT.md constraints: runtime fetch only, no demo posts, no markdown copies, log not magazine, no dark dergigi.com clone

---
*Pitfalls research for: Thinking in Public (runtime RSS reading site)*
*Researched: 2026-08-19*
