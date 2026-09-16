# Phase 2 — Schedule and Today Implementation Plan

**Goal:** Make Today use the accepted effort blocks and replace the old business-assignment schedule everywhere it is consumed.
**Architecture:** New seven-day block data, browser-local clock, existing external store and timeline components; basic Week editing stays coherent with the same model.
**Tech stack:** Existing TypeScript, React, Next.js, Tailwind, localStorage.
**Spec:** ../APP_SOURCE_OF_TRUTH.md. **Branch:** rebuild/phase-2-direction → main_new.

## Start and inputs

Trigger: `start phase 2`. Read AGENTS.md, the source of truth, STATUS.md, master plan, CONTRACTS.md, accepted HTML, and Phase 1's recorded files/commit. Phase 1 must be complete and integrated. Resume this branch if in progress.

Use interface-design, ui-ux-pro-max, and vercel-react-best-practices. Read installed Next.js Link and navigation guides before edits. Builds, tests, and code review require explicit permission for this phase; none is inherited.

## Files

- Replace/adapt lib/direction/types.ts, schedule.ts, block-types.ts, storage.ts, plan-store.ts, plan-ops.ts.
- Replace lib/life/life.ts with the default week and lib/life/index.ts with schedule-only exports.
- Delete lib/life/schema.ts, lib/life/areas/*, and lib/direction/nodes.ts once their consumers have been removed in this same phase. Delete only these obsolete named sources, not unrelated life/time data.
- Adapt components/Direction/TodayView.tsx, TimelineRow.tsx, DayBar.tsx, DayNav.tsx, useNow.ts, useDirectionPlan.ts.
- Adapt WeekView.tsx, WeekGrid.tsx, and FocusEditor.tsx to the basic new-mode editor; rename FocusEditor.tsx to BlockEditor.tsx and update its imports. Reuse Popover.tsx.
- Adapt CoverageView.tsx for return context; create lib/direction/navigation.ts only for the scoped return behaviour.
- Adapt EventsLane.tsx only as needed to consume the new DayEntry and maintain the overlay. Full overnight event handling is Phase 4.
- Update app/globals.css and ui.ts only for existing-mode styling and generic card guides. Update STATUS.md.

## Tasks

- [ ] Implement the Phase 2 types/functions in CONTRACTS.md. Remove assignments, serves, task notes, overrides, and the tree/schedule join from all live consumers. Preserve no legacy compatibility schema.
- [ ] Seed Monday–Saturday from the exact reference day; seed Sunday's protected blocks with open work periods unless the user has corrected that planning default. No business labels or make-work tasks. Copy arrays per day so one edit cannot mutate another day.
- [ ] Replace storage with the v2 key, validation, and deliberate reset rules in CONTRACTS.md. Preserve Calendar and other unrelated keys. Keep stable store snapshots and cross-tab updates. Surface save failures in Week without discarding in-memory changes. Reset reads fresh defaults rather than mutating shared constants.
- [ ] Implement operational dates and schedule resolution. Before 07:00, Today belongs to the preceding date; at 07:00 it switches. Selected dates are not shifted twice. Handle midnight, exact boundaries, open intervals, empty days, next block, and remaining time. Keep existing formatting/ruler helpers where applicable and remove business-derived day themes.
- [ ] Adapt the existing timeline, not a copied HTML page: current green card, quiet past/future, next label, generic name/guide, time ruler, current-block rail progress, and Now control. Remove in-card ranges, area/task text, link arrows, and fixed business assignments. Preserve `[data-timeline-box]` for Calendar. Short guides wrap naturally without truncation or increased default card sizes.
- [ ] Update DayBar within its existing footprint: weekday/date, clock, and Now share a row; show the two fixed goal columns and `Work: advance a goal or tackle its blocker.` exactly as specified. Remove the standalone weekday row and whole-day progress bar, including unused props/calculations if no other consumer needs them. Keep current-block progress. No goal inputs, model, live results, or progress tracking. Preserve usable date navigation without reintroducing header bulk.
- [ ] Implement the new work-card URL and return behaviour from CONTRACTS.md. Coverage receives effort only, across all areas. Restore date/scroll/focus on return; direct entry has a safe Today fallback. Browser Back remains useful.
- [ ] Replace Week's old area selector in the same phase. Render a compact week using the existing grid styling, with each day's blocks independent. Basic BlockEditor supports changing a block's mode through setBlockMode; hide/remove old business controls. This phase's Week must read/write the new model correctly; full time/add/remove/copy editing comes in Phase 3.
- [ ] Update or remove every import of deleted schema/nodes/assignment helpers. Ordinary source searches to complete implementation are allowed; do not turn this into an unsolicited code review. Remove stale links/comments for old docs when touching their owners.
- [ ] Make one compact STATUS entry: data-reset decision, changed files, actual/omitted checks, open issues, next phase. Include it in the phase commit, merge to main_new, and stop; no additional handoff-only commit.

## Manual walkthrough scenarios

- At 14:00–15:30 the block is Light work; at 15:30 it changes to Production and opens a different effort filter.
- Header shows the exact goal reminders and work-only line without a larger top box, clipping, or an implication of achieved results. Current-block progress remains; the whole-day header bar does not.
- At 06:59 the preceding day's Sleep is current; 07:00 starts the next day's Morning routine.
- Return from Coverage restores where you were; a direct Coverage visit cannot send you to an external URL.
- Reload uses v2 data. A deliberately old v1 plan is not revived; Calendar connection/cache is not cleared.
- Editing one weekday's mode changes its Today view, not other days. Sunday work windows are open.
- Existing calendar events still render and Time/Upgrades routes still resolve, subject to the recorded feature decision.

If clock simulation/browser access is unavailable, record the unperformed scenarios. Do not invent a screenshot, test result, or user acceptance.

## Deliverable and stop

Today and basic Week share the new model and old scheduling data/code has been removed. Coverage click-through uses the new effort contract. Full Week controls remain Phase 3; Calendar's operational-boundary improvements remain Phase 4. Merge to main_new and stop.
