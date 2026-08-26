// lib/direction/nodes.ts
// The bridge between the two halves of lib/life: the week says *when*, the
// tree says *what and why*. A block points at a node id and everything else —
// its label, the area it belongs to, whether it's Build or Sustain — is read
// from the tree rather than retyped here.
//
// That's what makes "which parts of the tree get no time?" a query instead of
// a manual count, and why an area can't go missing from a total because it
// was typed slightly differently.

import { hierarchy, type HierarchyNode } from "../life";

const BY_ID = new Map(hierarchy.map((node) => [node.id, node]));

const HAS_BRANCHES = new Set(
  hierarchy
    .filter((node) => node.kind !== "task" && node.parentId)
    .map((node) => node.parentId as string)
);

export function getNode(id: string): HierarchyNode | null {
  return BY_ID.get(id) ?? null;
}

/** Root-first chain: Build → Income Work → Websites → Pipeline. */
export function getAncestry(id: string): HierarchyNode[] {
  const chain: HierarchyNode[] = [];
  let node = BY_ID.get(id);
  while (node) {
    chain.unshift(node);
    node = node.parentId ? BY_ID.get(node.parentId) : undefined;
  }
  return chain;
}

/**
 * The area a node belongs to: itself if it is one, otherwise the area it
 * hangs under. The rule is "the highest thing you'd name when asked what
 * you're working on" — Pipeline's answer is Websites, not Income Work.
 */
export function getAreaLabel(id: string): string {
  const chain = getAncestry(id);
  const area = [...chain].reverse().find((node) => node.kind === "area");
  return area?.label ?? chain[chain.length - 1]?.label ?? "";
}

const TASKS_BY_PARENT = new Map<string, HierarchyNode[]>();
for (const node of hierarchy) {
  if (node.kind !== "task" || !node.parentId) continue;
  const list = TASKS_BY_PARENT.get(node.parentId) ?? [];
  list.push(node);
  TASKS_BY_PARENT.set(node.parentId, list);
}

/** A node's own tasks, in authored order. */
export function getTasks(id: string): HierarchyNode[] {
  return TASKS_BY_PARENT.get(id) ?? [];
}

/**
 * Everything a block can be pointed at: every stage, plus the areas that
 * don't break into stages at all. Deliberately not tasks — a block is aimed
 * at a kind of work, not at one to-do — and not the containers above them
 * either: "Build" is not an answer to what this afternoon is for.
 */
export function getAreaOptions(): HierarchyNode[] {
  return hierarchy.filter((node) => {
    if (node.kind === "stage") return true;
    return node.kind === "area" && !HAS_BRANCHES.has(node.id);
  });
}
