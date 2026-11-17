import { useState } from 'react';
import { Button, Callout, Field, Select, Sheet, Textarea } from '@datn/ui';
import {
  caExtra,
  type FixRecordInput,
  type ImportRecord,
} from '../../api/ca-extra';
import { useCaMutation } from './CaWorkspace';

export function ImportRecordEditor({
  record,
  importId,
  demo,
  onClose,
  onSaved,
}: {
  record: ImportRecord;
  importId: string;
  demo: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [action, setAction] = useState<FixRecordInput['action']>('ADAPT');
  const [text, setText] = useState(JSON.stringify(record.payload, null, 2));
  const mutation = useCaMutation();
  return (
    <Sheet
      open
      onClose={onClose}
      title={`Bản ghi ${record.sourceCode}`}
      description="Sửa ánh xạ, bỏ qua hoặc điều chỉnh cho thực tiễn Việt Nam."
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void mutation.run(async () => {
            const payload: unknown =
              action === 'SKIP' ? undefined : JSON.parse(text);
            if (
              action !== 'SKIP' &&
              (!payload ||
                typeof payload !== 'object' ||
                Array.isArray(payload))
            )
              throw new Error('Nội dung phải là một object JSON');
            await caExtra.fixRecord(
              importId,
              record.recordId,
              {
                action,
                ...(action === 'SKIP'
                  ? {}
                  : { payload: payload as Record<string, unknown> }),
              },
              demo,
            );
            onSaved();
            onClose();
          });
        }}
      >
        <Field label="Cách xử lý">
          <Select
            value={action}
            onChange={(e) =>
              setAction(e.target.value as FixRecordInput['action'])
            }
          >
            <option value="FIX">Sửa bản ghi</option>
            <option value="SKIP">Bỏ qua</option>
            <option value="ADAPT">Điều chỉnh nội dung</option>
          </Select>
        </Field>
        <Field
          label="Nội dung bản ghi (JSON)"
          hint="Giữ các trường từ nguồn; không bổ sung dữ liệu chưa kiểm chứng."
        >
          <Textarea
            className="font-mono text-xs"
            rows={18}
            disabled={action === 'SKIP'}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Field>
        {mutation.error && (
          <div role="alert">
            <Callout tone="danger">{mutation.error}</Callout>
          </div>
        )}
        <Button type="submit" loading={mutation.busy}>
          Lưu xử lý
        </Button>
      </form>
    </Sheet>
  );
}
