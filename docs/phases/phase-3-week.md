# Phase 3 — Week Editing Implementation Plan

**Goal:** Let the founder adjust each day's blocks without assigning a business or maintaining task history.
**Architecture:** Extend the basic Phase 2 Week grid/editor and pure plan mutations. Keep a recurring seven-day template, no separate dated planner.
**Tech stack:** Existing React, TypeScript, Popover, localStorage.
**Spec:** ../APP_SOURCE_OF_TRUTH.md. **Branch:** rebuild/phase-3-week → main_new.

## Start and inputs

Trigger: `start phase 3`. Read AGENTS.md, source of truth, STATUS.md, master plan, CONTRACTS.md, HTML, and Phase 2's recorded model/editor decisions. Phase 2 must be integrated. Resume recorded work rather than recreating the editor.

Use interface-design for existing patterns, ui-ux-pro-max for compact accessible forms, vercel-react-best-practices for state handling. Read the local Next.js guide relevant to changed route/client code. No automatic builds, tests, or code review.

## Files

- Extend lib/direction/plan-ops.ts with upsertBlock, removeBlock, copyDay, validateDay.
- Adapt components/Direction/WeekView.tsx, WeekGrid.tsx, BlockEditor.tsx, Popover.tsx, ui.ts.
- Adapt useDirectionPlan.ts and plan-store.ts only if needed for explicit save-failure state.
- Update STATUS.md. Reuse Phase 2's model/storage; do not create a second plan format.

## Tasks

- [ ] Complete all Phase 3 mutation contracts. Validate before writing; return precise PlanIssue values. Keep valid block IDs stable and copy arrays independently. Removing a block leaves open time, not an invented replacement.
- [ ] Extend the existing BlockEditor with name, start, end, and mode fields. Use existing field/button/popover styling. No area, task, target, notes, or done controls. Keep draft changes local until Save. Cancel/escape discards the draft and returns focus to the trigger.
- [ ] Reject empty name, malformed HH:MM, duplicate IDs, zero duration, overlaps, and blocks crossing the 07:00 boundary. Permit midnight crossings within an operational day. Show the error beside its field; preserve typed values so the user can fix them.
- [ ] Add compact Add block and Remove controls, with the destination day clear. Preserve chronological ordering after saves. Do not require a drag-and-drop system; editing times is sufficient.
- [ ] Add Copy day with explicit source and destination. Explain in the product confirmation that the destination day's blocks will be replaced. Do not touch other days or any Calendar events.
- [ ] Make Week usable on mobile through a selected-day view while retaining the existing desktop week comparison. Reuse the same BlockEditor and mutation functions in both. Avoid horizontal page overflow or separate mobile data.
- [ ] Make the recurring nature explicit with one short label such as Weekly template. Editing Wednesday affects future Wednesdays, not a history record. Keep the existing reset-to-defaults action if present; name its scope clearly and confirm replacement of the whole template.
- [ ] Ensure save failures are visible and in-memory edits remain accessible. Do not silently claim persistence. Document the exact fields and behaviours in STATUS, commit, merge, and stop.

## Manual walkthrough scenarios

- Change only Tuesday's Production time and inspect Tuesday Today; Wednesday is unchanged.
- Add/remove a block and confirm actual open time in Today.
- Save a midnight-crossing Sleep block ending 07:00; reject one crossing the next 07:00 boundary.
- Try overlapping blocks, blank name, invalid time, and zero duration; the editor keeps the invalid draft and explains the issue.
- Copy a day, cancel once, then confirm; only the named destination changes.
- Keyboard users can reach every control and return from the popover. Mobile can edit a selected day without a seven-column overflow.
- Reload preserves valid changes when storage is available; storage failure is not shown as saved.

No command-based checks without explicit current-phase authorization. Record unavailable walkthroughs.

## Deliverable and stop

The new weekly template is editable through reused components, with no business/task assignment UI. Update STATUS and merge to main_new. Stop before integration/polish.
