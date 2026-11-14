import type { ReactNode } from 'react';
import type { ScenarioContent } from '../../api/types';
import { Badge } from '../../components/ui';
import { ENDING_LABEL, TASK_TYPE_LABEL } from '../../lib/labels';

function Row({ label, children }: { label: string; children: ReactNode }) {
  if (children === undefined || children === null || children === '')
    return null;
  return (
    <div className="mb-2">
      <dt className="text-[12px] font-medium text-muted">{label}</dt>
      <dd className="whitespace-pre-wrap">{children}</dd>
    </div>
  );
}

/** Nội dung scenario chỉ đọc, dùng ở màn duyệt (D04) và gamify (C06, FR-35). */
export function ContentReadOnly({
  content,
  skillName,
  renderActivityExtra,
}: {
  content: ScenarioContent;
  skillName: (id: string) => string;
  renderActivityExtra?: (activityKey: string) => ReactNode;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-[14px] border border-line-gold bg-linear-to-b from-glass to-panel/70 p-5">
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
        {(content.cast ?? []).length > 0 && (
          <>
            <h3 className="mt-3 mb-1 font-semibold">Nhân vật</h3>
            <ul className="list-disc pl-5">
              {(content.cast ?? []).map((m) => (
                <li key={m.npcKey}>
                  <span className="font-medium">{m.name || m.npcKey}</span> —{' '}
                  {m.roleInScene}
                  {m.pressure && (
                    <span className="text-muted"> · {m.pressure}</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      {content.activities.map((a) => (
        <section
          key={a.key}
          className="rounded-[14px] border border-line-gold bg-linear-to-b from-glass to-panel/70 p-5"
        >
          <header className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">
              {a.isOrigin ? '▶ ' : ''}Activity {a.key}
            </h3>
            {a.allowedTypes.map((t) => (
              <Badge key={t} tone="brand">
                {TASK_TYPE_LABEL[t]}
              </Badge>
            ))}
            <span className="text-[12px] text-muted">
              → {a.forwardTo ?? 'kết thúc'}
            </span>
          </header>
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
                        <span className="text-muted"> · điểm {it.score}</span>
                      )}
                      {it.correctPosition !== undefined && (
                        <span className="text-muted">
                          {' '}
                          · vị trí {it.correctPosition}
                        </span>
                      )}
                      {it.pickRule && (
                        <span className="text-muted"> · {it.pickRule}</span>
                      )}
                      {(it.why || it.note) && (
                        <span className="text-muted">
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
                {`Tối đa ${a.followupLimit ?? 0} · mục tiêu: ${a.followupGoal ?? '—'} · mặc định: ${a.defaultFollowup ?? '—'}`}
              </Row>
            )}
            <Row label="Gợi ý">{a.hints?.join(' / ')}</Row>
          </dl>
          <h4 className="mt-2 mb-1 text-[13px] font-semibold">Tiêu chí chấm</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="text-muted">
                <tr>
                  <th className="py-1 pr-2 font-medium">Năng lực</th>
                  <th className="py-1 pr-2 font-medium">Mốc 2</th>
                  <th className="py-1 pr-2 font-medium">Mốc 1</th>
                  <th className="py-1 pr-2 font-medium">Mốc 0</th>
                  <th className="py-1 font-medium">Phản tác dụng</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {a.rubric.map((r, i) => (
                  <tr key={i} className="border-t border-line-2">
                    <td className="py-1 pr-2 font-medium">
                      {skillName(r.competencyId)}
                    </td>
                    <td className="py-1 pr-2">{r.anchor2}</td>
                    <td className="py-1 pr-2">{r.anchor1}</td>
                    <td className="py-1 pr-2">{r.anchor0}</td>
                    <td className="py-1">{r.counterproductiveSigns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderActivityExtra?.(a.key)}
        </section>
      ))}
      {(content.randomEvents ?? []).length > 0 && (
        <section className="rounded-[14px] border border-line-gold bg-linear-to-b from-glass to-panel/70 p-5">
          <h3 className="mb-2 font-semibold">Sự kiện ngẫu nhiên</h3>
          <ul className="list-disc pl-5">
            {(content.randomEvents ?? []).map((e, i) => (
              <li key={i}>
                Sau {e.activityKey} ({Math.round(e.chance * 100)}%): {e.text} —{' '}
                {e.prompt}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="rounded-[14px] border border-line-gold bg-linear-to-b from-glass to-panel/70 p-5">
        <h3 className="mb-2 font-semibold">Kết cục</h3>
        <ul className="space-y-1">
          {[...content.endings]
            .sort((x, y) => x.priority - y.priority)
            .map((en, i) => (
              <li key={i}>
                <Badge>{ENDING_LABEL[en.type]}</Badge>{' '}
                <span className="text-muted">
                  #{en.priority}
                  {en.minTotalScore != null && ` · ≥ ${en.minTotalScore} điểm`}
                </span>{' '}
                {en.text}
                {en.extraBehaviour && (
                  <span className="text-muted">
                    {' '}
                    · khi: {en.extraBehaviour}
                  </span>
                )}
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
