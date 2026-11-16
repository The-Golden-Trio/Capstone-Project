import { useState } from 'react';
import {
  Button,
  Callout,
  ConfirmDialog,
  Dialog,
  Field,
  Input,
  Select,
} from '@datn/ui';
import { caExtra, type Domain, type DomainInput } from '../../api/ca-extra';
import { useCaMutation } from './CaWorkspace';

export function DomainManager({
  domains,
  demo,
  onSaved,
  onClose,
}: {
  domains: Domain[];
  demo: boolean;
  onSaved: (demo: boolean) => void;
  onClose: () => void;
}) {
  const [id, setId] = useState('');
  const [input, setInput] = useState<DomainInput>({ code: '', name: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const mutation = useCaMutation();
  const selected = domains.find((d) => d.id === id);
  return (
    <Dialog
      open
      title="Quản lý nhóm nghề"
      description="AD-02b · Chỉ được xoá nhóm chưa có nghề."
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void mutation.run(async () => {
            const response = id
              ? await caExtra.updateDomain(id, input, demo)
              : await caExtra.createDomain(input, demo);
            onSaved(response.demo);
            onClose();
          });
        }}
      >
        <Field label="Nhóm cần sửa">
          <Select
            value={id}
            onChange={(e) => {
              const current = domains.find((d) => d.id === e.target.value);
              setId(e.target.value);
              setInput({
                code: current?.code ?? '',
                name: current?.name ?? '',
              });
            }}
          >
            <option value="">Tạo nhóm mới</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.occupationCount} nghề)
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Mã nhóm" required>
          <Input
            required
            value={input.code}
            onChange={(e) =>
              setInput((previous) => ({
                ...previous,
                code: e.target.value.trim(),
              }))
            }
          />
        </Field>
        <Field label="Tên nhóm" required>
          <Input
            required
            value={input.name}
            onChange={(e) =>
              setInput((previous) => ({ ...previous, name: e.target.value }))
            }
          />
        </Field>
        {mutation.error && (
          <div role="alert">
            <Callout tone="danger">{mutation.error}</Callout>
          </div>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          {selected && (
            <Button
              variant="danger"
              disabled={mutation.busy || selected.occupationCount > 0}
              onClick={() => setConfirmDelete(true)}
            >
              Xoá nhóm trống
            </Button>
          )}
          <Button type="submit" loading={mutation.busy}>
            Lưu nhóm
          </Button>
        </div>
      </form>
      <ConfirmDialog
        open={confirmDelete}
        title="Xoá nhóm nghề trống?"
        description={selected?.name}
        tone="danger"
        loading={mutation.busy}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() =>
          void mutation.run(async () => {
            const response = await caExtra.deleteDomain(id, demo);
            onSaved(response.demo);
            setConfirmDelete(false);
            onClose();
          })
        }
      >
        {mutation.error && (
          <div role="alert">
            <Callout tone="danger">{mutation.error}</Callout>
          </div>
        )}
      </ConfirmDialog>
    </Dialog>
  );
}
