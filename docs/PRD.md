# PRD — Bandwidth

**Status: foundational.** A first-principles re-derivation of why this product
exists, who it is for, and what problem it is actually solving. It does not
describe shipped code — it works out what *should* be true, then scores the
current app against it (§8). Where the two disagree, this doc is the argument,
not the record.

Method: the product-sense spine — clarify, rationale, goal, segment, pain,
solution — run deliberately in that order so the solution is derived, not
assumed. Existing surfaces (Today, Week, Coverage, Calendar, Time, Upgrades,
the parked Goals) are treated as **hypotheses about the problem**, not as
givens to extend.

---

## 1. Scope and clarifying assumptions

**In scope:** the reason Bandwidth exists at all, and whether its shape is the
right answer to that reason.

**Assumptions stated up front** (these would be clarifying questions in an
interview; here they are decisions):

1. **One operator, no team, no backend.** The tool serves a single person
   running their own time. localStorage-only, no accounts, no sync. This is a
   constraint, not a limitation to design around.
2. **Capture is solved elsewhere.** Tasks, notes, and reference live in Apple
   Notes and stay there. Bandwidth has no task entity and never asks for one.
   Anything that pulls capture into this tool is out of scope by definition.
3. **Priorities are already decided.** The operator knows what matters. The
   product does not help choose between Wave and a job hunt — that is strategy
   work done outside the tool. The product's job begins *after* the decision.
4. **The unit of intent is the week.** Not the day (too volatile), not the
   quarter (too coarse to correct). The recurring shape of a week is what the
   product stores and what it holds you to.

**Out of scope:** goal-setting facilitation, prioritisation frameworks, task
management, time logging, habit streaks, analytics, anything multi-user.

---

## 2. Why this matters (rationale)

A solo operator running several concurrent bets has **no external structure
forcing time allocation**. No manager, no standup, no calendar full of
meetings that impose a shape on the day. Left alone, the day fills with
whatever shouts loudest — client deadlines, an email, an application form —
and the quiet, compounding work (Wave outreach, reading, relationships,
psychological fitness) gets whatever is left, which over a month is nothing.

This failure is **invisible while it happens**. There is no instrument on the
dashboard for "you said Wave was the long bet and it has had two real hours
this month." You find out when you notice the month is gone.

The stakes are concrete:

- A month lost to drift is ~8% of a year of runway.
- The job hunt is a hedge (`career.ts` is marked `temporary`). Hedges die by
  being the thing dropped first in a crunch — exactly when you most need
  them. That failure is not recoverable by working harder later.
- Decision fatigue is a tax paid every 90 minutes: "what now?" re-litigated
  four times a day is four chances for the day to come off the rails.

Bandwidth is cheap insurance against the dominant failure mode of solo
multi-bet operating: **the slow divergence between declared intent and actual
hours.** That is the whole thesis.

---

## 3. The problem, from first principles

Strip away the app. The operator has:

- A finite number of usable hours per week.
- ~7 domains with a legitimate claim on them (two income streams, a company
  bet, a next-startup bet, an audience asset, a job hunt, and everything under
  Sustain).
- A standing set of decisions about which of those matter more.
- A default behaviour that ignores those decisions under pressure.

Two distinct problems fall out, at different time horizons:

| Horizon | Question | Failure if unanswered |
|---|---|---|
| **Now** | What am I doing this hour, what is it for, what's next? | Decision fatigue; reactive drift into whatever is loudest. |
| **This week / month** | Does the shape of my time still match what I decided matters? Is anything I care about getting zero real hours? | Silent divergence discovered a month too late. |

The **now** problem is largely tractable with a good recurring template and a
place to read it. It is not where the value is.

The **week/month** problem is the hard one and the unsolved one. It needs an
*instrument* — something that makes the gap between "what I said matters" and
"where the hours went" legible at a glance, early enough to correct. No task
manager does this (a longer list is not an allocation). No calendar does this
(appointments are not intent). No time tracker does this without turning into
a compliance chore and a progress bar, both of which the product refuses.

**The enemy has a name: drift.** Everything the product does should be judged
by whether it catches drift earlier.

---

## 4. Product goal

A user outcome, not a feature list:

> The operator can tell in under ten seconds what to be doing now — and in one
> weekly glance, see whether the week's shape still matches what they've
> decided matters, catching a mis-allocation while it is still a week old
> instead of a month old.

Sub-goals, ranked:

1. **No re-deciding the day.** The next action is always readable, never
   computed on the spot.
2. **Drift is visible early.** A declared priority getting no real hours shows
   up as a state on a screen, not as a January realisation.
3. **The instrument never becomes a chore.** If the product needs input during
   the day to stay accurate, it has failed. Read-heavy, write-rare.

Explicit non-goals: completion tracking, productivity scoring, motivation
through guilt, comprehensiveness ("every task in one place").

---

## 5. User segments

Bandwidth has one user. The useful segmentation is therefore **the archetype
it generalises to** (§5.1) and **the situations that user is in** (§5.2) —
because the product can only be built for one of those situations as its
design centre.

### 5.1 The archetype

> A solo operator running **two or more concurrent bets** on finite personal
> time, with **no external structure** forcing allocation, who has **already
> decided** what matters and keeps failing to hold the line under pressure.

Adjacent people who are *not* this archetype, and why the product is wrong for
them:

| Not the user | Why not |
|---|---|
| Someone with one focus | No allocation problem. A to-do list is enough. |
| Someone who needs help prioritising | That is strategy/coaching. This tool starts after the decision. |
| A team | The problem becomes coordination and project management — a different product with different primitives (assignees, status, deadlines). |
| Someone whose calendar is full of meetings | Structure is already imposed externally. The self-directed-hours problem barely exists. |
| A heavy capture/GTD user | They want the task graph *in* the tool. Bandwidth's refusal of task entities makes it actively worse for them. |

The archetype's defining trait is **self-imposed structure under no
obligation to keep it**. That is the market, if there is one.

### 5.2 Situations of the one user

| Situation | What's true | Product's job |
|---|---|---|
| **Steady state** | Nothing on fire. Themes hold. | Keep them holding. Make leaving the default a *noticed* choice. |
| **Client crunch** | A launch in ~5 days. Deep Work and Build both collapse to client work. | Survive being bent without losing its shape. Protect the hedge — Study and Applications do **not** pause. |
| **Job-hunt spike / interview lands** | An external event punctures the planned day. | Show the intrusion without merging it into the plan (the calendar overlay is exactly this). |
| **Drift week** | Already off the rails. | Make that legible and un-dramatic. Resume the themes next week — no backlog, no debt. |

**Primary segment: steady state.** Bandwidth is a *maintenance instrument for
an operator whose plan is basically right.* Crunch and drift are handled by
making the default obvious enough that departing from it registers — not by
encoding every exception into the model. This is a deliberate bet: the cost is
that crunch handling stays manual; the benefit is that the model stays small
enough to trust.

---

## 6. Pain points

The operator's journey through a representative week, with the friction at
each step:

| # | Moment | Friction | Severity |
|---|---|---|---|
| 1 | Wake | "What first?" — decision fatigue at the lowest-willpower moment. | Med — mostly solved by a fixed morning + template. |
| 2 | Mid-morning | Am I on the day's real work, or answering email? | Med. |
| 3 | Post-lunch dip | Willpower gap; "finally starting" guilt bleeds the afternoon. | Med — addressed by naming the dip as a real block. |
| 4 | ~3pm | Cold restart. Which project? Re-decide. | Med — addressed by day themes (morning and afternoon point at the same domain). |
| 5 | Evening | Fluid time, over-planned into slivers. | Low. |
| 6 | **Weekly** | **Is Wave getting any real hours? Did reading happen? — usually discovered too late, if at all.** | **High.** |
| 7 | Monthly | "I haven't touched X in a month." The realisation, always retrospective. | High — but 7 is just 6 gone unaddressed for longer. |

**The one friction to attack: #6 — weekly drift detection.**

Reasoning: 1–5 are in-the-moment and largely dissolved by a well-shaped
template plus a read-only Today view. They are real but they are *handled*.
Number 6 is the friction that is both high-severity and structurally
unsolved: **there is no glanceable answer to "is a thing I said matters
quietly getting zero real hours?"** Everything downstream (the lost month) is
this friction left to compound.

---

## 7. Solution

### 7.1 Options considered

Derived from the problem in §3, before committing:

| Option | What it is | Verdict |
|---|---|---|
| **A. Task manager + prioritisation** | Capture every task, rank them, work the list. | **Rejected.** A longer list is not a clearer allocation. Capture already lives in Apple Notes and moving it here fixes nothing about drift. |
| **B. Time tracker (plan vs. actual)** | Log real hours, reconcile against intent. | **Rejected.** Requires constant input → becomes a compliance chore. Produces a plan-vs-actual delta, which is a progress bar in another shape — explicitly refused. Violates "no maintenance during the day." |
| **C. Calendar / time-blocking app** | Blocks on a timeline, drag to plan. | **Rejected.** Optimises scheduling appointments. The operator's problem is allocating *self-directed* hours against *intent*, which a calendar does not represent. |
| **D. Declared-intent instrument** | A stable tree of what matters + a recurring week shape pointing blocks at tree nodes + read-only views for "what's now" and "where do the hours land vs. what has no place." | **Commit.** It is the only option that makes drift a visible state rather than a retrospective discovery, and the only one that stays read-heavy / write-rare. |

### 7.2 The commit — Option D

Three layers, joined by node ids:

1. **What matters** — a hand-authored, versioned tree (`lib/life/areas/`).
   Changes rarely, ships with the build, never written back to from the UI.
   This *is* the operator's declared priority set, made concrete.
2. **When** — a recurring week template (Week view), editable, whose cells
   point blocks at tree nodes. The unit of intent from §1.
3. **Read-only views** —
   - **Today**: the in-the-moment answer. What block, what area, what's next.
   - **Coverage**: the drift instrument. Every tree node walked with the
     week's hours attached, in three honest states — `covered` (has real
     scheduled time), `inherited` (an ancestor is scheduled, the work happens
     inside it), `gap` (nothing, anywhere in its chain). The `gap` state is
     the core insight: it names what you claim matters but have given no
     place.

### 7.3 MVP

Layers 1–3 above, minus Goals. This is roughly what the app already is — which
is a point in its favour, not a reason to skip the derivation.

The **one addition the analysis justifies**: **Goals** (currently parked, see
`PLAN_GOALS.md`). Coverage answers *"does this have a place?"* Nothing answers
*"does this place have a point — a number, a date?"* A branch can be fully
covered with hours and still be adrift from its own target. Goals completes
the drift instrument by attaching a destination to a branch. It must be built
inside the existing guardrails: **no progress computation, no `current` field,
no completion state** — a goal is a precisely-written aspiration, nothing more.

### 7.4 Exclusions (the disciplined "no")

These are load-bearing. Each one is a thing the product will *not* do even
when asked:

- No task entities, no capture, no completion checkboxes.
- No progress tracking — no percentages, no "on track / behind," no
  plan-vs-actual delta.
- No time logging or reconciliation.
- No statistics or counts anywhere ("6 fixed," "3 of 10 goals hit").
- No notifications, nudges, streaks, or reminders.
- No multi-user, sharing, or backend.
- No per-date override UI — the default is made obvious enough that departing
  from it is a noticed choice.

---

## 8. Current surfaces, scored as hypotheses

Each surface embodies a claim about the problem. Honest verdict:

| Surface | The claim it makes | Verdict |
|---|---|---|
| **Today** | In-the-moment decision fatigue is real and worth a dedicated read-only view. | **Strong fit.** Directly serves goal 1. |
| **Week** | The week is the right unit of intent, and it changes rarely enough to be a template, not a planner. | **Strong fit.** This is the §1.4 assumption made concrete. |
| **Coverage** | Drift is invisible and needs an instrument; `gap` is the key state. | **Core to the thesis.** This is the answer to the §6 friction. |
| **Calendar overlay** | External events puncture the plan and must be shown without being merged into it. | **Fits** the crunch / interview situations (§5.2). Correctly scoped — read-only, zero rollup contribution. |
| **Goals** (parked) | Coverage needs a "does it have a point" companion. | **Justified by this analysis.** Build it, within guardrails. |
| **Time** (dots / mortality / milestones) | Zoom-all-the-way-out motivation belongs in the same tool. | **Weakest fit.** It is motivational, not instrumental; it shares no data with the rest of the product and answers no question in §3. Defensible as ambient context, but it is arguably a separate product wearing the same tab bar. Flagged, not condemned. |
| **Upgrades** | The operator themselves is a thing being improved, separate from the work. | **Adjacent.** The "operator, not work" distinction is clean and the no-progress discipline holds. Watch for scope creep — it is one step from becoming a self-help tracker. |

---

## 9. Open questions and risks

1. **Time page identity.** Keep it as ambient motivation, or acknowledge it as
   a distinct product and stop letting it dilute the tab bar? It fails the
   "answers a question in §3" test.
2. **Approximate attribution.** Coverage's `serves` credits hours to two
   branches from one session ("primary intent, not accounting"). Does
   approximate allocation undermine trust in an instrument whose whole value
   is telling you the truth about where time goes?
3. **Single primary segment.** Designing for steady state means crunch
   handling is deliberately manual. Acceptable now. Does it stay acceptable,
   or does a long crunch expose the model as too rigid?
4. **The hedge's expiry.** `career` is `temporary`. When the job hunt ends,
   one whole domain and its peak-hour claim vanish. Does the week's shape —
   and this doc's "two pushes" framing — survive that cleanly, or does it need
   a re-derivation?
5. **Generalisation wall.** If the archetype (§5.1) is real and worth serving,
   the hand-authored TypeScript tree is the adoption wall. Nobody else will
   edit `lib/life/areas/*.ts`. Is there a version of "author your tree" that
   does not betray the "write-rare, no backend" posture?

---

## 10. Recap

**Segment:** the solo operator running 2+ bets on finite time with no external
structure, in steady state. **Pain:** a declared priority can quietly get zero
real hours and you find out a month too late. **First bet:** a read-only
instrument — stable intent tree + recurring week shape + Coverage's
`gap` state — that makes that divergence a visible state instead of a
retrospective discovery, with Goals as the next increment to answer "does this
place have a point," both built inside a hard no-tracking, no-statistics,
write-rare discipline.
