"use client";

import { useState } from "react";
import { cx, LABEL_XS } from "@/components/Direction/ui";
import { upgrades } from "@/lib/upgrades";
import UpgradeRow from "./UpgradeRow";

/**
 * The path runs down the centre. Top to bottom it reads future → now → past:
 * what's ahead is above (collapsed — the order there isn't decided), the one
 * you're on sits below it as the app's one lit surface, and finished work
 * descends behind you, newest first. The page opens at the top, on what
 * you're becoming now.
 */
export default function UpgradesView() {
  const [showFuture, setShowFuture] = useState(false);

  const { past, active, future } = upgrades;
  const hasFuture = future.length > 0;

  // Ahead: nearest-term nearest the active card. Behind: newest nearest it,
  // oldest at the bottom.
  const orderedFuture = [...future].reverse();
  const orderedPast = [...past].reverse();

  return (
    <div className="h-full overflow-y-auto">
      <ol className="mx-auto flex max-w-md flex-col items-center px-4 pt-10 pb-32 sm:px-6">
        {hasFuture && (
          <li className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => setShowFuture((v) => !v)}
              aria-expanded={showFuture}
              className={cx(
                LABEL_XS,
                "flex items-center gap-1.5 text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              )}
            >
              <span
                aria-hidden
                className={cx(
                  "inline-block transition-transform",
                  showFuture && "rotate-90"
                )}
              >
                &rsaquo;
              </span>
              {showFuture ? "Ahead" : `Ahead · ${future.length}`}
            </button>
          </li>
        )}

        {hasFuture &&
          showFuture &&
          orderedFuture.map((upgrade) => (
            <UpgradeRow key={upgrade.id} upgrade={upgrade} state="future" />
          ))}

        <UpgradeRow upgrade={active} state="active" isFirst={!hasFuture} />

        {orderedPast.map((upgrade) => (
          <UpgradeRow key={upgrade.id} upgrade={upgrade} state="past" />
        ))}
      </ol>
    </div>
  );
}
