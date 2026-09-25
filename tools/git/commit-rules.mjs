// Quy ước commit message và PR description của nhóm.
// Dùng chung cho: husky commit-msg hook, GitHub Action "pr-check",
// skill capstone-commit-helper (sinh message) và skill capstone-weekly-progress (đọc lại).
// Sửa quy ước ở ĐÂY và ở CONTRIBUTING.md, không sửa rải rác.

export const TYPES = {
  feat: 'tính năng mới cho người dùng',
  fix: 'sửa lỗi',
  refactor: 'đổi cấu trúc code, không đổi hành vi',
  perf: 'tăng hiệu năng',
  style: 'format, CSS, không đổi logic',
  test: 'thêm hoặc sửa test',
  docs: 'tài liệu (docs/, README, project-hub)',
  data: 'dữ liệu nghề, kịch bản, game-data',
  build: 'build, dependency, cấu hình Nx / Vite / pnpm',
  ci: 'GitHub Actions, husky, tools/git',
  chore: 'việc lặt vặt khác (dọn repo, đổi tên file)',
  revert: 'hoàn tác commit trước',
};

export const SCOPES = {
  web: 'apps/web',
  api: 'apps/api (NestJS, Prisma)',
  'game-core': 'packages/game-core',
  data: 'occupation-data/, docs/data/',
  hub: 'docs/project-hub/',
  report: 'reports/ (LaTeX nộp cô)',
  docs: 'tài liệu khác',
  infra: 'infra/',
  ci: '.github/, .husky/, tools/git/',
  deps: 'package.json, pnpm-lock.yaml',
  skills: '.claude/',
  repo: 'cấu trúc repo, cấu hình chung',
};

export const LIMITS = {
  headerMax: 100,
  subjectMinChars: 10,
  subjectMinWords: 3,
  // Commit "lớn" thì phải có body giải thích (không tính lockfile, file sinh tự động)
  bodyRequiredFiles: 10,
  bodyRequiredLines: 400,
  bodyMinChars: 20,
};

// ID task giao trong docs/project-hub/tuan/ (T<ddmm của buổi họp>.<số>), ghi dạng "Task: T1909.2"
export const TASK_ID_RE = /\bT\d{4}\.\d{1,2}\b/g;

/** Cảnh báo khi có dòng "Task:" nhưng không có ID hợp lệ. */
function checkTaskLines(text, warnings) {
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*Tasks?:\s*(.*)$/i);
    if (m && !(m[1].match(TASK_ID_RE) || []).length)
      warnings.push(
        `Dòng "${line.trim()}" không có ID task hợp lệ (dạng T1909.2, xem docs/project-hub/tuan/).`,
      );
  }
}

// Commit tạo trước ngày này chỉ bị cảnh báo, không bị chặn (lịch sử cũ).
export const ENFORCE_SINCE = '2026-09-26';

// Không tính vào độ lớn commit
export const SIZE_IGNORE = [
  /(^|\/)pnpm-lock\.yaml$/,
  /(^|\/)package-lock\.json$/,
  /^packages\/game-core\/data\/.*\.json$/,
  /\.(png|jpe?g|gif|webp|svg|pdf|pptx|zip|ico)$/i,
];

const HEADER_RE = /^([a-zA-Z]+)(?:\(([^)]*)\))?(!)?: (.+)$/;
const SKIP_RE =
  /^(Merge (branch|pull request|remote-tracking)|Revert "|(fixup|squash|amend)! )/;
const VN_RE =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const VAGUE_RE =
  /^(update|updates|updated|fix|fixes|fixed|fix bug|bug fix|wip|test|tmp|temp|change|changes|misc|minor|stuff|code|commit|done|xong|init|cập nhật|sửa|sửa lỗi|sửa code|thêm code|chỉnh sửa)( lại| tiếp| nhỏ| linh tinh| code| file| files| lỗi| bug)*( v?\d+(\.\d+)*)?$/i;

/** Bỏ dòng comment của git và phần diff của `git commit -v`. */
export function cleanMessage(raw) {
  const cut = raw.split(/^# -+ >8 -+$/m)[0];
  return cut
    .split('\n')
    .filter((l) => !l.startsWith('#'))
    .join('\n')
    .replace(/\s+$/, '');
}

/** Tính độ lớn commit từ output `git diff --numstat` / `git show --numstat`. */
export function sizeFromNumstat(numstat) {
  let files = 0;
  let lines = 0;
  for (const line of numstat.split('\n')) {
    const m = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
    if (!m) continue;
    const path = m[3].replace(/^.*=> /, '').replace(/[{}]/g, '');
    if (SIZE_IGNORE.some((re) => re.test(path))) continue;
    files += 1;
    lines += (m[1] === '-' ? 0 : +m[1]) + (m[2] === '-' ? 0 : +m[2]);
  }
  return { files, lines };
}

/**
 * Kiểm tra một commit message (hoặc một PR title khi headerOnly = true).
 * @returns {{errors: string[], warnings: string[], skipped: boolean, type?: string, scope?: string, subject?: string}}
 */
export function lintMessage(
  raw,
  { files = 0, lines = 0, headerOnly = false } = {},
) {
  const errors = [];
  const warnings = [];
  const msg = cleanMessage(raw);
  const all = msg.split('\n');
  const header = (all[0] || '').trim();

  if (!header) return { errors: ['Message rỗng.'], warnings, skipped: false };
  if (SKIP_RE.test(header)) return { errors, warnings, skipped: true };

  const m = header.match(HEADER_RE);
  if (!m) {
    let hint = '';
    if (/^[a-zA-Z]+(\([^)]*\))?:\S/.test(header))
      hint = ' Thiếu dấu cách sau dấu ":".';
    else if (!header.includes(':')) hint = ' Thiếu phần "type:" ở đầu.';
    errors.push(
      `Dòng đầu phải có dạng "type(scope): mô tả", ví dụ "feat(web): thêm màn đánh giá nghề 5 tiêu chí".${hint}`,
    );
    return { errors, warnings, skipped: false };
  }
  const [, type, scopeRaw, , subjectRaw] = m;
  const subject = subjectRaw.trim();

  if (!TYPES[type]) {
    const lower = type.toLowerCase();
    errors.push(
      TYPES[lower]
        ? `Type viết thường: "${lower}", không phải "${type}".`
        : `Type "${type}" không hợp lệ. Dùng một trong: ${Object.keys(TYPES).join(', ')}.`,
    );
  }
  if (scopeRaw === undefined) {
    warnings.push(
      `Nên có scope, ví dụ "${type}(web): …". Scope: ${Object.keys(SCOPES).join(', ')}.`,
    );
  } else {
    const bad = scopeRaw
      .split(/[,/]/)
      .map((s) => s.trim())
      .filter((s) => !SCOPES[s]);
    if (bad.length)
      errors.push(
        `Scope "${bad.join(', ')}" không có trong danh sách: ${Object.keys(SCOPES).join(', ')}.`,
      );
  }
  if (header.length > LIMITS.headerMax)
    errors.push(
      `Dòng đầu dài ${header.length} ký tự (tối đa ${LIMITS.headerMax}). Chi tiết đưa xuống body.`,
    );
  if (VAGUE_RE.test(subject))
    errors.push(
      `Mô tả "${subject}" không nói được đã làm gì. Viết cụ thể: sửa gì, ở đâu, vì sao.`,
    );
  else if (
    subject.length < LIMITS.subjectMinChars ||
    subject.split(/\s+/).length < LIMITS.subjectMinWords
  )
    errors.push(
      `Mô tả "${subject}" quá ngắn (cần ít nhất ${LIMITS.subjectMinWords} từ, ${LIMITS.subjectMinChars} ký tự).`,
    );
  if (/[.。]$/.test(subject))
    errors.push('Không kết thúc dòng đầu bằng dấu chấm.');
  if (!VN_RE.test(subject))
    warnings.push(
      'Mô tả nên viết bằng tiếng Việt có dấu (type và scope giữ tiếng Anh).',
    );

  if (!headerOnly) {
    if (all.length > 1 && all[1].trim() !== '')
      errors.push('Dòng thứ 2 phải để trống (ngăn dòng đầu và body).');
    const body = all.slice(1).join('\n').trim();
    checkTaskLines(body, warnings);
    const big =
      files > LIMITS.bodyRequiredFiles || lines > LIMITS.bodyRequiredLines;
    if (big && body.replace(/\s+/g, ' ').length < LIMITS.bodyMinChars)
      errors.push(
        `Commit lớn (${files} file, ${lines} dòng, không tính lockfile/file sinh) phải có body giải thích: làm gì, vì sao, ảnh hưởng chỗ nào. Hoặc tách thành nhiều commit nhỏ.`,
      );
  }
  return { errors, warnings, skipped: false, type, scope: scopeRaw, subject };
}

// ---------------------------------------------------------------- PR

export const PR_SECTIONS = [
  {
    title: 'Tóm tắt',
    required: true,
    minChars: 30,
    hint: '1–3 câu: PR làm gì và vì sao',
  },
  {
    title: 'Thay đổi chính',
    required: true,
    minChars: 20,
    hint: 'gạch đầu dòng, gom theo phần',
  },
  {
    title: 'Cách kiểm tra',
    required: true,
    minChars: 15,
    hint: 'các bước để reviewer tự thử, hoặc "Không cần: chỉ sửa tài liệu"',
  },
  { title: 'Liên quan', required: false },
  { title: 'Ảnh chụp / video', required: false },
];

const norm = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Nội dung thật của một mục: bỏ comment HTML, dòng placeholder, checkbox chưa tick. */
function realContent(text) {
  return text
    .replace(/<!--[\s\S]*?-->/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(
      (l) =>
        l &&
        !/^([-*+]|\d+\.)?\s*(\[ \])?\s*(\.\.\.|…|-|n\/a|tbd|todo|\.)?$/i.test(
          l,
        ),
    )
    .join('\n');
}

/** Kiểm tra PR description theo PR_SECTIONS. */
export function lintPrBody(body) {
  const errors = [];
  const warnings = [];
  const text = (body || '').replace(/\r\n/g, '\n');
  if (!realContent(text)) {
    errors.push(
      'PR description đang trống. Điền theo template (.github/pull_request_template.md).',
    );
    return { errors, warnings };
  }
  const parts = {};
  const re = /^#{2,3}\s+(.+)$/gm;
  const heads = [...text.matchAll(re)];
  heads.forEach((h, i) => {
    const end = i + 1 < heads.length ? heads[i + 1].index : text.length;
    parts[norm(h[1])] = text.slice(h.index + h[0].length, end);
  });
  checkTaskLines(text.replace(/<!--[\s\S]*?-->/g, ''), warnings);
  for (const s of PR_SECTIONS.filter((x) => x.required)) {
    const key = Object.keys(parts).find((k) => k.startsWith(norm(s.title)));
    if (key === undefined) {
      errors.push(`Thiếu mục "## ${s.title}" (${s.hint}).`);
      continue;
    }
    const c = realContent(parts[key]);
    if (c.replace(/\s+/g, ' ').length < s.minChars)
      errors.push(`Mục "${s.title}" chưa điền hoặc quá ngắn (${s.hint}).`);
  }
  return { errors, warnings };
}

/** In kết quả ra terminal. */
export function formatResult(label, { errors = [], warnings = [] }) {
  const out = [];
  for (const e of errors) out.push(`  ✖ ${e}`);
  for (const w of warnings) out.push(`  ⚠ ${w}`);
  return out.length ? `${label}\n${out.join('\n')}` : '';
}
