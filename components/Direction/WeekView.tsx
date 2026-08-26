"use client";

import { useState } from "react";
import type { DayOfWeek } from "@/lib/direction/types";
import WeekGrid, { type EditingCell } from "./WeekGrid";
import { useDirectionPlan } from "./useDirectionPlan";
import { useNow } from "./useNow";
import { cx, MUTED } from "./ui";

/**
 * The recurring week. This is the planning surface — it edits the template
 * that every week follows, never a single date (those live in Settings).
 */
export default function WeekView() {
  const { plan, update } = useDirectionPlan();
  const now = useNow();
  const [editing, setEditing] = useState<EditingCell | null>(null);

  if (!plan) return <div className="h-40" aria-hidden />;

  const today = now ? (now.getDay() as DayOfWeek) : null;

  return (
    <section className="mx-auto w-full max-w-6xl pt-9 pb-16 sm:pt-12">
      {plan.blocks.length === 0 ? (
        <p className={cx("text-sm", MUTED)}>
          No time blocks yet — set the shape of a day in Settings.
        </p>
      ) : (
        <WeekGrid
          plan={plan}
          today={today}
          editing={editing}
          onEdit={setEditing}
          update={update}
        />
      )}
    </section>
  );
}
