"use client";

import { Handle, Position } from "@xyflow/react";
import type { HierarchyNode, NodeLevel } from "@/lib/hierarchy-data";

// Data payload for the "hierarchy" React Flow node type. `role` distinguishes
// the single centered parent (focus) from its children in the current view —
// only children are ever clickable.
export interface HierarchyNodeData extends Record<string, unknown> {
  node: HierarchyNode;
  role: "focus" | "child";
  isLeaf: boolean;
  childCount: number;
  // Base font size in px for this node, precomputed in radial-layout.ts as a
  // function of how many siblings are in the current view — fewer nodes on
  // screen means more room, so text scales up; more nodes scale it back
  // down toward a floor that stays readable.
  fontSize: number;
}

interface LevelStyle {
  // role === "focus": solid fill, this node is "where you are"
  focus: string;
  // role === "child", has children: tinted outline, "drill in from here"
  child: string;
  // role === "child", no children: same hue but dashed — an endpoint
  leaf: string;
}

// One accent hue per level (masterFunction and mode share a tier — see
// docs/PRODUCT_SPEC.md — "Career Transition" is a root-level sibling of
// Build/Sustain, not a deeper level, so it reads the same depth visually).
const BASE_LEVEL_STYLES: Record<Exclude<NodeLevel, "mode">, LevelStyle> = {
  capacity: {
    focus: "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900",
    child: "border-zinc-400 bg-zinc-100 text-zinc-900 hover:border-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-400",
    leaf: "border-zinc-300 border-dashed bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  },
  masterFunction: {
    focus: "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-500",
    child: "border-indigo-300 bg-indigo-50 text-indigo-900 hover:border-indigo-500 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-100 dark:hover:border-indigo-500",
    leaf: "border-indigo-200 border-dashed bg-indigo-50/60 text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-200",
  },
  domain: {
    focus: "border-teal-600 bg-teal-600 text-white dark:border-teal-400 dark:bg-teal-500",
    child: "border-teal-300 bg-teal-50 text-teal-900 hover:border-teal-500 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-100 dark:hover:border-teal-500",
    leaf: "border-teal-200 border-dashed bg-teal-50/60 text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200",
  },
  subFunction: {
    focus: "border-amber-600 bg-amber-600 text-white dark:border-amber-400 dark:bg-amber-500",
    child: "border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-500 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100 dark:hover:border-amber-500",
    leaf: "border-amber-200 border-dashed bg-amber-50/60 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
  },
  task: {
    focus: "border-zinc-600 bg-zinc-600 text-white dark:border-zinc-400 dark:bg-zinc-500",
    child: "border-zinc-300 bg-zinc-50 text-zinc-800 hover:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500",
    leaf: "border-zinc-300 border-dashed bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400",
  },
};
const LEVEL_STYLES: Record<NodeLevel, LevelStyle> = {
  ...BASE_LEVEL_STYLES,
  mode: BASE_LEVEL_STYLES.masterFunction,
};

// Endpoint marker: a plain ring, deliberately a different shape from the
// child-count pill, so leaf-vs-branch reads without relying on color.
function LeafMarker() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 10 10"
      className="h-[0.9em] w-[0.9em] shrink-0 opacity-70"
    >
      <circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function HierarchyFlowNode({
  data,
}: {
  data: HierarchyNodeData;
}) {
  const { node, role, isLeaf, childCount, fontSize } = data;
  const isCircle = role === "focus";
  // The hub steps back to its parent on click — root has no parent, so it's
  // the one focus node that isn't clickable.
  const clickable = isCircle ? node.parentId !== null : !isLeaf;
  const style = LEVEL_STYLES[node.level];
  const variant = isCircle ? style.focus : isLeaf ? style.leaf : style.child;

  return (
    <div
      title={
        isCircle && clickable ? "Back to previous level" : node.description
      }
      style={{ fontSize }}
      className={[
        // h-full/w-full fill the fixed width/height xyflow sets on the node
        // wrapper (from radial-layout.ts) — without them the box only takes
        // its content's natural height, leaving a mismatched gap below.
        "relative flex h-full w-full flex-col items-center justify-center gap-1 border text-center shadow-sm transition-colors",
        isCircle ? "rounded-full px-5 py-4" : "rounded-lg px-3 py-2",
        variant,
        clickable ? "cursor-pointer" : "cursor-default",
        isCircle && clickable ? "hover:brightness-110" : "",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="opacity-0"
      />
      {role === "child" &&
        (isLeaf ? (
          <span className="absolute right-2 top-2">
            <LeafMarker />
          </span>
        ) : (
          <span className="absolute right-2 top-2 rounded-full bg-current/10 px-[0.5em] py-[0.15em] text-[0.6em] font-semibold leading-none">
            {childCount}
          </span>
        ))}
      <span
        className={[
          "font-semibold leading-snug",
          isCircle ? "text-[1.05em]" : "text-[1em] font-medium",
        ].join(" ")}
      >
        {node.label}
      </span>
      {node.meta && (
        <span className="text-[0.68em] opacity-70">{node.meta}</span>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className="opacity-0"
      />
    </div>
  );
}
