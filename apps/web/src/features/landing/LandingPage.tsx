import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CloudMoon,
  Compass,
  EyeOff,
  MessagesSquare,
  NotebookPen,
  ShieldCheck,
} from 'lucide-react';
import {
  Logo,
  Moon,
  Mountains,
  Nebula,
  Planet,
  Sparkle,
  StarDivider,
  StarField,
  buttonClasses,
  regionColor,
} from '@datn/ui';
import { useMe } from '../../api/hooks';

const STEPS = [
  {
    icon: Compass,
    title: 'Chọn một hành tinh nghề',
    body: 'Bản đồ ngân hà có 221 nghề trong 6 vùng. Chưa biết bắt đầu từ đâu thì làm Get to know me ba phút.',
  },
  {
    icon: Briefcase,
    title: 'Nhận vai ở một cấp',
    body: 'Từ thực tập tới trưởng nhóm. Mỗi cấp có công ty, đồng nghiệp, quy định và cả mặt không hay của vị trí đó.',
  },
  {
    icon: MessagesSquare,
    title: 'Làm một ca thật',
    body: 'Mười đến mười lăm phút: hỏi đồng nghiệp, mở log, giữ lời hẹn, viết email báo sếp. Đồng hồ chạy theo việc bạn làm.',
  },
  {
    icon: NotebookPen,
    title: 'Nhìn lại ca làm',
    body: 'Kết quả, nhận xét về chính câu trả lời của bạn và hướng làm tốt hơn. Kỹ năng lên bậc, mở cấp tiếp theo.',
  },
] as const;

const PROMISES = [
  {
    icon: EyeOff,
    title: 'Không dán nhãn bạn',
    body: 'JobQuest không nói "bạn hợp nghề X". Bạn làm thử rồi tự cảm nhận; game chỉ chỉ ra việc bạn đã làm.',
  },
  {
    icon: CloudMoon,
    title: 'Có cả mặt khó của nghề',
    body: 'Tăng ca, áp lực, việc lặp lại: mỗi nghề kể thật những điều người trong nghề hay than.',
  },
  {
    icon: ShieldCheck,
    title: 'Kết quả là của riêng bạn',
    body: 'Không trang công khai, không bảng xếp hạng, không gửi cho trường hay nhà tuyển dụng.',
  },
] as const;

/** Vài hành tinh trang trí ở hero, mỗi vùng nghề một màu. */
const HERO_PLANETS = [
  {
    seed: 'SWE_BACKEND',
    region: 'cong_nghe',
    size: 92,
    x: '8%',
    y: '22%',
    delay: '0s',
  },
  {
    seed: 'NURSE',
    region: 'suc_khoe',
    size: 54,
    x: '84%',
    y: '58%',
    delay: '1.2s',
  },
  {
    seed: 'CHEF',
    region: 'dich_vu',
    size: 40,
    x: '18%',
    y: '70%',
    delay: '2.1s',
  },
  {
    seed: 'DESIGN',
    region: 'sang_tao',
    size: 64,
    x: '76%',
    y: '16%',
    delay: '0.6s',
  },
] as const;

export default function LandingPage() {
  const me = useMe();
  const signedIn = Boolean(me.data);

  return (
    <div className="relative overflow-x-clip">
      <StarField fixed seed="landing" glints={12} />

      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo size="md" />
          <nav className="flex items-center gap-2">
            {signedIn ? (
              <Link
                to="/galaxy"
                className={buttonClasses({ variant: 'secondary', size: 'sm' })}
              >
                Vào bản đồ
              </Link>
            ) : (
              <>
                <Link
                  to="/sign-in"
                  className={buttonClasses({ variant: 'ghost', size: 'sm' })}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className={buttonClasses({
                    variant: 'secondary',
                    size: 'sm',
                    className: 'max-sm:hidden',
                  })}
                >
                  Tạo tài khoản
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pb-48 pt-28 text-center">
        <Nebula
          color="#254a7a"
          className="left-1/2 top-1/3 size-[42rem] -translate-x-1/2 -translate-y-1/2"
        />
        <Moon
          size={72}
          className="absolute right-[12%] top-28 hidden animate-float sm:block"
        />
        {HERO_PLANETS.map((p) => (
          <div
            key={p.seed}
            aria-hidden
            className="absolute hidden animate-float md:block"
            style={{ left: p.x, top: p.y, animationDelay: p.delay }}
          >
            <Planet
              seed={p.seed}
              color={regionColor(p.region)}
              size={p.size}
              status="new"
            />
          </div>
        ))}

        <div className="relative z-10 mx-auto max-w-3xl animate-rise">
          <p className="eyebrow inline-flex items-center gap-2">
            <Sparkle size={10} /> Khám phá nghề bằng cách làm thử{' '}
            <Sparkle size={10} />
          </p>
          <h1 className="mt-5 text-[2.6rem] leading-[1.08] sm:text-6xl">
            <span className="text-gilded">Thử làm một nghề</span>
            <br />
            trước khi chọn nghề
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-muted">
            Nhận vai trong một ca làm như thật: khách hối, đồng nghiệp hỏi, sếp
            chờ báo cáo. Bạn tự xử lý, rồi tự cảm nhận mình có muốn làm nghề đó
            mỗi ngày không.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={signedIn ? '/galaxy' : '/register'}
              className={buttonClasses({ size: 'lg', className: 'min-w-56' })}
            >
              {signedIn ? 'Tiếp tục hành trình' : 'Bắt đầu hành trình'}
              <ArrowRight size={18} aria-hidden />
            </Link>
            {!signedIn && (
              <Link
                to="/sign-in"
                className={buttonClasses({
                  variant: 'secondary',
                  size: 'lg',
                  className: 'min-w-56',
                })}
              >
                Mình đã có tài khoản
              </Link>
            )}
          </div>
          <p className="mt-5 text-xs text-night-300">
            Miễn phí · Chơi trên trình duyệt, cả điện thoại
          </p>
        </div>
        <Mountains className="absolute inset-x-0 bottom-0 h-64 sm:h-80" />
      </section>

      {/* Vòng chơi */}
      <section
        className="relative bg-night-950/60 px-4 py-20 sm:py-28"
        aria-labelledby="loop-title"
      >
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-center">Một vòng chơi</p>
          <h2 id="loop-title" className="mt-3 text-center text-3xl sm:text-4xl">
            Từ một chấm sáng tới một ngày làm việc
          </h2>
          <ol className="relative mt-14 grid gap-5 md:grid-cols-4">
            <span
              aria-hidden
              className="absolute left-[12%] right-[12%] top-8 hidden h-px bg-[linear-gradient(90deg,transparent,rgb(212_176_106/0.6),transparent)] md:block"
            />
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li
                key={title}
                className="relative flex flex-col items-center text-center"
              >
                <span className="relative z-10 grid size-16 place-items-center rounded-full border border-line-gold bg-night-850 text-gold-300 shadow-glow">
                  <Icon size={24} aria-hidden />
                </span>
                <span className="mt-4 font-wordmark text-xs tracking-[0.2em] text-gold-400">
                  0{i + 1}
                </span>
                <h3 className="mt-1 text-lg">{title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Một ca làm trông thế nào */}
      <section
        className="relative px-4 py-20 sm:py-28"
        aria-labelledby="shift-title"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Ví dụ một ca</p>
            <h2 id="shift-title" className="mt-3 text-3xl sm:text-4xl">
              9:40, API chậm, trưa phải có hướng xử lý
            </h2>
            <p className="mt-4 text-ink-muted">
              Bạn là kỹ sư Back-end năm hai. Chị Linh bên hỗ trợ khách hàng gọi:
              khách sỉ dọa huỷ đơn. Bạn chọn hỏi ai trước, mở log nào, hứa gì
              với ai, rồi viết email báo anh trưởng nhóm. Không có đáp án mẫu để
              chép: màn chơi cho đủ dữ kiện, phần còn lại là cách bạn làm việc.
            </p>
            <ul className="mt-6 grid gap-3 text-sm">
              {[
                'Đồng hồ trong truyện chạy theo việc bạn làm: một cuộc gọi 5 phút, viết bản vá 25 phút.',
                'Đồng nghiệp chỉ biết điều người đó biết, và nhớ lời bạn đã hứa.',
                'Chấm theo cách bạn xử lý, không chấm thuộc bài.',
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <Sparkle size={14} className="mt-1 text-gold-300" />
                  <span className="text-ink-muted">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <ShiftPreview />
        </div>
      </section>

      {/* Lời hứa */}
      <section
        className="relative bg-night-950/60 px-4 py-20"
        aria-labelledby="promise-title"
      >
        <div className="mx-auto max-w-6xl">
          <h2 id="promise-title" className="text-center text-3xl">
            Ba điều JobQuest giữ
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PROMISES.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="glass rounded-lg p-6 shadow-panel"
              >
                <Icon size={22} className="text-gold-300" aria-hidden />
                <h3 className="mt-4 text-lg">{title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 pb-56 pt-20 text-center">
        <StarDivider className="mx-auto mb-12 max-w-sm" />
        <h2 className="text-3xl sm:text-4xl">Một ca làm, mười lăm phút</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-muted">
          Đủ để biết bạn có muốn quay lại vào ngày mai không.
        </p>
        <Link
          to={signedIn ? '/galaxy' : '/register'}
          className={buttonClasses({ size: 'lg', className: 'mt-8' })}
        >
          {signedIn ? 'Vào bản đồ ngân hà' : 'Tạo tài khoản miễn phí'}
        </Link>
        <Mountains tone="dawn" className="absolute inset-x-0 bottom-0 h-56" />
      </section>

      <footer className="relative border-t border-line/50 bg-night-950 px-4 py-8 text-center text-xs text-night-300">
        <p>
          JobQuest · Đồ án tốt nghiệp nhóm Golden Trio, Trường Đại học Bách khoa
          – ĐHQG-HCM.
        </p>
        <p className="mt-1">
          Màn chơi do AI dẫn dắt và chấm; kết quả chỉ để tham khảo. Dữ liệu nghề
          có dùng O*NET 31.0 (CC BY 4.0) và ESCO của Ủy ban châu Âu, đã chỉnh
          sửa.
        </p>
      </footer>
    </div>
  );
}

/** Mô phỏng tĩnh một khung thoại trong ca, để người mới hình dung màn chơi. */
function ShiftPreview() {
  return (
    <div aria-hidden className="relative">
      <div className="glass overflow-hidden rounded-xl shadow-lift">
        <div className="flex items-center justify-between border-b border-line px-4 py-3 text-xs">
          <span className="font-semibold text-ink">
            API đơn hàng chậm bất thường
          </span>
          <span className="tabular rounded-full bg-night-950/70 px-2.5 py-1 font-semibold text-gold-200">
            10:05 · còn 23 điểm
          </span>
        </div>
        <div className="space-y-3 p-5">
          <Bubble
            who="Chị Linh · Hỗ trợ khách hàng"
            text="Khách sỉ gọi chị nãy giờ á. Họ nói trưa mà còn lag là huỷ đơn luôn."
          />
          <Bubble
            who="Chị Linh"
            text="Chị hứa với họ trưa xong được hông em?"
          />
          <div className="ml-auto max-w-[80%] rounded-lg rounded-br-sm border border-gold-500/40 bg-gold-900/40 px-3.5 py-2.5 text-sm text-gold-100">
            Em chưa chắc trưa xong chị ơi. 11:30 em báo chị tình hình nha.
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-line p-4 text-xs">
          {[
            'Mở log máy chủ · 1 điểm',
            'Hỏi anh An · 1 điểm',
            'Chạy thử truy vấn · 2 điểm',
            'Chốt nguyên nhân',
          ].map((a) => (
            <span
              key={a}
              className="rounded-md border border-line bg-night-800/60 px-3 py-2 text-ink-muted"
            >
              {a}
            </span>
          ))}
        </div>
      </div>
      <Sparkle
        size={18}
        twinkle
        className="absolute -right-2 -top-2 text-gold-300"
      />
    </div>
  );
}

function Bubble({ who, text }: { who: string; text: string }) {
  return (
    <div className="max-w-[85%]">
      <p className="mb-1 text-[11px] font-semibold text-night-300">{who}</p>
      <p className="rounded-lg rounded-bl-sm border border-line bg-night-800/80 px-3.5 py-2.5 text-sm text-ink">
        {text}
      </p>
    </div>
  );
}
