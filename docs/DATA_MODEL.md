# Data Model

> The hierarchy is no longer only the mind-map's data — that view was
> replaced by `/coverage`. It is now also the vocabulary the schedule points
> at: a block names a node id, and hours roll up this tree. See
> `docs/DIRECTION.md`.

## Location

`lib/hierarchy-data.ts` — the single source of truth for the hierarchy.
Moved here (from the top-level `seed.ts` drop-in) so it sits with the rest
of the data/domain layer, separate from `app/` (routing/UI).

## Shape

```ts
export type NodeLevel =
  | "capacity"
  | "masterFunction"
  | "valueCategory"
  | "domain"
  | "subFunction"
  | "task";

export interface HierarchyNode {
  id: string;
  label: string;
  level: NodeLevel;
  parentId: string | null;
  description?: string;
  meta?: string; // e.g. calendar slot this task lives in
  temporary?: boolean; // true for situational/non-permanent nodes
}

export const hierarchyData: HierarchyNode[] = [ /* ... */ ];
```

This already matches the flat-array-plus-`parentId` shape from the
original spec (`Node { id, label, level, parentId, description?, meta? }`),
with differences worth recording:

- **Type name is `HierarchyNode`, not `Node`** — `Node` collides with
  React Flow's own `Node<T>` type and the DOM `Node` global; every file
  that imports both would need an alias. Keep `HierarchyNode` as the
  canonical name; if a future refactor wants `Node`, import it aliased
  (`import type { Node as HierarchyNode }`) rather than the reverse.
- **Branches don't all pass through the same levels, and that's fine.**
  Build goes `masterFunction → valueCategory → domain → subFunction →
  task`; Sustain skips `valueCategory` entirely (`masterFunction →
  domain → ...`). `NodeLevel` is a label for *what a node is called*, not
  a position in a fixed sequence — nothing in the data model or the UI
  assumes every path has the same length. Depth is always derived by
  walking `parentId` (see `getAncestors`/`getPath` below), never by
  counting or ordering `NodeLevel` values. Adding, removing, or
  reordering a level for one branch (as happened going from v1 → v2 of
  this data) requires no changes to `lib/` or `components/`: depth is always
  derived by walking `parentId`, never by counting or ordering `NodeLevel`
  values.
- **`temporary` is a flag, not a level** — a node like "Career
  Transition" is structurally a normal `domain` (has the same kind of
  children a domain has); what's different is that it's situational.
  Modeling that as a boolean on any node rather than a `NodeLevel` value
  or a separate node type keeps traversal/depth logic untouched — a
  temporary node's children work exactly like any other node's.

## Why flat array + `parentId` (not nested objects)

- **O(1) lookup by id**, needed constantly (breadcrumb reconstruction,
  "find this node's children," React Flow node/edge keys).
- **Editing a node never requires reshaping its ancestors.** A nested
  `{ children: [...] }` tree means every add/move/delete touches a parent
  object; a flat array means it's a single find-and-splice. This is the
  property that makes a future edit UI or DB swap non-disruptive — the
  spec calls this out explicitly as the reason for the choice.
- **Trivial DB mapping later**: this shape is already a single-table
  schema (`id PK, label, level, parent_id FK, description, meta`) — a
  Prisma/Drizzle model drops in with no transformation step.

## Derived helpers (live in `lib/hierarchy-data.ts`, not in components)

- `getChildren(id: string | null): HierarchyNode[]` — filter by `parentId`.
  `getChildren(null)` returns the root. A node's leaf-ness is
  `getChildren(id).length === 0` — computed from actual children present,
  never from `level`, so a leaf works the same whether it's 3 levels deep
  (Sustain's tasks) or 5 (Build's).
- `getRoot(): HierarchyNode` — the one node with `parentId === null`.
- `getNode(id: string): HierarchyNode | undefined` — lookup by id.
- `getAncestors(id: string): HierarchyNode[]` — walk `parentId` up to the
  root (nearest parent first); this is what feeds the breadcrumb.
- `getPath(id: string): HierarchyNode[]` — root-to-node inclusive,
  what the breadcrumb renders directly. Its length is whatever the actual
  ancestor chain is — 4 entries for a Sustain leaf, 6 for a Build one —
  `Breadcrumb.tsx` just `.map()`s over it.

Keeping these as pure functions over `hierarchyData` (not React state)
means swapping the data source later (DB fetch, edit UI writing back) only
changes where `hierarchyData` comes from, not how the UI walks it.

## Extensibility already accounted for

- `description` and `meta` are optional and free-text on purpose — `meta`
  is currently used for calendar slots ("Wed 5:00-6:00pm (CTP)") but
  nothing about the type forces that; an energy-cost tag, a priority, or a
  status could be added as additional optional fields without breaking
  existing nodes.
- Stable string `id`s (not array indices) mean nodes can be reordered,
  and a future edit UI can add/remove nodes without renumbering anything.
