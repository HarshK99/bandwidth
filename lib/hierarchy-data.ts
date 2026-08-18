// lib/hierarchy-data.ts
// Flat array + parentId model — makes it trivial to add an edit UI or swap in a DB later
// without restructuring. Every node's children are simply nodes whose parentId === this node's id.
//
// v2 change: Build now branches into 4 Value Categories (Income, Equity, Audience, Career Options)
// before reaching Domains — matching Build's actual definition. The standalone "Mode" node is gone;
// Career Transition is now a real domain under Career Options, flagged temporary: true instead.
//
// v3 change: removed the single-child "General" subFunction placeholder wherever a domain had
// exactly one (it added a level without adding any real categorization) — those tasks now sit
// directly on their domain. Career Options collapses even further: its three situational tasks sit
// directly on the valueCategory itself, no domain/sub-function layer at all (temporary: true moved
// from the old "Career Transition" domain onto each task). Income Work renamed to Income, now
// covering two domains: Websites (the renamed original) and Digital Products (new).

export type NodeLevel =
  | "capacity"
  | "masterFunction"
  | "valueCategory"
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
  temporary?: boolean; // true for situational/non-permanent nodes (e.g. Career Transition tasks)
  url?: string; // leaf-only: clicking opens this in a new tab instead of no-op
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

  // ---------- MASTER FUNCTIONS ----------
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

  // ---------- VALUE CATEGORIES under Build ----------
  {
    id: "vc-income",
    label: "Income Work",
    level: "valueCategory",
    parentId: "mf-build",
    description:
      "Cash now — work that pays today. Two streams: client website work, and product sales.",
  },
  {
    id: "vc-equity",
    label: "Equity",
    level: "valueCategory",
    parentId: "mf-build",
    description: "Ownership stakes in a growing venture — long-horizon, compounding bets.",
  },
  {
    id: "vc-audience",
    label: "Audience",
    level: "valueCategory",
    parentId: "mf-build",
    description: "Attention/platform you own — reach independent of any single venture.",
  },
  {
    id: "vc-career",
    label: "Career Options",
    level: "valueCategory",
    parentId: "mf-build",
    description: "Alternative paths — employment, optionality outside self-employment.",
  },

  // ---------- DOMAINS under Value Categories (Build side) ----------
  {
    id: "dom-income",
    label: "Websites",
    level: "domain",
    parentId: "vc-income",
    description: "Freelance website design/build for clients — current primary income source.",
  },
  {
    id: "dom-digitalproducts",
    label: "Digital Products",
    level: "domain",
    parentId: "vc-income",
    description:
      "Stickers/paintings and similar products to sell — new, early-stage income stream.",
  },
  {
    id: "dom-wave",
    label: "Company Building (Wave)",
    level: "domain",
    parentId: "vc-equity",
    description: "Main long-term company bet — currently acquisition-focused.",
  },
  {
    id: "dom-sideproject",
    label: "Future Bet (Side-project)",
    level: "domain",
    parentId: "vc-equity",
    description: "Next potential startup — apps/tools, early stage.",
  },
  {
    id: "dom-brand",
    label: "Personal Brand (Content)",
    level: "domain",
    parentId: "vc-audience",
    description: "Skits/content — separate audience-building asset, not tied to Wave.",
  },

  // ---------- DOMAINS under Sustain (no Value Category layer — direct children) ----------
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
  {
    id: "dom-psychfitness",
    label: "Psychological Fitness",
    level: "domain",
    parentId: "mf-sustain",
    description:
      "Confidence, communication, and emotional resilience — the internal capacity Build execution actually runs on.",
  },

  // ---------- SUB-FUNCTIONS: Websites ----------
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

  // ---------- TASKS: Digital Products (direct — no sub-function layer yet) ----------
  {
    id: "task-digitalproducts-sell",
    label: "Design + list stickers/paintings for sale",
    level: "task",
    parentId: "dom-digitalproducts",
    meta: "Ad-hoc",
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

  // ---------- SUB-FUNCTIONS: Future Bet (build steps, not parallel categories —
  // see the UI note in docs/PRODUCT_SPEC.md about sequential vs. categorical children) ----------
  {
    id: "sub-sideproject-ideation",
    label: "Ideation",
    level: "subFunction",
    parentId: "dom-sideproject",
    description: "Validate and refine the concept before building anything.",
  },
  {
    id: "sub-sideproject-dev",
    label: "Development",
    level: "subFunction",
    parentId: "dom-sideproject",
    description: "Actually building the thing.",
  },
  {
    id: "sub-sideproject-content",
    label: "Content (Distribution)",
    level: "subFunction",
    parentId: "dom-sideproject",
    description: "Content/marketing lined up so launch has somewhere to land.",
  },

  // ---------- TASKS: Future Bet build steps ----------
  {
    id: "task-sideproject-brainstorm",
    label: "Brainstorm + validate concept",
    level: "task",
    parentId: "sub-sideproject-ideation",
    meta: "Sunday Morning 9:00-12:00 (optional)",
  },
  {
    id: "task-sideproject-mvp",
    label: "Build MVP",
    level: "task",
    parentId: "sub-sideproject-dev",
    meta: "Ad-hoc",
  },
  {
    id: "task-sideproject-launchcontent",
    label: "Create launch content/marketing",
    level: "task",
    parentId: "sub-sideproject-content",
    meta: "Ad-hoc",
  },

  // ---------- Personal Brand: tasks sit directly on the domain (no sub-function layer) ----------
  {
    id: "task-brand-scripting",
    label: "Skit scripting/ideas",
    level: "task",
    parentId: "dom-brand",
    meta: "Mon/Thu CTP",
  },
  {
    id: "task-brand-filming",
    label: "Skit filming",
    level: "task",
    parentId: "dom-brand",
    meta: "Saturday 9:00-11:00 (daylight)",
  },
  {
    id: "task-brand-editing",
    label: "Skit editing/planning",
    level: "task",
    parentId: "dom-brand",
    meta: "Hobbies 8:00-10:00",
  },

  // ---------- Career Options: three situational tasks sit directly on the value
  // category itself — no domain, no sub-function. temporary: true marks them as
  // active-but-not-permanent; once resolved these get removed or promoted to a
  // real domain, not folded back into a placeholder layer. ----------
  {
    id: "task-career-techprep",
    label: "Interview technical prep (DSA/system design)",
    level: "task",
    parentId: "vc-career",
    meta: "Daily 8:00-9:00am",
    temporary: true,
  },
  {
    id: "task-career-behavioral",
    label: "Resume tailoring / STAR stories / mock interviews",
    level: "task",
    parentId: "vc-career",
    meta: "Mon/Wed/Fri 6:00-7:00pm",
    temporary: true,
  },
  {
    id: "task-career-applications",
    label: "Job applications + company research",
    level: "task",
    parentId: "vc-career",
    meta: "Mon/Thu Admin 1:00-2:30pm",
    temporary: true,
  },

  // ---------- Sustain domains — task(s) sit directly on the domain (no sub-function layer) ----------
  {
    id: "task-health-workout",
    label: "Daily workout",
    level: "task",
    parentId: "dom-health",
    meta: "Daily 7:30-8:00am",
  },

  {
    id: "task-relationships-time",
    label: "Protected family/friends time",
    level: "task",
    parentId: "dom-relationships",
    meta: "Sunday 6:00-9:00pm",
  },

  {
    id: "task-rest-hobbies",
    label: "Painting / Netflix / hobbies",
    level: "task",
    parentId: "dom-rest",
    meta: "Daily 8:00-10:00pm",
  },
  {
    id: "task-rest-review",
    label: "Weekly review + next week planning",
    level: "task",
    parentId: "dom-rest",
    meta: "Sunday CTP",
  },

  {
    id: "task-financial-trading",
    label: "Trading research + portfolio review + execute trades",
    level: "task",
    parentId: "dom-financial",
    meta: "Sunday 5:00-5:45pm",
  },

  {
    id: "task-lifeadmin-errands",
    label: "Errands / bills / home maintenance",
    level: "task",
    parentId: "dom-lifeadmin",
    meta: "Saturday 1:00-2:00pm",
  },

  {
    id: "task-learning-reading",
    label: "Reading rotation (day-themed)",
    level: "task",
    parentId: "dom-learning",
    meta: "Daily Buffer 2:50-3:20pm",
    url: "https://linkshelf-three.vercel.app/",
  },

  // ---------- SUB-FUNCTIONS: Psychological Fitness ----------
  // Milestone challenges, not recurring tasks — no meta (it's calendar-slot-
  // shaped everywhere else in this data); the challenge itself lives in
  // description. Graduated/one-off, done when done, not on a schedule.
  {
    id: "sub-psych-confidence",
    label: "Confidence / Public Speaking",
    level: "subFunction",
    parentId: "dom-psychfitness",
    description: "Comfort taking up space and speaking without needing permission.",
  },
  {
    id: "sub-psych-fluency",
    label: "Fluency",
    level: "subFunction",
    parentId: "dom-psychfitness",
    description:
      "Speaking smoothly (no stumbling/filler words) and articulating thoughts clearly — delivery and clarity together.",
  },
  {
    id: "sub-psych-fearofjudgment",
    label: "Fear of Being Judged",
    level: "subFunction",
    parentId: "dom-psychfitness",
    description: "Building tolerance for visibility and imperfection in front of others.",
  },

  // ---------- CHALLENGES: Confidence / Public Speaking ----------
  {
    id: "task-psych-confidence-speakup",
    label: "Speak up unprompted in a group of 5+",
    level: "task",
    parentId: "sub-psych-confidence",
  },
  {
    id: "task-psych-confidence-toast",
    label: "Give a short toast or impromptu speech",
    level: "task",
    parentId: "sub-psych-confidence",
  },
  {
    id: "task-psych-confidence-recordwatch",
    label: "Record yourself giving a talk and watch it back",
    level: "task",
    parentId: "sub-psych-confidence",
  },

  // ---------- CHALLENGES: Fluency ----------
  {
    id: "task-psych-fluency-impromptu",
    label: "Do a 2-minute impromptu talk on a random topic, no filler words",
    level: "task",
    parentId: "sub-psych-fluency",
  },
  {
    id: "task-psych-fluency-explainsimple",
    label: "Explain a complex idea simply, out loud, to someone else",
    level: "task",
    parentId: "sub-psych-fluency",
  },

  // ---------- CHALLENGES: Fear of Being Judged ----------
  {
    id: "task-psych-fearofjudgment-postpublic",
    label: "Post something publicly without over-editing it first",
    level: "task",
    parentId: "sub-psych-fearofjudgment",
  },
  {
    id: "task-psych-fearofjudgment-askquestion",
    label: "Ask a question in a group you'd normally hold back on",
    level: "task",
    parentId: "sub-psych-fearofjudgment",
  },
  {
    id: "task-psych-fearofjudgment-sharework",
    label: "Share an unfinished/imperfect piece of work with someone",
    level: "task",
    parentId: "sub-psych-fearofjudgment",
  },
];

// ---------- Query helpers ----------
// Pure functions over hierarchyData so navigation/UI code never walks
// parentId links directly. Swapping the data source later (DB, edit UI)
// only changes hierarchyData's origin, not these signatures. Purely
// parentId-driven — no assumption about level order or a fixed depth, so
// branches of uneven depth (e.g. some paths passing through valueCategory,
// others skipping straight from masterFunction to domain, or straight from
// valueCategory to task) work the same.

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
