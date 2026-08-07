# Data Model

## Location

`lib/hierarchy-data.ts` — the single source of truth for the hierarchy.
Moved here (from the top-level `seed.ts` drop-in) so it sits with the rest
of the data/domain layer, separate from `app/` (routing/UI).

## Shape

```ts
export type NodeLevel =
  | "capacity"
  | "masterFunction"
  | "mode"
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
}

export const hierarchyData: HierarchyNode[] = [ /* ... */ ];
```

This already matches the flat-array-plus-`parentId` shape from the
original spec (`Node { id, label, level, parentId, description?, meta? }`),
with two intentional differences worth recording:

- **Type name is `HierarchyNode`, not `Node`** — `Node` collides with
  React Flow's own `Node<T>` type and the DOM `Node` global; every file
  that imports both would need an alias. Keep `HierarchyNode` as the
  canonical name; if a future refactor wants `Node`, import it aliased
  (`import type { Node as HierarchyNode }`) rather than the reverse.
- **`mode` is its own `NodeLevel`, not folded into `masterFunction`** —
  the seed data has "Mode: Career Transition" hanging directly off the
  root as a sibling of Build/Sustain, with its own tasks as direct
  children (no domain/sub-function layer under it). Modeling it as a
  distinct level (rather than mislabeling it `masterFunction`) keeps the
  level→color mapping and the "what depth am I at" breadcrumb logic
  honest. UI code should treat `masterFunction` and `mode` as the same
  visual tier (see [PRODUCT_SPEC.md](./PRODUCT_SPEC.md)'s color table)
  even though they're different enum values.

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

## Derived helpers (to live in `lib/`, not in components)

None of these exist yet; call this out so implementation doesn't scatter
tree-walking logic across UI components:

- `getChildren(id: string | null): HierarchyNode[]` — filter by `parentId`.
- `getNode(id: string): HierarchyNode | undefined` — lookup by id.
- `getAncestors(id: string): HierarchyNode[]` — walk `parentId` up to the
  root; this is what feeds the breadcrumb.
- `getPath(id: string): HierarchyNode[]` — root-to-node inclusive
  (`[...getAncestors(id).reverse(), getNode(id)]`), what the breadcrumb
  renders directly.

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
