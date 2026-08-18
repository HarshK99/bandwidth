"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
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
  // The width radial-layout.ts used for this node's ring-spacing math (px).
  // Rectangles treat it as a floor, not a fixed value — see the width
  // handling below for why.
  width: number;
}

interface LevelStyle {
  // role === "focus": solid fill, this node is "where you are"
  focus: string;
  // role === "child", has children: tinted outline, "drill in from here"
  child: string;
  // role === "child", no children: same hue but dashed — an endpoint
  leaf: string;
}

// One accent hue per level. This is a lookup keyed by level *name*, not a
// position in a sequence — it has no opinion on how deep a level sits or
// whether every branch passes through it, so branches of different depth
// (e.g. Build's masterFunction → valueCategory → domain vs. Sustain's
// masterFunction → domain) each just look up their own node's level here.
// `Record<NodeLevel, ...>` means TypeScript won't compile if a level from
// lib/hierarchy-data.ts is missing an entry here.
const LEVEL_STYLES: Record<NodeLevel, LevelStyle> = {
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
  valueCategory: {
    focus: "border-sky-600 bg-sky-600 text-white dark:border-sky-400 dark:bg-sky-500",
    child: "border-sky-300 bg-sky-50 text-sky-900 hover:border-sky-500 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-100 dark:hover:border-sky-500",
    leaf: "border-sky-200 border-dashed bg-sky-50/60 text-sky-800 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-200",
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

const MIN_SHRINK_SCALE = 0.55;
const SHRINK_STEP = 0.08;

// External-link glyph: marks a leaf that opens a URL instead of no-op'ing.
// Shares the child-count badge's top-right corner — the two never collide
// since only non-leaf children get a count and only leaves get this.
function ExternalLinkBadge() {
  return (
    <span
      title="Opens an external link"
      className="absolute right-2 top-2 opacity-70"
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-[1em] w-[1em]">
        <path
          fill="currentColor"
          d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z"
        />
        <path
          fill="currentColor"
          d="M3.5 4A1.5 1.5 0 0 0 2 5.5v7A1.5 1.5 0 0 0 3.5 14h7a1.5 1.5 0 0 0 1.5-1.5v-3a.75.75 0 0 0-1.5 0v3a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5h3a.75.75 0 0 0 0-1.5h-3Z"
        />
      </svg>
    </span>
  );
}

// Hourglass: marks a node as situational/non-permanent (HierarchyNode.temporary).
// Sits opposite the child-count badge (top-left, not top-right) so the two
// never collide, and doesn't reuse the leaf's dashed border since a
// temporary branch node still needs to look clickable/non-dashed.
function TemporaryBadge() {
  return (
    <span
      title="Temporary — situational, not a permanent part of the hierarchy"
      className="absolute left-2 top-2 opacity-80"
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-[1em] w-[1em]">
        <path
          fill="currentColor"
          d="M4 1.5A.5.5 0 0 1 4.5 1h7a.5.5 0 0 1 0 1h-.6c-.15 1.9-1 3.55-2.25 4.5 1.25.95 2.1 2.6 2.25 4.5h.6a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h.6c.15-1.9 1-3.55 2.25-4.5C6.15 5.55 5.3 3.9 5.15 2H4.5a.5.5 0 0 1-.5-.5Z"
        />
      </svg>
    </span>
  );
}

// A circle can't grow taller without becoming a pill (its width has to grow
// right along with it to stay a circle, which radial-layout.ts doesn't
// account for). So instead of growing the box, shrink the *text* to fit the
// fixed circle — the classic "fit text" trick: after layout, check whether
// the content overflows its allotted box and step the font down until it
// doesn't. `key={node.id}` on the caller resets this back to 1 whenever the
// focus node changes.
function CircleText({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const overflows =
      el.scrollHeight > el.clientHeight + 1 ||
      el.scrollWidth > el.clientWidth + 1;
    if (overflows && scale > MIN_SHRINK_SCALE) {
      setScale((s) => Math.max(MIN_SHRINK_SCALE, s - SHRINK_STEP));
    }
  }, [scale]);

  return (
    <div
      ref={ref}
      style={{ fontSize: `${scale}em` }}
      className="flex max-h-[70%] max-w-[70%] flex-col items-center gap-1 overflow-hidden"
    >
      {children}
    </div>
  );
}

export default function HierarchyFlowNode({
  data,
}: {
  data: HierarchyNodeData;
}) {
  const { node, role, isLeaf, childCount, fontSize, width } = data;
  const isCircle = role === "focus";
  // The hub steps back to its parent on click — root has no parent, so it's
  // the one focus node that isn't clickable.
  const clickable = isCircle ? node.parentId !== null : !isLeaf || !!node.url;
  const style = LEVEL_STYLES[node.level];
  const variant = isCircle ? style.focus : isLeaf ? style.leaf : style.child;

  const text = (
    <>
      <span
        className={[
          "break-words font-semibold leading-snug",
          isCircle ? "text-[1.05em]" : "text-[1em] font-medium",
        ].join(" ")}
      >
        {node.label}
      </span>
      {node.meta && (
        <span className="break-words text-[0.68em] opacity-70">
          {node.meta}
        </span>
      )}
    </>
  );

  return (
    <div
      title={
        isCircle && clickable ? "Back to previous level" : node.description
      }
      style={{
        fontSize,
        // Rectangles: radial-layout.ts's width is a floor, not a fixed
        // value — a long label widens the box (up to 1.5x) before it
        // resorts to wrapping into a tall, narrow column. Capped so one
        // long label doesn't grow into its ring neighbors.
        ...(isCircle ? {} : { minWidth: width, maxWidth: width * 1.5 }),
      }}
      className={[
        "flex flex-col items-center justify-center gap-1 border text-center shadow-sm transition-colors",
        isCircle
          ? // Fixed h-full/w-full: a circle has to keep width === height, so
            // unlike the rectangle below it can't grow to fit longer text —
            // the text shrinks instead (see CircleText).
            "relative h-full w-full rounded-full px-[1em] py-[0.85em]"
          : // min-h-full + w-max (+ the min/max-width style above): fills at
            // least the size radial-layout.ts estimated in both dimensions,
            // but can grow — taller for a wrapped line, wider for a long
            // label — instead of clipping/spilling past a fixed border.
            // absolute + centered transform (not "relative", normal flow):
            // a plain block child only grows rightward/downward from its
            // top-left corner, which both pulls it off its connector line
            // and grows past bounds fitView already computed. Anchoring on
            // the node's true center and growing outward symmetrically in
            // every direction keeps both correct regardless of size.
            "absolute left-1/2 top-1/2 w-max -translate-x-1/2 -translate-y-1/2 min-h-full rounded-lg px-[0.75em] pb-[0.65em] pt-[1.5em]",
        variant,
        clickable ? "cursor-pointer" : "cursor-default",
        isCircle && clickable ? "hover:brightness-110" : "",
        !isCircle && isLeaf && node.url ? "hover:brightness-105" : "",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="opacity-0"
      />
      {node.temporary && <TemporaryBadge />}
      {role === "child" && isLeaf && node.url && <ExternalLinkBadge />}
      {role === "child" && !isLeaf && (
        <span className="absolute right-2 top-2 rounded-full bg-current/10 px-[0.5em] py-[0.15em] text-[0.6em] font-semibold leading-none">
          {childCount}
        </span>
      )}
      {isCircle ? (
        <CircleText key={node.id}>{text}</CircleText>
      ) : (
        text
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
