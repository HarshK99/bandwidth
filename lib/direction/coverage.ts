import { ACTIVITY_AREAS } from "../work/catalog";
import { WORK_MODES } from "../work/modes";
import type { ActivityArea, ActivityNode, CoverageFilter, Effort } from "../work/types";

function filterNodes(nodes: readonly ActivityNode[], effort: Effort | null): ActivityNode[] {
  return nodes.flatMap((node): ActivityNode[] => {
    if (node.kind === "activity") {
      return effort === null || node.efforts.includes(effort) ? [node] : [];
    }
    const children = filterNodes(node.children, effort);
    return children.length ? [{ ...node, children }] : [];
  });
}

export function filterActivities(
  areas: readonly ActivityArea[],
  filter: CoverageFilter,
): ActivityArea[] {
  return areas.flatMap((area) => {
    if (filter.area !== null && area.id !== filter.area) return [];
    const children = filterNodes(area.children, filter.effort);
    return children.length ? [{ ...area, children }] : [];
  });
}

export function parseCoverageFilter(params: URLSearchParams): CoverageFilter {
  const area = ACTIVITY_AREAS.find((item) => item.id === params.get("area"))?.id ?? null;
  const effort = (Object.keys(WORK_MODES) as Effort[])
    .find((item) => item === params.get("effort")) ?? null;
  return { area, effort };
}
