import { useId, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock3,
  GraduationCap,
  Hammer,
  Layers,
  Medal,
  Star,
  Sun,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import {
  CartoonPlanet,
  EmptyState,
  LoadingBlock,
  NightSky,
  ToonButton,
  ToonCallout,
  ToonDisclosure,
  ToonProgress,
  ToonStatus,
  ToonStatusGlyph,
  ToonSteps,
  ToonTabPanel,
  ToonTabs,
  toonButtonClasses,
} from '@datn/ui';
import {
  errorText,
  useEnrol,
  useOccupation,
  useRatingForm,
  useRecord,
} from '../../api/hooks';
import { firstDestination, formatPay, formatYears } from './model';
import {
  BriefText,
  KeywordLegend,
  Keywords,
  LoadError,
  PaperSection,
  Ratings,
  RoleLinks,
  TaskList,
} from './Parts';
import { PaySection } from './PaySection';
import { keepHyphenated } from '../../lib/text';
import { RegionGlyph } from '../galaxy/regions';
import { ChapterIndex, QuickFact, type Chapter } from './Chapters';

const regions = {
  ky_thuat: 'Kỹ thuật',
  suc_khoe: 'Sức khoẻ',
  kinh_doanh: 'Kinh doanh',
  cong_nghe: 'Công nghệ',
  sang_tao: 'Sáng tạo',
  dich_vu: 'Dịch vụ',
};

export default function OccupationPage() {
  const { code } = useParams();
  const occupation = useOccupation(code);
  const record = useRecord();
  const rating = useRatingForm(code);
  const enrol = useEnrol();
  const navigate = useNavigate();
  const [dayLevel, setDayLevel] = useState('');
  const tabId = useId();
  const chapters: Chapter[] = [
    { id: 'mat-kho', label: 'Mặt khó', icon: <TriangleAlert size={16} /> },
    { id: 'mot-ngay', label: 'Một ngày', icon: <Sun size={16} /> },
    { id: 'nhip-viec', label: 'Nhịp việc', icon: <Clock3 size={16} /> },
    { id: 'lo-trinh', label: 'Lộ trình', icon: <Layers size={16} /> },
    { id: 'luong', label: 'Lương', icon: <Wallet size={16} /> },
    { id: 'hoc-gi', label: 'Học gì', icon: <BookOpen size={16} /> },
    { id: 'ky-nang', label: 'Kỹ năng', icon: <Medal size={16} /> },
    { id: 'danh-gia', label: 'Đánh giá', icon: <Star size={16} /> },
  ];
  if (occupation.isError)
    return (
      <LoadError
        error={occupation.error}
        retry={() => void occupation.refetch()}
      />
    );
  if (!code) return <EmptyState title="Chưa chọn nghề" />;
  if (!occupation.data)
    return <LoadingBlock text="Đang mở hồ sơ nghề…" className="min-h-[60vh]" />;
  const o = occupation.data;
  const destination = firstDestination(o.levels);
  const playing = record.data?.playing.find((r) => r.occupationCode === code);
  const activeLevel =
    o.levels.find((l) => String(l.levelNo) === dayLevel) ?? o.levels[0];
  const enter = () => {
    if (playing) {
      navigate(`/islands/${playing.enrolmentId}`);
      return;
    }
    if (destination?.enrolmentId) {
      navigate(`/islands/${destination.enrolmentId}`);
      return;
    }
    if (destination)
      enrol.mutate(
        { code, levelNo: destination.levelNo },
        { onSuccess: (island) => navigate(`/islands/${island.enrolmentId}`) },
      );
  };
  return (
    // overflow-x-clip, không overflow-hidden: hidden tạo khung cuộn làm mục lục hết bám.
    <div className="theme-toon-night relative isolate min-h-screen overflow-x-clip">
      <NightSky seed={code} scene="plain" />
      <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-6 sm:px-8">
        <Link
          to="/galaxy"
          className="inline-flex items-center gap-2 rounded-md text-sm font-bold text-toon-star-soft focus-visible:shadow-toon-focus"
        >
          <ArrowLeft size={16} aria-hidden />
          Bản đồ ngân hà
        </Link>
        <section
          id="tong-quan"
          aria-labelledby="occupation-title"
          className="grid items-center gap-4 pb-12 pt-6 md:min-h-[440px] md:grid-cols-[.7fr_1.3fr] md:gap-10"
        >
          <div className="relative mx-auto flex w-full max-w-80 items-center justify-center md:max-w-none">
            <CartoonPlanet
              seed={code}
              region={o.regionId}
              size="100%"
              className="max-h-52 max-w-64 motion-safe:animate-toon-bob md:max-h-80 md:max-w-80"
            />
          </div>
          <div className="min-w-0">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-toon-star">
              <RegionGlyph id={o.regionId} size={15} />
              {regions[o.regionId]}
            </p>
            <h1
              id="occupation-title"
              className="font-toon text-3xl font-extrabold leading-tight text-toon-paper sm:text-4xl lg:text-5xl"
            >
              {keepHyphenated(o.name)}
            </h1>
            <div className="mt-4 max-w-xl text-toon-night-ink">
              <BriefText text={o.summary} firstSentence />
            </div>
            {/* Ba con số nhìn một lần là nắm: số cấp, lương giữa, số kỹ năng. */}
            <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-toon-paper">
              <QuickFact
                icon={<Layers size={16} />}
                label="Số cấp"
                value={`${o.levels.length} cấp`}
              />
              {o.pay?.median != null && (
                <QuickFact
                  icon={<Wallet size={16} />}
                  label="Lương trung vị"
                  value={formatPay(o.pay.median)}
                />
              )}
              <QuickFact
                icon={<Medal size={16} />}
                label="Kỹ năng nghề"
                value={`${o.keywords.length} kỹ năng`}
              />
            </dl>
            <div className="mt-6">
              {o.playable &&
              (playing || (destination && destination.questCount > 0)) ? (
                <ToonButton
                  size="lg"
                  onClick={enter}
                  loading={enrol.isPending}
                  rightIcon={<ArrowRight size={18} aria-hidden />}
                >
                  {playing
                    ? `Chơi tiếp cấp ${playing.levelNo}`
                    : destination?.access === 'ENROLLED'
                      ? `Chơi tiếp cấp ${destination.levelNo}`
                      : destination?.levelNo === 1
                        ? 'Vào cấp đầu'
                        : `Vào cấp ${destination?.levelNo}`}
                </ToonButton>
              ) : (
                <Link
                  to={`/occupations/${code}/levels`}
                  className={toonButtonClasses({ size: 'lg' })}
                >
                  Xem lộ trình <ArrowRight size={18} aria-hidden />
                </Link>
              )}
              {enrol.isError && (
                <p
                  role="alert"
                  className="mt-3 rounded-xl bg-toon-paper p-3 text-sm font-bold text-toon-maroon"
                >
                  {errorText(enrol.error)}
                </p>
              )}
            </div>
          </div>
        </section>
        {record.isError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border-2 border-toon-star bg-toon-night-deep p-4 text-sm"
          >
            Chưa tải được tiến độ của bạn. {errorText(record.error)}{' '}
            <button
              className="rounded underline focus-visible:shadow-toon-focus"
              onClick={() => void record.refetch()}
            >
              Thử lại
            </button>
          </div>
        )}
        {/* Hồ sơ đọc thành một chuỗi chương; mục lục ký hiệu bám theo khi cuộn. */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
          <ChapterIndex chapters={chapters} />
          <div className="min-w-0 space-y-6">
            <PaperSection
              id="mat-kho"
              index={1}
              tone="warning"
              title="Mặt khó của nghề"
              icon={<TriangleAlert size={20} strokeWidth={2.6} />}
            >
              <TaskList
                items={o.downsides}
                limit={1}
                empty="Chưa có thông tin mặt khó được công bố; hồ sơ nghề còn cần bổ sung phần này."
              />
            </PaperSection>
            <PaperSection
              id="mot-ngay"
              index={2}
              title="Một ngày làm việc"
              icon={<Sun size={20} />}
            >
              {activeLevel ? (
                <>
                  <ToonTabs
                    idBase={tabId}
                    label="Công việc theo cấp"
                    variant="quiet"
                    items={o.levels.map((l) => ({
                      key: String(l.levelNo),
                      label: `Cấp ${l.levelNo}`,
                    }))}
                    value={String(activeLevel.levelNo)}
                    onChange={setDayLevel}
                    className="-mx-1 gap-1"
                  />
                  <ToonTabPanel
                    idBase={tabId}
                    tabKey={String(activeLevel.levelNo)}
                    active
                  >
                    <p className="mb-1 font-toon text-lg font-extrabold">
                      {activeLevel.title}
                    </p>
                    <p className="mb-4 text-xs text-toon-ink-faint">
                      {formatYears(activeLevel.years)}
                    </p>
                    <TaskList items={activeLevel.tasks} />
                  </ToonTabPanel>
                </>
              ) : (
                <p className="text-sm">Chưa có mô tả công việc theo cấp.</p>
              )}
            </PaperSection>
            <PaperSection
              id="nhip-viec"
              index={3}
              title="Nhịp việc & nơi làm"
              icon={<Clock3 size={20} />}
            >
              <TaskList items={o.workFacts} />
              <TaskList items={o.settings} />
              {o.environments.length ? (
                <div>
                  <h3 className="mb-3 font-toon text-base font-bold">
                    Môi trường làm việc
                  </h3>
                  <ul className="space-y-3">
                    {o.environments.map((e) => (
                      <li key={e.name}>
                        <ToonProgress
                          label={e.name}
                          value={e.weight}
                          max={100}
                          showValue
                          valueText={`${Math.round(e.weight)}%`}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-toon-ink-faint">
                  Chưa có phân bố môi trường làm việc.
                </p>
              )}
            </PaperSection>
            <PaperSection
              id="lo-trinh"
              index={4}
              title="Lộ trình"
              icon={<Layers size={20} />}
            >
              <ToonSteps
                label={`Lộ trình ${o.levels.length} cấp`}
                steps={o.levels.map((l) => ({
                  key: String(l.levelNo),
                  state:
                    l.access === 'COMPLETED'
                      ? 'done'
                      : l.access === 'ENROLLED'
                        ? 'current'
                        : l.access === 'LOCKED'
                          ? 'locked'
                          : 'next',
                  marker: l.access === 'COMPLETED' ? undefined : l.levelNo,
                  title: (
                    <Link
                      to={`/occupations/${code}/levels?level=${l.levelNo}`}
                      className="rounded hover:underline focus-visible:shadow-toon-focus"
                    >
                      <span className="visually-hidden">Cấp {l.levelNo}: </span>
                      {l.title}
                    </Link>
                  ),
                  meta: (
                    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{formatYears(l.years)}</span>
                      {l.access === 'ENROLLED' && (
                        <ToonStatus kind="playing" label="Bạn đang ở đây" />
                      )}
                      {l.access === 'COMPLETED' && (
                        <ToonStatus kind="done" compact />
                      )}
                    </span>
                  ),
                }))}
              />
              <Link
                to={`/occupations/${code}/levels`}
                className={toonButtonClasses({
                  variant: 'secondary',
                  size: 'sm',
                })}
              >
                Xem điều kiện từng cấp <ArrowRight size={16} aria-hidden />
              </Link>
              {o.gate.kind === 'PREREQUISITE' && (
                <ToonCallout
                  tone="info"
                  icon={<ToonStatusGlyph kind="locked" size={16} />}
                  title={`Nghề đi trước · ${o.gate.band}`}
                >
                  <p className="mb-3">
                    Hoàn thành cấp yêu cầu ở một nghề đi trước và đủ bậc kỹ
                    năng. Xem điều kiện ở từng đảo.
                  </p>
                  <RoleLinks roles={o.gate.roles} />
                </ToonCallout>
              )}
              <ToonDisclosure
                summary="Các hướng phát triển"
                meta={o.path.length + (o.similar.length ? 1 : 0)}
              >
                <div className="space-y-5">
                  {o.path.map((p, i) => (
                    <div key={`${p.stage}-${i}`}>
                      <h3 className="mb-2 font-toon text-base font-bold">
                        {p.label}
                      </h3>
                      <RoleLinks roles={p.roles} />
                    </div>
                  ))}
                  {o.similar.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-toon text-base font-bold">
                        Khám phá nghề gần nhau
                      </h3>
                      <ul className="space-y-3">
                        {o.similar.map((s) => (
                          <li key={s.code}>
                            <RoleLinks roles={[s]} />
                            <div className="mt-1 text-toon-ink-soft">
                              <BriefText text={s.why} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ToonDisclosure>
            </PaperSection>
            <PaySection pay={o.pay} index={5} />
            <PaperSection
              id="hoc-gi"
              index={6}
              title="Học gì để bắt đầu?"
              icon={<BookOpen size={20} />}
            >
              {o.education.preparation && (
                <BriefText text={o.education.preparation} />
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-toon text-base font-bold">
                    <GraduationCap size={17} aria-hidden /> Ngành học đại học
                  </h3>
                  <TaskList items={o.education.university} />
                </div>
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-toon text-base font-bold">
                    <Hammer size={17} aria-hidden /> Học nghề
                  </h3>
                  <TaskList items={o.education.vocational} />
                </div>
              </div>
              {o.education.licence && (
                <div>
                  <p className="mb-2 font-bold">Chứng chỉ / giấy phép</p>
                  <BriefText text={o.education.licence} />
                </div>
              )}
              {o.education.note && <BriefText text={o.education.note} />}
            </PaperSection>
            <PaperSection
              id="ky-nang"
              index={7}
              title="Kỹ năng nghề"
              icon={<Medal size={20} />}
            >
              <Keywords items={o.keywords} />
              <KeywordLegend />
            </PaperSection>
            <PaperSection
              id="danh-gia"
              index={8}
              title="Đánh giá"
              icon={<Star size={20} />}
            >
              {o.ratings.withheld ? (
                <Ratings summary={o.ratings} criteria={[]} />
              ) : rating.isError ? (
                <LoadError
                  error={rating.error}
                  retry={() => void rating.refetch()}
                />
              ) : !rating.data ? (
                <LoadingBlock text="Đang tải tiêu chí đánh giá…" />
              ) : (
                <Ratings summary={o.ratings} criteria={rating.data.criteria} />
              )}
              <Link
                to={`/occupations/${code}/rate`}
                className={toonButtonClasses({
                  variant: 'secondary',
                  size: 'sm',
                })}
              >
                Chia sẻ trải nghiệm nghề
              </Link>
            </PaperSection>
          </div>
        </div>
        <footer className="mt-10 space-y-2 border-t-[1.5px] border-toon-night-line pt-5 text-xs leading-relaxed text-toon-night-ink lg:ml-[15rem]">
          <ToonDisclosure
            tone="night"
            summary="Tên & nhóm nghề"
            className="[&>summary]:min-h-9 [&>summary]:py-1 [&>summary]:text-xs"
          >
            <p>
              {o.nameEn} · {o.group}
            </p>
          </ToonDisclosure>
          {o.attribution.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </footer>
      </div>
    </div>
  );
}
