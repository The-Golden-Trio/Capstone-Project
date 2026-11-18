import { Button, EmptyState } from '@datn/ui';
import { Card, SelectField, TextArea, TextField } from '../../../components/ui';
import { guideHint } from '../../shared/Guidance';
import { produce } from '../draft';
import { FIELD_GUIDE } from '../guidance';
import { InlineHints, type EditorProps } from './shared';

/** Sự kiện ngẫu nhiên (tối đa 2): đổi đường đi, không đổi đề bài. */
export function EventsTab({
  content,
  onChange,
  readOnly,
  skills,
  hints,
}: EditorProps) {
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
      <p className="text-[13px] text-ink-faint">
        {guideHint(FIELD_GUIDE.randomEvent)}
      </p>
      {events.length === 0 && (
        <EmptyState title={<>Không có sự kiện ngẫu nhiên (tối đa 2).</>} />
      )}
      {events.map((ev, i) => (
        <Card
          key={i}
          title={`Sự kiện ${i + 1} · sau ${ev.activityKey}`}
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
          <InlineHints hints={hints} prefix={`randomEvents[${i}]`} />
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
            hint={guideHint(FIELD_GUIDE.inputPrompt)}
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
          <TextArea
            rows={2}
            label="Dấu hiệu phản tác dụng"
            hint={guideHint(FIELD_GUIDE.counterproductive)}
            value={ev.counterproductiveSigns ?? ''}
            readOnly={readOnly}
            onChange={(e) =>
              update(i, { counterproductiveSigns: e.target.value })
            }
          />
        </Card>
      ))}
      {!readOnly && events.length < 2 && (
        <Button
          variant="subtle"
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
