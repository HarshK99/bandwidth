# Bandwidth

A personal tool for seeing the current time block and browsing activities that fit its kind of effort.

The founder chooses the actual work from the current bottleneck outside the app. Bandwidth shows Deep work, Production, Light work, and protected recovery time. It does not assign a business or track goals and results.

## Rebuild reference

- [App source of truth](docs/APP_SOURCE_OF_TRUTH.md) — agreed behaviour, activity map, visual rules, and scope.
- [Status and handoff](docs/STATUS.md) — progress, branches, open decisions, and next starting point.
- [Phased rebuild plan](docs/superpowers/plans/2026-09-16-bandwidth-rebuild.md) — five phases, each run in a fresh chat with `start phase N`.
- [Accepted Today preview](docs/proposals/today-final-view.html) — standalone HTML with the timeline and compact Coverage.
- [Prompts to update the founder operating system](docs/FOUNDER_SYSTEM_UPDATE_PROMPTS.md) — separate edits for the original business document.

The existing application has not yet been rebuilt to match this specification. The plan is ready; the next step is `start phase 1` in a new chat.

`main_new` is the new version's integration branch. Each phase branches from it and merges back into it. Do not merge or push to the original `master`/`main` branch without the user's explicit instruction. No remote pushes are authorized. Outdated docs and app data may be replaced; obsolete product constraints need not be preserved.

The current code uses Next.js, React, and Tailwind. Read AGENTS.md before implementation. Do not run builds, tests, or code review without explicit authorization for the current task or phase.
