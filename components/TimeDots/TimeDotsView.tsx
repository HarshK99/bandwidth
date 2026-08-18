"use client";

import { useMemo, useState } from "react";
import DotGrid from "./DotGrid";
import MilestonesPanel from "./MilestonesPanel";
import Segmented from "./Segmented";
import {
  getLifeWeeksDots,
  getLifeYearsDots,
  getMilestoneMarkers,
  getThisMonthDots,
  getThisYearDots,
  LIFE_EXPECTANCY_YEARS,
  type DotScope,
  type LifeUnit,
  type TimeUnit,
} from "@/lib/time-dots";
import { milestones } from "@/lib/milestones";

type ScopeKind = "month" | "year" | "life";

const SCOPE_OPTIONS: { value: ScopeKind; label: string }[] = [
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "life", label: "Life" },
];

const YEAR_UNIT_OPTIONS: { value: TimeUnit; label: string }[] = [
  { value: "day", label: "Days" },
  { value: "week", label: "Weeks" },
];

const LIFE_UNIT_OPTIONS: { value: LifeUnit; label: string }[] = [
  { value: "year", label: "Years" },
  { value: "week", label: "Weeks" },
];

export default function TimeDotsView() {
  const [scopeKind, setScopeKind] = useState<ScopeKind>("year");
  const [yearUnit, setYearUnit] = useState<TimeUnit>("day");
  const [lifeUnit, setLifeUnit] = useState<LifeUnit>("year");

  // Computed once per mount/reload — dates change daily, not per-render, so
  // no timer is needed to keep this "live".
  const now = useMemo(() => new Date(), []);

  const scope: DotScope =
    scopeKind === "month"
      ? { kind: "month" }
      : scopeKind === "year"
        ? { kind: "year", unit: yearUnit }
        : { kind: "life", unit: lifeUnit };

  let total: number;
  let elapsed: number;
  let columns: number | undefined;
  let unitLabel: string;
  let suffix: string;

  if (scopeKind === "month") {
    ({ total, elapsed } = getThisMonthDots(now));
    unitLabel = "days";
    suffix = " this month";
  } else if (scopeKind === "year") {
    ({ total, elapsed } = getThisYearDots(yearUnit, now));
    unitLabel = yearUnit === "day" ? "days" : "weeks";
    suffix = " this year";
  } else if (lifeUnit === "year") {
    ({ total, elapsed } = getLifeYearsDots(now));
    unitLabel = "years";
    suffix = ` of a ${LIFE_EXPECTANCY_YEARS}-year life expectancy`;
  } else {
    const lifeWeeks = getLifeWeeksDots(now);
    total = lifeWeeks.total;
    elapsed = lifeWeeks.elapsed;
    columns = lifeWeeks.weeksPerYear;
    unitLabel = "weeks";
    suffix = ` of a ${LIFE_EXPECTANCY_YEARS}-year life expectancy`;
  }

  const remaining = total - elapsed;
  const percent = Math.round((elapsed / total) * 100);
  const milestoneMarkers = new Map(
    getMilestoneMarkers(milestones, scope, now).map((m) => [m.index, m.milestone])
  );

  return (
    <div className="flex h-full flex-col px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex flex-wrap items-center gap-2">
        <Segmented value={scopeKind} onChange={setScopeKind} options={SCOPE_OPTIONS} />
        {scopeKind === "year" && (
          <Segmented
            value={yearUnit}
            onChange={setYearUnit}
            options={YEAR_UNIT_OPTIONS}
            size="sm"
          />
        )}
        {scopeKind === "life" && (
          <Segmented
            value={lifeUnit}
            onChange={setLifeUnit}
            options={LIFE_UNIT_OPTIONS}
            size="sm"
          />
        )}
      </div>

      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {elapsed} / {total} {unitLabel} passed ({percent}%) &middot; {remaining} left
        {suffix}
      </p>

      <div className="min-h-0 flex-1 pt-2">
        <DotGrid
          key={`${scopeKind}-${scopeKind === "year" ? yearUnit : scopeKind === "life" ? lifeUnit : ""}`}
          total={total}
          elapsed={elapsed}
          columns={columns}
          milestones={milestoneMarkers}
        />
      </div>

      <MilestonesPanel milestones={milestones} />
    </div>
  );
}
