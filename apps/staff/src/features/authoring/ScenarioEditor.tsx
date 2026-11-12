import { useState, type ReactNode } from 'react';
import type {
  ActivityContent,
  ScenarioContent,
  TaskType,
} from '../../api/types';
import {
  Button,
  Card,
  Checkbox,
  EmptyState,
  SelectField,
  Tabs,
  TextArea,
  TextField,
} from '../../components/ui';
import { ENDING_LABEL, TASK_TYPE_LABEL } from '../../lib/labels';
import { emptyActivity, nextKey, produce } from './draft';

export interface SkillName {
  competencyId: string;
  name: string;
}

interface EditorProps {
  content: ScenarioContent;
  onChange: (next: ScenarioContent) => void;
  readOnly: boolean;
  /** Năng lực của scenario (`scenario_skill`), để gắn tiêu chí. */
  skills: SkillName[];
  /** Mở hộp "sửa phần này bằng AI" cho đường dẫn `part`. */
  onRevise?: (part: string, label: string) => void;
}

type Tab = 'intro' | 'cast' | 'activities' | 'events' | 'endings';

/**
 * D03: sửa `ScenarioContent` (FR-22). Thang điểm 0/1/2 và mốc rubric 2/1/0 +
 * dấu hiệu phản tác dụng theo D-116. Luật cấu trúc (con trỏ, trần theo cấp,
 * thời lượng) do máy chủ kiểm ở nút "Kiểm tra".
 */
export function ScenarioEditor(props: EditorProps) {
  const [tab, setTab] = useState<Tab>('activities');
  const { content } = props;
  return (
    <div>
      <Tabs
        label="Phần nội dung"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'intro', label: 'Mở đầu' },
          { id: 'cast', label: `Nhân vật (${content.cast?.length ?? 0})` },
          {
            id: 'activities',
            label: `Activity (${content.activities.length})`,
          },
          {
            id: 'events',
            label: `Sự kiện (${content.randomEvents?.length ?? 0})`,
          },
          { id: 'endings', label: `Kết cục (${content.endings.length})` },
        ]}
      />
      {tab === 'intro' && <IntroTab {...props} />}
      {tab === 'cast' && <CastTab {...props} />}
      {tab === 'activities' && <ActivitiesTab {...props} />}
      {tab === 'events' && <EventsTab {...props} />}
      {tab === 'endings' && <EndingsTab {...props} />}
    </div>
  );
}

function ReviseButton({
  onRevise,
  part,
  label,
  readOnly,
}: {
  onRevise?: EditorProps['onRevise'];
  part: string;
  label: string;
  readOnly: boolean;
}) {
  if (!onRevise || readOnly) return null;
  return (
    <Button size="sm" variant="ghost" onClick={() => onRevise(part, label)}>
      <span aria-hidden="true">✨</span> Sửa bằng AI
    </Button>
  );
}

function IntroTab({ content, onChange, readOnly, onRevise }: EditorProps) {
  const set = (field: 'intro' | 'situation' | 'stakes', value: string) =>
    onChange(produce(content, (d) => void (d[field] = value)));
  const fields: Array<['intro' | 'situation' | 'stakes', string, string]> = [
    ['intro', 'Mở đầu', 'Người chơi đọc đầu tiên: họ là ai, ở đâu.'],
    ['situation', 'Tình huống', 'Chuyện gì đang xảy ra.'],
    ['stakes', 'Điều gì đang bị đe doạ', 'Làm không tốt thì mất gì.'],
  ];
  return (
    <Card>
      {fields.map(([field, label, hint]) => (
        <div key={field}>
          <div className="flex justify-end">
            <ReviseButton
              onRevise={onRevise}
              part={field}
              label={label}
              readOnly={readOnly}
            />
          </div>
          <TextArea
            label={label}
            hint={hint}
            value={content[field] ?? ''}
            readOnly={readOnly}
            onChange={(e) => set(field, e.target.value)}
          />
        </div>
      ))}
      <TextField
        label="Thời lượng ước tính (phút, 10–15)"
        type="number"
        min={10}
        max={15}
        step={0.5}
        value={content.estimatedMinutes ?? ''}
        readOnly={readOnly}
        onChange={(e) =>
          onChange(
            produce(content, (d) => {
              d.estimatedMinutes =
                e.target.value === '' ? undefined : Number(e.target.value);
            }),
          )
        }
      />
    </Card>
  );
}

function CastTab({ content, onChange, readOnly }: EditorProps) {
  const cast = content.cast ?? [];
  const update = (i: number, field: string, value: string) =>
    onChange(
      produce(content, (d) => {
        (d.cast ??= [])[i] = { ...d.cast[i], [field]: value };
      }),
    );
  return (
    <div className="space-y-3">
      {cast.length === 0 && <EmptyState>Chưa có NPC.</EmptyState>}
      {cast.map((m, i) => (
        <Card
          key={i}
          title={`${m.name || m.npcKey}`}
          actions={
            !readOnly && (
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  onChange(produce(content, (d) => void d.cast?.splice(i, 1)))
                }
              >
                Xoá
              </Button>
            )
          }
        >
          <div className="grid gap-x-3 md:grid-cols-2">
            <TextField
              label="Khoá NPC"
              value={m.npcKey}
              readOnly={readOnly}
              onChange={(e) => update(i, 'npcKey', e.target.value)}
            />
            <TextField
              label="Tên"
              value={m.name ?? ''}
              readOnly={readOnly}
              onChange={(e) => update(i, 'name', e.target.value)}
            />
            <TextField
              label="Vai trong tình huống"
              value={m.roleInScene}
              readOnly={readOnly}
              onChange={(e) => update(i, 'roleInScene', e.target.value)}
            />
            <TextField
              label="Áp lực"
              value={m.pressure ?? ''}
              readOnly={readOnly}
              onChange={(e) => update(i, 'pressure', e.target.value)}
            />
          </div>
          <TextField
            label="Giọng nói"
            value={m.voice ?? ''}
            readOnly={readOnly}
            onChange={(e) => update(i, 'voice', e.target.value)}
          />
        </Card>
      ))}
      {!readOnly && (
        <Button
          onClick={() =>
            onChange(
              produce(content, (d) => {
                (d.cast ??= []).push({
                  npcKey: nextKey(
                    cast.map((c) => c.npcKey),
                    'npc',
                  ),
                  roleInScene: 'Đồng nghiệp',
                });
              }),
            )
          }
        >
          + Thêm NPC
        </Button>
      )}
    </div>
  );
}

function ActivitiesTab({
  content,
  onChange,
  readOnly,
  skills,
  onRevise,
}: EditorProps) {
  const [open, setOpen] = useState(0);
  const keys = content.activities.map((a) => a.key);
  return (
    <div className="space-y-3">
      {content.activities.map((a, i) => (
        <Card
          key={i}
          title={
            <button
              type="button"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? -1 : i)}
              className="text-left"
            >
              {a.isOrigin ? '▶ ' : ''}
              {a.key} · {a.inputPrompt.slice(0, 70) || 'Activity mới'}
            </button>
          }
          actions={
            <>
              <ReviseButton
                onRevise={onRevise}
                part={`activities[${i}]`}
                label={`Activity ${a.key}`}
                readOnly={readOnly}
              />
              {!readOnly && content.activities.length > 3 && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    onChange(
                      produce(content, (d) => {
                        d.activities.splice(i, 1);
                        for (const x of d.activities)
                          if (x.forwardTo === a.key)
                            x.forwardTo = a.forwardTo ?? null;
                      }),
                    )
                  }
                >
                  Xoá
                </Button>
              )}
            </>
          }
        >
          {open === i ? (
            <ActivityEditor
              activity={a}
              keys={keys}
              readOnly={readOnly}
              skills={skills}
              onChange={(next) =>
                onChange(produce(content, (d) => void (d.activities[i] = next)))
              }
              onMakeOrigin={() =>
                onChange(
                  produce(content, (d) => {
                    d.activities.forEach((x, j) => (x.isOrigin = j === i));
                  }),
                )
              }
            />
          ) : (
            <p className="text-[13px] text-muted">
              {a.allowedTypes.map((t) => TASK_TYPE_LABEL[t]).join(', ')} · tiếp
              theo: {a.forwardTo ?? 'kết thúc'} · {a.rubric.length} tiêu chí ·
              hỏi thêm tối đa {a.followupLimit ?? 0}
            </p>
          )}
        </Card>
      ))}
      {!readOnly && content.activities.length < 4 && (
        <Button
          onClick={() =>
            onChange(
              produce(content, (d) => {
                const key = nextKey(keys, 'a');
                const last = d.activities.find((x) => !x.forwardTo);
                if (last) last.forwardTo = key;
                d.activities.push(
                  emptyActivity(key, skills[0]?.competencyId ?? ''),
                );
              }),
            )
          }
        >
          + Thêm activity (tối đa 4)
        </Button>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="mt-4 rounded-md border border-line-2 p-3">
      <legend className="px-1 text-[13px] font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

const TASK_TYPES: TaskType[] = [
  'FREE_TEXT',
  'CHOICE',
  'ORDERING',
  'PRIORITIZING',
];

export function ActivityEditor({
  activity: a,
  keys,
  readOnly,
  skills,
  onChange,
  onMakeOrigin,
}: {
  activity: ActivityContent;
  keys: string[];
  readOnly: boolean;
  skills: SkillName[];
  onChange: (next: ActivityContent) => void;
  onMakeOrigin: () => void;
}) {
  const set = <K extends keyof ActivityContent>(
    field: K,
    value: ActivityContent[K],
  ) => onChange({ ...a, [field]: value });
  const closed = a.allowedTypes.filter((t) => t !== 'FREE_TEXT');
  const items = a.items ?? [];
  const setItem = (j: number, patch: Record<string, unknown>) =>
    set(
      'items',
      items.map((it, k) => (k === j ? { ...it, ...patch } : it)),
    );
  const skillOptions = skills.map((s) => ({
    value: s.competencyId,
    label: s.name,
  }));

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
          <select
            className="rounded-md border border-line px-2 py-1"
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
          </select>
        </label>
      </div>
      <TextArea
        label="Bối cảnh activity"
        value={a.setup ?? ''}
        readOnly={readOnly}
        onChange={(e) => set('setup', e.target.value)}
      />
      <TextArea
        label="Lời NPC"
        value={a.npcLine ?? ''}
        readOnly={readOnly}
        onChange={(e) => set('npcLine', e.target.value)}
      />
      <TextArea
        label="Câu hỏi cho người chơi"
        value={a.inputPrompt}
        readOnly={readOnly}
        onChange={(e) => set('inputPrompt', e.target.value)}
      />
      <TextArea
        label="Phạm vi được / không được quyết"
        hint="Viết cả hai vế: ở cấp này người chơi được tự quyết gì, không được quyết gì."
        value={a.jobScope}
        readOnly={readOnly}
        onChange={(e) => set('jobScope', e.target.value)}
      />
      <TextArea
        label="Câu chốt của NPC"
        value={a.closingLine}
        readOnly={readOnly}
        onChange={(e) => set('closingLine', e.target.value)}
      />

      <Section title="Dạng task được phép (CA chọn một khi trình bày)">
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
        >
          {items.map((it, j) => (
            <div
              key={j}
              className="mb-2 grid gap-2 border-b border-line-2 pb-2 md:grid-cols-[1fr_auto_auto]"
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
              <div className="md:col-span-3">
                <TextField
                  label="Lý do / ghi chú"
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
            hint="Runtime đào sâu về điều gì (FR-22)."
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
          <TextField
            label="Gợi ý (lời NPC, chỉ hướng, không đưa đáp án)"
            value={a.hints?.[0] ?? ''}
            readOnly={readOnly}
            onChange={(e) =>
              set('hints', e.target.value ? [e.target.value] : [])
            }
          />
        </Section>
      )}

      <Section title="Tiêu chí chấm (mốc 2 / 1 / 0, viết bằng hành vi quan sát được)">
        {a.rubric.map((r, j) => (
          <div key={j} className="mb-3 border-b border-line-2 pb-3">
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

function EventsTab({ content, onChange, readOnly, skills }: EditorProps) {
  const events = content.randomEvents ?? [];
  const keys = content.activities.map((a) => a.key);
  const update = (i: number, patch: Record<string, unknown>) =>
    onChange(
      produce(
        content,
        (d) =>
          void ((d.randomEvents ??= [])[i] = {
            ...d.randomEvents[i],
            ...patch,
          }),
      ),
    );
  return (
    <div className="space-y-3">
      {events.length === 0 && (
        <EmptyState>Không có sự kiện ngẫu nhiên (tối đa 2).</EmptyState>
      )}
      {events.map((ev, i) => (
        <Card
          key={i}
          title={`Sự kiện ${i + 1}`}
          actions={
            !readOnly && (
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  onChange(
                    produce(content, (d) => void d.randomEvents?.splice(i, 1)),
                  )
                }
              >
                Xoá
              </Button>
            )
          }
        >
          <div className="grid gap-x-3 md:grid-cols-3">
            <SelectField
              label="Sau activity"
              value={ev.activityKey}
              disabled={readOnly}
              options={keys.map((k) => ({ value: k, label: k }))}
              onChange={(e) => update(i, { activityKey: e.target.value })}
            />
            <TextField
              label="Xác suất (0,1–0,4)"
              type="number"
              step={0.05}
              min={0.1}
              max={0.4}
              value={ev.chance}
              readOnly={readOnly}
              onChange={(e) => update(i, { chance: Number(e.target.value) })}
            />
            <SelectField
              label="Năng lực đo"
              value={ev.targetCompetencyId}
              disabled={readOnly}
              options={skills.map((s) => ({
                value: s.competencyId,
                label: s.name,
              }))}
              onChange={(e) =>
                update(i, { targetCompetencyId: e.target.value })
              }
            />
          </div>
          <TextArea
            label="Chuyện gì xảy ra"
            value={ev.text}
            readOnly={readOnly}
            onChange={(e) => update(i, { text: e.target.value })}
          />
          <TextArea
            label="Câu hỏi"
            value={ev.prompt}
            readOnly={readOnly}
            onChange={(e) => update(i, { prompt: e.target.value })}
          />
          {(['anchor2', 'anchor1', 'anchor0'] as const).map((f) => (
            <TextArea
              key={f}
              rows={2}
              label={`Mốc ${f.slice(-1)}`}
              value={ev[f]}
              readOnly={readOnly}
              onChange={(e) => update(i, { [f]: e.target.value })}
            />
          ))}
        </Card>
      ))}
      {!readOnly && events.length < 2 && (
        <Button
          onClick={() =>
            onChange(
              produce(content, (d) => {
                (d.randomEvents ??= []).push({
                  activityKey: keys[0],
                  chance: 0.2,
                  text: '',
                  prompt: '',
                  targetCompetencyId: skills[0]?.competencyId ?? '',
                  anchor2: '',
                  anchor1: '',
                  anchor0: '',
                });
              }),
            )
          }
        >
          + Thêm sự kiện
        </Button>
      )}
    </div>
  );
}

function EndingsTab({ content, onChange, readOnly, onRevise }: EditorProps) {
  const update = (i: number, patch: Record<string, unknown>) =>
    onChange(
      produce(
        content,
        (d) => void (d.endings[i] = { ...d.endings[i], ...patch }),
      ),
    );
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-muted">
        Máy xét kết cục theo priority tăng dần; kết cục priority lớn nhất không
        có điều kiện. SECRET luôn priority 1.
      </p>
      {content.endings.map((en, i) => (
        <Card
          key={i}
          title={`${ENDING_LABEL[en.type]} · priority ${en.priority}`}
          actions={
            <>
              <ReviseButton
                onRevise={onRevise}
                part={`endings[${i}]`}
                label={`Kết cục ${ENDING_LABEL[en.type]}`}
                readOnly={readOnly}
              />
              {!readOnly && content.endings.length > 2 && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    onChange(
                      produce(content, (d) => void d.endings.splice(i, 1)),
                    )
                  }
                >
                  Xoá
                </Button>
              )}
            </>
          }
        >
          <div className="grid gap-x-3 md:grid-cols-3">
            <SelectField
              label="Loại"
              value={en.type}
              disabled={readOnly}
              options={Object.entries(ENDING_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
              onChange={(e) => update(i, { type: e.target.value })}
            />
            <TextField
              label="Priority"
              type="number"
              min={1}
              value={en.priority}
              readOnly={readOnly}
              onChange={(e) => update(i, { priority: Number(e.target.value) })}
            />
            <TextField
              label="Tổng điểm tối thiểu"
              type="number"
              value={en.minTotalScore ?? ''}
              readOnly={readOnly}
              onChange={(e) =>
                update(i, {
                  minTotalScore:
                    e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />
          </div>
          <TextArea
            label="Nội dung"
            value={en.text}
            readOnly={readOnly}
            onChange={(e) => update(i, { text: e.target.value })}
          />
          {en.type === 'SECRET' && (
            <>
              <TextArea
                label="Hành vi điều kiện"
                value={en.extraBehaviour ?? ''}
                readOnly={readOnly}
                onChange={(e) =>
                  update(i, { extraBehaviour: e.target.value || null })
                }
              />
              <TextArea
                label="Người chơi nhận ra điều gì"
                value={en.reveals ?? ''}
                readOnly={readOnly}
                onChange={(e) => update(i, { reveals: e.target.value || null })}
              />
            </>
          )}
        </Card>
      ))}
      {!readOnly && content.endings.length < 5 && (
        <Button
          onClick={() =>
            onChange(
              produce(content, (d) => {
                const max = Math.max(...d.endings.map((x) => x.priority));
                d.endings.push({
                  type: 'PARTIAL',
                  priority: max + 1,
                  minTotalScore: null,
                  extraBehaviour: null,
                  text: '',
                  reveals: null,
                });
              }),
            )
          }
        >
          + Thêm kết cục
        </Button>
      )}
    </div>
  );
}
