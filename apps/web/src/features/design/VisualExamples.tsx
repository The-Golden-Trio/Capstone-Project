import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Clock3,
  MessageCircle,
  Pause,
  Play,
} from 'lucide-react';
import { profile } from '@datn/game-core';
import {
  Accordion,
  Avatar,
  Badge,
  Button,
  Callout,
  DualBars,
  EmptyState,
  HexBadge,
  LoadingBlock,
  OrbitSpinner,
  Panel,
  PanelHeader,
  PlayerEmblem,
  Portrait,
  ProgressBar,
  RadarChart,
  REGION_COLORS,
  RingProgress,
  SegmentedProgress,
  Skeleton,
  Sparkle,
  StackedBar,
  Stat,
  Switch,
  Timeline,
  cn,
} from '@datn/ui';

export function ProgressExamples() {
  const [done, setDone] = useState(3);
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
      <div className="space-y-7">
        <ProgressBar
          value={3400}
          max={6000}
          label="Tư duy · tới bậc kế"
          showValue
          valueText="3.400 / 6.000 điểm"
        />
        <ProgressBar
          value={22}
          max={38}
          label="Nghề công nghệ đã thử"
          color={REGION_COLORS.cong_nghe}
          size="sm"
          showValue
          valueText="22 / 38 nghề"
        />
        <ProgressBar value={100} label="Tiến độ nhỏ" size="xs" />
        <div>
          <p className="mb-2 text-sm">Màn chính đã xong · {done}/5</p>
          <SegmentedProgress
            done={done}
            current={done < 5 ? done : undefined}
            total={5}
            label="Màn chính đã xong"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={done === 0}
              onClick={() => setDone(done - 1)}
            >
              Giảm một màn
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={done === 5}
              onClick={() => setDone(done + 1)}
            >
              Xong một màn <Check size={14} aria-hidden />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <RingProgress value={78} size={136} label="Điểm ca mẫu">
          <div>
            <span className="font-display text-4xl text-gold-200">78</span>
            <span className="block text-xs text-ink-faint">/ 100 điểm</span>
          </div>
        </RingProgress>
      </div>
    </div>
  );
}

export function FeedbackExamples() {
  const messages = [
    {
      tone: 'info',
      title: 'Lưu tự động',
      text: 'Bạn có thể rời màn và tiếp tục sau.',
    },
    {
      tone: 'success',
      title: 'Đã lưu ghi chú',
      text: 'Ghi chú nằm trong nhật ký ca làm này.',
    },
    {
      tone: 'warning',
      title: 'Đang chờ lâu hơn thường lệ',
      text: 'Thường phản hồi trong vài giây. Ca này vẫn đang xử lý.',
    },
    {
      tone: 'danger',
      title: 'Chưa gửi được câu trả lời',
      text: 'Nội dung vẫn ở đây. Kiểm tra kết nối rồi thử lại.',
    },
    {
      tone: 'gold',
      title: 'Lên bậc 3',
      text: 'Giao tiếp & Hợp tác đã mở thêm một chặng.',
    },
    {
      tone: 'ai',
      title: 'Nhận xét ca làm',
      text: 'Dựa trên lựa chọn trong tình huống; chỉ để bạn tự tham khảo.',
    },
  ] as const;
  return (
    <div className="space-y-8">
      <div className="grid gap-3 lg:grid-cols-2">
        {messages.map((message) => (
          <Callout key={message.tone} tone={message.tone} title={message.title}>
            {message.text}
          </Callout>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel as="div" variant="sunken">
          <EmptyState
            title="Nhật ký còn để ngỏ"
            description="Hoàn thành ca đầu tiên để ghi lại điều bạn đã thử."
            action={<Button variant="secondary">Khám phá nghề</Button>}
          />
        </Panel>
        <Panel as="div" variant="sunken">
          <p className="mb-5 text-xs text-ink-faint">
            Đang tải · skeleton giữ bố cục
          </p>
          <div className="flex gap-3">
            <Skeleton variant="circle" />
            <div className="flex-1 space-y-2">
              <Skeleton />
              <Skeleton className="w-2/3" />
            </div>
          </div>
          <Skeleton variant="rect" className="mt-5" />
          <div className="mt-4 flex items-center gap-3 text-info">
            <OrbitSpinner />
            <span className="text-xs">Đang lấy tiến độ…</span>
          </div>
        </Panel>
      </div>
      <LoadingBlock
        text="Đang mở một góc ngân hà…"
        className="rounded-xl border border-line bg-night-950/30"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Ca đã hoàn thành" value="12" hint="Dữ liệu minh hoạ" />
        <Stat
          label="Thời gian nhập vai"
          value="3,5 giờ"
          hint="210 phút đã thử"
          icon={<Clock3 size={16} />}
        />
        <Stat label="Nghề đã thử" value="4 / 221" hint="Còn nhiều nơi để ghé" />
      </div>
      <Accordion title="Khi nào dùng Skeleton, khi nào dùng LoadingBlock?">
        <p className="text-sm text-ink-muted">
          Dùng Skeleton khi đã biết hình dạng nội dung sẽ đến. Dùng LoadingBlock
          khi mở một màn hoặc chờ tác vụ chưa có bố cục cụ thể.
        </p>
      </Accordion>
    </div>
  );
}

export function ChartExamples() {
  const axes = profile.SOFT_SKILL_GROUPS.map((group, index) => ({
    key: group.id,
    label: group.short,
    starred: index === 0 || index === 5,
  }));
  const values = Object.fromEntries(
    axes.map((axis, index) => [
      axis.key,
      [3.4, 2, 1.5, 4.2, 2.7, 3.8, 2.5][index],
    ]),
  );
  const overlay = Object.fromEntries(
    axes.map((axis, index) => [axis.key, [3, 2, 2, 4, 3, 3, 3][index]]),
  );
  const [requirement, setRequirement] = useState(true);
  return (
    <div className="space-y-8">
      <p className="text-xs text-ink-faint">
        Toàn bộ số dưới đây là dữ liệu minh hoạ.
      </p>
      <div className="grid items-center gap-6 lg:grid-cols-2">
        <div className="text-center">
          <RadarChart
            axes={axes}
            values={values}
            overlay={requirement ? overlay : undefined}
            label="Kỹ năng mềm mẫu và điều kiện cấp tiếp theo"
          />
        </div>
        <div className="space-y-5">
          <h3 className="text-xl">Tới đâu rồi, còn thiếu gì?</h3>
          <p className="text-sm text-ink-muted">
            Bảy trục, năm vòng bậc. Vàng là tiến độ người chơi; nét đứt là điều
            kiện của cấp. Dấu ★ ghi lợi thế chòm sao.
          </p>
          <Switch
            label="Hiện điều kiện cấp tiếp theo"
            checked={requirement}
            onChange={setRequirement}
          />
          <dl className="space-y-2 text-xs">
            {axes.map((axis) => (
              <div key={axis.key} className="flex justify-between gap-3">
                <dt className="text-ink-muted">
                  {axis.label}
                  {axis.starred ? ' ★' : ''}
                </dt>
                <dd className="tabular text-gold-200">
                  {values[axis.key].toLocaleString('vi-VN')} / 5
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="border-t border-line pt-6">
        <h3 className="mb-2 text-xl">Điều tự kể và điều đã thử</h3>
        <p className="mb-4 text-sm text-ink-muted">
          Hai vạch cho mỗi kiểu việc. Dấu +/− là thay đổi cảm nhận, không phải
          xếp hạng.
        </p>
        <DualBars
          items={profile.RIASEC_AXES.map((axis, index) => ({
            key: axis,
            label: profile.RIASEC_INFO[axis].name,
            self: [2, 3, 2.5, 1.5, 2, 2.5][index],
            after: index === 4 ? null : [2.3, 2.6, 2.9, 2, 0, 2.4][index],
            count: index === 4 ? 0 : [4, 8, 3, 2, 0, 5][index],
          }))}
        />
        <p className="mt-3 text-xs text-ink-faint">
          Dẫn dắt: chơi thêm để mở · các trục khác dựa trên 2–8 việc minh hoạ.
        </p>
      </div>
      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-xl">Đã ghé những vùng nào?</h3>
        <StackedBar
          label="Số nghề đã thử theo vùng, dữ liệu minh hoạ"
          items={[
            {
              key: 'tech',
              label: 'Công nghệ',
              value: 4,
              color: REGION_COLORS.cong_nghe,
            },
            {
              key: 'health',
              label: 'Sức khoẻ',
              value: 2,
              color: REGION_COLORS.suc_khoe,
            },
            {
              key: 'art',
              label: 'Sáng tạo',
              value: 3,
              color: REGION_COLORS.sang_tao,
            },
          ]}
        />
      </div>
      <div className="rounded-lg border border-line bg-night-950/40 p-5">
        <div className="pointer-events-none grayscale opacity-40" aria-hidden>
          <ProgressBar value={0} label="Chưa có dữ liệu" />
          <div className="mt-3 flex gap-2">
            <div className="h-16 flex-1 rounded bg-night-600" />
            <div className="h-16 flex-1 rounded bg-night-600" />
            <div className="h-16 flex-1 rounded bg-night-600" />
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-ink-faint">
          chơi thêm để mở
        </p>
      </div>
    </div>
  );
}

export function MotionExamples() {
  const [running, setRunning] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-lg text-sm text-ink-muted">
          Lấp lánh ở nền, lơ lửng cho đảo đang chơi, quỹ đạo khi chờ và xuất
          hiện nhẹ cho nội dung mới.
        </p>
        <Button
          variant="subtle"
          size="sm"
          onClick={() => setRunning(!running)}
          leftIcon={running ? <Pause size={14} /> : <Play size={14} />}
        >
          {running ? 'Dừng mẫu chuyển động' : 'Chạy mẫu chuyển động'}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            key: 'twinkle',
            label: 'Twinkle · 4,5 giây',
            className: 'animate-twinkle',
          },
          { key: 'float', label: 'Float · 7 giây', className: 'animate-float' },
          {
            key: 'orbit',
            label: 'Orbit · 1,4 giây',
            className: 'animate-orbit',
          },
          { key: 'rise', label: 'Rise · 0,5 giây', className: 'animate-rise' },
        ].map((motion) => (
          <figure
            key={`${motion.key}-${running}`}
            className="rounded-xl border border-line bg-night-950/40 p-5 text-center"
          >
            <div className="grid h-24 place-items-center">
              <span
                className={cn('inline-block text-gold-300', motion.className)}
                style={{ animationPlayState: running ? 'running' : 'paused' }}
              >
                <Sparkle size={32} />
              </span>
            </div>
            <figcaption className="text-xs text-ink-faint">
              {motion.label}
            </figcaption>
          </figure>
        ))}
      </div>
      <Callout tone="info">
        Khi thiết bị chọn giảm chuyển động, các animation và transition được rút
        về gần như tĩnh. Mẫu Rise chạy lại khi bấm dừng rồi chạy.
      </Callout>
    </div>
  );
}

export function CompositionExamples() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-4 text-xs text-ink-faint">
          Màn chơi thu nhỏ · dữ liệu và lời thoại minh hoạ
        </p>
        <Panel as="div" variant="sunken" padding="lg">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <Badge tone="info">Back-end · Cấp 1</Badge>
            <span className="flex items-center gap-1 text-xs text-ink-faint">
              <Clock3 size={13} aria-hidden /> 09:20 · ca sáng
            </span>
          </div>
          <div className="flex items-end gap-4">
            <Portrait
              seed="ha"
              expression="lo_lang"
              size={90}
              name="Hà, đồng nghiệp"
              framed
            />
            <div className="min-w-0 flex-1 rounded-xl border border-line bg-night-800/60 p-4">
              <p className="mb-2 text-xs font-semibold text-info">
                Hà · Đồng nghiệp
              </p>
              <p className="text-sm leading-relaxed">
                Trang đặt hàng thường phản hồi trong 0,2 giây, nhưng sáng nay
                mất 4 giây. Khách đang chờ. Mình kiểm tra từ đâu?
              </p>
            </div>
          </div>
          <Callout tone="ai" className="mt-4">
            Lời dẫn minh hoạ cho một tình huống có áp lực thời gian.
          </Callout>
          <div className="mt-5 space-y-2">
            <Button block leftIcon={<MessageCircle size={16} />}>
              Hỏi Hà: lỗi bắt đầu khi nào?
            </Button>
            <Button variant="subtle" block>
              Đọc log của lượt đặt hàng
            </Button>
            <Button variant="ghost" block>
              Xem ghi chú ca làm
            </Button>
          </div>
        </Panel>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel as="div" frame padding="lg">
          <div className="flex items-center gap-3">
            <PlayerEmblem seed="an-profile" size={64} />
            <div>
              <p className="text-xs text-ink-faint">
                Hành trang riêng tư · minh hoạ
              </p>
              <h3 className="mt-1 text-2xl">An</h3>
              <span className="text-xs text-ink-muted">
                ♊︎ Song Tử · ★ Giao tiếp, Thích ứng
              </span>
            </div>
            <HexBadge kind="kham_pha" size={42} label="Đã thử ca đầu tiên" />
          </div>
          <div className="mt-6">
            <PanelHeader title="Đang luyện giao tiếp" level={4} />
            <ProgressBar
              value={3400}
              max={6000}
              label="Giao tiếp tới bậc 4"
              showValue
              valueText="3.400 điểm · bậc 4 ở 6.000"
            />
            <p className="mt-3 text-xs text-ink-faint">
              Ca gần nhất: đã hỏi rõ yêu cầu trước khi bắt tay làm.
            </p>
          </div>
          <Button
            variant="secondary"
            className="mt-5"
            rightIcon={<ArrowRight size={14} />}
          >
            Xem dấu chân đã qua
          </Button>
        </Panel>
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Avatar name="Hà Nguyễn" size={36} />
            <p className="text-sm text-ink-muted">
              Avatar chữ cái cho nơi không dùng chân dung.
            </p>
          </div>
          <Timeline
            items={[
              {
                time: '09:10',
                title: 'Làm rõ yêu cầu',
                body: 'Bạn hỏi về thời điểm bắt đầu chậm.',
                tone: 'info',
              },
              {
                time: '09:20',
                title: 'Đọc log',
                body: 'Bạn ghi lại hai dấu hiệu để kiểm tra tiếp.',
                tone: 'success',
              },
            ]}
          />
          <Accordion title="Có cả mặt khó của nghề">
            <p className="text-sm text-ink-muted">
              Sự cố có thể xảy ra khi khách đang chờ; phải phối hợp, cập nhật
              tiến độ và chấp nhận có lúc chưa tìm ra ngay nguyên nhân.
            </p>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
