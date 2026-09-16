"use client";

import { useState } from "react";
import { getOperationalDate } from "@/lib/direction/schedule";
import type { DayOfWeek } from "@/lib/direction/types";
import WeekGrid, { type EditingCell } from "./WeekGrid";
import { useDirectionPlan } from "./useDirectionPlan";
import { useNow } from "./useNow";
import { cx, MUTED } from "./ui";

export default function WeekView() {
  const { plan, update, notSaved } = useDirectionPlan();
  const now = useNow();
  const [editing, setEditing] = useState<EditingCell | null>(null);
  if (!plan) return <div className="h-40" aria-hidden />;
  const today = now ? getOperationalDate(now).getDay() as DayOfWeek : null;
  return (
    <section className="mx-auto w-full max-w-6xl pt-9 pb-16 sm:pt-12">
      {notSaved && <p role="status" className={cx("mb-4 text-[13px]", MUTED)}>Changes are not saved on this device. They remain available in this tab.</p>}
      <WeekGrid plan={plan} today={today} editing={editing} onEdit={setEditing} update={update} />
    </section>
  );
}
