# Bandwidth

A personal tool for seeing the current time block and browsing activities that fit its kind of effort.

The founder chooses the actual work from the current bottleneck outside the app. Bandwidth shows Deep work, Production, Light work, and protected recovery time. Its compact header reminds the founder of Wave Link's +5% weekly active-user growth and ≥₹60k monthly income goals. It does not assign a business or track goal progress/results.

## Rebuild reference

- [App source of truth](docs/APP_SOURCE_OF_TRUTH.md) — agreed behaviour, activity map, visual rules, and scope.
- [Status and handoff](docs/STATUS.md) — progress, branches, open decisions, and next starting point.
- [Phased rebuild plan](docs/superpowers/plans/2026-09-16-bandwidth-rebuild.md) — five phases, each run in a fresh chat with `start phase N`.
- [Accepted Today preview](docs/proposals/today-final-view.html) — standalone HTML with the timeline and compact Coverage.
- [Prompts to update the founder operating system](docs/FOUNDER_SYSTEM_UPDATE_PROMPTS.md) — separate edits for the original business document.

Phases 1–5 are complete with documented check limitations: Coverage, Today, the weekly editor, Calendar integration, and the browser walkthrough. Phase 5 exercised core journeys in Chromium; the user reported successful Calendar sync. Follow-up fixes cover Today positioning, explicit Google sign-in, and cross-tab Week saving. The release production build and TypeScript checks passed. A partial [code review](docs/CODE_REVIEW.md) found two remaining issues; repository test commands were not run. See [Rebuild results](docs/REBUILD_RESULTS.md) and [Status](docs/STATUS.md) for evidence and omissions.

Calendar remains read-only, with its existing connection, selection, and cache. Events follow the visible local 07:00-to-next-07:00 day, including overnight and open time. Time and Upgrades retain their existing content. Calendar setup requires `NEXT_PUBLIC_GOOGLE_CLIENT_ID`; without it, the schedule remains usable.

`master` is the repository's main branch; the user authorized promoting and pushing the rebuild there after the final build. `main_new` was the rebuild integration branch. Further publication needs its own authorization. Obsolete docs are removed from the current tree but remain in Git history. The app replaces the old v1 schedule on initialization, preserving valid v2 Week edits, Calendar storage, and unrelated browser data.

The current code uses Next.js, React, and Tailwind. Read AGENTS.md before implementation. Do not run builds, tests, or code review without explicit authorization for the current task or phase.
