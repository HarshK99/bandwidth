"use client";

import { formatClock, formatDayMonth, formatWeekday } from "@/lib/direction/schedule";
import DayNav from "./DayNav";
import { cx, FAINT, LABEL, MUTED, NUM, STRONG } from "./ui";

interface DayBarProps {
  date: Date;
  now: Date;
  isToday: boolean;
  theme: string | null;
  /** 0–1, or null before the clock has landed / on a day that isn't today. */
  dayProgress: number | null;
  /** The one line for when no block is live; null when a block is running. */
  gapMessage: string | null;
  onChangeDate: (date: Date) => void;
}

/**
 * The day's identity and progress, pinned to the top of the scrolling view.
 * Breaks the section's width to run its hairline edge to edge, so it reads as
 * a bar the timeline slides under — not a card floating in the column.
 */
export default function DayBar({
  date,
  now,
  isToday,
  theme,
  dayProgress,
  gapMessage,
  onChangeDate,
}: DayBarProps) {
  return (
    <div className="sticky top-0 z-10 -mx-3 border-b border-black/[0.06] bg-background px-3 pt-4 pb-3 dark:border-white/[0.08] sm:-mx-6 sm:px-6">
      <header>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-baseline gap-2">
            <span className={cx(LABEL, isToday ? "text-accent" : FAINT)}>
              {formatWeekday(date)}
            </span>
            {theme && (
              <>
                <span className={cx("text-[10px]", FAINT)}>·</span>
                <span className={cx(LABEL, "truncate", MUTED)}>{theme}</span>
              </>
            )}
          </div>
          <DayNav date={date} today={now} onChange={onChangeDate} />
        </div>

        <div className="mt-1.5 flex items-baseline justify-between gap-4">
          <h1 className={cx("text-[15px] font-medium tracking-[-0.01em]", STRONG)}>
            {formatDayMonth(date)}
          </h1>
          {isToday && (
            <span className={cx(NUM, "text-[11px] font-medium", MUTED)}>
              {formatClock(now)}
            </span>
          )}
        </div>

        {/* Day progress — a single hairline, no numbers. */}
        <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.09]">
          {dayProgress !== null && (
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-700"
              style={{ width: `${dayProgress * 100}%` }}
              aria-hidden
            />
          )}
        </div>

        {gapMessage && <p className={cx("mt-4 text-[13px]", MUTED)}>{gapMessage}</p>}
      </header>
    </div>
  );
}
