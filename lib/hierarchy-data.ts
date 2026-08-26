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
    description:
      "Main long-term company bet. The product is built — the whole job now is getting users, so its children are an outreach system and the outreach itself, not features.",
  },
  {
    id: "dom-sideproject",
    label: "Future Bet (Side-project)",
    level: "domain",
    parentId: "vc-equity",
    description:
      "Next potential startup — apps/tools, early stage. Inherits the build capacity Wave no longer needs: this is where the appetite to build goes now.",
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

  // ---------- SUB-FUNCTIONS: Websites — the stages of an engagement ----------
  // These were categories (Sales, Delivery, Client Relationship, Business
  // Operations), which hid the fact that a client job moves through phases
  // that are genuinely different work needing different energy and different
  // slots. Now they are the sequence a job actually runs through, and
  // Business Operations is gone: every piece of it belonged to a stage —
  // case studies win work (Pipeline), pricing shapes a quote (Scoping),
  // invoicing is how a job closes (Payment).
  {
    id: "sub-web-pipeline",
    label: "Pipeline",
    level: "subFunction",
    parentId: "dom-income",
    description:
      "Finding and approaching work: cold outreach, follow-ups, referrals, and the case studies that make them land. Fed by Aftercare — the loop closes here.",
  },
  {
    id: "sub-web-scoping",
    label: "Scoping",
    level: "subFunction",
    parentId: "dom-income",
    description:
      "Turning interest into a defined job: discovery, requirements, architecture, pricing, the proposal. Thinking work — it belongs in a thinking slot, not between builds.",
  },
  {
    id: "sub-web-build",
    label: "Build",
    level: "subFunction",
    parentId: "dom-income",
    description: "Design and development against an agreed scope, plus fixes and launch.",
  },
  {
    id: "sub-web-payment",
    label: "Payment",
    level: "subFunction",
    parentId: "dom-income",
    description:
      "How a job actually ends: invoice, chase, reconcile. A stage of its own because unpaid work is unfinished work, however finished the site is.",
  },
  {
    id: "sub-web-aftercare",
    label: "Aftercare",
    level: "subFunction",
    parentId: "dom-income",
    description:
      "Check-ins, maintenance, upsells after handover — and where referrals come from, which is why this feeds back into Pipeline.",
  },

  // ---------- TASKS: Pipeline ----------
  {
    id: "task-web-outreach",
    label: "Cold outreach to prospects",
    level: "task",
    parentId: "sub-web-pipeline",
    meta: "Second push (Mon/Wed)",
  },
  {
    id: "task-web-followup",
    label: "Follow up on existing leads",
    level: "task",
    parentId: "sub-web-pipeline",
    meta: "Second push (Mon/Wed)",
  },
  {
    id: "task-web-referral",
    label: "Ask past clients for referrals",
    level: "task",
    parentId: "sub-web-pipeline",
    meta: "Second push (Wed)",
  },
  {
    id: "task-web-portfolio",
    label: "Portfolio / case study updates",
    level: "task",
    parentId: "sub-web-pipeline",
    meta: "Ad-hoc — sales assets, not admin",
  },

  // ---------- TASKS: Scoping ----------
  {
    id: "task-web-discovery",
    label: "Discovery call + requirements",
    level: "task",
    parentId: "sub-web-scoping",
    meta: "CTP (Wed)",
  },
  {
    id: "task-web-proposal",
    label: "Write proposal / quote",
    level: "task",
    parentId: "sub-web-scoping",
    meta: "CTP (Wed)",
  },
  {
    id: "task-web-pricing",
    label: "Pricing / package review",
    level: "task",
    parentId: "sub-web-scoping",
    meta: "Ad-hoc",
  },

  // ---------- TASKS: Build ----------
  {
    id: "task-web-dev",
    label: "Client website development",
    level: "task",
    parentId: "sub-web-build",
    meta: "Deep work (Mon/Wed/Fri)",
  },
  {
    id: "task-web-debug",
    label: "Debugging / fixes",
    level: "task",
    parentId: "sub-web-build",
    meta: "Deep work (Mon/Wed/Fri)",
  },

  // ---------- TASKS: Payment ----------
  {
    id: "task-web-invoice",
    label: "Invoicing",
    level: "task",
    parentId: "sub-web-payment",
    meta: "Admin (Fri)",
  },
  {
    id: "task-web-chase",
    label: "Chase + reconcile payments",
    level: "task",
    parentId: "sub-web-payment",
    meta: "Admin (Fri)",
  },

  // ---------- TASKS: Aftercare ----------
  {
    id: "task-web-checkin",
    label: "Client check-in call",
    level: "task",
    parentId: "sub-web-aftercare",
    meta: "Admin (Tue)",
  },
  {
    id: "task-web-upsell",
    label: "Upsell conversation (maintenance / SEO)",
    level: "task",
    parentId: "sub-web-aftercare",
    meta: "Admin (Tue)",
  },

  // ---------- SUB-FUNCTIONS: Digital Products — the stages of a product ----------
  {
    id: "sub-dp-design",
    label: "Design",
    level: "subFunction",
    parentId: "dom-digitalproducts",
    description: "Making the thing — the painting or sticker itself.",
  },
  {
    id: "sub-dp-listing",
    label: "Listing",
    level: "subFunction",
    parentId: "dom-digitalproducts",
    description:
      "Photograph, write, price, publish. Designed-but-unlisted is the state this stage exists to prevent.",
  },
  {
    id: "sub-dp-fulfilment",
    label: "Fulfilment",
    level: "subFunction",
    parentId: "dom-digitalproducts",
    description:
      "Orders, packing, shipping, buyer questions. Event-driven — no recurring slot, because it only exists once something sells.",
  },

  // ---------- TASKS: Digital Products stages ----------
  {
    id: "task-dp-design",
    label: "Design a sticker / painting",
    level: "task",
    parentId: "sub-dp-design",
    meta: "Hobbies (Mon)",
  },
  {
    id: "task-dp-list",
    label: "Photograph, price and publish",
    level: "task",
    parentId: "sub-dp-listing",
    meta: "Hobbies (Fri)",
  },
  {
    id: "task-dp-ship",
    label: "Pack and ship orders",
    level: "task",
    parentId: "sub-dp-fulfilment",
    meta: "Ad-hoc — when something sells",
  },

  // ---------- SUB-FUNCTIONS: Company Building (Wave) ----------
  // Product/Tech was removed when the build finished: acquisition is not a
  // phase of building, it is the work. Splitting "the system" from "doing it"
  // keeps the machine from being rebuilt every time outreach is due.
  {
    id: "sub-wave-system",
    label: "Outreach System",
    level: "subFunction",
    parentId: "dom-wave",
    description:
      "The machine: who to contact, what to say, how to follow up, what to measure. Built once and sharpened, not improvised per batch.",
  },
  {
    id: "sub-wave-outreach",
    label: "Outreach Execution",
    level: "subFunction",
    parentId: "dom-wave",
    description: "Running the machine — batches of calls, DMs and follow-ups.",
  },

  // ---------- TASKS: Outreach System ----------
  {
    id: "task-wave-icp",
    label: "Define ICP + build prospect list",
    level: "task",
    parentId: "sub-wave-system",
    meta: "CTP (Tue)",
  },
  {
    id: "task-wave-script",
    label: "Sharpen pitch + message sequences",
    level: "task",
    parentId: "sub-wave-system",
    meta: "CTP (Tue)",
  },
  {
    id: "task-wave-review",
    label: "Review outreach numbers + iterate",
    level: "task",
    parentId: "sub-wave-system",
    meta: "CTP (Tue)",
  },

  // ---------- TASKS: Outreach Execution ----------
  {
    id: "task-wave-batch",
    label: "Outreach batch — calls / DMs",
    level: "task",
    parentId: "sub-wave-outreach",
    meta: "Second push (Tue/Thu) — when people actually reply",
  },
  {
    id: "task-wave-followup",
    label: "Follow-ups + booked calls",
    level: "task",
    parentId: "sub-wave-outreach",
    meta: "Second push (Tue/Thu)",
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
    meta: "Deep work (Sun, optional)",
  },
  {
    id: "task-sideproject-mvp",
    label: "Build MVP",
    level: "task",
    parentId: "sub-sideproject-dev",
    meta: "Deep work (Tue/Thu)",
  },
  {
    id: "task-sideproject-launchcontent",
    label: "Create launch content/marketing",
    level: "task",
    parentId: "sub-sideproject-content",
    meta: "Ad-hoc",
  },

  // ---------- SUB-FUNCTIONS: Personal Brand ----------
  // Given stages, like Websites, because content is a pipeline rather than a
  // single activity: each stage has its own energy and its own slot, and the
  // one that actually grows the page (Distribution) is the one that used to
  // go missing.
  {
    id: "sub-brand-script",
    label: "Scripting",
    level: "subFunction",
    parentId: "dom-brand",
    description: "Ideas and scripts — thinking work, not production.",
  },
  {
    id: "sub-brand-shoot",
    label: "Shooting",
    level: "subFunction",
    parentId: "dom-brand",
    description: "Filming. Needs daylight, so it takes daytime slots.",
  },
  {
    id: "sub-brand-edit",
    label: "Editing",
    level: "subFunction",
    parentId: "dom-brand",
    description: "Cutting and assembling — low-stakes evening work.",
  },
  {
    id: "sub-brand-growth",
    label: "Distribution / Growth",
    level: "subFunction",
    parentId: "dom-brand",
    description:
      "Posting, replying, engaging. The stage that actually grows the page, and the easiest one to skip.",
  },

  // ---------- TASKS: Personal Brand stages ----------
  {
    id: "task-brand-scripting",
    label: "Skit scripting / ideas",
    level: "task",
    parentId: "sub-brand-script",
    meta: "CTP (Mon/Thu)",
  },
  {
    id: "task-brand-filming",
    label: "Skit filming",
    level: "task",
    parentId: "sub-brand-shoot",
    meta: "Daytime — Sat deep work",
  },
  {
    id: "task-brand-editing",
    label: "Skit editing",
    level: "task",
    parentId: "sub-brand-edit",
    meta: "Hobbies (Tue/Thu)",
  },
  {
    id: "task-brand-post",
    label: "Post, reply and engage",
    level: "task",
    parentId: "sub-brand-growth",
    meta: "Admin (Wed)",
  },

  // ---------- SUB-FUNCTIONS: Career Options — a job search is a pipeline ----------
  // These sit straight on the value category: there is no domain layer here,
  // and inventing one would add a node that means nothing. `temporary` marks
  // the branch as situational — when the search resolves it gets deleted
  // rather than left to rot.
  {
    id: "sub-career-prep",
    label: "Preparation",
    level: "subFunction",
    parentId: "vc-career",
    temporary: true,
    description: "Getting good enough to pass: technical practice, stories, mock interviews.",
  },
  {
    id: "sub-career-apply",
    label: "Applications",
    level: "subFunction",
    parentId: "vc-career",
    temporary: true,
    description: "Targeting, tailoring, sending, tracking.",
  },
  {
    id: "sub-career-interview",
    label: "Interviews",
    level: "subFunction",
    parentId: "vc-career",
    temporary: true,
    description:
      "The rounds themselves. Event-driven: no recurring slot, and when one lands it takes a morning from something else.",
  },
  {
    id: "sub-career-offer",
    label: "Offers",
    level: "subFunction",
    parentId: "vc-career",
    temporary: true,
    description: "Negotiation and the decision. Rare, high-stakes, unschedulable.",
  },

  // ---------- TASKS: Career stages ----------
  {
    id: "task-career-techprep",
    label: "Interview technical prep",
    level: "task",
    parentId: "sub-career-prep",
    temporary: true,
    meta: "Prep (Mon–Fri)",
  },
  {
    id: "task-career-behavioral",
    label: "Resume tailoring / STAR stories / mock interviews",
    level: "task",
    parentId: "sub-career-prep",
    temporary: true,
    meta: "Prep (Mon–Fri)",
  },
  {
    id: "task-career-applications",
    label: "Job applications + company research",
    level: "task",
    parentId: "sub-career-apply",
    temporary: true,
    meta: "Admin (Mon/Thu)",
  },
  {
    id: "task-career-tracking",
    label: "Track applications + follow up",
    level: "task",
    parentId: "sub-career-apply",
    temporary: true,
    meta: "Admin (Mon/Thu)",
  },
  {
    id: "task-career-rounds",
    label: "Interview rounds + debrief notes",
    level: "task",
    parentId: "sub-career-interview",
    temporary: true,
    meta: "Ad-hoc — displaces whatever it lands on",
  },
  {
    id: "task-career-negotiate",
    label: "Negotiate offer + decide",
    level: "task",
    parentId: "sub-career-offer",
    temporary: true,
    meta: "Ad-hoc",
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
