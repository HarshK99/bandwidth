# Bandwidth rebuild — status and handoff

## Current state

Approved header: fixed Wave Link +5% active users/week and Income ≥₹60k/month reminders, with “Work: advance a goal or tackle its blocker.” Date/clock/Now share one row; separate weekday row and whole-day progress bar removed. Current-block progress stays. Source of truth, contracts, and Phases 2/4/5 now include it. No goal tracking/model. Phase 2 implements the header; browser height/fit remains unmeasured.

Latest workflow preference: keep phase completion/handoffs compact (status, changed areas/files, actual checks, open issues, next phase), recorded once before the phase commit. Do not rewrite history or make additional handoff-only commits. User will request builds/tests/code review at the end if desired; none is authorized automatically. Existing no-build/test/review rules remain in effect.

The user approved the HTML direction and authorized a phased rebuild plan that reuses existing components. Phases 1 Coverage and 2 Direction are implemented, unverified. Today and basic Week now share the v2 schedule; browser initialization replaces the old schedule with the reference week.

New-chat reading order:

1. AGENTS.md and the user's project instructions.
2. [APP_SOURCE_OF_TRUTH.md](APP_SOURCE_OF_TRUTH.md).
3. This document.
4. [Master plan](superpowers/plans/2026-09-16-bandwidth-rebuild.md), [shared contracts](phases/CONTRACTS.md), and the matching phase file.
5. [Accepted HTML](proposals/today-final-view.html) and recorded prior phase outputs.
6. [Founder document update prompts](FOUNDER_SYSTEM_UPDATE_PROMPTS.md) and the original operating system when relevant.

## Branches and authorization

- master: existing app/main branch. No merge or push unless the user explicitly asks.
- main_new: integration/main branch for the new version. User explicitly authorized each new split to merge back here.
- proposal/direction-coverage: preview/specification branch, fast-forwarded into main_new during planning at commit 01722de.
- plan/phased-rebuild: plan-authoring branch. Plan commit f142c8c was fast-forwarded into main_new. Planning handoffs followed the same branch/integration workflow.
- Each phase starts from current main_new, uses its named phase branch, and merges back before stopping. Read the master plan for resuming an existing branch safely.
- User explicitly permits destructive replacement of outdated app docs and old app data on rebuild branches. Do not preserve redundant data or backward compatibility by default.
- No remote push or merge to the original master/main branch is authorized or performed. Local integration into main_new is authorized.
- Phase 2 implements schedule/data replacement: v2 initializes from new defaults; the v1 plan is removed only after successful v2 initialization/save. Calendar and unrelated storage remain outside that reset.

## Recorded decisions

- Bandwidth is a current-block tool, not the whole founder operating system.
- Direction keeps the timeline and shows effort, not the current business or task.
- Modes: Deep work, Production, Light work; Recovery stays protected.
- Generic card guides: Think · Solve · Decide · Discuss; Build · Write · Edit · Refine; Research · Post · Follow up · Admin.
- Coverage opens across all areas filtered by effort, using compact controls and collapsed branches.
- The task map is genuinely trimmed, including concrete hobbies, relationship, and life-admin choices.
- Goal management, bottleneck records, journals, completion, and results/evidence tracking are outside the app. Two fixed header goal reminders are the approved display-only exception.
- The original founder system remains separate. Prompts let the user update it independently.

## Files and cleanup

- Created APP_SOURCE_OF_TRUTH.md and FOUNDER_SYSTEM_UPDATE_PROMPTS.md.
- Replaced the chronological proposal handoff with this current status.
- Rewrote README.md to point to the new specification and identify the rebuild as pending.
- Removed obsolete PRD, DIRECTION, DATA_MODEL, PLAN_BLOCK_LINKS, PLAN_GOALS, PLAN_SCHEDULE, CALENDAR, and UPGRADES docs. Historical content remains in Git, not as rebuild requirements. Removing their docs does not itself decide the fate of Calendar, Time, or Upgrades features.
- Removed the superseded direction-coverage.html prototype. today-final-view.html is the sole retained HTML reference.
- Original founder_operating_system_latest.md was untracked at task start. It was added unchanged to Git in f142c8c so future phase branches have the required reference; no source content was rewritten.
- Added the five-phase master plan, shared contracts, and phase instructions. Updated AGENTS.md/README.md for `start phase N` discovery and the user-authorized main_new integration workflow.

## Checks and omissions

- Read the original system document, current HTML and task data, previous handoff, README, and old documentation inventory.
- No build commands, test commands, or code review authorized or performed.
- Browser appearance/behaviour has not been verified with browser tooling. The user viewed and iteratively approved the HTML; that is not an automated check.
- Planning performed no application implementation, browser-data reset, deployment, or original-main change. Phase implementation is recorded below.
- Planning-only source reads mapped components and their dependencies; local Next.js navigation/search-parameter docs and relevant skills were read. UI/UX Pro Max returned keyboard navigation and visible-focus guidance, used in the phase requirements. No app command checks were run.

## Planning defaults and outstanding preferences

- Optional questions were presented about retained surfaces and weekly defaults. No answer has been recorded yet; do not describe the defaults as explicit user approval.
- Default: keep Calendar, Time, and Upgrades. Preserve purpose/data and adapt Calendar boundaries without redesigning its connection UI.
- Default: reference day Monday–Saturday; Sunday contains only the reference protected blocks, leaving work periods open. Change if the user selects weekdays only.
- Week is a recurring editable template with independent day shapes, not a dated planner or history.
- Browser-local timezone; operational day starts at 07:00. This matches the HTML for the user's India-local browser while respecting existing timezone behaviour.
- CONTRACTS.md defines the destructive v2 plan replacement, scoped storage reset, and shared APIs. Old business-assignment compatibility is not required.
- If a late answer changes a default, update the source of truth, master plan, contract, and relevant phase before dependent work.

## Phase progress

| Phase | Status | Output / next starting point |
| --- | --- | --- |
| 1 — Coverage | Implemented; unverified | New work modes/catalogue and compact filtered Coverage; next: Phase 2 |
| 2 — Direction | Not started | Replace schedule/storage; update Today and coherent basic Week |
| 3 — Week | Not started | Add time/name edits, add/remove/copy day, mobile editing |
| 4 — Integration | Not started | Calendar boundary, retained navigation, polish, obsolete-code cleanup |
| 5 — Walkthrough | Not started | Manual journeys, fixes, REBUILD_RESULTS.md, honest final handoff |

At each phase end update its row and one compact entry: status, changed files/areas, checks, open issues, next phase. Add only necessary decisions. Include it in the phase commit; no additional handoff-only/self-hash commits. Record a precise resume point if interrupted.

## Check authorization ledger

Phase 2: builds, tests, and code review not authorized or performed. Manual browser walkthrough not performed; no browser tool was available.

Phase 1: builds, tests, and code review not authorized or performed. Manual browser walkthrough not performed; no browser tool was available in this session.

Planning task: builds not authorized; tests not authorized; code review not authorized. None performed. Each Phase 1–5 starts with no command-based check or code-review authorization; record any explicit current-phase permission before using it. Manual browser walkthroughs are separate; phase instructions explain what to observe, and unavailable evidence must remain recorded as unavailable.

## Phase 1 handoff

Phase 1: implementation complete, unverified; rebuild/phase-1-coverage → main_new.
Changed: lib/work/{types,modes,catalog}.ts, lib/direction/coverage.ts, CoverageView.tsx, app/coverage/page.tsx, app/globals.css; independent area/effort filters, compact expandable activity list, no scheduled-hours accounting.
Checks: source/dependency and installed Next.js guide reads only; builds, tests, code review, and browser walkthrough not performed.
Open: browser appearance, keyboard interaction, and runtime behaviour unverified. Today/Week retain the old schedule; old type= links intentionally do not select the new effort filter. Back uses /direction until Phase 2.
Next: in a fresh chat, say start phase 2; replace schedule/storage and update Today/basic Week. Stop after Phase 1 integration; no remote push or master/main merge.

## Phase 2 handoff

Phase 2: implementation complete, unverified; rebuild/phase-2-direction ? main_new.
Changed: lib/direction schedule/types/storage/store/operations/navigation, lib/life defaults; Today/TimelineRow/DayBar/DayNav, Coverage return, WeekGrid/BlockEditor, clock/store hooks, mode CSS, Today page, Calendar import/comment updates; obsolete hierarchy and FocusEditor removed; CONTRACTS updated.
Checks: implementation dependency searches and installed Next.js guide reads only; builds, tests, code review, and browser walkthrough not performed. No remote push or master/main merge.
Open: header/card fit, date boundaries, return scroll/focus, persistence failures, cross-tab updates, and basic Week interactions unverified in browser; Calendar overnight filtering remains Phase 4.
Next: start phase 3 in a fresh chat; extend the existing per-day grid and BlockEditor with name/time/add/remove/copy controls. Keep build/test/review permission separate.
Decisions: reference week is Monday?Saturday with Sunday work gaps; local day starts at 07:00. Missing/invalid v2 loads fresh defaults, never migrates v1; successful v2 storage removes only the old plan key. Formatting/ruler signatures retained; operationalMinute added for shared time positioning.
