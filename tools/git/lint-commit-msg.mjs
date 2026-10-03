#!/usr/bin/env node
// Kiểm tra commit message theo tools/git/commit-rules.mjs
//
//   node tools/git/lint-commit-msg.mjs <file>        husky commit-msg (tính độ lớn từ staged diff)
//   node tools/git/lint-commit-msg.mjs --stdin       đọc message từ stdin (thêm --staged để tính độ lớn)
//   node tools/git/lint-commit-msg.mjs --batch       stdin: JSON [{sha, message, files, lines, date}
//                                                    | {kind: 'pr', id, title, body}] → stdout: JSON
//
// Exit 1 khi có lỗi.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import {
  formatResult,
  lintMessage,
  lintPrBody,
  sizeFromNumstat,
  ENFORCE_SINCE,
  TYPES,
  SCOPES,
} from './commit-rules.mjs';

const args = process.argv.slice(2);
const readStdin = () => readFileSync(0, 'utf8');
const staged = () => {
  try {
    return sizeFromNumstat(
      execSync('git diff --cached --numstat', { encoding: 'utf8' }),
    );
  } catch {
    return { files: 0, lines: 0 };
  }
};

if (args.includes('--batch')) {
  const items = JSON.parse(readStdin());
  const out = items.map((it) => {
    if (it.kind === 'pr') {
      const t = lintMessage(it.title || '', { headerOnly: true });
      const b = lintPrBody(it.body || '');
      return {
        id: it.id,
        errors: [...t.errors.map((e) => `Title: ${e}`), ...b.errors],
        warnings: [...t.warnings.map((w) => `Title: ${w}`), ...b.warnings],
      };
    }
    const r = lintMessage(it.message, {
      files: it.files || 0,
      lines: it.lines || 0,
    });
    return {
      sha: it.sha,
      ...r,
      legacy: it.date ? it.date < ENFORCE_SINCE : false,
    };
  });
  process.stdout.write(JSON.stringify(out));
  process.exit(0);
}

let msg;
let size = { files: 0, lines: 0 };
if (args.includes('--stdin')) {
  msg = readStdin();
  if (args.includes('--staged')) size = staged();
} else if (args[0]) {
  msg = readFileSync(args[0], 'utf8');
  size = staged();
} else {
  console.error(
    'Cách dùng: lint-commit-msg.mjs <file> | --stdin [--staged] | --batch',
  );
  process.exit(2);
}

const r = lintMessage(msg, size);
if (r.skipped) process.exit(0);
const text = formatResult('Commit message:', r);
if (r.errors.length) {
  console.error(
    `\n✖ Commit bị chặn vì message chưa đúng quy ước.\n\n${text}\n`,
  );
  console.error(`  Type:  ${Object.keys(TYPES).join(', ')}`);
  console.error(`  Scope: ${Object.keys(SCOPES).join(', ')}`);
  console.error(
    '  Xem CONTRIBUTING.md, hoặc nhờ Claude: /capstone-commit-helper\n',
  );
  process.exit(1);
}
if (text) console.error(`\n${text}\n`);
