import { useState } from 'react';
import { staffApi } from '../../api/endpoints';
import type { ReferenceAnswer, ScenarioContent } from '../../api/types';
import {
  Button,
  Card,
  EmptyState,
  ProblemAlert,
  SelectField,
  TextArea,
} from '../../components/ui';
import { useLoad } from '../../hooks/useLoad';
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const activity = content.activities.find((a) => a.key === activityKey);
  const rubric = (activity?.rubric ?? []).filter((r) => r.id);
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
        })),
      });
      setText('');
      setScores({});
      await list.reload();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Câu mẫu đã lưu">
        {(list.data ?? []).length === 0 ? (
          <EmptyState>Chưa có câu mẫu.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {(list.data ?? []).map((r) => (
              <li key={r.id} className="rounded-md border border-line-2 p-2">
                <p className="text-[12px] text-muted">
                  {r.activityKey} ·{' '}
                  {r.stratum === 'EASY'
                    ? 'dễ'
                    : r.stratum === 'HARD'
                      ? 'khó'
                      : 'vừa'}
                </p>
                <p>{r.answerText}</p>
                <p className="mt-1 text-[12px] text-ink-2">
                  {r.scores
                    .map((s) => (s.score === null ? 'không xét' : s.score))
                    .join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {!readOnly && (
        <Card title="Thêm câu mẫu">
          {dirty && (
            <p className="mb-2 text-[13px] text-warn">
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
          {rubric.map((r) => (
            <SelectField
              key={r.id}
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
          ))}
          <Button
            variant="primary"
            busy={busy}
            disabled={
              dirty ||
              !text.trim() ||
              rubric.some((r) => !((r.id as string) in scores))
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
