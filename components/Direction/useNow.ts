"use client";

import { useMemo, useSyncExternalStore } from "react";

const TICK_MS = 30_000;

type Listener = () => void;

const listeners = new Set<Listener>();
let timer: number | undefined;
/** Epoch ms, only advanced on a tick so the snapshot stays stable. */
let snapshot = 0;

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  if (timer === undefined && typeof window !== "undefined") {
    snapshot = Date.now();
    timer = window.setInterval(() => {
      snapshot = Date.now();
      for (const current of listeners) current();
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }
  };
}

function getSnapshot(): number {
  if (snapshot === 0) snapshot = Date.now();
  return snapshot;
}

function getServerSnapshot(): null {
  return null;
}

/**
 * The current time on a slow tick. Null on the server and during hydration
 * so nothing time-dependent can mismatch; callers hold quiet space until it
 * arrives. A minute of drift on "which block am I in" is invisible, so this
 * deliberately doesn't tick per second.
 */
export function useNow(): Date | null {
  const epoch = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Kept stable between ticks so callers can memoise on it.
  return useMemo(() => (epoch === null ? null : new Date(epoch)), [epoch]);
}
