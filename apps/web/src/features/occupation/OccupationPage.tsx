import { useId, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock3,
  Layers,
  TriangleAlert,
} from 'lucide-react';
import {
  CartoonPlanet,
  EmptyState,
  LoadingBlock,
  NightSky,
  ToonButton,
  ToonProgress,
  ToonTabPanel,
  ToonTabs,
  toonButtonClasses,
  regionColor,
} from '@datn/ui';
import {
  errorText,
  useEnrol,
  useOccupation,
  useRatingForm,
  useRecord,
} from '../../api/hooks';
import { firstDestination, formatYears } from './model';
import {
  BriefText,
  CareerIsland,
  KeywordLegend,
  Keywords,
  LoadError,
  PaperSection,
  Ratings,
  RoleLinks,
  TaskList,
} from './Parts';
import { PaySection } from './PaySection';

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
  const color = regionColor(o.regionId);
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
    <div className="theme-toon-night relative isolate min-h-screen overflow-hidden">
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
          className="grid min-h-[660px] content-center items-center gap-4 pb-10 pt-7 md:grid-cols-[.8fr_1.2fr] md:gap-10"
        >
          <div className="relative mx-auto flex w-full max-w-80 items-center justify-center md:max-w-none">
            <CartoonPlanet
              seed={code}
              region={o.regionId}
              size="100%"
              className="max-h-64 max-w-80 md:max-h-96 md:max-w-96"
            />
          </div>
          <div className="min-w-0">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.15em] text-toon-star">
              {regions[o.regionId]}
            </p>
            <h1
              id="occupation-title"
              className="font-toon text-3xl font-extrabold leading-tight text-toon-paper sm:text-4xl lg:text-5xl"
            >
              {o.name}
            </h1>
            <div className="mt-4 max-w-xl text-toon-star-soft">
              <BriefText text={o.summary} firstSentence />
            </div>
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
        <section
          id="mat-kho"
          aria-labelledby="downsides-title"
          className="relative mb-8 rounded-[22px] border-[3px] border-toon-ink bg-toon-star-soft p-5 text-toon-ink shadow-toon sm:p-6"
        >
          <div className="flex items-start gap-4">
            <TriangleAlert
              size={28}
              strokeWidth={2.6}
              aria-hidden
              className="shrink-0"
            />
            <div className="min-w-0">
              <h2
                id="downsides-title"
                className="mb-2 font-toon text-xl font-extrabold"
              >
                Mặt khó của nghề
              </h2>
              <TaskList
                items={o.downsides}
                limit={1}
                empty="Chưa có thông tin mặt khó được công bố; hồ sơ nghề còn cần bổ sung phần này."
              />
            </div>
          </div>
        </section>
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <PaperSection
            id="mot-ngay"
            title="Một ngày làm việc"
            icon={<Clock3 size={21} />}
          >
            {activeLevel ? (
              <>
                <ToonTabs
                  idBase={tabId}
                  label="Công việc theo cấp"
                  items={o.levels.map((l) => ({
                    key: String(l.levelNo),
                    label: `Cấp ${l.levelNo}`,
                  }))}
                  value={String(activeLevel.levelNo)}
                  onChange={setDayLevel}
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
          <PaperSection title="Nhịp việc & nơi làm" icon={<Clock3 size={21} />}>
            <TaskList items={o.workFacts} />
            <TaskList items={o.settings} />
            {o.environments.length ? (
              <details>
                <summary className="w-fit cursor-pointer rounded-md text-sm font-bold focus-visible:shadow-toon-focus">
                  Môi trường làm việc
                </summary>
                <ul className="mt-4 space-y-4">
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
              </details>
            ) : (
              <p className="text-xs text-toon-ink-faint">
                Chưa có phân bố môi trường làm việc.
              </p>
            )}
          </PaperSection>
          <PaperSection
            id="lo-trinh"
            title="Lộ trình"
            icon={<Layers size={21} />}
          >
            <ol className="flex snap-x gap-3 overflow-x-auto pb-4">
              {o.levels.map((l) => (
                <li key={l.levelNo} className="w-36 shrink-0 snap-start">
                  <Link
                    to={`/occupations/${code}/levels?level=${l.levelNo}`}
                    className="flex h-full flex-col items-center rounded-2xl border-2 border-toon-ink bg-toon-cream p-3 text-center focus-visible:shadow-toon-focus"
                  >
                    <CareerIsland
                      levelNo={l.levelNo}
                      color={color}
                      locked={l.access === 'LOCKED'}
                      active={l.access === 'ENROLLED'}
                      className="w-28"
                    />
                    <span className="font-toon text-xs font-bold">
                      Cấp {l.levelNo}
                    </span>
                    <span className="mt-1 text-sm font-bold">{l.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <Link
              to={`/occupations/${code}/levels`}
              className={toonButtonClasses({
                variant: 'secondary',
                size: 'sm',
              })}
            >
              Xem điều kiện từng cấp <ArrowRight size={16} aria-hidden />
            </Link>
            <details>
              <summary className="w-fit cursor-pointer rounded-md font-bold focus-visible:shadow-toon-focus">
                Các hướng phát triển
              </summary>
              <div className="mt-4 space-y-5">
                {o.path.map((p, i) => (
                  <div key={`${p.stage}-${i}`}>
                    <h3 className="mb-3 font-toon text-lg font-bold">
                      {p.label}
                    </h3>
                    <RoleLinks roles={p.roles} />
                  </div>
                ))}
                {o.similar.length > 0 && (
                  <div>
                    <h3 className="mb-3 font-toon text-lg font-bold">
                      Khám phá nghề gần nhau
                    </h3>
                    <ul className="space-y-3">
                      {o.similar.map((s) => (
                        <li key={s.code}>
                          <RoleLinks roles={[s]} />
                          <div className="mt-2 text-toon-ink-soft">
                            <BriefText text={s.why} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>
            {o.gate.kind === 'PREREQUISITE' && (
              <div className="rounded-xl border-2 border-toon-ink bg-toon-cream p-4">
                <p className="mb-3 font-bold">Nghề đi trước · {o.gate.band}</p>
                <p className="mb-3 text-sm">
                  Hoàn thành cấp yêu cầu ở một nghề đi trước và đủ bậc kỹ năng.
                  Xem điều kiện ở từng đảo.
                </p>
                <RoleLinks roles={o.gate.roles} />
              </div>
            )}
          </PaperSection>
          <PaySection pay={o.pay} />
          <PaperSection
            id="hoc-gi"
            title="Học gì để bắt đầu?"
            icon={<BookOpen size={21} />}
          >
            {o.education.preparation && (
              <BriefText text={o.education.preparation} />
            )}
            <div>
              <h3 className="mb-3 font-toon text-lg font-bold">
                Ngành học đại học
              </h3>
              <TaskList items={o.education.university} />
            </div>
            <div>
              <h3 className="mb-3 font-toon text-lg font-bold">Học nghề</h3>
              <TaskList items={o.education.vocational} />
            </div>
            {o.education.licence && (
              <div>
                <p className="mb-2 font-bold">Chứng chỉ / giấy phép</p>
                <BriefText text={o.education.licence} />
              </div>
            )}
            {o.education.note && <BriefText text={o.education.note} />}
          </PaperSection>
          <PaperSection title="Kỹ năng nghề">
            <Keywords items={o.keywords} />
            <KeywordLegend />
          </PaperSection>
          <PaperSection id="danh-gia" title="Đánh giá">
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
        <footer className="mt-8 space-y-2 border-t-2 border-dashed border-toon-night-line pt-5 text-xs leading-relaxed text-toon-star-soft">
          <details>
            <summary className="w-fit cursor-pointer rounded-md font-bold focus-visible:shadow-toon-focus">
              Tên & nhóm nghề
            </summary>
            <p className="mt-2">
              {o.nameEn} · {o.group}
            </p>
          </details>
          {o.attribution.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </footer>
      </div>
    </div>
  );
}
