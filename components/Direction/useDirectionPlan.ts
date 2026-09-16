"use client";

import { useSyncExternalStore } from "react";
import {
  getServerSnapshot, getSnapshot, subscribe, updatePlan,
  getNotSavedSnapshot, getServerNotSavedSnapshot,
} from "@/lib/direction/plan-store";

export function useDirectionPlan() {
  const plan = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const notSaved = useSyncExternalStore(subscribe, getNotSavedSnapshot, getServerNotSavedSnapshot);
  return { plan, notSaved, update: updatePlan };
}
