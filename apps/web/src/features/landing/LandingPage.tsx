import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Compass,
  EyeOff,
  MessagesSquare,
  NotebookPen,
  ShieldCheck,
  Clock3,
  CloudMoon,
} from 'lucide-react';
import {
  CartoonPlanet,
  Comet,
  Logo,
  NightCard,
  NightSky,
  ToonBadge,
  WavyDivider,
  toonButtonClasses,
} from '@datn/ui';
import { useMe } from '../../api/hooks';
import { TOON_BACKDROPS, TOON_CHARACTERS } from '../../lib/toon';

const STEPS = [
  {
    icon: Compass,
    title: 'Chọn một hành tinh nghề',
    body: 'Khám phá bản đồ, ghé một nghề.',
  },
  {
    icon: Briefcase,
    title: 'Nhận vai ở một cấp',
    body: 'Gặp công ty, đồng nghiệp, quy định.',
  },
  {
    icon: MessagesSquare,
    title: 'Làm một ca thật',
    body: 'Hỏi, đọc dữ kiện, chọn cách xử lý.',
  },
  {
    icon: NotebookPen,
    title: 'Nhìn lại ca làm',
    body: 'Kết quả, nhận xét, hướng làm tốt hơn.',
  },
];
const PROMISES = [
  {
    icon: EyeOff,
    title: 'Không dán nhãn bạn',
    body: 'Bạn làm thử rồi tự cảm nhận. Game chỉ chỉ ra việc bạn đã làm.',
  },
  {
    icon: CloudMoon,
    title: 'Có cả mặt khó của nghề',
    body: 'Tăng ca, áp lực, việc lặp lại: nghe cả những điều người trong nghề hay than.',
  },
  {
    icon: ShieldCheck,
    title: 'Kết quả là của riêng bạn',
    body: 'Không trang công khai, không bảng xếp hạng, không gửi cho trường hay nhà tuyển dụng.',
  },
];

export default function LandingPage() {
  const me = useMe();
  const signedIn = Boolean(me.data);
  const destination = signedIn ? '/galaxy' : '/register';
  return (
    <div className="theme-toon-night relative isolate overflow-x-clip">
      <header className="relative z-20 border-b-[3px] border-toon-night-deep bg-toon-night-deep">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" aria-label="JobQuest, trang chủ" className="rounded-lg">
            <Logo size="md" />
          </Link>
          <nav aria-label="Tài khoản" className="flex items-center gap-3">
            <Link
              to={signedIn ? '/galaxy' : '/sign-in'}
              className="rounded-lg px-2 py-2 font-toon font-bold text-toon-star underline-offset-4 hover:underline"
            >
              {signedIn ? 'Vào bản đồ' : 'Đăng nhập'}
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <section
          aria-labelledby="hero-title"
          className="relative isolate overflow-hidden border-b-[3px] border-toon-night-deep"
        >
          <NightSky scene="home" horizon="city" seed="home" />
          <div
            aria-hidden
            className="pointer-events-none absolute right-[10%] top-12 hidden -rotate-12 lg:block"
          >
            <Comet size={150} />
          </div>
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-36 pt-14 sm:px-8 lg:min-h-[730px] lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:pb-28 lg:pt-12">
            <div className="relative z-10">
              <p className="mb-5 inline-block -rotate-2 rounded-lg border-[3px] border-toon-ink bg-toon-star px-3 py-1 font-toon text-sm font-bold text-toon-ink shadow-toon">
                Khám phá nghề bằng cách làm thử
              </p>
              <h1
                id="hero-title"
                className="max-w-2xl font-toon text-[2.8rem] leading-[1.08] font-extrabold text-toon-paper sm:text-6xl lg:text-7xl"
              >
                Thử làm một nghề{' '}
                <span className="text-toon-star">trước khi chọn nghề</span>
              </h1>
              <p className="mt-6 max-w-md text-lg font-semibold leading-relaxed text-toon-paper">
                Khách hối, đồng nghiệp hỏi, sếp chờ báo cáo. Bạn tự xử lý một ca
                làm, rồi tự cảm nhận nghề.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link
                  to={destination}
                  className={toonButtonClasses({ size: 'lg' })}
                >
                  {signedIn ? 'Tiếp tục hành trình' : 'Bắt đầu hành trình'}
                  <ArrowRight size={20} aria-hidden />
                </Link>
                <a
                  href="#cach-choi"
                  className="rounded-lg py-2 font-bold text-toon-star-soft underline underline-offset-4"
                >
                  Xem cách chơi
                </a>
              </div>
              <p className="mt-5 text-xs text-toon-star-soft">
                Miễn phí · Chơi trên trình duyệt, cả điện thoại
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-md pb-5 pt-8">
              <div aria-hidden className="absolute -right-4 -top-5 rotate-12">
                <CartoonPlanet
                  size={130}
                  seed="SWE_BACKEND"
                  region="cong_nghe"
                />
              </div>
              <NightCard
                tape
                className="relative rotate-2"
                ribbon={<h2>Một ca làm đang chờ</h2>}
              >
                <div className="relative h-64 overflow-hidden rounded-xl border-[3px] border-toon-ink bg-toon-sky">
                  <img
                    src={TOON_BACKDROPS.office}
                    alt=""
                    className="absolute size-full object-cover"
                  />
                  <img
                    src={TOON_CHARACTERS.lead.src}
                    alt="Đồng nghiệp trong ca làm"
                    className="absolute bottom-[-25%] left-0 h-[115%] w-auto max-w-none"
                  />
                  <p className="absolute right-3 top-4 max-w-[57%] -rotate-2 rounded-xl border-[3px] border-toon-ink bg-toon-mint p-3 font-semibold text-toon-ink shadow-toon-sm">
                    API chậm. Trưa phải có hướng xử lý.
                  </p>
                </div>
                <p className="mt-4 flex items-center gap-2 font-bold">
                  <Clock3 size={18} aria-hidden />
                  9:40 · Ca làm Back-end
                </p>
                <p className="mt-2 text-sm text-toon-ink-soft">
                  Mở log hay hỏi đồng nghiệp? Bạn chọn bước tiếp theo.
                </p>
              </NightCard>
            </div>
          </div>
        </section>
        <section
          id="cach-choi"
          aria-labelledby="loop-title"
          className="scroll-mt-6 px-5 py-16 sm:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-center text-sm font-bold tracking-widest text-toon-star">
              MỘT VÒNG CHƠI
            </p>
            <h2
              id="loop-title"
              className="mt-3 text-center font-toon text-3xl font-extrabold sm:text-4xl"
            >
              Từ hành tinh nghề tới một ngày làm việc
            </h2>
            <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(({ icon: Icon, title, body }, i) => (
                <li key={title}>
                  <NightCard className="h-full" tape={i === 1 || i === 3}>
                    <span className="flex items-center justify-between">
                      <Icon size={30} strokeWidth={2.5} aria-hidden />
                      <span className="font-toon text-3xl font-extrabold text-toon-ink-faint">
                        0{i + 1}
                      </span>
                    </span>
                    <h3 className="mt-5 font-toon text-xl font-bold">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm text-toon-ink-soft">{body}</p>
                  </NightCard>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <div aria-hidden className="mx-auto max-w-6xl px-5">
          <WavyDivider />
        </div>
        <section aria-labelledby="shift-title" className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <NightCard ribbon={<h2 id="shift-title">Ví dụ một ca</h2>}>
              <div className="grid items-center gap-8 md:grid-cols-2">
                <div>
                  <ToonBadge tone="sky">Kỹ sư Back-end</ToonBadge>
                  <h3 className="mt-4 font-toon text-3xl font-extrabold">
                    9:40, API chậm. Trưa phải có hướng xử lý.
                  </h3>
                  <p className="mt-4 text-toon-ink-soft">
                    Chị Linh bên hỗ trợ gọi: khách sỉ dọa huỷ đơn. Bạn chọn hỏi
                    ai, mở log nào, hứa gì, rồi viết báo cáo.
                  </p>
                  <details className="mt-5 rounded-xl border-2 border-toon-ink bg-toon-cream p-4">
                    <summary className="cursor-pointer font-bold">
                      Một ca diễn ra thế nào?
                    </summary>
                    <ul className="mt-3 list-disc space-y-3 pl-5 text-sm text-toon-ink-soft">
                      <li>Đồng hồ trong truyện chạy theo việc bạn làm.</li>
                      <li>Đồng nghiệp nhớ lời bạn đã hứa.</li>
                      <li>Chấm theo cách xử lý, không chấm thuộc bài.</li>
                    </ul>
                  </details>
                </div>
                <div className="rounded-2xl border-[3px] border-toon-ink bg-toon-sky p-5 shadow-toon">
                  <p className="mb-3 text-xs font-bold uppercase">
                    Chị Linh · Hỗ trợ khách hàng
                  </p>
                  <p className="rounded-xl border-[3px] border-toon-ink bg-toon-paper p-4 font-semibold">
                    Chị hứa với họ trưa xong được hông em?
                  </p>
                  <p className="ml-5 mt-4 rounded-xl border-[3px] border-toon-ink bg-toon-star-soft p-4 font-semibold">
                    Em chưa chắc trưa xong chị ơi. 11:30 em báo chị tình hình
                    nha.
                  </p>
                  <p className="mt-4 text-xs font-bold">
                    Minh hoạ một khung thoại trong ca
                  </p>
                </div>
              </div>
            </NightCard>
          </div>
        </section>
        <section aria-labelledby="promise-title" className="px-5 pb-16 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <h2
              id="promise-title"
              className="text-center font-toon text-3xl font-extrabold"
            >
              Ba điều JobQuest giữ
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {PROMISES.map(({ icon: Icon, title, body }) => (
                <NightCard key={title} tone="night">
                  <Icon size={28} className="text-toon-star" aria-hidden />
                  <h3 className="mt-4 font-toon text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed">{body}</p>
                </NightCard>
              ))}
            </div>
          </div>
        </section>
        <section className="px-5 pb-16 text-center">
          <h2 className="font-toon text-3xl font-extrabold">
            Một ca làm, mười lăm phút
          </h2>
          <p className="mx-auto mt-3 max-w-md text-toon-star-soft">
            Đủ để biết bạn có muốn quay lại vào ngày mai không.
          </p>
          <Link
            to={destination}
            className={toonButtonClasses({ size: 'lg', className: 'mt-6' })}
          >
            {signedIn ? 'Vào bản đồ ngân hà' : 'Tạo tài khoản miễn phí'}
          </Link>
        </section>
      </main>
      <footer className="border-t-[3px] border-toon-ink bg-toon-night-deep px-5 py-8 text-center text-xs text-toon-paper">
        <p>
          JobQuest · Đồ án tốt nghiệp nhóm Golden Trio, Trường Đại học Bách khoa
          – ĐHQG-HCM.
        </p>
        <p className="mx-auto mt-3 max-w-2xl">
          Màn chơi do AI dẫn dắt và chấm; kết quả chỉ để tham khảo, không gửi
          trường hay nhà tuyển dụng.
        </p>
        <p className="mx-auto mt-2 max-w-2xl">
          Dữ liệu nghề có dùng O*NET 31.0 (CC BY 4.0) và ESCO của Ủy ban châu
          Âu, đã chỉnh sửa.
        </p>
      </footer>
    </div>
  );
}
