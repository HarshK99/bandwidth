# Phase 1 — Work modes and Coverage Implementation Plan

**Goal:** Replace the old hours-based Coverage with the accepted compact activity menu.
**Architecture:** Static reusable catalogue, independent area/effort filtering, existing Coverage component and styles.
**Tech stack:** Existing TypeScript, React, Next.js, Tailwind.
**Spec:** ../APP_SOURCE_OF_TRUTH.md. **Branch:** rebuild/phase-1-coverage → main_new.

## Start and inputs

Trigger: `start phase 1`. Read AGENTS.md, APP_SOURCE_OF_TRUTH.md, STATUS.md, the master plan, CONTRACTS.md, and proposals/today-final-view.html. No prior implementation phase is required. Resume recorded progress if present. Read the installed Next.js use-search-params guide before changing the route.

Use interface-design and ui-ux-pro-max for compact hierarchy/keyboard controls; use vercel-react-best-practices for React changes. User check restrictions override skill testing/review steps. No build/test/code-review permission exists by default.

## Files

- Create lib/work/types.ts, lib/work/modes.ts, lib/work/catalog.ts with the exact Phase 1 contracts.
- Replace lib/direction/coverage.ts with tree filtering and URL parsing.
- Adapt components/Direction/CoverageView.tsx, app/coverage/page.tsx, components/Direction/ui.ts and app/globals.css only as needed.
- Update docs/STATUS.md.
- Do not yet delete lib/life/areas, lib/direction/nodes.ts, or the old schedule. Today and Week still use them until Phase 2.

## Tasks

- [ ] Define Effort, AreaId, ActivityNode, ActivityArea, CoverageFilter, WorkMode, WORK_MODES, and ACTIVITY_AREAS exactly as CONTRACTS.md specifies. Copy every label/membership from the source of truth, with unique path IDs. Production and Side projects use their new internal names.
- [ ] Implement filterActivities with recursive descendant matching; preserve ancestors/order, remove empty groups, and retain a multi-effort activity only once. Implement parseCoverageFilter: unknown or absent values become null, meaning All. Remove hours, gaps, inherited/via time, plan dependencies, and old scheduling filters from Coverage.
- [ ] Keep the existing CoverageView shell/list structure. Use a small header with back control, Coverage label, and two compact dropdowns. Area selection opens that area; All areas starts collapsed. Hobbies/Family and friends/Life admin remain expandable. Show effort labels only for All efforts. Use real buttons or details/summary for keyboard operation and visible focus.
- [ ] Store filters in `area` and `effort` query parameters using replace navigation. Keep the route's required Suspense boundary. Back falls back to /direction at this phase; full timeline scroll return arrives in Phase 2.
- [ ] Use the existing colour variables and add only missing area/group/activity tints. Keep dense leaf rows without clipping text; enlarge interactive hit areas on touch screens without turning leaves into large cards.
- [ ] Record implementation files and remaining old Today/Week behaviour. Commit and merge to main_new under the master-plan protocol. Stop.

## Walkthrough scenarios, if browser access is available

- Direct Coverage entry shows six collapsed areas and no hours or gap footer.
- Production includes product/website development and recording/editing, not invoices.
- Light work includes lead research, posting, and admin, not the removed tooling branch.
- Recovery → Hobbies shows Painting/Crossword/Language; Family and friends shows Call/Meet.
- Multi-effort entries do not duplicate under All efforts. Invalid URL filters safely become All.
- Tab/Enter can operate filters and branches; narrow screens retain readable labels.

These are manual walkthroughs, not permission to run test commands. If unavailable, record them as not performed.

## Deliverable and stop

New Coverage works from its own catalogue. The rest of the old app remains intentionally unchanged in this phase; an old Today `type=` link is not the new final filter contract. Record this transitional limitation rather than building a compatibility layer. Merge to main_new, update status, and stop before Phase 2.
