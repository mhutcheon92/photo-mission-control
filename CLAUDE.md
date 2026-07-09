@AGENTS.md

# Photo Mission Control

Private single-user web app for commercial photography pre-production planning. Built for Michael Hutcheon (michael@hutcheon.us). Live at `portal.michaelhutcheon.com`. GitHub: `github.com/mhutcheon92/photo-mission-control`.

## Stack

- **Next.js 16** (App Router, Turbopack) — read `node_modules/next/dist/docs/` before writing any Next.js code; APIs differ from earlier versions
- **React 19**, **TypeScript**, **Tailwind CSS v4**
- **@anthropic-ai/sdk** — AI project generation from creative brief
- **@vercel/blob** v2.5 — cloud persistence (private store)
- **@tiptap/react + @tiptap/starter-kit + @tiptap/extension-underline** — rich text editing for all multiline fields
- **pdf-parse** — server-side PDF text extraction in `api/parse-pdf/route.ts` (no AI call; runs in milliseconds)
- Deployed on Vercel; subdomain via Cloudflare DNS

## Auth

Cookie-based. Middleware (`middleware.ts`) redirects unauthenticated requests to `/login`. The `portal_auth` cookie is set to the plaintext value of `PORTAL_PASSWORD`. `/api` routes are excluded from middleware — each API route performs its own `isAuthorized()` check via the same cookie comparison.

## Data Persistence

Two-layer: localStorage (fast, local) + Vercel Blob (cloud sync).

- `lib/storage.ts` is the single source of truth for all read/write operations
- Every write (`saveProject`, `deleteProject`, `duplicateProject`) calls `syncToCloud()` fire-and-forget
- On dashboard mount, `loadFromCloud()` **merges** cloud + local: cloud wins by default, but any locally-newer project (by `updatedAt`) takes precedence. If local-only projects exist (not yet synced), it triggers a `syncToCloud()` to push them up. This prevents newly generated projects from disappearing when returning to the dashboard.
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
  globals.css              — CSS custom properties + rich text styles (.ProseMirror, .rich-display)
  layout.tsx               — Cormorant Garamond (serif) + Inter (sans), font CSS variables
  page.tsx                 — Dashboard: project cards + cloud hydration on mount (maxWidth 1100, centered)
  login/page.tsx           — Password form, sets portal_auth cookie
  project/[id]/page.tsx    — Project editor, debounced autosave (500ms); content wrapped in
                             .content-shell (max-width 75vw desktop, 95vw mobile via media query)
  project/new/page.tsx     — New project: scratch or AI-generated from brief
  api/auth/route.ts        — Sets/clears portal_auth cookie
  api/generate/route.ts    — Streams Claude response to populate project from brief
  api/alerts/resolve/route.ts — POST: generates two AI resolution suggestions for an alert
  api/parse-pdf/route.ts   — Extracts text from uploaded PDF using pdf-parse (no AI)
  api/projects/route.ts    — GET/POST cloud sync via Vercel Blob

components/
  layout/
    Header.tsx             — Top bar with campaign name + export dropdown
    ProjectHero.tsx        — Campaign title + metadata strip; all fields use RichTextEditor
    SideNav.tsx            — Desktop sidebar + mobile horizontal pill nav (both rendered, CSS-toggled)
  sections/                — One file per project section; all receive { project, onChange }
    AlertStrip.tsx         — Pinned "Needs attention" strip with AI-drafted resolutions
    Brief.tsx              — Story foundation, campaign sentence, constraints; uses RichTextEditor
    StillsMissions.tsx     — Mission cards with inline editing; uses RichTextEditor
    LightStrategy.tsx      — Light notes, windows, scenarios; uses RichTextEditor
    Contacts.tsx           — Contact cards with suggested contacts from brief
    [others]               — Gear Plan, Locations, C1Workflow, Competitive, OpenItems, Checklist
                             still use old Edit/Done toggle + SectionHeader pattern (deferred)
  ui/index.tsx             — Shared primitives: InlineEditProvider, InlineField, InlineTextarea,
                             RichTextEditor, AutoTextarea, Card, Badge, SectionHeader, etc.

lib/
  types.ts                 — All TypeScript interfaces; Project is the root type
  storage.ts               — localStorage R/W + Blob sync (loadFromCloud, syncToCloud)
  generate.ts              — Claude prompt construction for brief → project
  export.ts                — HTML and Markdown export renderers
  attachments.ts           — PDF/image parsing for brief upload
  resolveAlert.ts          — Fetch helper for /api/alerts/resolve
  suggestContacts.ts       — Scans open items for "Owner: NAME" patterns to suggest contacts
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
--surface / --surface-alt       card / secondary card backgrounds
--input-bg                      dark input background
--accent / --accent-light       gold #c8a96e / gold at 12% opacity
--gold / --gold-hover / --gold-on  primary action color / hover / text-on-gold
--rust / --rust-tint            orange-red constraint color
--urgent-bg / --urgent-fg       red alert badge colors
--flag-bg / --flag-fg           amber flag badge colors
--red / --red-light             alias for --accent (legacy — do not use for danger)
--danger / --danger-light       red #C0392B / red at 12% opacity
--text / --text-2 / --text-3   primary / secondary / muted text
--border / --border-med         subtle / medium border
--amber / --green / --blue      alert and priority badge colors
--font-mono                     ui-monospace stack (JetBrains Mono removed — incompatible with Turbopack prod build)
```

**Fonts:** `var(--font-serif)` = Cormorant Garamond (headings, display); `var(--font-sans)` = Inter (body). Injected via `layout.tsx`. Do **not** add Google Font imports for monospace fonts — `next/font/google` with monospace fonts breaks Turbopack production builds.

## Inline Editing Pattern

All editable fields use a shared `InlineEditProvider` context (in `app/project/[id]/page.tsx`) that tracks which field is currently editing by `fieldKey`. Only one field can be in edit mode at a time.

- **`InlineField`** — single-line `<input>`, Enter commits, Escape cancels. Used for short text (mission name, shot code, time range, etc.).
- **`InlineTextarea`** — multiline `AutoTextarea`, blur commits, Escape cancels. Still defined but only used internally. **Prefer `RichTextEditor` for all user-facing multiline fields.**
- **`RichTextEditor`** — Tiptap-powered rich text editor. Same props interface as `InlineTextarea`. Supports bold, italic, underline, bullet list, ordered list via a fixed toolbar above the field. Stores content as HTML; displays HTML in read mode (`dangerouslySetInnerHTML`). Legacy plain-text values (including "- " bullet format) fall back to `renderProseBullets()` for display. Escape cancels without saving; blur commits.
- **`AutoTextarea`** — base auto-growing textarea. Enter (no Shift) blurs/commits; Shift+Enter inserts newline. Used in AlertStrip resolution drafts and checklist items.

## Layout Width

- **Dashboard** (`app/page.tsx`): `<main style={{ maxWidth: 1100, margin: '0 auto' }}>`
- **Project editor** (`app/project/[id]/page.tsx`): content below the Header is wrapped in `<div class="content-shell" style={{ maxWidth: '75vw', margin: '0 auto' }}>`. A `<style>` block overrides this to `95vw` at `≤767px` for mobile.
- **ProjectHero** has no horizontal padding — its field borders run edge-to-edge within the content-shell, flush with the project-layout section below.

## Mobile Responsiveness

Mobile breakpoint is **≤767px** throughout. All responsive overrides use inline `<style>` blocks inside components (same pattern as `SideNav.tsx`) — never `@media` in `globals.css`.

- **Layout**: `app/project/[id]/page.tsx` uses `className="project-layout"` on the flex container. SideNav's `<style>` block sets `flex-direction: column` at ≤767px and toggles `.hidden-mobile` / `.show-mobile` for sidebar vs. pill nav.
- **Header**: hides date and PRE-PRODUCTION badge on mobile via `.header-date` / `.header-badge` classes in a `<style>` block inside `Header.tsx`.
- **ProjectHero**: compact font at ≤767px via `.hero-wrap`, `.hero-title`, `.hero-sentence` classes + `!important` overrides. Mobile also gets `padding: 20px 16px 8px` (desktop has `0` horizontal padding).
- **SideNav pills**: auto-scroll active pill into view on mobile via `useEffect` + `scrollIntoView`; tap targets are `10px 16px` padding.

## AI Generation

`POST /api/generate` accepts a creative brief (text or extracted PDF/image text) and streams a structured JSON project object back using Claude. The model (`claude-sonnet-5`, 32k max_tokens) is configured in `lib/generate.ts`.

**Thinking blocks**: Sonnet 5 may return `type: 'thinking'` blocks before the text block. Always find the text block with `.find(b => b.type === 'text')` — never assume `content[0]` is text.

**House style doctrine** (in `lib/generate.ts`): no em-dashes as sentence connectors; use "- " bullet lines for 2+ items; sentences under ~25 words; no "Note:" or "Important:" preambles.

**Alert resolution**: `POST /api/alerts/resolve` accepts an alert + project context and returns two resolution suggestions (via `claude-sonnet-5`, 1500 max_tokens). Client helper in `lib/resolveAlert.ts`.

**New project flow**: `app/project/new/page.tsx` calls `saveProject(merged)` immediately after generation (before showing the review step) so the project survives navigation away from the review screen.

## Dev Server

`npm run dev` — runs on `http://localhost:3000` with Turbopack.

The `.claude/launch.json` is configured for the preview tool. If the dev server isn't running, start it before testing UI changes.

## Deployment

Push to `main` on GitHub → Vercel auto-deploys. No manual deploy steps needed. `BLOB_READ_WRITE_TOKEN` must be set in Vercel's dashboard for Production + Preview + Development environments (it is not auto-injected like `BLOB_STORE_ID`).
