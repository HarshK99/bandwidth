import { createDefaultPlan } from "../life";
import { BLOCK_TYPES } from "./block-types";
import { toMinutes, WEEK_DAYS } from "./schedule";
import { validateDay } from "./plan-ops";
import type { BlockType, DirectionPlan, TimeBlock } from "./types";

export const PLAN_STORAGE_KEY = "bandwidth.direction.plan.v2";
const OLD_PLAN_KEY = "bandwidth.direction.plan.v1";
let saveFailed = false;
export function getSaveFailed(): boolean { return saveFailed; }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isBlock(value: unknown): value is TimeBlock {
  if (!isRecord(value)) return false;
  return Object.keys(value).every((key) => ["id", "name", "start", "end", "type"].includes(key)) &&
    typeof value.id === "string" && value.id.trim().length > 0 &&
    typeof value.name === "string" && value.name.trim().length > 0 &&
    typeof value.start === "string" && Number.isFinite(toMinutes(value.start)) &&
    typeof value.end === "string" && Number.isFinite(toMinutes(value.end)) &&
    typeof value.type === "string" && BLOCK_TYPES.includes(value.type as BlockType);
}
function isPlan(value: unknown): value is DirectionPlan {
  if (!isRecord(value) || value.version !== 2 || !isRecord(value.week)) return false;
  if (Object.keys(value).some((key) => key !== "version" && key !== "week")) return false;
  if (Object.keys(value.week).length !== 7) return false;
  for (const day of WEEK_DAYS) {
    const blocks: unknown = value.week[day];
    if (!Array.isArray(blocks) || !blocks.every(isBlock)) return false;
    if (validateDay(blocks).length) return false;
  }
  return true;
}
function removeOldPlan(): void {
  try { window.localStorage.removeItem(OLD_PLAN_KEY); } catch { /* Retry after the next successful save. */ }
}
/** Read saved changes without resetting data or clearing an unsaved warning. */
export function readStoredPlan(): DirectionPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isPlan(parsed) ? parsed : null;
  } catch { return null; }
}
export function loadPlan(): DirectionPlan {
  if (typeof window === "undefined") return createDefaultPlan();
  try {
    const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (isPlan(parsed)) {
      saveFailed = false;
      removeOldPlan();
      return parsed;
    }
  } catch { /* Unreadable data starts from the new defaults. */ }
  const plan = createDefaultPlan();
  savePlan(plan);
  return plan;
}
export function savePlan(plan: DirectionPlan): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
    saveFailed = false;
  } catch {
    saveFailed = true;
    return false;
  }
  removeOldPlan();
  return true;
}
export function clearStoredPlan(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(PLAN_STORAGE_KEY); }
  catch { saveFailed = true; }
}
