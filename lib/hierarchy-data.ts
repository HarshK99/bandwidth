// lib/hierarchy-data.ts
// Flat array + parentId model — makes it trivial to add an edit UI or swap in a DB later
// without restructuring. Every node's children are simply nodes whose parentId === this node's id.

export type NodeLevel =
  | "capacity"
  | "masterFunction"
  | "mode"
  | "domain"
  | "subFunction"
  | "task";

export interface HierarchyNode {
  id: string;
  label: string;
  level: NodeLevel;
  parentId: string | null;
  description?: string;
  meta?: string; // e.g. calendar slot this task lives in
}

export const hierarchyData: HierarchyNode[] = [
  // ---------- ROOT ----------
  {
    id: "capacity-root",
    label: "Total Capacity",
    level: "capacity",
    parentId: null,
    description:
      "Time + Energy — the only finite inputs everything downstream converts.",
  },

  // ---------- MASTER FUNCTIONS + MODE ----------
  {
    id: "mf-build",
    label: "Build",
    level: "masterFunction",
    parentId: "capacity-root",
    description:
      "Converts capacity into future value: income, equity, audience, career options. Gets peak-energy slots.",
  },
  {
    id: "mf-sustain",
    label: "Sustain",
    level: "masterFunction",
    parentId: "capacity-root",
    description:
      "Protects and replenishes the capacity to keep Building. Ongoing, protective.",
  },
  {
    id: "mode-transition",
    label: "Mode: Career Transition (ACTIVE)",
    level: "mode",
    parentId: "capacity-root",
    description:
      "Temporary state reallocating capacity — currently pulling the Morning slot toward job search. Reverts to Normal once resolved.",
  },

  // ---------- DOMAINS under Build ----------
  {
    id: "dom-income",
    label: "Income Work",
    level: "domain",
    parentId: "mf-build",
    description: "Client website business — current primary income source.",
  },
  {
    id: "dom-wave",
    label: "Company Building (Wave)",
    level: "domain",
    parentId: "mf-build",
    description: "Main long-term company bet — currently acquisition-focused.",
  },
  {
    id: "dom-sideproject",
    label: "Future Bet (Side-project)",
    level: "domain",
    parentId: "mf-build",
    description: "Next potential startup — apps/tools, early stage.",
  },
  {
    id: "dom-brand",
    label: "Personal Brand (Content)",
    level: "domain",
    parentId: "mf-build",
    description: "Skits/content — separate audience-building asset, not tied to Wave.",
  },

  // ---------- DOMAINS under Sustain ----------
  {
    id: "dom-health",
    label: "Physical Health",
    level: "domain",
    parentId: "mf-sustain",
    description: "Exercise, meals, sleep quality, checkups.",
  },
  {
    id: "dom-relationships",
    label: "Relationships",
    level: "domain",
    parentId: "mf-sustain",
    description: "Family, friends — protected time.",
  },
  {
    id: "dom-rest",
    label: "Rest / Reflection",
    level: "domain",
    parentId: "mf-sustain",
    description: "Hobbies, journaling, weekly review.",
  },
  {
    id: "dom-financial",
    label: "Financial Health",
    level: "domain",
    parentId: "mf-sustain",
    description: "Trading/portfolio, budgeting, taxes.",
  },
  {
    id: "dom-lifeadmin",
    label: "Life Admin",
    level: "domain",
    parentId: "mf-sustain",
    description: "Bills, errands, home maintenance, appointments.",
  },
  {
    id: "dom-learning",
    label: "Learning (general)",
    level: "domain",
    parentId: "mf-sustain",
    description: "Non-domain-specific reading/learning — buffer rotation.",
  },

  // ---------- SUB-FUNCTIONS: Income Work ----------
  {
    id: "sub-sales",
    label: "Sales / Pipeline",
    level: "subFunction",
    parentId: "dom-income",
    description:
      "Cold outreach, follow-ups, referrals, proposals/quotes. Cycle: feeds Delivery; fed by Client Relationship (referrals).",
  },
  {
    id: "sub-delivery",
    label: "Delivery / Execution",
    level: "subFunction",
    parentId: "dom-income",
    description: "Actual dev work per client engagement.",
  },
  {
    id: "sub-clientrel",
    label: "Client Relationship",
    level: "subFunction",
    parentId: "dom-income",
    description:
      "Check-ins, revisions, performance updates, upsell conversations. Feeds back into Sales via referrals.",
  },
  {
    id: "sub-ops",
    label: "Business Operations",
    level: "subFunction",
    parentId: "dom-income",
    description:
      "Pricing/packages, invoicing, contracts, portfolio/case studies, tooling. Runs underneath all three above.",
  },

  // ---------- TASKS: Sales / Pipeline ----------
  {
    id: "task-sales-outreach",
    label: "Cold outreach to prospects",
    level: "task",
    parentId: "sub-sales",
    meta: "Ad-hoc",
  },
  {
    id: "task-sales-followup",
    label: "Follow up on existing leads",
    level: "task",
    parentId: "sub-sales",
    meta: "Ad-hoc",
  },
  {
    id: "task-sales-referral",
    label: "Ask past clients for referrals",
    level: "task",
    parentId: "sub-sales",
    meta: "Ad-hoc",
  },
  {
    id: "task-sales-proposal",
    label: "Write proposal/quote",
    level: "task",
    parentId: "sub-sales",
    meta: "Wed 5:00-6:00pm (CTP)",
  },

  // ---------- TASKS: Delivery / Execution ----------
  {
    id: "task-delivery-dev",
    label: "Client website development",
    level: "task",
    parentId: "sub-delivery",
    meta: "Morning 9:00-12:00 (Mon/Wed/Fri)",
  },
  {
    id: "task-delivery-debug",
    label: "Debugging/fixes",
    level: "task",
    parentId: "sub-delivery",
    meta: "Morning 9:00-12:00",
  },

  // ---------- TASKS: Client Relationship ----------
  {
    id: "task-rel-checkin",
    label: "Client check-in call",
    level: "task",
    parentId: "sub-clientrel",
    meta: "Admin 1:00-2:30",
  },
  {
    id: "task-rel-upsell",
    label: "Upsell conversation (maintenance/SEO)",
    level: "task",
    parentId: "sub-clientrel",
    meta: "Admin 1:00-2:30",
  },

  // ---------- TASKS: Business Operations ----------
  {
    id: "task-ops-invoice",
    label: "Invoicing",
    level: "task",
    parentId: "sub-ops",
    meta: "Fri 1:00-2:30 (Admin)",
  },
  {
    id: "task-ops-portfolio",
    label: "Portfolio/case study updates",
    level: "task",
    parentId: "sub-ops",
    meta: "Admin",
  },
  {
    id: "task-ops-pricing",
    label: "Pricing/package review",
    level: "task",
    parentId: "sub-ops",
    meta: "Admin",
  },

  // ---------- SUB-FUNCTIONS: Company Building (Wave) ----------
  {
    id: "sub-wave-acquisition",
    label: "Customer Acquisition",
    level: "subFunction",
    parentId: "dom-wave",
    description: "Skill-building and actual execution are deliberately split across two slots.",
  },
  {
    id: "sub-wave-product",
    label: "Product / Tech",
    level: "subFunction",
    parentId: "dom-wave",
    description: "Currently de-prioritized — acquisition is the focus.",
  },

  // ---------- TASKS: Customer Acquisition ----------
  {
    id: "task-wave-skillbuild",
    label: "Study outreach approaches / refine pitch script",
    level: "task",
    parentId: "sub-wave-acquisition",
    meta: "Tue 5:00-6:00pm (CTP)",
  },
  {
    id: "task-wave-execute",
    label: "Actual outreach execution",
    level: "task",
    parentId: "sub-wave-acquisition",
    meta: "Thu Morning 9:00-12:00",
  },

  // ---------- TASKS: Product / Tech ----------
  {
    id: "task-wave-build",
    label: "Wave build session (if slack)",
    level: "task",
    parentId: "sub-wave-product",
    meta: "Tue/Thu Morning (compressed)",
  },

  // ---------- Future Bet (not yet broken into sub-functions) ----------
  {
    id: "sub-sideproject-general",
    label: "General",
    level: "subFunction",
    parentId: "dom-sideproject",
    description: "Not yet broken down into sub-functions.",
  },
  {
    id: "task-sideproject-build",
    label: "Side-project building",
    level: "task",
    parentId: "sub-sideproject-general",
    meta: "Sunday Morning 9:00-12:00 (optional)",
  },

  // ---------- Personal Brand (not yet broken into sub-functions) ----------
  {
    id: "sub-brand-general",
    label: "General",
    level: "subFunction",
    parentId: "dom-brand",
    description: "Not yet broken down into sub-functions.",
  },
  {
    id: "task-brand-scripting",
    label: "Skit scripting/ideas",
    level: "task",
    parentId: "sub-brand-general",
    meta: "Mon/Thu CTP",
  },
  {
    id: "task-brand-filming",
    label: "Skit filming",
    level: "task",
    parentId: "sub-brand-general",
    meta: "Saturday 9:00-11:00 (daylight)",
  },
  {
    id: "task-brand-editing",
    label: "Skit editing/planning",
    level: "task",
    parentId: "sub-brand-general",
    meta: "Hobbies 8:00-10:00",
  },

  // ---------- Sustain domains — light sub-function + task each ----------
  {
    id: "sub-health-general",
    label: "General",
    level: "subFunction",
    parentId: "dom-health",
  },
  {
    id: "task-health-workout",
    label: "Daily workout",
    level: "task",
    parentId: "sub-health-general",
    meta: "Daily 7:30-8:00am",
  },

  {
    id: "sub-relationships-general",
    label: "General",
    level: "subFunction",
    parentId: "dom-relationships",
  },
  {
    id: "task-relationships-time",
    label: "Protected family/friends time",
    level: "task",
    parentId: "sub-relationships-general",
    meta: "Sunday 6:00-9:00pm",
  },

  {
    id: "sub-rest-general",
    label: "General",
    level: "subFunction",
    parentId: "dom-rest",
  },
  {
    id: "task-rest-hobbies",
    label: "Painting / Netflix / hobbies",
    level: "task",
    parentId: "sub-rest-general",
    meta: "Daily 8:00-10:00pm",
  },
  {
    id: "task-rest-review",
    label: "Weekly review + next week planning",
    level: "task",
    parentId: "sub-rest-general",
    meta: "Sunday CTP",
  },

  {
    id: "sub-financial-general",
    label: "General",
    level: "subFunction",
    parentId: "dom-financial",
  },
  {
    id: "task-financial-trading",
    label: "Trading research + portfolio review + execute trades",
    level: "task",
    parentId: "sub-financial-general",
    meta: "Sunday 5:00-5:45pm",
  },

  {
    id: "sub-lifeadmin-general",
    label: "General",
    level: "subFunction",
    parentId: "dom-lifeadmin",
  },
  {
    id: "task-lifeadmin-errands",
    label: "Errands / bills / home maintenance",
    level: "task",
    parentId: "sub-lifeadmin-general",
    meta: "Saturday 1:00-2:00pm",
  },

  {
    id: "sub-learning-general",
    label: "General",
    level: "subFunction",
    parentId: "dom-learning",
  },
  {
    id: "task-learning-reading",
    label: "Reading rotation (day-themed)",
    level: "task",
    parentId: "sub-learning-general",
    meta: "Daily Buffer 2:50-3:20pm",
  },

  // ---------- Mode: Career Transition — tasks directly under the mode ----------
  {
    id: "task-mode-techprep",
    label: "Interview technical prep (DSA/system design)",
    level: "task",
    parentId: "mode-transition",
    meta: "Daily 8:00-9:00am",
  },
  {
    id: "task-mode-behavioral",
    label: "Resume tailoring / STAR stories / mock interviews",
    level: "task",
    parentId: "mode-transition",
    meta: "Mon/Wed/Fri 6:00-7:00pm",
  },
  {
    id: "task-mode-applications",
    label: "Job applications + company research",
    level: "task",
    parentId: "mode-transition",
    meta: "Mon/Thu Admin 1:00-2:30pm",
  },
];

// ---------- Query helpers ----------
// Pure functions over hierarchyData so navigation/UI code never walks
// parentId links directly. Swapping the data source later (DB, edit UI)
// only changes hierarchyData's origin, not these signatures.

export function getChildren(id: string | null): HierarchyNode[] {
  return hierarchyData.filter((node) => node.parentId === id);
}

export function getRoot(): HierarchyNode {
  const root = hierarchyData.find((node) => node.parentId === null);
  if (!root) {
    throw new Error(
      "hierarchyData has no root node (a node with parentId === null)"
    );
  }
  return root;
}

export function getNode(id: string): HierarchyNode | undefined {
  return hierarchyData.find((node) => node.id === id);
}

// Nearest parent first, root last.
export function getAncestors(id: string): HierarchyNode[] {
  const ancestors: HierarchyNode[] = [];
  let current = getNode(id);
  while (current?.parentId) {
    const parent = getNode(current.parentId);
    if (!parent) break;
    ancestors.push(parent);
    current = parent;
  }
  return ancestors;
}

// Root-to-node inclusive — what the breadcrumb renders directly.
export function getPath(id: string): HierarchyNode[] {
  const node = getNode(id);
  if (!node) return [];
  return [...getAncestors(id).reverse(), node];
}