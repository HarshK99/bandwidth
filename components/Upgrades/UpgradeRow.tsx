"use client";

import { useState } from "react";
import { cx, LABEL_XS } from "@/components/Direction/ui";
import { formatUpgradeDate, type Upgrade } from "@/lib/upgrades";

export type UpgradeState = "past" | "active" | "future";

interface UpgradeRowProps {
  upgrade: Upgrade;
  state: UpgradeState;
  /** Suppresses the connector above the topmost stop on the path. */
  isFirst?: boolean;
}

// Every stop is a node centred on the path; the connector above it is the
// visible thread between stops.
const NODE: Record<UpgradeState, string> = {
  past: "h-2 w-2 bg-black/25 dark:bg-white/30",
  future:
    "h-2 w-2 border border-black/25 bg-[var(--background)] dark:border-white/30",
  active: "h-3.5 w-3.5 bg-accent ring-4 ring-accent/15",
};

export default function UpgradeRow({
  upgrade,
  state,
  isFirst,
}: UpgradeRowProps) {
  const [open, setOpen] = useState(false);
  const dateLabel = upgrade.date ? formatUpgradeDate(upgrade.date) : null;

  const titleClass = cx(
    "text-[13px]",
    state === "past"
      ? "font-medium text-zinc-400 line-through decoration-1 dark:text-zinc-500"
      : "font-semibold text-zinc-600 dark:text-zinc-300"
  );

  return (
    <li
      className={cx(
        "flex flex-col items-center",
        state === "active" && "w-full"
      )}
    >
      {!isFirst && (
        <span
          aria-hidden
          className="h-10 w-px bg-black/[0.09] dark:bg-white/[0.12]"
        />
      )}
      <span aria-hidden className={cx("shrink-0 rounded-full", NODE[state])} />

      {state === "active" ? (
        <ActiveCard
          upgrade={upgrade}
          dateLabel={dateLabel}
          open={open}
          onToggle={() => setOpen((o) => !o)}
        />
      ) : (
        <div className="mt-3 flex max-w-[16rem] flex-col items-center text-center">
          <div className="flex items-baseline gap-2">
            {upgrade.note ? (
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className={cx(titleClass, "cursor-pointer")}
              >
                {upgrade.title}
              </button>
            ) : (
              <span className={titleClass}>{upgrade.title}</span>
            )}
            {dateLabel && (
              <span className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                {dateLabel}
              </span>
            )}
          </div>
          {open && upgrade.note && (
            <p className="mt-1 text-[12px] text-zinc-500 dark:text-zinc-400">
              {upgrade.note}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

/**
 * The lit card. Like everywhere else on this page the note is folded away —
 * the card is the toggle, tapped to open it. A card with no note is just a
 * card.
 */
function ActiveCard({
  upgrade,
  dateLabel,
  open,
  onToggle,
}: {
  upgrade: Upgrade;
  dateLabel: string | null;
  open: boolean;
  onToggle: () => void;
}) {
  const cardClass =
    "grain relative mt-4 w-full overflow-hidden rounded-2xl bg-linear-to-br " +
    "from-upgrade-from to-upgrade-to px-5 py-5 text-center text-white " +
    "shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)]";

  const inner = (
    <>
      <div className="flex flex-wrap items-baseline justify-center gap-x-2.5 gap-y-1">
        <span className={cx(LABEL_XS, "text-white")}>Now</span>
        {dateLabel && (
          <span className="text-[11px] font-medium tabular-nums text-white/60">
            since {dateLabel}
          </span>
        )}
      </div>
      <h2 className="mt-2 text-[1.9rem] leading-[1.1] font-extrabold tracking-[-0.025em] text-balance sm:text-[2.2rem]">
        {upgrade.title}
      </h2>
      {upgrade.note && open && (
        <p className="mx-auto mt-2.5 max-w-sm text-[15px] leading-snug text-white/75">
          {upgrade.note}
        </p>
      )}
      {upgrade.note && (
        <span
          aria-hidden
          className={cx(
            "mt-3 inline-block text-lg leading-none text-white/45 transition-transform",
            open && "rotate-90"
          )}
        >
          &rsaquo;
        </span>
      )}
    </>
  );

  if (!upgrade.note) return <div className={cardClass}>{inner}</div>;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={cx(cardClass, "cursor-pointer")}
    >
      {inner}
    </button>
  );
}
