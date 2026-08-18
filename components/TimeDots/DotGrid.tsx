"use client";

import { useState } from "react";
import { useFitGrid } from "./useFitGrid";
import { formatMilestoneDate, type Milestone } from "@/lib/milestones";

// Below this dot size, a ring reads as noise (or vanishes) rather than a
// highlight — fall back to a solid, unmissable fill instead.
const MILESTONE_RING_MIN_DOT_SIZE = 10;

interface DotGridProps {
  total: number;
  elapsed: number;
  // Fixed column count for calendar-style grids (e.g. life-in-weeks: one
  // column per week, one row per year). Auto-packs for the largest dot size
  // when omitted.
  columns?: number;
  // Dot index -> the milestone landing there. Empty until lib/milestones.ts
  // has entries that fall inside the current scope's window.
  milestones?: ReadonlyMap<number, Milestone>;
}

export default function DotGrid({
  total,
  elapsed,
  columns,
  milestones,
}: DotGridProps) {
  const { containerRef, layout } = useFitGrid(total, columns);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);

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
          {Array.from({ length: total }, (_, i) => {
            const milestone = milestones?.get(i);
            const isElapsed = i < elapsed;
            const useSolid = milestone && layout.dotSize < MILESTONE_RING_MIN_DOT_SIZE;
            const useRing = milestone && !useSolid;
            const isPinned = pinnedIndex === i;

            return (
              <span
                key={i}
                className="group relative"
                style={{ width: layout.dotSize, height: layout.dotSize }}
              >
                <span
                  onClick={
                    milestone
                      ? () => setPinnedIndex((cur) => (cur === i ? null : i))
                      : undefined
                  }
                  className={
                    "block h-full w-full rounded-full " +
                    (useSolid
                      ? "bg-emerald-500 dark:bg-emerald-400"
                      : isElapsed
                        ? "bg-indigo-500 dark:bg-indigo-400"
                        : "bg-zinc-200 dark:bg-zinc-800") +
                    (useRing
                      ? " ring-2 ring-emerald-500 ring-offset-1 ring-offset-white dark:ring-offset-black"
                      : "") +
                    (milestone ? " cursor-pointer" : "")
                  }
                />
                {milestone && (
                  <span
                    role="tooltip"
                    className={
                      "pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm transition-opacity dark:bg-zinc-100 dark:text-zinc-900 " +
                      (isPinned
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100")
                    }
                  >
                    {milestone.label} &middot; {formatMilestoneDate(milestone.date)}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
