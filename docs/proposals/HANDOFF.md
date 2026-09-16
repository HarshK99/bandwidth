# Direction and Coverage proposal

Status: HTML proposal created for discussion; not accepted or implemented in the app.

## Branches
- `master`: existing app.
- `main_new`: integration branch created from master at the user's request.
- `proposal/direction-coverage`: proposal branch created from main_new. Future changes should branch from main_new; merge to master only when ready at the end.

## Accepted scope
- `founder_operating_system_latest.md` guides generic work categories; Bandwidth does not represent the whole operating system.
- Bandwidth answers what block is happening now and the suitable kind of effort. Latest correction: blocks must not assign Wave Link or freelance; the external bottleneck determines which business/task deserves attention.
- Coverage holds nested, reusable tasks. No niche-specific work such as dental positioning; generic positioning is appropriate.
- App does not know the current actual task. No targets, journal, evidence capture, or results tracking.
- Clicking a Direction card opens all areas filtered by its effort. An optional compact area filter narrows the list; this supersedes the earlier chosen-focus default.
- User requested a single lightweight HTML preview before changing app code.

## Proposed, not yet agreed
- Compact area and effort dropdowns on one Coverage toolbar; no introductory text, extra action buttons, or repeated effort labels when effort is already filtered.
- Direction cards show the block name and current/next state, with remaining time for the current block. Remove the in-card time range, browse-tasks caption, business names, and navigation arrows. The time ruler remains.
- Coverage uses one compact nested list with area/group/task backgrounds inspired by the existing app. All-area browsing starts with areas collapsed, including when filtering effort. Selecting an area opens its branch. After trimming, work areas contain short direct activity lists rather than extra stage layers; nested groups remain where useful, such as Physical recovery and Hobbies. Nothing is ranked or selected as current work.
- Added short generic guides inside work cards: deep work shows “Discovery · Positioning · Sales · Decisions”; low-energy work shows “Lead research · Production · Editing · Admin”. Existing card size calculations and title sizes stay unchanged. Guides wrap naturally without truncation or line clamping. Browser fit remains unverified.
- Tree: Wave Link, Freelance, Content, Exploration, Jobs, Recovery and life. Removed the invented standalone Tools and learning branch: the source document permits useful tooling improvements but does not prescribe a recurring deep-work task for them.
- Trimmed individual procedural steps into generic activities such as Customer discovery, Positioning, Outreach, Scoping and proposals, Content writing, and Payments. Kept sales, production, and payments distinct. Removed redundant stage wrappers as well as tasks, rather than relying only on collapsing the same long list.
- Recovery and life → Hobbies → Painting / Crossword / Language, as explicitly requested by the user.
- Recovery and life → Family and friends → Call / Meet, and Life admin and finances → Pay bills and review finances / Run errands. User requested concrete choices under both groups.
- Removed Downtime and wind-down, Sleep, and Meals and breaks from Coverage; these remain protected timeline blocks rather than task-menu choices. Kept Exercise as a direct activity and removed its now-redundant Physical recovery wrapper.
- Further content simplification: merged Ideas and validation / Small experiments into Explore and test an idea; clarified Activation and retention as Review usage and user feedback, Payments as Invoice and follow up on payments, Aftercare and referrals as Check in with clients and ask for referrals. Clarified product decisions and job activities with action wording. No new niche-specific tasks or workflow tracking.
- Effort: deep work, low-energy work, recovery. One activity may fit multiple effort filters without duplicate data; examples include Outreach and Website production. These are suitability suggestions, not statements that the source document assigns every activity to a fixed energy level.
- Optional branches without scheduled time are not automatically gaps.
- The sample day and all task classifications are illustrative, not an approved schedule.
- Reuse existing visual colours and card structure; use system font fallback to keep HTML standalone.

## Files and checks
- Added `docs/proposals/direction-coverage.html`: standalone HTML with embedded styles, proposed task data, and focus/effort filtering.
- Added `docs/proposals/today-final-view.html` after the user requested a second preview showing the proposed final Today layout. Preserves the vertical time ruler, continuous blocks, current-block card, Today navigation, and bottom tabs. Embeds the generic task map and working Coverage filters in the same file. Uses the live Asia/Kolkata clock, with the day running 07:00 to the next 07:00. The illustrated schedule is not an approved or saved plan. Week, Calendar, Time, and Upgrades controls are visibly disabled in this Today-only preview.
- Added this handoff.
- No existing application source files changed.
- Read current branch/status, app colour tokens, Direction types, schedule, task tree, and relevant prior product documents for context.
- No build commands, test commands, or code review authorized or performed.
- Browser walkthrough not performed: no browser tool available in this session.
- Original source-of-truth file was already untracked at task start; preserve its contents.

## Next starting point
Open the updated `today-final-view.html` with the user to discuss the intended final Today appearance. The first HTML is historical and still contains the superseded focus-first behaviour. The user liked the second preview and requested the corrections now recorded above. The timeline stays. Discuss tree/task wording and filtering behaviour and refine the proposal. Do not implement app changes until the user authorizes them. Scheduling behaviour and whether existing ancillary sections change remain undecided. Latest HTML edits have not been checked in a browser; no builds, tests, or code review performed.
