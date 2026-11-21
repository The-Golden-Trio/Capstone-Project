import { Badge } from '@datn/ui';
import type { ReactNode } from 'react';
import type { ScenarioContent } from '../../api/types';

import { ENDING_LABEL, TASK_TYPE_LABEL } from '../../lib/labels';
import { FlowStrip } from '../authoring/editor/FlowStrip';
import { flowOrder } from '../authoring/editor/flow';
import type { Hint } from '../authoring/lint';
import { activityIndexOfPath } from '../authoring/lint';

const PICK_RULE_LABEL: Record<string, string> = {
  MUST: 'bắt buộc chọn',
  SHOULD: 'nên chọn',
  NEUTRAL: 'trung tính',
  MUST_NOT: 'không được chọn',
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  if (children === undefined || children === null || children === '')
    return null;
  return (
    <div className="mb-2">
      <dt className="text-[12px] font-medium text-ink-faint">{label}</dt>
      <dd className="min-w-0 whitespace-pre-wrap break-words">{children}</dd>
    </div>
  );
}

function Block({
  id,
  title,
  kicker,
  children,
}: {
  id?: string;
  title: ReactNode;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 paper rounded-lg p-5">
      {kicker && <p className="eyebrow mb-1 text-[9px]">{kicker}</p>}
      <h3 className="mb-2 font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function AnchorTable({
  rows,
}: {
  rows: Array<{
    name: string;
    anchor2: string;
    anchor1: string;
    anchor0: string;
    counterproductiveSigns?: string;
  }>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead className="text-ink-faint">
          <tr>
            <th className="py-1 pr-2 font-medium">Năng lực</th>
            <th className="py-1 pr-2 font-medium">Mốc 2</th>
            <th className="py-1 pr-2 font-medium">Mốc 1</th>
            <th className="py-1 pr-2 font-medium">Mốc 0</th>
            <th className="py-1 font-medium">Phản tác dụng</th>
          </tr>
        </thead>
        <tbody className="align-top">
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line">
              <td className="py-1 pr-2 font-medium">{r.name}</td>
              <td className="py-1 pr-2">{r.anchor2}</td>
              <td className="py-1 pr-2">{r.anchor1}</td>
              <td className="py-1 pr-2">{r.anchor0}</td>
              <td className="py-1">{r.counterproductiveSigns}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Nội dung scenario chỉ đọc, dùng ở màn duyệt (D04) và gamify (C06, FR-35).
 * Thứ tự khối giống editor D03: bối cảnh, nhân vật, luồng màn, sự kiện, kết
 * cục, nhiệm vụ phụ. Activity xếp theo luồng, không theo thứ tự lưu.
 */
export function ContentReadOnly({
  content,
  skillName,
  hints,
  renderActivityExtra,
}: {
  content: ScenarioContent;
  skillName: (id: string) => string;
  /** Gợi ý soạn, để đánh dấu số gợi ý trên sơ đồ luồng. */
  hints?: Hint[];
  renderActivityExtra?: (activityKey: string) => ReactNode;
}) {
  const order = flowOrder(content.activities);
  const quests = content.sideQuests ?? [];
  return (
    <div className="staff-paper space-y-4 rounded-lg">
      <Block title="Bối cảnh" kicker="Khối B">
        <dl>
          <Row label="Mở đầu">{content.intro}</Row>
          <Row label="Tình huống">{content.situation}</Row>
          <Row label="Điều gì đang bị đe doạ">{content.stakes}</Row>
          <Row label="Thời lượng ước tính">
            {content.estimatedMinutes
              ? `${content.estimatedMinutes} phút`
              : undefined}
          </Row>
        </dl>
      </Block>

      <Block title={`Nhân vật (${content.cast?.length ?? 0})`} kicker="Khối C">
        {(content.cast ?? []).length === 0 ? (
          <p className="text-ink-faint">Chưa khai vai nào.</p>
        ) : (
          <ul className="space-y-1.5">
            {(content.cast ?? []).map((m) => (
              <li key={m.npcKey}>
                <span className="font-medium">{m.roleInScene}</span>
                {m.name && <span className="text-ink-muted"> · {m.name}</span>}
                <span className="font-mono text-[11px] text-ink-faint">
                  {' '}
                  {m.npcKey}
                </span>
                {m.pressure && (
                  <p className="text-[13px] text-ink-muted">
                    Muốn / áp lực: {m.pressure}
                  </p>
                )}
                {m.voice && (
                  <p className="text-[13px] text-ink-faint">Giọng: {m.voice}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Block>

      <Block title="Luồng màn" kicker="Khối D">
        <FlowStrip
          activities={content.activities}
          hints={hints}
          onSelect={(i) =>
            document
              .getElementById(`ro-activity-${content.activities[i].key}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        />
        {hints && hints.length > 0 && (
          <p className="text-[12px] text-ink-faint">
            Số gợi ý trên mỗi ô là của máy, xem chi tiết ở cột bên.
          </p>
        )}
      </Block>

      {order.map((idx) => {
        const a = content.activities[idx];
        const n = (hints ?? []).filter(
          (h) => activityIndexOfPath(h.path) === idx,
        ).length;
        return (
          <Block
            key={a.key}
            id={`ro-activity-${a.key}`}
            title={
              <span className="flex flex-wrap items-center gap-2">
                <span>
                  Activity <span className="font-mono">{a.key}</span>
                  {a.isOrigin ? ' · mở đầu' : !a.forwardTo ? ' · kết' : ''}
                </span>
                {a.allowedTypes.map((t) => (
                  <Badge key={t} tone="info">
                    {TASK_TYPE_LABEL[t]}
                  </Badge>
                ))}
                <span className="text-[12px] font-normal text-ink-faint">
                  → {a.forwardTo ?? 'kết thúc'}
                </span>
                {n > 0 && <Badge tone="warning">{n} gợi ý</Badge>}
              </span>
            }
          >
            <dl>
              <Row label="Bối cảnh">{a.setup}</Row>
              <Row label="Lời NPC">{a.npcLine}</Row>
              <Row label="Câu hỏi">{a.inputPrompt}</Row>
              <Row label="Phạm vi được / không được quyết">{a.jobScope}</Row>
              <Row label="Câu chốt">{a.closingLine}</Row>
              {(a.items ?? []).length > 0 && (
                <Row label="Phương án / mục">
                  <ul className="list-disc pl-5">
                    {(a.items ?? []).map((it) => (
                      <li key={it.key}>
                        {it.text}
                        {it.score !== undefined && (
                          <span className="text-ink-faint">
                            {' '}
                            · điểm {it.score}
                          </span>
                        )}
                        {it.correctPosition !== undefined && (
                          <span className="text-ink-faint">
                            {' '}
                            · vị trí {it.correctPosition}
                          </span>
                        )}
                        {it.pickRule && (
                          <span className="text-ink-faint">
                            {' '}
                            · {PICK_RULE_LABEL[it.pickRule] ?? it.pickRule}
                          </span>
                        )}
                        {(it.why || it.note) && (
                          <span className="text-ink-faint">
                            {' '}
                            — {it.why ?? it.note}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </Row>
              )}
              {a.allowedTypes.includes('FREE_TEXT') && (
                <Row label="Hỏi thêm">
                  {`Tối đa ${a.followupLimit ?? 0} · mục tiêu: ${a.followupGoal || '—'} · mặc định: ${a.defaultFollowup || '—'}`}
                </Row>
              )}
              {(a.hints ?? []).length > 0 && (
                <Row label="Gợi ý">
                  <ul className="list-disc pl-5">
                    {(a.hints ?? []).map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </Row>
              )}
            </dl>
            <h4 className="mt-2 mb-1 text-[13px] font-semibold">
              Tiêu chí chấm
            </h4>
            <AnchorTable
              rows={a.rubric.map((r) => ({
                ...r,
                name: skillName(r.competencyId),
              }))}
            />
            {renderActivityExtra?.(a.key)}
          </Block>
        );
      })}

      {(content.randomEvents ?? []).length > 0 && (
        <Block title="Sự kiện ngẫu nhiên">
          <ul className="space-y-3">
            {(content.randomEvents ?? []).map((e, i) => (
              <li key={i}>
                <p>
                  <span className="text-ink-faint">
                    Sau {e.activityKey} ({Math.round(e.chance * 100)}%):
                  </span>{' '}
                  {e.text}
                </p>
                <p className="mb-1 text-ink-muted">Câu hỏi: {e.prompt}</p>
                <AnchorTable
                  rows={[{ ...e, name: skillName(e.targetCompetencyId) }]}
                />
              </li>
            ))}
          </ul>
        </Block>
      )}

      <Block title="Kết cục">
        <ul className="space-y-1.5">
          {[...content.endings]
            .sort((x, y) => x.priority - y.priority)
            .map((en, i) => (
              <li key={i}>
                <Badge>{ENDING_LABEL[en.type]}</Badge>{' '}
                <span className="text-ink-faint">
                  #{en.priority}
                  {en.minTotalScore != null && ` · ≥ ${en.minTotalScore} điểm`}
                </span>{' '}
                {en.text}
                {en.extraBehaviour && (
                  <span className="text-ink-faint">
                    {' '}
                    · khi: {en.extraBehaviour}
                  </span>
                )}
                {en.reveals && (
                  <p className="text-[13px] text-ink-muted">
                    Người chơi nhận ra: {en.reveals}
                  </p>
                )}
              </li>
            ))}
        </ul>
      </Block>

      {quests.length > 0 && (
        <Block title={`Nhiệm vụ phụ (${quests.length})`}>
          <ul className="list-disc space-y-1 pl-5">
            {quests.map((q, i) => (
              <li key={i}>
                {q.prompt}{' '}
                <span className="text-ink-faint">
                  · {TASK_TYPE_LABEL[q.taskType]} · {q.points} điểm
                </span>
              </li>
            ))}
          </ul>
        </Block>
      )}
    </div>
  );
}
