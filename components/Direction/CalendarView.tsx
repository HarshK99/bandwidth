"use client";

import CalendarSettings from "./CalendarSettings";

/**
 * The one connection Direction owns: a read-only Google Calendar whose events
 * layer over Today. It used to be a section of a wider Settings screen; block
 * structure and single-date overrides are code-defined now (see
 * docs/PLAN_SCHEDULE.md), so the calendar link is all that screen had left.
 */
export default function CalendarView() {
  return (
    <section className="mx-auto w-full max-w-3xl pt-9 pb-20 sm:pt-12">
      <CalendarSettings />
    </section>
  );
}
