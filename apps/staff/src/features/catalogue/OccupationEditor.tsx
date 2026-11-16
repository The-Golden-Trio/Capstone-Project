import { useState } from 'react';
import {
  Button,
  Callout,
  Dialog,
  Field,
  Input,
  Select,
  Sheet,
  Textarea,
} from '@datn/ui';
import {
  caExtra,
  type CatalogueOccupation,
  type Domain,
  type OccupationInput,
} from '../../api/ca-extra';
import { useCaMutation } from './CaWorkspace';

export function OccupationEditor({
  occupation,
  domains,
  demo,
  onClose,
  onSaved,
}: {
  occupation?: CatalogueOccupation;
  domains: Domain[];
  demo: boolean;
  onClose: () => void;
  onSaved: (demo: boolean) => void;
}) {
  const [input, setInput] = useState<OccupationInput>({
    code: occupation?.code ?? '',
    name: occupation?.name ?? '',
    domainId: occupation?.domainId ?? domains[0]?.id ?? '',
    summary: occupation?.summary ?? '',
    riasecCode: occupation?.riasecCode ?? '',
  });
  const mutation = useCaMutation();
  const Container = occupation ? Sheet : Dialog;
  const update = (field: keyof OccupationInput, value: string) =>
    setInput((previous) => ({ ...previous, [field]: value }));
  return (
    <Container
      open
      onClose={onClose}
      title={occupation ? 'Sửa thông tin nghề' : 'Tạo nghề mới'}
      description="Nghề mới được lưu ở trạng thái bản nháp. Nội dung chuyên môn cần được DE kiểm chứng."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            type="submit"
            form="occupation-editor-form"
            loading={mutation.busy}
          >
            Lưu nghề
          </Button>
        </>
      }
    >
      <form
        id="occupation-editor-form"
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void mutation.run(async () => {
            // Không xoá các trường mà API danh sách chưa trả về nếu CA chưa nhập.
            const body = { ...input };
            if (!body.riasecCode) delete body.riasecCode;
            if (!body.summary && occupation?.summary === undefined)
              delete body.summary;
            const response = occupation
              ? await caExtra.updateOccupation(occupation.id, body, demo)
              : await caExtra.createOccupation(body, demo);
            onSaved(response.demo);
            onClose();
          });
        }}
      >
        {mutation.error && <Callout tone="danger">{mutation.error}</Callout>}
        <Field label="Mã nghề" required>
          <Input
            required
            value={input.code}
            readOnly={!!occupation}
            onChange={(e) => update('code', e.target.value.trim())}
          />
        </Field>
        <Field label="Tên nghề" required>
          <Input
            required
            value={input.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </Field>
        <Field label="Nhóm nghề" required>
          <Select
            required
            value={input.domainId}
            onChange={(e) => update('domainId', e.target.value)}
          >
            {domains.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Tóm tắt"
          hint={
            occupation && occupation.summary === undefined
              ? 'API danh sách chưa cung cấp tóm tắt hiện tại. Để trống để giữ nguyên.'
              : undefined
          }
        >
          <Textarea
            rows={7}
            value={input.summary}
            onChange={(e) => update('summary', e.target.value)}
          />
        </Field>
        <Field
          label="Mã sở thích RIASEC"
          hint="Từ 1 đến 3 ký tự R, I, A, S, E, C."
        >
          <Input
            pattern="[RIASEC]{1,3}"
            maxLength={3}
            value={input.riasecCode}
            onChange={(e) => update('riasecCode', e.target.value.toUpperCase())}
          />
        </Field>
      </form>
    </Container>
  );
}
