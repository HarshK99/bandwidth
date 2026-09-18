"use client";

import { BLOCK_TYPE_META } from "@/lib/direction/block-types";
import { summarizeLoad } from "@/lib/direction/schedule";
import type { TimeBlock } from "@/lib/direction/types";
import { CARD, cx, MUTED, NUM } from "./ui";

interface LoadSummaryProps {
  blocks: readonly TimeBlock[];
  totalMinutes: number;
  /** Sits beside the scheduled-hours figure: the week's trailing caption, or the day's heading. */
  context: string;
  /** Week view: closed by default, hours/% per type revealed on click. Day view: always open. */
  collapsible?: boolean;
}

function formatHours(minutes: number): string {
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

/** Hours and % of scheduled time by block type — reused for both the week total and the selected day. */
export default function LoadSummary({ blocks, totalMinutes, context, collapsible }: LoadSummaryProps) {
  const { rows, scheduledMinutes, openMinutes, openPercent } = summarizeLoad(blocks, totalMinutes);

  const bar = (
    <div className="my-3 flex h-2.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
      {rows.map((row) => (
        <span key={row.type} className="h-full" style={{ width: `${row.percent}%`, backgroundColor: BLOCK_TYPE_META[row.type].border }} />
      ))}
      {openPercent > 0.4 && <span className="h-full" style={{ width: `${openPercent}%` }} />}
    </div>
  );

  const rowsList = (
    <div className="grid gap-2">
      {rows.map((row) => {
        const meta = BLOCK_TYPE_META[row.type];
        return (
          <div key={row.type} className="grid grid-cols-[10px_1fr_auto_auto] items-center gap-2.5 text-[12.5px]">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: meta.border }} />
            <span>{meta.label}</span>
            <span className={cx(NUM, "min-w-[4.4em] text-right")}>{formatHours(row.minutes)}</span>
            <span className={cx(NUM, MUTED, "min-w-[3.2em] text-right")}>{Math.round(row.percent)}%</span>
          </div>
        );
      })}
      <div className="grid grid-cols-[10px_1fr_auto_auto] items-center gap-2.5 text-[12.5px]">
        <span className="h-2.5 w-2.5 rounded-[3px] bg-black/15 dark:bg-white/15" />
        <span className={MUTED}>Open</span>
        <span className={cx(NUM, MUTED, "min-w-[4.4em] text-right")}>{formatHours(openMinutes)}</span>
        <span className={cx(NUM, MUTED, "min-w-[3.2em] text-right")}>{Math.round(openPercent)}%</span>
      </div>
    </div>
  );

  if (collapsible) {
    return (
      <details className={cx(CARD, "group mt-4")}>
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
          <span className="flex items-baseline gap-2.5">
            <span
              aria-hidden
              className="h-[7px] w-[7px] shrink-0 rotate-45 border-b-[1.5px] border-r-[1.5px] border-zinc-500 transition-transform group-open:-rotate-[135deg] dark:border-zinc-400"
            />
            <span className={cx(NUM, "text-[15px] font-bold")}>{formatHours(scheduledMinutes)}</span>
            <span className={cx(MUTED, "text-[12px]")}>{context}</span>
          </span>
          <span className={cx(NUM, MUTED, "text-[12px]")}>{formatHours(openMinutes)} open</span>
        </summary>
        <div className="border-t border-black/[0.045] px-4 pb-4 pt-1 dark:border-white/[0.05]">
          {bar}
          {rowsList}
        </div>
      </details>
    );
  }

  return (
    <div className="mt-3.5 border-t border-black/[0.045] pt-3.5 dark:border-white/[0.05]">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[13px]">{context}</span>
        <span className={cx(NUM, "text-[13px] font-bold")}>{formatHours(scheduledMinutes)} scheduled</span>
      </div>
      {bar}
      {rowsList}
    </div>
  );
}
