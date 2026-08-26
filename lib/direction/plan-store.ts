// lib/direction/plan-store.ts
// A tiny external store over the persisted plan. The plan lives outside
// React (localStorage), is shared by all three views, and can change in
// another tab — so it's read through subscribe/getSnapshot rather than
// copied into component state.

import { clearStoredPlan, loadPlan, savePlan } from "./storage";
import type { DirectionPlan } from "./types";

type Listener = () => void;

const listeners = new Set<Listener>();

/**
 * Cached so getSnapshot stays referentially stable between notifications —
 * React re-reads it on every render and would loop otherwise.
 */
let cached: DirectionPlan | null = null;

function emit(): void {
  for (const listener of listeners) listener();
}

function onStorage(): void {
  // Another tab wrote the plan — drop the cache and let React re-read.
  cached = loadPlan();
  emit();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  if (listeners.size === 1 && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function getSnapshot(): DirectionPlan {
  if (cached === null) cached = loadPlan();
  return cached;
}

/**
 * The server has no plan. Returning null keeps the first (hydrating) render
 * identical on both sides; React re-reads getSnapshot straight afterwards.
 */
export function getServerSnapshot(): null {
  return null;
}

export function updatePlan(fn: (plan: DirectionPlan) => DirectionPlan): void {
  const next = fn(getSnapshot());
  cached = next;
  savePlan(next);
  emit();
}

export function resetPlanToDefaults(): void {
  clearStoredPlan();
  cached = loadPlan();
  emit();
}
