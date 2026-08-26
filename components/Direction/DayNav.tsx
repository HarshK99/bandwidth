"use client";

import { addDays, isSameDate } from "@/lib/direction/schedule";
import { cx, LABEL_XS } from "./ui";

interface DayNavProps {
  date: Date;
  today: Date;
  onChange: (date: Date) => void;
}

const STEP =
  "flex min-h-8 w-8 items-center justify-center text-[15px] text-zinc-500 transition-colors " +
  "hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

/**
 * Date stepper. Present but understated — the app is about today; other days
 * are a glance ahead, not a place to live.
 */
export default function DayNav({ date, today, onChange }: DayNavProps) {
  const isToday = isSameDate(date, today);

  return (
    <div className="inline-flex items-stretch rounded-full border border-black/[0.09] px-1 dark:border-white/[0.14]">
      <button
        type="button"
        onClick={() => onChange(addDays(date, -1))}
        aria-label="Previous day"
        className={cx(STEP, "rounded-full")}
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => onChange(today)}
        disabled={isToday}
        className={cx(
          LABEL_XS,
          "rounded-full px-2.5 transition-colors",
          isToday
            ? "cursor-default text-zinc-300 dark:text-zinc-600"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        )}
      >
        Today
      </button>
      <button
        type="button"
        onClick={() => onChange(addDays(date, 1))}
        aria-label="Next day"
        className={cx(STEP, "rounded-full")}
      >
        ›
      </button>
    </div>
  );
}
