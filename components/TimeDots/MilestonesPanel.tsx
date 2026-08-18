"use client";

import { useState } from "react";
import { formatMilestoneDate, type Milestone } from "@/lib/milestones";

// Full milestone list, independent of which scope/dot grid is currently on
// screen — a 2028 milestone won't be a dot yet on This Year, but it should
// still be findable here. Collapsed and muted by default so it doesn't
// compete with the grid; tap to see the list.
export default function MilestonesPanel({
  milestones,
}: {
  milestones: Milestone[];
}) {
  const [open, setOpen] = useState(false);

  if (milestones.length === 0) return null;

  return (
    <div className="mt-2 shrink-0 border-t border-black/5 pt-1.5 dark:border-white/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400"
      >
        <span
          aria-hidden
          className={"inline-block transition-transform " + (open ? "rotate-90" : "")}
        >
          &rsaquo;
        </span>
        Milestones ({milestones.length})
      </button>
      {open && (
        <ul className="mt-1 space-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {milestones.map((milestone) => (
            <li key={milestone.id} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              {milestone.label} &middot; {formatMilestoneDate(milestone.date)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
