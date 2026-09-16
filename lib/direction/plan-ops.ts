import { BLOCK_TYPES, BLOCK_TYPE_META } from "./block-types";
import type { BlockType, DayOfWeek, DirectionPlan, PlanChange } from "./types";

export function setBlockMode(
  plan: DirectionPlan, day: DayOfWeek, blockId: string, type: BlockType,
): PlanChange {
  const block = plan.week[day]?.find((item) => item.id === blockId);
  if (!block) return { ok: false, issues: [{ field: "blockId", message: "This block no longer exists." }] };
  if (!BLOCK_TYPES.includes(type)) return { ok: false, issues: [{ field: "type", message: "Choose a listed mode." }] };
  // Generic names follow the mode; protected names such as Sleep survive.
  const genericName = BLOCK_TYPES.some((mode) => BLOCK_TYPE_META[mode].label === block.name);
  const name = genericName ? BLOCK_TYPE_META[type].label : block.name;
  return {
    ok: true,
    plan: { ...plan, week: { ...plan.week, [day]: plan.week[day].map((item) =>
      item.id === blockId ? { ...item, type, name } : item) } },
  };
}
