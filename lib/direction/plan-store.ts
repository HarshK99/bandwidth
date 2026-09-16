import { createDefaultPlan } from "../life";
import { getSaveFailed, loadPlan, PLAN_STORAGE_KEY, readStoredPlan, savePlan } from "./storage";
import type { DirectionPlan } from "./types";

const listeners = new Set<() => void>();
let cached: DirectionPlan | null = null;
let savedBaseline: string | null = null;
function emit(): void { for (const listener of listeners) listener(); }
function reconcile(): boolean {
  getSnapshot();
  const stored = readStoredPlan();
  if (!stored) return true;
  const serialized = JSON.stringify(stored);
  // Keep unsaved local edits. Do not let a retry overwrite newer saved work.
  if (getSaveFailed()) return serialized === savedBaseline;
  if (JSON.stringify(cached) !== serialized) cached = stored;
  savedBaseline = serialized;
  return true;
}
function onStorage(event: StorageEvent): void {
  if (event.key !== PLAN_STORAGE_KEY && event.key !== null) return;
  if (event.storageArea !== window.localStorage) return;
  reconcile();
  emit();
}
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    window.addEventListener("storage", onStorage);
    reconcile();
    emit();
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}
export function getSnapshot(): DirectionPlan {
  if (cached === null) {
    cached = loadPlan();
    savedBaseline = JSON.stringify(cached);
  }
  return cached;
}
export function getServerSnapshot(): null { return null; }
export function getNotSavedSnapshot(): boolean { return getSaveFailed(); }
export function getServerNotSavedSnapshot(): boolean { return false; }
export function updatePlan(fn: (plan: DirectionPlan) => DirectionPlan): boolean {
  if (!reconcile()) return false;
  const next = fn(getSnapshot());
  if (next === cached) { emit(); return true; }
  cached = next;
  if (savePlan(next)) savedBaseline = JSON.stringify(next);
  emit();
  return true;
}
export function resetPlanToDefaults(): void {
  cached = createDefaultPlan();
  if (savePlan(cached)) savedBaseline = JSON.stringify(cached);
  emit();
}
