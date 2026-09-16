"use client";

import { BLOCK_TYPE_META } from "@/lib/direction/block-types";
import {
  blockDurationMinutes, dayName, formatRange, operationalMinute, shortDayName, sortBlocks, WEEK_DAYS,
} from "@/lib/direction/schedule";
import type { DayOfWeek, DirectionPlan } from "@/lib/direction/types";
import { CARD, cx, LABEL_XS, MUTED, NUM } from "./ui";

export interface EditingCell { blockId: string; day: DayOfWeek; anchor: HTMLElement }
interface WeekGridProps {
  plan: DirectionPlan;
  today: DayOfWeek | null;
  editing: EditingCell | null;
  onEdit: (cell: EditingCell | null) => void;
}
export default function WeekGrid({ plan, today, editing, onEdit }: WeekGridProps) {
  // Shared time lines align the week; each column still owns its own blocks.
  const boundaries = new Set([0, 1440]);
  for (const day of WEEK_DAYS) {
    for (const block of plan.week[day]) {
      const start = operationalMinute(block.start);
      boundaries.add(start);
      boundaries.add(start + blockDurationMinutes(block));
    }
  }
  const lines = [...boundaries].sort((a, b) => a - b);
  const columns = "3.5rem repeat(7, minmax(0, 1fr))";
  const rows = lines.slice(0, -1).map((start, index) =>
    `minmax(${Math.min(96, Math.max(32, (lines[index + 1] - start) * 0.5))}px, auto)`).join(" ");

  return (
    <div className="hidden lg:block">
      <div className={cx(CARD, "overflow-hidden")}>
        <div className="sticky top-0 z-20 grid border-b border-black/[0.07] bg-surface py-3 dark:border-white/[0.08]"
          style={{ gridTemplateColumns: columns }}>
          <span className="sticky left-0 bg-surface" />
          {WEEK_DAYS.map((day) => (
            <h2 key={day} className={cx(LABEL_XS, "px-2.5", today === day ? "text-zinc-900 dark:text-zinc-100" : MUTED)}>
              {shortDayName(day)}
            </h2>
          ))}
        </div>
        <div className="grid" style={{ gridTemplateColumns: columns, gridTemplateRows: rows }}>
          {lines.slice(0, -1).map((minute, index) => {
            const clock = (minute + 420) % 1440;
            const label = `${String(Math.floor(clock / 60)).padStart(2, "0")}:${String(clock % 60).padStart(2, "0")}`;
            return <div key={minute} className={cx(NUM, MUTED, "sticky left-0 z-10 border-t border-black/5 bg-surface px-1 py-2 text-[11px] dark:border-white/5")}
              style={{ gridColumn: 1, gridRow: index + 1 }}>{label}</div>;
          })}
          {WEEK_DAYS.map((day, column) => (
            <div key={day} className="border-l border-black/[0.04] dark:border-white/[0.06]"
              style={{ gridColumn: column + 2, gridRow: `1 / ${lines.length}` }}>
              {plan.week[day].length === 0 && <p className={cx(MUTED, "px-2.5 py-3 text-[12px]")}>Open day</p>}
            </div>
          ))}
          {WEEK_DAYS.flatMap((day, column) => sortBlocks(plan.week[day]).map((block) => {
            const start = operationalMinute(block.start);
            const meta = BLOCK_TYPE_META[block.type];
            const isOpen = editing?.day === day && editing.blockId === block.id;
            return (
              <button key={`${day}:${block.id}`} type="button"
                style={{
                  gridColumn: column + 2,
                  gridRow: `${lines.indexOf(start) + 1} / ${lines.indexOf(start + blockDurationMinutes(block)) + 1}`,
                  backgroundColor: meta.fill, borderColor: meta.border,
                }}
                aria-label={`${dayName(day)}, ${formatRange(block)}, ${block.name}, mode ${meta.label}`}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                onClick={(event) => onEdit(isOpen ? null : { blockId: block.id, day, anchor: event.currentTarget })}
                className={cx(
                  "relative m-px min-h-11 min-w-0 break-words rounded-lg border-l-2 px-2.5 py-2 text-left text-[12px] leading-snug transition-colors",
                  "hover:ring-1 hover:ring-black/15 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-1 dark:hover:ring-white/20",
                  isOpen && "ring-1 ring-black/30 dark:ring-white/30",
                )}>
                <span className={cx(NUM, MUTED, "mb-1 block text-[11px]")}>{formatRange(block)}</span>
                <span className="block break-words text-zinc-800 dark:text-zinc-200">{block.name}</span>
                {block.name !== meta.label && <span className={cx(MUTED, "mt-1 block text-[11px]")}>{meta.label}</span>}
              </button>
            );
          }))}
        </div>
      </div>
    </div>
  );
}
