# Data model

Two files, one join.

| File | Answers | Shape |
| --- | --- | --- |
| `lib/hierarchy-data.ts` | *What the work is, and why it matters* | one flat array, `parentId` tree |
| `lib/direction/default-plan.ts` | *When it happens* | blocks, assignments, overrides |

They are **linked, not merged**: an assignment carries a `nodeId` from the
hierarchy. `lib/direction/nodes.ts` is the only bridge — given an id it
returns the node, its ancestry, and its area.

```
WeekAssignment { day: 4, blockId: "blk-ctp", nodeId: "sub-web-scoping" }
                                              └── lib/hierarchy-data.ts
```

That join is what makes "which parts of the tree get no time?" a query
instead of a manual count. Free text made it impossible, and silently lost
hours: Relationships and Financial Health once read **zero** while occupying
four, because their area was carried as display text.

## The hierarchy

```ts
export interface HierarchyNode {
  id: string;
  label: string;
  level: "capacity" | "masterFunction" | "valueCategory" | "domain" | "subFunction" | "task";
  parentId: string | null;
  description?: string;
  meta?: string;
  temporary?: boolean;
  url?: string;
}
```

- **Flat array, not nested objects.** O(1) lookup by id, and editing a node
  never reshapes its ancestors — a single find-and-splice. It is also already
  a one-table schema (`id, label, level, parent_id, …`) if this ever moves to
  a database.
- **`level` names what a node is, not where it sits.** Branches are different
  depths: Build passes through `valueCategory`, Sustain skips it. Depth is
  always derived by walking `parentId`, never by counting levels — so adding
  or removing a layer in one branch needs no code change.
- **`temporary` is a flag, not a level.** Career Options' stages are
  structurally normal; what differs is that they're situational.

**A domain's children are stages, not categories** — the phases work moves
through. Websites is Pipeline → Scoping → Build → Payment → Aftercare (which
loops back via referrals); Career Options is Preparation → Applications →
Interviews → Offers. Categorical children ("Sales", "Business Operations")
collected tasks by topic, which let a stage quietly have no time while
nothing looked wrong.

## The plan

```ts
DirectionPlan  { version, blocks, assignments, overrides }
TimeBlock      { id, name, start, end, type, order, days? }
WeekAssignment { day, blockId, nodeId?, serves?, note?, label? }
DateOverride   { date, blockId, nodeId }
```

Three flat arrays and **no task entity** — tasks live in Apple Notes. The
plan stores the shape of a week, nothing that can be completed or checked
off. See [DIRECTION.md](./DIRECTION.md) for what each field means and how
resolution works.

## Why not merge them

A hierarchy node is a **thing that matters**; a block is a **recurring hour**.
The cardinality is many-to-many in both directions — one node takes several
slots across the week, one slot serves different nodes on different days —
so neither can own the other without duplicating it.

Merged, every schedule edit would touch the tree, and shifting dinner by
thirty minutes would be a write against the file that defines what your life
is for. Joined by id, the two change on their own clocks and still reconcile:
that reconciliation is the Coverage and Hours views.

## Where the pairing is thin

- **Single parent.** Content is one skill serving several goals, so a
  `serves` id on the assignment records where a slot's output is aimed. It is
  an escape hatch — a second edge, not a second tree. Two or three of these
  is a useful annotation; twenty means the tree is wrong.
- **Blocks are global in time, not in days.** `days` says which weekdays a
  block runs on, so Prep can be weekdays-only — but its *hours* are the same
  every day it runs. A Saturday that starts later, rather than starting with a
  different block, still has no expression: that needs per-day times, which
  would mean either a block per day-shape or an override layer on top of one.
- **The plan is versioned, the hierarchy isn't.** `version` on the stored
  plan drives a migration ladder in `storage.ts`. The hierarchy needs no
  equivalent — it ships with the build, and is never written back to.
- **Times are strings.** `"HH:MM"`, 24h, local; `end <= start` means the
  block wraps past midnight. All arithmetic goes through
  `lib/direction/schedule.ts` — nothing else parses a time.
