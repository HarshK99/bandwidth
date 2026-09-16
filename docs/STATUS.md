# Bandwidth rebuild — status and handoff

## Current state

The user likes the current HTML and authorized recording it as the app's source of truth. This remains the specification stage. Application code and stored app data have not been replaced yet.

New-chat reading order:

1. AGENTS.md and the user's project instructions.
2. [APP_SOURCE_OF_TRUTH.md](APP_SOURCE_OF_TRUTH.md).
3. This document.
4. [Accepted HTML](proposals/today-final-view.html).
5. [Founder document update prompts](FOUNDER_SYSTEM_UPDATE_PROMPTS.md) and the original operating system when relevant.

## Branches and authorization

- master: existing app/main branch. No merge or push unless the user explicitly asks.
- main_new: rebuild integration branch created from master.
- proposal/direction-coverage: current working branch, created from main_new. The preview and specification live here; they are not yet integrated into main_new.
- Future implementation changes branch from main_new after bringing the specification into it through the planned workflow. Do not start from a baseline missing these documents.
- User explicitly permits destructive replacement of outdated app docs and old app data on rebuild branches. Do not preserve redundant data or backward compatibility by default.
- No remote push or main-branch merge is authorized or performed.
- Current work is documentation and cleanup. Application code/data replacement belongs to forthcoming implementation phases.

## Recorded decisions

- Bandwidth is a current-block tool, not the whole founder operating system.
- Direction keeps the timeline and shows effort, not the current business or task.
- Modes: Deep work, Production, Light work; Recovery stays protected.
- Generic card guides: Think · Solve · Decide · Discuss; Build · Write · Edit · Refine; Research · Post · Follow up · Admin.
- Coverage opens across all areas filtered by effort, using compact controls and collapsed branches.
- The task map is genuinely trimmed, including concrete hobbies, relationship, and life-admin choices.
- Targets, bottlenecks, journals, completion, and results/evidence tracking are outside the app.
- The original founder system remains separate. Prompts let the user update it independently.

## Files and cleanup

- Created APP_SOURCE_OF_TRUTH.md and FOUNDER_SYSTEM_UPDATE_PROMPTS.md.
- Replaced the chronological proposal handoff with this current status.
- Rewrote README.md to point to the new specification and identify the rebuild as pending.
- Removed obsolete PRD, DIRECTION, DATA_MODEL, PLAN_BLOCK_LINKS, PLAN_GOALS, PLAN_SCHEDULE, CALENDAR, and UPGRADES docs. Historical content remains in Git, not as rebuild requirements. Removing their docs does not itself decide the fate of Calendar, Time, or Upgrades features.
- Removed the superseded direction-coverage.html prototype. today-final-view.html is the sole retained HTML reference.
- Original founder_operating_system_latest.md was untracked at task start and remains unmodified. No source content was overwritten.

## Checks and omissions

- Read the original system document, current HTML and task data, previous handoff, README, and old documentation inventory.
- No build commands, test commands, or code review authorized or performed.
- Browser appearance/behaviour has not been verified with browser tooling. The user viewed and iteratively approved the HTML; that is not an automated check.
- No application implementation, browser-data reset, deployment, or main-branch change performed.

## Open choices for phased planning

- Full Week editor behaviour and seven-day defaults; do not repeat the reference workday on all seven days by assumption.
- Final timezone/day-boundary handling beyond the India-time preview.
- Keep/change/remove decisions for Calendar, Time, and Upgrades. Prototype placeholders do not decide these.
- Replacement data model and storage/reset strategy. Destructive replacement of old app data is authorized; compatibility is not a requirement.
- Implementation boundaries and integration order into main_new, without a main-branch merge or push.
- Explicit build/test/code-review authorization for each applicable task or phase; none exists yet.

## Next starting point and stopping point

Next: create the phased implementation plan from the new source of truth. One new chat per phase; each phase needs instructions, required inputs, deliverables, a stopping point, and updates to this shared status. No phase numbering exists yet; do not invent Phase 0 or declare a phase started before defining the plan.

This task stops after documentation and cleanup. No phased plan or app implementation has been created or executed yet.
