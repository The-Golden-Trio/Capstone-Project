import { profile } from '@datn/game-core';
import { DualBars, Panel, PanelHeader, cn } from '@datn/ui';
import type { PlayerRecord } from '../../api/types';

export function RiasecCard({ riasec }: { riasec: PlayerRecord['riasec'] }) {
  const hasAfter = profile.RIASEC_AXES.some(
    (axis) =>
      riasec.afterTrying[axis].count > 0 &&
      riasec.afterTrying[axis].mean !== null,
  );
  const hasData = riasec.self !== null || hasAfter;
  const items = profile.RIASEC_AXES.map((axis) => ({
    key: axis,
    label: profile.RIASEC_INFO[axis].name,
    self: riasec.self?.[axis] ?? null,
    after:
      riasec.afterTrying[axis].count > 0 ? riasec.afterTrying[axis].mean : null,
    count: riasec.afterTrying[axis].count,
  }));

  return (
    <Panel padding="lg">
      <PanelHeader
        title="Bạn thích kiểu việc nào?"
        description="Hai góc nhìn: điều tự kể và cảm nhận sau những việc đã thử. Đây là bản nháp để bạn tự xem lại."
      />
      <div className={cn(!hasData && 'grayscale opacity-50')}>
        <DualBars items={items} />
      </div>
      {!hasData && (
        <p className="mt-3 text-center text-sm text-ink-faint">
          chơi thêm để mở
        </p>
      )}
      <ul className="mt-4 grid gap-2 text-xs text-ink-faint sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.key}>
            {item.label} ·{' '}
            {item.after !== null
              ? `dựa trên ${item.count} việc`
              : 'chơi thêm để mở'}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-ink-faint">
        Sau mỗi ca, bạn kể việc nào mình thích. Điểm chấm ca không quyết định
        các thanh này.
      </p>
    </Panel>
  );
}
