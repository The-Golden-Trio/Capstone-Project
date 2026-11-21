import { Button, Checkbox, EmptyState, LoadingBlock } from '@datn/ui';
import { useState } from 'react';
import { staffApi } from '../../api/endpoints';
import type { ReferenceAnswer, ScenarioContent } from '../../api/types';
import { Card, ProblemAlert, SelectField, TextArea } from '../../components/ui';
import { useLoad } from '../../hooks/useLoad';
import { SourceTag } from '../shared/Guidance';
import type { SkillName } from './ScenarioEditor';

type Score = 0 | 1 | 2 | null;

/**
 * Câu mẫu (UC-D01 "Build reference set", FR-24): DE viết câu trả lời mẫu cho
 * activity và chấm từng tiêu chí 0/1/2 (hoặc "không xét"). Chỉ lưu khi đủ
 * điểm cho mọi tiêu chí của activity.
 */
export function ReferenceAnswers({
  scenarioId,
  content,
  skills,
  readOnly,
  dirty,
}: {
  scenarioId: string;
  content: ScenarioContent;
  skills: SkillName[];
  readOnly: boolean;
  dirty: boolean;
}) {
  const list = useLoad(
    () => staffApi.listReferenceAnswers(scenarioId),
    [scenarioId],
  );
  const [activityKey, setActivityKey] = useState(
    content.activities[0]?.key ?? '',
  );
  const [text, setText] = useState('');
  const [stratum, setStratum] = useState<ReferenceAnswer['stratum']>('MEDIUM');
  const [scores, setScores] = useState<Record<string, Score>>({});
  /** Cờ phản tác dụng ghi riêng với điểm (D-116). */
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const activity = content.activities.find((a) => a.key === activityKey);
  const rubric = (activity?.rubric ?? []).filter(
    (r): r is typeof r & { id: string } =>
      typeof r.id === 'string' && r.id.length > 0,
  );
  const nameOf = (id: string) =>
    skills.find((s) => s.competencyId === id)?.name ?? id;

  const add = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await staffApi.addReferenceAnswer(scenarioId, {
        activityKey,
        answerText: text,
        stratum,
        scores: rubric.map((r) => ({
          criterionId: r.id as string,
          score: scores[r.id as string] ?? null,
          counterproductive: flags[r.id as string] ?? false,
        })),
      });
      setText('');
      setScores({});
      setFlags({});
      await list.reload();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Câu mẫu đã lưu" className="staff-paper paper">
        <ProblemAlert error={list.error} />
        {list.loading ? (
          <LoadingBlock />
        ) : list.error ? null : (list.data ?? []).length === 0 ? (
          <EmptyState title={<>Chưa có câu mẫu.</>} />
        ) : (
          <ul className="space-y-3">
            {(list.data ?? []).map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-line bg-night-900/25 p-3"
              >
                <p className="text-[12px] text-ink-faint">
                  {r.activityKey} ·{' '}
                  {r.stratum === 'EASY'
                    ? 'dễ'
                    : r.stratum === 'HARD'
                      ? 'khó'
                      : 'vừa'}
                </p>
                <p>{r.answerText}</p>
                <p className="mt-1 text-[12px] text-ink-muted">
                  {r.scores
                    .map(
                      (s) =>
                        `${s.score === null ? 'không xét' : s.score}${s.counterproductive ? ' ⚑' : ''}`,
                    )
                    .join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {!readOnly && (
        <Card title="Thêm câu mẫu" className="staff-paper paper">
          {dirty && (
            <p className="mb-2 text-[13px] text-warning">
              Lưu nội dung trước để tiêu chí có mã, rồi mới chấm câu mẫu.
            </p>
          )}
          <ProblemAlert error={error} />
          <SelectField
            label="Activity"
            value={activityKey}
            onChange={(e) => setActivityKey(e.target.value)}
            options={content.activities.map((a) => ({
              value: a.key,
              label: `${a.key} · ${a.inputPrompt.slice(0, 50)}`,
            }))}
          />
          <TextArea
            label="Câu trả lời mẫu"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <SelectField
            label="Độ khó"
            value={stratum}
            onChange={(e) =>
              setStratum(e.target.value as ReferenceAnswer['stratum'])
            }
            options={[
              { value: 'EASY', label: 'Dễ' },
              { value: 'MEDIUM', label: 'Vừa' },
              { value: 'HARD', label: 'Khó' },
            ]}
          />
          {rubric.length > 0 && (
            <p className="mb-2 text-[12px] text-ink-faint">
              Chấm 0/1/2 hoặc “không xét”. Cờ phản tác dụng ghi riêng, không trừ
              vào điểm.
              <SourceTag>D-116</SourceTag>
            </p>
          )}
          {rubric.map((r) => (
            <div key={r.id} className="mb-1">
              <SelectField
                label={`Điểm: ${nameOf(r.competencyId)}`}
                value={
                  scores[r.id as string] === undefined
                    ? ''
                    : String(scores[r.id as string])
                }
                onChange={(e) =>
                  setScores((s) => ({
                    ...s,
                    [r.id as string]:
                      e.target.value === 'na'
                        ? null
                        : (Number(e.target.value) as Score),
                  }))
                }
                placeholder="— Chọn —"
                options={[
                  { value: '2', label: '2' },
                  { value: '1', label: '1' },
                  { value: '0', label: '0' },
                  { value: 'na', label: 'Không xét' },
                ]}
              />
              <div className="-mt-1 mb-2">
                <Checkbox
                  label="Có dấu hiệu phản tác dụng"
                  checked={flags[r.id as string] ?? false}
                  onChange={(e) =>
                    setFlags((f) => ({
                      ...f,
                      [r.id as string]: e.target.checked,
                    }))
                  }
                />
              </div>
            </div>
          ))}
          <Button
            variant="primary"
            loading={busy}
            disabled={
              dirty || !text.trim() || rubric.some((r) => !(r.id in scores))
            }
            onClick={add}
          >
            Lưu câu mẫu
          </Button>
        </Card>
      )}
    </div>
  );
}
