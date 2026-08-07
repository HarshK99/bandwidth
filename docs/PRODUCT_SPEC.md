# Bandwidth — Product Spec

## What this is

A zoomable, drill-down mind-map of one person's life/work capacity. It is a
**decision-making tool**, not a dashboard: the point is to answer "what
should I work on right now" by narrowing down through a hierarchy, not to
display everything at once.

## The mental model that drives the UX

The intended usage session looks like this:

1. Open the app. See the root — **Total Capacity** — with its top-level
   split visible (**Build** vs **Sustain**).
2. Based on current energy/context, pick a branch — say **Build**.
3. The view zooms into Build and reveals its **Value Categories** (Income,
   Equity, Audience, Career Options) — Build's branch has this extra layer;
   Sustain doesn't (see "Hierarchy levels" below).
4. Pick a value category — say Income. Zoom again, reveal its **Domains**
   (currently just Income Work under Income; other categories have more).
5. Pick a domain — say Income Work. Zoom again, reveal its **Sub-Functions**
   (Sales/Pipeline, Delivery, Client Relationship, Business Operations).
6. Pick a sub-function. Zoom again, reveal its **Recurring Tasks** — the
   leaves. These are the actual, concrete things that can be done right now.
7. Pick one. Done — that's the answer to "what do I work on."

Every step is a narrowing decision, not a menu to scan exhaustively. The
breadcrumb exists so the person never loses track of *why* a task is in
front of them (e.g. "Total Capacity › Build › Income Work › Sales/Pipeline").

This is why drill-down/zoom (React Flow pan+zoom, one level of focus at a
time) is the right interaction model instead of a static org-chart or a
collapsible tree list — it matches how the decision is actually made:
progressively, not all at once.

**Not in this spec, but the reason the model exists:** an "energy level"
gate at the root (e.g. low-energy → surface Sustain first) is a natural
extension of this flow but is explicitly deferred — see
[PLAN.md](./PLAN.md) Phase 5. The data model and node component should not
make this harder to add later (e.g. avoid baking level-specific logic into
one monolithic component).

## Hierarchy levels

Branches are **not** all the same depth, and the app doesn't assume they
are — see [DATA_MODEL.md](./DATA_MODEL.md) for why that's safe (depth is
always derived by walking `parentId`, never assumed from `level`):

```
Total Capacity (root, 1 node)
  └─ Master Function     (Build, Sustain)
       │
       ├─ Build ──── Value Category  (Income, Equity, Audience, Career Options)
       │                  └─ Domain           (Income Work, Company Building, ...)
       │                       └─ Sub-Function   (Sales/Pipeline, Delivery, ...)
       │                            └─ Task         (leaf)
       │
       └─ Sustain ── Domain          (Physical Health, Relationships, ...)
                          └─ Sub-Function   (General, ...)
                               └─ Task         (leaf)
```

Build's branch is 5 levels deep (it passes through `valueCategory`);
Sustain's is 4 (it skips straight from `masterFunction` to `domain`). Six
level names total: `capacity`, `masterFunction`, `valueCategory`, `domain`,
`subFunction`, `task`.

A node can also be flagged `temporary: true` (e.g. "Career Transition," a
`domain` under Career Options) — situational rather than a permanent part
of the structure. This is a flag on the node, not a level or a different
node shape: it renders with a small hourglass badge, on top of whatever
its actual level's color/leaf status already is.

## Interaction requirements

- **Start state**: zoomed on the root, with Build / Sustain visible as
  connected boxes. Nothing deeper is rendered yet.
- **Click a node with children**: pan/zoom the camera to frame that node
  and its (newly revealed) children. Siblings not on the active path dim
  or collapse out of view — the canvas stays focused, not a full expanding
  tree.
- **Click a leaf (task)**: no zoom-in (nothing to reveal); leaf nodes are
  visually distinct so it's obvious before clicking that this is an
  endpoint, not another branch.
- **Breadcrumb**: always visible at the top, one segment per level from
  root to current focus. Each segment is clickable and jumps back to that
  level (re-frames the camera, restores that level's children).
- **Transitions**: animated pan/zoom (React Flow's `fitView`/`setCenter`
  with a duration), never an instant cut.
- **Mobile-first**: single-column breadcrumb wrap, touch-friendly node hit
  targets, canvas gestures (pinch-zoom/drag-pan) work the same as desktop.

## Visual language

One accent color per level, applied consistently regardless of subtree, so
depth is readable at a glance without reading labels:

| Level | Role | Suggested treatment |
|---|---|---|
| `capacity` | root | dark/neutral, largest, anchors the canvas |
| `masterFunction` | first branch | one strong accent (e.g. indigo) |
| `valueCategory` | Build-only layer | a distinct accent between masterFunction and domain (e.g. sky blue) |
| `domain` | branch | another accent (e.g. teal) |
| `subFunction` | branch | a third, lighter accent (e.g. amber) |
| `task` | leaf | neutral/light fill, distinct icon or border style marking "this is an endpoint" |

Leaf vs. non-leaf must be distinguishable **before** interacting — color
alone is acceptable but pairing it with a shape/icon cue (e.g. non-leaf
nodes show a child-count badge or expand affordance) is preferred so it
still reads for a colorblind user. Leaf-ness is about whether a node
*has children right now*, not its level — a `domain` with no children
would render as a leaf too, since Sustain's shallower branch means a
`domain` can be a leaf's parent directly.

## Explicit MVP scope

Build only:

1. Render the hierarchy from `lib/hierarchy-data.ts` as a zoomable node
   graph (React Flow).
2. Click-to-zoom-in navigation with a working breadcrumb.
3. Visual distinction per level, and leaf vs. non-leaf.
4. Mobile-first layout.

## Explicitly deferred (architect for, don't build)

- Add/edit/delete nodes via UI — data model is a flat array with stable
  `id`s specifically so a CRUD layer can be bolted on without restructuring.
- Auth / multi-user.
- Persistence beyond the static `lib/hierarchy-data.ts` file (no DB yet).
- Energy-level-aware entry point (see above).
