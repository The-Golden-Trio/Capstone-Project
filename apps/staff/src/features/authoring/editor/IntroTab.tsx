import { Card, TextArea, TextField } from '../../../components/ui';
import { guideHint } from '../../shared/Guidance';
import { produce } from '../draft';
import { FIELD_GUIDE, stakesGuide } from '../guidance';
import { InlineHints, ReviseButton, type EditorProps } from './shared';

type IntroField = 'intro' | 'situation' | 'stakes';

/** Khối B (bối cảnh): mở đầu, tình huống, điều bị đe doạ, thời lượng. */
export function IntroTab({
  content,
  onChange,
  readOnly,
  onRevise,
  levelNo,
  hints,
}: EditorProps) {
  const set = (field: IntroField, value: string) =>
    onChange(produce(content, (d) => void (d[field] = value)));
  const fields: Array<[IntroField, string, ReturnType<typeof guideHint>]> = [
    ['intro', 'Mở đầu: người chơi là ai', guideHint(FIELD_GUIDE.intro)],
    ['situation', 'Tình huống', guideHint(FIELD_GUIDE.situation)],
    ['stakes', 'Điều gì đang bị đe doạ', guideHint(stakesGuide(levelNo))],
  ];
  return (
    <Card>
      {fields.map(([field, label, hint]) => (
        <div key={field}>
          <InlineHints hints={hints} prefix={field} exact />
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
        hint="Một màn dài 10–15 phút, xoay quanh một việc chính của cấp (Seed §1)."
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
