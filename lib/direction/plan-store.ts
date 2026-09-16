import { createDefaultPlan } from "../life";
import { getSaveFailed, loadPlan, PLAN_STORAGE_KEY, savePlan } from "./storage";
import type { DirectionPlan } from "./types";

const listeners = new Set<() => void>();
let cached: DirectionPlan | null = null;
function emit(): void { for (const listener of listeners) listener(); }
function onStorage(event: StorageEvent): void {
  if (event.key !== PLAN_STORAGE_KEY && event.key !== null) return;
  if (event.storageArea !== window.localStorage) return;
  cached = loadPlan();
  emit();
}
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}
export function getSnapshot(): DirectionPlan {
  if (cached === null) cached = loadPlan();
  return cached;
}
export function getServerSnapshot(): null { return null; }
export function getNotSavedSnapshot(): boolean { return getSaveFailed(); }
export function getServerNotSavedSnapshot(): boolean { return false; }
export function updatePlan(fn: (plan: DirectionPlan) => DirectionPlan): void {
  const next = fn(getSnapshot());
  if (next === cached) return;
  cached = next;
  savePlan(next);
  emit();
}
export function resetPlanToDefaults(): void {
  cached = createDefaultPlan();
  savePlan(cached);
  emit();
}
