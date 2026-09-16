"use client";

import { formatClock, formatShortDate, isSameDate } from "@/lib/direction/schedule";
import DayNav from "./DayNav";
import { cx, MUTED, NUM } from "./ui";

interface DayBarProps {
  date: Date;
  now: Date;
  isToday: boolean;
  onChangeDate: (date: Date) => void;
  onNow: () => void;
}
export default function DayBar({ date, now, isToday, onChangeDate, onNow }: DayBarProps) {
  const nextMorning = isToday && !isSameDate(date, now);
  return (
    <header data-day-bar className="sticky top-0 z-20 -mx-3 border-b border-black/[0.06] bg-background px-3 py-2 dark:border-white/[0.08] sm:-mx-6 sm:px-6">
      <div className="flex min-h-11 items-center gap-1.5">
        <h1 title={date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          className="min-w-0 text-[13px] font-medium leading-snug">{formatShortDate(date)}</h1>
        <span className={cx(NUM, MUTED, "ml-auto text-right text-[11px] leading-snug")}>
          <span className="whitespace-nowrap">{formatClock(now)}</span>
          {nextMorning && <span className="block">next morning</span>}
        </span>
        <DayNav date={date} onChange={onChangeDate} onNow={onNow} />
      </div>
      <dl aria-label="Work goals" className="mt-1 grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <dt className="text-[12px] font-semibold leading-[18px]">Wave Link · +5%/week</dt>
          <dd className={cx(MUTED, "text-[11px] leading-4")}>Active users</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[12px] font-semibold leading-[18px]">Income · ≥₹60k/month</dt>
          <dd className={cx(MUTED, "text-[11px] leading-4")}>Reliable income</dd>
        </div>
      </dl>
      <p className={cx(MUTED, "mt-[5px] text-[12px] leading-[18px]")}>Work: advance a goal or tackle its blocker.</p>
    </header>
  );
}
