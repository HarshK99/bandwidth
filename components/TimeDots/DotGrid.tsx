"use client";

import { useFitGrid } from "./useFitGrid";

interface DotGridProps {
  total: number;
  elapsed: number;
  // Fixed column count for calendar-style grids (e.g. life-in-weeks: one
  // column per week, one row per year). Auto-packs for the largest dot size
  // when omitted.
  columns?: number;
  // Dot indices to mark as milestones — rendered with a ring regardless of
  // elapsed/upcoming state. Empty until lib/milestones.ts has real data.
  highlightIndices?: ReadonlySet<number>;
}

export default function DotGrid({
  total,
  elapsed,
  columns,
  highlightIndices,
}: DotGridProps) {
  const { containerRef, layout } = useFitGrid(total, columns);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center overflow-hidden"
    >
      {layout && (
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${layout.columns}, ${layout.dotSize}px)`,
            gap: layout.gap,
          }}
        >
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              style={{ width: layout.dotSize, height: layout.dotSize }}
              className={
                "rounded-full " +
                (i < elapsed
                  ? "bg-indigo-500 dark:bg-indigo-400"
                  : "bg-zinc-200 dark:bg-zinc-800") +
                (highlightIndices?.has(i)
                  ? " ring-2 ring-amber-500 ring-offset-1 ring-offset-white dark:ring-offset-black"
                  : "")
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
