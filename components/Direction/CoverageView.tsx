"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { filterActivities, parseCoverageFilter } from "@/lib/direction/coverage";
import { readTodayReturn, validDate } from "@/lib/direction/navigation";
import { ACTIVITY_AREAS } from "@/lib/work/catalog";
import { WORK_MODES } from "@/lib/work/modes";
import type { ActivityArea, ActivityNode, CoverageFilter, Effort } from "@/lib/work/types";
import { BUTTON, CARD, cx, FIELD, LABEL, MUTED, STRONG } from "./ui";

const EFFORT_OPTIONS: readonly Effort[] = ["deep", "light", "production", "recovery"];
const EFFORT_TAGS: Record<Effort, string> = {
  deep: "Deep", light: "Light", production: "Production", recovery: "Recovery",
};

function CoverageBranch({
  node, area = false, defaultOpen = false, showEfforts,
}: {
  node: ActivityArea | ActivityNode;
  area?: boolean;
  defaultOpen?: boolean;
  showEfforts: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!("children" in node)) {
    return (
      <li className="coverage-activity">
        <span className="min-w-0 flex-1 break-words">{node.label}</span>
        {showEfforts && (
          <small className={cx("coverage-efforts", MUTED)} aria-label={node.efforts.map((effort) => WORK_MODES[effort].label).join(" or ")}>
            {node.efforts.map((effort) => EFFORT_TAGS[effort]).join(" / ")}
          </small>
        )}
      </li>
    );
  }

  const childrenId = `coverage-${node.id}`;
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={childrenId}
        className={cx("coverage-branch", area ? cx("coverage-area", LABEL, STRONG) : "coverage-group")}
      >
        <span aria-hidden className="w-3 shrink-0 text-[10px]">{open ? "▾" : "▸"}</span>
        <span className="min-w-0 break-words">{node.label}</span>
      </button>
      <ul id={childrenId} hidden={!open} className="coverage-children">
        {node.children.map((child) => (
          <CoverageBranch key={child.id} node={child} showEfforts={showEfforts} />
        ))}
      </ul>
    </li>
  );
}

export default function CoverageView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = parseCoverageFilter(new URLSearchParams(searchParams.toString()));
  const areas = filterActivities(ACTIVITY_AREAS, filter);
  const fromDate = validDate(searchParams.get("fromDate"));

  const setFilter = (key: keyof CoverageFilter, value: string) => {
    // Read the latest URL so quick changes keep the other filter's new value.
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("type");
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  };

  return (
    <section className="coverage-view mx-auto w-full max-w-3xl px-3 pb-20 sm:px-6" aria-labelledby="coverage-title">
      <header className="coverage-toolbar">
        <Link href={fromDate ? `/direction?date=${fromDate}` : "/direction"}
          onNavigate={(event) => {
            event.preventDefault();
            const record = readTodayReturn(fromDate);
            router.push(record ? `/direction?date=${record.date}#restore-block` : "/direction", { scroll: !record });
          }}
          aria-label="Back to Today" title="Back to Today" className={cx(BUTTON, "coverage-back")}>
          <span aria-hidden>←</span>
        </Link>
        <h1 id="coverage-title" className={cx(LABEL, MUTED, "mr-auto")}>Coverage</h1>
        <div className="coverage-filters">
          <select
            value={filter.area ?? ""}
            onChange={(event) => setFilter("area", event.target.value)}
            aria-label="Filter by area"
            className={cx(FIELD, "coverage-select")}
          >
            <option value="">All areas</option>
            {ACTIVITY_AREAS.map((area) => <option key={area.id} value={area.id}>{area.label}</option>)}
          </select>
          <select
            value={filter.effort ?? ""}
            onChange={(event) => setFilter("effort", event.target.value)}
            aria-label="Filter by effort"
            className={cx(FIELD, "coverage-select")}
          >
            <option value="">All efforts</option>
            {EFFORT_OPTIONS.map((effort) => <option key={effort} value={effort}>{WORK_MODES[effort].label}</option>)}
          </select>
        </div>
      </header>

      <p role="status" className="sr-only">
        {ACTIVITY_AREAS.find((area) => area.id === filter.area)?.label ?? "All areas"}
        {" · "}{filter.effort ? WORK_MODES[filter.effort].label : "All efforts"}
        {" · "}{areas.length} matching areas
      </p>
      {/* A changed filter starts a fresh tree: selected area open, groups closed. */}
      <ul key={`${filter.area ?? "all"}:${filter.effort ?? "all"}`} className={cx(CARD, "coverage-tree px-2 py-1 sm:px-3")}>
        {areas.length ? areas.map((area) => (
          <CoverageBranch key={area.id} node={area} area defaultOpen={filter.area === area.id} showEfforts={filter.effort === null} />
        )) : (
          <li className={cx("px-2 py-5 text-[13px]", MUTED)}>
            No matching activities. Change the area or effort filter to browse more choices.
          </li>
        )}
      </ul>
    </section>
  );
}
