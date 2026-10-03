---
name: capstone-commit-helper
description: Write commit messages and pull request titles/descriptions that pass the team's rules (Conventional Commits, Vietnamese description, PR template, Task ID of the assigned task) for the capstone repo. Use when someone asks to commit, write/generate/suggest a commit message, "viết commit", "đặt tên commit", open or describe a PR, "viết PR description", or when a husky commit-msg hook or the pr-check GitHub Action rejected their message.
---

# capstone-commit-helper: commit message và PR description đúng quy ước

The rules live in `tools/git/commit-rules.mjs` (types, scopes, limits, PR sections), and `CONTRIBUTING.md` explains them for humans. **Read `commit-rules.mjs` at the start of every run.** Do not rely on memory; the lists can change.

Everything you write is validated by the same code the husky hook and the `pr-check` Action use. Never hand the user a message that has not passed it.

Two modes. Pick one from the request: _commit_ (default), or _pr_ when they mention a PR, pull request, or merging.

## Mode: commit

1. **Look at what is staged.**

   ```
   git status --short
   git diff --staged --stat
   git diff --staged
   ```

   If nothing is staged but there are changes, show them and ask what to stage. Don't `git add -A` on your own. For a very large diff, read `--stat` first, then the diff file by file. Skip lockfiles, `packages/game-core/data/*.json` (generated) and binaries.

2. **Split if needed.** If the staged changes do two unrelated things (for example a web UI fix plus a data update), propose splitting them into separate commits, with the file list for each. One commit = one purpose. This is what makes the weekly summary readable.

3. **Write the message.**
   - `type(scope): mô tả`. Take the type and scope from `commit-rules.mjs`. Pick the scope from the paths: `apps/web` → `web`, `apps/api` → `api`, `packages/game-core` → `game-core`, `occupation-data/` or `docs/data/` → `data`, `docs/project-hub/` → `hub`, `reports/` → `report`, `.github/` `.husky/` `tools/git/` → `ci`, `.claude/` → `skills`. Use at most 2 scopes (`web,api`); if you need more, the commit should probably be split.
   - The description is **Vietnamese with diacritics** and says **what changed for the product or for the team**, not which files were touched: `feat(web): thêm màn đánh giá nghề 5 tiêu chí sau khi xong nghề`, not `feat(web): sửa CareerReview.tsx`. Keep the project's own terms (see the glossary in `docs/project-hub/03-san-pham.md` §9: hành tinh, band, scenario, seed, rubric…).
   - Add a body (blank line after the header) whenever the commit is large (the limits are in `LIMITS`), changes behaviour in a way that is not obvious, or is linked to a decision or open item: mention `D-xx` or the `07` item it addresses. Body = short bullets: what, why, and what the reviewer should watch.
   - Never invent a reason. If the diff doesn't show why, ask the user in one short question, or leave the "why" out.

4. **Link the assigned task.** Run `python3 tools/hub/tuan.py tasks --open` (add `--person <Nhật|Nam|Phúc>` if you know who is committing; `git config user.email` plus `.claude/skills/capstone-weekly-progress/team.json` tells you). If a task clearly matches the change, add `Task: T1909.2` as the last line of the body (several: `Task: T1909.2, T1909.3`). If it's unclear, ask with the 1–3 likeliest candidates. If none fits, add no line: work outside the assigned tasks is fine and shows up as "Làm thêm". Never invent an ID.

5. **Validate.**

   ```
   printf '%s' "<message>" | node tools/git/lint-commit-msg.mjs --stdin --staged
   ```

   Fix every `✖`. Fix the `⚠` warnings too unless there is a reason not to (for example, an English proper noun in the description).

6. **Commit.** Show the message and ask the user to confirm, unless they already said "commit luôn". Write the message to a temp file and run `git commit -F <file>`, so multi-line bodies and Vietnamese characters survive. The husky hook runs again; if it rejects the message, fix and retry. **Never use `--no-verify`.** If the user is on `main` or `production`, the pre-commit hook blocks the commit: suggest `git switch -c <type>/<tên-ngắn>` first (the changes carry over).

## Mode: pr

1. **Collect the branch's work** against `main`:

   ```
   git fetch origin main
   git log --no-merges --format='%h %s%n%b' origin/main..HEAD
   git diff --stat origin/main...HEAD
   git diff origin/main...HEAD
   ```

   Read the diff, not just the commit messages: old commits are often vague (`update`).

2. **Check the commits first.** Run the full check with a draft body:

   ```
   node tools/git/check-pr.mjs --title "<title>" --body-file <draft.md> --base origin/main
   ```

   If commits made on or after `ENFORCE_SINCE` fail, propose a reworded message for each. Explain how to apply them (`git rebase -i origin/main`, `reword`, then `git push --force-with-lease`), but only run the rebase if the user asks, since it rewrites shared history.

3. **Write the title** under the commit rules (`headerOnly`). It becomes the squash commit on `main`, so it should summarise the whole PR.

4. **Write the description** following `.github/pull_request_template.md` exactly: keep its `##` headings and fill each section.
   - **Tóm tắt**: 1–3 sentences for someone who doesn't read code (the advisor, a teammate). What changed and why.
   - **Thay đổi chính**: bullets grouped by area (web / api / game-core / data / docs). Say what behaviour changed, not a list of files.
   - **Cách kiểm tra**: concrete steps (command, URL, test account, what you should see). For docs-only changes: `Không cần: chỉ sửa tài liệu`.
   - **Liên quan**: first `Task: T….` for every assigned task the PR works on. Collect the IDs from the branch's commit trailers, and check `python3 tools/hub/tuan.py tasks --open` for tasks the commits forgot. Then `D-xx`, items in `docs/project-hub/07-van-de-mo.md`, the week's report, and related PRs. If nothing is related, leave the template comment in place.
   - **Ảnh chụp / video**: if `apps/web` UI changed, remind the user to attach screenshots (you can't take them). Leave the placeholder comment.
   - Delete no required heading. Keep the whole description under ~40 lines.

5. **Validate** with `check-pr.mjs` (step 2) until it prints `✔ PR đạt quy ước`.

6. **Deliver.** If `gh` is installed and logged in (`gh auth status`), offer:
   ```
   gh pr create --base main --title "<title>" --body-file <draft.md>
   ```
   or `gh pr edit <n> --title … --body-file …` for an existing PR. Otherwise, print the title and the description in a fenced markdown block, ready to paste.

## When a check already failed

If the user pastes output from the husky hook or the `pr-check` Action, fix exactly the listed `✖` items, re-validate, and show the corrected text. For `pr-check` failures on the description, the fix is editing the PR on GitHub. Nothing needs pushing, because the check re-runs on edit.
