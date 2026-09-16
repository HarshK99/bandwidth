# Bandwidth — app source of truth

Status: agreed direction for the rebuild. The existing application has not yet been updated to match it.

## Authority

This document defines the app and replaces the earlier product brief, data-model documentation, and feature plans. The accepted visual reference is [today-final-view.html](proposals/today-final-view.html). Use this document for behaviour and that HTML for appearance; record discrepancies before implementation.

The [founder operating system](../founder_operating_system_latest.md) provides the wider business strategy. Bandwidth is deliberately smaller. Do not convert everything in the business document into a feature, or silently override these app decisions when the business document changes.

Read [STATUS.md](STATUS.md) for actual progress, branches, open decisions, and the next starting point. This is a product specification, not a phased implementation plan.

## Purpose and boundaries

**Show what kind of block is happening now, then offer a small, reusable map of activities that fit it.**

The founder chooses the business and actual task from the current bottleneck outside the app. Direction provides the day's structure. Coverage provides possible activities. Neither chooses a business priority.

- A block shows Deep work, Production, Light work, or a protected activity. It does not assign Wave Link, freelance, or both.
- The app does not know the current task, customer, niche, client, or bottleneck.
- Reusable activities are not individual assignments: Positioning is valid; positioning a dental website offer is too specific.
- No target management, scoreboards, bottleneck records, experiment results, evidence logs, journal, weekly review forms, client pipeline, completion tracking, or productivity scoring. The only goal exception is the two fixed header reminders below: display copy, not tracked data.
- No daily logging is required to make the app useful.
- Coverage is a menu, not a checklist. Optional work receiving no scheduled hours is fine.

The wider strategy remains Wave Link first, reliable income protected, content supporting both, optional side projects/jobs, and protected recovery. Those priorities inform the human's choice; they do not mean every branch deserves a slot.

## Work modes and exact card wording

| Mode | Meaning | Card guide |
| --- | --- | --- |
| Deep work | Thinking, judgment, hard problem solving, or important conversations where better reasoning materially affects the outcome. | Think · Solve · Decide · Discuss |
| Production | Sustained making or improving when the approach is reasonably clear. | Build · Write · Edit · Refine |
| Light work | More straightforward work requiring less concentration and easier to pause and resume. | Research · Post · Follow up · Admin |
| Recovery | Replenishment, exercise, hobbies, and relationships. | No generic line required. |

Use Production rather than Execution: sales also involves execution. Use Light work rather than Low-energy work: describe the effort required, not how tired the person feels.

These are flexible modes. Building can become deep work when a difficult problem appears. Research, writing, and follow-ups can require judgment or routine handling. One activity can fit multiple modes without duplicate data.

The guide lines are generic and permanent; Discovery and Positioning can recur, but should not be prescribed on every deep-work card. The guide is not a promise that every verb is a separate task in every area. For example, Content writing currently appears under Deep work in the accepted map even though Production's broad guide includes Write. Change task memberships explicitly rather than inferring them from guide words.

Production is a refinement adopted during the app discussion. The original document distinguished high- and lower-energy work without defining this middle category.

## Direction / Today

Retain the existing timeline-based structure, not a separate dashboard.

- One compact row for weekday/date, clock, and Now (accessible label: Jump to the current block).
- Vertical time ruler and a continuous sequence of blocks. Real gaps should read as open time.
- Quiet past/future blocks, next-block indication, and one green current-block card.
- Current-block remaining time and the rail's subtle time progress. These measure passing time, not work completion. Remove the whole-day progress bar from the header.
- Block name as the main text, followed by the exact generic work-mode guide above.
- No business assignments, current task, repeated in-card time range, “Browse relevant tasks” line, or decorative link arrows.

Preserve card dimensions and readable text. Guide lines may wrap naturally; do not clip, truncate, hide words, or enlarge every block to fit explanatory prose. Browser fit has not been verified; the HTML's size calculations are a reference, not evidence that all viewports work.

Clicking a work card opens Coverage with its effort selected, All areas selected, and area branches collapsed. No automatic business filter. Returning to Today preserves the scroll position. Recovery cards may open Recovery activities; lunch and break cards need not open a list. Rest does not require choosing a task.

### Fixed goal reminder in the header

The latest HTML header is approved:

| Left column | Right column |
| --- | --- |
| Wave Link · +5%/week | Income · ≥₹60k/month |
| Active users | Reliable income |

Below the columns: **Work: advance a goal or tackle its blocker.**

These are standing reminders, not measured results. Do not imply growth was achieved, income was received, or the app knows a blocker. No inputs, progress calculations, goal storage, actual values, warning badges, or goal-management screens.

The line applies to work. Recovery, hobbies, and relationships remain protected rather than having to justify themselves against either number.

Fit within the existing top header footprint: combine weekday/date/clock/Now, remove the separate weekday row and whole-day progress bar, and use compact side-by-side goal columns. Keep the timeline and current-block progress. No extra card, unreadably small text, or clipped words. Browser height/fit remains to be checked during a manual walkthrough. The reminder does not assign a business to a block.

## Reference day

This is the current HTML's day shape. The phased plan uses it Monday–Saturday, with Sunday work windows open, as an explicit planning default pending the user's weekly-schedule preference.

| Time | Block |
| --- | --- |
| 07:00–08:00 | Morning routine |
| 08:00–11:00 | Deep work |
| 11:00–13:00 | Deep work |
| 13:00–14:00 | Lunch |
| 14:00–15:30 | Light work |
| 15:30–17:00 | Production |
| 17:00–18:00 | Break |
| 18:00–19:30 | Deep work |
| 19:30–21:00 | Dinner and downtime |
| 21:00–22:00 | Exercise |
| 22:00–00:00 | Wind-down |
| 00:00–07:00 | Sleep |

The source document calls 14:00–15:30 sleepier and 15:30–17:00 improving. Light work followed by Production is the agreed app interpretation, not a universal energy rule.

The preview uses Asia/Kolkata time and a 07:00-to-next-07:00 day. Before 07:00 it shows the preceding day's overnight block and marks the clock as next morning. The implementation plan uses browser-local time, preserving the existing app's timezone convention, and the same 07:00 boundary. Week edits a recurring seven-day template with independent day shapes, not dated task history. These implementation defaults remain subject to the user's corrections.

Do not repeat this schedule indefinitely or across all seven days by assumption. The wider system protects at least seven hours of sleep, exercise, meals, downtime, and no serious work after the gym. Its working capacity is a ceiling, not a quota; spare capacity does not need filling.

## Coverage interface

One compact toolbar and one compact nested list, following the existing app's visual structure.

- Toolbar: back to Today, Coverage label, area dropdown, effort dropdown.
- No large introduction, extra title, explanatory paragraphs, separate widen buttons, or dashboard decorations.
- Area choices: All areas and the six areas below.
- Effort choices: All efforts, Deep work, Light work, Production, Recovery.
- Filters are independent. All-area browsing starts collapsed even when effort is filtered.
- Selecting one area opens that area; nested groups remain expandable.
- Show matching activities and their ancestors. Do not show an empty branch when none of its descendants match.
- Compact task rows and shallow nesting; no separate card around each task.
- Show effort labels under All efforts; omit repetitive labels when effort is already filtered.
- An empty result should offer changing filters, not invent work.
- No hours-based gap warnings, missing-time badges, or pressure to cover every branch.

## Activity map

These labels and memberships match the accepted HTML. Broad steps have been combined deliberately. Do not expand them back into an exhaustive procedural checklist.

### Wave Link

| Activity | Suitable effort |
| --- | --- |
| Customer discovery | Deep work |
| Positioning | Deep work |
| Lead research | Light work |
| Outreach | Deep work / Light work |
| Review usage and user feedback | Deep work / Light work |
| Decide product changes | Deep work |
| Product development | Deep work / Production |

### Freelance

| Activity | Suitable effort |
| --- | --- |
| Market and customer discovery | Deep work |
| Positioning and offer | Deep work |
| Lead research | Light work |
| Outreach | Deep work / Light work |
| Sales | Deep work |
| Scoping and proposals | Deep work |
| Website production | Deep work / Production |
| Invoice and follow up on payments | Light work |
| Check in with clients and ask for referrals | Deep work / Light work |

### Content

| Activity | Suitable effort |
| --- | --- |
| Content writing | Deep work |
| Recording and editing | Production |
| Publishing and engagement | Light work |

### Side projects

| Activity | Suitable effort |
| --- | --- |
| Explore and test an idea | Deep work / Production |

### Jobs

| Activity | Suitable effort |
| --- | --- |
| Find and apply for suitable roles | Light work |
| Prepare for or attend interviews | Deep work |

### Recovery and life

| Group | Activity | Suitable effort |
| --- | --- | --- |
| Directly under Recovery and life | Exercise | Recovery |
| Hobbies | Painting | Recovery |
| Hobbies | Crossword | Recovery |
| Hobbies | Language | Recovery |
| Family and friends | Call | Recovery |
| Family and friends | Meet | Recovery |
| Life admin and finances | Pay bills and review finances | Light work |
| Life admin and finances | Run errands | Light work |

Sleep, meals, breaks, and wind-down remain timeline blocks rather than redundant Coverage tasks. There is no Physical recovery wrapper around Exercise alone.

There is no standalone Tools and learning branch. Improve tooling or learn something when the actual work needs it; do not give tool improvement a permanent claim on deep-work time.

## Data concepts

These define meaning, not final storage or code:

- Work mode: identity, display name, optional generic guide.
- Time block: name, time range, effort or protected-time role. No required business or task assignment.
- Area/group: contains activities or other groups.
- Activity: reusable label and one or more suitable efforts.
- Filters: independent view choices, not changes to the schedule or strategy.

The user permits destructive replacement of outdated app data and documentation on rebuild branches. Replace obsolete models, assignments, links, and coverage calculations rather than preserving them solely for compatibility. This does not authorize deleting unrelated files or browser data belonging to other apps.

The preview's internal keys `execution` and `exploration` are leftovers, not required names for the new model. Do not add a backend, accounts, or elaborate storage merely because the model may change; those require a concrete reason during planning.

## Visual reference and other surfaces

Keep the restrained existing visual system: neutral backgrounds, subtle surfaces and borders, small structural tints, and green reserved for the current block. Compact readable type, keyboard support, and usable controls on small screens remain requirements.

The HTML uses a system-font fallback to remain standalone. That is not a request to remove the app's font.

Week, Calendar, Time, and Upgrades remain visible but disabled in the prototype because they were not prototyped. Never ship those disabled placeholders. The phased plan updates Week and retains Calendar, Time, and Upgrades as an explicit default pending the user's feature preference. Calendar's operational-day boundary may need adaptation; the retained surfaces are not being redesigned.

Reuse and adapt the existing components instead of building the UI from scratch; the user explicitly requested this when authorizing the phased plan.

## Delivery rules

- Work stays on rebuild branches; current state is recorded in STATUS.md.
- main_new is the integration/main branch for this new version. Phase branches split from it and merge back into it; the user explicitly authorized this workflow.
- No merge or push to the original master/main branch without the user's explicit instruction. No remote pushes or deployments are authorized by this plan.
- No build commands, test commands, or code review without explicit authorization for the current task/phase. Starting a phase does not grant it.
- The user intends to request builds/tests/code review at the end. Do not run npm test, npm run build, equivalents, or indirect checks without that explicit request, including in Phase 5.
- Phase handoffs are compact: one STATUS entry with completion, changed files/areas, actual checks, open issues, and next phase. Add only decisions needed to resume. Update once before the phase commit; no repeated history, separate handoff-only commit, or lengthy final recap.
- Read the relevant local Next.js guide before writing Next.js code, as AGENTS.md requires.
- Execute the [master plan](superpowers/plans/2026-09-16-bandwidth-rebuild.md), Phases 1–5, one fresh chat per phase. `start phase N` is sufficient; load the relevant instructions and prior outputs and stop after that phase. There is no Phase 0.
