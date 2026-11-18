import { Button, EmptyState } from '@datn/ui';
import { Card, TextField } from '../../../components/ui';
import { guideHint } from '../../shared/Guidance';
import { nextKey, produce } from '../draft';
import { FIELD_GUIDE } from '../guidance';
import { InlineHints, type EditorProps } from './shared';

/** Khối C (cast): seed khai vai 2–6 NPC, mỗi vai có áp lực riêng. */
export function CastTab({ content, onChange, readOnly, hints }: EditorProps) {
  const cast = content.cast ?? [];
  const update = (i: number, field: string, value: string) =>
    onChange(
      produce(content, (d) => {
        (d.cast ??= [])[i] = { ...d.cast[i], [field]: value };
      }),
    );
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-ink-faint">
        Khai 2–6 vai. Mỗi vai muốn một điều khác nhau để người chơi phải cân
        nhắc giữa họ.
      </p>
      <InlineHints hints={hints} prefix="cast" exact />
      {cast.length === 0 && <EmptyState title={<>Chưa có NPC.</>} />}
      {cast.map((m, i) => (
        <Card
          key={i}
          title={`${m.roleInScene || 'Vai mới'}${m.name ? ` · ${m.name}` : ''}`}
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
          <InlineHints hints={hints} prefix={`cast[${i}]`} />
          <TextField
            label="Vai trong tình huống"
            hint={guideHint(FIELD_GUIDE.castRole)}
            value={m.roleInScene}
            readOnly={readOnly}
            onChange={(e) => update(i, 'roleInScene', e.target.value)}
          />
          <TextField
            label="Muốn gì, áp lực gì"
            hint={guideHint(FIELD_GUIDE.castPressure)}
            value={m.pressure ?? ''}
            readOnly={readOnly}
            onChange={(e) => update(i, 'pressure', e.target.value)}
          />
          <div className="grid gap-x-3 md:grid-cols-3">
            <TextField
              label="Khoá NPC"
              value={m.npcKey}
              readOnly={readOnly}
              onChange={(e) => update(i, 'npcKey', e.target.value)}
            />
            <TextField
              label="Tên (tuỳ chọn)"
              value={m.name ?? ''}
              readOnly={readOnly}
              onChange={(e) => update(i, 'name', e.target.value)}
            />
            <TextField
              label="Giọng (tuỳ chọn)"
              value={m.voice ?? ''}
              readOnly={readOnly}
              onChange={(e) => update(i, 'voice', e.target.value)}
            />
          </div>
        </Card>
      ))}
      {!readOnly && cast.length < 6 && (
        <Button
          variant="subtle"
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
          + Thêm vai
        </Button>
      )}
    </div>
  );
}
