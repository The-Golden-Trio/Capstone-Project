import { Button, Checkbox, Input, Select } from '@datn/ui';
import type { ActivityContent, TaskType } from '../../../api/types';
import { SelectField, TextArea, TextField } from '../../../components/ui';
import { cx } from '../../../lib/cx';
import { TASK_TYPE_LABEL } from '../../../lib/labels';
import { guideHint } from '../../shared/Guidance';
import { nextKey } from '../draft';
import { FIELD_GUIDE } from '../guidance';
import type { Hint } from '../lint';
import { InlineHints, Section, type SkillName } from './shared';

const TASK_TYPES: TaskType[] = [
  'FREE_TEXT',
  'CHOICE',
  'ORDERING',
  'PRIORITIZING',
];

/**
 * Một activity, nhóm trường theo nút của Seed §D5: lời dẫn → câu hỏi và phạm
 * vi → dạng trả lời → phương án → hỏi thêm, gợi ý → chấm. Thang 0/1/2 và mốc
 * rubric 2/1/0 + dấu hiệu phản tác dụng theo D-116.
 */
export function ActivityEditor({
  activity: a,
  index,
  keys,
  readOnly,
  skills,
  hints,
  onChange,
  onMakeOrigin,
}: {
  activity: ActivityContent;
  index: number;
  keys: string[];
  readOnly: boolean;
  skills: SkillName[];
  levelNo: number;
  hints: Hint[];
  onChange: (next: ActivityContent) => void;
  onMakeOrigin: () => void;
}) {
  const at = `activities[${index}]`;
  const set = <K extends keyof ActivityContent>(
    field: K,
    value: ActivityContent[K],
  ) => onChange({ ...a, [field]: value });
  const closed = a.allowedTypes.filter((t) => t !== 'FREE_TEXT');
  const items = a.items ?? [];
  const hintLines = a.hints ?? [];
  const setItem = (j: number, patch: Record<string, unknown>) =>
    set(
      'items',
      items.map((it, k) => (k === j ? { ...it, ...patch } : it)),
    );
  const skillOptions = skills.map((s) => ({
    value: s.competencyId,
    label: s.name,
  }));
  const isEnd = !a.forwardTo;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <Checkbox
          label="Activity mở đầu"
          checked={a.isOrigin ?? false}
          disabled={readOnly}
          onChange={onMakeOrigin}
        />
        <label className="flex items-center gap-2 text-[13px]">
          Tiếp theo
          <Select
            className={cx('w-auto py-1')}
            value={a.forwardTo ?? ''}
            disabled={readOnly}
            onChange={(e) => set('forwardTo', e.target.value || null)}
          >
            <option value="">Kết thúc</option>
            {keys
              .filter((k) => k !== a.key)
              .map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
          </Select>
        </label>
      </div>

      <Section title="Lời dẫn">
        <InlineHints hints={hints} prefix={`${at}.npcLine`} exact />
        <InlineHints hints={hints} prefix={`${at}.closingLine`} exact />
        <TextArea
          label="Bối cảnh activity"
          hint={guideHint(FIELD_GUIDE.setup)}
          value={a.setup ?? ''}
          readOnly={readOnly}
          onChange={(e) => set('setup', e.target.value)}
        />
        <TextArea
          label="Lời NPC"
          hint={guideHint(FIELD_GUIDE.npcLine)}
          value={a.npcLine ?? ''}
          readOnly={readOnly}
          onChange={(e) => set('npcLine', e.target.value)}
        />
        <TextArea
          label="Câu chốt của NPC"
          hint={guideHint(FIELD_GUIDE.closingLine)}
          value={a.closingLine}
          readOnly={readOnly}
          onChange={(e) => set('closingLine', e.target.value)}
        />
      </Section>

      <Section title="Câu hỏi và phạm vi">
        <InlineHints hints={hints} prefix={`${at}.inputPrompt`} exact />
        <InlineHints hints={hints} prefix={`${at}.jobScope`} exact />
        <TextArea
          label="Câu hỏi cho người chơi"
          hint={guideHint(FIELD_GUIDE.inputPrompt)}
          value={a.inputPrompt}
          readOnly={readOnly}
          onChange={(e) => set('inputPrompt', e.target.value)}
        />
        <TextArea
          label="Phạm vi được / không được quyết"
          hint={guideHint(FIELD_GUIDE.jobScope)}
          value={a.jobScope}
          readOnly={readOnly}
          onChange={(e) => set('jobScope', e.target.value)}
        />
      </Section>

      <Section
        title="Dạng trả lời được phép (CA chọn một khi trình bày)"
        note={
          isEnd
            ? 'Đây là activity kết: luôn cho phép tự luận (Seed §D3).'
            : 'Dạng đóng chỉ dùng khi tình huống không gõ tự do được; thuyết phục người khác không bao giờ là dạng đóng (Seed §D3).'
        }
      >
        <InlineHints hints={hints} prefix={at} exact />
        <div className="flex flex-wrap gap-4">
          {TASK_TYPES.map((t) => (
            <Checkbox
              key={t}
              label={TASK_TYPE_LABEL[t]}
              disabled={readOnly}
              checked={a.allowedTypes.includes(t)}
              onChange={() => {
                const next = a.allowedTypes.includes(t)
                  ? a.allowedTypes.filter((x) => x !== t)
                  : [...a.allowedTypes, t];
                if (next.length) set('allowedTypes', next);
              }}
            />
          ))}
        </div>
      </Section>

      {closed.length > 0 && (
        <Section
          title={`Phương án / mục (${closed.map((t) => TASK_TYPE_LABEL[t]).join(', ')})`}
          note={
            <>
              {FIELD_GUIDE.item.text}{' '}
              {closed.includes('CHOICE') && FIELD_GUIDE.choiceScore.text}
            </>
          }
        >
          <InlineHints hints={hints} prefix={`${at}.items`} />
          {items.map((it, j) => (
            <div
              key={j}
              className="mb-2 grid gap-2 border-b border-line pb-2 md:grid-cols-[1fr_auto_auto_auto]"
            >
              <TextField
                label={`Mục ${it.key}`}
                value={it.text}
                readOnly={readOnly}
                onChange={(e) => setItem(j, { text: e.target.value })}
              />
              {closed.includes('CHOICE') && (
                <SelectField
                  label="Điểm"
                  value={it.score === undefined ? '' : String(it.score)}
                  disabled={readOnly}
                  onChange={(e) =>
                    setItem(j, {
                      score:
                        e.target.value === ''
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                  placeholder="—"
                  options={[
                    { value: '2', label: '2' },
                    { value: '1', label: '1' },
                    { value: '0', label: '0' },
                  ]}
                />
              )}
              {closed.includes('ORDERING') && (
                <TextField
                  label="Vị trí đúng"
                  type="number"
                  min={1}
                  value={it.correctPosition ?? ''}
                  readOnly={readOnly}
                  onChange={(e) =>
                    setItem(j, {
                      correctPosition: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              )}
              {closed.includes('PRIORITIZING') && (
                <SelectField
                  label="Luật chọn"
                  value={it.pickRule ?? ''}
                  disabled={readOnly}
                  onChange={(e) =>
                    setItem(j, { pickRule: e.target.value || undefined })
                  }
                  placeholder="—"
                  options={[
                    { value: 'MUST', label: 'Bắt buộc chọn' },
                    { value: 'SHOULD', label: 'Nên chọn' },
                    { value: 'NEUTRAL', label: 'Trung tính' },
                    { value: 'MUST_NOT', label: 'Không được chọn' },
                  ]}
                />
              )}
              {!readOnly && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="self-end md:mb-3"
                  aria-label={`Xoá mục ${it.key}`}
                  onClick={() =>
                    set(
                      'items',
                      items.filter((_, k) => k !== j),
                    )
                  }
                >
                  ✕
                </Button>
              )}
              <div className="md:col-span-4">
                <TextField
                  label="Lý do / phản ứng của NPC khi chọn mục này"
                  value={it.why ?? it.note ?? ''}
                  readOnly={readOnly}
                  onChange={(e) =>
                    setItem(
                      j,
                      closed.includes('PRIORITIZING')
                        ? { note: e.target.value }
                        : { why: e.target.value },
                    )
                  }
                />
              </div>
            </div>
          ))}
          {!readOnly && (
            <Button
              variant="subtle"
              size="sm"
              onClick={() =>
                set('items', [
                  ...items,
                  {
                    key: nextKey(
                      items.map((x) => x.key),
                      'o',
                    ),
                    text: '',
                  },
                ])
              }
            >
              + Thêm mục
            </Button>
          )}
        </Section>
      )}

      {a.allowedTypes.includes('FREE_TEXT') && (
        <Section title="Hỏi thêm và gợi ý (chỉ cho tự luận)">
          <TextField
            label="Số lần hỏi thêm tối đa"
            type="number"
            min={0}
            max={4}
            value={a.followupLimit ?? 0}
            readOnly={readOnly}
            onChange={(e) => set('followupLimit', Number(e.target.value))}
          />
          <TextArea
            label="Mục tiêu hỏi thêm"
            hint="Runtime đào sâu về điều gì (FR-22). Câu hỏi thêm không gọi tên chỗ người chơi bỏ sót (Luật A7)."
            value={a.followupGoal ?? ''}
            readOnly={readOnly}
            onChange={(e) => set('followupGoal', e.target.value)}
          />
          <TextField
            label="Câu hỏi thêm mặc định"
            value={a.defaultFollowup ?? ''}
            readOnly={readOnly}
            onChange={(e) => set('defaultFollowup', e.target.value)}
          />
          <p className="mb-1.5 text-[12.5px] font-semibold tracking-[0.02em] text-ink-muted">
            Gợi ý (lời NPC)
          </p>
          <p className="mb-2 text-[12px] text-ink-faint">
            {guideHint(FIELD_GUIDE.hint)}
          </p>
          {hintLines.map((line, j) => (
            <div key={j} className="mb-2 flex items-center gap-2">
              <Input
                aria-label={`Gợi ý ${j + 1}`}
                className="flex-1"
                value={line}
                readOnly={readOnly}
                onChange={(e) =>
                  set(
                    'hints',
                    hintLines.map((x, k) => (k === j ? e.target.value : x)),
                  )
                }
              />
              {!readOnly && (
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Xoá gợi ý ${j + 1}`}
                  onClick={() =>
                    set(
                      'hints',
                      hintLines.filter((_, k) => k !== j),
                    )
                  }
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
          {!readOnly && (
            <Button
              variant="subtle"
              size="sm"
              onClick={() => set('hints', [...hintLines, ''])}
            >
              + Thêm gợi ý
            </Button>
          )}
        </Section>
      )}

      <Section
        title="Tiêu chí chấm (mốc 2 / 1 / 0)"
        note={guideHint(FIELD_GUIDE.anchor)}
      >
        <InlineHints hints={hints} prefix={`${at}.rubric`} />
        {a.rubric.map((r, j) => (
          <div key={j} className="mb-3 border-b border-line pb-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <SelectField
                  label="Năng lực"
                  value={r.competencyId}
                  disabled={readOnly}
                  options={skillOptions}
                  placeholder="— Chọn —"
                  onChange={(e) =>
                    set(
                      'rubric',
                      a.rubric.map((x, k) =>
                        k === j ? { ...x, competencyId: e.target.value } : x,
                      ),
                    )
                  }
                />
              </div>
              {!readOnly && a.rubric.length > 1 && (
                <Button
                  size="sm"
                  variant="danger"
                  className="mb-3"
                  onClick={() =>
                    set(
                      'rubric',
                      a.rubric.filter((_, k) => k !== j),
                    )
                  }
                >
                  Xoá
                </Button>
              )}
            </div>
            {(['anchor2', 'anchor1', 'anchor0'] as const).map((f) => (
              <TextArea
                key={f}
                rows={2}
                label={`Mốc ${f.slice(-1)}`}
                value={r[f]}
                readOnly={readOnly}
                onChange={(e) =>
                  set(
                    'rubric',
                    a.rubric.map((x, k) =>
                      k === j ? { ...x, [f]: e.target.value } : x,
                    ),
                  )
                }
              />
            ))}
            <TextArea
              rows={2}
              label="Dấu hiệu phản tác dụng"
              hint={guideHint(FIELD_GUIDE.counterproductive)}
              value={r.counterproductiveSigns ?? ''}
              readOnly={readOnly}
              onChange={(e) =>
                set(
                  'rubric',
                  a.rubric.map((x, k) =>
                    k === j
                      ? { ...x, counterproductiveSigns: e.target.value }
                      : x,
                  ),
                )
              }
            />
          </div>
        ))}
        {!readOnly && (
          <Button
            variant="subtle"
            size="sm"
            onClick={() =>
              set('rubric', [
                ...a.rubric,
                {
                  competencyId:
                    skills.find(
                      (s) =>
                        !a.rubric.some(
                          (r) => r.competencyId === s.competencyId,
                        ),
                    )?.competencyId ?? '',
                  anchor2: '',
                  anchor1: '',
                  anchor0: '',
                },
              ])
            }
          >
            + Thêm tiêu chí
          </Button>
        )}
      </Section>
    </div>
  );
}
