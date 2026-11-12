import { useState } from 'react';
import type { Asset, AssetKind } from '../../api/types';
import { Button, Dialog, EmptyState } from '../../components/ui';
import { cx } from '../../lib/cx';

const KIND_LABEL: Record<AssetKind, string> = {
  NPC: 'Avatar NPC',
  BACKGROUND: 'Nền',
  SCENE: 'Cảnh',
  ICON: 'Biểu tượng',
};

/** Chọn một asset đã qua kiểm thiên kiến của đúng loại (FR-36). */
export function AssetPicker({
  kind,
  assets,
  value,
  onChange,
  disabled,
  allowNone = true,
  label,
}: {
  kind: AssetKind;
  assets: Asset[];
  value: string | null;
  onChange: (id: string | null) => void;
  disabled?: boolean;
  allowNone?: boolean;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const pool = assets.filter((a) => a.kind === kind);
  const current = pool.find((a) => a.id === value);
  return (
    <div className="flex items-center gap-3">
      <div className="size-14 shrink-0 overflow-hidden rounded-md border border-line bg-inset">
        {current && (
          <img
            src={current.url}
            alt={current.sourceNote}
            className="size-full object-cover"
          />
        )}
      </div>
      <div>
        <p className="text-[13px] font-medium">{label}</p>
        <Button size="sm" disabled={disabled} onClick={() => setOpen(true)}>
          {current ? 'Đổi' : 'Chọn'} {KIND_LABEL[kind].toLowerCase()}
        </Button>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Chọn ${KIND_LABEL[kind].toLowerCase()}`}
        footer={
          <>
            {allowNone && (
              <Button
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                Không dùng
              </Button>
            )}
            <Button onClick={() => setOpen(false)}>Đóng</Button>
          </>
        }
      >
        {pool.length === 0 ? (
          <EmptyState>
            Thư viện chưa có {KIND_LABEL[kind].toLowerCase()} nào. Tải lên ở mục
            Thư viện asset.
          </EmptyState>
        ) : (
          <ul className="grid grid-cols-3 gap-3">
            {pool.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  aria-pressed={a.id === value}
                  onClick={() => {
                    onChange(a.id);
                    setOpen(false);
                  }}
                  className={cx(
                    'block w-full overflow-hidden rounded-md border-2',
                    a.id === value
                      ? 'border-brand'
                      : 'border-transparent hover:border-line',
                  )}
                >
                  <img
                    src={a.url}
                    alt={a.sourceNote}
                    className="aspect-square w-full bg-inset object-cover"
                  />
                  <span className="block truncate px-1 py-0.5 text-left text-[12px] text-muted">
                    {a.sourceNote}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Dialog>
    </div>
  );
}

export { KIND_LABEL };
