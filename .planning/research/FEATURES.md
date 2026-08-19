# Feature Research

**Domain:** Personal reading log / single-feed RSS river
**Researched:** 2026-08-19
**Confidence:** HIGH for table stakes and anti-features (PROJECT.md plus live `thoughts.xml`). MEDIUM for differentiator ranking and competitor analogs.

This is a reading surface for one author's `thoughts` feed. It is not a magazine, not a SaaS reader, and not a second blog. Visitors come here to read. dergigi.com remains the writing workflow and the canonical home of each piece.

Inspected 2026-08-19: `https://dergigi.com/thoughts.xml` is RSS 2.0, `application/xml`, CORS `*`, GitHub Pages, ~10 minute cache. Channel title is already "Thinking in Public". Item descriptions are entity-escaped HTML with root-relative links (`href="/time"`). Canonical item links look like `https://dergigi.com/2026/08/19/thinking-in-public/`. `pubDate` is midnight UTC (`00:00:00 +0000`), typical of Jekyll date-only front matter.

## Feature Landscape

### Table Stakes (Users Expect These)

Features the product is incomplete without. v1 ships these and nothing else required.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Runtime fetch of `https://dergigi.com/thoughts.xml` | Core value: a new `thoughts` post appears here without redeploying this site | LOW | Browser fetch is possible (`Access-Control-Allow-Origin: *`). Do not bake the feed into the build. GitHub Pages cache is ~10 minutes; that is fine. |
| Parse RSS 2.0 items | The feed is the only content source | LOW | Read `item` title, `pubDate`, `description`, `link` (and `guid` if needed as a key). Ignore `category` in the UI. |
| Decode description HTML once | RSS Board profile: item `description` is HTML encoded as character data | LOW | Live feed uses entities (`&lt;p&gt;`), not CDATA. An XML parse yields real HTML. Visible `&lt;p&gt;` means a missed decode. Double-decode garbles copy. |
| Render title, date, and HTML description | That is the piece. Readers come for the writing, not a teaser card | MEDIUM | Title and date as text. Description as HTML. Keep the author's markup (`<p>`, `<em>`, `<a>`). Do not strip to plaintext. |
| Safe HTML render | Feed HTML is untrusted at the insert boundary | MEDIUM | Sanitize immediately before insert (OWASP: DOMPurify or equivalent allowlist). Never raw `innerHTML` / `dangerouslySetInnerHTML`. Title and date stay text. |
| Newest first, one long river | A log is a single scroll. Pagination makes a short log feel like a CMS | LOW | Sort by `pubDate` descending. One page, every item. Do not paginate when the feed is still short. |
| Canonical link from item `<link>` | Pieces belong on dergigi.com. This site is a reading surface | LOW | Use the feed `<link>`, not a local permalink. Live example: `https://dergigi.com/2026/08/19/thinking-in-public/`. Title (or a quiet "on dergigi.com") is enough. |
| Rewrite root-relative URLs to `https://dergigi.com` | Feed HTML uses site-root paths that resolve against *this* host and break | MEDIUM | Live: `href="/time"`, `href="/digital"`. RSS Board and the W3C feed validator warn that relative URLs in descriptions have no defined base. A document `<base>` does **not** rewrite path-absolute `/...` URLs. Rewrite `href`/`src` (and similar) that start with `/` but not `//`. Leave `https:`, `mailto:`, and `#` fragments alone. |
| Empty state if the feed fails or has no items | A blank page looks broken. A fake post is worse | LOW | Honest, short copy. No demo items. No LLM filler. Failure and empty can share one quiet state in v1. |
| Light paper reading surface | The visitor is here to read | MEDIUM | Impeccable Read mode. Light theme. Paper-like page, generous measure, quiet type. Almost no chrome. No cover hero. No dark clone of dergigi.com. |
| Live feed content only | The author's promise on the first piece is zero LLM slop | LOW | No placeholder posts, no generated excerpts, no "sample river" for screenshots. If the feed is empty, show the empty state. |
| Calendar date, not a clock | Jekyll emits midnight UTC. A time would be a lie | LOW | Live `pubDate`: `Wed, 19 Aug 2026 00:00:00 +0000`. Show the date. Do not show `00:00`. Avoid local-timezone conversion that slips the calendar day. |
| Quiet page title from the channel | A nameless dump is disorienting. A magazine masthead is too much | LOW | Channel `<title>` is "Thinking in Public". One line is enough. Do not add a tagline hero, nav, or about-the-author card. |

### Differentiators (Competitive Advantage)

Optional. Not required for v1. Add only after the river reads cleanly with live posts.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Distinct empty vs fetch-error states | A failed feed and a true empty feed are different situations | LOW | Error: "Could not load the feed." Empty: "Nothing here yet." Still no retry chrome required in v1. |
| Retry control on fetch failure | Lets a visitor recover from a blip without a full refresh | LOW | One quiet action. Do not add toast stacks or status dashboards. |
| Last-good river on a failed refetch | A brief upstream blip should not erase the page | MEDIUM | Keep the last successful parse in memory (or a short cache). Show the river, maybe a quiet "couldn't refresh" note. Do not persist a second content store. |
| Last-fetched timestamp | Trust that the river is live | LOW | Tiny, secondary. Easy to make the page feel like an admin panel. Skip unless someone asks. |
| Footer link to `thoughts.xml` | Readers who want a feed already have one | LOW | Point at the existing feed. Do not generate a second feed from this site. |
| Print stylesheet | The paper metaphor should survive print | LOW | Impeccable polish, not a product line. |
| Skip-to-content / reduced motion | Long-scroll reading should stay calm | LOW | Follow the craft floor. Not a feature pitch. |
| In-page fragment per item | Share a position on this river | LOW | Conflicts with "canonical is dergigi.com" if it starts looking like local permalinks. Prefer the canonical URL. |
| Channel description as a one-line dek | "Writing to think. Thinking in public." is already in the feed | LOW | Easy to tip into magazine chrome. Only if the title alone feels unfinished. |
| Soft client cache of the last fetch | Avoid refetching on every focus if the upstream TTL is 10 minutes | MEDIUM | Convenience, not correctness. Runtime fetch remains the source of truth. |

Do not differentiate by adding reader-app features (unread, search, folders) or magazine features (heroes, related posts, signup). The differentiator is restraint.

### Anti-Features (Commonly Requested, Often Problematic)

Things that show up in adjacent products. Deliberately do not build them.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| CMS, markdown copies, or a second writing workflow | "So we can edit posts here" | Splits the source of truth. dergigi.com is the only writing workflow | Fetch the live feed. Change copy on dergigi.com |
| Build-time feed fetch | Simpler static hosting, no CORS | A new post would need a redeploy. Breaks the core value | Runtime fetch of `thoughts.xml` |
| Search | "How do I find that one piece?" | Implies a corpus and an index. This is a short log | Scroll the river. Use the browser find command. Link to dergigi.com if someone needs the full archive |
| Pagination, older/newer, or infinite-scroll pages | Habit from blogs and readers | Turns a log into a magazine. Winer's test: if it needs more than scrolling, it is not a river | One long river, newest first |
| Dark clone of dergigi.com | Brand match | PROJECT forbids it. This is a paper reading surface, not a skin of the main site | Light theme, Impeccable Read mode |
| Newsletter signup | Every "content site" has one | This site does not sell or capture emails | Nothing. The existing site and feed already exist |
| Cover heroes, featured images, card grids | "Make the first screen pop" | Visitors come to read, not to be sold. Heroes are magazine chrome | Type, measure, whitespace |
| Fake posts or LLM demo copy | Empty states feel awkward in design reviews | The first live piece promises zero slop. Fake river items teach the wrong product | Empty state. Wait for the feed |
| Multi-feed subscriptions, OPML, unread counts | That is what Feedly / Miniflux / NetNewsWire are for | This is one author's log, not a reader app. Unread counts treat RSS like email (Winer's old complaint) | One feed. No accounts |
| Teaser truncation / "scan cards" | Classic River of News: ~500 chars, markup stripped, uniform height | This product is a *reading* river. The description *is* the piece | Full HTML description |
| Category / tag chrome | The feed already has `<category>` (`Personal`, `Writing`, `thoughts`, `blog`) | Filtering is search in costume. All items here are already `thoughts` | Ignore categories in the UI |
| Local per-piece pages | "Proper URLs on this host" | Duplicates dergigi.com and invites a second CMS | Canonical `<link>` on each item |
| Comments | Blogs have comments | A second conversation surface. Not this site's job | Conversation stays where the author wants it |
| Accounts, membership, ads | Monetize the reading surface | Wrong product. kottke can do membership; this log should not | No auth |
| Share bars, related posts, recommendations | Growth loops | Chrome. The piece already links where it should | Canonical link. Author's own links in the HTML |
| Archive by year/month | Long blogs need it | Premature. The feed is the archive until it is not | Keep the single river |
| Changing the Jekyll feed or backfilling old posts | "Make the river look full" | Out of scope. Posts opt in with a `thoughts` tag on dergigi.com | Tag posts there when the author wants them here |
| DNS for thoughts.dergigi.com / tip.dergigi.com | Production hostname | Out of scope for this repo. Local site against the live feed is enough | Ship the reading surface first |
| Dark mode toggle in v1 | Readers ask out of habit | Splits the design and invites a dergigi.com clone | Light paper. Revisit only if reading at night becomes a real complaint |
| Book-log features (ratings, status, notes) | "Reading log" in the consumer-app sense | Wrong domain. This is not Goodreads | Title, date, HTML. Stop |

## Feature Dependencies

```
Runtime fetch
    └──requires──> RSS 2.0 parse
                       └──requires──> HTML decode (once)
                                          └──requires──> Relative URL rewrite
                                                             └──requires──> HTML sanitize
                                                                                └──requires──> River render
                                                                                                   └──requires──> Paper reading surface

Canonical <link> ──enhances──> River item
Calendar date format ──enhances──> River item
Empty / error state ──requires──> Runtime fetch

Empty state ──conflicts──> Fake posts / LLM copy
Paper surface ──conflicts──> Dark dergigi.com clone
One long river ──conflicts──> Pagination / archive chrome
Runtime fetch ──conflicts──> Build-time fetch / markdown copies
Canonical-on-dergigi.com ──conflicts──> Local per-piece pages
Full HTML description ──conflicts──> Teaser truncation
```

### Dependency Notes

- **River render requires fetch, parse, decode, rewrite, sanitize:** The live feed is entity-escaped HTML with root-relative links. Skip any step and the river is empty, shows raw entities, or points at the wrong host.
- **Sanitize after rewrite:** Rewriting `href="/time"` to `https://dergigi.com/time` must not reintroduce `javascript:` URLs. Sanitize last, at insert time.
- **Paper surface enhances the river; it does not replace it:** A beautiful empty page that invents posts has failed. A correct river in a noisy magazine skin has also failed.
- **Empty state conflicts with fake posts:** The honest failure mode is the empty state. Demo content trains the next phase to ship fiction.
- **One long river conflicts with pagination:** Pagination is how blogs hide a CMS. Do not add it because "that's what blogs do."
- **Runtime fetch conflicts with build-time fetch:** If publishing requires a redeploy, the core value is gone.
- **Full HTML conflicts with Winer-style teasers:** A classic River of News *scans*. This river *reads*.

## MVP Definition

### Launch With (v1)

Minimum river. If these work, the concept is validated.

- [ ] Runtime fetch of `https://dergigi.com/thoughts.xml`
- [ ] Parse items; decode description HTML once
- [ ] Render title, calendar date, sanitized HTML description, newest first, one long river
- [ ] Canonical link from each item `<link>` to dergigi.com
- [ ] Rewrite root-relative `href`/`src` to `https://dergigi.com/...`
- [ ] Empty state when the feed fails or has no items (no fake posts)
- [ ] Light paper reading surface (Impeccable Read mode, almost no chrome)

### Add After Validation (v1.x)

Only after a real post has been read end-to-end on this site.

- [ ] Distinct empty vs error copy, plus a quiet retry
- [ ] Last-good river if a refetch fails
- [ ] Footer link to `thoughts.xml` if readers ask how to subscribe

### Future Consideration (v2+)

Do not schedule these. Most should stay anti-features.

- [ ] In-page fragments per item (only if sharing *this* URL matters)
- [ ] Soft client cache aligned with the upstream 10-minute TTL
- [ ] Print stylesheet
- [ ] Anything that looks like a reader app or a magazine

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Runtime RSS fetch | HIGH | LOW | P1 |
| Parse items + decode HTML | HIGH | LOW | P1 |
| Title / date / HTML river, newest first | HIGH | LOW | P1 |
| Canonical `<link>` | HIGH | LOW | P1 |
| Rewrite relative URLs | HIGH | MEDIUM | P1 |
| Sanitize description HTML | HIGH | MEDIUM | P1 |
| Empty / error state | HIGH | LOW | P1 |
| Light paper surface | HIGH | MEDIUM | P1 |
| Live content only (no fake posts) | HIGH | LOW | P1 |
| Calendar date (not 00:00) | MEDIUM | LOW | P1 |
| Quiet channel title | MEDIUM | LOW | P1 |
| Distinct empty vs error + retry | MEDIUM | LOW | P2 |
| Last-good river on refetch failure | MEDIUM | MEDIUM | P2 |
| Footer link to `thoughts.xml` | LOW | LOW | P2 |
| Last-fetched timestamp | LOW | LOW | P3 |
| In-page fragments | LOW | LOW | P3 |
| Client cache | LOW | MEDIUM | P3 |
| Search, pagination, CMS, newsletter, heroes | LOW | HIGH | Do not build |
| Dark dergigi.com clone | LOW | MEDIUM | Do not build |
| Multi-feed reader features | LOW | HIGH | Do not build |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

Adjacent products teach what to steal and what to refuse. None of these is the product.

| Feature | dergigi.com | Winer River of News / River5 | Miniflux / Feedly | kottke.org (link blog / magazine-adjacent) | Our Approach |
|---------|-------------|------------------------------|-------------------|--------------------------------------------|--------------|
| Content source | Jekyll posts, many tags | Many feeds via lists/OPML | User subscriptions | Native CMS (Movable Type) | One live feed: `thoughts.xml` |
| Item body | Full post on the site | Truncated plaintext, markup stripped | Full content in a reading view | Full post | Full HTML `description` |
| Order / shape | Blog with site chrome | Reverse-chron, uniform scan cards | Unread queues, folders | Reverse-chron, paginated archives | One long river, newest first |
| Chrome | Dark, full personal site | Minimal scanner | App chrome | Masthead, membership, newsletter | Almost none. Light paper |
| Canonical home | Itself | Link out to sources | Link out to sources | Itself | Item `<link>` on dergigi.com |
| Relative URLs in HTML | Fine (same host) | N/A (markup removed) | Reader-dependent | Fine (same host) | Rewrite `/...` to `https://dergigi.com/...` |
| Writing workflow | Jekyll on dergigi.com | None (aggregator) | None (aggregator) | CMS on the same site | None. Do not add one |
| Search / unread / tags | Site search, tags | No (by design) | Yes | Archives, tags | No |
| Empty / failure | 404 / empty index | Empty river | Error in the app | Empty index | Honest empty state, no fixtures |
| Theme | Dark | Whatever the river skin is | User theme | Light, designed as a publication | Light paper. Not a clone |

Winer's 2014 definition is useful as a *contrast*, not a spec. He wanted a scan river: short text, no full article, no extra interaction beyond the scrollbar. This site wants the scrollbar and the reverse-chron river, and it wants the opposite body: the HTML *is* the piece.

kottke.org shows the gravity well: permalinks, membership, newsletter, pagination arguments. Those are how a link blog becomes a publication. Do not follow it.

Consumer "reading log" apps (Goodreads, StoryGraph) are a different domain. Ignore them.

## Sources

- PROJECT.md (2026-08-19): validated requirements and out-of-scope list
- Live feed `https://dergigi.com/thoughts.xml` inspected 2026-08-19 (RSS 2.0, escaped HTML, root-relative links, midnight UTC `pubDate`, CORS `*`)
- [RSS 2.0 specification](https://www.rssboard.org/rss-2-0-9) (item `description` may be entity-encoded HTML)
- [RSS Board Best Practices Profile](https://www.rssboard.org/rss-profile) (2007-10-15): `description` is HTML; relative URLs have no defined base
- [W3C feed validator: ContainsRelRef](https://validator.w3.org/feed/docs/warning/ContainsRelRef.html): relative `href`/`src` break in aggregators
- [Jesse Squires, RSS feeds, Jekyll, and absolute versus relative URLs](https://www.jessesquires.com/blog/2021/06/06/rss-feeds-jekyll-and-absolute-versus-relative-urls/) (2021-06-06)
- [Dave Winer, What is a River of News aggregator?](http://scripting.com/2014/06/02/whatIsARiverOfNewsAggregator.html) (2014-06-02); [River5 RIVEROFNEWS.md](https://github.com/scripting/river5/blob/master/docs/RIVEROFNEWS.md)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet) (DOMPurify for HTML sanitization)
- [MDN, Safely insert external content into a page](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Safely_inserting_external_content_into_a_page)
- [Ben Nadel, Base tag does not affect root-relative URLs](https://www.bennadel.com/blog/4341-base-tag-href-doesnt-affect-document-root-relative-urls.htm) (2022)
- [Dr. Drang, Date-without-time stamps](https://leancrew.com/all-this/2016/05/date-without-time-stamps/) (2016-05): Jekyll midnight UTC `pubDate`
- [Will Richardson, Lazy Jekyll hacks for more accurate publication times](https://willhbr.net/2024/07/18/lazy-jekyll-hacks-for-more-accurate-publication-times/) (2024-07-18)
- [kottke.org about](https://kottke.org/about/); [On pagination navigation](https://kottke.org/11/05/on-pagination-navigation) (2011-05)

---
*Feature research for: personal reading log / single-feed RSS river*
*Researched: 2026-08-19*
