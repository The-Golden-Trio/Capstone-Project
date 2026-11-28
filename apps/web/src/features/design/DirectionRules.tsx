/**
 * Luật dùng của design system, minh hoạ bằng component thật
 * (docs/plans/2026-11-25_nguyen-tac-giao-dien.md).
 */
import { useState, type ReactNode } from 'react';
import { ArrowRight, Info, Map as MapIcon, Play } from 'lucide-react';
import {
  NightCard,
  TOON_STATUS,
  ToonBadge,
  ToonButton,
  ToonCallout,
  ToonChip,
  ToonDisclosure,
  ToonDots,
  ToonInput,
  ToonStatus,
  ToonStatusGlyph,
  ToonSteps,
  type ToonStatusKind,
} from '@datn/ui';

export function DirectionRules() {
  return (
    <div className="space-y-6">
      <StrokeTiers />
      <ElementShapes />
      <div className="grid gap-6 lg:grid-cols-2">
        <StatusTable />
        <Sequences />
      </div>
      <ColorRoles />
    </div>
  );
}

function RuleCard({
  title,
  rule,
  children,
}: {
  title: string;
  rule: ReactNode;
  children: ReactNode;
}) {
  return (
    <NightCard className="min-w-0">
      <h3 className="font-toon text-xl font-extrabold">{title}</h3>
      <p className="mt-1 max-w-2xl text-sm text-toon-ink-soft">{rule}</p>
      <div className="mt-5">{children}</div>
    </NightCard>
  );
}

function StrokeTiers() {
  return (
    <RuleCard
      title="Ba độ dày nét, theo tầng"
      rule="Nút dày 3px và có bóng cứng: chỉ thứ bấm được mới có. Thẻ và panel không viền mực, chỉ bóng mềm. Điều khiển trong thẻ dày 2px, đường chia 1,5px."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <figure>
          <div className="toon-card grid h-28 place-items-center p-3">
            <ToonButton
              size="sm"
              style={{ backgroundColor: 'var(--color-toon-star)' }}
            >
              Nút 3px
            </ToonButton>
          </div>
          <figcaption className="mt-2 text-xs font-bold text-toon-ink-soft">
            Tầng 1 · nút có viền và bóng cứng, thẻ chỉ bóng mềm
          </figcaption>
        </figure>
        <figure>
          <div className="toon-inset grid h-28 content-center gap-2 p-3">
            <ToonInput compact placeholder="Ô nhập 2px" aria-label="Ví dụ" />
            <div className="flex gap-1.5">
              <ToonChip selected>Chip 2px</ToonChip>
              <ToonChip>Chưa chọn</ToonChip>
            </div>
          </div>
          <figcaption className="mt-2 text-xs font-bold text-toon-ink-soft">
            Tầng 2 · ô nhập, chip, tab, thanh tiến độ
          </figcaption>
        </figure>
        <figure>
          <ul className="toon-rows toon-inset h-28 overflow-hidden px-3 text-sm font-semibold">
            <li className="py-2">Hàng một</li>
            <li className="py-2">Hàng hai</li>
            <li className="py-2">Hàng ba</li>
          </ul>
          <figcaption className="mt-2 text-xs font-bold text-toon-ink-soft">
            Tầng 3 · đường chia 1,5px thay cho thẻ con
          </figcaption>
        </figure>
      </div>
    </RuleCard>
  );
}

function ElementShapes() {
  const [chip, setChip] = useState(true);
  const items: Array<{ name: string; how: string; demo: ReactNode }> = [
    {
      name: 'Nút',
      how: 'Khối bo 14px, viền 3px, bóng cứng. Nhấc lên khi rê, nhún khi bấm.',
      demo: (
        <ToonButton
          size="sm"
          style={{ backgroundColor: 'var(--color-toon-star)' }}
          rightIcon={<ArrowRight size={15} />}
        >
          Vào ca
        </ToonButton>
      ),
    },
    {
      name: 'Chip lọc',
      how: 'Viên thuốc viền 2px, không bóng. Chọn thì tô vàng.',
      demo: (
        <div className="flex gap-1.5">
          <ToonChip
            selected={chip}
            onClick={() => setChip((v) => !v)}
            icon={<MapIcon size={14} />}
          >
            Bản đồ
          </ToonChip>
          <ToonChip
            iconOnly
            label="Chỉ nghề có màn chơi"
            icon={<Play size={14} />}
          />
        </div>
      ),
    },
    {
      name: 'Nhãn',
      how: 'Phẳng, bo 7px, không viền mực, không bóng. Chỉ để đọc.',
      demo: (
        <div className="flex flex-wrap gap-1.5">
          <ToonBadge tone="sky">Ví dụ</ToonBadge>
          <ToonStatus kind="playing" label="Đang chơi · cấp 3" />
        </div>
      ),
    },
    {
      name: 'Phần gập',
      how: 'Dòng chữ có mũi tên xoay. Không đóng khung, không giống nút.',
      demo: (
        <ToonDisclosure summary="Xem thêm" meta="+3">
          <p className="text-sm text-toon-ink-soft">Nội dung phụ.</p>
        </ToonDisclosure>
      ),
    },
    {
      name: 'Ghi chú',
      how: 'Ô tô nhạt có ký hiệu, không viền mực.',
      demo: (
        <ToonCallout tone="info" icon={<Info size={16} />}>
          Thông tin kèm theo.
        </ToonCallout>
      ),
    },
  ];
  return (
    <RuleCard
      title="Mỗi loại một dáng"
      rule="Có viền mực và bóng thì bấm được; phẳng thì chỉ để đọc. Nút, chip, nhãn, phần gập và ghi chú không bao giờ mượn dáng của nhau."
    >
      <ul className="toon-rows">
        {items.map((it) => (
          <li
            key={it.name}
            className="grid items-center gap-3 py-3.5 sm:grid-cols-[7rem_minmax(0,1fr)_minmax(0,15rem)]"
          >
            <p className="font-toon text-base font-extrabold">{it.name}</p>
            <p className="text-sm text-toon-ink-soft">{it.how}</p>
            <div className="min-w-0">{it.demo}</div>
          </li>
        ))}
      </ul>
    </RuleCard>
  );
}

function StatusTable() {
  return (
    <RuleCard
      title="Ký hiệu trước chữ"
      rule="Cùng một trạng thái thì cùng ký hiệu, cùng màu ở mọi màn. Chỗ dày hàng chỉ hiện ký hiệu; chữ nằm trong tooltip và trình đọc màn hình."
    >
      <ul aria-label="Bảng ký hiệu trạng thái" className="toon-rows">
        {(Object.keys(TOON_STATUS) as ToonStatusKind[]).map((kind) => (
          <li key={kind} className="flex items-center gap-3 py-2.5">
            <ToonStatusGlyph kind={kind} size={20} />
            <span className="flex-1 text-sm font-bold">
              {TOON_STATUS[kind].label}
            </span>
            <ToonStatus kind={kind} />
          </li>
        ))}
      </ul>
    </RuleCard>
  );
}

function Sequences() {
  return (
    <RuleCard
      title="Có thứ tự thì đi theo chuỗi"
      rule="Cấp, bước, lịch sử nằm trên một đường: đoạn đã qua nét liền, đoạn chưa tới nét đứt, bước hiện tại sáng lên. Không xếp chúng thành lưới thẻ."
    >
      <ToonSteps
        label="Ví dụ lộ trình"
        steps={[
          {
            key: '1',
            title: 'Thực tập',
            meta: 'Chưa cần kinh nghiệm',
            state: 'done',
          },
          { key: '2', title: 'Mới vào nghề', meta: '0–1 năm', state: 'done' },
          {
            key: '3',
            title: 'Junior',
            meta: 'Bạn đang ở đây',
            state: 'current',
          },
          { key: '4', title: 'Middle', meta: '2–4 năm', state: 'next' },
          {
            key: '5',
            title: 'Senior',
            meta: 'Cần xong cấp 4',
            state: 'locked',
          },
        ]}
      />
      <div className="mt-5 flex items-center gap-3 border-t-[1.5px] border-toon-ink/12 pt-4 text-sm font-semibold text-toon-ink-soft">
        <ToonDots total={7} done={2} current={3} label="Cấp 3 trên 7" />
        Chuỗi ngắn trong một dòng
      </div>
    </RuleCard>
  );
}

function ColorRoles() {
  const roles = [
    {
      color: 'var(--color-toon-star)',
      name: 'Vàng sao',
      role: 'Hành động chính và "bạn". Mỗi màn một nút vàng.',
    },
    {
      color: 'var(--color-region-cong-nghe)',
      name: 'Màu vùng',
      role: 'Chỉ để chỉ vùng nghề.',
    },
    { color: 'var(--color-toon-mint)', name: 'Mint', role: 'Đã xong, đạt.' },
    {
      color: 'var(--color-toon-sky)',
      name: 'Xanh trời',
      role: 'Vào được, thông tin.',
    },
    {
      color: 'var(--color-toon-coral-light)',
      name: 'San hô',
      role: 'Mặt khó, cảnh báo.',
    },
    { color: 'var(--color-toon-shade)', name: 'Cát', role: 'Khoá, chưa có.' },
  ];
  return (
    <RuleCard
      title="Mỗi màu một vai"
      rule="Màu nói lên vai trò, không để trang trí. Nhãn và ghi chú luôn tô nhạt hơn nút."
    >
      <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => (
          <li key={r.name} className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-0.5 size-8 shrink-0 rounded-full border-2 border-toon-ink"
              style={{ backgroundColor: r.color }}
            />
            <span className="min-w-0 text-sm">
              <span className="block font-bold">{r.name}</span>
              <span className="text-toon-ink-soft">{r.role}</span>
            </span>
          </li>
        ))}
      </ul>
    </RuleCard>
  );
}
