import { Button, EmptyState } from '@datn/ui';
import type { TaskType } from '../../../api/types';
import { Card, SelectField, TextArea, TextField } from '../../../components/ui';
import { TASK_TYPE_LABEL } from '../../../lib/labels';
import { guideHint } from '../../shared/Guidance';
import { produce } from '../draft';
import { FIELD_GUIDE } from '../guidance';
import type { EditorProps } from './shared';

/**
 * Nhiệm vụ phụ (`sideQuests`, plan P2). `answerKey` có kiểu tuỳ dạng task nên
 * không sửa ở đây; giữ nguyên giá trị đang có khi lưu.
 */
export function SideQuestsTab({ content, onChange, readOnly }: EditorProps) {
  const quests = content.sideQuests ?? [];
  const update = (i: number, patch: Record<string, unknown>) =>
    onChange(
      produce(
        content,
        (d) =>
          void ((d.sideQuests ??= [])[i] = { ...d.sideQuests[i], ...patch }),
      ),
    );
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-ink-faint">
        {guideHint(FIELD_GUIDE.sideQuest)}
      </p>
      {quests.length === 0 && <EmptyState title={<>Chưa có nhiệm vụ phụ.</>} />}
      {quests.map((q, i) => (
        <Card
          key={i}
          title={`Nhiệm vụ phụ ${i + 1}`}
          actions={
            !readOnly && (
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  onChange(
                    produce(content, (d) => void d.sideQuests?.splice(i, 1)),
                  )
                }
              >
                Xoá
              </Button>
            )
          }
        >
          <TextArea
            label="Đề bài"
            value={q.prompt}
            readOnly={readOnly}
            onChange={(e) => update(i, { prompt: e.target.value })}
          />
          <div className="grid gap-x-3 md:grid-cols-2">
            <SelectField
              label="Dạng task"
              value={q.taskType}
              disabled={readOnly}
              options={(Object.keys(TASK_TYPE_LABEL) as TaskType[]).map(
                (t) => ({ value: t, label: TASK_TYPE_LABEL[t] }),
              )}
              onChange={(e) => update(i, { taskType: e.target.value })}
            />
            <TextField
              label="Điểm thưởng"
              type="number"
              min={1}
              step={1}
              value={q.points}
              readOnly={readOnly}
              onChange={(e) =>
                update(i, { points: Math.max(1, Number(e.target.value) || 1) })
              }
            />
          </div>
          {q.answerKey !== undefined && (
            <p className="text-[12px] text-ink-faint">
              Đã có đáp án; giữ nguyên khi lưu.
            </p>
          )}
        </Card>
      ))}
      {!readOnly && (
        <Button
          variant="subtle"
          onClick={() =>
            onChange(
              produce(content, (d) => {
                (d.sideQuests ??= []).push({
                  prompt: '',
                  taskType: 'FREE_TEXT',
                  points: 1,
                });
              }),
            )
          }
        >
          + Thêm nhiệm vụ phụ
        </Button>
      )}
    </div>
  );
}
