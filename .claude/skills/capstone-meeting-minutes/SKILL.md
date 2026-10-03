---
name: capstone-meeting-minutes
description: Turn raw notes of a capstone meeting (with cô / the advisor, a team meeting, a 1-1) or a raw task-assignment post (the list someone writes and pastes into Discord, including a midweek re-list) into formatted records in docs/project-hub/tuan/<week>/, with task IDs, and push decisions, advisor comments and open questions into the hub. Use when someone pastes meeting notes, a Discord message, a transcript or a photo of notes, or says "ghi minutes", "biên bản họp", "vừa họp xong", "cô nhận xét", "phân task", "chia task", "giao task", "midweek check", "sync task vào repo".
---

# capstone-meeting-minutes: buổi họp ngoài đời → hub

A meeting is where work is **assigned**. This skill records it so that `/capstone-weekly-progress` can later compare what was assigned with what got done. The conventions are in `docs/project-hub/tuan/README.md`: **read it every run**.

Tool: `python3 tools/hub/tuan.py` (`week`, `init`, `next-id`, `tasks`, `index`, `check`).

## Inputs

Anything that describes the meeting: typed notes, a pasted Discord message or thread, a transcript file, a photo or screenshot of handwritten notes (open it with Read), or the person just telling you what happened. Several sources can be combined.

**A task-assignment post is handled the same way**, even though it is not a meeting: someone writes a raw list ("Anh Nhật: …, Kỳ Nam: …") and pastes it into Discord. Record it as its own file with type `phan-task` (for example `2026-09-20_phan-task.md`), dated by when it was posted. A **midweek re-list** (the same list posted again with changes and "midweek check" items) is a separate file on its own date: a `hop-nhom` file if it came out of a meeting, otherwise `phan-task`. See "Re-lists" below.

You need four facts. If the input doesn't give them, ask in **one** short question (or, if nobody can answer, use the fallback and say so in your reply):

| Fact                                      | Fallback                                                                         |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| Date and time                             | Today                                                                            |
| Type: gặp cô / họp nhóm / 1-1 / phân task | Họp nhóm (or phân task for a pasted list)                                        |
| Who attended                              | "không ghi"                                                                      |
| For each task: **who** and **deadline**   | Who: `?`. Deadline: the day before the next cô meeting (usually T6 of that week) |

## Workflow

1. **Find the week.**

   ```
   python3 tools/hub/tuan.py week <yyyy-mm-dd> --meeting     # → 2026-W40
   python3 tools/hub/tuan.py init 2026-W40
   ```

   Meetings on T7/CN belong to the **next** week, because that is where their tasks are worked on.

2. **Read the context first:** that week's `tuan.md`, `python3 tools/hub/tuan.py tasks --open`, `07-van-de-mo.md` §A–B, and the tail of `02-quyet-dinh.md`. You need it to recognise when the meeting closes an old task, settles an open question, or repeats a comment cô already made.

3. **Write the minutes** at `docs/project-hub/tuan/<week>/<yyyy-mm-dd>_<gap-co|hop-nhom|1-1|phan-task>.md`, following `docs/project-hub/templates/meeting-minutes.md`. If two meetings of the same type fall on the same day, add a suffix: `_hop-nhom-2`.
   - **Faithful, not creative.** Record what was said. Mark anything you infer with _suy luận:_, and quote short phrases verbatim in italics when the wording matters (cô's comments especially).
   - Delete the template sections that have no content, except **Task giao**. If no task was assigned, keep that section and write _Không giao task._
   - Names: Nhật, Nam, Phúc (see the aliases in `tuan/README.md`: "anh Nhật" and "AN" are Nhật, "Kỳ Nam" and "knam" are Nam).
   - For a pasted post or list, end the file with the **original text, verbatim**, inside `<details><summary>Nguyên văn</summary> … </details>`, so anyone can check the formatted version against it.

4. **Tasks.** Every concrete action with an owner becomes a task:
   - Get IDs with `python3 tools/hub/tuan.py next-id <yyyy-mm-dd>` (for example `T2609.1`), then number the rest of the meeting's tasks sequentially.
   - One row per person per deliverable. Split "Nam và Nhật làm X, Y" into rows that can each be checked off. Keep the wording concrete enough to verify on Friday ("viết lại §1.3 Objectives theo nhận xét 19/9", not "sửa báo cáo").
   - Add every task to the minutes' `## Task giao` table (4 columns) **and** to the `## Task giao` table of that week's `tuan.md` (7 columns): `| ID | Ai | Task | Hạn | [<d/m> <loại>](<file>) | ⏳ | |`.
   - If a task continues an open task from an earlier week, **reuse its old ID**: mark it ↪ in the old week and add it here with Nguồn `↪ <old week>`. Don't create a new ID.
   - If the meeting reports that an earlier task is done or dropped, update that task's row where it currently lives: ✅ with the evidence ("báo trong họp d/m", or the PR/commit if mentioned), or 🚫 with the reason.
   - If a task addresses an item in `07` (for example B1), mention the item in the task text: `(07 B1)`.
   - "X, SAU ĐÓ Y" is two tasks. Put Y in its own row and start it with "Sau T….:".
   - Style notes attached to a task ("chữ vừa phải", "xem lại thẻ profile") go in that task's text after "Lưu ý:". They are not separate tasks.
   - A statement of a rule rather than an action ("domain expert chỉ tư vấn cho content admin") is a **decision**, not a task (step 5).
   - If you can see the task is already partly or fully done (the file exists, a commit exists), write that in **Bằng chứng** but leave the status ⏳. `/capstone-weekly-progress` decides the status from evidence.

   **Re-lists (midweek check, updated post).** Match every line of the re-list against the week's existing tasks before creating anything:
   - Same task, maybe reworded → keep the ID. Update the text only if the meaning changed, and don't add a new row.
   - A new check item under someone's name → a new task, with an ID from the re-list's date.
   - "bỏ X" → set X's row to 🚫 with the reason and the date ("bỏ ở midweek 23/9").
   - Reassigned ("giao lại cho Nam") → 🚫 on the old row ("giao lại cho Nam, T2309.10"), plus a new row with a new ID for the new owner, saying which task it takes over.
   - A task for both people ("cả 2") → one row per person, unless it is a single joint deliverable, in which case use `Nhật + Nam`.
   - "Đã có cái done rồi" without saying which → don't guess. Leave the status ⏳ and note any evidence you saw.

5. **Push into the hub.** Use the same rules as `/capstone-sync-report` (`.claude/skills/capstone-sync-report/SKILL.md`, precedence rules and writing style):
   - **Decisions** → a new row in `02-quyet-dinh.md`, taking the next free D-number in the right group, with Nguồn = a link to the minutes and ✅ (or 💡 if only proposed). If it replaces an older decision, mark the old row ♻️ and don't delete it.
   - **Cô's comments** → new rows in `07` §B (continue the B-numbering, choose a priority 🔴/🟠/⚪). If a comment repeats an existing row, don't add a new one; add the date to that row instead. If cô approved or settled something, close the matching `07` item with ✅ and the date.
   - **Open questions** and **contradictions** → `07` §A or the right section.
   - A decision that contradicts the report or the hub (for example, it changes who a use case's actor is) → the decision row **plus** a ⚠️ row in `07` §A naming what has to be updated (report section, UC, `03` section). Don't rewrite `03` yourself.
   - **Submissions** presented at the meeting → the week's "Đã nộp / trình bày cho cô" section, and a row in `08-nguon.md` §1 if it is new. If it is a LaTeX report not yet synced (check `reports/README.md`), suggest `/capstone-sync-report`.
   - Update `00-tong-quan.md` only when the meeting changes the "Việc chưa làm" top 3 or settles something listed under "Đã chốt".

6. **Link and check.** Add the meeting as a line under `## Buổi họp` in `tuan.md`: `- [d/m (Tx) hh:mm · <Loại> · <chủ đề>](<file>)`. Then run:

   ```
   python3 tools/hub/tuan.py index
   python3 tools/hub/tuan.py check
   python3 .claude/skills/capstone-sync-report/scripts/check_hub.py docs/project-hub
   ```

   Fix everything they report.

7. **Reply** briefly, in Vietnamese:
   - the path of the minutes file
   - **task list by person**, formatted so it can be pasted straight into Discord. Group by person; show 🚫 cancelled or reassigned tasks struck through; put "Sau …" tasks under the task they follow:
     ```
     **Task tuần 40** · hạn T7 3/10
     **Nam**
     • `T2609.1` Viết lại §1.3 Objectives (07 B1)
     • `T2609.2` …
     **Nhật**
     • ~~`T2009.2` DB design v0~~ → giao Nam `T2309.10`
     _Commit/PR ghi `Task: <ID>` để cuối tuần tự đối chiếu._
     ```
   - hub changes (D-xx added, 07 items opened or closed), each in one line
   - anything you had to guess (the fallbacks from the Inputs table).

## Don'ts

- Don't invent tasks from vague talk ("chắc tuần sau làm X"). Record them under **Còn mở** instead.
- Don't mark any task ✅ from a meeting unless someone said it was done. The evidence check is `/capstone-weekly-progress`'s job.
- Don't copy personal information (phone numbers, grades, private remarks about a person) into the hub.
