import { useId, useState } from 'react';
import {
  Backpack,
  Check,
  Compass,
  Map,
  Settings,
  Star,
  UserRound,
} from 'lucide-react';
import {
  BottomNav,
  CartoonPlanet,
  Dialog,
  EmptyHint,
  Logo,
  NightCard,
  PillTabs,
  Sheet,
  StatTile,
  ToonButton,
  ToonTabPanel,
  ToonTabs,
  TopNav,
} from '@datn/ui';
import { GameComponentExamples } from './GameKit';

/** Toàn bộ tương tác chỉ thay trạng thái bản mẫu tại trang, không gọi API. */
export function DirectionComponents() {
  const id = useId();
  const [tab, setTab] = useState('mission');
  const [navigation, setNavigation] = useState('map');
  const [overlay, setOverlay] = useState<'dialog' | 'sheet' | null>(null);
  const [message, setMessage] = useState(false);
  const items = [
    { key: 'map', label: 'Bản đồ', icon: <Map size={20} />, href: '#mau-man' },
    {
      key: 'bag',
      label: 'Hành trang',
      icon: <Backpack size={20} />,
      href: '#mau-man',
    },
    {
      key: 'portrait',
      label: 'Chân dung',
      icon: <UserRound size={20} />,
      href: '#mau-man',
    },
    {
      key: 'settings',
      label: 'Tài khoản',
      icon: <Settings size={20} />,
      href: '#mau-man',
    },
  ].map((item) => ({ ...item, active: item.key === navigation }));
  return (
    <div className="space-y-6">
      <NightCard ribbon={<h3>Thẻ giấy và các khoảng nghỉ</h3>} stars tape>
        <p className="max-w-lg text-sm text-toon-ink-soft">
          Viền 3px, góc tròn, bóng cứng lệch phải dưới. Băng keo và sao nằm
          ngoài vùng đọc, không che tiêu đề hay nút.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <StatTile
            value={3}
            label="Ca mẫu hoàn tất"
            icon={<Check size={22} />}
            tone="mint"
          />
          <StatTile
            value={5}
            label="Nghề mẫu đã ghé"
            icon={<Compass size={22} />}
            tone="star"
          />
        </div>
        <div className="mt-6">
          <EmptyHint
            illustration={<CartoonPlanet size={60} seed="empty" />}
            message="Ghim một nghề để xem lại sau."
            action={
              <ToonButton variant="secondary" onClick={() => setMessage(true)}>
                Thử thao tác mẫu
              </ToonButton>
            }
          />
        </div>
      </NightCard>
      <NightCard>
        <h3 className="font-toon text-2xl font-bold">Tab pill và quiet</h3>
        <p className="mt-2 text-sm text-toon-ink-soft">
          Pill cho vùng đêm. Quiet giảm nét trong thẻ giấy. Cả hai giữ mũi tên,
          Home/End và focus rõ.
        </p>
        <div className="mt-5 rounded-2xl border-[3px] border-toon-night-deep bg-toon-night p-4">
          <PillTabs
            idBase={`${id}-pill`}
            label="Tab pill mẫu"
            value={tab}
            onChange={setTab}
            items={[
              { key: 'mission', label: 'Nhiệm vụ' },
              { key: 'notes', label: 'Ghi chú' },
            ]}
          />
        </div>
        <div className="mt-5">
          <ToonTabs
            idBase={`${id}-quiet`}
            variant="underline"
            label="Tab quiet mẫu"
            value={tab}
            onChange={setTab}
            items={[
              { key: 'mission', label: 'Nhiệm vụ' },
              { key: 'notes', label: 'Ghi chú' },
            ]}
            className="[&_[role=tab]]:rounded-lg [&_[role=tab]]:border-0 [&_[role=tab]]:shadow-none [&_[aria-selected=true]]:bg-toon-cream [&_[aria-selected=true]]:underline [&_[aria-selected=true]]:decoration-2"
          />
        </div>
        <div className="mt-5 rounded-xl border-2 border-toon-ink bg-toon-cream p-4">
          <ToonTabPanel idBase={`${id}-pill`} tabKey={tab} active>
            {tab === 'mission'
              ? 'Đọc dữ kiện trước khi chọn bước tiếp theo.'
              : 'Ghi lại thời điểm và điều bạn muốn hỏi.'}
          </ToonTabPanel>
          <ToonTabPanel idBase={`${id}-quiet`} tabKey={tab} active>
            <span className="sr-only">
              {tab === 'mission'
                ? 'Nội dung nhiệm vụ mẫu'
                : 'Nội dung ghi chú mẫu'}
            </span>
          </ToonTabPanel>
        </div>
      </NightCard>
      <div className="overflow-hidden rounded-2xl border-[3px] border-toon-ink">
        <TopNav
          label="Thanh điều hướng mẫu"
          logo={<Logo size="sm" />}
          items={items}
          right={
            <span className="text-xs text-toon-star-soft">Mẫu giao diện</span>
          }
          renderLink={(props, item) => (
            <a
              {...props}
              onClick={(event) => {
                event.preventDefault();
                setNavigation(item.key);
              }}
            />
          )}
        />
        <div className="bg-toon-night p-5">
          <p className="mb-6 text-sm text-toon-paper">
            BottomNav · bốn mục ngắn, trạng thái chọn nổi lên.
          </p>
          <BottomNav
            label="Thanh điện thoại mẫu"
            items={items}
            renderLink={(props, item) => (
              <a
                {...props}
                onClick={(event) => {
                  event.preventDefault();
                  setNavigation(item.key);
                }}
              />
            )}
          />
        </div>
      </div>
      <div className="theme-toon toon-dots space-y-6 rounded-2xl border-[3px] border-toon-ink p-4 sm:p-6">
        <GameComponentExamples />
      </div>
      <NightCard>
        <h3 className="font-toon text-2xl font-bold">
          Dialog và Sheet · theme toon
        </h3>
        <p className="mt-2 text-sm text-toon-ink-soft">
          Dialog dừng để xác nhận. Sheet mở chi tiết bên cạnh. Escape đóng và
          trả focus về nút vừa bấm.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ToonButton onClick={() => setOverlay('dialog')}>
            Mở Dialog
          </ToonButton>
          <ToonButton variant="secondary" onClick={() => setOverlay('sheet')}>
            Mở Sheet
          </ToonButton>
        </div>
      </NightCard>
      <Dialog
        theme="toon"
        open={overlay === 'dialog'}
        onClose={() => setOverlay(null)}
        title="Một khoảng dừng"
        description="Đây là hộp thoại minh hoạ, không thay đổi dữ liệu của bạn."
        footer={
          <ToonButton
            onClick={() => {
              setOverlay(null);
              setMessage(true);
            }}
          >
            Đã hiểu
          </ToonButton>
        }
      >
        <p className="text-sm">
          Một quyết định, một nút chính. Kiểm lại thông tin trước khi tiếp tục.
        </p>
      </Dialog>
      <Sheet
        theme="toon"
        open={overlay === 'sheet'}
        onClose={() => setOverlay(null)}
        title="Chi tiết bản mẫu"
        description="Mẫu Sheet trên nền giấy, không gọi API."
        footer={
          <ToonButton variant="secondary" onClick={() => setOverlay(null)}>
            Đóng chi tiết
          </ToonButton>
        }
      >
        <p className="text-sm">
          Nội dung dài nằm trong vùng cuộn. Nút đóng luôn ở góc phải trên.
        </p>
      </Sheet>
      {message && (
        <div
          role="status"
          aria-label="Phản hồi thao tác mẫu"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-start gap-3 rounded-2xl border-[3px] border-toon-ink bg-toon-mint p-4 font-toon-body text-sm text-toon-ink shadow-toon-lg"
        >
          <Star size={20} className="shrink-0" aria-hidden />
          <p>Đã xác nhận thao tác mẫu</p>
          <button
            type="button"
            aria-label="Đóng thông báo mẫu"
            onClick={() => setMessage(false)}
            className="ml-auto rounded-lg px-2 font-bold focus-visible:shadow-toon-focus"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
