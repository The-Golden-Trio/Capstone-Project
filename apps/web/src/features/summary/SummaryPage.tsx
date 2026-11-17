/**
 * Tổng kết một ca: điểm màn 0–100 và kết cục, ba phần nhận xét riêng
 * (FR-07), điểm cộng trừ từng nhóm soft skill gồm phần chòm sao, khoảnh
 * khắc lên bậc (khối D), keyword nhận được, rồi kể lại ca theo truyện.
 */
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Lightbulb,
  MessageSquareQuote,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import { profile } from '@datn/game-core';
import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import {
  Character,
  SceneBackdrop,
  ToonBadge,
  ToonPanel,
  ToonProgress,
  cn,
  toonButtonClasses,
  ENDING_TONES,
} from '@datn/ui';
import { errorText, useMe, useRun, useRunSummary } from '../../api/hooks';
import { sourceOf } from '../../api';
import { castCharacters, TOON_BACKDROPS } from '../../lib/toon';
import type { RunSummary, SoftSkillDelta } from '../../api/types';

export default function SummaryPage() {
  const { runId = '' } = useParams();
  const summary = useRunSummary(runId);
  const me = useMe();
  const run = useRun(runId);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const focusedRun = useRef<string | null>(null);
  const ready = Boolean(summary.data);
  useEffect(() => {
    if (!ready || focusedRun.current === runId || !titleRef.current) return;
    titleRef.current.focus({ preventScroll: true });
    focusedRun.current = runId;
  }, [ready, runId]);

  if (summary.isLoading)
    return <SummaryNotice loading title="Đang tổng kết ca làm…" />;
  if (!summary.data)
    return (
      <SummaryNotice title="Chưa có tổng kết" text={errorText(summary.error)} />
    );
  const s = summary.data;
  const sign = profile.zodiacOf(me.data?.dateOfBirth);
  const back = s.enrolmentId
    ? `/islands/${s.enrolmentId}`
    : s.occupationCode
      ? `/occupations/${s.occupationCode}`
      : '/galaxy';
  const host = run.data?.cast[0];
  const hostLook = host
    ? castCharacters(run.data?.cast ?? []).get(host.slot)
    : undefined;
  // Ca xem thử không cộng vào hồ sơ nên không báo "lên bậc".
  const tierUps = s.enrolmentId
    ? s.grade.softSkills.filter((d) => d.tierAfter > d.tierBefore)
    : [];

  return (
    <div className="theme-toon relative isolate min-h-dvh">
      {/* Giữ bối cảnh theo viewport, không phóng to ảnh theo chiều dài báo cáo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
      >
        <SceneBackdrop
          src={TOON_BACKDROPS.office}
          dim={0.95}
          className="size-full"
        />
      </div>
      <header className="border-b-[3px] border-toon-ink bg-toon-paper">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            to={back}
            aria-label="Về đảo"
            className="grid size-11 shrink-0 place-items-center rounded-full border-[3px] border-toon-ink bg-toon-cream shadow-toon-sm focus-visible:outline-none focus-visible:shadow-toon-focus"
          >
            <ArrowLeft size={20} strokeWidth={2.8} aria-hidden />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="font-toon text-xl font-extrabold text-toon-ink">
              Tổng kết ca làm
            </p>
            <p className="truncate text-sm font-bold text-toon-ink-soft">
              {s.occupationName}
              {s.levelNo ? ` · cấp ${s.levelNo}` : ''}
            </p>
          </div>
          {sourceOf('play') === 'demo' && (
            <span className="shrink-0 rounded-full border-2 border-toon-ink bg-[#ffe4a3] px-3 py-1 text-xs font-extrabold text-toon-ink">
              Dữ liệu mẫu
            </span>
          )}
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl items-start gap-5 px-4 py-4 sm:px-6 lg:grid-cols-[160px_minmax(0,1fr)] lg:py-6">
        {host && hostLook ? (
          <aside
            aria-label="Đồng nghiệp cuối ca"
            className="sticky top-8 hidden min-w-0 self-start lg:block"
          >
            <div className="mt-7 flex justify-center">
              <Character
                src={hostLook.src}
                name={host.name}
                height={240}
                flip={hostLook.facing === 'left'}
                motion="none"
              />
            </div>
          </aside>
        ) : (
          <div className="hidden lg:block" />
        )}
        <article className="toon-card min-w-0 p-4 shadow-toon-lg sm:p-7">
          <header className="text-center">
            <p className="font-toon text-sm font-extrabold uppercase tracking-widest text-toon-ink-soft">
              Báo cáo cuối ca
            </p>
            <h1
              ref={titleRef}
              tabIndex={-1}
              className="mt-1 font-toon text-2xl font-extrabold leading-tight text-toon-ink focus:outline-none focus-visible:outline-none sm:text-3xl"
            >
              {s.title}
            </h1>
          </header>

          <GradeBlock s={s} />

          <details
            open
            className="mt-5 rounded-2xl border-[3px] border-toon-ink bg-toon-paper p-4"
          >
            <summary className="cursor-pointer rounded font-toon text-lg font-bold focus-visible:shadow-toon-focus">
              Kỹ năng
            </summary>
            {tierUps.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {tierUps.map((d) => (
                  <div
                    key={d.id}
                    className="flex animate-toon-pop items-center gap-4 rounded-2xl border-[3px] border-toon-ink bg-toon-mint p-4 shadow-toon-sm"
                  >
                    <span className="grid size-14 shrink-0 place-items-center rounded-full border-[3px] border-toon-ink bg-toon-mustard font-toon text-2xl font-extrabold text-toon-ink">
                      {d.tierAfter}
                    </span>
                    <p className="text-sm">
                      <span className="block font-toon text-lg font-extrabold text-toon-ink">
                        Lên bậc!
                      </span>
                      <b className="text-toon-ink">
                        {profile.softSkillGroup(d.id).name}
                      </b>{' '}
                      lên bậc {d.tierAfter}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {s.grade.status === 'READY' && s.grade.softSkills.length > 0 && (
              <Panel className="mt-6">
                <PanelHeader
                  eyebrow="Kỹ năng mềm"
                  title="Điểm cộng trừ trong ca này"
                  description={
                    [
                      s.enrolmentId
                        ? null
                        : 'Ca xem thử: điểm chỉ để bạn thấy cách tính, không cộng vào hồ sơ.',
                      sign
                        ? `Nhóm có ★ được chòm sao ${sign.name} cộng thêm điểm.`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' ') || undefined
                  }
                />
                <ul className="divide-y-2 divide-dashed divide-toon-ink/20">
                  {s.grade.softSkills.map((d) => (
                    <DeltaRow
                      key={d.id}
                      d={d}
                      starred={Boolean(sign?.buffs.includes(d.id))}
                      signName={sign?.name}
                    />
                  ))}
                </ul>
              </Panel>
            )}

            {s.grade.keywordsGained.length > 0 && (
              <Panel className="mt-6">
                <PanelHeader
                  eyebrow="Xong cấp"
                  title="Kỹ năng nghề bạn nhận được"
                />
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {s.grade.keywordsGained.map((k) => (
                    <li
                      key={k.id}
                      className="flex min-w-0 items-start gap-3 rounded-2xl border-[3px] border-toon-ink bg-toon-sky p-3 shadow-toon-sm"
                    >
                      <span
                        aria-hidden
                        className="grid size-10 shrink-0 place-items-center rounded-full border-[3px] border-toon-ink bg-toon-mustard font-toon text-xl font-extrabold"
                      >
                        {k.level}
                      </span>
                      <span className="min-w-0 text-sm">
                        <span className="block font-toon text-base font-extrabold leading-tight">
                          {k.name}
                        </span>
                        <span className="mt-1 block text-xs font-bold text-toon-ink-soft">
                          {
                            ['', 'Làm quen', 'Thành thạo', 'Chuyên sâu'][
                              k.level
                            ]
                          }
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </details>
          <div
            aria-hidden
            className="my-8 border-t-[3px] border-dashed border-toon-ink/30"
          />
          <Story s={s} />

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={back} className={toonButtonClasses({ size: 'lg' })}>
              Về đảo của cấp này
            </Link>
            {s.occupationCode && (
              <Link
                to={`/occupations/${s.occupationCode}/levels`}
                className={toonButtonClasses({
                  variant: 'secondary',
                  size: 'lg',
                })}
              >
                Xem lộ trình nghề
              </Link>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}

function GradeBlock({ s }: { s: RunSummary }) {
  const g = s.grade;
  // Bản demo chấm bằng heuristic mẫu (D-92: không phải đường chấm thay AI).
  const sample = sourceOf('play') === 'demo';
  if (g.status === 'PENDING')
    return (
      <Panel className="mt-8" aria-busy="true">
        <div
          role="status"
          className="flex flex-col items-center gap-4 py-4 text-center sm:flex-row sm:text-left"
        >
          <span
            aria-hidden
            className="grid size-20 shrink-0 place-items-center rounded-full border-[4px] border-toon-ink bg-toon-sand font-toon text-4xl font-extrabold"
          >
            …
          </span>
          <div>
            <p className="font-toon text-xl font-extrabold">
              Ba giám khảo AI đang đọc câu trả lời của bạn
            </p>
            <p className="mt-2 text-sm font-semibold text-toon-ink-soft">
              Thường mất vài giây. Bạn có thể xem lại diễn biến ca bên dưới
              trong lúc chờ.
            </p>
          </div>
        </div>
      </Panel>
    );
  if (g.status === 'NOT_AVAILABLE')
    return (
      <Panel className="mt-8">
        <PanelHeader title="Ca này chưa có điểm" />
        <p className="text-sm font-semibold text-toon-ink-soft">
          Bộ chấm cho dạng ca làm này chưa bật. Dưới đây là diễn biến ca của
          bạn; điểm sẽ được tính lại từ chính những gì bạn đã làm khi bộ chấm
          sẵn sàng.
        </p>
      </Panel>
    );
  const ending = g.ending ? ENDING_TONES[g.ending.type] : null;
  const stamp =
    g.ending?.type === 'BAD'
      ? 'bg-toon-coral-light'
      : g.ending?.type === 'SECRET'
        ? 'bg-toon-lilac'
        : g.ending?.type === 'PARTIAL'
          ? 'bg-toon-mustard'
          : 'bg-toon-mint';
  return (
    <section className="mt-3" aria-label="Kết quả">
      <div className="grid grid-cols-[100px_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
        <div className="flex flex-col items-center gap-2 py-1">
          <div
            role="img"
            aria-label={`Điểm màn: ${g.score ?? 'chưa có'} trên 100`}
            className="grid size-24 sm:size-28 place-items-center rounded-full border-[5px] border-toon-ink bg-toon-mustard shadow-toon"
          >
            <span className="text-center">
              <span className="block font-toon text-4xl sm:text-5xl font-extrabold leading-none text-toon-ink">
                {g.score ?? '–'}
              </span>
              <span className="text-sm font-extrabold text-toon-ink-soft">
                / 100
              </span>
            </span>
          </div>
          {ending && (
            <span
              className={cn(
                '-rotate-3 rounded-xl border-[3px] border-toon-ink px-2 py-0.5 font-toon text-sm font-extrabold shadow-toon-sm',
                stamp,
              )}
            >
              {ending.name}
            </span>
          )}
        </div>
        {g.ending && (
          <div className="min-w-0">
            <h2 className="font-toon text-2xl font-extrabold leading-tight sm:text-3xl">
              {g.ending.title}
            </h2>
            <CompactText text={g.ending.text} />
          </div>
        )}
      </div>
      {sample && (
        <p className="mt-3 text-xs font-extrabold text-toon-ink">
          Điểm mẫu · bản xem thử
        </p>
      )}
      {g.feedback && (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <FeedbackCard
            icon={<Target size={20} />}
            title="Kết quả"
            text={g.feedback.result}
            tone="bg-toon-sky"
          />
          <FeedbackCard
            icon={<MessageSquareQuote size={20} />}
            title="Nhận xét"
            text={g.feedback.comment}
            tone="bg-toon-mint"
          />
          <FeedbackCard
            icon={<Lightbulb size={20} />}
            title="Hướng cải thiện"
            text={g.feedback.improve}
            tone="bg-toon-mustard"
          />
        </div>
      )}
      <div className="mt-3 flex items-start gap-2 text-xs font-semibold text-toon-ink-soft">
        <Sparkles size={20} className="shrink-0" aria-hidden />
        <div>
          <p className="font-bold text-toon-ink">
            {sample
              ? 'Bản xem thử: điểm và nhận xét ở đây là mẫu. Bản chính thức do hội đồng AI chấm.'
              : 'Nội dung hoặc đánh giá này do AI tạo.'}
          </p>
          <p className="mt-1">
            Kết quả chỉ để bạn tham khảo, không gửi cho trường hay nhà tuyển
            dụng.
          </p>
        </div>
      </div>
    </section>
  );
}

function FeedbackCard({
  icon,
  title,
  text,
  tone,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  tone: string;
}) {
  return (
    <article
      className={cn(
        'min-w-0 rounded-2xl border-[3px] border-toon-ink p-3 shadow-toon-sm',
        tone,
      )}
    >
      <h3 className="flex items-start gap-2 font-toon text-lg font-extrabold leading-tight">
        <span aria-hidden className="shrink-0">
          {icon}
        </span>
        {title}
      </h3>
      <CompactText text={text} />
    </article>
  );
}

/** Chỉ đổi cách đọc đoạn dài; phần mở thêm giữ toàn bộ nội dung nhận được. */
function CompactText({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length <= 30)
    return <p className="mt-2 text-sm font-semibold leading-relaxed">{text}</p>;
  return (
    <div className="mt-2 text-sm font-semibold leading-relaxed">
      <p>{words.slice(0, 25).join(' ')}…</p>
      <details className="mt-1">
        <summary className="cursor-pointer rounded font-bold focus-visible:shadow-toon-focus">
          Xem đầy đủ
        </summary>
        <p className="mt-2 whitespace-pre-wrap">{text}</p>
      </details>
    </div>
  );
}

function DeltaRow({
  d,
  starred,
  signName,
}: {
  d: SoftSkillDelta;
  starred: boolean;
  signName?: string;
}) {
  const group = profile.softSkillGroup(d.id);
  const prog = profile.tierProgress(d.pointsAfter, d.tierAfter);
  const up = d.delta >= 0;
  return (
    <li className="py-4">
      <div className="mb-2 flex flex-wrap items-start gap-2">
        <span className="min-w-0 flex-1 font-toon text-base font-extrabold">
          {group.name}{' '}
          {starred && <span title="Được chòm sao cộng thêm">★</span>}
        </span>
        <ToonBadge tone={up ? 'mint' : 'coral'}>
          {up ? '+' : '−'}
          {Math.abs(d.delta).toLocaleString('vi-VN')}
        </ToonBadge>
      </div>
      {d.zodiacBonus > 0 && (
        <p className="mb-2 text-xs font-bold text-toon-ink-soft">
          gồm +{d.zodiacBonus} từ {signName}
        </p>
      )}
      <ToonProgress
        value={prog.ratio}
        max={1}
        tone={up ? 'mint' : 'coral'}
        label={`Tiến độ bậc ${prog.tier} · ${group.name}`}
        labelHidden
      />
      <p className="mt-2 text-xs font-bold tabular-nums text-toon-ink-soft">
        {d.pointsAfter.toLocaleString('vi-VN')} / 10.000 · Bậc {prog.tier}
        {prog.nextAt
          ? ` · bậc ${prog.tier + 1} ở ${prog.nextAt.toLocaleString('vi-VN')}`
          : ''}
      </p>
    </li>
  );
}

const PROMISE: Record<string, string> = {
  open: 'Chưa tới hạn',
  kept: 'Đã giữ lời',
  late: 'Trễ hẹn',
  carried: 'Để lại cuối ca',
};

/** Kể lại ca theo truyện: các nút đã qua, dữ kiện tìm ra, lời hứa, tài liệu, phần "Nhìn lại ca". */
function Story({ s }: { s: RunSummary }) {
  const st = s.story;
  return (
    <div className="space-y-4">
      <details className="rounded-2xl border-[3px] border-toon-ink bg-toon-paper p-4">
        <summary className="cursor-pointer rounded focus-visible:shadow-toon-focus">
          <h2 className="inline font-toon text-xl font-extrabold">
            Nhìn lại ca làm
          </h2>
        </summary>
        <p className="my-3 text-sm text-toon-ink-soft">
          Kết thúc lúc {st.endedAt}.{' '}
          {st.hintsUsed > 0
            ? `Bạn đã dùng ${st.hintsUsed} gợi ý.`
            : 'Bạn không dùng gợi ý nào.'}
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <PanelHeader level={3} title="Việc bạn đã làm" />
            {st.actions.length ? (
              <ol className="ml-2 border-l-[3px] border-toon-ink pl-5">
                {st.actions.map((a, i) => (
                  <li key={i} className="relative pb-5 last:pb-0">
                    <span
                      aria-hidden
                      className="absolute -left-[29px] top-1 size-3.5 rounded-full border-[3px] border-toon-ink bg-toon-mustard"
                    />
                    <time className="font-toon text-sm font-extrabold tabular-nums">
                      {a.time}
                    </time>
                    <p className="mt-1 font-bold">{a.label}</p>
                    <p className="mt-1 text-sm font-semibold text-toon-ink-soft">
                      {a.cut
                        ? 'Bị chen ngang giữa chừng'
                        : `${a.points} điểm thời gian`}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-toon-ink-soft">
                Bạn đi thẳng tới các mốc chính của ca.
              </p>
            )}
          </Panel>

          <div className="flex flex-col gap-6">
            <Panel>
              <PanelHeader
                level={3}
                title="Dữ kiện bạn tìm ra"
                description={
                  st.facts.requiredMissed
                    ? `Còn ${st.facts.requiredMissed} dữ kiện quan trọng bạn chưa mở tới.`
                    : 'Bạn đã mở tới mọi dữ kiện quan trọng.'
                }
              />
              <ul className="space-y-2 text-sm">
                {st.facts.found.map((f, i) => (
                  <li key={i} className="flex gap-3">
                    <time className="tabular w-11 shrink-0 text-xs text-toon-ink">
                      {f.time}
                    </time>
                    <span className="text-toon-ink-soft">{f.text}</span>
                  </li>
                ))}
              </ul>
            </Panel>
            {st.promises.length > 0 && (
              <Panel>
                <PanelHeader level={3} title="Lời hẹn trong ca" />
                <ul className="space-y-2 text-sm">
                  {st.promises.map((p, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3"
                    >
                      <span>{p.label}</span>
                      <ToonBadge
                        className="shrink-0 whitespace-nowrap"
                        tone={
                          p.status === 'kept'
                            ? 'mint'
                            : p.status === 'late'
                              ? 'coral'
                              : 'paper'
                        }
                      >
                        {PROMISE[p.status] ?? p.status}
                      </ToonBadge>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
            {st.concerns.length > 0 && (
              <Panel>
                <PanelHeader level={3} title="Điều đồng nghiệp còn băn khoăn" />
                <ul className="space-y-2 text-sm">
                  {st.concerns.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-3"
                    >
                      <span>
                        <b className="capitalize">{c.person}</b>:{' '}
                        <span className="text-toon-ink-soft">{c.text}</span>
                      </span>
                      <ToonBadge
                        className="shrink-0 whitespace-nowrap"
                        tone={c.resolved ? 'mint' : 'paper'}
                      >
                        {c.resolved ? 'Đã gỡ' : 'Còn đó'}
                      </ToonBadge>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </div>
        </div>
      </details>
      {st.artefacts.length > 0 && (
        <details className="rounded-2xl border-[3px] border-toon-ink bg-toon-paper p-4">
          <summary className="cursor-pointer rounded font-toon text-xl font-extrabold focus-visible:shadow-toon-focus">
            Những gì bạn đã viết
          </summary>
          <div className="grid gap-4 md:grid-cols-2">
            {st.artefacts.map((a, i) => (
              <article
                key={i}
                className="min-w-0 rounded-2xl border-[3px] border-toon-ink bg-toon-cream p-5 shadow-toon-sm"
              >
                <h4 className="font-toon text-lg font-extrabold text-toon-ink first-letter:uppercase">
                  {a.title}
                </h4>
                {a.fields.map((f, j) => (
                  <div key={j} className="mt-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-toon-ink-soft">
                      {f.label}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-toon-ink">
                      {f.text || '—'}
                    </p>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </details>
      )}

      {st.review.length > 0 && (
        <details className="rounded-2xl border-[3px] border-toon-ink bg-toon-paper p-4">
          <summary className="cursor-pointer rounded font-toon text-xl font-extrabold focus-visible:shadow-toon-focus">
            Hỏi lại sau ca
          </summary>
          <ul className="space-y-4 text-sm">
            {st.review.map((r, i) => (
              <li key={i}>
                <p className="text-toon-ink-soft">
                  <b className="capitalize text-toon-ink">{r.person}</b>:{' '}
                  {r.question}
                </p>
                <p className="mt-2 rounded-xl border-[2.5px] border-toon-ink bg-toon-sky px-3 py-2 font-semibold text-toon-ink">
                  {r.answer}
                </p>
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="flex items-center justify-center gap-2 text-xs text-toon-ink-soft lg:col-span-2">
        <Sparkles size={12} aria-hidden /> Chơi lại cấp này với công ty khác,
        điểm giữ kết quả cao nhất.
        <RotateCcw size={12} aria-hidden />
      </p>
    </div>
  );
}

/** Thẻ và tiêu đề dùng thống nhất cho các phần báo cáo. */
function Panel({ children, className, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      {...rest}
      className={cn(
        'min-w-0 rounded-2xl border-[3px] border-toon-ink bg-toon-paper p-4 shadow-toon-sm sm:p-5',
        className,
      )}
    >
      {children}
    </section>
  );
}
function PanelHeader({
  eyebrow,
  title,
  description,
  level = 2,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  level?: 2 | 3;
}) {
  const Heading = level === 3 ? 'h3' : 'h2';
  return (
    <header className="mb-4">
      {eyebrow && (
        <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-toon-ink-soft">
          {eyebrow}
        </p>
      )}
      <Heading className="font-toon text-xl font-extrabold leading-tight">
        {title}
      </Heading>
      {description && (
        <p className="mt-2 text-sm font-semibold leading-relaxed text-toon-ink-soft">
          {description}
        </p>
      )}
    </header>
  );
}
function SummaryNotice({
  title,
  text,
  loading = false,
}: {
  title: string;
  text?: string;
  loading?: boolean;
}) {
  return (
    <SceneBackdrop
      src={TOON_BACKDROPS.office}
      dim={0.95}
      className="theme-toon grid min-h-dvh place-items-center p-4"
    >
      <ToonPanel className="w-full max-w-md" bodyClassName="p-6 text-center">
        <div role={loading ? 'status' : undefined}>
          <h1 className="font-toon text-2xl font-extrabold">{title}</h1>
          {text && (
            <p className="mt-3 text-sm font-semibold text-toon-ink-soft">
              {text}
            </p>
          )}
          {!loading && (
            <Link
              to="/galaxy"
              className={toonButtonClasses({
                variant: 'secondary',
                className: 'mt-5',
              })}
            >
              Về bản đồ
            </Link>
          )}
        </div>
      </ToonPanel>
    </SceneBackdrop>
  );
}
