# Plan: Goals

**Status: parked — not built.** This is a design doc to react to, not a
description of shipped code.

## The gap

The tree says what the work *is*. The schedule says *when*. Neither says
*for what end*. Hours can be fully accounted for and still not be working —
nothing in the app today can tell the difference.

## What a goal must not be

This app has been deliberately unlike a task manager: no completion, no
priorities, no journaling, no status tracking. "Goals" is exactly the kind
of feature that drifts into an OKR dashboard if built carelessly. Guardrails,
stated going in:

- **No progress tracking.** No percentage, no "on track / behind," no update
  log. A goal names a destination; the app never stores or computes where
  you currently stand against it. That distinction is deliberate — a
  `target` is just a precisely-written aspiration, the moment a `current`
  field exists alongside it the app is computing a comparison, which is a
  progress bar in a different shape.
- **No completion state.** A goal that's met or abandoned gets edited or
  deleted, the same as everything else here — not checked off. State is
  current truth, not a history.
- **Optional, not universal.** Most Sustain areas (Health, Relationships)
  won't have one — their `about:` text already says why they matter. A goal
  is for when "why this matters" needs a number or a date attached, not a
  mandatory field on every node.
- **Shown quietly.** An annotation, not a dashboard.

## Data

```ts
// lib/direction/types.ts
export interface Goal {
  id: string;
  nodeIds: string[];       // usually one area; can span a few
  label: string;           // "Active users", "Land an offer", "MRR"
  target?: { value: number; unit?: string };  // omitted for non-numeric goals
  by?: string;              // ISO date, optional — some goals are ongoing
}

export interface DirectionPlan {
  version: number;
  blocks: TimeBlock[];
  assignments: WeekAssignment[];
  overrides: DateOverride[];
  goals: Goal[];            // new
}
```

Examples the shape needs to hold:

| Node | label | target | by |
|---|---|---|---|
| Wave | "Active users" | `{ value: 50, unit: "users" }` | 2026-06-30 |
| Career Options | "Land an offer" | — | 2026-06-30 |
| Digital Products | "First sales" | `{ value: 500, unit: "$" }` | — |
| Websites | "Steady, keeps the lights on" | — | — |

`label` is always the human statement — it works for every goal, numeric or
not. `target` is an optional structured add-on for goals that have a clean
number, mainly so it renders consistently rather than being parsed out of
prose. `by` is optional because not every goal has — or needs — a deadline.

## Why a separate table, not a field on the tree

The tree is meant to be stable — it ships with the build and is never
written back to (see `docs/DATA_MODEL.md`). A goal is the opposite: a Q2
target that's stale by Q3, edited from the UI, not from a code file. Bolting
a mutable, time-bound thing onto the structural layer would repeat the exact
mistake merging the tree and the schedule would have been.

A goal is a third concern — *why* — sitting alongside *what* (the tree) and
*when* (the schedule), joined by the same node ids, stored where the
schedule already lives: the plan, in localStorage, editable in the UI.
`PLAN_VERSION` → 3, with a migration step defaulting `goals: []` on any
older stored plan (the same shape the v1→v2 step already took).

`plan-ops.ts` gets `addGoal` / `updateGoal` / `removeGoal` — pure functions
returning a new plan, same pattern as every other mutation there.

## How `serves` and a goal differ

They look similar and aren't. `serves` is about a single *slot's*
attribution — this Thursday's script is scripted under Personal Brand but
markets Wave. A goal is about a *branch's* purpose — Wave's whole existence
is aimed at 50 users. One is per-session accounting across a single parent
tree; the other is a standing statement of intent. Both are real, and
neither substitutes for the other.

## Where goals surface

- **Coverage** — a quiet second line under any row whose id is in a goal's
  `nodeIds`: label, target if present, date if present. Coverage already
  asks "does this have a place"; this answers the next question right where
  you're looking — "and does it have a point."
- **Hours** — the same annotation, next to the hours total, pairing effort
  with intent.
- **A new Goals view** — `/direction/goals`, added to `DirectionNav` between
  Week and Hours: **Today · Week · Goals · Hours · Settings** (aim, then the
  reality-check of where the hours actually went). A flat list, nearest `by`
  date first, undated goals last. A goal whose date has passed gets a quiet
  visual flag — muted, not hidden, not auto-removed, the same spirit as the
  existing "Override" tag: a fact noted, not an action forced.

Today and Week don't get goal annotations — they're moment-to-moment ("what
block, what's next"); a goal is a periodic-review concern, not a live one.

## Editing

Same inline pattern as the rest of the app — no dialog, no save button. A
node picker reusing the existing area picker (`getAreaOptions()`, same as
Week's `FocusEditor`), plain fields for label / target / date. Lives on the
new Goals view itself, not buried in Settings.

## Explicitly not building

- Progress computation of any kind.
- A count like "3 of 10 goals hit."
- A history of past or abandoned goals.
- A required goal on every node.
