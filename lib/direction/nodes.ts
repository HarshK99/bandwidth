// lib/direction/nodes.ts
// The bridge between the two data files: the schedule says *when*, the
// hierarchy says *what and why*. A block points at a hierarchy node id and
// everything else — its label, the domain it belongs to, whether it's Build
// or Sustain — is read from lib/hierarchy-data.ts rather than retyped here.
//
// That's what makes "which parts of the hierarchy get no time?" a query
// instead of a manual count, and it's why an area can never again go missing
// from a total because it was typed slightly differently.

import { hierarchyData, type HierarchyNode } from "../hierarchy-data";

const BY_ID = new Map(hierarchyData.map((node) => [node.id, node]));

export function getNode(id: string): HierarchyNode | null {
  return BY_ID.get(id) ?? null;
}

/** Root-first chain: Total Capacity → Build → Income Work → Websites → … */
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
 * The area a node belongs to: its nearest `domain` ancestor, or itself when
 * it is one. Career Options has tasks hanging straight off a value category,
 * so that level counts too — the rule is "the highest thing you'd name when
 * asked what you're working on".
 */
export function getAreaLabel(id: string): string {
  const chain = getAncestry(id);
  const area = [...chain]
    .reverse()
    .find((node) => node.level === "domain" || node.level === "valueCategory");
  return area?.label ?? chain[chain.length - 1]?.label ?? "";
}

/**
 * Everything a block can be pointed at: the stages (sub-functions), the
 * domains without stages, and task-bearing value categories. Deliberately not
 * the task level — a block is aimed at a kind of work, not at one to-do.
 */
export function getAreaOptions(): HierarchyNode[] {
  const hasChildren = (id: string, level: HierarchyNode["level"]) =>
    hierarchyData.some((node) => node.parentId === id && node.level === level);

  return hierarchyData.filter((node) => {
    if (node.level === "subFunction") return true;
    if (node.level === "domain") return !hasChildren(node.id, "subFunction");
    if (node.level === "valueCategory") return hasChildren(node.id, "task");
    return false;
  });
}
