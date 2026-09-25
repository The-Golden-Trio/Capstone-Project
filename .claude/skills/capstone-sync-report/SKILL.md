---
name: capstone-sync-report
description: Sync a weekly LaTeX report the team submitted to the advisor (cô Châu) into the single source of truth at docs/project-hub. Use whenever someone points at a .tex file or a reports/ folder and asks to sync, update, or cập nhật project-hub / hub / SSOT from it, or says "sync report", "đồng bộ báo cáo", "cập nhật hub theo báo cáo tuần này".
---

# capstone-sync-report: báo cáo LaTeX → docs/project-hub

Each week the team submits a LaTeX report to cô. `docs/project-hub/` is the team's single source of truth. This skill reads one report and writes what changed into the right hub files, **directly** (the team reviews with `git diff` afterwards), then reports what it did.

| Path | What it is |
|---|---|
| `scripts/extract_tex.py` | Flattens the LaTeX project (`\input`, `\include`, `\subfile`, `\import`), numbers headings as §x.y, lists every BR/FR/NFR/DR/UC/RP/OBJ ID, compares IDs with the hub, and diffs against the previous report |
| `scripts/check_hub.py` | After editing: checks links, anchors, table shapes and D-xx IDs in the hub |
| `references/routing.md` | **Which report content goes to which hub file and section, and how.** Read it every run |

## Inputs

- The `.tex` file (or its folder) the user mentions. Reports live in `reports/yyyy-mm-dd_<slug>/` (see `reports/README.md`).
- If the file is somewhere else (Downloads, an Overleaf zip), first copy the whole source folder into `reports/yyyy-mm-dd_<slug>/` and sync from there. Take the date from the user, the folder name, or `\date{}`, in that order. If none gives a date, ask.
- **Report date R** = the submission date. Every precedence rule below depends on it.

## Workflow

1. **Extract.** From the repo root:
   ```
   python3 .claude/skills/capstone-sync-report/scripts/extract_tex.py <main.tex> --hub docs/project-hub [--prev reports/<previous>/main.tex]
   ```
   Pass `--prev` whenever `reports/` has an earlier report with source. Its `diff.md` shows which sections are new or changed, so you can focus there. Still read everything once. If the output lists `MISSING INCLUDES`, tell the user which files are missing. Sync the rest, and do not guess the missing chapters.

2. **Read the report fully.** Read `outline.md`, `ids.md`, `diff.md` if present, and **all of `flat.tex`** (read it in chunks if it is long). Headings appear as `[[§4.1.3 Title]]`, and you cite with those numbers. Sections flagged `⚠️ gần như trống` are placeholders: record them as "chưa viết", not as content.

3. **Read the hub.** Read `00-tong-quan.md`, `02-quyet-dinh.md`, `03-san-pham.md`, `07-van-de-mo.md` and `08-nguon.md` in full, and `reports/README.md` (the sync log). Read `04` and the current week in `tuan/` only when `routing.md` sends you there.

4. **Decide the changes** with `references/routing.md`. For every fact in the report, decide one of: *already in hub* (skip it; do not churn wording), *new* (add it), *changed* (update it following the precedence rules), or *conflict* (flag it with ⚠️). Also go through every open item in `07` §B (cô's comments) and check whether this report addresses it.

5. **Write.** Edit the hub files in place with small, targeted edits. Never rewrite a whole file. Then do the bookkeeping (see routing.md, "Luôn làm"): add a row to `08` §1, update the "Hiện trạng tại …" block in `00`, record the submission in `tuan/<week>/tuan.md` and close the report-writing tasks, and add a row to the sync log in `reports/README.md`.

6. **Check.** Run `python3 .claude/skills/capstone-sync-report/scripts/check_hub.py docs/project-hub` and `python3 tools/hub/tuan.py check`, and fix every error. Re-run `extract_tex.py … --hub docs/project-hub`: the list "Có trong report, CHƯA có trong hub" should now be empty, or contain only IDs you deliberately left out (say why in the summary).

7. **Report back** in Vietnamese, briefly:
   - a table: file · section · what changed (one line each)
   - new decisions (D-xx) and items closed in `07`
   - ⚠️ conflicts you flagged instead of overwriting
   - anything you skipped, and why
   - end with: `git diff docs/project-hub reports/README.md` to review.

## Precedence rules (read before writing anything)

1. **The report records what was submitted to cô, not necessarily what the team decided afterwards.** Compare R with the date of each hub entry.
   - The report is **newer** than the hub entry → update the descriptive files (`00`, `03`) to match the report. For `02`, see rule 2.
   - The report is **older** than the hub entry (for example, syncing a backlog report, or the team decided something after submitting) → **never overwrite**. Only add facts the hub lacks, or add the report as an extra source.
2. **`02` is append-only.** Never delete or reword an old row. If the report replaces a decision, add a new `D-xx` row and change the old row's status to `♻️ thay bởi D-yy`. If the report contradicts a row the team explicitly settled (for example, "Chốt 23/9 (Brian)") and gives no sign that this is a deliberate change, **do not flip it**. Add a ⚠️ row to `07` §A ("báo cáo dd/m §x.y ghi X, 02 ghi Y") instead.
3. **Design is not implementation.** Chapters on design and architecture describe the *intended* system. Never write them into `04` (code reality) as if they were built. If the report claims something is implemented but `04` says it is not, add a gap to `07` §C.
4. **Nothing without a source.** Every line you add cites the report as `Báo cáo dd/m §x.y` (for example, `Báo cáo 25/9 §4.1.3`). Existing lines that say `Báo cáo §…` refer to the 18/9 report; leave them unchanged. Do not infer; if you must, label it **Suy luận:** the way the hub already does.
5. **Close items only on evidence.** Mark a `07` item ✅ only when the report clearly handles it: `✅ 25/9: đã sửa trong báo cáo §1.3`. If it handles the item partly, write `◐ một phần` with what is still missing. Once an item is settled, move it as the hub's own rule says ("Chốt xong thì ghi vào 02 và đánh dấu ✅ ở đây kèm ngày").
6. **Don't write meeting minutes** (`tuan/<week>/<date>_*.md`): a report is not a meeting. The exception: if the minutes of the meeting where this report was presented already exist, you may add the report's path to their "Tài liệu" line. Recording the submission in the week's `tuan.md` is required, though (see routing.md, "Luôn làm").
7. **Leave out personal data:** students' IDs, phone numbers and emails from the title page never go into the hub.

## Writing style (match the hub)

- Vietnamese. Keep the English terms the hub already uses (Explorer, seed, rubric, band, scenario…) and follow the glossary in `03` §9. A report written in English gets **summarised in Vietnamese**, not translated line by line. Short original quotes go in italics: *"…"*.
- Dates are `d/m` (25/9). Use the status icons ✅ ♻️ ⚠️ 💡 exactly as defined at the top of `02`, and the priorities 🔴 🟠 ⚪ as in `07`.
- Short sentences, **bold** for the key phrase, tables where the hub uses tables. Keep `00` short: it is the "read first" file.
- New decision IDs: take the next free number in that group's range (A = D-0x, B = D-1x, C = D-2x, D = D-3x, E = D-4x, F = D-5x, H = D-7x).
