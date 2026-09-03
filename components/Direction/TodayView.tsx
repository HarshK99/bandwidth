"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { eventsForDate } from "@/lib/calendar/day-events";
import {
  formatClock,
  formatDayMonth,
  formatDuration,
  formatWeekday,
  getDayProgress,
  getDayRuler,
  getDaySchedule,
  getDayTheme,
  isSameDate,
  toMinutes,
} from "@/lib/direction/schedule";
import type { DayEntry } from "@/lib/direction/schedule";
import DayNav from "./DayNav";
import EventsLane from "./EventsLane";
import TimelineRow from "./TimelineRow";
import { useCalendar } from "./useCalendar";
import { useDirectionPlan } from "./useDirectionPlan";
import { useNow } from "./useNow";
import { cx, FAINT, LABEL, MUTED, NUM, STRONG } from "./ui";

/**
 * Whether two blocks share a boundary. Blocks that touch are drawn as one
 * run, so a visible gap on the timeline always means unstructured time.
 */
function touches(a: DayEntry | undefined, b: DayEntry | undefined): boolean {
  return Boolean(a && b && a.block.end === b.block.start);
}

/**
 * Real elapsed minutes between two entries, when there's no block at all
 * covering that stretch — a genuinely open Tue/Thu morning, say. Used only
 * to size the gap the timeline draws, so it reads as "this much time is
 * unaccounted for" rather than the same thin sliver regardless of whether
 * it's fifteen minutes or ninety. Bounded and non-negative on purpose: this
 * is a rendering cue, not a promise to represent every wrap correctly.
 */
function openMinutesBetween(a: DayEntry | undefined, b: DayEntry | undefined): number {
  if (!a || !b) return 0;
  const gap = toMinutes(b.block.start) - toMinutes(a.block.end);
  return gap > 0 && gap < 360 ? gap : 0;
}

export default function TodayView() {
  const { plan } = useDirectionPlan();
  const { state: calendarState, sync: syncCalendar } = useCalendar();
  const now = useNow();
  const [selected, setSelected] = useState<Date | null>(null);
  const timelineRef = useRef<HTMLOListElement>(null);

  // Pull external events on open — throttled to once a minute in the store.
  useEffect(() => {
    syncCalendar();
  }, [syncCalendar]);

  const date = selected ?? now;
  const schedule = useMemo(
    () => (plan && date ? getDaySchedule(plan, date, now) : null),
    [plan, date, now]
  );
  // Both read the day's own blocks, not the plan's: a block that doesn't run
  // today must not put an hour on the ruler or stretch the progress bar.
  const ruler = useMemo(
    () => (schedule ? getDayRuler(schedule.blocks) : null),
    [schedule]
  );
  const dayProgress = useMemo(
    () =>
      schedule && now && date && isSameDate(date, now)
        ? getDayProgress(schedule.blocks, now)
        : null,
    [schedule, now, date]
  );
  const dayEvents = useMemo(
    () =>
      calendarState?.connected && date
        ? eventsForDate(calendarState.events, date)
        : [],
    [calendarState, date]
  );

  // Plan and clock both land after hydration; hold the space quietly.
  if (!schedule || !now || !date || !ruler) return <div className="h-40" aria-hidden />;

  const { entries, current, next, minutesUntilNext } = schedule;
  const isToday = isSameDate(date, now);
  const theme = getDayTheme(entries);

  // The one line the screen needs when no block is live.
  const started = entries.some((entry) => entry.status === "past");
  const gapMessage =
    next && minutesUntilNext !== null
      ? started
        ? `Between blocks — ${next.name.toLowerCase()} in ${formatDuration(minutesUntilNext)}`
        : `The day starts at ${next.block.start}, ${formatDuration(minutesUntilNext)} from now`
      : "Outside your blocks. The day's structure is done.";

  return (
    <section className="mx-auto w-full max-w-2xl pt-6 pb-16 sm:pt-8">
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
          <DayNav date={date} today={now} onChange={setSelected} />
        </div>

        <div className="mt-1.5 flex items-baseline justify-between gap-4">
          <h1 className={cx("text-[15px] font-medium tracking-[-0.01em]", STRONG)}>
            {formatDayMonth(date)}
          </h1>
          {isToday && (
            <span className={cx(NUM, "text-[11px] font-medium", FAINT)}>
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

        {isToday && !current && (
          <p className={cx("mt-4 text-[13px]", MUTED)}>{gapMessage}</p>
        )}
      </header>

      {entries.length === 0 ? (
        <p className={cx("mt-12 text-sm", MUTED)}>
          No time blocks yet — set the shape of a day in Settings.
        </p>
      ) : (
        <div className="relative mt-6 sm:mt-8">
          <ol ref={timelineRef}>
            {entries.map((entry, index) => (
              <TimelineRow
                key={entry.block.id}
                entry={entry}
                isNext={isToday && next?.block.id === entry.block.id}
                isLast={index === entries.length - 1}
                attachedAbove={touches(entries[index - 1], entry)}
                attachedBelow={touches(entry, entries[index + 1])}
                openMinutesAfter={openMinutesBetween(entry, entries[index + 1])}
                ticks={ruler.get(entry.block.id) ?? []}
              />
            ))}
          </ol>
          {dayEvents.length > 0 && (
            <EventsLane
              events={dayEvents}
              timelineRef={timelineRef}
              entries={entries}
              date={date}
              nowMs={now.getTime()}
            />
          )}
        </div>
      )}
    </section>
  );
}
