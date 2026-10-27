# CLAUDE.md

EnrichMINT web app (Next.js). The API, plan and decisions live in `../enrichmint-api` (`PLAN.md`). Read this before changing code.

This file follows the FOAIS CLAUDE.md contract from the foais-standards plugin. Blocks marked "Org standard" come from the plugin; everything else belongs to this project. Run `/foais-standards:generate-rules` to add `.claude/rules/`.

## Project Overview

- Learn side: `/start` (goal and recommendations), `/guides` (browse), `/checkout/[slug]`, `/library/[guideId]` (reader and grounded assistant), `/requests/[id]`.
- Share side: `/studio` (dashboard), `/studio/interview/[id]`, `/studio/guides/[id]`, `/studio/requests`, `/studio/earnings`, `/studio/settings`.
- Admin: `/admin`, `/admin/reviews`, `/admin/cases`, `/admin/payments`. Everyone: `/log` (stewardship log).
- Stack: Next.js 16 App Router (`proxy.ts`), React 19, Tailwind v4, react-hook-form and zod, sonner, PayPal JS SDK v6 loaded at runtime.

## Commands

| Name | Command |
| --- | --- |
| Typecheck | `yarn type-check` |
| Lint | `yarn lint` |
| Test | none yet |
| E2E | none yet (PayPal sandbox popup is tested manually) |
| Dev server | `yarn dev` (port 3100) |
| Build | `yarn build` |

Base branch: `main`.

## Where To Look

| File | Holds | Loaded |
| --- | --- | --- |
| `http.ts` | The one fetch wrapper to the API | Read before adding a service |
| `app/lib/utils/apiCall.ts` | Authenticated server-side calls returning `ActionResult` | Read before adding a service |
| `app/lib/services/` | `'use server'` services, one per area | Read before calling the API |
| `app/components/PayPalCheckout.tsx` | PayPal JS SDK v6 checkout (server creates and captures) | Read before touching checkout |
| `proxy.ts` | Route guard and CSP (PayPal origins allowed) | Read before adding a route or external script |
| `.env.example` | Every env var, with a comment | Read when adding config |

### User-Facing Docs

| Kind | Location |
| --- | --- |
| Docs page | none |
| Guided tours | none |
| Onboarding | none |
| Landing or marketing pages | `app/(public)/page.tsx` |

Before changing a feature, read its doc in the feature docs folder. After changing it, update the doc.

## Docs Locations

| Kind | Folder |
| --- | --- |
| Feature docs | `../enrichmint-api/docs/features/` |
| Plans | `../enrichmint-api/PLAN.md` |
| EOD summaries | `docs/eods/` |
| Learnings | `docs/learnings/` |
| Test cases | `docs/test-cases/` |

## General Principles

<!-- foais-standards:org:start general-principles v0.2.0 -->
> Org standard: change this in the foais-standards plugin, not here.

1. Read first: open the feature doc (feature docs folder in Docs Locations) and the files you will touch before editing.
2. Change only what the task needs. No drive-by refactors, renames, or reformatting.
3. Reuse before adding. Look for an existing helper, component, or pattern first.
4. Do not add libraries casually. Justify any new dependency in the PR description.
5. Do not add a new architectural layer (state manager, ORM, framework, service) without the developer's agreement. Use what the project already has.
6. When a rule conflicts with the task, stop and ask instead of picking one.
7. Do not edit `CLAUDE.md` or `.claude/rules/` unless the developer asks. Org standard blocks change only in the foais-standards plugin.
8. Never run `git add`, `git commit`, `git push`, or any command that creates commits or opens or merges a PR (merge, rebase, cherry-pick, revert, `gh pr create`). Developers commit; Claude prepares the messages. A plugin hook enforces this.
9. Never guess a project fact (a command, a path, a tool). When `CLAUDE.md` lacks it, say so and suggest `/foais-standards:generate-rules`.
10. Never read or change real env files (`.env`, `.env.local`, `.env.development`, and the like). Use the env example file; developers set real values. A plugin hook enforces this.
<!-- foais-standards:org:end general-principles -->

### Project Rules

- The UI never decides that a payment succeeded. It shows what the API says after the server captures.
- Every purchase and request needs an explicit approval tick in the UI; the API also requires `approved: true`.
- Keep attribution visible: "{contributor} said", "AI suggestion" and "Not covered" blocks are always distinct.
- Label demo profiles, simulated steps and sandbox payments wherever they appear.

## Code Quality

<!-- foais-standards:org:start code-quality v0.2.0 -->
> Org standard: change this in the foais-standards plugin, not here.

1. Use the strictest type checking the language offers. Every escape hatch (an untyped value, a type-check ignore, an unchecked cast) carries a one-line `reason:` comment.
2. Follow the naming, file layout, and export conventions in Project Rules, consistently. One component or class per file.
3. Keep one import order across the codebase, as Project Rules define it.
4. One styling approach per project. Do not mix in a second one.
5. No debug logging in client code (browser or mobile), including leftover debug lines. Show problems to the user through the UI; logging belongs on the server.
6. Put pure logic in its own module with unit tests. UI tests query by role and accessible name, never snapshots.
7. When logic is mirrored between client and server, keep both copies identical; each pair has a drift test.
8. Code passes the Typecheck, Lint, and Test commands in Commands before it is called done.
<!-- foais-standards:org:end code-quality -->

### Project Rules

1. All API calls go through `'use server'` services in `app/lib/services/` using `apiCall`; components never call `fetch` directly.
2. The session token lives only in the httpOnly cookie; env vars are server-only (the PayPal client id is passed to the browser explicitly because it is public by design).
3. No component kit, global store or client data-fetching library; shared UI lives in `app/components/ui.tsx`.
4. Tailwind tokens live in `app/globals.css`; never hard-code hex values in components.

## Comments

<!-- foais-standards:org:start comments v0.2.0 -->
> Org standard: change this in the foais-standards plugin, not here.

- One line, one sentence. Explain why, not what. Skip the comment when the code is already clear.
- No multi-paragraph docstrings or comment blocks.
- Prefixes when needed: `NOTE:` for context, `IMPORTANT:` for something that breaks if ignored.
<!-- foais-standards:org:end comments -->

## Writing Style

<!-- foais-standards:org:start writing-style v0.2.0 -->
> Org standard: change this in the foais-standards plugin, not here.

Applies to code, comments, docs, commit messages, and chat replies.

- No em-dashes or double-dashes as punctuation. Use commas, colons, periods, or parentheses.
- No emojis.
- Short, plain sentences.
<!-- foais-standards:org:end writing-style -->
