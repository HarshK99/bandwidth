import type { Edge, Node } from "@xyflow/react";
import { getChildren, type HierarchyNode } from "@/lib/hierarchy-data";
import type { HierarchyNodeData } from "@/components/HierarchyFlowNode";
import type { RadialEdgeData } from "@/components/RadialEdge";

// Every size below is a function of how many children are in the current
// view (i.e. how many nodes are on screen at once): fewer items means more
// room, so nodes and text scale up toward the "_MAX" figures; more items
// scale down toward the "_MIN" floor, which stays readable rather than
// shrinking indefinitely. Linear interpolation over count, clamped to
// [1, MANY_ITEMS_COUNT] children.
const MANY_ITEMS_COUNT = 8;

const FONT_SIZE_MAX = 34;
const FONT_SIZE_MIN = 16;
const CHILD_WIDTH_MAX = 240;
const CHILD_WIDTH_MIN = 190;
const CHILD_HEIGHT_MAX = 130;
const CHILD_HEIGHT_MIN = 88;
const FOCUS_DIAMETER_MAX = 210;
const FOCUS_DIAMETER_MIN = 150;
const ROOT_FOCUS_DIAMETER_MAX = 250;
const ROOT_FOCUS_DIAMETER_MIN = 180;

// Gap between the focus circle and the ring of children, and between
// adjacent children on that ring. Kept tight so the fitted view is mostly
// nodes, not empty canvas.
const FOCUS_TO_CHILD_GAP = 40;
const CHILD_TO_CHILD_GAP = 20;

function lerp(max: number, min: number, t: number): number {
  return max - t * (max - min);
}

// t=0 → few items on screen (biggest), t=1 → many items (smallest-but-floor).
// Floored at 2, not 1: a single child otherwise interpolated all the way to
// the top of the scale and looked oversized — 2 items already reads as
// "plenty of room," so 1 item uses that same size rather than going bigger.
function sizeFactor(childCount: number): number {
  const clamped = Math.min(Math.max(childCount, 2), MANY_ITEMS_COUNT);
  return (clamped - 2) / (MANY_ITEMS_COUNT - 2);
}

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

  const t = sizeFactor(children.length);
  const fontSize = lerp(FONT_SIZE_MAX, FONT_SIZE_MIN, t);
  const childWidth = lerp(CHILD_WIDTH_MAX, CHILD_WIDTH_MIN, t);
  const childHeight = lerp(CHILD_HEIGHT_MAX, CHILD_HEIGHT_MIN, t);
  const focusDiameter = isRootFocus
    ? lerp(ROOT_FOCUS_DIAMETER_MAX, ROOT_FOCUS_DIAMETER_MIN, t)
    : lerp(FOCUS_DIAMETER_MAX, FOCUS_DIAMETER_MIN, t);
  const focusRadius = focusDiameter / 2;
  const focusFontSize = isRootFocus ? fontSize * 1.15 : fontSize;

  const childHalfDiagonal = Math.hypot(childWidth / 2, childHeight / 2);

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
      fontSize: focusFontSize,
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
      position: { x: cx - childWidth / 2, y: cy - childHeight / 2 },
      width: childWidth,
      height: childHeight,
      draggable: false,
      selectable: false,
      data: {
        node: child,
        role: "child",
        isLeaf: childCount === 0,
        childCount,
        fontSize,
      },
    });

    const sourcePoint = circleBoundaryPoint(0, 0, focusRadius, cx, cy);
    const targetPoint = rectBoundaryPoint(cx, cy, childWidth, childHeight, 0, 0);

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
