"use client";

import { useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getSnapshot,
  resetPlanToDefaults,
  subscribe,
  updatePlan,
} from "@/lib/direction/plan-store";
import type { DirectionPlan } from "@/lib/direction/types";

interface DirectionPlanStore {
  /** null on the server and during hydration; the stored plan afterwards. */
  plan: DirectionPlan | null;
  /** Takes one of the pure helpers from lib/direction/plan-ops.ts. */
  update: (fn: (plan: DirectionPlan) => DirectionPlan) => void;
  reset: () => void;
}

export function useDirectionPlan(): DirectionPlanStore {
  const plan = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { plan, update: updatePlan, reset: resetPlanToDefaults };
}
