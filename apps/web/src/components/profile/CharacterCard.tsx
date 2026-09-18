import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { UNLOCK_AT, bandLabel, roleName, shortName } from '@datn/game-core';
import type { ProgressSummary } from '../../api/schemas';
import { DEFAULT_THEME, roleTheme, themeVars } from '../../domain/roleTheme';
import { useT } from '../../i18n/useT';
import { cx } from '../../lib/cx';
import { useAuthStore } from '../../store/authStore';
import { useJourneyStore } from '../../store/journeyStore';
import { Crest } from '../game/Crest';

/** Một phần của thanh cơ cấu điểm: màu, nhãn, giá trị. */
interface Segment {
  key: 'hard' | 'soft' | 'side';
  label: string;
  value: number;
  bar: string;
  dot: string;
}

function Composition({ segments, total }: { segments: Segment[]; total: number }) {
  const t = useT();
  return (
    <div>
      <div
        className="flex h-[10px] overflow-hidden rounded-full bg-inset"
        role="img"
        aria-label={segments.map((s) => `${s.label} ${s.value}`).join(', ')}
      >
        {total > 0 &&
          segments
            .filter((s) => s.value > 0)
            .map((s) => (
              <i
                key={s.key}
                className={cx('block h-full', s.bar)}
                style={{ width: `${(s.value / total) * 100}%` }}
              />
            ))}
      </div>

      {total > 0 ? (
        <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
          {segments.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5 font-mono text-[10.5px]">
              <i className={cx('block h-2 w-2 rounded-full', s.dot)} />
              <span className="tabular-nums font-bold text-ink">{s.value}</span>
              <span className="text-muted">{s.label}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 mt-2.5 text-[12px] leading-snug text-muted">
          {t('profile.noPointsYet')}
        </p>
      )}
    </div>
  );
}

/**
 * Thẻ nhân vật — dòng đầu của Hành trang.
 *
 * Gom lại những gì trước đây rải ở ba ô đường dẫn và sáu ô số: bạn là ai,
 * đang đứng ở đâu, có bao nhiêu điểm và điểm đó đến từ đâu. Một con số to
 * (tổng điểm) và một thanh chia ba màu (cứng / mềm / nhiệm vụ phụ) trả lời
 * cả hai câu chỉ trong một lần nhìn; các ô riêng lẻ bắt người đọc tự cộng.
 */
export function CharacterCard({
  summary,
  quizDone,
  eventsPlayed,
}: {
  summary: ProgressSummary | null;
  quizDone: boolean;
  eventsPlayed: number;
}) {
  const t = useT();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const journey = useJourneyStore();

  // "Đang ở" ưu tiên nơi vừa ghé trên bản đồ; chưa ghé đâu (tải lại trang,
  // máy khác) thì lấy nghề đã có điểm và cấp bậc cao nhất đã ghi điểm ở đó —
  // hồ sơ không nên nói "chưa đặt chân" với người vừa chơi xong một màn.
  const fallbackRole = summary?.roles[0];
  const fallbackBand =
    [...(fallbackRole?.bands ?? [])].reverse().find((b) => b.points > 0)?.band ??
    fallbackRole?.bands.find((b) => b.unlocked)?.band ??
    null;
  const roleCode = journey.roleCode ?? fallbackRole?.roleCode ?? null;
  const band = journey.roleCode ? journey.band : fallbackBand;

  const theme = roleCode ? roleTheme(roleCode) : DEFAULT_THEME;

  // Cấp bậc đang đứng và cấp kế — cùng phép tính với thanh XP dưới đáy.
  const role = summary?.roles.find((r) => r.roleCode === roleCode);
  const bands = role?.bands ?? [];
  const currentIndex = bands.findIndex((b) => b.band === band);
  const current = currentIndex >= 0 ? bands[currentIndex] : null;
  const next = currentIndex >= 0 ? bands[currentIndex + 1] : null;
  const pct = current ? Math.min(100, (current.points / UNLOCK_AT) * 100) : 0;

  const total = summary?.totalPoints ?? 0;
  const segments: Segment[] = [
    {
      key: 'hard',
      label: t('profile.hardSkills'),
      value: summary?.hardPoints ?? 0,
      bar: 'bg-skill-hard',
      dot: 'bg-skill-hard',
    },
    {
      key: 'soft',
      label: t('profile.softSkills'),
      value: summary?.softPoints ?? 0,
      bar: 'bg-skill-soft',
      dot: 'bg-skill-soft',
    },
    {
      key: 'side',
      label: t('dash.sideQuests'),
      value: summary?.sideQuestPoints ?? 0,
      bar: 'bg-gold',
      dot: 'bg-gold',
    },
  ];

  const facts = [
    { value: summary?.runsCompleted ?? 0, label: t('profile.mainQuests') },
    { value: eventsPlayed, label: t('dash.sideQuests') },
    { value: quizDone ? '✓' : '—', label: t('profile.quizDone') },
  ];

  return (
    <section
      className="relative overflow-hidden rounded-[14px] border border-line bg-surf"
      style={themeVars(theme) as CSSProperties}
    >
      {/* Quầng sáng theo màu nghề đang ở — thẻ đổi sắc theo nơi bạn đứng. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: 'var(--accent-soft)' }}
      />

      <div className="relative grid gap-6 p-5 sm:p-6 md:[grid-template-columns:minmax(0,1.15fr)_minmax(280px,1fr)]">
        {/* ── Bạn là ai ── */}
        <div className="flex min-w-0 gap-4">
          <div
            className="inline-grid h-fit shrink-0 self-start rounded-full p-[3px]"
            style={{
              boxShadow: '0 0 0 2px var(--accent-soft), 0 0 28px -6px var(--accent-glow)',
            }}
          >
            <Crest seed={user?.id ?? 'khach'} size={64} active />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="m-0 truncate font-display text-[22px] font-semibold leading-tight text-ink">
              {user?.displayName ?? t('hud.guest')}
            </h2>

            <p className="m-0 mt-1 flex flex-wrap items-baseline gap-x-1.5 text-[12.5px] leading-snug">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
                {t('profile.position')}
              </span>
              {roleCode && band ? (
                <span className="text-ink-2">
                  <b className="font-semibold text-[var(--accent)]">
                    {shortName(roleName(roleCode))}
                  </b>
                  <span className="text-muted"> · </span>
                  <span className="font-mono">{band}</span> {bandLabel(band)}
                </span>
              ) : (
                <span className="text-muted">{t('profile.noPosition')}</span>
              )}
            </p>

            <ul className="mt-3.5 flex flex-wrap gap-2">
              {facts.map((f) => (
                <li
                  key={f.label}
                  className="flex items-baseline gap-1.5 rounded-[8px] border border-line-2 bg-panel px-2.5 py-1.5"
                >
                  <span className="font-display text-[15px] font-bold leading-none tabular-nums text-ink">
                    {f.value}
                  </span>
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted">
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate('/quiz')}
                className="action-card inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-panel px-3 py-1.5 text-[12px] text-ink-2"
              >
                <span aria-hidden="true">◑</span>
                {quizDone ? t('profile.retakeQuiz') : t('nav.quiz')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/account')}
                className="action-card inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-panel px-3 py-1.5 text-[12px] text-ink-2"
              >
                <span aria-hidden="true">⚙</span>
                {t('nav.account')}
              </button>
            </div>
          </div>
        </div>

        {/* ── Điểm: bao nhiêu, từ đâu, còn bao xa ── */}
        <div className="rounded-[12px] border border-line-2 bg-panel/80 p-4 sm:p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="block font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
                {t('dash.skillPoints')}
              </span>
              <span className="block font-display text-[44px] font-bold leading-none tabular-nums text-gold-2">
                {total}
              </span>
            </div>
            <span className="pb-1 text-right font-mono text-[10px] leading-snug text-muted">
              {t('profile.serverScored')}
            </span>
          </div>

          <div className="mt-4">
            <span className="mb-2 block font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
              {t('profile.breakdown')}
            </span>
            <Composition segments={segments} total={total} />
          </div>

          {current && next && (
            <div className="mt-5 border-t border-line-2 pt-4">
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
                  {next.unlocked ? (
                    <b className="font-semibold text-good">
                      {t('profile.nextUnlocked', { band: next.band })}
                    </b>
                  ) : (
                    <>
                      {t('hud.toward')}{' '}
                      <b className="font-semibold text-[var(--accent)]">{next.band}</b>{' '}
                      {bandLabel(next.band)}
                    </>
                  )}
                </span>
                <span className="font-mono text-[10.5px] font-semibold tabular-nums text-ink-2">
                  {current.points}
                  <span className="text-muted">/{UNLOCK_AT}</span>
                </span>
              </div>
              <div className="xp-track">
                <i className="xp-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
