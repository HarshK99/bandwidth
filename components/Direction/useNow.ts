"use client";

import { useMemo, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let timer: number | undefined;
let snapshot = 0;
function tick(): void {
  snapshot = Date.now();
  for (const listener of listeners) listener();
  window.clearTimeout(timer);
  // Align updates with clock minutes so 07:00 and mode boundaries switch on time.
  timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000));
}
function onVisibility(): void { if (!document.hidden) tick(); }
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    tick();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", tick);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      window.clearTimeout(timer);
      timer = undefined;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", tick);
    }
  };
}
function getSnapshot(): number {
  if (!snapshot) snapshot = Date.now();
  return snapshot;
}
function getServerSnapshot(): null { return null; }
export function useNow(): Date | null {
  const epoch = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => epoch === null ? null : new Date(epoch), [epoch]);
}
