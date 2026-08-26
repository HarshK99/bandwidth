"use client";

import { useMemo } from "react";
import { formatHours, getWeeklyRollup } from "@/lib/direction/rollup";
import { shortDayName } from "@/lib/direction/schedule";
import { useDirectionPlan } from "./useDirectionPlan";
import { CARD, cx, FAINT, LABEL, LABEL_XS, MUTED, STRONG } from "./ui";

/**
 * Where the week actually goes, read off the plan rather than estimated.
 *
 * Not a dashboard: no trends, no targets, no streaks. It answers two
 * questions you can't answer from Today or Week — how the hours divide, and
 * what the hierarchy names that the week never gets to.
 */
export default function HoursView() {
  const { plan } = useDirectionPlan();
  const rollup = useMemo(() => (plan ? getWeeklyRollup(plan) : null), [plan]);

  if (!rollup) return <div className="h-40" aria-hidden />;

  const { rows, gaps, byDay, namedMinutes, unnamedMinutes } = rollup;
  const awake = namedMinutes + unnamedMinutes;
  const top = Math.max(...rows.map((row) => row.minutes), 1);
  const peakDay = Math.max(...byDay.map((entry) => entry.minutes), 1);

  return (
    <section className="mx-auto w-full max-w-3xl pt-6 pb-20 sm:pt-8">
      <header>
        <div className={cx(LABEL, FAINT)}>A week</div>
        <h1 className={cx("mt-1.5 text-[15px] font-medium tracking-[-0.01em]", STRONG)}>
          {formatHours(namedMinutes)} claimed · {formatHours(unnamedMinutes)} open
          <span className={cx("ml-1.5 font-normal", FAINT)}>of {formatHours(awake)} awake</span>
        </h1>

        <div className="mt-4 flex h-[3px] w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.09]">
          <div
            className="h-full bg-accent"
            style={{ width: `${(namedMinutes / awake) * 100}%` }}
            aria-hidden
          />
        </div>
      </header>

      {/* Where it goes */}
      <ul className={cx(CARD, "mt-8 px-3 py-1")}>
        {rows.map(({ node, minutes, viaMinutes, depth }) => (
          <li
            key={node.id}
            className="grid grid-cols-[minmax(0,1fr)_5rem_4rem] items-center gap-x-3 border-b border-black/[0.05] py-2 last:border-b-0 dark:border-white/[0.07]"
          >
            <span
              className={cx(
                "truncate",
                depth === 0 ? cx(LABEL, STRONG) : depth === 1 ? "text-[13px] font-medium" : "text-[13px]",
                depth >= 2 && (minutes === 0 ? FAINT : MUTED)
              )}
              style={{ paddingLeft: `${depth * 0.85}rem` }}
            >
              {node.label}
            </span>

            <span aria-hidden className="flex h-1 items-center">
              {minutes > 0 && (
                <span
                  className="h-1 rounded-full bg-foreground/20"
                  style={{ width: `${Math.max(4, (minutes / top) * 100)}%` }}
                />
              )}
            </span>

            <span
              className={cx(
                "text-right text-[13px] tabular-nums",
                minutes === 0 ? FAINT : depth === 0 ? STRONG : MUTED
              )}
            >
              {minutes === 0 ? "—" : formatHours(minutes)}
              {viaMinutes > 0 && (
                <span className={cx("ml-1.5 text-[11px]", FAINT)}>
                  +{formatHours(viaMinutes)}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <p className={cx("mt-2 text-[11px]", FAINT)}>
        +Xh is work done elsewhere but aimed here — content shot under Personal
        Brand for Wave, say. Real investment, not this branch&apos;s own time.
      </p>

      {/* Load per day */}
      <h2 className={cx(LABEL, "mt-10 text-zinc-700 dark:text-zinc-300")}>Claimed per day</h2>
      <ul className="mt-3 flex items-end gap-2">
        {byDay.map(({ day, minutes }) => (
          <li key={day} className="flex flex-1 flex-col items-center gap-2">
            <span className={cx("text-[11px] tabular-nums", MUTED)}>{formatHours(minutes)}</span>
            <span
              aria-hidden
              className="w-full rounded-t-sm bg-foreground/15"
              style={{ height: `${Math.max(4, (minutes / peakDay) * 72)}px` }}
            />
            <span className={cx(LABEL_XS, FAINT)}>{shortDayName(day)}</span>
          </li>
        ))}
      </ul>

      {/* What never gets a slot */}
      <h2 className={cx(LABEL, "mt-10 text-zinc-700 dark:text-zinc-300")}>
        Nothing points here
      </h2>
      {gaps.length === 0 ? (
        <p className={cx("mt-2 text-[13px]", MUTED)}>
          Every part of the hierarchy has time somewhere.
        </p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {gaps.map((node) => (
            <li
              key={node.id}
              className="rounded-full border border-black/10 px-2.5 py-1 text-[12px] text-zinc-600 dark:border-white/15 dark:text-zinc-400"
            >
              {node.label}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
