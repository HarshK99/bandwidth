// lib/direction/storage.ts
// Persistence for the Direction feature: localStorage only, no server, no
// database. Read/write is deliberately dumb — the stored plan replaces the
// seed wholesale rather than merging, so an edited plan never gets
// surprise entries back when lib/direction/default-plan.ts changes.

import { createDefaultPlan } from "./default-plan";
import type { DirectionPlan } from "./types";

const STORAGE_KEY = "bandwidth.direction.plan.v1";

function isPlanShape(value: unknown): value is DirectionPlan {
  if (typeof value !== "object" || value === null) return false;
  const plan = value as Partial<DirectionPlan>;
  return (
    Array.isArray(plan.blocks) &&
    Array.isArray(plan.assignments) &&
    Array.isArray(plan.overrides)
  );
}

/** Client-only. Any unreadable/foreign value falls back to the seed plan. */
export function loadPlan(): DirectionPlan {
  if (typeof window === "undefined") return createDefaultPlan();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultPlan();
    const parsed: unknown = JSON.parse(raw);
    return isPlanShape(parsed) ? parsed : createDefaultPlan();
  } catch {
    return createDefaultPlan();
  }
}

export function savePlan(plan: DirectionPlan): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // Private mode / quota — the in-memory plan still works for this session.
  }
}

export function clearStoredPlan(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do — a failed clear just leaves the old plan in place.
  }
}
