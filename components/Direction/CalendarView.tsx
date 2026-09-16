"use client";

import CalendarSettings from "./CalendarSettings";

/**
 * The one connection Direction owns: a read-only Google Calendar whose events
 * layer over Today. Schedule editing lives in Week.
 */
export default function CalendarView() {
  return (
    <section className="mx-auto w-full max-w-3xl pt-9 pb-20 sm:pt-12">
      <CalendarSettings />
    </section>
  );
}
