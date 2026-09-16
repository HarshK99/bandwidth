import { fromISODate } from "./schedule";

const RETURN_KEY = "bandwidth.direction.return.v2";
interface ReturnPosition { date: string; scrollY: number; blockId: string }
let memoryReturn: ReturnPosition | null = null;

export function validDate(value: string | null): string | null {
  return value && Number.isFinite(fromISODate(value).getTime()) ? value : null;
}
export function rememberToday(date: string, blockId: string): void {
  const scroller = document.querySelector<HTMLElement>("[data-direction-scroll]");
  const record = { date, scrollY: scroller?.scrollTop ?? window.scrollY, blockId };
  memoryReturn = record;
  try { window.sessionStorage.setItem(RETURN_KEY, JSON.stringify(record)); } catch { /* In-memory return still works. */ }
  // Preserve this date in the history entry that browser Back will return to.
  window.history.replaceState({ ...window.history.state, bandwidthTodayReturn: date }, "", `/direction?date=${date}`);
}
export function readTodayReturn(date: string | null): ReturnPosition | null {
  if (!validDate(date)) return null;
  let value: unknown = memoryReturn;
  try {
    const raw = window.sessionStorage.getItem(RETURN_KEY);
    if (raw) value = JSON.parse(raw);
  } catch { /* Use the in-memory return when storage is unavailable. */ }
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<ReturnPosition>;
  return record.date === date &&
    typeof record.scrollY === "number" && Number.isFinite(record.scrollY) && record.scrollY >= 0 &&
    typeof record.blockId === "string" && record.blockId.length > 0
    ? record as ReturnPosition : null;
}
