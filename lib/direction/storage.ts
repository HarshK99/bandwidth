// lib/direction/storage.ts
// Persistence for the Direction feature: localStorage only, no server, no
// database. Read/write is deliberately dumb — the stored plan replaces the
// seed wholesale rather than merging, so an edited plan never gets
// surprise entries back when lib/direction/default-plan.ts changes.

import { createDefaultPlan } from "./default-plan";
import { PLAN_VERSION, type DirectionPlan } from "./types";

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

/**
 * Bring a stored plan up to the current shape.
 *
 * The ladder goes here, one `if` per version, each one only responsible for
 * getting from n to n+1. Nothing needs converting yet — v0 (anything written
 * before versioning) differs from v1 only in fields that are optional — so
 * this is a stamp. It exists now because a migration you can't write is one
 * you didn't version for: without the number, an old plan and a new one are
 * indistinguishable and the only recovery is Reset.
 *
 * A plan from a *newer* build is left exactly as it is. It parsed and it has
 * the arrays we need; guessing at fields we don't know about, or replacing it
 * with the seed, would both destroy work this build simply can't read.
 */
function migrate(plan: DirectionPlan): DirectionPlan {
  const version = typeof plan.version === "number" ? plan.version : 0;
  if (version >= PLAN_VERSION) return plan;
  return { ...plan, version: PLAN_VERSION };
}

/** Client-only. Any unreadable/foreign value falls back to the seed plan. */
export function loadPlan(): DirectionPlan {
  if (typeof window === "undefined") return createDefaultPlan();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultPlan();
    const parsed: unknown = JSON.parse(raw);
    return isPlanShape(parsed) ? migrate(parsed) : createDefaultPlan();
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
