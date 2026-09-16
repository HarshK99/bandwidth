import { BLOCK_TYPES, BLOCK_TYPE_META } from "./block-types";
import { blockDurationMinutes, operationalMinute, sortBlocks, toMinutes, WEEK_DAYS } from "./schedule";
import type { BlockType, DayOfWeek, DirectionPlan, PlanChange, PlanIssue, TimeBlock } from "./types";

export function validateDay(blocks: readonly TimeBlock[]): PlanIssue[] {
  const issues: PlanIssue[] = [];
  const ids = new Set<string>();
  const intervals: { index: number; start: number; end: number; name: string }[] = [];
  blocks.forEach((block, index) => {
    const issue = (field: string, message: string) => issues.push({ field: `blocks.${index}.${field}`, message });
    if (!block.id.trim() || ids.has(block.id)) issue("id", "Each block needs a unique ID.");
    ids.add(block.id);
    if (!block.name.trim()) issue("name", "Enter a block name.");
    if (!BLOCK_TYPES.includes(block.type)) issue("type", "Choose a listed mode.");
    const validStart = Number.isFinite(toMinutes(block.start));
    const validEnd = Number.isFinite(toMinutes(block.end));
    if (!validStart) issue("start", "Use 24-hour HH:MM, for example 08:30.");
    if (!validEnd) issue("end", "Use 24-hour HH:MM, for example 15:30.");
    if (!validStart || !validEnd) return;
    const start = operationalMinute(block.start);
    const duration = blockDurationMinutes(block);
    if (block.start === block.end || duration <= 0 || start + duration > 1440) {
      issue("end", "End must follow start within the day from 07:00 to next 07:00.");
      return;
    }
    intervals.push({ index, start, end: start + duration, name: block.name });
  });
  intervals.sort((a, b) => a.start - b.start);
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length && intervals[j].start < intervals[i].end; j++) {
      const a = intervals[i], b = intervals[j];
      issues.push({ field: `blocks.${a.index}.end`, message: `Overlaps ${b.name || "another block"}. Change the time or remove a block.` });
      issues.push({ field: `blocks.${b.index}.start`, message: `Overlaps ${a.name || "another block"}. Change the time or remove a block.` });
    }
  }
  return issues;
}

function replaceDay(plan: DirectionPlan, day: DayOfWeek, blocks: TimeBlock[]): PlanChange {
  if (!WEEK_DAYS.includes(day)) return { ok: false, issues: [{ field: "day", message: "Choose a weekday." }] };
  const issues = validateDay(blocks);
  if (issues.length) return { ok: false, issues };
  return { ok: true, plan: { ...plan, week: { ...plan.week, [day]: sortBlocks(blocks) } } };
}

export function upsertBlock(plan: DirectionPlan, day: DayOfWeek, block: TimeBlock): PlanChange {
  const blocks = plan.week[day];
  if (!blocks) return { ok: false, issues: [{ field: "day", message: "Choose a weekday." }] };
  const index = blocks.findIndex((item) => item.id === block.id);
  const next = [...blocks];
  const draftIndex = index < 0 ? next.length : index;
  next[draftIndex] = { ...block, name: block.name.trim() };
  const change = replaceDay(plan, day, next);
  if (change.ok) return change;
  const prefix = `blocks.${draftIndex}.`;
  const draftIssues = change.issues.filter((issue) => issue.field.startsWith(prefix));
  return { ok: false, issues: draftIssues.length
    ? draftIssues.map((issue) => ({ ...issue, field: issue.field.slice(prefix.length) }))
    : change.issues };
}

export function removeBlock(plan: DirectionPlan, day: DayOfWeek, blockId: string): PlanChange {
  const blocks = plan.week[day];
  if (!blocks?.some((block) => block.id === blockId)) {
    return { ok: false, issues: [{ field: "blockId", message: "This block no longer exists." }] };
  }
  return replaceDay(plan, day, blocks.filter((block) => block.id !== blockId));
}

export function copyDay(plan: DirectionPlan, source: DayOfWeek, target: DayOfWeek): PlanChange {
  if (!WEEK_DAYS.includes(source) || !WEEK_DAYS.includes(target) || source === target) {
    return { ok: false, issues: [{ field: "day", message: "Choose two different weekdays." }] };
  }
  return replaceDay(plan, target, plan.week[source].map((block) => ({ ...block })));
}

export function setBlockMode(
  plan: DirectionPlan, day: DayOfWeek, blockId: string, type: BlockType,
): PlanChange {
  const block = plan.week[day]?.find((item) => item.id === blockId);
  if (!block) return { ok: false, issues: [{ field: "blockId", message: "This block no longer exists." }] };
  if (!BLOCK_TYPES.includes(type)) return { ok: false, issues: [{ field: "type", message: "Choose a listed mode." }] };
  // Generic names follow the mode; protected names such as Sleep survive.
  const genericName = BLOCK_TYPES.some((mode) => BLOCK_TYPE_META[mode].label === block.name);
  const name = genericName ? BLOCK_TYPE_META[type].label : block.name;
  return upsertBlock(plan, day, { ...block, type, name });
}
