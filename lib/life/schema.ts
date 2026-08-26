// lib/life/schema.ts
// The authoring format, and the machinery that turns it into the flat arrays
// the app queries.
//
// Authored nested, queried flat. Nesting is the better way to *write* a tree —
// you can't typo a parent you never write, and indentation shows the shape —
// while a flat array with parentId is the better way to *walk* one. So the
// files under areas/ nest, and `flatten()` derives every parentId at import.
//
// The key names the kind: a node has `children` (sub-areas), or `stages` (the
// phases its work moves through), or `tasks` (leaves). Never two of them —
// which is the "stages, not categories" rule made unrepresentable rather than
// merely documented.

import type {
  BlockType,
  DayOfWeek,
  TimeBlock,
  WeekAssignment,
} from "../direction/types";

// ---------- authoring shapes ----------

/** Leaves, as `localId: "Label"`. Tasks are named, never scheduled directly. */
export type TaskMap = Readonly<Record<string, string>>;

interface Described {
  readonly id: string;
  readonly label: string;
  /** Why this exists and what belongs in it. Shown as the node's description. */
  readonly about?: string;
  /** Situational rather than a permanent part of the structure. */
  readonly temporary?: boolean;
  /** Where a shipped thing lives. Carried as data; nothing renders it. */
  readonly url?: string;
}

export interface Stage extends Described {
  readonly tasks?: TaskMap;
}

export type Area = Described &
  (
    | { readonly children: readonly Area[]; readonly stages?: never; readonly tasks?: never }
    | { readonly stages: readonly Stage[]; readonly children?: never; readonly tasks?: never }
    | { readonly tasks?: TaskMap; readonly children?: never; readonly stages?: never }
  );

/**
 * A block of the day. Start and end are both explicit: the day is usually
 * contiguous, but a real gap is a real thing to be able to say.
 */
export interface DayBlock {
  readonly id: string;
  readonly label: string;
  readonly start: string;
  readonly end: string;
  readonly type: BlockType;
  /** "mon-fri", "sat sun". Omitted means every day. */
  readonly days?: string;
}

/**
 * What a block is for on given days. A bare string is shorthand for the node
 * it points at, which is most cells.
 */
export type Cell =
  | string
  | {
      /** The area or stage this slot is aimed at. */
      readonly node?: string;
      /** Which of that node's tasks, by their local ids. */
      readonly do?: readonly string[];
      /** Overrides both — what today's version of the work actually is. */
      readonly note?: string | readonly string[];
      /** Renames the block for these days only. */
      readonly label?: string;
      /** Where this slot's output is aimed, when that isn't where it sits. */
      readonly serves?: string;
    };

/** blockId → day spec → cell. Day specs: "mon", "mon wed", "mon-fri", "all". */
export type Week = Readonly<Record<string, Readonly<Record<string, Cell>>>>;

// ---------- the flat shape everything queries ----------

export type NodeKind = "area" | "stage" | "task";

export interface HierarchyNode {
  id: string;
  label: string;
  kind: NodeKind;
  parentId: string | null;
  description?: string;
  temporary?: boolean;
  url?: string;
}

// ---------- derived id types ----------
//
// The point of the whole exercise: `node: "web.pipelne"` is a compile error
// rather than a slot that silently books zero hours. Areas keep their bare id
// (unique across the tree, checked by `validate`); a stage is scoped to its
// area, a task to its stage.

type Join<P extends string, K extends string> = P extends "" ? K : `${P}.${K}`;

type TaskIds<T, P extends string> = T extends { tasks: infer M }
  ? Join<P, Extract<keyof M, string>>
  : never;

type StageIds<T, P extends string> = T extends { stages: readonly (infer S)[] }
  ? S extends { id: infer I extends string }
    ? Join<P, I> | TaskIds<S, Join<P, I>>
    : never
  : never;

/** Every id in a branch: the area itself, its descendants, stages and tasks. */
export type AreaIds<T> = T extends { id: infer I extends string }
  ?
      | I
      | (T extends { children: readonly (infer C)[] } ? AreaIds<C> : never)
      | StageIds<T, I>
      | TaskIds<T, I>
  : never;

// ---------- days ----------

const DAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const ALL_DAYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

function dayIndex(name: string): DayOfWeek {
  const index = DAY_NAMES.indexOf(name as (typeof DAY_NAMES)[number]);
  if (index < 0) throw new Error(`Unknown day "${name}"`);
  return index as DayOfWeek;
}

/**
 * "mon", "mon wed", "mon-fri", "weekends", "all" → days, in week order.
 * Ranges run through the week as written, so "sat-sun" and "fri-mon" both
 * work without the caller thinking about where the week starts.
 */
export function parseDays(spec: string): DayOfWeek[] {
  const trimmed = spec.trim();
  if (trimmed === "all") return [...ALL_DAYS];
  if (trimmed === "weekdays") return [1, 2, 3, 4, 5];
  if (trimmed === "weekends") return [6, 0];

  const days = new Set<DayOfWeek>();
  for (const token of trimmed.split(/[\s,]+/).filter(Boolean)) {
    const range = token.split("-");
    if (range.length === 1) {
      days.add(dayIndex(range[0]));
      continue;
    }
    if (range.length !== 2) throw new Error(`Bad day spec "${token}"`);
    const from = ALL_DAYS.indexOf(dayIndex(range[0]));
    const to = ALL_DAYS.indexOf(dayIndex(range[1]));
    const span = (to - from + ALL_DAYS.length) % ALL_DAYS.length;
    for (let step = 0; step <= span; step += 1) {
      days.add(ALL_DAYS[(from + step) % ALL_DAYS.length]);
    }
  }
  return ALL_DAYS.filter((day) => days.has(day));
}

// ---------- flatten ----------

function pushTasks(
  into: HierarchyNode[],
  tasks: TaskMap | undefined,
  parentId: string,
  temporary: boolean
): void {
  if (!tasks) return;
  for (const [local, label] of Object.entries(tasks)) {
    const node: HierarchyNode = {
      id: `${parentId}.${local}`,
      label,
      kind: "task",
      parentId,
    };
    if (temporary) node.temporary = true;
    into.push(node);
  }
}

function pushArea(
  into: HierarchyNode[],
  area: Area,
  parentId: string | null
): void {
  const node: HierarchyNode = {
    id: area.id,
    label: area.label,
    kind: "area",
    parentId,
  };
  if (area.about) node.description = area.about;
  if (area.temporary) node.temporary = true;
  if (area.url) node.url = area.url;
  into.push(node);

  if (area.children) {
    for (const child of area.children) pushArea(into, child, area.id);
    return;
  }

  if (area.stages) {
    for (const stage of area.stages) {
      const id = `${area.id}.${stage.id}`;
      const flat: HierarchyNode = {
        id,
        label: stage.label,
        kind: "stage",
        parentId: area.id,
      };
      if (stage.about) flat.description = stage.about;
      if (stage.temporary || area.temporary) flat.temporary = true;
      if (stage.url) flat.url = stage.url;
      into.push(flat);
      pushTasks(into, stage.tasks, id, Boolean(stage.temporary || area.temporary));
    }
    return;
  }

  pushTasks(into, area.tasks, area.id, Boolean(area.temporary));
}

/** Depth-first, authored order preserved — that's the order every view reads. */
export function flatten(roots: readonly Area[]): HierarchyNode[] {
  const nodes: HierarchyNode[] = [];
  for (const root of roots) pushArea(nodes, root, null);
  return nodes;
}

// ---------- blocks and week ----------

export function buildBlocks(day: readonly DayBlock[]): TimeBlock[] {
  return day.map((block, order) => {
    const time: TimeBlock = {
      id: block.id,
      name: block.label,
      start: block.start,
      end: block.end,
      type: block.type,
      order,
    };
    if (block.days) time.days = parseDays(block.days);
    return time;
  });
}

/**
 * The week grid → one assignment per cell per day. "all" means every day the
 * block runs, so a block that only runs weekdays needs no second list.
 */
export function buildWeek(week: Week, blocks: readonly TimeBlock[]): WeekAssignment[] {
  const byId = new Map(blocks.map((block) => [block.id, block]));
  const assignments: WeekAssignment[] = [];

  for (const [blockId, cells] of Object.entries(week)) {
    const block = byId.get(blockId);
    if (!block) throw new Error(`Week references unknown block "${blockId}"`);

    for (const [spec, cell] of Object.entries(cells)) {
      const days =
        spec.trim() === "all" ? (block.days ?? ALL_DAYS) : parseDays(spec);
      const value = typeof cell === "string" ? { node: cell } : cell;

      for (const day of days) {
        const assignment: WeekAssignment = { day, blockId };
        if (value.node) assignment.nodeId = value.node;
        if (value.do?.length) {
          assignment.tasks = value.do.map((task) => `${value.node}.${task}`);
        }
        if (value.note !== undefined) {
          assignment.note = Array.isArray(value.note)
            ? [...value.note]
            : (value.note as string);
        }
        if (value.label) assignment.label = value.label;
        if (value.serves) assignment.serves = value.serves;
        assignments.push(assignment);
      }
    }
  }

  return assignments;
}

// ---------- validation ----------

/**
 * Everything the type system can't reach: duplicate ids, a slot pointing at a
 * node that doesn't exist, a `do:` naming a task that isn't under it, blocks
 * that overlap. Runs once at import — a broken reference should fail loudly at
 * startup, not show up months later as an area quietly worth zero hours.
 */
export function validate(
  nodes: readonly HierarchyNode[],
  blocks: readonly TimeBlock[],
  assignments: readonly WeekAssignment[]
): void {
  const ids = new Set<string>();
  for (const node of nodes) {
    if (ids.has(node.id)) throw new Error(`Duplicate node id "${node.id}"`);
    ids.add(node.id);
  }
  for (const node of nodes) {
    if (node.parentId && !ids.has(node.parentId)) {
      throw new Error(`Node "${node.id}" has unknown parent "${node.parentId}"`);
    }
  }

  const blockIds = new Set<string>();
  for (const block of blocks) {
    if (blockIds.has(block.id)) throw new Error(`Duplicate block id "${block.id}"`);
    blockIds.add(block.id);
  }

  for (const assignment of assignments) {
    const where = `${assignment.blockId} (day ${assignment.day})`;
    if (assignment.nodeId && !ids.has(assignment.nodeId)) {
      throw new Error(`${where} points at unknown node "${assignment.nodeId}"`);
    }
    if (assignment.serves && !ids.has(assignment.serves)) {
      throw new Error(`${where} serves unknown node "${assignment.serves}"`);
    }
    for (const task of assignment.tasks ?? []) {
      if (!ids.has(task)) {
        throw new Error(`${where} lists unknown task "${task}"`);
      }
    }
  }
}
