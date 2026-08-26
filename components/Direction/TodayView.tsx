"use client";

import { useMemo, useState } from "react";
import {
  formatClock,
  formatDayMonth,
  formatDuration,
  formatWeekday,
  getDayProgress,
  getDaySchedule,
  isSameDate,
} from "@/lib/direction/schedule";
import DayNav from "./DayNav";
import TimelineRow from "./TimelineRow";
import { useDirectionPlan } from "./useDirectionPlan";
import { useNow } from "./useNow";
import { cx, FAINT, LABEL, MUTED, STRONG } from "./ui";

export default function TodayView() {
  const { plan } = useDirectionPlan();
  const now = useNow();
  const [selected, setSelected] = useState<Date | null>(null);

  const date = selected ?? now;
  const schedule = useMemo(
    () => (plan && date ? getDaySchedule(plan, date, now) : null),
    [plan, date, now]
  );
  const dayProgress = useMemo(
    () =>
      plan && now && date && isSameDate(date, now)
        ? getDayProgress(plan.blocks, now)
        : null,
    [plan, now, date]
  );

  // Plan and clock both land after hydration; hold the space quietly.
  if (!schedule || !now || !date) return <div className="h-40" aria-hidden />;

  const { entries, current, next, minutesUntilNext } = schedule;
  const isToday = isSameDate(date, now);

  // The one line the screen needs when no block is live.
  const started = entries.some((entry) => entry.status === "past");
  const gapMessage =
    next && minutesUntilNext !== null
      ? started
        ? `Between blocks — ${next.name.toLowerCase()} in ${formatDuration(minutesUntilNext)}`
        : `The day starts at ${next.block.start}, ${formatDuration(minutesUntilNext)} from now`
      : "Outside your blocks. The day's structure is done.";

  return (
    <section className="mx-auto w-full max-w-2xl pt-10 pb-16 sm:pt-14">
      <header>
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className={cx(LABEL, isToday ? "text-accent" : FAINT)}>
              {formatWeekday(date)}
            </div>
            <h1
              className={cx(
                "mt-2 text-xl font-medium tracking-[-0.02em] sm:text-2xl",
                STRONG
              )}
            >
              {formatDayMonth(date)}
            </h1>
          </div>
          <div className="flex flex-col items-end gap-3">
            <DayNav date={date} today={now} onChange={setSelected} />
            {isToday && (
              <span className={cx("font-mono text-[11px] tracking-tight", FAINT)}>
                {formatClock(now)}
              </span>
            )}
          </div>
        </div>

        {/* Day progress — a single hairline, no numbers. */}
        <div className="mt-6 h-px w-full bg-black/[0.09] dark:bg-white/[0.12]">
          {dayProgress !== null && (
            <div
              className="h-px bg-accent transition-[width] duration-700"
              style={{ width: `${dayProgress * 100}%` }}
              aria-hidden
            />
          )}
        </div>

        {isToday && !current && (
          <p className={cx("mt-4 text-[13px]", MUTED)}>{gapMessage}</p>
        )}
      </header>

      {entries.length === 0 ? (
        <p className={cx("mt-12 text-sm", MUTED)}>
          No time blocks yet — set the shape of a day in Settings.
        </p>
      ) : (
        <ol className="mt-8 sm:mt-10">
          {entries.map((entry, index) => (
            <TimelineRow
              key={entry.block.id}
              entry={entry}
              isNext={isToday && next?.block.id === entry.block.id}
              isLast={index === entries.length - 1}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
