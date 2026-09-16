# Phase 5 — Final Walkthrough and Handoff Implementation Plan

**Goal:** Walk through the rebuilt app as a user, fix observed issues, and leave an honest final handoff on main_new.
**Architecture:** Existing integrated app; fixes belong to their existing components and helpers.
**Tech stack:** Existing app and available manual browser tools.
**Spec:** ../APP_SOURCE_OF_TRUTH.md. **Branch:** rebuild/phase-5-walkthrough → main_new.

## Start and inputs

Trigger: `start phase 5`. Read AGENTS.md, source of truth, STATUS.md, master plan, CONTRACTS.md, accepted HTML, and Phase 4's recorded issues. Phases 1–4 must be integrated. Do not reimplement completed work.

Use interface-design and ui-ux-pro-max for the manual interface walkthrough, plus vercel-react-best-practices if fixes change React. No code review, build command, or test command is authorized merely by starting this phase. Read relevant local Next.js guidance before framework fixes.

## Files and deliverables

- Create docs/REBUILD_RESULTS.md with a dated scenario/result table, actual environment, issues/fixes, and omitted checks.
- Update docs/STATUS.md and README.md with the actual implemented state.
- Fix only files needed for observed issues in Today, Coverage, Week, Calendar, or retained surfaces.

## Tasks

- [ ] Record available browser/server access and the exact permission scope. An existing/manual development server may be used; do not run a build/test script indirectly to prepare it. If no usable browser is available, give the user the scenario list and record their actual observations as user-reported. Do not silently mark the walkthrough complete.
- [ ] Walk Today at representative times, using browser clock controls where available: Deep work, Light work, Production, Recovery, a gap, 06:59, 07:00, and midnight. Confirm names/guides, current/next state, remaining time, ruler, and no business assignments.
- [ ] Open each work-mode card, change area/effort filters, expand Hobbies and Family and friends, check a multi-effort activity and an empty combination, and return to Today. Confirm collapse defaults and date/scroll/focus restoration.
- [ ] Edit a weekday, reject one invalid overlap, remove a block, copy a day with cancel/confirm, then reload. Confirm independent days, open time, valid persistence, and no revival of old business-assignment data.
- [ ] Walk Calendar and preserved Time/Upgrades routes under the recorded feature decision. Confirm the new plan reset did not wipe preserved feature state. Record any credential-dependent scenarios that cannot be observed.
- [ ] Walk desktop/mobile, light/dark, keyboard operation, and text wrapping. Fix observed issues in existing components; repeat only the affected manual scenarios and related flows.
- [ ] If the user explicitly authorizes automated checks for this phase, record the exact authorization before running only those checks. Determine the repository's actual available commands at that time; do not install a test runner or run a build by assumption. Otherwise record Builds: not run, Tests: not run, Code review: not performed.
- [ ] Write REBUILD_RESULTS.md with columns: Scenario, Observed result, Evidence source, Remaining issue. Distinguish agent-observed, user-reported, and not checked. Do not label an implementation assumption as a passed check.
- [ ] Update STATUS with completed work, remaining issues/limitations, exact files and checks, and the user's next decision. Commit and merge the completed phase to main_new. If required walkthrough evidence remains unavailable, leave Phase 5 awaiting walkthrough with a precise resume point instead of declaring it verified.

## Completion boundary

The result is the new version on main_new with a documented manual walkthrough and any explicit omissions. User acceptance is recorded only when the user actually gives it. Tests/builds not authorized do not acquire an invented pass result.

No remote push, deployment, master/main merge, or next phase. A future instruction is required to promote the new version to the original main branch.
