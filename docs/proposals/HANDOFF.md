# Direction and Coverage proposal

Status: HTML proposal created for discussion; not accepted or implemented in the app.

## Branches
- `master`: existing app.
- `main_new`: integration branch created from master at the user's request.
- `proposal/direction-coverage`: proposal branch created from main_new. Future changes should branch from main_new; merge to master only when ready at the end.

## Accepted scope
- `founder_operating_system_latest.md` guides generic work categories; Bandwidth does not represent the whole operating system.
- Bandwidth answers what block is happening now, with a broad focus and suitable kinds of effort.
- Coverage holds nested, reusable tasks. No niche-specific work such as dental positioning; generic positioning is appropriate.
- App does not know the current actual task. No targets, journal, evidence capture, or results tracking.
- Clicking a Direction card opens the chosen focus with an option to widen the view.
- User requested a single lightweight HTML preview before changing app code.

## Proposed, not yet agreed
- Filter by both broad focus and effort; widen either independently.
- Tree: Wave Link, Freelance, Content, Exploration, Jobs, Recovery and life, Tools and learning.
- Effort: deep work, low-energy work, recovery. Assignments are suggestions; actual work can require different effort.
- Optional branches without scheduled time are not automatically gaps.
- The sample day and all task classifications are illustrative, not an approved schedule.
- Reuse existing visual colours and card structure; use system font fallback to keep HTML standalone.

## Files and checks
- Added `docs/proposals/direction-coverage.html`: standalone HTML with embedded styles, proposed task data, and focus/effort filtering.
- Added this handoff.
- No existing application source files changed.
- Read current branch/status, app colour tokens, Direction types, schedule, task tree, and relevant prior product documents for context.
- No build commands, test commands, or code review authorized or performed.
- Browser walkthrough not performed: no browser tool available in this session.
- Original source-of-truth file was already untracked at task start; preserve its contents.

## Next starting point
Open the HTML with the user, discuss tree/task wording and filtering behaviour, and refine the proposal. Do not implement app changes until the user authorizes them. Scheduling behaviour and whether existing ancillary sections change remain undecided.
