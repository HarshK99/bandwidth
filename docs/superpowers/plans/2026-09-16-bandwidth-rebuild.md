# Bandwidth Rebuild Implementation Plan

**Goal:** Adapt the existing app to the accepted current-block and compact activity-menu design.

**Architecture:** Reuse the existing React components and visual tokens. Separate the reusable activity catalogue from the editable week schedule, replace business assignments with effort-based blocks, and retain client-side storage without legacy compatibility.

**Tech stack:** Existing Next.js 16.3, React 19, TypeScript, Tailwind 4. No new backend or UI framework.

**Spec:** [APP_SOURCE_OF_TRUTH.md](../../APP_SOURCE_OF_TRUTH.md).

**Execution:** One phase per new chat, executed inline. The user's phase workflow and test/review restrictions override the writing-plans skill's generic subagent, test-first, and execution-handoff instructions. No unavailable sub-skill is required.

## Global constraints

- Reuse and adapt TodayView, TimelineRow, DayBar, DayNav, WeekView, WeekGrid, CoverageView, Popover, AppTabs, and existing styles. Create a new helper/component only when it has a distinct responsibility.
- Preserve the accepted HTML appearance. Do not replace the design system or invent a new visual direction.
- Blocks name effort, never the current business or task. No journal, goal management, completion tracking, evidence, or gap accounting. The approved header shows two fixed goal reminders only; no tracking/model is added.
- Destructive replacement of old app data and redundant code/docs is authorized. Delete only named app-owned storage keys, never localStorage.clear().
- main_new is the integration branch for this version. Every phase branches from it and merges back into it. No remote pushes and no changes or merges to master/main without a separate explicit user instruction.
- No builds, tests, or code review without explicit authorization for the current phase. Starting a phase, including Phase 5, does not authorize them. No blanket permission carries between phases.
- The user intends to request npm test, npm run build, equivalent checks, or code review at the end. Do not run them pre-emptively or repeatedly ask during implementation.
- Manual browser walkthroughs are distinct from test commands. Each phase lists useful walkthroughs; record performed versus omitted honestly.
- Read the relevant local Next.js guides before implementation. Do not rely on old framework assumptions.

## Start protocol: “start phase N”

Read AGENTS.md, APP_SOURCE_OF_TRUTH.md, STATUS.md, this master plan, CONTRACTS.md, the matching phase file, and the accepted HTML. Read the recorded prior phase outputs and commits from STATUS.md. Execute only that phase.

Phases are numbered **1–5**. There is no Phase 0. An undefined phase requires one focused clarification; never remap it.

If the requested phase is already complete, report its recorded result rather than redoing it. If a predecessor is incomplete, do not skip it or invent completion. If the phase is in progress, resume its existing branch and handoff. Keep the original specification available even when source code changes.

## Phase map

| Phase | Deliverable | Branch | Instructions |
| --- | --- | --- | --- |
| 1 | New work modes and compact Coverage, independent of the old schedule | rebuild/phase-1-coverage | [Phase 1](../../phases/phase-1-coverage.md) |
| 2 | New schedule data, updated Today timeline, and a coherent basic Week view | rebuild/phase-2-direction | [Phase 2](../../phases/phase-2-direction.md) |
| 3 | Editable weekly day shapes using the existing grid and popover | rebuild/phase-3-week | [Phase 3](../../phases/phase-3-week.md) |
| 4 | Calendar integration, navigation, visual/accessibility polish, obsolete-code cleanup | rebuild/phase-4-integration | [Phase 4](../../phases/phase-4-integration.md) |
| 5 | Manual end-to-end walkthrough, necessary fixes, final handoff | rebuild/phase-5-walkthrough | [Phase 5](../../phases/phase-5-walkthrough.md) |

Phase 1 intentionally changes Coverage first while Today/Week still use the old schedule. Phase 2 replaces all consumers of the old schedule together so main_new is not left with broken imports or an editor writing the wrong format. Phase 3 extends the basic editor rather than maintaining competing schedule formats.

## Planning defaults pending user preference

Two questions were presented during planning. Unless the user replies otherwise, use these explicit defaults; do not describe them as user-approved answers:

- Keep Calendar, Time, and Upgrades. Preserve their existing purpose and data. Adapt Calendar's timeline boundary handling where required, without redesigning its connection UI.
- Seed the reference workday Monday–Saturday. Sunday keeps Morning routine, Lunch, Break, Dinner and downtime, Exercise, Wind-down, and Sleep at their reference times; the work periods are genuinely open. Do not create Sunday work obligations. The weekly editor makes this adjustable.

Other implementation defaults: a recurring editable seven-day template, independent day shapes, no dated task/planning history, browser-local timezone as in the existing app, and a 07:00 operational-day boundary. Thus the user's India browser agrees with the HTML; travel follows the device timezone. No timezone picker or calendar-week history is added.

If a pending answer changes these defaults, update the source of truth, CONTRACTS.md, matching phase, and STATUS.md before dependent implementation. This is not a reason to stop unrelated work.

## Shared contracts and boundaries

[CONTRACTS.md](../../phases/CONTRACTS.md) defines the filenames, types, functions, URL parameters, storage key, and error rules that phases share. Phase implementers must update contracts when a necessary implementation decision changes an interface, then record downstream implications. Do not introduce temporary compatibility types merely to retain obsolete business assignments.

The app activity map is copied exactly from APP_SOURCE_OF_TRUTH.md, not scraped at runtime from the HTML. The HTML remains a visual reference, not application source.

## Branch and completion protocol

At phase start, inspect git status and current branch. Preserve unrelated user changes. From a clean main_new, create the phase branch; if it exists with recorded progress, resume it. Never use reset --hard, blanket cleaning, or force branch recreation to get a clean workspace.

At phase end:

1. Complete only the phase's implementation and authorized checks.
2. Update the phase row and one compact STATUS.md entry: completion, changed files/areas, actual/omitted checks, open issues, next phase. Add only decisions needed by the next chat. Do not rewrite full history or unchanged requirements.
3. Include that entry in the phase's implementation commit. No separate handoff-only commit or second commit just to write its own hash. Git history records the relationship to main_new; include a hash in the short final message only when useful.
4. Switch to main_new and merge the phase branch. Prefer a fast-forward when possible. If main_new has advanced, resolve ordinary conflicts within the agreed scope; do not overwrite unrelated work or perform an unrequested code review.
5. Record any unresolved validation as such. Implementation phases can merge with tests explicitly not run; do not call that verified. Phase 5 requires its walkthrough outcome or an honest pending handoff.
6. Stop on main_new. Do not start the next phase, push remotely, or merge to master/main.

The user has authorized merges into main_new; no repeated merge permission question is needed. Publication or a main-branch merge is a separate action, not part of any phase here.

Compact handoff format (use actual outcomes):

```text
Phase N: complete; branch rebuild/phase-N-name → main_new
Changed: affected files or concise file groups
Checks: actual observations; builds/tests/review not run unless authorized
Open: none, or the specific unresolved issue
Next: start phase N+1
```

Add a Decisions line only when necessary for the next phase. On interruption, use In progress with an exact resume point. Never mark required work complete just to keep the handoff short. After the merge, give a short completion/next-phase response and stop; no repeated document rewriting or long reports.

## Skills

- interface-design: reuse the existing design, density, hierarchy, and components.
- ui-ux-pro-max: targeted searches for keyboard navigation, compact controls, wrapping, and responsive behaviour. Do not generate an unrelated new design system.
- vercel-react-best-practices: client storage, rendering, and navigation guidance when editing React.
- writing-plans: used for these plans; the user's phase and verification restrictions govern execution.

Announce a skill the first time it is used in each fresh chat and explain its purpose in one line. Read its SKILL.md from the available skill catalogue. If a skill mentions tests or reviews, the user's restrictions still apply.

## Plan coverage

Activity data, effort filtering, nested hobbies, compact Coverage: Phase 1. Schedule reset, current-time semantics, generic cards, fixed goal header, click-through and return: Phase 2. Week changes and open Sunday: Phases 2–3. Preserved surfaces, Calendar, compact responsive UI/header fit, cleanup: Phase 4. Full user journey and limitations: Phase 5. Compact status and main_new integration: every phase.

No implementation phase has started as part of writing this plan.
