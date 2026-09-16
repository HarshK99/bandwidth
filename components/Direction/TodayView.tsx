"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { eventsForOperationalDate, operationalBounds } from "@/lib/calendar/day-events";
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

  useEffect(() => { if (date) syncCalendar(date); }, [syncCalendar, date]);

  useEffect(() => {
    const scroller = sectionRef.current?.closest<HTMLElement>("[data-direction-scroll]");
    const header = sectionRef.current?.querySelector<HTMLElement>("[data-day-bar]");
    if (!scroller || !header) return;
    const measure = () => { scroller.style.scrollPaddingTop = `${header.offsetHeight + 16}px`; };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => { observer.disconnect(); scroller.style.scrollPaddingTop = ""; };
  }, [dateISO, Boolean(plan && now)]);

  const schedule = useMemo(
    () => plan && date && now ? getDaySchedule(plan, date, now) : null,
    [plan, date, now],
  );
  const ruler = useMemo(() => schedule ? getDayRuler(schedule.blocks) : null, [schedule]);
  const dayEvents = useMemo(
    () => calendarState?.connected && date ? eventsForOperationalDate(calendarState.events, date) : [],
    [calendarState, date],
  );
  const ready = Boolean(schedule && now && date && ruler);
  const isToday = Boolean(date && now && isSameDate(date, getOperationalDate(now)));

  useEffect(() => {
    if (!ready || !dateISO) return;
    if (window.location.hash !== "#restore-block" && window.history.state?.bandwidthTodayReturn !== dateISO) return;
    const record = readTodayReturn(dateISO);
    if (!record) return;
    let cancelled = false;
    const restore = () => {
      if (cancelled) return;
      const historyState = { ...window.history.state };
      delete historyState.bandwidthTodayReturn;
      window.history.replaceState(historyState, "", `/direction?date=${dateISO}`);
      document.getElementById(`direction-block-${record.blockId}`)?.focus({ preventScroll: true });
      sectionRef.current?.closest<HTMLElement>("[data-direction-scroll]")?.scrollTo({ top: record.scrollY, behavior: "instant" });
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
      const scroller = sectionRef.current?.closest<HTMLElement>("[data-direction-scroll]");
      if (!scroller) return;
      const top = target ? target.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - headerHeight - 16 : 0;
      scroller.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [ready, isToday, dateISO, jumpRequest]);

  if (!schedule || !now || !date || !dateISO || !ruler) return <div className="h-40" aria-hidden />;
  const { entries, current, next, minutesUntilNext } = schedule;
  const firstStart = entries.length ? operationalMinute(entries[0].block.start) : 1440;
  const lastEnd = entries.length ? (entries.at(-1)!.block.end === "07:00" ? 1440 : operationalMinute(entries.at(-1)!.block.end)) : 1440;
  const bounds = operationalBounds(date);
  const calendarCovered = calendarState?.timeMinMs != null && calendarState?.timeMaxMs != null &&
    calendarState.timeMinMs <= bounds.startMs && calendarState.timeMaxMs >= bounds.endMs;
  const calendarMessage = !calendarState?.connected ? null
    : !calendarState.configured ? "Calendar connection is unavailable. Showing saved events."
    : calendarState.status === "error" ? "Calendar refresh failed. Saved events may be out of date."
    : calendarState.status === "syncing" ? "Refreshing Calendar…"
    : !calendarCovered ? "Calendar has not synced this day yet."
    : null;
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
      {calendarMessage && <p role="status" className={cx("mt-3 text-[12px]", MUTED)}>{calendarMessage}</p>}
      {entries.length === 0 && (
        <p className={cx("mt-12 text-sm", MUTED)}>No blocks on this day. The time is open.</p>
      )}
        <>
          {entries.length > 0 && isToday && !current && <p role="status" className={cx("mt-4 text-[13px]", MUTED)}>{gapMessage}</p>}
          <div className={cx("relative mt-6 sm:mt-8", dayEvents.length > 0 && "pr-20")}>
            <ol ref={timelineRef} aria-label="Day timeline">
              {firstStart > 0 && <OpenTime start={0} end={firstStart} />}
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
              {lastEnd < 1440 && <OpenTime start={lastEnd} end={1440} />}
            </ol>
            {dayEvents.length > 0 && <EventsLane key={dateISO} events={dayEvents} timelineRef={timelineRef} entries={entries} date={date} nowMs={now.getTime()} />}
          </div>
        </>
    </section>
  );
}

/** Real open time supplies geometry even when a day has no scheduled blocks. */
function OpenTime({ start, end }: { start: number; end: number }) {
  const clock = (minute: number) => {
    const value = (minute + 420) % 1440;
    return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  };
  return (
    <li data-open-start={start} data-open-end={end}
      className={cx("pl-13 py-3 text-[12px] sm:pl-15", MUTED)}
      style={{ minHeight: Math.min(190, 48 + (end - start) * 0.28) }}>
      <span className="block tabular-nums">{clock(start)} – {clock(end)}{end === 1440 ? " · next morning" : ""}</span>
      Open time
    </li>
  );
}
