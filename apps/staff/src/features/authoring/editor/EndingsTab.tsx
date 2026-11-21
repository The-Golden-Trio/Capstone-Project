import { Button } from '@datn/ui';
import { Card, SelectField, TextArea, TextField } from '../../../components/ui';
import { ENDING_LABEL } from '../../../lib/labels';
import { guideHint } from '../../shared/Guidance';
import { produce } from '../draft';
import { FIELD_GUIDE } from '../guidance';
import { InlineHints, ReviseButton, type EditorProps } from './shared';

/** Kết cục (2–5), xét theo priority tăng dần. */
export function EndingsTab({
  content,
  onChange,
  readOnly,
  onRevise,
  hints,
}: EditorProps) {
  const update = (i: number, patch: Record<string, unknown>) =>
    onChange(
      produce(
        content,
        (d) => void (d.endings[i] = { ...d.endings[i], ...patch }),
      ),
    );
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-ink-faint">
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
          <InlineHints hints={hints} prefix={`endings[${i}]`} />
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
                hint={guideHint(FIELD_GUIDE.secretEnding)}
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
          variant="subtle"
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
