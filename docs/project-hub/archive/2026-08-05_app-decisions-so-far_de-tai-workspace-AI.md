# App Concept — Decisions So Far
### A composable, AI-orchestrated workspace for mixed personal, study, and work use

> This document records **only the decisions we have explicitly finalized.** Areas not yet discussed in detail are listed under "Not yet decided" at the end.

---

## 1. Who it's for
A single user managing a **mix of purposes in one place** — daily life, entertainment, study groups, and work.

## 2. Core philosophy
**Simple by default, powerful when needed.**
- A simple user gets something minimal that just works, with no configuration and no blank-page paralysis.
- A complex user can reach richer capability by adding more — without that complexity being forced on the simple user up front.
- Complexity is revealed progressively, never dumped up front.

## 3. The AI's role (as decided)
The AI is a **conversational orchestrator** that manages a project across its whole lifecycle — not just at setup, and not a background process that watches the user. It has four jobs:

1. **Compose structure** — from a described purpose, propose the right modules and list types.
2. **Capture & organize data** — accept **multimodal input (voice, image, text)**, turn it into structured items (a task, an expense, a note, etc.), and organize existing data.
3. **Organize workflow & progress** — help arrange how work flows, track progress, and capture progress from the user's AI-thread conversations to share with others.
4. **Adapt over time** — reshape the workspace as the user's needs change.

**Interaction rule (firm, applies to all four jobs):** the AI **always suggests; the user always confirms** before any change is committed — the consistent *draft → AI → confirm* pattern.

## 4. Container model (the structure that holds everything)

```
Workspace  (one per user — their whole space)
  └─ Space / Category   (life-domain grouping: e.g. Personal · Work · Study)
       └─ Project / Plan   (status: active / done)
            ├─ Lists
            ├─ Notes / Docs
            └─ Files
```

- **Three levels:** Workspace → Space/Category → Project.
- **Space/Category** is a grouping layer so the user can separate life domains (Personal, Work, Study).
- **Project/Plan** has an **active / done status**; finished projects drop out of the active view via a filter but remain fully accessible.
- A project **contains** Lists, Notes/Docs, and Files.

## 5. Core building blocks (inside a project)

### Lists — the core entity
- **Everything is a typed list.** A **checklist is the simplest list type** (item + checkbox); richer types (e.g. expenses, watchlist) are other types with their own fields.
- Each list **type is a fixed template** with a predefined, sensible set of fields, so it works immediately with no setup.
- **Users can add extra fields** to a list when their case needs more.
- The app ships a **curated library of list types**, and the AI suggests the appropriate type for the user's purpose.
- *(If no existing type fits, a custom/third-party option is treated as an* ***extension, not core*** *— parked for later.)*

### Notes / Docs
- Free-form writing. An essential building block, always available.

### Files
- Structured file storage within a project.

## 6. Cross-cutting capabilities
- **Roles & Access** — users can invite others with privileges, for group activities. *(Details not yet designed.)*
- **AI Orchestrator** — the conversational lifecycle layer described in section 3, operating across the whole workspace.

## 7. Strategic direction (decided)
- **Extend, don't bloat** — the core stays lean; teams extend the app with modules/integrations only as their needs arise, rather than shipping everything at once.
- **Third-party integrations allowed, on two conditions** — (1) they must be **coherent** (feel like part of one app), and (2) the **AI must be able to read and manage their data**.
- **Richer native core is acceptable** — since AI accelerates implementation and the timeline is two semesters, building a fuller native feature set is feasible; native features are also better for the AI to interact with. **But** breadth must serve the focus (below), not replace it.
- **The real focus of the project is three system properties, not any single feature:**
  1. **Extendability** — grows with needs without bloat.
  2. **Adaptability** — reshapes to different purposes (daily, study, work).
  3. **AI-managed projects** — the AI orchestrates structure, data, and workflow across the lifecycle.
  Features/modules are the *material that demonstrates* these properties.

## 8. Feature roadmap — Core vs. Advanced (future work)
> Principle: every feature is **prioritized and tiered, never removed.** **Core** = what a simple/first user needs for the app to work, plus anything the AI orchestrator depends on. **Advanced** = kept as future work (polish, heavy real-time, external/enterprise). Two tests decide the tier: (1) does a simple user need it for the app to work? (2) does the AI game-changer depend on it?

### Group 3 — Collaboration *(decided)*
**✅ Core**
- Comments on an item; comments on a project/doc; basic replies; reactions
- @mentions; following/subscribing
- **Activity feed / history** *(critical — the AI's progress-capture data source)*
- Invitations; share-link with a permission level
- In-app notifications; reminders; basic mute/controls

**🔵 Advanced (future work — retained)**
- Rich comments (files/formatting in comments)
- Assign-a-comment-as-an-action-item
- Presence (who's online); read/seen indicators
- Real-time live updates; **collaborative co-editing**; conflict handling *(heavy — clearly future work)*
- Guest/external access; public read-only share
- Email/push notifications; digest/summary; granular per-type controls

*(Groups 1, 2, 4, 5 to be tiered next.)*

### Group 1 — Richer lists/items *(decided)*
**✅ Core**
- Description on an item
- Assignee (needed once there's a group)
- Tags/labels
- Due date

**🔵 Advanced (future work — retained)**
- Subtasks / checklist-within-an-item *(adds hierarchy; kept flat at core per the "simplest type is a flat checklist" philosophy)*
- Attachments on an individual item *(project-level Files is already core; per-item is a refinement)*
- Priority
- Recurring items

*(Groups 2, 4, 5 to be tiered next.)*

### Group 2 — Views (ways to see the same list data) *(decided)*
**✅ Core**
- Board / Kanban view (a view of a list)
- Calendar view (Calendar is already a core building block)
- Grouping & sorting (group by status/tag/date; sort)

**🔵 Advanced (future work — retained)**
- Timeline / Gantt view *(heaviest view to build; mainly for dependency-heavy work; good "powerful when needed" demo later)*

*(Groups 4, 5 to be tiered next.)*

### Group 4 — Cross-project / organizing *(decided)*
**✅ Core**
- Search & filter across the workspace
- Templates (start a project/list from a preset) *(also the bridge to the AI setup feature — AI setup ≈ applying/filling a template)*
- Favorites / quick access *(simple enough to keep in core)*

**🔵 Advanced (future work — retained)**
- *(none for this group — all items placed in core)*

*(Group 5 to be tiered next.)*

### Group 5 — Time & planning *(decided)*
**✅ Core**
- Due dates & reminders (every list type benefits; feeds calendar + notifications)

**🔵 Advanced (future work — retained)**
- Milestones
- Time tracking
- Goals / OKRs (link items to an objective)

---

### Roadmap summary — full Core set (v1 target)
Container: Workspace → Space/Category → Project (active/done). Inside a project:
- **Lists** (typed; checklist simplest; fixed templates + add-fields; curated library) with **Board, Calendar, grouping & sorting** views
- **Item fields:** description, assignee, tags/labels, due date
- **Notes/Docs** and **Files**
- **Collaboration:** comments (item + project) with replies & reactions, @mentions, following, **activity feed/history**, invitations, share-link with permissions, in-app notifications, reminders, mute controls
- **Organizing:** search & filter, templates, favorites
- **Cross-cutting:** Roles & Access; the AI Orchestrator (to be designed)

Everything under 🔵 across the groups is **retained as future work**, not removed.

## 9. Competitor coverage audit (ground truth for the report)
> A cross-check of every major platform's best/unique features against our roadmap, to verify coverage spans simplest → most complex. Full analysis in `coverage_audit.md`; summarized here as ground truth.

**Each platform's signature identity (2026):**
- **Jira** — agile/engineering heavyweight (sprints, backlogs, velocity, advanced roadmaps, dev-tool integration); powerful but complex.
- **Linear** — "Jira rebuilt": sub-100ms speed, keyboard-first, opinionated triage→backlog→cycle→done flow.
- **ClickUp** — feature density / all-in-one (tasks, docs, chat, goals, time tracking, 100+ automations); learning-curve criticism.
- **Monday** — visual simplicity (colorful boards, timelines, dashboards, friendly automations).
- **Asana** — clean simplicity + one-assignee ownership; strong workflow automation.
- **Notion** — docs-first knowledge management (nested pages, relational databases, composable blocks).
- **Trello** — dead-simple Kanban; minimal, approachable.

**Coverage verdict:** our Core + Advanced already spans the simplest (Trello-simple board) to the most complex (Jira sprints, Notion databases, ClickUp all-in-one). The *design philosophies* of the best tools are already ours — Trello's simplicity, Notion's composability, Linear's clean UI, ClickUp's breadth (as opt-in, not default). Nothing essential is missing; the gaps below are enhancements.

### 9a. Six gaps surfaced (decisions on where they go)
1. **Automation / rules engine** ("when X → do Y") — every major platform has this. **Placed: Advanced — but the AI orchestrator is our native automation approach** (natural-language automation instead of a rule-builder). *A differentiator, not just parity.*
2. **Forms → item intake** (Monday, ClickUp, Asana) — collect input into a list. **Placed: Advanced.**
3. **Relations between lists** (Notion's relational databases) — linking one list's items to another's (e.g., a task references a contact). Our typed lists are table-like but linking them isn't built yet. **Placed: Advanced — flagged as the one that unlocks Notion-level power.**
4. **Keyboard-first / power-user UX** (Linear) — **Placed: non-functional design goal** (aids power users).
5. **Performance / speed** (Linear) — **Placed: non-functional design goal / quality target.**
6. **Portfolio / cross-project roll-up reporting** (Jira, Asana, ClickUp) — for users with many projects. **Placed: Advanced.**

*(All six are Advanced/future-work or design goals — none disturbs the lean Core. Automation-via-AI and list-relations both reinforce our differentiation rather than merely matching competitors.)*

## 10. AI Orchestrator — design decisions
> The AI's four jobs were defined in Section 3. This section records detailed design decisions as we make them, job by job.

### Job 0 — Project rules / policy (governs all AI behavior in a project) *(decided)*
Each project can define **rules/policy that govern how the AI behaves within that project** — making the AI's behavior itself adaptable per context (directly serving the "adaptability" thesis pillar). Two layers:
- **Structured settings (deterministic):** predefined toggles for high-stakes, predictable controls — e.g., default confirmation level, progress-note visibility, auto-commit on/off (Job 2), auto-share on/off (Job 3b), whether the AI may assign work directly. These are reliable and **not left to AI interpretation**, which is essential under "wrong is not okay."
- **Descriptive rules (natural language):** free-form, project-specific rules the AI interprets for anything the toggles don't cover — e.g., "never assign work directly, only suggest," "this team moves fast, share progress without asking." The AI reading and obeying plain-language policy is itself an on-theme AI capability.
- **Why it matters:** it makes AI behavior composable/adaptable per project (a fast team and a careful solo planner get different behavior from the same system), and it gives all the scattered per-feature opt-ins (auto-commit, auto-share) a single coherent home.
- **Precedence:** structured settings are authoritative for the controls they cover; descriptive rules fill the gaps. (Conflict-resolution details TBD.)


### Job 1 — Compose structure (from a described purpose) *(decided)*
- **Confidence-calibrated proposing:** clear intent → build a structure directly; vague/ambiguous intent → ask 1–2 targeted questions first.
- **Insufficient-over-wrong (core principle):** build a **safe, minimal-but-correct** structure; when unsure, **under-build rather than risk a wrong guess.** Adding a missing piece later (via the consultant chat) is cheap and pleasant; removing a wrongly-created piece is annoying and trust-breaking.
- **Experience, not approve:** on setup, the AI **creates a working structure to use immediately** — no wall-of-text proposal to read/approve.
- **Confirm scales with risk (reconciles the suggest→confirm rule):** filling a **blank slate at setup is low-risk → auto-create is allowed without a confirm step**; modifying **existing populated work is higher-risk → suggest→confirm still required.**
- **Always-available consultant chat:** fills gaps and enhances the structure anytime the user asks.
- **Three entry paths for starting a project:** (1) AI setup (describe purpose), (2) manual setup (start blank), (3) templates / reusable / favorites.

*(Jobs 2, 3, 4 to be designed next.)*

### Job 2 — Capture & organize data (multimodal input → structured items) *(decided)*
- **Multimodal input** (voice, image, text) is parsed by the AI into structured items placed in the right list types.
- **Confirmation list/queue is the default:** extracted items land in a **pending-confirmation list** rather than committing straight to real lists.
- **User controls *when* to confirm:**
  - **Confirm later** → items stay parked in the confirmation list to review when ready (capture in bursts, review when ready — no forced interrupt at capture time).
  - **Confirm now / "done"** → items execute immediately into the real workspace.
- **Earned-confidence fast-path:** the AI may skip confirmation and commit directly **only for repeated/learned patterns it has proven reliable on** — never on first encounter. First time = always confirm; established trusted pattern = auto-proceed. Confidence is **earned over repetition, not claimed up front.** The fast-path is **user-controlled via a setting** (default: confirmation on), so auto-commit is never a surprise — power users opt into it deliberately.
- **Change log / session record (always):** every AI action is logged (per session / audit trail), so nothing the AI does is invisible or irreversible; the user can see and trace it. *(This log also becomes the data trail that powers Job 3's ambient progress capture and builds user trust.)*

*(Jobs 3, 4 to be designed next.)*

### Job 3 — Organize workflow & progress
Job 3 has two halves: **3a workflow organization** (arranging how work flows — sequencing, status, board organization) and **3b ambient progress capture** (the signature feature). 3a is not yet designed in detail; 3b is below.

#### Job 3b — Ambient progress capture (signature feature) *(decided)*
- **What it does:** a user talks through their work with the AI in their own thread; the AI captures it as **both (C)** a human-readable **progress note** (for team awareness) **and** structured **item updates** (marking done, moving status, creating blockers) — so one conversation both informs people *and* updates the actual board, eliminating the separate status update and manual board-keeping.
- **Safety model — confirmation scales with stakes** (whose data is affected + how hard to undo). From lowest to highest:
  1. **Own private data** (solo project) → lightest; follows Job-2 rules, no public-note step (no audience).
  2. **Own items on a shared board** → light; item update via Job-2 rules.
  3. **Public progress note about oneself** → **light confirm by default**; user can opt into auto-share once trusted (the C+D blend).
  4. **Actions affecting another person's items/attention** (e.g., blocker tagging Minh) → **confirm required.**
  5. **Actions changing shared project scope/decisions** → **always confirm, never auto-commit.**
- **Ambiguous/partial input** → insufficient-over-wrong: capture as a loose note/placeholder; don't fabricate structured updates from vague input.
- **Capturer's confirm is sufficient; affected people are notified, not asked to approve.** The system's responsibility is **fidelity** (did it accurately capture what the user said?), not **truth about the world** (is the other person actually blocking?). Human coordination (e.g., whether Minh delivers) is social, not the system's job. Affected people are told (e.g., "Phúc marked himself blocked on your API key") but the record doesn't wait on them.

*(Job 3a and Job 4 to be designed next.)*

#### Job 3a — Workflow organization *(decided)*
- **Guiding principle: illuminate, not dictate.** The AI surfaces facts the team would otherwise miss and lets humans decide what to do — a *dashboard that notices things*, not a *manager that gives orders.* (Teams tolerate an AI that informs; they resent one that bosses. Informational = hard to be wrong, honoring "wrong is not okay.")
- **In scope (the two low-risk, high-value responsibilities):**
  1. **Surface problems** — overdue, stale (not moved in N days), blocked, or overloaded-person signals. Illuminate the fact; don't prescribe the fix.
  2. **Progress roll-up** — a computed, factual status overview ("60% done, 4 blockers, on track for Friday") that answers "where are we?" without a meeting. *This completes the 3b story: 3b captures progress → 3a rolls it up → the team stays aware.*
- **Downgraded / relocated (deliberately):**
  - *Keeping the board tidy* (auto-move/reorder) → only gentle, occasional **suggestions** (e.g., "looks done — mark it?"), never auto; auto-moving is a trust-killer.
  - *Sequencing / "do this next"* → mostly **dropped**; humans own priority (they see context the system can't). At most, surface facts that *inform* ordering, never dictate it.
  - *Suggesting workflow structure* (add a stage, etc.) → **moved to Job 4 (adapt over time)**, where it belongs.
- **Delivery (UX) — blend, policy-tunable:** **pull by default** (a calm "attention"/overview panel the user checks) + **push only for genuinely high-signal events** (a blocker affecting others, a hard deadline slipping). How much 3a may push is a **project-policy setting (Job 0)**. This keeps it non-intrusive — an overview the user pulls, not notifications firing all day.

*(Job 4 to be designed next.)*

#### Job 4 — Adapt over time (structure evolves with usage) *(decided)*
- **Core pattern:** detect when the **current structure no longer fits the actual usage (strain)** and suggest a **better-fitting module/list-type.** (Example: a friend group's plain shared list for expenses/owed-balances/savings grows messy and unstructured → the AI suggests switching to a proper finance/expense-split module that tracks balances and a savings goal.)
- **The trigger is strain, not time** — a mismatch between what the user is *doing* (tracking money, balances, a goal) and the *structure they have* (a plain list).
- **Two trigger modes:** **user-requested** ("this list is a mess, help me") and **AI-noticed** (the AI sees the list has outgrown its type and offers).
- **Inverse of Job 1:** Job 1 picks the right structure at the start from *stated intent*; Job 4 picks a better structure later from *observed usage*. Same skill, different moment. Directly demonstrates the **adaptability** pillar.
- **Careful migration boundary (high-stakes — transforms existing data):**
  - **Suggest→confirm always** (existing populated data = the high-risk case).
  - **Insufficient-over-wrong:** if the AI can't confidently parse an old messy entry into the new structure, **preserve it as-is / flag it** rather than guess and corrupt it.
  - **Show migration as a preview** the user confirms before it transforms their data.
- **Never auto-transform existing data.**

## 11. Module library — design phase
> A recognized consequence of Jobs 1 & 4: the AI can only compose/suggest from a library of well-designed modules. **The module library is the foundation the AI orchestrator stands on** — no good modules means nothing good to compose. This is its own design workstream.

- **What it is:** the curated catalog of typed lists/modules the app ships, each with sensible fixed fields plus customization (add-fields).
- **Role in the system:** it is **what Job 1 composes from** and **what Job 4 migrates toward.**
- **Approach (decided): quality over quantity.** Design **~5–6 modules deeply** (maximizing customization) for v1; keep all other good module ideas as **future work** (noted, not removed, for app completeness).

### 11a. Candidate module backlog (by domain — future-work pool)
*The full pool of good module ideas. The v1 build-set (to be chosen) is a deep subset of these; the rest are retained as future work.*
- **Study:** assignment/deadline tracker · study-session planner · reading list · course/grade tracker · flashcard/revision list · group-project tracker
- **Work:** task board · meeting notes + action items · project tracker · client/contact list · time/deliverable tracker
- **Entertainment/daily:** watchlist (movies/shows) · book/reading list · habit tracker · shopping list · expense/budget + split tracker · trip planner · meal planner · bucket list

### 11b. v1 build-set (deep-designed modules) — *chosen; specs to follow*
*Two per domain, deliberately structurally different within each domain to prove the library handles variety. Plus the always-present basics already in Core: the simplest checklist type, Notes/Docs, Files.*

**📚 Study**
1. **Assignment/deadline tracker** — courses, due dates, status, priority (deadline-driven).
2. **Study-session planner** — planning when/what to study, time-blocked, can link to assignments (time/planning-driven).

**💼 Work**
3. **Task/project board** — the work flagship; tasks, assignees, status; home for collaboration + progress features.
4. **Meeting notes + action items** — capture decisions, turn them into tasks (document-driven; pairs with ambient-capture AI, Job 3b).

**🎬 Entertainment/daily**
5. **Expense/budget + split tracker** — money, balances, who-owes-whom, savings goal (the Job-4 migration showcase).
6. **Watchlist / media tracker** — movies/shows/books, ratings, status (lightest/casual; proves simple personal use).

*Rationale: each domain gets two genuinely different shapes; two modules connect directly to AI features (meeting-notes→3b action-item capture; expense→Job-4 migration); the set spans structured-group to casual-personal.*

*(Next: design each module deeply — fields, customization, and how the AI composes/migrates it.)*

---

## Not yet decided (open for later)
- **Module library:** enumerate and specify the initial set of modules/list-types for study, work, and entertainment/daily (Section 11 — next workstream).
- How roles/permissions and group collaboration work in detail.
- Which third-party tools to integrate, and build-native vs. connect-external for each.
- The custom-list-type / third-party extension mechanism.
- Job 0 policy precedence / conflict-resolution details.
- The evaluation approach for the AI's orchestration quality.
