<!-- gsd-project-start source:PROJECT.md -->

## Project

**Thinking in Public**

A reading site for Thinking in Public, later hosted at thoughts.dergigi.com (tip.dergigi.com may point at the same thing). It fetches the live RSS feed from https://dergigi.com/thoughts.xml at runtime and renders a long river of pieces: title, date, and HTML description, newest first. Each piece links back to its canonical URL on dergigi.com.

This is a log, not a magazine. Almost no chrome. No cover heroes. Visitors come here to read, not to be sold.

**Core Value:** A new post tagged `thoughts` on dergigi.com appears here without redeploying this site.

### Constraints

- **Content source**: Only the live RSS feed — no local post files
- **Runtime fetch**: New tagged posts must appear without redeploying this site
- **Hosting later**: thoughts.dergigi.com; this repo only needs a local site that points at the live feed
- **Design**: Impeccable, Read mode, light theme, not a clone of dergigi.com
- **Repo**: Conventional Commits, SemVer, CHANGELOG.md in Keep a Changelog format
- **No second editorial workflow**: do not create or edit posts here

<!-- gsd-project-end -->

<!-- gsd-stack-start source:research/STACK.md -->

## Technology Stack

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vite | 8.2.1 | Dev server, production bundle, `npm run dev` | Smallest current tool that gives a local dev server and a static `dist/`. Official `vanilla-ts` template already pins `vite` `^8.2.1`. Vite 8 uses Rolldown. Requires Node `^20.19.0 \|\| >=22.12.0`. |
| TypeScript | 6.0.3 (`~6.0.2` range) | Typed app code and `tsc` in `build` | This is what `create-vite` `vanilla-ts` installs today. Vite strips types at bundle time; `tsc && vite build` is the template's typecheck gate. Stay on the 6.x line so later ESLint or Vitest tools that import the compiler API still resolve. |
| Browser `fetch` | platform | Load `https://dergigi.com/thoughts.xml` at runtime | CORS is open (`Access-Control-Allow-Origin: *`, verified 2026-08-19). A new `thoughts` post on dergigi.com appears without redeploying this site. |
| `DOMParser` | platform | Parse RSS 2.0 XML | The feed is one known RSS 2.0 document (`application/xml`, Jekyll 3.10.0). MDN's XML path is `parseFromString(text, "application/xml")` plus a `parsererror` check. No npm XML parser earns its keep here. |
| DOMPurify | 3.4.13 | Sanitize item HTML before it touches the page | Item `<description>` values are HTML-escaped markup from the feed. That is untrusted input. DOMPurify is the current browser XSS sanitizer, ships its own types (`dist/purify.cjs.d.ts`), and exposes `uponSanitizeAttribute` for URL rewriting in the same pass. |
| Impeccable | skill v4.1.1 (already in-repo) | Read-mode design direction | A design skill, not a CSS framework. No runtime package. It writes `PRODUCT.md` / `DESIGN.md` and steers typeset, layout, distill, and polish. The shipped look is custom CSS you author. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| DOMPurify | 3.4.13 | XSS sanitizer + hook surface for URL rewrite | Always. The only production dependency. |
| `URL` constructor | platform | Turn `/time` into `https://dergigi.com/time` | Always. `new URL(value, "https://dergigi.com")` is the rewrite rule. Do not string-prefix. |
| Vitest | 4.1.11 | Unit-test the rewrite helper and empty-state branches | Optional, after the river renders. Pure `rewriteUrl()` tests need no DOM. |
| Prettier | 3.9.6 | Format TS/CSS/HTML | Optional. The Vite template does not include it. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Node.js | Run Vite | 20.19+ or 22.12+. This machine is on Node 26.7.0, which is fine. |
| `create-vite` 9.1.2 | Scaffold | `npm create vite@latest . -- --template vanilla-ts` |
| `npm run dev` | Local site | Template script is `"dev": "vite"`. |
| `npm run build` | Typecheck + static `dist/` | Template script is `"build": "tsc && vite build"`. Later hosting is just that folder. |
| `npm run preview` | Local production check | `"preview": "vite preview"` |
| Impeccable Read mode | Reading surface | Run typeset, layout, distill, then polish before calling the page done. Light paper theme is a brief constraint, not a theme pack. |
| `npx impeccable detect` | Optional CI slop check | CLI on npm. Not a runtime dep. |

## How the pieces fit

### Runtime data path

- URL: `https://dergigi.com/thoughts.xml`
- Status 200, `content-type: application/xml`, `access-control-allow-origin: *`
- Root: `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`
- Channel title is already "Thinking in Public"
- Descriptions are entity-escaped HTML (`&lt;p&gt;`, `&lt;a href=&quot;/time&quot;&gt;`)
- Canonical item links look like `https://dergigi.com/2026/08/19/thinking-in-public/`

### HTML sanitizer

### URL rewriting

### How Impeccable fits

- Mode is **Read**. The visitor came to read, not to be sold.
- First run goes through Impeccable's new-work flow (`PRODUCT.md`, then the visual world), then typeset, layout, distill, polish.
- Output is custom HTML/CSS in the Vite app. Tokens live in your CSS, later documented into `DESIGN.md` by `/impeccable document`.
- Light, paper-like page, generous measure, quiet type: that is the brief. Do not clone dergigi.com's dark chrome. Do not add Tailwind, shadcn, or a "blog theme" package to fake a design system.

## Installation

# Scaffold into the repo root (official Vite 8 vanilla-ts template)

# Only production library

# Optional later

# npm install -D vitest@4.1.11 prettier@3.9.6

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Vite 8 + vanilla TS | Astro 7.2.3 | Content sites that compile local Markdown/MDX at build time. This project forbids local post files and forbids build-time feed fetch. Astro islands would wrap the same client `fetch` at a higher cost. `astro check` still wants TypeScript 6's compiler API. |
| Vite 8 + vanilla TS | Next.js 16.3.1 | Apps that need a Node server, RSC, or auth. A later static export would still do the same client fetch, with a much larger toolchain. Hosting thoughts.dergigi.com as static files does not need Next. |
| Vite 8 + vanilla TS | Vite + React (or Vue/Svelte) | Multi-view apps with shared interactive state. A single river of sanitized HTML does not. |
| `DOMParser` | `fast-xml-parser` 5.11.0 | Node-only jobs, or tests that cannot use a DOM. Actively maintained (2026-08-16). Adds mapping code for a feed you already know. |
| `DOMParser` | `rss-parser` 3.13.0 | Almost never. Last publish 2023-04-11. Depends on `xml2js`, which is a Node parser. The README still tells browser users to use a CORS proxy. |
| DOMPurify 3.4.13 | `sanitize-html` 2.17.7 | Server-side Node sanitizing (`htmlparser2`). Needs Node `>=22.12.0`. Wrong runtime for a browser app. |
| DOMPurify 3.4.13 | `isomorphic-dompurify` | Only if you sanitize on a server with jsdom. There is no server here. |
| TypeScript 6.0.3 | TypeScript 7.0.2 | Native `tsc` is latest (`latest` tag as of 2026-08-19) and is fine for vanilla files because Vite does not call the compiler API. The official Vite template still pins `~6.0.2`. TypeScript 7.0 ships no JS compiler API; `typescript-eslint` and similar tools still need `@typescript/typescript6`. Stay on 6.x until the template moves. |
| Custom CSS via Impeccable | Tailwind / DaisyUI / shadcn | Component-heavy product UI. A paper reading page wants authored type and measure, not a utility kit. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Next.js | Server framework for a static reading page. Fights later static hosting. | Vite `vanilla-ts` |
| Astro | Strength is build-time content. That path is out of scope. | Vite `vanilla-ts` |
| React / Vue / Svelte | Extra runtime for `innerHTML` of sanitized fragments. | Plain DOM in `main.ts` |
| `rss-parser` | Stale (2023), Node `xml2js` dependency, CORS-proxy mindset. | `DOMParser` |
| `sanitize-html` | Node sanitizer. | DOMPurify |
| `@types/dompurify` | Stale DefinitelyTyped package (3.2.0, 2024-11-19). Conflicts with shipped types. | DOMPurify's own `purify.cjs.d.ts` |
| Tailwind, shadcn, theme kits | Invent a generic blog chrome. Impeccable owns the look. | Custom CSS |
| CMS, markdown copies, local posts | Second writing workflow. Out of scope. | Live feed only |
| Build-time feed fetch (`vite-plugin-static-copy` of XML, `getStaticProps`, Astro `fetch` in frontmatter) | New posts would need a redeploy. | Runtime `fetch` |
| CORS proxy / Cloudflare Worker (now) | CORS is already `*`. | Direct browser `fetch` |
| `innerHTML` of unsanitized descriptions | Stored XSS from feed HTML. | DOMPurify, then insert the clean fragment |

## Stack Patterns by Variant

- Add a Vite `server.proxy` entry for local `npm run dev` only.
- For production, put a same-origin proxy on the static host (Cloudflare Pages Function, or a one-file Worker) that fetches `thoughts.xml`.
- Do not add that proxy while `Access-Control-Allow-Origin: *` holds.
- Add Vitest 4.1.11.
- Keep `rewriteUrl()` pure and test it without a DOM.
- If you test DOMPurify itself, use Vitest's browser or `happy-dom` environment. DOMPurify needs a window.
- Keep the `typescript` package on 6.x, or alias `typescript@npm:@typescript/typescript6` next to a TypeScript 7 `tsc`. Official guidance: TypeScript 7.0 has no JS API yet.
- Ship `dist/` from `npm run build`. Any static host works. No adapter, no SSR runtime.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| vite@8.2.1 | Node ^20.19.0 \|\| >=22.12.0 | Official engines. Same floor as Vite 7. |
| vite@8.2.1 | typescript@~6.0.2 (6.0.3 latest 6.x) | Pair used by `create-vite` 9.1.2 `template-vanilla-ts`. |
| vite@8.2.1 | typescript@7.0.2 | Bundling works (Oxc/Rolldown strip types). Typecheck via `tsc` works. Tooling that `import`s `typescript` may not. |
| create-vite@9.1.2 | vite@^8.2.1, typescript@~6.0.2 | Verified from the template `package.json` on Vite `main`. |
| dompurify@3.4.13 | Browser DOM (and Vite ESM) | Ships types. No `@types/dompurify`. |
| TypeScript 7.0.2 | typescript-eslint, ts-jest, `astro check` | Not yet. Those still need TypeScript 6's compiler API (`@typescript/typescript6` 6.0.2). |
| sanitize-html@2.17.7 | Node >=22.12.0 | Server-only. Do not pair with this client app. |

## Sources

- `npm view` on 2026-08-19: vite 8.2.1, typescript latest 7.0.2 / 6.x 6.0.3, create-vite 9.1.2, dompurify 3.4.13, rss-parser 3.13.0, fast-xml-parser 5.11.0, sanitize-html 2.17.7, astro 7.2.3, next 16.3.1, vitest 4.1.11, prettier 3.9.6, eslint 10.8.1
- [Getting Started \| Vite](https://vite.dev/guide/) — Node range, `vanilla-ts` template, `dev` / `build` / `preview` scripts
- [Vite 8.0 announcement](https://vite.dev/blog/announcing-vite8) — Rolldown, Node 20.19+ / 22.12+, dated 2026-03-12
- [create-vite template-vanilla-ts package.json](https://github.com/vitejs/vite/blob/main/packages/create-vite/template-vanilla-ts/package.json) — pins `vite` `^8.2.1`, `typescript` `~6.0.2`
- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) — native `tsc`, no JS compiler API in 7.0, side-by-side `@typescript/typescript6`
- [DOMParser.parseFromString (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString) — `application/xml`, `parsererror`
- [Parsing and serializing XML (MDN)](https://developer.mozilla.org/en-US/docs/Web/XML/Guides/Parsing_and_serializing_XML) — `fetch` then `DOMParser`
- [DOMPurify README](https://github.com/cure53/DOMPurify) — 3.4.13, hooks, non-re-entrant `sanitize`, `ALLOWED_URI_REGEXP`
- [rss-parser on npm](https://www.npmjs.com/package/rss-parser) — 3.13.0, last publish 2023-04-11, `xml2js` dependency
- [fast-xml-parser on npm](https://www.npmjs.com/package/fast-xml-parser) — 5.11.0, updated 2026-08-16
- [Impeccable](https://impeccable.style/) — agent design skill, Read mode, not a CSS framework
- Live feed `https://dergigi.com/thoughts.xml` via `curl` on 2026-08-19 — RSS 2.0, CORS `*`, escaped HTML descriptions, relative `href="/time"`

<!-- gsd-stack-end -->

<!-- gsd-conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- gsd-conventions-end -->

<!-- gsd-architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- gsd-architecture-end -->

<!-- gsd-skills-start source:skills/ -->

## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| impeccable | Use when the user wants to design, redesign, shape, critique, audit, polish, clarify, distill, harden, optimize, adapt, animate, colorize, extract, or otherwise improve a frontend interface. Covers websites, landing pages, dashboards, product UI, app shells, components, forms, settings, onboarding, and empty states. Handles UX review, visual hierarchy, information architecture, cognitive load, accessibility, performance, responsive behavior, theming, anti-patterns, typography, fonts, spacing, layout, alignment, color, motion, micro-interactions, UX copy, error states, edge cases, i18n, and reusable design systems or tokens. Also use for bland designs that need to become bolder or more delightful, loud designs that should become quieter, live browser iteration on UI elements, or ambitious visual effects that should feel technically extraordinary. Not for backend-only or non-UI tasks. | `.cursor/skills/impeccable/SKILL.md` |
<!-- gsd-skills-end -->

<!-- gsd-workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- gsd-workflow-end -->

<!-- gsd-profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- gsd-profile-end -->
