# Implementation Plan

Phased so each phase is independently runnable/checkable in the browser
before moving on. No phase should be started until the previous one has
been visually verified with `npm run dev`.

**Before writing any code**: this repo runs a customized Next.js (see
`AGENTS.md` at the repo root) with breaking changes vs. training data —
read `node_modules/next/dist/docs/01-app/` for current App Router
conventions before touching `app/`.

---

### Phase 0 — Dependencies & scaffolding

- Install the graph library: `@xyflow/react` (the current package; `reactflow`
  is the legacy name for the same project — use `@xyflow/react` since this
  is a new build, not a migration).
- Confirm Tailwind is already wired (it is — `postcss.config.mjs`,
  `@tailwindcss/postcss` in `package.json`); no extra config needed.
- No new routes yet — the whole app is one client view mounted from
  `app/page.tsx`.

**Check**: `npm run dev` still boots the default scaffold with the new
dependency installed, no errors.

### Phase 1 — Data layer helpers

- Add the derived helpers described in
  [DATA_MODEL.md](./DATA_MODEL.md) (`getChildren`, `getNode`,
  `getAncestors`, `getPath`) to `lib/hierarchy-data.ts` (or a sibling
  `lib/hierarchy.ts` if it's cleaner to keep data and query functions in
  separate files — decide at implementation time, not a hard requirement).
- No UI yet. Sanity-check the helpers with a throwaway script or a quick
  console.log from a server component — don't build the graph on top of
  unverified tree-walking logic.

**Check**: `getPath("task-sales-outreach")` returns the 5-node root→leaf
chain; `getChildren("capacity-root")` returns exactly Build/Sustain/Mode.

### Phase 2 — Static graph render (no interaction)

- Build a `'use client'` component (e.g. `components/MindMap.tsx`) that
  takes the *current focus node's children* and renders them as React Flow
  nodes/edges, connected to a rendered parent node.
- Wire it into `app/page.tsx`, hardcoded to show the root's children
  (Build/Sustain/Mode) — no click handling yet.
- Custom node component per level (even if visually plain at this stage)
  so Phase 4's styling has a seam to attach to, instead of retrofitting
  React Flow's default node.

**Check**: loading `/` shows Total Capacity connected to Build, Sustain,
and Mode: Career Transition as boxes on a pannable/zoomable canvas.

### Phase 3 — Drill-down navigation + breadcrumb

- Add focus state (`currentNodeId`, defaulting to the root).
- Clicking a node with children: update `currentNodeId`, re-derive the
  node/edge set for that node's children via the Phase 1 helpers, and
  re-frame the camera (React Flow `fitView`/`setCenter`, animated).
- Clicking a leaf: no-op (or opens a detail affordance — out of scope for
  MVP, no-op is fine).
- Breadcrumb component driven by `getPath(currentNodeId)`; each segment
  clickable, sets `currentNodeId` back to that segment's id.

**Check**: full click path root → Build → Income Work → Sales/Pipeline →
leaf tasks works, breadcrumb updates and each segment is clickable to jump
back, camera animates rather than jump-cuts.

### Phase 4 — Visual language

- Apply the per-level color table from
  [PRODUCT_SPEC.md](./PRODUCT_SPEC.md) to the custom node component from
  Phase 2, keyed off `node.level` (remember: `masterFunction` and `mode`
  share a visual tier).
- Leaf (`task`) nodes get a distinct treatment — different fill *and* a
  non-color cue (icon/border) — decided from `getChildren(id).length === 0`
  rather than a hardcoded `level === "task"` check, so the visual rule
  stays correct if the hierarchy depth ever changes.
- Root gets its own one-off treatment (largest/darkest, per spec).

**Check**: depth is readable from color alone at every step of the click
path; a leaf is visually identifiable before clicking it.

### Phase 5 — Mobile-first pass

- Breadcrumb wraps/scrolls horizontally on narrow viewports instead of
  overflowing.
- Node hit targets and spacing sized for touch (React Flow's pan/zoom
  already supports touch gestures — verify, don't assume).
- Verify on a narrow viewport (devtools device toolbar or actual phone) at
  each level of the hierarchy, not just the root.

**Check**: full click path is usable one-handed on a ~375px-wide viewport.

---

### Deferred / explicitly not in this plan

Tracked here so they're not silently forgotten, not because they're
scheduled:

- **Energy-level-aware entry point** (see PRODUCT_SPEC.md) — would add a
  pre-root screen or root-level annotation; needs its own data (energy
  cost per node or per branch) that doesn't exist in the seed yet. Revisit
  once the base drill-down is validated in daily use.
- **Add/edit/delete UI** — the data layer (Phase 1 helpers, flat-array
  model) is deliberately shaped to make this an additive change later:
  swap `hierarchyData` import for a fetch, add mutation functions beside
  the existing query helpers.
- **Persistence / DB / auth** — no work until the static file stops being
  enough.
