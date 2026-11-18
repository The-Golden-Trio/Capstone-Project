/**
 * Quần đảo cấp nghề theo "Celestial cartoon": các đảo nối bằng đường nét
 * đứt vàng như bản đồ kho báu trên trời đêm; bên cạnh là thẻ giấy của cấp
 * đang chọn, chỉ giữ việc chính, điều kiện vào cấp và một nút; kỹ năng nghề
 * gập lại để người chơi không bị một mớ chữ đập vào mắt.
 */
import { useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  Gift,
  LockKeyhole,
  Sparkles,
} from 'lucide-react';
import { profile } from '@datn/game-core';
import {
  InkStar,
  RadarChart,
  ToonBadge,
  ToonButton,
  cn,
  regionColor,
  toonButtonClasses,
} from '@datn/ui';
import { errorText, useEnrol, useOccupation, useRecord } from '../../api/hooks';
import { firstDestination, formatYears, skillTiers } from './model';
import {
  CareerIsland,
  KeywordLegend,
  Keywords,
  LoadError,
  PaperSection,
} from './Parts';

const ACCESS = {
  OPEN: { label: 'Đã mở', tone: 'sky' },
  ENROLLED: { label: 'Đang khám phá', tone: 'mustard' },
  COMPLETED: { label: 'Đã hoàn thành', tone: 'mint' },
  LOCKED: { label: 'Chưa mở', tone: 'paper' },
} as const;

/** Toạ độ đảo trên bản đồ (phần trăm), lượn trái phải như đường mòn. */
const spot = (i: number) => ({
  x: i % 2 === 0 ? 26 : 70,
  y: i,
});

export default function LevelsPage() {
  const { code } = useParams();
  const [params, setParams] = useSearchParams();
  const occupation = useOccupation(code);
  const record = useRecord();
  const enrol = useEnrol();
  const navigate = useNavigate();
  const [actionLevel, setActionLevel] = useState<number | null>(null);
  if (occupation.isError)
    return (
      <div className="theme-toon-night min-h-[60vh] p-6">
        <LoadError
          error={occupation.error}
          retry={() => void occupation.refetch()}
        />
      </div>
    );
  if (!code || !occupation.data)
    return (
      <div
        role="status"
        className="theme-toon-night grid min-h-[60vh] place-items-center font-toon text-xl font-extrabold"
      >
        {code ? 'Đang vẽ quần đảo nghề…' : 'Chưa chọn nghề'}
      </div>
    );
  const o = occupation.data;
  const color = regionColor(o.regionId);
  const selected =
    o.levels.find((l) => String(l.levelNo) === params.get('level')) ??
    firstDestination(o.levels) ??
    o.levels[0];
  const tiers = record.data ? skillTiers(record.data.softSkills) : null;
  const needs = selected
    ? profile.SOFT_SKILL_GROUPS.filter(
        ({ id }) => (selected.requirement[id] ?? 0) > 0,
      )
    : [];
  // Đã có đảo thì luôn cho về đảo (onboard, công ty vẫn dùng được); chỉ
  // chặn vào cấp mới khi cấp bị khoá hoặc chưa có ca được xuất bản.
  const blocked =
    !selected ||
    (!selected.enrolmentId &&
      (selected.access === 'LOCKED' ||
        !o.playable ||
        selected.questCount === 0));
  const enter = () => {
    if (!selected) return;
    if (selected.enrolmentId) {
      navigate(`/islands/${selected.enrolmentId}`);
      return;
    }
    setActionLevel(selected.levelNo);
    enrol.mutate(
      { code, levelNo: selected.levelNo },
      { onSuccess: (island) => navigate(`/islands/${island.enrolmentId}`) },
    );
  };
  const rows = o.levels.length;

  return (
    <div className="theme-toon-night min-h-full">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <Link
          to={`/occupations/${code}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-toon-star-soft hover:text-toon-paper"
        >
          <ArrowLeft size={15} strokeWidth={2.6} aria-hidden /> Hồ sơ {o.name}
        </Link>
        <header className="mb-8 mt-5">
          <p className="font-toon text-sm font-extrabold uppercase tracking-widest text-toon-star">
            Quần đảo nghề
          </p>
          <h1 className="mt-1 font-toon text-3xl font-extrabold leading-tight sm:text-5xl">
            Một đảo, một bước tiến
          </h1>
          <p className="mt-2 font-semibold text-toon-star-soft">
            Chọn một đảo để xem việc sẽ làm.
          </p>
        </header>

        {!selected ? (
          <p className="toon-card p-6 text-center font-toon text-xl font-extrabold text-toon-ink">
            Chưa có cấp nghề được công bố.
          </p>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section
              aria-label="Các đảo trong lộ trình"
              className="relative min-w-0 rounded-[28px] border-[3px] border-toon-night-deep bg-toon-night-soft/40 px-2 py-6"
            >
              {/* Đường mòn nét đứt nối các đảo theo thứ tự cấp. */}
              <svg
                aria-hidden
                className="pointer-events-none absolute inset-0 size-full"
                viewBox={`0 0 100 ${rows * 100}`}
                preserveAspectRatio="none"
              >
                <path
                  d={o.levels
                    .map((_, i) => {
                      const p = spot(i);
                      const y = p.y * 100 + 42;
                      if (i === 0) return `M${p.x} ${y}`;
                      const q = spot(i - 1);
                      return `C${q.x} ${y - 50} ${p.x} ${y - 50} ${p.x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="var(--color-toon-star)"
                  strokeWidth="2.5"
                  strokeDasharray="2 8"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <InkStar
                size={22}
                className="absolute right-6 top-5 animate-toon-wiggle"
              />
              <ol className="relative">
                {o.levels.map((l, i) => {
                  const active = selected.levelNo === l.levelNo;
                  return (
                    <li
                      key={l.levelNo}
                      className="flex"
                      style={{
                        justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end',
                        paddingInline: '6%',
                      }}
                    >
                      <button
                        type="button"
                        aria-pressed={active}
                        aria-controls="level-details"
                        onClick={() => {
                          enrol.reset();
                          setParams(
                            { level: String(l.levelNo) },
                            { replace: true },
                          );
                        }}
                        className={cn(
                          'group flex w-40 max-w-[46%] flex-col items-center rounded-2xl p-2 text-center transition-transform focus-visible:outline-none focus-visible:shadow-toon-focus sm:w-48',
                          active ? 'scale-105' : 'hover:-translate-y-1',
                        )}
                      >
                        <CareerIsland
                          levelNo={l.levelNo}
                          color={color}
                          active={active || l.access === 'ENROLLED'}
                          locked={l.access === 'LOCKED'}
                        />
                        <span
                          className={cn(
                            'mt-1 inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-0.5 font-toon text-xs font-extrabold',
                            active
                              ? 'border-toon-ink bg-toon-star text-toon-ink'
                              : 'border-toon-night-line bg-toon-night text-toon-paper',
                          )}
                        >
                          {l.access === 'LOCKED' && (
                            <LockKeyhole
                              size={11}
                              strokeWidth={2.8}
                              aria-hidden
                            />
                          )}
                          {l.access === 'COMPLETED' && (
                            <Check size={11} strokeWidth={3} aria-hidden />
                          )}
                          Cấp {l.levelNo}
                        </span>
                        <span className="mt-1 text-sm font-bold leading-tight">
                          {l.title}
                        </span>
                        <span className="sr-only">
                          {ACCESS[l.access].label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>

            <article
              id="level-details"
              aria-label={`Chi tiết cấp ${selected.levelNo}`}
              className="toon-card relative min-w-0 p-5 pt-7 text-toon-ink shadow-toon-lg sm:p-7 sm:pt-8 lg:sticky lg:top-24"
            >
              <span className="absolute -top-4 left-5 inline-flex -rotate-2 items-center gap-1.5 rounded-xl border-[3px] border-toon-ink bg-toon-star px-3 py-0.5 font-toon text-sm font-extrabold shadow-toon-sm">
                Cấp {selected.levelNo} ·{' '}
                {formatYears(selected.years, { short: true })}
              </span>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-toon text-2xl font-extrabold leading-tight sm:text-3xl">
                  {selected.title}
                </h2>
                <ToonBadge tone={ACCESS[selected.access].tone}>
                  {ACCESS[selected.access].label}
                </ToonBadge>
              </div>
              {selected.coreOutput && (
                <details className="mt-2 text-sm font-semibold text-toon-ink-soft">
                  <summary className="w-fit cursor-pointer rounded-md underline decoration-dotted underline-offset-4">
                    Trách nhiệm ở cấp này
                  </summary>
                  <p className="mt-1.5 leading-relaxed">
                    {selected.coreOutput}
                  </p>
                </details>
              )}

              <h3 className="mb-2 mt-5 font-toon text-lg font-extrabold">
                Việc bạn sẽ làm
              </h3>
              {selected.tasks.length ? (
                <ul className="space-y-2">
                  {selected.tasks.slice(0, 3).map((t, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-[15px] font-semibold leading-snug"
                    >
                      <span
                        aria-hidden
                        className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border-2 border-toon-ink bg-toon-sky font-toon text-xs font-extrabold"
                      >
                        {i + 1}
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-toon-ink-faint">
                  Chưa có mô tả công việc.
                </p>
              )}

              <h3 className="mb-2 mt-5 font-toon text-lg font-extrabold">
                Điều kiện vào cấp
              </h3>
              {record.isError ? (
                <LoadError
                  error={record.error}
                  retry={() => void record.refetch()}
                />
              ) : !tiers ? (
                <p role="status" className="text-sm text-toon-ink-faint">
                  Đang đối chiếu hồ sơ kỹ năng…
                </p>
              ) : needs.length === 0 ? (
                <p className="text-sm font-semibold text-toon-ink-soft">
                  Không yêu cầu bậc kỹ năng mềm.
                </p>
              ) : (
                <>
                  <ul className="space-y-2 text-sm font-semibold">
                    {needs.map(({ id, name }) => {
                      const need = selected.requirement[id] ?? 0;
                      const met = tiers[id] >= need;
                      return (
                        <li key={id} className="flex items-center gap-2">
                          {met ? (
                            <Check
                              size={17}
                              strokeWidth={3}
                              className="text-toon-mint-deep"
                              aria-hidden
                            />
                          ) : (
                            <Circle
                              size={17}
                              strokeWidth={2.6}
                              className="text-toon-ink-faint"
                              aria-hidden
                            />
                          )}
                          <span>
                            {name}: bậc {tiers[id]}/{need}{' '}
                            <span className="text-toon-ink-faint">
                              · {met ? 'Đã đủ' : `Còn ${need - tiers[id]} bậc`}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <details className="mt-2">
                    <summary className="w-fit cursor-pointer rounded-md text-sm font-bold underline decoration-dotted underline-offset-4">
                      Xem biểu đồ kỹ năng
                    </summary>
                    <div className="mt-2 rounded-2xl border-2 border-toon-ink bg-toon-night p-2 text-toon-paper">
                      <RadarChart
                        axes={profile.SOFT_SKILL_GROUPS.map((s) => ({
                          key: s.id,
                          label: s.short,
                        }))}
                        values={tiers}
                        overlay={selected.requirement}
                        size={360}
                        label={`Kỹ năng của bạn và yêu cầu cấp ${selected.levelNo}`}
                      />
                      <p className="px-2 pb-1 text-xs text-toon-star-soft">
                        Vùng vàng: bậc bạn đã đạt. Nét đứt: bậc cấp này cần.
                      </p>
                    </div>
                  </details>
                </>
              )}

              {selected.lockedReason && (
                <p className="mt-4 flex items-start gap-2 rounded-xl border-2 border-toon-ink bg-[#ffe4a3] px-3 py-2 text-sm font-bold">
                  <LockKeyhole
                    size={16}
                    strokeWidth={2.6}
                    className="mt-0.5 shrink-0"
                    aria-hidden
                  />
                  {selected.lockedReason}
                </p>
              )}
              {(!o.playable || selected.questCount === 0) && (
                <p className="mt-4 flex items-start gap-2 rounded-xl border-2 border-dashed border-toon-ink/50 px-3 py-2 text-sm font-semibold text-toon-ink-soft">
                  <Sparkles
                    size={16}
                    strokeWidth={2.6}
                    className="mt-0.5 shrink-0"
                    aria-hidden
                  />
                  Cấp này chưa có màn chơi được xuất bản.
                </p>
              )}

              <ToonButton
                size="lg"
                block
                className="mt-5"
                onClick={enter}
                disabled={blocked}
                aria-describedby={
                  selected.access === 'LOCKED'
                    ? 'level-locked-reason'
                    : undefined
                }
                loading={enrol.isPending}
                rightIcon={<ArrowRight size={18} strokeWidth={2.8} />}
              >
                {selected.access === 'LOCKED'
                  ? 'Chưa mở cấp này'
                  : selected.enrolmentId
                    ? 'Đến đảo'
                    : `Vào cấp ${selected.levelNo}`}
              </ToonButton>
              {selected.access === 'LOCKED' && (
                <p
                  id="level-locked-reason"
                  className="mt-2 text-sm font-semibold text-toon-ink-faint"
                >
                  {selected.lockedReason ??
                    'Hoàn thành cấp trước và kiểm tra các điều kiện đầu vào.'}
                </p>
              )}
              {enrol.isError && actionLevel === selected.levelNo && (
                <p
                  role="alert"
                  className="mt-3 rounded-xl border-2 border-toon-ink bg-toon-coral-light px-3 py-2 text-sm font-bold"
                >
                  {errorText(enrol.error)}
                </p>
              )}

              <div className="mt-6">
                <PaperSection
                  title="Kỹ năng nghề"
                  icon={<Gift size={20} strokeWidth={2.6} />}
                >
                  <h4 className="font-toon text-base font-extrabold">
                    Cần có khi vào cấp
                  </h4>
                  <Keywords
                    items={selected.entryKeywords}
                    empty="Không yêu cầu kỹ năng nghề đầu vào."
                  />
                  <h4 className="font-toon text-base font-extrabold">
                    Hoàn thành cấp này sẽ nhận
                  </h4>
                  <Keywords items={selected.outputKeywords} />
                  <KeywordLegend />
                </PaperSection>
              </div>
              <Link
                to={`/occupations/${code}`}
                className={toonButtonClasses({
                  variant: 'ghost',
                  block: true,
                  className: 'mt-3',
                })}
              >
                Về hồ sơ nghề
              </Link>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
