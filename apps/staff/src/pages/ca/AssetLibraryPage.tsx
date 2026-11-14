import { useState, type FormEvent } from 'react';
import { staffApi } from '../../api/endpoints';
import type { AssetKind } from '../../api/types';
import {
  Button,
  Card,
  Checkbox,
  EmptyState,
  Loading,
  Notice,
  PageHeader,
  ProblemAlert,
  SelectField,
  Tabs,
  TextField,
} from '../../components/ui';
import { KIND_LABEL } from '../../features/gamify/AssetPicker';
import { useLoad } from '../../hooks/useLoad';

const KINDS: AssetKind[] = ['NPC', 'BACKGROUND', 'SCENE', 'ICON'];

/**
 * C07 Asset library (UC-C08, FR-36): xem và tải ảnh PNG lên. Sinh ảnh bằng AI
 * hoãn theo D-104; kiểm thiên kiến do CA tự xác nhận khi tải lên (Q9).
 */
export function AssetLibraryPage() {
  const [kind, setKind] = useState<AssetKind>('NPC');
  const assets = useLoad(() => staffApi.listAssets(kind), [kind]);
  const [uploadKind, setUploadKind] = useState<AssetKind>('NPC');
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [done, setDone] = useState(false);

  const upload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(undefined);
    setDone(false);
    try {
      await staffApi.uploadAsset({
        kind: uploadKind,
        sourceNote: note,
        biasChecked: checked,
        file,
      });
      setDone(true);
      setFile(null);
      setNote('');
      setChecked(false);
      (e.target as HTMLFormElement).reset();
      if (uploadKind === kind) await assets.reload();
      else setKind(uploadKind);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Thư viện asset"
        subtitle="Ảnh dùng cho nền, cảnh và avatar NPC khi thiết kế trình bày."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div>
          <Tabs
            label="Loại asset"
            value={kind}
            onChange={setKind}
            tabs={KINDS.map((k) => ({ id: k, label: KIND_LABEL[k] }))}
          />
          <ProblemAlert error={assets.error} />
          {assets.loading ? (
            <Loading />
          ) : (assets.data ?? []).length === 0 ? (
            <EmptyState>
              Chưa có {KIND_LABEL[kind].toLowerCase()} nào.
            </EmptyState>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {(assets.data ?? []).map((a) => (
                <li
                  key={a.id}
                  className="overflow-hidden rounded-xl border border-line-gold bg-panel"
                >
                  <img
                    src={a.url}
                    alt={a.sourceNote}
                    className="aspect-square w-full bg-inset object-cover"
                  />
                  <p
                    className="truncate px-2 py-1 text-[12px] text-muted"
                    title={a.sourceNote}
                  >
                    {a.sourceNote}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Card title="Tải ảnh lên">
          <form onSubmit={upload}>
            {done && <Notice tone="good">Đã tải lên.</Notice>}
            <ProblemAlert error={error} />
            <SelectField
              label="Loại"
              value={uploadKind}
              onChange={(e) => setUploadKind(e.target.value as AssetKind)}
              options={KINDS.map((k) => ({ value: k, label: KIND_LABEL[k] }))}
            />
            <div className="mb-3">
              <label
                htmlFor="asset-file"
                className="mb-1.5 block text-[12.5px] font-semibold tracking-[0.02em] text-ink-2"
              >
                File PNG (tối đa 5 MB)
              </label>
              <input
                id="asset-file"
                type="file"
                accept="image/png"
                required
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-[13px] text-ink-2 file:mr-3 file:cursor-pointer file:rounded-full file:border file:border-solid file:border-ink/35 file:bg-transparent file:px-3.5 file:py-1.5 file:text-[12.5px] file:font-semibold file:text-ink hover:file:border-brand hover:file:text-brand-2"
              />
            </div>
            <TextField
              label="Nguồn / giấy phép"
              hint="Ai vẽ, mua ở đâu, giấy phép gì."
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="mb-3">
              <Checkbox
                label="Tôi đã kiểm ảnh không có định kiến (giới, vùng miền, tuổi…)"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              busy={busy}
              disabled={!file || !note.trim() || !checked}
            >
              Tải lên
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
