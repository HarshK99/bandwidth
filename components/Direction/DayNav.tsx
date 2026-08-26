"use client";

import { addDays, isSameDate } from "@/lib/direction/schedule";
import { cx, LABEL_XS } from "./ui";

interface DayNavProps {
  date: Date;
  today: Date;
  onChange: (date: Date) => void;
}

const STEP =
  "flex min-h-8 w-8 items-center justify-center text-zinc-500 transition-colors " +
  "hover:bg-black/[0.04] hover:text-zinc-900 dark:text-zinc-400 " +
  "dark:hover:bg-white/[0.06] dark:hover:text-zinc-100";

/**
 * Date stepper. Present but understated — the app is about today; other days
 * are a glance ahead, not a place to live.
 */
export default function DayNav({ date, today, onChange }: DayNavProps) {
  const isToday = isSameDate(date, today);

  return (
    <div className="inline-flex items-stretch divide-x divide-black/10 overflow-hidden rounded-md border border-black/10 dark:divide-white/15 dark:border-white/15">
      <button
        type="button"
        onClick={() => onChange(addDays(date, -1))}
        aria-label="Previous day"
        className={STEP}
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => onChange(today)}
        disabled={isToday}
        className={cx(
          LABEL_XS,
          "px-3 transition-colors",
          isToday
            ? "cursor-default text-zinc-300 dark:text-zinc-600"
            : "text-zinc-600 hover:bg-black/[0.04] hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100"
        )}
      >
        Today
      </button>
      <button
        type="button"
        onClick={() => onChange(addDays(date, 1))}
        aria-label="Next day"
        className={STEP}
      >
        ›
      </button>
    </div>
  );
}
