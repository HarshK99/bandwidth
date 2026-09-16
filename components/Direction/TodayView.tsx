"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { eventsForDate } from "@/lib/calendar/day-events";
import {
  formatDuration, fromISODate, getDayRuler, getDaySchedule, getOperationalDate,
  isSameDate, operationalMinute, toISODate,
} from "@/lib/direction/schedule";
import { readTodayReturn, validDate } from "@/lib/direction/navigation";
import type { DayEntry } from "@/lib/direction/types";
import DayBar from "./DayBar";
import EventsLane from "./EventsLane";
import TimelineRow from "./TimelineRow";
import { useCalendar } from "./useCalendar";
import { useDirectionPlan } from "./useDirectionPlan";
import { useNow } from "./useNow";
import { cx, MUTED } from "./ui";

function touches(a: DayEntry | undefined, b: DayEntry | undefined): boolean {
  return Boolean(a && b && a.block.end === b.block.start);
}
function openMinutesBetween(a: DayEntry | undefined, b: DayEntry | undefined): number {
  if (!a || !b) return 0;
  const end = a.block.end === "07:00" ? 1440 : operationalMinute(a.block.end);
  return Math.max(0, operationalMinute(b.block.start) - end);
}
export default function TodayView() {
  const { plan } = useDirectionPlan();
  const { state: calendarState, sync: syncCalendar } = useCalendar();
  const now = useNow();
  const router = useRouter();
  const params = useSearchParams();
  const selected = validDate(params.get("date"));
  const dateISO = selected ?? (now ? toISODate(getOperationalDate(now)) : null);
  const date = useMemo(() => dateISO ? fromISODate(dateISO) : null, [dateISO]);
  const timelineRef = useRef<HTMLOListElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [jumpRequest, setJumpRequest] = useState(0);
  const handledJump = useRef(0);

  useEffect(() => { syncCalendar(); }, [syncCalendar]);

  const schedule = useMemo(
    () => plan && date && now ? getDaySchedule(plan, date, now) : null,
    [plan, date, now],
  );
  const ruler = useMemo(() => schedule ? getDayRuler(schedule.blocks) : null, [schedule]);
  const dayEvents = useMemo(
    () => calendarState?.connected && date ? eventsForDate(calendarState.events, date) : [],
    [calendarState, date],
  );
  const ready = Boolean(schedule && now && date && ruler);
  const isToday = Boolean(date && now && isSameDate(date, getOperationalDate(now)));

  useEffect(() => {
    if (!ready || !dateISO) return;
    if (window.location.hash !== "#restore-block") return;
    const record = readTodayReturn(dateISO);
    if (!record) return;
    let cancelled = false;
    const restore = () => {
      if (cancelled) return;
      window.history.replaceState(window.history.state, "", `/direction?date=${dateISO}`);
      document.getElementById(`direction-block-${record.blockId}`)?.focus({ preventScroll: true });
      window.scrollTo({ top: record.scrollY, behavior: "instant" });
    };
    const frame = requestAnimationFrame(restore);
    // Font layout can settle after the timeline first appears.
    void document.fonts.ready.then(restore);
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [ready, dateISO]);

  useEffect(() => {
    if (!ready || !isToday || jumpRequest === handledJump.current) return;
    const frame = requestAnimationFrame(() => {
      handledJump.current = jumpRequest;
      const target = timelineRef.current?.querySelector<HTMLElement>("[data-current], [data-next]");
      const block = target?.querySelector<HTMLElement>("[data-timeline-box]");
      const headerHeight = sectionRef.current?.querySelector("[data-day-bar]")?.getBoundingClientRect().height ?? 0;
      block?.focus({ preventScroll: true });
      const top = target ? target.getBoundingClientRect().top + window.scrollY - headerHeight - 16 : 0;
      window.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [ready, isToday, dateISO, jumpRequest]);

  if (!schedule || !now || !date || !dateISO || !ruler) return <div className="h-40" aria-hidden />;
  const { entries, current, next, minutesUntilNext } = schedule;
  const gapMessage = next && minutesUntilNext !== null
    ? `Open time — ${next.name} in ${formatDuration(minutesUntilNext)}.`
    : "Open time. No more blocks today.";

  return (
    <section ref={sectionRef} className="mx-auto w-full max-w-2xl pb-16">
      <DayBar date={date} now={now} isToday={isToday}
        onChangeDate={(nextDate) => router.replace(`/direction?date=${toISODate(nextDate)}`, { scroll: false })}
        onNow={() => {
          router.replace("/direction", { scroll: false });
          setJumpRequest((request) => request + 1);
        }}
      />
      {entries.length === 0 ? (
        <p className={cx("mt-12 text-sm", MUTED)}>No blocks on this day. The time is open.</p>
      ) : (
        <>
          {isToday && !current && <p role="status" className={cx("mt-4 text-[13px]", MUTED)}>{gapMessage}</p>}
          <div className="relative mt-6 sm:mt-8">
            <ol ref={timelineRef}>
              {entries.map((entry, index) => (
                <TimelineRow key={`${dateISO}:${entry.block.id}`} entry={entry} date={dateISO}
                  isNext={isToday && next?.block.id === entry.block.id}
                  isLast={index === entries.length - 1}
                  attachedAbove={touches(entries[index - 1], entry)}
                  attachedBelow={touches(entry, entries[index + 1])}
                  openMinutesAfter={openMinutesBetween(entry, entries[index + 1])}
                  ticks={ruler.get(entry.block.id) ?? []}
                />
              ))}
            </ol>
            {dayEvents.length > 0 && <EventsLane events={dayEvents} timelineRef={timelineRef} entries={entries} date={date} nowMs={now.getTime()} />}
          </div>
        </>
      )}
    </section>
  );
}
