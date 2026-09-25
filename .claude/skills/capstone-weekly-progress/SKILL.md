---
name: capstone-weekly-progress
description: Compare what each team member was assigned this week (tasks in docs/project-hub/tuan/<week>/tuan.md) with what they actually did (commits on all branches, PRs, files changed, reviews, submissions), then record statuses, evidence, extra work, per-person progress and carry-overs. Use for "tổng hợp tiến độ tuần", "tuần này mỗi người làm gì", "task giao xong chưa", "weekly progress/report", usually on Friday before meeting cô.
---

# capstone-weekly-progress: giao vs làm được, theo tuần

The week's folder `docs/project-hub/tuan/<week>/` already holds **what was assigned** (tasks with IDs, written by `/capstone-meeting-minutes`). This skill adds **what got done**, using git and GitHub as evidence, and writes the result into that week's `tuan.md`. Conventions (week rule, IDs, statuses): `docs/project-hub/tuan/README.md`. **Read it every run.**

| Path                      | What it is                                                                                                                                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/collect_week.py` | Fetches, then collects commits (all branches, by author date), PRs touched this week (via `gh`), reviews, files and +/- by area, and commit/PR rule checks. Also loads this week's tasks and still-open older tasks, and lists every commit or PR that cites each task ID. Writes `digest.md` and `week.json` |
| `team.json`               | Git name / email / GitHub login → person (Nhật, Nam, Phúc)                                                                                                                                                                                                                                                    |
| `tools/hub/tuan.py`       | `init`, `tasks`, `index`, `check` for the week folders                                                                                                                                                                                                                                                        |

## Workflow

1. **Collect.** From the repo root:

   ```
   python3 .claude/skills/capstone-weekly-progress/scripts/collect_week.py
   ```

   Default window: Monday 00:00 → now (Vietnam time). Other windows: `--last`, `--week 2026-W39`, `--since … --until …`.
   - Read every `⚠` line it prints. If `git fetch` failed, teammates' branches may be missing. If `gh` is missing or not logged in, PRs and reviews are missing (fix: `gh auth login`). Continue anyway, and say so in the header of the entry.
   - `Chưa map: …` → ask who it is, add the alias to `team.json`, and re-run.
   - No `tuan.md` for this week → `python3 tools/hub/tuan.py init <week>`. If no meeting assigned tasks this week, say so and still record the work (it all goes under "Làm thêm").

2. **Read `digest.md` completely**, then **read the code**: for every commit with a `✖` message, every commit over ~300 changed lines, and every PR, run `git show --stat <sha>` and read the relevant parts of `git show <sha>` (or `git diff origin/main...<branch>`), until you can say in one sentence what it does for the product. Skip lockfiles, generated `packages/game-core/data/*.json` and binaries.

3. **Decide each task's status.** Go through every task in "Task giao tuần này" and "Task cũ còn mở":
   - **Evidence, in this order:**
     1. Commits or PRs citing the ID (listed in the digest).
     2. Commits or PRs whose content clearly does the task. Say that the match is by content: "(khớp theo nội dung)".
     3. Non-code deliverables: new files in `reports/` or `docs/project-hub/submissions/`, the "Đã nộp" section, hub edits.
     4. What a teammate tells you in this conversation: "(theo <người>)".
   - **Status:** ✅ the deliverable exists (a merged PR, or a pushed commit that does it) · 🟡 part of it exists (say what is missing) · ⏳ not done, deadline not passed yet · ❌ deadline passed, nothing found · ❓ can't tell (for example, work outside git with nobody confirming). **Never mark ✅ without evidence.**
   - An open PR that does the task → 🟡 "PR #n chưa merge", unless the task only asked for the code to be written.
   - Old open tasks: if this week's work finished one, update its row **in the week where it currently lives**.

4. **Write into `docs/project-hub/tuan/<week>/tuan.md`.** Edit in place and keep the section order:
   - `## Task giao`: fill **Trạng thái** and **Bằng chứng** (PR `#n`, commit `abc1234`, file path). Keep the evidence short.
   - `## Làm thêm ngoài task giao`: work in git or GitHub that matches no task. One bullet per piece of work, in product terms, with evidence and the person.
   - `## Đã nộp / trình bày cho cô`: add anything submitted this week that is missing.
   - `## Theo người`: one `### <Tên>` per person, using the template below.
   - `## Chuyển sang tuần sau`: every task that is not ✅ or 🚫 and is still wanted. Mark it ↪ in this week's table, run `python3 tools/hub/tuan.py init <next week>`, and add the task to the next week's `## Task giao` with the **same ID**, Nguồn `↪ <this week>` and status ⏳. Also list things to watch: PRs waiting for review (and whose review), conflicts between branches, `07` items nobody touched.
   - Also add a short header line under the title: `> Đối chiếu T6 25/9 16:30 từ commit mọi branch (đã fetch) và PR trên GitHub. <cảnh báo nếu có>`.
   - If the command is run again in the same week, update the entries. Don't duplicate them.

5. **Check:**

   ```
   python3 tools/hub/tuan.py index
   python3 tools/hub/tuan.py check
   python3 .claude/skills/capstone-sync-report/scripts/check_hub.py docs/project-hub
   ```

6. **Reply in chat:** counts (`✅ 5 · 🟡 1 · ❌ 1 · ↪ 2`), one line per person, the tasks carried over, and a link to `tuan.md`. If the week's work changes facts in other hub files (for example, LLM now integrated → `07` C1, `00` hiện trạng, `04`), **list the suggested edits and ask** before touching those files.

## Per-person template

```markdown
### Nam

- **Task giao:** 3/4 ✅ · T2609.3 🟡 (PR #14 chưa merge)
- **Đã xong:** <feature-level bullets, each ending with evidence (PR #12) or (`abc1234`)>
- **Làm thêm:** <work outside the assigned tasks, if any>
- **Quy ước:** <e.g. "2/6 commit sai quy ước", "PR #15 thiếu Cách kiểm tra". Omit if clean>
```

## Rules

- **Describe outcomes, not activity:** "dựng màn đánh giá nghề 5 tiêu chí (FR-12), chưa có i18n EN", not "sửa 6 file trong apps/web". Use the hub's terms (`03` §9) and cite `D-xx` or `07` IDs when relevant.
- **Every claim has evidence.** Don't infer work that isn't in git, GitHub or the repo, or wasn't told to you.
- **No ranking, no judging effort.** Line counts are only a reference, never a comparison between people. Someone with no activity gets `Không có commit hay PR trên GitHub tuần này.` Their assigned tasks simply show ⏳/❌/❓ like everyone else's.
- **Commit-rule flags** are factual counts with examples. Commits from before the rules existed (`⚠ commit cũ`) don't count as violations.
- Vietnamese, dates `d/m`, weekdays `T2…CN`. Keep each person's section to 3–8 lines.
