# Data model

Everything lives in `lib/life/`. Two tables, one document, one join.

| | Answers | Where |
| --- | --- | --- |
| The tree | *What the work is, and why it matters* | `areas/*.ts` |
| The day | *What shape my day has* | `life.ts` → `DAY` |
| The week | *Which day goes where* | `life.ts` → `WEEK` |

The tree and the week are **linked, not merged**. Neither can be derived from
the other, and the reason is sharp:

- **Coverage needs nodes the week never mentions.** A gap *is* a node with no
  slot. Derive the tree from the week and gaps become unrepresentable — the
  view loses its only job.
- **Today needs slots the tree never mentions.** An empty Friday 3:30 is a
  real fact. Hang slots off the tree and the day's shape exists nowhere.

They're many-to-many in both directions besides: one area takes several slots
across a week, one slot serves different areas on different days.

## Authored nested, queried flat

The files under `areas/` nest; `flatten()` derives the flat `parentId` array
at import. Nesting is the better way to *write* a tree — you can't typo a
parent you never write, and indentation shows the shape — while a flat array
is the better way to *walk* one, which is what every view does.

**The key names the kind.** A node has `children` (sub-areas), or `stages`
(the phases its work moves through), or `tasks` (leaves) — never two. That is
the "stages, not categories" rule made unrepresentable rather than merely
documented. There is no `level` field and no fixed depth: Build runs four
deep, Sustain three, and adding a layer to one branch needs no code change.

```ts
// lib/life/areas/income.ts
export const income = {
  id: "income", label: "Income Work",
  children: [
    { id: "web", label: "Websites", stages: [
      { id: "pipeline", label: "Pipeline",
        about: "Finding and approaching work. Fed by Aftercare — the loop closes here.",
        tasks: {
          outreach: "Cold outreach to prospects",
          followup: "Follow up on existing leads",
        } },
    ]},
  ],
} as const satisfies Area;
```

Ids are derived by path: the area keeps its bare id, a stage is scoped to its
area, a task to its stage — `web`, `web.pipeline`, `web.pipeline.outreach`.
Areas must be globally unique; `validate()` enforces it.

## Typed references

`AreaIds` walks the const literals and produces a union of every id in the
tree, so `node: "web.pipelne"` is a **compile error** rather than a slot that
silently books zero hours. That failure mode is not hypothetical — it is how
Relationships and Financial Health once showed zero hours while occupying
four.

`validate()` covers what the type system can't reach — duplicate ids, unknown
parents, a `do:` naming a task that isn't under its node — and runs once at
import, so a broken reference fails at startup rather than months later.

## The day and the week

```ts
DAY = [
  { id: "blk-prep", label: "Deep Study", start: "08:00", end: "09:30", type: "focus", days: "mon-fri" },
]

WEEK = {
  "blk-prep": { all: { node: "career.prep", do: ["technical"] } },
  "blk-push": {
    "mon": { node: "web.pipeline", do: ["outreach", "followup"] },
    "tue thu": "wave.outreach",
    "fri": { label: "Catch-up" },
  },
}
```

- **Start and end are both explicit.** The day is usually contiguous, but a
  real gap is a real thing to be able to say — Deep Study is weekdays only, so
  weekends genuinely have nothing between 08:00 and 09:30.
- **Day specs** are `mon`, `mon wed`, `mon-fri`, `weekends`, or `all`. `all`
  means every day *the block runs*, so Deep Study needs one line rather than five
  identical ones.
- **A bare string** is shorthand for `{ node }`, which is most cells.
- **`do`** names the node's own tasks instead of retyping them as prose. It
  replaced a `meta` field that carried the schedule in prose on 41 tasks
  ("Second push (Mon/Wed)") — a second, unchecked copy pointing the opposite
  direction.
- **`note`** overrides both, for days where what you're doing is more specific
  than any standing task.

`buildBlocks`/`buildWeek` compile these into the `TimeBlock[]` and
`WeekAssignment[]` in `lib/direction/types.ts`, which is what the app and
localStorage actually hold. The authoring format is a front end to that, not
a parallel model.

## Where the model is thin

- **Single parent.** Content is one skill serving several goals, so `serves`
  on a slot records where its output is aimed. An escape hatch — a second
  edge, not a second tree. Two or three is a useful annotation; twenty means
  the tree is wrong.
- **Blocks are global in time, not in days.** `days` says which weekdays a
  block runs; its *hours* are the same every day it runs. A Saturday that
  starts later has no expression yet.
- **The plan is versioned, the tree isn't.** `version` drives a migration
  ladder in `storage.ts` (v1 → v2 renamed every node id). The tree ships with
  the build and is never written back to, so it needs no equivalent.
- **Times are strings.** `"HH:MM"`, 24h, local; `end <= start` wraps past
  midnight. All arithmetic goes through `lib/direction/schedule.ts`.
