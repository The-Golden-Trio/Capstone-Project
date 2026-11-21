import { Button } from '@datn/ui';
import { Card } from '../../../components/ui';
import { TASK_TYPE_LABEL } from '../../../lib/labels';
import { emptyActivity, nextKey, produce } from '../draft';
import { ActivityEditor } from './ActivityEditor';
import { FlowStrip } from './FlowStrip';
import { InlineHints, ReviseButton, type EditorProps } from './shared';

/** Khối D (luồng màn): 3–4 activity nối tuyến tính từ mở đầu tới kết. */
export function ActivitiesTab({
  content,
  onChange,
  readOnly,
  skills,
  onRevise,
  levelNo,
  hints,
  open,
  onOpen,
}: EditorProps & { open: number; onOpen: (i: number) => void }) {
  const keys = content.activities.map((a) => a.key);
  return (
    <div className="space-y-3">
      <FlowStrip
        activities={content.activities}
        hints={hints}
        selected={open}
        onSelect={(i) => onOpen(open === i ? -1 : i)}
      />
      <InlineHints hints={hints} prefix="activities" exact />
      {content.activities.map((a, i) => (
        <Card
          key={i}
          title={
            <button
              type="button"
              aria-expanded={open === i}
              onClick={() => onOpen(open === i ? -1 : i)}
              className="text-left"
            >
              <span className="font-mono">{a.key}</span>
              {a.isOrigin ? ' · mở đầu' : !a.forwardTo ? ' · kết' : ''} ·{' '}
              {a.inputPrompt.slice(0, 70) || 'Activity mới'}
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
              index={i}
              keys={keys}
              readOnly={readOnly}
              skills={skills}
              levelNo={levelNo}
              hints={hints}
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
            <p className="text-[13px] text-ink-faint">
              {a.allowedTypes.map((t) => TASK_TYPE_LABEL[t]).join(', ')} · tiếp
              theo: {a.forwardTo ?? 'kết thúc'} · {a.rubric.length} tiêu chí ·
              hỏi thêm tối đa {a.followupLimit ?? 0}
            </p>
          )}
        </Card>
      ))}
      {!readOnly && content.activities.length < 4 && (
        <Button
          variant="subtle"
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
