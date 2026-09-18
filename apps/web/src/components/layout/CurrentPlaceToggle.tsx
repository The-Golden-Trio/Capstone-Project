import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  bandLabel,
  eventsForRole,
  findRole,
  findScenario,
  shortRoleName,
} from '@datn/game-core';
import { Crest } from '../game/Crest';
import { roleTheme, themeVars } from '../../domain/roleTheme';
import { cx } from '../../lib/cx';
import { useJourneyStore } from '../../store/journeyStore';
import { useProfileStore } from '../../store/profileStore';
import { useProgressStore } from '../../store/progressStore';
import { useT } from '../../i18n/useT';

/**
 * "Đang ở" — nơi người chơi đang đứng, nay nằm trên thanh đầu trang.
 *
 * Trước đây đây là một mục nằm lẫn giữa danh sách điều hướng ở thanh bên, nên
 * thứ quan trọng nhất ("mày đang dở việc ở đây") trông ngang hàng với mấy mục
 * tĩnh khác. Đưa lên đầu trang và cho nó nhịp sáng thì mắt bắt được ngay, và
 * bấm vào là mở ra còn dở những gì.
 */
export function CurrentPlaceToggle() {
  const navigate = useNavigate();
  const t = useT();
  const { roleCode, band } = useJourneyStore();
  const doneEventIds = useProfileStore((s) => s.doneEventIds);
  const runs = useProgressStore((s) => s.runs);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Bấm ra ngoài hoặc bấm Esc thì đóng — cư xử như mọi menu thả xuống khác.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const role = findRole(roleCode);
  if (!role || !band) return null;

  const theme = roleTheme(role.role_code);
  const scenario = findScenario(role.role_code, band);
  const played = new Set(runs.map((r) => r.scenarioKey));

  const mainLeft = scenario && !played.has(scenario.key) ? 1 : 0;
  const sideLeft = eventsForRole(role).filter(
    (event) => !doneEventIds.includes(event.event_id),
  ).length;
  const left = mainLeft + sideLeft;

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
      style={themeVars(theme) as CSSProperties}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={t('here.at', { role: shortRoleName(role), band })}
        className={cx(
          'here-chip flex items-center gap-2 rounded-full border px-2.5 py-[5px] text-left transition-colors',
          open
            ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
            : 'border-line-2 bg-inset hover:border-[var(--accent)]',
          // Còn việc dở thì nhấp nháy để kéo mắt về.
          left > 0 && !open && 'here-chip-calling',
        )}
      >
        <Crest seed={role.role_code} size={20} />
        <span className="hidden min-w-0 max-w-[150px] truncate font-mono text-[11px] text-ink-2 min-[700px]:block">
          {shortRoleName(role)}
        </span>
        <span className="font-mono text-[10px] font-semibold text-[var(--accent)]">
          {band}
        </span>
        {left > 0 && (
          <span className="grid h-[17px] min-w-[17px] place-items-center rounded-full bg-[var(--accent)] px-1 font-mono text-[9.5px] font-bold text-bg">
            {left}
          </span>
        )}
      </button>

      {open && (
        <div className="toast-pop absolute right-0 top-[calc(100%+8px)] z-40 w-[264px] rounded-[11px] border border-line bg-surf p-3.5 shadow-lift">
          <p className="m-0 mb-2 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
            {t('here.label')}
          </p>

          <div className="mb-3 flex items-center gap-2.5">
            <Crest seed={role.role_code} size={34} active />
            <div className="min-w-0">
              <div className="truncate font-display text-[14px] font-semibold">
                {shortRoleName(role)}
              </div>
              <div className="font-mono text-[10px] text-muted">
                {band} · {bandLabel(band)}
              </div>
            </div>
          </div>

          <div className="mb-3 rounded-[8px] border border-line-2 bg-panel px-3 py-2 font-mono text-[10.5px] text-muted">
            {left > 0
              ? t(mainLeft > 0 ? 'here.leftWithMain' : 'here.left', { count: left })
              : t('here.allDone')}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => go(`/jobs/${role.role_code}/${band}/tasks`)}
              className="flex-1 rounded-[7px] border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-2 text-[12.5px] font-medium text-[var(--accent)] transition-colors hover:brightness-110"
            >
              {t('here.continue')}
            </button>
            <button
              type="button"
              onClick={() => go('/jobs')}
              className="rounded-[7px] border border-line bg-inset px-3 py-2 text-[12.5px] text-ink-2 transition-colors hover:border-[var(--accent)]"
            >
              {t('here.change')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
