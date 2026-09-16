"use client";

import { addDays } from "@/lib/direction/schedule";
import { cx, MUTED } from "./ui";

interface DayNavProps {
  date: Date;
  onChange: (date: Date) => void;
  onNow?: () => void;
}
const STEP = "flex min-h-11 min-w-11 items-center justify-center rounded-full text-lg hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2";

export default function DayNav({ date, onChange, onNow }: DayNavProps) {
  return (
    <div className={cx("inline-flex shrink-0 items-center", MUTED)}>
      <button type="button" onClick={() => onChange(addDays(date, -1))} aria-label="Previous day" className={STEP}>‹</button>
      {onNow && <button type="button" onClick={onNow} aria-label="Jump to the current block"
        className="min-h-11 min-w-11 rounded-full border border-black/10 px-2 text-[11px] hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/15 dark:hover:bg-white/5">
        Now
      </button>}
      <button type="button" onClick={() => onChange(addDays(date, 1))} aria-label="Next day" className={STEP}>›</button>
    </div>
  );
}
