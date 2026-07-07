@AGENTS.md

# Photo Mission Control

Private single-user web app for commercial photography pre-production planning. Built for Michael Hutcheon (michael@hutcheon.us). Live at `portal.michaelhutcheon.com`. GitHub: `github.com/mhutcheon92/photo-mission-control`.

## Stack

- **Next.js 16** (App Router, Turbopack) — read `node_modules/next/dist/docs/` before writing any Next.js code; APIs differ from earlier versions
- **React 19**, **TypeScript**, **Tailwind CSS v4**
- **@anthropic-ai/sdk** — AI project generation from creative brief
- **@vercel/blob** v2.5 — cloud persistence (private store)
- **pdfjs-dist** — PDF parsing for brief upload
- Deployed on Vercel; subdomain via Cloudflare DNS

## Auth

Cookie-based. Middleware (`middleware.ts`) redirects unauthenticated requests to `/login`. The `portal_auth` cookie is set to the plaintext value of `PORTAL_PASSWORD`. `/api` routes are excluded from middleware — each API route performs its own `isAuthorized()` check via the same cookie comparison.

## Data Persistence

Two-layer: localStorage (fast, local) + Vercel Blob (cloud sync).

- `lib/storage.ts` is the single source of truth for all read/write operations
- Every write (`saveProject`, `deleteProject`, `duplicateProject`) calls `syncToCloud()` fire-and-forget
- On dashboard mount, `loadFromCloud()` hydrates from Blob and overwrites localStorage
- Blob store is **private** access — `put()` must use `access: 'private'` and `allowOverwrite: true`; `get()` must use the full URL from `list()` (not the bare pathname), with `{ access: 'private' }`
- `app/api/projects/route.ts` has `export const dynamic = 'force-dynamic'` to prevent Next.js from caching the internal Blob SDK fetches
- Storage key: `preproapp_projects`

## Environment Variables

| Variable | Where set |
|---|---|
| `PORTAL_PASSWORD` | Vercel (all envs) + `.env.local` |
| `ANTHROPIC_API_KEY` | Vercel (all envs) + `.env.local` |
| `BLOB_READ_WRITE_TOKEN` | Vercel (all envs) + `.env.local` (must be added manually — not pulled by `vercel env pull`) |
| `BLOB_STORE_ID` | Auto-injected by Vercel |

## Project Data Model

All types are in `lib/types.ts`. The `Project` interface is the canonical shape — every section maps directly to a field group:

| Section | Key fields |
|---|---|
| Brief | `clientName`, `campaignName`, `shootDate`, `shootLocation`, `myRole`, `deliverable`, `director`, `producer`, `captureSetup` |
| Story Foundation | `campaignSentence`, `character`, `location`, `event`, `revealImage`, `themeWord`, `colourPalette`, `alerts` |
| Stills Missions | `isolationNotes`, `mission1Summary`, `mission2Summary` |
| Shot List | `shots[]` — each has `mission` ('M1'\|'M2'), `code`, `type` ('E'\|'T'\|'C'\|'R'), `priority` ('Hero'\|'High'\|'Med') |
| Light Strategy | `lightNotes`, `lightWindows[]`, `scenarioResponses[]` |
| Gear Plan | `confirmedGear[]`, `rentalRecommendations[]` |
| Locations | `candidateLocations[]`, `recceItems[]` |
| C1 Workflow | `workflowSteps[]` — each has `phase` ('setup'\|'onset') |
| Competitive | `competitors[]` |
| Open Items | `openItemGroups[]` |
| Contacts | `contacts[]` |
| Checklist | `checklistGroups[]` — `done` boolean on each `CheckItem` drives dashboard progress bar |

## File Map

```
app/
  globals.css              — CSS custom properties, no Tailwind utilities for layout
  layout.tsx               — Cormorant Garamond (serif) + Inter (sans), font CSS variables
  page.tsx                 — Dashboard: project cards + cloud hydration on mount
  login/page.tsx           — Password form, sets portal_auth cookie
  project/[id]/page.tsx    — Project editor, debounced autosave (500ms)
  project/new/page.tsx     — New project: scratch or AI-generated from brief
  api/auth/route.ts        — Sets/clears portal_auth cookie
  api/generate/route.ts    — Streams Claude response to populate project from brief
  api/projects/route.ts    — GET/POST cloud sync via Vercel Blob

components/
  layout/
    Header.tsx             — Top bar with campaign name + export dropdown
    ProjectHero.tsx        — Large campaign title + metadata strip
    SideNav.tsx            — Desktop sidebar + mobile horizontal pill nav (both rendered, CSS-toggled)
  sections/                — One file per project section; all receive { project, onChange }
  ui/index.tsx             — Shared primitives (ProgressBar, etc.)

lib/
  types.ts                 — All TypeScript interfaces; Project is the root type
  storage.ts               — localStorage R/W + Blob sync (loadFromCloud, syncToCloud)
  generate.ts              — Claude prompt construction for brief → project
  export.ts                — HTML and Markdown export renderers
  attachments.ts           — PDF/image parsing for brief upload
```

## Styling Rules

**Do not use Tailwind utility classes for layout or spacing.** Tailwind v4's CSS ordering causes utility-applied styles to be overridden by component styles unpredictably. Use inline `style` props instead.

For responsive behavior, two patterns work reliably:
1. **`clamp()`** in inline styles for fluid font sizes and padding (e.g. `fontSize: 'clamp(22px, 6vw, 36px)'`)
2. **Inline `<style>` blocks** inside components for media queries (same mechanism SideNav uses)

Do **not** add `@media` blocks to `globals.css` expecting them to override component styles — they won't due to Tailwind v4 CSS ordering.

### Design tokens (CSS custom properties)

```
--bg / --bg2 / --bg3 / --bg4   dark backgrounds, lightest to darkest
--accent / --accent-light       gold #c8a96e / gold at 12% opacity
--red / --red-light             alias for --accent (legacy — do not use for danger)
--danger / --danger-light       red #C0392B / red at 12% opacity
--text / --text-2 / --text-3   primary / secondary / muted text
--border / --border-med         subtle / medium border
--amber / --green / --blue      alert and priority badge colors
```

**Fonts:** `var(--font-serif)` = Cormorant Garamond (headings, display); `var(--font-sans)` = Inter (body). Font variables are injected via `layout.tsx`.

## Mobile Responsiveness

The project layout (`app/project/[id]/page.tsx`) uses `className="project-layout"` on the flex container. SideNav's inline `<style>` block sets `flex-direction: column` on `.project-layout` at ≤767px, and shows/hides the desktop sidebar vs. mobile pill nav via `.hidden-mobile` / `.show-mobile` classes.

Header hides date and PRE-PRODUCTION badge on mobile via `.header-date` / `.header-badge` classes defined in a `<style>` block inside `Header.tsx`.

## AI Generation

`POST /api/generate` accepts a creative brief (text or extracted PDF/image text) and streams a structured JSON project object back using Claude. The model is configured in `lib/generate.ts`. New projects created via "Generate from brief" flow hit this endpoint.

## Dev Server

`npm run dev` — runs on `http://localhost:3000` with Turbopack.

The `.claude/launch.json` is configured for the preview tool. If the dev server isn't running, start it before testing UI changes.

## Deployment

Push to `main` on GitHub → Vercel auto-deploys. No manual deploy steps needed. `BLOB_READ_WRITE_TOKEN` must be set in Vercel's dashboard for Production + Preview + Development environments (it is not auto-injected like `BLOB_STORE_ID`).
