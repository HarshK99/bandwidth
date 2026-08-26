// lib/direction/storage.ts
// Persistence for the Direction feature: localStorage only, no server, no
// database. Read/write is deliberately dumb — the stored plan replaces the
// seed wholesale rather than merging, so an edited plan never gets
// surprise entries back when lib/life changes.

import { createDefaultPlan } from "../life";
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
 * v1 → v2: node ids went from a hand-written `level-slug` scheme to a path
 * derived from where a node sits in the tree. Only ids a plan can actually
 * hold are listed — assignments and overrides point at areas and stages,
 * never at tasks.
 */
const V2_NODE_IDS: Record<string, string> = {
  "mf-build": "build",
  "mf-sustain": "sustain",
  "vc-income": "income",
  "vc-equity": "equity",
  "vc-audience": "audience",
  "vc-career": "career",
  "dom-income": "web",
  "dom-digitalproducts": "dp",
  "dom-wave": "wave",
  "dom-sideproject": "side",
  "dom-brand": "brand",
  "dom-health": "health",
  "dom-relationships": "relationships",
  "dom-rest": "rest",
  "dom-financial": "financial",
  "dom-lifeadmin": "lifeadmin",
  "dom-learning": "learning",
  "dom-psychfitness": "psych",
  "sub-web-pipeline": "web.pipeline",
  "sub-web-scoping": "web.scoping",
  "sub-web-build": "web.build",
  "sub-web-payment": "web.payment",
  "sub-web-aftercare": "web.aftercare",
  "sub-dp-design": "dp.design",
  "sub-dp-listing": "dp.listing",
  "sub-dp-fulfilment": "dp.fulfilment",
  "sub-wave-system": "wave.system",
  "sub-wave-outreach": "wave.outreach",
  "sub-sideproject-ideation": "side.ideation",
  "sub-sideproject-dev": "side.dev",
  "sub-sideproject-content": "side.content",
  "sub-brand-script": "brand.script",
  "sub-brand-shoot": "brand.shoot",
  "sub-brand-edit": "brand.edit",
  "sub-brand-growth": "brand.growth",
  "sub-career-prep": "career.prep",
  "sub-career-apply": "career.apply",
  "sub-career-interview": "career.interview",
  "sub-career-offer": "career.offer",
  "sub-psych-confidence": "psych.confidence",
  "sub-psych-fluency": "psych.fluency",
  "sub-psych-fearofjudgment": "psych.judgment",
};

function toV2(plan: DirectionPlan): DirectionPlan {
  const rename = (id: string) => V2_NODE_IDS[id] ?? id;
  return {
    ...plan,
    assignments: plan.assignments.map((assignment) => {
      const next = { ...assignment };
      if (next.nodeId) next.nodeId = rename(next.nodeId);
      if (next.serves) next.serves = rename(next.serves);
      return next;
    }),
    overrides: plan.overrides.map((override) => ({
      ...override,
      nodeId: override.nodeId ? rename(override.nodeId) : override.nodeId,
    })),
  };
}

/**
 * Bring a stored plan up to the current shape.
 *
 * The ladder goes here, one step per version, each only responsible for
 * getting from n to n+1. v0 and v1 are the same shape, so both take the same
 * step. This is exactly why the version was added before it was needed:
 * without the number, a plan holding the old node ids and one holding the new
 * ones are indistinguishable, and the only recovery would be Reset.
 *
 * A plan from a *newer* build is left exactly as it is. It parsed and it has
 * the arrays we need; guessing at fields we don't know about, or replacing it
 * with the seed, would both destroy work this build simply can't read.
 */
function migrate(plan: DirectionPlan): DirectionPlan {
  const version = typeof plan.version === "number" ? plan.version : 0;
  if (version >= PLAN_VERSION) return plan;
  const migrated = version < 2 ? toV2(plan) : plan;
  return { ...migrated, version: PLAN_VERSION };
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
