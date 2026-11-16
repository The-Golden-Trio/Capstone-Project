/**
 * Tổng kết một ca: điểm màn 0–100 và kết cục, ba phần nhận xét riêng
 * (FR-07), điểm cộng trừ từng nhóm soft skill gồm phần chòm sao, khoảnh
 * khắc lên bậc (khối D), keyword nhận được, rồi kể lại ca theo truyện.
 */
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookMarked,
  Lightbulb,
  MessageSquareQuote,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import { profile } from '@datn/game-core';
import {
  Badge,
  Callout,
  EmptyState,
  LoadingBlock,
  Medal,
  Panel,
  PanelHeader,
  RingProgress,
  Skeleton,
  Sparkle,
  StarDivider,
  Timeline,
  buttonClasses,
  cn,
  ENDING_TONES,
} from '@datn/ui';
import { errorText, useMe, useRunSummary } from '../../api/hooks';
import type { RunSummary, SoftSkillDelta } from '../../api/types';

export default function SummaryPage() {
  const { runId = '' } = useParams();
  const summary = useRunSummary(runId);
  const me = useMe();

  if (summary.isLoading)
    return (
      <LoadingBlock text="Đang tổng kết ca làm…" className="min-h-[60vh]" />
    );
  if (!summary.data) {
    return (
      <EmptyState
        className="my-20"
        title="Chưa có tổng kết"
        description={errorText(summary.error)}
      />
    );
  }
  const s = summary.data;
  const sign = profile.zodiacOf(me.data?.dateOfBirth);
  const back = s.enrolmentId
    ? `/islands/${s.enrolmentId}`
    : s.occupationCode
      ? `/occupations/${s.occupationCode}`
      : '/galaxy';
  const tierUps = s.grade.softSkills.filter((d) => d.tierAfter > d.tierBefore);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        to={back}
        className="inline-flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink"
      >
        <ArrowLeft size={16} aria-hidden /> Về đảo
      </Link>
      <header className="mt-4 text-center">
        <p className="eyebrow">Tổng kết ca làm</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{s.title}</h1>
        {s.occupationName && (
          <p className="mt-2 text-sm text-ink-faint">
            {s.occupationName}
            {s.levelNo ? ` · cấp ${s.levelNo}` : ''}
          </p>
        )}
      </header>

      <GradeBlock s={s} />

      {tierUps.length > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {tierUps.map((d) => (
            <div
              key={d.id}
              className="glass flex animate-rise items-center gap-4 rounded-xl border-line-gold p-4 shadow-glow"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-gold-900/60 font-display text-2xl font-bold text-gold-200">
                {d.tierAfter}
              </span>
              <p className="text-sm">
                <span className="block text-gold-100">Lên bậc!</span>
                <b className="text-ink">
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
                  ? `Nhóm có ★ được chòm sao ${sign.name} cộng thêm 12% phần điểm cộng.`
                  : null,
              ]
                .filter(Boolean)
                .join(' ') || undefined
            }
          />
          <ul className="divide-y divide-line/60">
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
        <Panel className="mt-6" frame>
          <PanelHeader eyebrow="Xong cấp" title="Kỹ năng nghề bạn nhận được" />
          <ul className="flex flex-wrap gap-4">
            {s.grade.keywordsGained.map((k) => (
              <li key={k.id} className="flex items-center gap-2">
                <Medal level={k.level} size={36} />
                <span className="text-sm">
                  <span className="block font-semibold">{k.name}</span>
                  <span className="text-xs text-ink-faint">
                    {['', 'Làm quen', 'Thành thạo', 'Chuyên sâu'][k.level]}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <StarDivider className="my-10" />
      <Story s={s} />

      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to={back} className={buttonClasses({ size: 'lg' })}>
          Về đảo của cấp này
        </Link>
        {s.occupationCode && (
          <Link
            to={`/occupations/${s.occupationCode}/levels`}
            className={buttonClasses({ variant: 'secondary', size: 'lg' })}
          >
            Xem lộ trình nghề
          </Link>
        )}
      </div>
    </div>
  );
}

function GradeBlock({ s }: { s: RunSummary }) {
  const g = s.grade;
  if (g.status === 'PENDING') {
    return (
      <Panel className="mt-8" aria-busy>
        <div className="flex flex-col items-center gap-4 py-6 text-center sm:flex-row sm:text-left">
          <Skeleton variant="circle" className="size-28" />
          <div className="flex-1 space-y-2">
            <p className="font-semibold text-gold-100">
              Ba giám khảo AI đang đọc câu trả lời của bạn
            </p>
            <p className="text-sm text-ink-muted">
              Thường mất vài giây. Bạn có thể xem lại diễn biến ca bên dưới
              trong lúc chờ.
            </p>
          </div>
        </div>
      </Panel>
    );
  }
  if (g.status === 'NOT_AVAILABLE') {
    return (
      <Callout tone="info" title="Ca này chưa có điểm" className="mt-8">
        Bộ chấm cho dạng ca làm này chưa bật. Dưới đây là diễn biến ca của bạn;
        điểm sẽ được tính lại từ chính những gì bạn đã làm khi bộ chấm sẵn sàng.
      </Callout>
    );
  }
  const ending = g.ending ? ENDING_TONES[g.ending.type] : null;
  return (
    <section
      className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]"
      aria-label="Kết quả"
    >
      <div className="glass flex flex-col items-center justify-center gap-3 rounded-xl p-6">
        <RingProgress
          value={g.score ?? 0}
          size={150}
          stroke={9}
          label="Điểm màn"
        >
          <span>
            <span className="block font-display text-5xl font-semibold text-gilded">
              {g.score ?? '–'}
            </span>
            <span className="text-xs text-ink-faint">/ 100</span>
          </span>
        </RingProgress>
        {ending && (
          <Badge
            tone="neutral"
            className="border-current"
            icon={<Sparkle size={10} />}
          >
            <span style={{ color: ending.color }}>{ending.name}</span>
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {g.ending && (
          <div>
            <h2 className="text-xl">{g.ending.title}</h2>
            <p className="mt-1 text-ink-muted">{g.ending.text}</p>
          </div>
        )}
        {g.feedback && (
          <div className="grid gap-3 md:grid-cols-3">
            <FeedbackCard
              icon={<Target size={16} />}
              title="Kết quả"
              text={g.feedback.result}
            />
            <FeedbackCard
              icon={<MessageSquareQuote size={16} />}
              title="Nhận xét"
              text={g.feedback.comment}
            />
            <FeedbackCard
              icon={<Lightbulb size={16} />}
              title="Hướng cải thiện"
              text={g.feedback.improve}
              highlight
            />
          </div>
        )}
        <Callout tone="ai">
          Kết quả chỉ để bạn tham khảo, không gửi cho trường hay nhà tuyển dụng.
        </Callout>
      </div>
    </section>
  );
}

function FeedbackCard({
  icon,
  title,
  text,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  highlight?: boolean;
}) {
  return (
    <article
      className={cn(
        'rounded-lg border p-4',
        highlight
          ? 'border-line-gold bg-gold-900/25'
          : 'border-line bg-night-800/50',
      )}
    >
      <h3 className="flex items-center gap-2 font-sans text-sm font-bold text-gold-200">
        {icon} {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p>
    </article>
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
    <li className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
      <span className="min-w-0 flex-1 text-sm font-semibold text-ink">
        {group.name}{' '}
        {starred && (
          <span className="text-gold-300" title="Được chòm sao cộng thêm">
            ★
          </span>
        )}
      </span>
      <span
        className={cn(
          'tabular text-sm font-bold',
          up ? 'text-success' : 'text-danger',
        )}
      >
        {up ? '+' : '−'}
        {Math.abs(d.delta).toLocaleString('vi-VN')}
      </span>
      {d.zodiacBonus > 0 && (
        <span className="text-xs text-gold-300">
          gồm +{d.zodiacBonus} từ {signName}
        </span>
      )}
      <span className="tabular w-full text-xs text-ink-faint sm:w-auto">
        {d.pointsAfter.toLocaleString('vi-VN')} / 10.000 · Bậc {prog.tier}
        {prog.nextAt
          ? ` · bậc ${prog.tier + 1} ở ${prog.nextAt.toLocaleString('vi-VN')}`
          : ''}
      </span>
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
    <section
      aria-labelledby="story-title"
      className="grid gap-6 lg:grid-cols-2"
    >
      <div className="lg:col-span-2">
        <h2 id="story-title" className="flex items-center gap-2 text-2xl">
          <BookMarked size={22} className="text-gold-300" aria-hidden /> Nhìn
          lại ca làm
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Kết thúc lúc {st.endedAt}.{' '}
          {st.hintsUsed > 0
            ? `Bạn đã dùng ${st.hintsUsed} gợi ý.`
            : 'Bạn không dùng gợi ý nào.'}
        </p>
      </div>

      <Panel>
        <PanelHeader level={3} title="Việc bạn đã làm" />
        {st.actions.length ? (
          <Timeline
            items={st.actions.map((a) => ({
              time: a.time,
              title: a.label,
              body: a.cut
                ? 'Bị chen ngang giữa chừng'
                : `${a.points} điểm thời gian`,
            }))}
          />
        ) : (
          <p className="text-sm text-ink-faint">
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
                <time className="tabular w-11 shrink-0 text-xs text-gold-300">
                  {f.time}
                </time>
                <span className="text-ink-muted">{f.text}</span>
              </li>
            ))}
          </ul>
        </Panel>
        {st.promises.length > 0 && (
          <Panel>
            <PanelHeader level={3} title="Lời hẹn trong ca" />
            <ul className="space-y-2 text-sm">
              {st.promises.map((p, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <span>{p.label}</span>
                  <Badge
                    tone={
                      p.status === 'kept'
                        ? 'success'
                        : p.status === 'late'
                          ? 'danger'
                          : 'muted'
                    }
                  >
                    {PROMISE[p.status] ?? p.status}
                  </Badge>
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
                <li key={i} className="flex items-start justify-between gap-3">
                  <span>
                    <b className="capitalize">{c.person}</b>:{' '}
                    <span className="text-ink-muted">{c.text}</span>
                  </span>
                  <Badge tone={c.resolved ? 'success' : 'muted'}>
                    {c.resolved ? 'Đã gỡ' : 'Còn đó'}
                  </Badge>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>

      {st.artefacts.length > 0 && (
        <div className="lg:col-span-2">
          <h3 className="mb-3 text-lg">Những gì bạn đã viết</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {st.artefacts.map((a, i) => (
              <article key={i} className="paper rounded-lg p-5">
                <h4 className="font-display text-base font-semibold text-paper-ink first-letter:uppercase">
                  {a.title}
                </h4>
                {a.fields.map((f, j) => (
                  <div key={j} className="mt-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-paper-ink/55">
                      {f.label}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-paper-ink">
                      {f.text || '—'}
                    </p>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </div>
      )}

      {st.review.length > 0 && (
        <Panel className="lg:col-span-2">
          <PanelHeader level={3} title="Hỏi lại sau ca" />
          <ul className="space-y-4 text-sm">
            {st.review.map((r, i) => (
              <li key={i}>
                <p className="text-ink-muted">
                  <b className="capitalize text-ink">{r.person}</b>:{' '}
                  {r.question}
                </p>
                <p className="mt-1 rounded-md border-l-2 border-gold-500/60 bg-gold-900/20 px-3 py-2 text-gold-100">
                  {r.answer}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <p className="flex items-center justify-center gap-2 text-xs text-night-300 lg:col-span-2">
        <Sparkles size={12} aria-hidden /> Chơi lại cấp này với công ty khác,
        điểm giữ kết quả cao nhất.
        <RotateCcw size={12} aria-hidden />
      </p>
    </section>
  );
}
