"use client";

import { useMemo, useState } from "react";
import { clearOverride, clearOverridesForDate, setOverride } from "@/lib/direction/plan-ops";
import {
  assignmentKey,
  formatRange,
  formatShortDate,
  formatWeekday,
  fromISODate,
  indexAssignments,
  sortBlocks,
  toISODate,
} from "@/lib/direction/schedule";
import type { DayOfWeek, DirectionPlan } from "@/lib/direction/types";
import DayNav from "./DayNav";
import { BUTTON_INLINE, cx, FAINT, FIELD, LABEL, LABEL_XS, MUTED } from "./ui";

interface DateOverridesProps {
  plan: DirectionPlan;
  today: Date;
  update: (fn: (plan: DirectionPlan) => DirectionPlan) => void;
}

/**
 * One day, off-template. Typing an area here changes that date only; empty
 * puts the day back on the weekly rhythm. Every block is one input — the
 * lightest editing surface that can express "today is different".
 */
export default function DateOverrides({ plan, today, update }: DateOverridesProps) {
  const [date, setDate] = useState(today);
  const iso = toISODate(date);

  const templateIndex = useMemo(
    () => indexAssignments(plan.assignments),
    [plan.assignments]
  );
  const overridesForDate = useMemo(
    () => new Map(plan.overrides.filter((o) => o.date === iso).map((o) => [o.blockId, o.focus])),
    [plan.overrides, iso]
  );

  /** Dates that differ from the template, newest first. */
  const datesWithOverrides = useMemo(() => {
    const counts = new Map<string, number>();
    for (const override of plan.overrides) {
      counts.set(override.date, (counts.get(override.date) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [plan.overrides]);

  const blocks = sortBlocks(plan.blocks);

  const commit = (blockId: string, value: string, stored: string | undefined) => {
    const next = value.trim();
    if (next === (stored ?? "")) return;
    update((current) =>
      next === ""
        ? clearOverride(current, iso, blockId)
        : setOverride(current, iso, blockId, next)
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className={cx(LABEL, "text-zinc-700 dark:text-zinc-300")}>A single date</h2>
        <div className="flex flex-col items-end gap-2">
          <DayNav date={date} today={today} onChange={setDate} />
          <span className={cx(LABEL_XS, FAINT)}>
            {formatWeekday(date)} · {formatShortDate(date)}
          </span>
        </div>
      </div>

      <ul className="mt-6">
        {blocks.map((block) => {
          const stored = overridesForDate.get(block.id);
          const assignment = templateIndex.get(
            assignmentKey(date.getDay() as DayOfWeek, block.id)
          );
          const template = assignment?.focus ?? "";
          // The day may rename the block — show what that date actually calls it.
          const name = assignment?.label ?? block.name;
          const isOverridden = stored !== undefined;

          return (
            <li
              key={block.id}
              className="grid grid-cols-[4.5rem_minmax(0,1fr)_1.75rem] items-center gap-x-3 border-b border-black/[0.05] py-1.5 dark:border-white/[0.07]"
            >
              <div className={cx("font-mono text-[11px] tracking-tight", FAINT)}>
                {formatRange(block)}
              </div>

              <div className="flex min-w-0 items-center gap-3">
                <span className={cx(LABEL_XS, "w-40 shrink-0 truncate", MUTED)}>
                  {name}
                </span>
                <input
                  // Remount when the stored value changes so the uncommitted
                  // draft never fights an update from elsewhere.
                  key={`${iso}:${block.id}:${stored ?? ""}`}
                  defaultValue={stored ?? ""}
                  placeholder={template || "unassigned"}
                  aria-label={`${name} area on ${formatShortDate(date)}`}
                  onBlur={(event) => commit(block.id, event.target.value, stored)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                    if (event.key === "Escape") {
                      event.currentTarget.value = stored ?? "";
                      event.currentTarget.blur();
                    }
                  }}
                  className={cx(
                    FIELD,
                    "text-[13px]",
                    isOverridden ? "text-zinc-900 dark:text-zinc-100" : ""
                  )}
                />
              </div>

              {isOverridden ? (
                <button
                  type="button"
                  onClick={() =>
                    update((current) => clearOverride(current, iso, block.id))
                  }
                  aria-label={`Remove override for ${name}`}
                  title="Back to template"
                  className={cx("text-[13px] transition-colors", FAINT, "hover:text-zinc-900 dark:hover:text-zinc-100")}
                >
                  ×
                </button>
              ) : (
                <span />
              )}
            </li>
          );
        })}
      </ul>

      {datesWithOverrides.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className={cx(LABEL_XS, FAINT)}>Off template</span>
          {datesWithOverrides.map(([overrideDate, count]) => (
            <button
              key={overrideDate}
              type="button"
              onClick={() => setDate(fromISODate(overrideDate))}
              className={cx(
                "rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
                overrideDate === iso
                  ? "border-accent/40 text-zinc-900 dark:text-zinc-100"
                  : "border-black/10 text-zinc-500 hover:text-zinc-900 dark:border-white/15 dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              {formatShortDate(fromISODate(overrideDate))}
              <span className={cx("ml-1.5", FAINT)}>{count}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => update((current) => clearOverridesForDate(current, iso))}
            className={cx(BUTTON_INLINE, "ml-1")}
          >
            Clear this date
          </button>
        </div>
      )}
    </div>
  );
}
