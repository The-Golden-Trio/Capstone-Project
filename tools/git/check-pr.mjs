#!/usr/bin/env node
// Kiểm tra PR: title, description và mọi commit trong PR.
// Chạy trong GitHub Action "pr-check", hoặc ở máy trước khi mở PR:
//
//   node tools/git/check-pr.mjs --title "feat(web): …" --body-file pr.md [--base origin/main] [--head HEAD] [--no-commits]
//
// Trong Action đọc env PR_TITLE, PR_BODY, BASE_SHA, HEAD_SHA. Exit 1 khi có lỗi.
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import {
  ENFORCE_SINCE,
  formatResult,
  lintMessage,
  lintPrBody,
  sizeFromNumstat,
} from './commit-rules.mjs';

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' });

const title = opt('--title') ?? process.env.PR_TITLE ?? '';
const body = opt('--body-file')
  ? readFileSync(opt('--body-file'), 'utf8')
  : (process.env.PR_BODY ?? '');
const base = opt('--base') ?? process.env.BASE_SHA ?? 'origin/main';
const head = opt('--head') ?? process.env.HEAD_SHA ?? 'HEAD';

const sections = [];
let errorCount = 0;
const add = (label, r) => {
  errorCount += r.errors.length;
  const t = formatResult(label, r);
  if (t) sections.push(t);
};

add(
  'PR title (sẽ thành commit message khi squash merge):',
  lintMessage(title, { headerOnly: true }),
);
add('PR description:', lintPrBody(body));

if (!args.includes('--no-commits')) {
  let shas = [];
  try {
    shas = git('rev-list', '--no-merges', '--reverse', `${base}..${head}`)
      .split('\n')
      .filter(Boolean);
  } catch (e) {
    sections.push(
      `⚠ Không đọc được commit ${base}..${head}: ${e.message.split('\n')[0]}`,
    );
  }
  for (const sha of shas) {
    const msg = git('log', '-1', '--format=%B', sha);
    const date = git('log', '-1', '--format=%as', sha).trim();
    const size = sizeFromNumstat(git('show', '--numstat', '--format=', sha));
    const r = lintMessage(msg, size);
    if (r.skipped) continue;
    const label = `Commit ${sha.slice(0, 7)} "${msg.split('\n')[0]}":`;
    if (date < ENFORCE_SINCE) {
      // commit cũ: chỉ cảnh báo
      add(`${label} (trước ${ENFORCE_SINCE}, chỉ cảnh báo)`, {
        errors: [],
        warnings: [...r.errors, ...r.warnings],
      });
    } else add(label, r);
  }
}

const report = sections.join('\n\n');
const verdict = errorCount
  ? `✖ PR chưa đạt: ${errorCount} lỗi. Sửa title/description trên GitHub (check tự chạy lại), hoặc reword commit rồi force-push.`
  : '✔ PR đạt quy ước.';
console.log(`${report}${report ? '\n\n' : ''}${verdict}`);
if (errorCount)
  console.log(
    'Hướng dẫn: CONTRIBUTING.md · Nhờ Claude viết lại: /capstone-commit-helper',
  );
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `## PR check\n\n${verdict}\n\n\`\`\`\n${report || 'Không có lỗi hay cảnh báo.'}\n\`\`\`\n`,
  );
}
process.exit(errorCount ? 1 : 0);
