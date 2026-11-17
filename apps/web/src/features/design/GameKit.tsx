import { useId, useState, type ReactNode } from 'react';
import { BookOpen, Check, Plus } from 'lucide-react';
import {
  CaptionStrip,
  Character,
  Dialog,
  DialogueBox,
  Emote,
  EXPRESSIONS,
  EXPRESSION_LABELS,
  EXPRESSION_MOTION,
  NameTag,
  SceneBackdrop,
  SpeechBubble,
  ToonBadge,
  ToonButton,
  ToonCheckbox,
  ToonClock,
  ToonField,
  ToonIconButton,
  ToonInput,
  ToonLikeScale,
  ToonProgress,
  ToonTabPanel,
  ToonTabs,
  ToonTextarea,
  type Expression,
  type LikeValue,
  type ToonButtonVariant,
  type ToonTone,
} from '@datn/ui';
import {
  TOON_BACKDROPS,
  TOON_CHARACTERS,
  type ToonCharacterId,
} from '../../lib/toon';

const colors = [
  ['ink', '#1e1b18'],
  ['ink-soft', '#4a433c'],
  ['ink-faint', '#665c52'],
  ['paper', '#fffaf0'],
  ['cream', '#f7ecd6'],
  ['sand', '#ead8b8'],
  ['shade', '#dcc6a0'],
  ['olive', '#6b7a4b'],
  ['olive-light', '#b9c58f'],
  ['maroon', '#7a2c45'],
  ['rose', '#eea7b4'],
  ['coral', '#e2703f'],
  ['coral-light', '#f6b496'],
  ['mustard', '#f0b63c'],
  ['mustard-deep', '#c98d17'],
  ['sky', '#a6d2ea'],
  ['sky-deep', '#4f8db3'],
  ['lilac', '#b3acdf'],
  ['mint', '#a8dbb9'],
  ['mint-deep', '#3f8a5c'],
  ['wood', '#c98b4e'],
] as const;

const people: Record<ToonCharacterId, { name: string; role: string }> = {
  lead: { name: 'Anh Hải', role: 'Trưởng nhóm' },
  designer: { name: 'Chị Vy', role: 'Thiết kế' },
  engineer: { name: 'Anh Khôi', role: 'Kỹ sư hệ thống' },
  relations: { name: 'Chị Thảo', role: 'Quan hệ khách hàng' },
  architect: { name: 'Bác Nam', role: 'Kiến trúc sư' },
  analyst: { name: 'Chị Chi', role: 'Phân tích dữ liệu' },
};
const backdrops = {
  office: 'Văn phòng',
  meeting: 'Phòng họp',
  home: 'Làm việc tại nhà',
  cafe: 'Quán cà phê',
  street: 'Đường phố',
} as const;
const variants: ToonButtonVariant[] = [
  'primary',
  'secondary',
  'mint',
  'danger',
  'ghost',
];
const tones: ToonTone[] = [
  'paper',
  'mustard',
  'mint',
  'coral',
  'sky',
  'maroon',
  'olive',
];

/** Các mẫu chỉ đổi trạng thái tại trang xem thử, không gọi API hoặc sửa tiến độ. */
export function GameKit() {
  return (
    <div className="theme-toon toon-dots min-w-0 space-y-6 rounded-[22px] border-[3px] border-toon-ink p-4 shadow-toon-lg sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <ToonBadge tone="mustard">Game kit · Mẫu tương tác</ToonBadge>
        <p className="min-w-0 font-toon-body text-sm font-semibold text-toon-ink-soft">
          Bước vào ca làm: giấy kem, màu phẳng, nét đen và một chút tinh nghịch.
        </p>
      </div>
      <Foundations />
      <Group
        title="Đồng nghiệp trong ca"
        description="Mỗi vai có một tranh và bảng tên riêng. Sáu nhân vật dưới đây là dàn mẫu để chọn khi soạn ca."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Object.values(TOON_CHARACTERS).map((character) => (
            <figure
              key={character.id}
              className="flex min-w-0 flex-col items-center gap-4 rounded-2xl border-2 border-toon-ink bg-toon-cream p-4"
            >
              <span
                role="img"
                aria-label={`Chân dung ${people[character.id].name}`}
                className="block size-24 overflow-hidden rounded-full border-[3px] border-toon-ink bg-toon-sand shadow-toon-sm"
              >
                <img
                  src={character.src}
                  alt=""
                  width={96}
                  height={96}
                  className="size-full object-cover object-top"
                />
              </span>
              <figcaption className="flex max-w-full flex-col items-center gap-2 text-center">
                <NameTag
                  name={people[character.id].name}
                  color={character.color}
                />
                <span className="font-toon-body text-sm font-semibold text-toon-ink-soft">
                  {people[character.id].role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Group>
      <Group
        title="Nơi làm việc"
        description="Năm bối cảnh dùng chung nét vẽ. Tranh ở nền, thông tin công việc nằm trong những tấm giấy dễ đọc."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(TOON_BACKDROPS).map(([id, src]) => (
            <figure
              key={id}
              className="min-w-0 overflow-hidden rounded-2xl border-[3px] border-toon-ink bg-toon-cream shadow-toon-sm"
            >
              <img
                src={src}
                alt={`Bối cảnh ${backdrops[id as keyof typeof backdrops]}`}
                width={900}
                height={506}
                className="aspect-video w-full object-cover"
              />
              <figcaption className="px-3 py-2 font-toon text-base font-bold">
                {backdrops[id as keyof typeof backdrops]}
              </figcaption>
            </figure>
          ))}
        </div>
      </Group>
      <ExpressionExamples />
      <Group
        title="Đồng hồ ca làm"
        description="Giờ trong truyện đi cùng số điểm còn lại. Màu cam và con số cùng báo rằng ca sắp hết giờ."
      >
        <div className="grid gap-5 xl:grid-cols-3">
          {(
            [
              {
                name: 'Còn nhiều thời gian',
                time: '10:00',
                remaining: 24,
                compact: false,
              },
              {
                name: 'Còn 20% thời gian',
                time: '11:30',
                remaining: 6,
                compact: false,
              },
              { name: 'Thu gọn', time: '10:45', remaining: 15, compact: true },
            ] as const
          ).map((clock) => (
            <div
              key={clock.name}
              className="min-w-0 rounded-2xl border-2 border-toon-ink bg-toon-cream p-4"
            >
              <h4 className="mb-4 font-toon text-base font-bold">
                {clock.name}
              </h4>
              <ToonClock
                time={clock.time}
                deadline="12:00"
                remaining={clock.remaining}
                budget={30}
                minutesPerPoint={5}
                compact={clock.compact}
              />
            </div>
          ))}
        </div>
      </Group>
      <Group
        title="Một đoạn hội thoại"
        description="Bảng tên nhận diện người nói, bong bóng giữ lịch sử, băng giấy dành cho lời dẫn cảnh."
      >
        <SceneBackdrop
          src={TOON_BACKDROPS.office}
          className="rounded-2xl border-[3px] border-toon-ink p-3 sm:p-5"
        >
          <div className="space-y-6">
            <CaptionStrip>
              Buổi sáng, cả nhóm vừa mở bảng theo dõi sự cố.
            </CaptionStrip>
            <div className="mr-5 max-w-lg">
              <SpeechBubble tone="sky">
                Anh vừa thấy thời gian trả lời tăng. Em xem log rồi báo lại nhé.
              </SpeechBubble>
            </div>
            <div className="ml-5 max-w-lg">
              <SpeechBubble side="right" tone="mustard">
                Dạ, em đối chiếu số liệu trước khi chốt nguyên nhân.
              </SpeechBubble>
            </div>
            <div className="pt-5">
              <DialogueBox
                more
                tag={
                  <NameTag
                    name="Anh Hải"
                    role="Trưởng nhóm"
                    color={TOON_CHARACTERS.lead.color}
                  />
                }
              >
                Mình kiểm trên môi trường thử trước. Có kết quả rồi hãy cùng bàn
                bước tiếp theo.
              </DialogueBox>
            </div>
          </div>
        </SceneBackdrop>
      </Group>
      <ControlExamples />
      <WorkflowExamples />
    </div>
  );
}

function Group({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="toon-card min-w-0 p-4 sm:p-5">
      <h3
        id={id}
        className="font-toon text-2xl font-extrabold leading-tight text-toon-ink"
      >
        {title}
      </h3>
      {description && (
        <p className="mt-2 font-toon-body text-sm leading-relaxed text-toon-ink-soft">
          {description}
        </p>
      )}
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  );
}

function Foundations() {
  return (
    <>
      <Group
        title="Màu tô và nét viền"
        description="Mỗi ô ghi tên token và mã màu. Nét mực, giấy kem và màu trang phục tạo nên cùng một nơi làm việc."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {colors.map(([name, hex]) => (
            <figure
              key={name}
              className="min-w-0 overflow-hidden rounded-xl border-2 border-toon-ink bg-toon-paper"
            >
              <div
                aria-hidden
                className="h-14 border-b-2 border-toon-ink"
                style={{ backgroundColor: `var(--color-toon-${name})` }}
              />
              <figcaption className="space-y-1 p-2 font-mono text-[11px] text-toon-ink">
                <span className="block break-all">toon-{name}</span>
                <span className="block uppercase">{hex}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Group>
      <Group title="Chữ tròn, tiếng Việt rõ dấu">
        <div className="space-y-5">
          <div>
            <p className="mb-2 font-toon-body text-xs font-bold text-toon-ink-soft">
              Baloo 2 · tiêu đề và nút
            </p>
            <p className="font-toon text-3xl font-extrabold leading-tight">
              Chào buổi sáng, mình bắt đầu ca nhé!
            </p>
          </div>
          <div>
            <p className="mb-2 font-toon-body text-xs font-bold text-toon-ink-soft">
              Nunito · nội dung
            </p>
            <p className="font-toon-body text-base leading-relaxed">
              Hà đã gửi ghi chú cuộc họp. Mình kiểm tra từng con số, hỏi lại chỗ
              chưa rõ rồi cùng thống nhất cách xử lý.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {(
            [
              ['sm', 'shadow-toon-sm', '2px · thẻ nhỏ'],
              ['md', 'shadow-toon', '4px · thẻ và nút'],
              ['lg', 'shadow-toon-lg', '6px · hộp thoại'],
            ] as const
          ).map(([name, shadow, text]) => (
            <div
              key={name}
              className={`rounded-xl border-[3px] border-toon-ink bg-toon-sky p-4 ${shadow}`}
            >
              <p className="font-toon text-xl font-extrabold">Bóng {name}</p>
              <p className="mt-1 font-toon-body text-xs font-bold">{text}</p>
            </div>
          ))}
        </div>
      </Group>
    </>
  );
}

function ExpressionExamples() {
  const [expression, setExpression] = useState<Expression>('vui');
  const [beat, setBeat] = useState(0);
  return (
    <Group
      title="Biểu cảm bật cạnh đầu"
      description="Một tranh cho mỗi nhân vật; bong bóng và chuyển động giúp kể cảm xúc của từng nhịp thoại. Bấm một biểu cảm để xem, bấm lại để phát lại."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {EXPRESSIONS.map((value) => (
          <figure
            key={value}
            className="flex min-w-0 flex-col items-center gap-2 rounded-xl border-2 border-toon-ink bg-toon-cream p-3"
          >
            <div className="flex size-16 items-center justify-center">
              {value === 'binh_thuong' ? (
                <span
                  aria-label="Không hiện emote"
                  className="text-2xl text-toon-ink-faint"
                >
                  —
                </span>
              ) : (
                <Emote expression={value} />
              )}
            </div>
            <figcaption className="text-center font-toon-body text-sm font-bold">
              {EXPRESSION_LABELS[value]}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border-[3px] border-toon-ink bg-toon-sand px-5 pt-8">
          <Character
            src={TOON_CHARACTERS.lead.src}
            name="Nhân vật mẫu · Anh Hải"
            height={260}
            motion={EXPRESSION_MOTION[expression]}
            beat={beat}
            className="mx-auto w-48"
            emote={<Emote key={beat} expression={expression} />}
          />
        </div>
        <div className="min-w-0 self-center">
          <p
            className="mb-4 font-toon text-xl font-extrabold"
            aria-live="polite"
          >
            Anh Hải · {EXPRESSION_LABELS[expression]}
          </p>
          <div
            role="group"
            aria-label="Đổi biểu cảm nhân vật"
            className="flex flex-wrap gap-3"
          >
            {EXPRESSIONS.map((value) => (
              <ToonButton
                key={value}
                size="sm"
                variant={value === expression ? 'primary' : 'secondary'}
                aria-pressed={value === expression}
                onClick={() => {
                  setExpression(value);
                  setBeat((n) => n + 1);
                }}
              >
                {EXPRESSION_LABELS[value]}
              </ToonButton>
            ))}
          </div>
          <p className="mt-4 font-toon-body text-xs text-toon-ink-soft">
            Thiết bị bật giảm chuyển động sẽ giữ nhân vật và emote đứng yên.
          </p>
        </div>
      </div>
    </Group>
  );
}

function ControlExamples() {
  const [notice, setNotice] = useState(
    'Các nút dưới đây chỉ thao tác với bản mẫu.',
  );
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState(
    'API chậm từ 8 giờ. Đối chiếu log với số đơn trước khi gửi báo cáo.',
  );
  const [checked, setChecked] = useState(false);
  const [saved, setSaved] = useState('');
  return (
    <>
      <Group
        title="Nút bấm và trạng thái"
        description="Các kiểu nút dùng chung nét viền và bóng cứng. Nút đang gửi hoặc tạm khóa không nhận thao tác."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {variants.map((variant) => (
            <div
              key={variant}
              className="min-w-0 rounded-2xl border-2 border-toon-ink bg-toon-cream p-3"
            >
              <h4 className="mb-3 font-mono text-xs text-toon-ink-soft">
                {variant}
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <ToonButton
                    key={size}
                    variant={variant}
                    size={size}
                    onClick={() =>
                      setNotice(`Đã mở sổ tay mẫu · ${variant} / ${size}.`)
                    }
                  >
                    Mở sổ tay
                  </ToonButton>
                ))}
                <ToonButton variant={variant} disabled>
                  Đang khóa
                </ToonButton>
                <ToonButton variant={variant} loading loadingText="Đang gửi…">
                  Gửi ghi chú
                </ToonButton>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <ToonIconButton
            label="Thêm ghi chú mẫu"
            icon={<Plus size={20} />}
            onClick={() => setNotice('Đã thêm một ghi chú mẫu.')}
          />
          <ToonIconButton
            label="Mở sổ tay mẫu"
            icon={<BookOpen size={20} />}
            variant="mint"
            onClick={() => setNotice('Sổ tay mẫu đã mở.')}
          />
          <p
            role="status"
            aria-label="Phản hồi nút mẫu"
            className="min-w-0 flex-1 basis-48 font-toon-body text-sm font-bold"
          >
            {notice}
          </p>
        </div>
      </Group>
      <Group
        title="Ô nhập, kiểm tra và nhãn trạng thái"
        description="Nhãn đi cùng ô nhập, lỗi nằm ngay dưới trường cần bổ sung. Điền tên người nhận để xem lỗi biến mất."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (recipient.trim())
              setSaved(`Đã lưu ghi chú mẫu gửi ${recipient.trim()}.`);
          }}
        >
          <ToonField
            label="Người nhận ghi chú"
            required
            error={
              !recipient.trim()
                ? 'Điền tên đồng nghiệp nhận ghi chú.'
                : undefined
            }
          >
            <ToonInput
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              maxLength={80}
              placeholder="Ví dụ: Anh Hải"
            />
          </ToonField>
          <ToonField
            label="Ghi chú ca làm"
            hint="Ghi sự việc đã quan sát, giữ nguyên số liệu."
            counter={`${note.length}/1000`}
          >
            <ToonTextarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
            />
          </ToonField>
          <ToonCheckbox
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            label="Đã đối chiếu số liệu trong log"
            description="Đánh dấu để thử trạng thái checkbox."
          />
          <ToonButton type="submit" leftIcon={<Check size={18} />}>
            Lưu ghi chú mẫu
          </ToonButton>
          <p
            role="status"
            aria-label="Phản hồi form mẫu"
            className="font-toon-body text-sm font-bold"
          >
            {saved}
          </p>
        </form>
        <div className="mt-6 flex flex-wrap gap-3" aria-label="Bảy màu nhãn">
          {tones.map((tone) => (
            <ToonBadge key={tone} tone={tone}>
              {tone}
            </ToonBadge>
          ))}
        </div>
      </Group>
    </>
  );
}

function WorkflowExamples() {
  const id = useId();
  const [tab, setTab] = useState('today');
  const [done, setDone] = useState(2);
  const [like, setLike] = useState<LikeValue | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <Group
      title="Chuyển việc, theo dõi và nhìn lại"
      description="Chạm tab để đổi nội dung, đánh dấu một việc đã xong rồi thử trả lời câu hỏi sau ca."
    >
      <ToonTabs
        idBase={id}
        label="Sổ công việc mẫu"
        value={tab}
        onChange={setTab}
        items={[
          { key: 'today', label: 'Ca hôm nay' },
          { key: 'notes', label: 'Ghi chú' },
          { key: 'done', label: 'Đã xong' },
        ]}
      />
      <div className="my-5 rounded-xl border-2 border-toon-ink bg-toon-cream p-4">
        <ToonTabPanel idBase={id} tabKey={tab} active>
          {tab === 'today'
            ? 'Đọc log, hỏi đồng nghiệp và báo lại trước cuộc họp trưa.'
            : tab === 'notes'
              ? 'Ghi chú: thời gian trả lời tăng từ 0,2 giây lên 4 giây.'
              : 'Đã đối chiếu log và ghi lại thời điểm sự cố bắt đầu.'}
        </ToonTabPanel>
      </div>
      <ToonProgress label="Việc đã hoàn tất" value={done} max={5} showValue />
      <ToonButton
        className="mt-4"
        size="sm"
        variant="secondary"
        disabled={done === 5}
        onClick={() => setDone((n) => Math.min(5, n + 1))}
      >
        Đánh dấu thêm một việc
      </ToonButton>
      <div className="mt-7">
        <h4 className="mb-4 font-toon text-lg font-bold">
          Bạn thấy việc đọc log thế nào?
        </h4>
        <ToonLikeScale
          label="Cảm nhận về việc đọc log"
          value={like}
          onChange={setLike}
        />
      </div>
      <ToonButton className="mt-6" onClick={() => setOpen(true)}>
        Mở hộp thoại cartoon
      </ToonButton>
      <Dialog
        theme="toon"
        open={open}
        onClose={() => setOpen(false)}
        title="Tạm dừng để kiểm tra"
        description="Ghi chú vẫn còn ở đây. Bạn có thể xem lại rồi tiếp tục ca mẫu."
        footer={
          <ToonButton onClick={() => setOpen(false)}>
            Tiếp tục ca mẫu
          </ToonButton>
        }
      >
        <p className="font-toon-body text-sm leading-relaxed">
          Anh Hải đang chờ số liệu. Mình xem lại thời điểm sự cố và những bước
          đã thử trước khi gửi ghi chú.
        </p>
      </Dialog>
    </Group>
  );
}
