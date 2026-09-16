# Bandwidth

A personal tool for seeing the current time block and browsing activities that fit its kind of effort.

The founder chooses the actual work from the current bottleneck outside the app. Bandwidth shows Deep work, Production, Light work, and protected recovery time. Its compact header reminds the founder of Wave Link's +5% weekly active-user growth and ≥₹60k monthly income goals. It does not assign a business or track goal progress/results.

## Rebuild reference

- [App source of truth](docs/APP_SOURCE_OF_TRUTH.md) — agreed behaviour, activity map, visual rules, and scope.
- [Status and handoff](docs/STATUS.md) — progress, branches, open decisions, and next starting point.
- [Phased rebuild plan](docs/superpowers/plans/2026-09-16-bandwidth-rebuild.md) — five phases, each run in a fresh chat with `start phase N`.
- [Accepted Today preview](docs/proposals/today-final-view.html) — standalone HTML with the timeline and compact Coverage.
- [Prompts to update the founder operating system](docs/FOUNDER_SYSTEM_UPDATE_PROMPTS.md) — separate edits for the original business document.

Phases 1–4 are implemented: Coverage, Today, the weekly editor, and Calendar integration. They remain unverified in the browser; builds, tests, and code review have not been run. The next step is `start phase 5` in a new chat for the manual walkthrough.

Calendar remains read-only, with its existing connection, selection, and cache. Events follow the visible local 07:00-to-next-07:00 day, including overnight and open time. Time and Upgrades retain their existing content. Calendar setup requires `NEXT_PUBLIC_GOOGLE_CLIENT_ID`; without it, the schedule remains usable.

`main_new` is the new version's integration branch. Each phase branches from it and merges back into it. Do not merge or push to the original `master`/`main` branch without the user's explicit instruction. No remote pushes are authorized. Outdated docs and app data may be replaced; obsolete product constraints need not be preserved.

The current code uses Next.js, React, and Tailwind. Read AGENTS.md before implementation. Do not run builds, tests, or code review without explicit authorization for the current task or phase.
