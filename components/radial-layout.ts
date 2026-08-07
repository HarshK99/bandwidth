import type { Edge, Node } from "@xyflow/react";
import { getChildren, type HierarchyNode } from "@/lib/hierarchy-data";
import type { HierarchyNodeData } from "@/components/HierarchyFlowNode";
import type { RadialEdgeData } from "@/components/RadialEdge";

export const FOCUS_DIAMETER = 150;
export const ROOT_FOCUS_DIAMETER = 190;
export const CHILD_WIDTH = 200;
export const CHILD_HEIGHT = 90;

const FOCUS_TO_CHILD_GAP = 56;
const CHILD_TO_CHILD_GAP = 28;

function circleBoundaryPoint(
  cx: number,
  cy: number,
  r: number,
  towardX: number,
  towardY: number
) {
  const dx = towardX - cx;
  const dy = towardY - cy;
  const dist = Math.hypot(dx, dy) || 1;
  return { x: cx + (dx / dist) * r, y: cy + (dy / dist) * r };
}

// Ray from the rectangle's center toward (towardX, towardY), intersected
// with the rectangle's edge — standard "which axis do we hit first" scale.
function rectBoundaryPoint(
  cx: number,
  cy: number,
  w: number,
  h: number,
  towardX: number,
  towardY: number
) {
  const dx = towardX - cx;
  const dy = towardY - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const scaleX = dx !== 0 ? w / 2 / Math.abs(dx) : Infinity;
  const scaleY = dy !== 0 ? h / 2 / Math.abs(dy) : Infinity;
  const scale = Math.min(scaleX, scaleY);
  return { x: cx + dx * scale, y: cy + dy * scale };
}

// Children fan out evenly in a full circle around the focus node — 4
// children land on the 4 cardinal sides, more children fill the gaps
// between rather than only ever growing a row underneath the focus.
export function buildRadialGraph(focus: HierarchyNode) {
  const children = getChildren(focus.id);
  const isRootFocus = focus.level === "capacity";
  const focusDiameter = isRootFocus ? ROOT_FOCUS_DIAMETER : FOCUS_DIAMETER;
  const focusRadius = focusDiameter / 2;
  const childHalfDiagonal = Math.hypot(CHILD_WIDTH / 2, CHILD_HEIGHT / 2);

  // Far enough that the ring of children clears the focus circle...
  let radius = focusRadius + FOCUS_TO_CHILD_GAP + childHalfDiagonal;
  // ...and far enough that adjacent children (bounding-circle approximation)
  // don't overlap each other around the ring.
  if (children.length > 1) {
    const angleStep = (2 * Math.PI) / children.length;
    const chordNeeded = childHalfDiagonal * 2 + CHILD_TO_CHILD_GAP;
    radius = Math.max(radius, chordNeeded / (2 * Math.sin(angleStep / 2)));
  }

  const focusNode: Node<HierarchyNodeData> = {
    id: focus.id,
    type: "hierarchy",
    position: { x: -focusRadius, y: -focusRadius },
    width: focusDiameter,
    height: focusDiameter,
    draggable: false,
    selectable: false,
    data: {
      node: focus,
      role: "focus",
      isLeaf: children.length === 0,
      childCount: children.length,
    },
  };

  const startAngle = -Math.PI / 2; // 12 o'clock, then clockwise
  const angleStep = children.length > 0 ? (2 * Math.PI) / children.length : 0;

  const childNodes: Node<HierarchyNodeData>[] = [];
  const edges: Edge<RadialEdgeData>[] = [];

  children.forEach((child, i) => {
    const angle = startAngle + i * angleStep;
    const cx = radius * Math.cos(angle);
    const cy = radius * Math.sin(angle);
    const childCount = getChildren(child.id).length;

    childNodes.push({
      id: child.id,
      type: "hierarchy",
      position: { x: cx - CHILD_WIDTH / 2, y: cy - CHILD_HEIGHT / 2 },
      width: CHILD_WIDTH,
      height: CHILD_HEIGHT,
      draggable: false,
      selectable: false,
      data: {
        node: child,
        role: "child",
        isLeaf: childCount === 0,
        childCount,
      },
    });

    const sourcePoint = circleBoundaryPoint(0, 0, focusRadius, cx, cy);
    const targetPoint = rectBoundaryPoint(
      cx,
      cy,
      CHILD_WIDTH,
      CHILD_HEIGHT,
      0,
      0
    );

    edges.push({
      id: `${focus.id}->${child.id}`,
      source: focus.id,
      target: child.id,
      type: "radial",
      data: {
        sx: sourcePoint.x,
        sy: sourcePoint.y,
        tx: targetPoint.x,
        ty: targetPoint.y,
      },
    });
  });

  return { nodes: [focusNode, ...childNodes], edges };
}
