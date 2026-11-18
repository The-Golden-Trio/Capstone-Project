import { Badge, Button, Dialog, EmptyState } from '@datn/ui';
import { useState } from 'react';
import type { Asset, AssetKind } from '../../api/types';
import { cx } from '../../lib/cx';

const KIND_LABEL: Record<AssetKind, string> = {
  NPC: 'Avatar NPC',
  BACKGROUND: 'Nền',
  SCENE: 'Cảnh',
  ICON: 'Biểu tượng',
};

const BIAS: Record<
  Asset['biasCheck'],
  { label: string; tone: 'success' | 'warning' | 'danger' }
> = {
  PASSED: { label: 'Đã kiểm thiên kiến', tone: 'success' },
  PENDING: { label: 'Chưa kiểm thiên kiến', tone: 'warning' },
  FAILED: { label: 'Không đạt kiểm thiên kiến', tone: 'danger' },
};

/**
 * Chọn một asset của đúng loại (FR-36). Asset không đạt kiểm thiên kiến bị
 * khoá; asset chưa kiểm vẫn chọn được nhưng có nhãn cảnh báo.
 */
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
      <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-sunken">
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
        {current && current.biasCheck !== 'PASSED' && (
          <p className="mb-1">
            <Badge tone={BIAS[current.biasCheck].tone}>
              {BIAS[current.biasCheck].label}
            </Badge>
          </p>
        )}
        <Button
          variant="subtle"
          size="sm"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
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
                variant="subtle"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                Không dùng
              </Button>
            )}
            <Button variant="subtle" onClick={() => setOpen(false)}>
              Đóng
            </Button>
          </>
        }
      >
        {pool.length === 0 ? (
          <EmptyState
            title={
              <>
                Thư viện chưa có {KIND_LABEL[kind].toLowerCase()} nào. Tải lên ở
                mục Thư viện asset.
              </>
            }
          />
        ) : (
          <ul className="grid grid-cols-3 gap-3">
            {pool.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  aria-pressed={a.id === value}
                  disabled={a.biasCheck === 'FAILED'}
                  title={BIAS[a.biasCheck].label}
                  onClick={() => {
                    onChange(a.id);
                    setOpen(false);
                  }}
                  className={cx(
                    'block w-full overflow-hidden rounded-lg border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                    a.id === value
                      ? 'border-info'
                      : 'border-transparent hover:border-night-400',
                  )}
                >
                  <img
                    src={a.url}
                    alt={a.sourceNote}
                    className="aspect-square w-full bg-surface-sunken object-cover"
                  />
                  <span className="block truncate px-1 py-0.5 text-left text-[12px] text-ink-faint">
                    {a.sourceNote}
                  </span>
                  {a.biasCheck !== 'PASSED' && (
                    <span className="block px-1 pb-1 text-left">
                      <Badge tone={BIAS[a.biasCheck].tone}>
                        {BIAS[a.biasCheck].label}
                      </Badge>
                    </span>
                  )}
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
